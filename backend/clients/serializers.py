# clients/serializers.py
from rest_framework import serializers
from django.db import transaction
from .models import Client, ClientRoom
from rooms.models import Room
from rooms.serializers import RoomSerializer

class ClientRoomSerializer(serializers.ModelSerializer):
    room = RoomSerializer(read_only=True)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    
    class Meta:
        model = ClientRoom
        fields = ['id', 'room', 'estado', 'estado_display', 'fecha_asignacion', 'fecha_liberacion']

# clients/serializers.py - CORRECCIÓN CRÍTICA

class ClientSerializer(serializers.ModelSerializer):
    tipo_documento_display = serializers.CharField(source='get_tipo_documento_display', read_only=True)
    tipo_pago_display = serializers.CharField(source='get_tipo_pago_display', read_only=True)
    nombre_completo = serializers.CharField(read_only=True)
    documento_completo = serializers.CharField(read_only=True)
    monto_formateado = serializers.CharField(read_only=True)
    habitaciones_asignadas = ClientRoomSerializer(many=True, read_only=True)
    
    # ✅ CORRECCIÓN CRÍTICA: Separar habitaciones activas de historial
    habitaciones_activas = serializers.SerializerMethodField()
    historial_habitaciones = serializers.SerializerMethodField()
    esta_activo = serializers.SerializerMethodField()
    
    class Meta:
        model = Client
        fields = [
            'id', 'nombres', 'apellidos', 'nombre_completo',
            'tipo_documento', 'tipo_documento_display', 'numero_documento', 'documento_completo',
            'edad', 'telefono', 'direccion',
            'fecha_ingreso', 'fecha_salida', 'fecha_salida_real',
            'numero_habitaciones_deseadas', 'tipo_pago', 'tipo_pago_display',
            'monto_pagado', 'monto_formateado',
            'habitaciones_asignadas', 'habitaciones_activas', 'historial_habitaciones',
            'esta_activo', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_habitaciones_activas(self, obj):
        """SOLO habitaciones con estado='activo' - FUNCIÓN CRÍTICA"""
        asignaciones_activas = obj.habitaciones_asignadas.filter(estado='activo')
        print(f"🔍 DEBUG - Cliente {obj.id}: {asignaciones_activas.count()} habitaciones activas")
        return ClientRoomSerializer(asignaciones_activas, many=True).data
    
    def get_historial_habitaciones(self, obj):
        """TODAS las habitaciones (activas + liberadas) ordenadas por fecha"""
        todas_asignaciones = obj.habitaciones_asignadas.all().order_by('-fecha_asignacion')
        print(f"📋 DEBUG - Cliente {obj.id}: {todas_asignaciones.count()} habitaciones en historial")
        return ClientRoomSerializer(todas_asignaciones, many=True).data
    
    def get_esta_activo(self, obj):
        """Determina si el cliente está activamente hospedado"""
        activo = obj.habitaciones_asignadas.filter(estado='activo').exists()
        print(f"🏠 DEBUG - Cliente {obj.id} está activo: {activo}")
        return activo
    
    def validate_numero_documento(self, value):
        """Validar formato del número de documento"""
        tipo_documento = self.initial_data.get('tipo_documento')
        
        if tipo_documento == 'DNI':
            if not value.isdigit() or len(value) != 8:
                raise serializers.ValidationError(
                    "El DNI debe tener exactamente 8 dígitos numéricos"
                )
        elif tipo_documento in ['pasaporte', 'carnet_extranjeria']:
            if len(value) > 30:
                raise serializers.ValidationError(
                    "El documento debe tener máximo 30 caracteres"
                )
            if not value.replace(' ', '').isalnum():
                raise serializers.ValidationError(
                    "El documento debe contener solo caracteres alfanuméricos"
                )
        
        return value
    
    def validate_telefono(self, value):
        """Validar formato del teléfono"""
        if value and not value.isdigit():
            raise serializers.ValidationError(
                "El teléfono debe contener solo números"
            )
        if value and (len(value) < 7 or len(value) > 15):
            raise serializers.ValidationError(
                "El teléfono debe tener entre 7 y 15 dígitos"
            )
        return value
    
    def validate_monto_pagado(self, value):
        """Validar monto pagado"""
        if value <= 0:
            raise serializers.ValidationError(
                "El monto debe ser mayor a 0"
            )
        return value
    
    def validate_fecha_salida(self, value):
        """Validar fecha de salida"""
        return value
    
    def validate(self, data):
        """Validaciones adicionales - VALIDACIÓN INTELIGENTE CORREGIDA"""
        tipo_documento = data.get('tipo_documento')
        numero_documento = data.get('numero_documento')
        
        if tipo_documento and numero_documento:
            # ✅ BUSCAR clientes existentes con el mismo documento
            queryset = Client.objects.filter(
                tipo_documento=tipo_documento,
                numero_documento=numero_documento
            )
            
            # Excluir el cliente actual si estamos editando
            if self.instance:
                queryset = queryset.exclude(pk=self.instance.pk)
            
            # Verificar si existe un cliente con el mismo documento
            cliente_existente = queryset.first()
            if cliente_existente:
                # ✅ LÓGICA CORREGIDA: Solo bloquear si el cliente existente tiene habitaciones ACTIVAS
                habitaciones_activas = cliente_existente.habitaciones_asignadas.filter(estado='activo')
                tiene_habitaciones_activas = habitaciones_activas.exists()
                
                print(f"🔍 VALIDATION - Cliente existente {cliente_existente.id}:")
                print(f"   - Habitaciones activas: {habitaciones_activas.count()}")
                print(f"   - Puede re-registrarse: {not tiene_habitaciones_activas}")
                
                if tiene_habitaciones_activas:
                    # ❌ Solo bloquear si tiene habitaciones activas
                    raise serializers.ValidationError({
                        'numero_documento': f'Ya existe un cliente activo con este documento. '
                                          f'Cliente: {cliente_existente.nombre_completo} '
                                          f'(ID: {cliente_existente.id}) tiene {habitaciones_activas.count()} '
                                          f'habitaciones activas. Debe liberar las habitaciones antes de registrar un nuevo ingreso.'
                    })
                else:
                    # ✅ PERMITIR REGISTRO: El cliente existe pero no tiene habitaciones activas
                    # Esto significa que se retiró anteriormente y puede registrarse nuevamente
                    print(f"✅ PERMITIENDO re-registro de cliente {cliente_existente.nombre_completo}")
                    pass
        
        # Validar fechas si ambas están presentes
        fecha_ingreso = data.get('fecha_ingreso')
        fecha_salida = data.get('fecha_salida')
        
        if fecha_ingreso and fecha_salida:
            if fecha_salida <= fecha_ingreso:
                raise serializers.ValidationError({
                    'fecha_salida': 'La fecha de salida debe ser posterior a la fecha de ingreso'
                })
        
        return data


class ClientCreateSerializer(serializers.ModelSerializer):
    """Serializer específico para creación de clientes con asignación de habitaciones"""
    
    habitaciones_seleccionadas = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        help_text="Lista de IDs de habitaciones seleccionadas"
    )
    
    class Meta:
        model = Client
        fields = [
            'nombres', 'apellidos', 'tipo_documento', 'numero_documento',
            'edad', 'telefono', 'direccion', 'fecha_ingreso', 'fecha_salida',
            'numero_habitaciones_deseadas', 'tipo_pago', 'monto_pagado',
            'habitaciones_seleccionadas'
        ]
    
    def validate_habitaciones_seleccionadas(self, value):
        """Validar habitaciones seleccionadas"""
        if not value:
            raise serializers.ValidationError(
                "Debe seleccionar al menos una habitación"
            )
        
        # Verificar que las habitaciones existan y estén disponibles
        habitaciones = Room.objects.filter(id__in=value, estado='disponible')
        if habitaciones.count() != len(value):
            raise serializers.ValidationError(
                "Una o más habitaciones no están disponibles"
            )
        
        return value
    
    def validate(self, data):
        """Validaciones adicionales para creación - VALIDACIÓN INTELIGENTE CORREGIDA"""
        # ✅ APLICAR LA MISMA LÓGICA DE VALIDACIÓN INTELIGENTE
        tipo_documento = data.get('tipo_documento')
        numero_documento = data.get('numero_documento')
        
        if tipo_documento and numero_documento:
            # Buscar cliente existente con el mismo documento
            cliente_existente = Client.objects.filter(
                tipo_documento=tipo_documento,
                numero_documento=numero_documento
            ).first()
            
            if cliente_existente:
                # ✅ LÓGICA CORREGIDA: Verificar si tiene habitaciones ACTIVAS
                habitaciones_activas = cliente_existente.habitaciones_asignadas.filter(estado='activo')
                tiene_habitaciones_activas = habitaciones_activas.exists()
                
                print(f"🔍 CREATE VALIDATION - Cliente existente {cliente_existente.id}:")
                print(f"   - Habitaciones activas: {habitaciones_activas.count()}")
                print(f"   - Puede re-registrarse: {not tiene_habitaciones_activas}")
                
                if tiene_habitaciones_activas:
                    # ❌ Solo bloquear si tiene habitaciones activas
                    raise serializers.ValidationError({
                        'numero_documento': f'Ya existe un cliente activo con este documento. '
                                          f'Cliente: {cliente_existente.nombre_completo} '
                                          f'(ID: {cliente_existente.id}) tiene {habitaciones_activas.count()} '
                                          f'habitaciones activas. Debe liberar las habitaciones antes de registrar un nuevo ingreso.'
                    })
                else:
                    # ✅ PERMITIR REGISTRO: Cliente anterior ya se retiró
                    print(f"✅ PERMITIENDO re-registro de cliente {cliente_existente.nombre_completo}")
        
        # Validar que el número de habitaciones coincida
        numero_deseadas = data.get('numero_habitaciones_deseadas')
        habitaciones_seleccionadas = data.get('habitaciones_seleccionadas', [])
        
        if len(habitaciones_seleccionadas) != numero_deseadas:
            raise serializers.ValidationError({
                'habitaciones_seleccionadas': 
                f"Debe seleccionar exactamente {numero_deseadas} habitaciones"
            })
        
        return data
    
    @transaction.atomic
    def create(self, validated_data):
        """Crear cliente y asignar habitaciones - PERMITE RE-REGISTRO"""
        habitaciones_ids = validated_data.pop('habitaciones_seleccionadas')
        
        # ✅ CREAR NUEVO CLIENTE (permitir duplicados si el anterior no está activo)
        client = Client.objects.create(**validated_data)
        
        print(f"✅ NUEVO CLIENTE CREADO: {client.nombre_completo} (ID: {client.id})")
        
        # ✅ ASIGNAR HABITACIONES: Crear con estado 'activo'
        for habitacion_id in habitaciones_ids:
            habitacion = Room.objects.get(id=habitacion_id)
            # Cambiar estado de la habitación a 'ocupado'
            habitacion.estado = 'ocupado'
            habitacion.save()
            
            # Crear la relación cliente-habitación con estado 'activo'
            ClientRoom.objects.create(
                client=client,
                room=habitacion,
                estado='activo'  # ✅ Establecer como activo
            )
            
            print(f"✅ HABITACIÓN {habitacion.numero} asignada al cliente {client.id}")
        
        return client


class ClientUpdateSerializer(serializers.ModelSerializer):
    """Serializer específico para actualización de clientes"""
    
    class Meta:
        model = Client
        fields = [
            'nombres', 'apellidos', 'tipo_documento', 'numero_documento',
            'edad', 'telefono', 'direccion', 'fecha_ingreso', 'fecha_salida',
            'numero_habitaciones_deseadas', 'tipo_pago', 'monto_pagado'
        ]
    
    def validate(self, data):
        """Validaciones para actualización - VALIDACIÓN INTELIGENTE"""
        # ✅ APLICAR LA MISMA LÓGICA PARA ACTUALIZACIONES
        tipo_documento = data.get('tipo_documento')
        numero_documento = data.get('numero_documento')
        
        if tipo_documento and numero_documento:
            queryset = Client.objects.filter(
                tipo_documento=tipo_documento,
                numero_documento=numero_documento
            )
            
            if self.instance:
                queryset = queryset.exclude(pk=self.instance.pk)
            
            cliente_existente = queryset.first()
            if cliente_existente:
                tiene_habitaciones_activas = cliente_existente.habitaciones_asignadas.filter(estado='activo').exists()
                
                if tiene_habitaciones_activas:
                    raise serializers.ValidationError({
                        'numero_documento': f'Ya existe un cliente activo con este documento. '
                                          f'Cliente: {cliente_existente.nombre_completo} '
                                          f'(ID: {cliente_existente.id}) tiene {cliente_existente.habitaciones_asignadas.filter(estado="activo").count()} '
                                          f'habitaciones asignadas.'
                    })
        
        return super().validate(data)


class ClientAddRoomsSerializer(serializers.Serializer):
    """Serializer para agregar habitaciones a un cliente existente"""
    
    habitaciones_adicionales = serializers.ListField(
        child=serializers.IntegerField(),
        help_text="Lista de IDs de habitaciones adicionales a asignar"
    )
    
    def validate_habitaciones_adicionales(self, value):
        """Validar habitaciones adicionales"""
        if not value:
            raise serializers.ValidationError(
                "Debe seleccionar al menos una habitación adicional"
            )
        
        # Verificar que las habitaciones existan y estén disponibles
        habitaciones = Room.objects.filter(id__in=value, estado='disponible')
        if habitaciones.count() != len(value):
            habitaciones_no_disponibles = set(value) - set(habitaciones.values_list('id', flat=True))
            raise serializers.ValidationError(
                f"Las habitaciones {list(habitaciones_no_disponibles)} no están disponibles"
            )
        
        return value
    
    def validate(self, data):
        """Validaciones adicionales"""
        client = self.context.get('client')
        if not client:
            raise serializers.ValidationError("Cliente no encontrado")
        
        habitaciones_adicionales = data.get('habitaciones_adicionales', [])
        
        # Verificar que las habitaciones no estén ya asignadas al cliente EN ESTADO ACTIVO
        habitaciones_ya_asignadas = client.habitaciones_asignadas.filter(
            room__id__in=habitaciones_adicionales,
            estado='activo'  # ✅ Solo verificar las activas
        ).values_list('room__id', flat=True)
        
        if habitaciones_ya_asignadas:
            raise serializers.ValidationError({
                'habitaciones_adicionales': 
                f"Las habitaciones {list(habitaciones_ya_asignadas)} ya están asignadas a este cliente"
            })
        
        # Validar límite máximo de habitaciones (opcional)
        total_habitaciones_actuales = client.habitaciones_asignadas.filter(estado='activo').count()
        nuevas_habitaciones = len(habitaciones_adicionales)
        total_final = total_habitaciones_actuales + nuevas_habitaciones
        
        if total_final > 10:  # Límite máximo de 10 habitaciones
            raise serializers.ValidationError({
                'habitaciones_adicionales': 
                f"No se pueden asignar más habitaciones. Límite máximo: 10. Actuales: {total_habitaciones_actuales}"
            })
        
        return data
    
    @transaction.atomic
    def save(self):
        """Agregar habitaciones al cliente"""
        client = self.context.get('client')
        habitaciones_ids = self.validated_data['habitaciones_adicionales']
        
        habitaciones_agregadas = []
        
        # ✅ MARCAR HABITACIONES COMO 'ocupado' Y CREAR ASIGNACIONES ACTIVAS
        for habitacion_id in habitaciones_ids:
            habitacion = Room.objects.get(id=habitacion_id)
            # Cambiar estado de la habitación a 'ocupado'
            habitacion.estado = 'ocupado'
            habitacion.save()
            
            # Crear la relación cliente-habitación con estado 'activo'
            ClientRoom.objects.create(
                client=client,
                room=habitacion,
                estado='activo'  # ✅ Establecer como activo
            )
            
            habitaciones_agregadas.append({
                'id': habitacion.id,
                'numero': habitacion.numero,
                'tipo': habitacion.get_tipo_display(),
                'precio_noche': habitacion.precio_noche
            })
        
        # Actualizar el número de habitaciones deseadas automáticamente
        client.numero_habitaciones_deseadas = client.habitaciones_asignadas.filter(estado='activo').count()
        client.save()
        
        return {
            'habitaciones_agregadas': habitaciones_agregadas,
            'total_habitaciones': client.habitaciones_asignadas.filter(estado='activo').count(),
            'numero_habitaciones_deseadas': client.numero_habitaciones_deseadas
        }


class ClientStatisticsSerializer(serializers.Serializer):
    """Serializer para estadísticas de clientes"""
    
    total_clients = serializers.IntegerField()
    clients_con_habitaciones = serializers.IntegerField()
    clients_sin_habitaciones = serializers.IntegerField()
    por_tipo_documento = serializers.DictField()
    por_tipo_pago = serializers.DictField()
    monto_total_recaudado = serializers.DecimalField(max_digits=12, decimal_places=2)
    promedio_habitaciones_por_client = serializers.DecimalField(max_digits=5, decimal_places=2)


class AvailableRoomsSerializer(serializers.Serializer):
    """Serializer para mostrar habitaciones disponibles para selección"""
    
    habitaciones = RoomSerializer(many=True, read_only=True)
    total_disponibles = serializers.IntegerField(read_only=True)