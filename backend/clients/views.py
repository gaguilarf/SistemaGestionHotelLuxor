# clients/views.py
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Sum, Avg, Exists, OuterRef
from django.db import transaction
from django.utils import timezone
from datetime import datetime, date
from .models import Client, ClientRoom
from rooms.models import Room
from .serializers import (
    ClientSerializer,
    ClientCreateSerializer,
    ClientUpdateSerializer,
    ClientAddRoomsSerializer,
    ClientStatisticsSerializer,
    AvailableRoomsSerializer
)

class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['tipo_documento', 'tipo_pago']
    search_fields = ['nombres', 'apellidos', 'numero_documento', 'direccion']
    ordering_fields = ['nombres', 'apellidos', 'created_at', 'monto_pagado']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        """Retorna el serializer apropiado según la acción"""
        if self.action == 'create':
            return ClientCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return ClientUpdateSerializer
        elif self.action == 'agregar_habitaciones':
            return ClientAddRoomsSerializer
        return ClientSerializer
    
    def get_queryset(self):
        """Personalizar queryset con filtros adicionales"""
        queryset = super().get_queryset().prefetch_related(
            'habitaciones_asignadas__room'
        )
        
        # ✅ NUEVO FILTRO: Solo clientes activos por defecto
        solo_activos = self.request.query_params.get('solo_activos', 'false')
        if solo_activos.lower() == 'true':
            # Filtrar solo clientes que tienen habitaciones asignadas (están activos)
            queryset = queryset.filter(
                habitaciones_asignadas__isnull=False
            ).distinct()
        
        # ✅ NUEVO FILTRO: Por rango de fechas de ingreso
        fecha_ingreso_desde = self.request.query_params.get('fecha_ingreso_desde')
        fecha_ingreso_hasta = self.request.query_params.get('fecha_ingreso_hasta')
        
        if fecha_ingreso_desde:
            try:
                fecha_desde = datetime.strptime(fecha_ingreso_desde, '%Y-%m-%d').date()
                queryset = queryset.filter(fecha_ingreso__date__gte=fecha_desde)
            except (ValueError, TypeError):
                pass
                
        if fecha_ingreso_hasta:
            try:
                fecha_hasta = datetime.strptime(fecha_ingreso_hasta, '%Y-%m-%d').date()
                queryset = queryset.filter(fecha_ingreso__date__lte=fecha_hasta)
            except (ValueError, TypeError):
                pass
        
        # ✅ NUEVO FILTRO: Por rango de fechas de salida
        fecha_salida_desde = self.request.query_params.get('fecha_salida_desde')
        fecha_salida_hasta = self.request.query_params.get('fecha_salida_hasta')
        
        if fecha_salida_desde:
            try:
                fecha_desde = datetime.strptime(fecha_salida_desde, '%Y-%m-%d').date()
                queryset = queryset.filter(fecha_salida__date__gte=fecha_desde)
            except (ValueError, TypeError):
                pass
                
        if fecha_salida_hasta:
            try:
                fecha_hasta = datetime.strptime(fecha_salida_hasta, '%Y-%m-%d').date()
                queryset = queryset.filter(fecha_salida__date__lte=fecha_hasta)
            except (ValueError, TypeError):
                pass
        
        # ✅ NUEVO FILTRO: Por fecha específica (clientes que estuvieron el día X)
        fecha_especifica = self.request.query_params.get('fecha_especifica')
        if fecha_especifica:
            try:
                fecha = datetime.strptime(fecha_especifica, '%Y-%m-%d').date()
                # Clientes que ingresaron antes o el día X y salieron después del día X (o no han salido)
                queryset = queryset.filter(
                    Q(fecha_ingreso__date__lte=fecha) &
                    (Q(fecha_salida_real__date__gte=fecha) | Q(fecha_salida_real__isnull=True))
                )
            except (ValueError, TypeError):
                pass
        
        # Filtro por rango de edad
        edad_min = self.request.query_params.get('edad_min')
        edad_max = self.request.query_params.get('edad_max')
        
        if edad_min:
            try:
                queryset = queryset.filter(edad__gte=int(edad_min))
            except (ValueError, TypeError):
                pass
                
        if edad_max:
            try:
                queryset = queryset.filter(edad__lte=int(edad_max))
            except (ValueError, TypeError):
                pass
        
        # Filtro por rango de monto
        monto_min = self.request.query_params.get('monto_min')
        monto_max = self.request.query_params.get('monto_max')
        
        if monto_min:
            try:
                queryset = queryset.filter(monto_pagado__gte=float(monto_min))
            except (ValueError, TypeError):
                pass
                
        if monto_max:
            try:
                queryset = queryset.filter(monto_pagado__lte=float(monto_max))
            except (ValueError, TypeError):
                pass
        
        # Filtro por clientes con/sin habitaciones
        tiene_habitaciones = self.request.query_params.get('tiene_habitaciones')
        if tiene_habitaciones == 'true':
            queryset = queryset.filter(habitaciones_asignadas__isnull=False).distinct()
        elif tiene_habitaciones == 'false':
            queryset = queryset.filter(habitaciones_asignadas__isnull=True)
            
        return queryset
    
    def create(self, request, *args, **kwargs):
        """Crear nuevo cliente con asignación de habitaciones"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            client = serializer.save()
            # Retornar con el serializer completo
            response_serializer = ClientSerializer(client)
            headers = self.get_success_headers(serializer.data)
            return Response(
                {
                    'message': 'Cliente registrado exitosamente',
                    'client': response_serializer.data
                },
                status=status.HTTP_201_CREATED,
                headers=headers
            )
        except Exception as e:
            return Response(
                {'error': f'Error al registrar cliente: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def update(self, request, *args, **kwargs):
        """Actualizar cliente"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # Retornar con el serializer completo
        response_serializer = ClientSerializer(instance)
        return Response({
            'message': 'Cliente actualizado exitosamente',
            'client': response_serializer.data
        })
    
    def destroy(self, request, *args, **kwargs):
        """Eliminar cliente y marcar habitaciones como sucias"""
        instance = self.get_object()
        
        with transaction.atomic():
            # ✅ CAMBIO PRINCIPAL: Al eliminar un cliente, marcar habitaciones como "sucias"
            habitaciones_asignadas = instance.habitaciones_asignadas.all()
            habitaciones_liberadas = []
            
            for cr in habitaciones_asignadas:
                habitacion = cr.room
                # Marcar habitación como sucio para limpieza
                habitacion.estado = 'sucio'
                habitacion.save()
                
                habitaciones_liberadas.append({
                    'numero': habitacion.numero,
                    'tipo': habitacion.get_tipo_display(),
                    'estado_anterior': 'ocupado',
                    'estado_nuevo': 'sucio'
                })
                
                # Eliminar la asignación
                cr.delete()
            
            # Eliminar el cliente
            instance.delete()
        
        return Response({
            'message': f'Cliente eliminado exitosamente. Se liberaron {len(habitaciones_liberadas)} habitaciones (marcadas como sucias para limpieza)',
            'habitaciones_liberadas': habitaciones_liberadas,
            'nota': 'Las habitaciones liberadas están marcadas como "sucias" y requieren limpieza antes de estar disponibles'
        }, status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=False, methods=['get'])
    def habitaciones_disponibles(self, request):
        """Endpoint para obtener habitaciones disponibles para asignación"""
        habitaciones = Room.objects.filter(estado='disponible').order_by('numero')
        
        data = {
            'habitaciones': habitaciones,
            'total_disponibles': habitaciones.count()
        }
        
        serializer = AvailableRoomsSerializer(data)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def agregar_habitaciones(self, request, pk=None):
        """Endpoint para agregar habitaciones adicionales a un cliente"""
        client = self.get_object()
        
        serializer = self.get_serializer(
            data=request.data, 
            context={'client': client}
        )
        serializer.is_valid(raise_exception=True)
        
        try:
            result = serializer.save()
            
            # Retornar información actualizada del cliente
            response_serializer = ClientSerializer(client)
            
            return Response({
                'message': f'Se agregaron {len(result["habitaciones_agregadas"])} habitaciones exitosamente',
                'habitaciones_agregadas': result['habitaciones_agregadas'],
                'total_habitaciones': result['total_habitaciones'],
                'client': response_serializer.data
            })
        except Exception as e:
            return Response(
                {'error': f'Error al agregar habitaciones: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get'])
    def estadisticas(self, request):
        """Endpoint para obtener estadísticas de clientes"""
        queryset = self.get_queryset()
        
        # Estadísticas básicas
        total_clients = queryset.count()
        clients_con_habitaciones = queryset.filter(
            habitaciones_asignadas__isnull=False
        ).distinct().count()
        
        stats = {
            'total_clients': total_clients,
            'clients_con_habitaciones': clients_con_habitaciones,
            'clients_sin_habitaciones': total_clients - clients_con_habitaciones,
            'por_tipo_documento': {},
            'por_tipo_pago': {},
            'monto_total_recaudado': 0,
            'promedio_habitaciones_por_client': 0
        }
        
        # Estadísticas por tipo de documento
        for tipo_key, tipo_label in Client.TIPO_DOCUMENTO_CHOICES:
            count = queryset.filter(tipo_documento=tipo_key).count()
            stats['por_tipo_documento'][tipo_key] = {
                'label': tipo_label,
                'count': count,
                'porcentaje': round((count / total_clients * 100) if total_clients > 0 else 0, 2)
            }
        
        # Estadísticas por tipo de pago
        for tipo_key, tipo_label in Client.TIPO_PAGO_CHOICES:
            clients_tipo = queryset.filter(tipo_pago=tipo_key)
            count = clients_tipo.count()
            monto_total = clients_tipo.aggregate(
                total=Sum('monto_pagado')
            )['total'] or 0
            
            stats['por_tipo_pago'][tipo_key] = {
                'label': tipo_label,
                'count': count,
                'monto_total': float(monto_total),
                'porcentaje': round((count / total_clients * 100) if total_clients > 0 else 0, 2)
            }
        
        # Monto total recaudado
        monto_total = queryset.aggregate(total=Sum('monto_pagado'))['total']
        stats['monto_total_recaudado'] = float(monto_total) if monto_total else 0
        
        # Promedio de habitaciones por cliente
        if clients_con_habitaciones > 0:
            total_habitaciones = ClientRoom.objects.filter(
                client__in=queryset
            ).count()
            stats['promedio_habitaciones_por_client'] = round(
                total_habitaciones / clients_con_habitaciones, 2
            )
        
        # Clientes con más habitaciones
        clients_top = queryset.annotate(
            num_habitaciones=Count('habitaciones_asignadas')
        ).filter(num_habitaciones__gt=0).order_by('-num_habitaciones')[:5]
        
        stats['top_clients_habitaciones'] = [
            {
                'id': client.id,
                'nombre_completo': client.nombre_completo,
                'documento': client.numero_documento,
                'num_habitaciones': client.num_habitaciones,
                'monto_pagado': float(client.monto_pagado)
            }
            for client in clients_top
        ]
        
        return Response(stats)
    
    @action(detail=True, methods=['get'])
    def habitaciones(self, request, pk=None):
        """Endpoint para obtener las habitaciones de un cliente específico"""
        client = self.get_object()
        habitaciones_asignadas = client.habitaciones_asignadas.all()
        
        data = []
        for cr in habitaciones_asignadas:
            data.append({
                'id': cr.id,
                'habitacion': {
                    'id': cr.room.id,
                    'numero': cr.room.numero,
                    'tipo': cr.room.tipo,
                    'tipo_display': cr.room.get_tipo_display(),
                    'precio_noche': cr.room.precio_noche,
                    'estado': cr.room.estado
                },
                'fecha_asignacion': cr.fecha_asignacion
            })
        
        return Response({
            'client': {
                'id': client.id,
                'nombre_completo': client.nombre_completo,
                'numero_documento': client.numero_documento
            },
            'habitaciones_count': len(data),
            'habitaciones': data
        })
    
# clients/views.py - CORRECCIÓN CRÍTICA

    @action(detail=True, methods=['post'])
    def liberar_habitaciones(self, request, pk=None):
        """Endpoint para liberar todas las habitaciones de un cliente - VERSIÓN CORREGIDA"""
        client = self.get_object()
        
        with transaction.atomic():
            # Registrar la hora real de salida
            client.fecha_salida_real = timezone.now()
            client.save()
            
            # 🔍 DEBUGGING: Log estado antes de liberar
            habitaciones_activas = client.habitaciones_asignadas.filter(estado='activo')
            print(f"🏠 DEBUG - Cliente {client.id} tiene {habitaciones_activas.count()} habitaciones activas antes de liberar")
            
            if habitaciones_activas.count() == 0:
                return Response({
                    'message': 'Este cliente no tiene habitaciones activas para liberar',
                    'habitaciones_liberadas': [],
                    'fecha_salida_real': client.fecha_salida_real,
                    'warning': 'El cliente ya estaba marcado como retirado'
                }, status=status.HTTP_200_OK)
            
            habitaciones_liberadas = []
            
            for cr in habitaciones_activas:
                habitacion = cr.room
                
                print(f"🔓 DEBUG - Liberando habitación {habitacion.numero} (estado actual: {habitacion.estado})")
                
                # Cambiar estado de la habitación a 'sucio' para limpieza
                habitacion.estado = 'sucio'
                habitacion.save()
                
                # ✅ MANTENER HISTORIAL: Cambiar estado de la asignación a 'liberado'
                cr.estado = 'liberado'
                cr.fecha_liberacion = timezone.now()
                cr.save()
                
                print(f"✅ DEBUG - Habitación {habitacion.numero} liberada correctamente")
                
                habitaciones_liberadas.append({
                    'numero': habitacion.numero,
                    'tipo': habitacion.get_tipo_display(),
                    'estado_anterior': 'ocupado',
                    'estado_nuevo': 'sucio',
                    'fecha_liberacion': cr.fecha_liberacion.isoformat()
                })
            
            # 🔍 VERIFICACIÓN FINAL: Comprobar que no quedan habitaciones activas
            habitaciones_activas_final = client.habitaciones_asignadas.filter(estado='activo').count()
            print(f"✅ DEBUG - Cliente {client.id} tiene {habitaciones_activas_final} habitaciones activas después de liberar")
            
            # 🔍 DEBUGGING: Log estado completo del cliente
            print(f"📊 DEBUG - Estado final del cliente {client.id}:")
            print(f"   - Habitaciones activas: {habitaciones_activas_final}")
            print(f"   - Total en historial: {client.habitaciones_asignadas.count()}")
            print(f"   - Fecha salida real: {client.fecha_salida_real}")
        
        return Response({
            'message': f'Se liberaron {len(habitaciones_liberadas)} habitaciones exitosamente',
            'habitaciones_liberadas': habitaciones_liberadas,
            'fecha_salida_real': client.fecha_salida_real,
            'hora_salida_formateada': client.fecha_salida_real.strftime('%d/%m/%Y %H:%M:%S'),
            'habitaciones_activas_restantes': habitaciones_activas_final,
            'total_historial': client.habitaciones_asignadas.count(),
            'cliente_activo': habitaciones_activas_final > 0,
            'nota': 'Las habitaciones liberadas están marcadas como "sucias" y requieren limpieza antes de estar disponibles.'
        })
    
    @action(detail=False, methods=['get'])
    def buscar(self, request):
        """Endpoint personalizado de búsqueda"""
        query = request.query_params.get('q', '')
        if not query:
            return Response({'message': 'Parámetro de búsqueda requerido'}, status=400)
        
        # Búsqueda en múltiples campos
        queryset = self.get_queryset().filter(
            Q(nombres__icontains=query) |
            Q(apellidos__icontains=query) |
            Q(numero_documento__icontains=query) |
            Q(direccion__icontains=query) |
            Q(telefono__icontains=query)
        )
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'query': query,
            'count': queryset.count(),
            'results': serializer.data
        })
    
    @action(detail=False, methods=['post'])
    def check_documento_disponible(self, request):
        """Verificar si un documento está disponible - VALIDACIÓN INTELIGENTE CORREGIDA"""
        tipo_documento = request.data.get('tipo_documento')
        numero_documento = request.data.get('numero_documento')
        
        if not tipo_documento or not numero_documento:
            return Response(
                {'error': 'Tipo y número de documento requeridos'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 🔍 BUSCAR cliente existente con el mismo documento
        cliente_existente = Client.objects.filter(
            tipo_documento=tipo_documento,
            numero_documento=numero_documento
        ).first()
        
        if cliente_existente:
            # ✅ LÓGICA CORREGIDA: Verificar si tiene habitaciones ACTIVAS
            habitaciones_activas = cliente_existente.habitaciones_asignadas.filter(estado='activo')
            tiene_habitaciones_activas = habitaciones_activas.exists()
            
            print(f"🔍 DEBUG - Cliente {cliente_existente.id} ({cliente_existente.nombre_completo}):")
            print(f"   - Habitaciones activas: {habitaciones_activas.count()}")
            print(f"   - Fecha salida real: {cliente_existente.fecha_salida_real}")
            print(f"   - Puede re-registrarse: {not tiene_habitaciones_activas}")
            
            if tiene_habitaciones_activas:
                # ❌ Cliente existe y está ACTIVO - NO disponible
                return Response({
                    'tipo_documento': tipo_documento,
                    'numero_documento': numero_documento,
                    'disponible': False,
                    'razon': 'cliente_activo',
                    'message': f'Cliente activo con este documento: {cliente_existente.nombre_completo} (ID: {cliente_existente.id})',
                    'cliente_existente': {
                        'id': cliente_existente.id,
                        'nombre_completo': cliente_existente.nombre_completo,
                        'habitaciones_activas': habitaciones_activas.count(),
                        'fecha_ingreso': cliente_existente.fecha_ingreso,
                        'fecha_salida': cliente_existente.fecha_salida,
                        'fecha_salida_real': cliente_existente.fecha_salida_real
                    }
                })
            else:
                # ✅ Cliente existe pero NO está activo - SÍ disponible para nuevo registro
                return Response({
                    'tipo_documento': tipo_documento,
                    'numero_documento': numero_documento,
                    'disponible': True,
                    'razon': 'cliente_anterior_retirado',
                    'message': f'Cliente puede re-registrarse. Anterior estadía: {cliente_existente.nombre_completo}',
                    'cliente_anterior': {
                        'id': cliente_existente.id,
                        'nombre_completo': cliente_existente.nombre_completo,
                        'fecha_salida_real': cliente_existente.fecha_salida_real,
                        'ultimo_ingreso': cliente_existente.fecha_ingreso,
                        'total_estadias_anteriores': Client.objects.filter(
                            tipo_documento=tipo_documento,
                            numero_documento=numero_documento
                        ).count()
                    }
                })
        else:
            # ✅ No existe cliente con ese documento - SÍ disponible
            return Response({
                'tipo_documento': tipo_documento,
                'numero_documento': numero_documento,
                'disponible': True,
                'razon': 'nuevo_cliente',
                'message': 'Documento disponible para nuevo cliente'
            })
    
    # ✅ NUEVOS ENDPOINTS PARA FILTROS POR FECHA
    @action(detail=False, methods=['get'])
    def por_fecha(self, request):
        """Obtener clientes por fecha específica"""
        fecha = request.query_params.get('fecha')
        if not fecha:
            return Response(
                {'error': 'Parámetro fecha requerido (formato: YYYY-MM-DD)'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            fecha_obj = datetime.strptime(fecha, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {'error': 'Formato de fecha inválido. Use YYYY-MM-DD'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Clientes que estuvieron hospedados en esa fecha
        queryset = Client.objects.filter(
            Q(fecha_ingreso__date__lte=fecha_obj) &
            (Q(fecha_salida_real__date__gte=fecha_obj) | Q(fecha_salida_real__isnull=True))
        ).prefetch_related('habitaciones_asignadas__room')
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'fecha': fecha,
            'count': queryset.count(),
            'clientes': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def por_rango_fechas(self, request):
        """Obtener clientes por rango de fechas"""
        fecha_inicio = request.query_params.get('fecha_inicio')
        fecha_fin = request.query_params.get('fecha_fin')
        
        if not fecha_inicio or not fecha_fin:
            return Response(
                {'error': 'Parámetros fecha_inicio y fecha_fin requeridos (formato: YYYY-MM-DD)'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            fecha_inicio_obj = datetime.strptime(fecha_inicio, '%Y-%m-%d').date()
            fecha_fin_obj = datetime.strptime(fecha_fin, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {'error': 'Formato de fecha inválido. Use YYYY-MM-DD'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Clientes que estuvieron hospedados en ese rango
        queryset = Client.objects.filter(
            Q(fecha_ingreso__date__lte=fecha_fin_obj) &
            (Q(fecha_salida_real__date__gte=fecha_inicio_obj) | Q(fecha_salida_real__isnull=True))
        ).prefetch_related('habitaciones_asignadas__room')
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'fecha_inicio': fecha_inicio,
            'fecha_fin': fecha_fin,
            'count': queryset.count(),
            'clientes': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def activos(self, request):
        """Obtener solo clientes actualmente hospedados"""
        queryset = Client.objects.filter(
            habitaciones_asignadas__isnull=False
        ).distinct().prefetch_related('habitaciones_asignadas__room')
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'count': queryset.count(),
            'clientes_activos': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def historial(self, request):
        """Obtener historial completo de clientes (activos e inactivos)"""
        queryset = Client.objects.all().prefetch_related('habitaciones_asignadas__room')
        
        # Separar activos e inactivos
        activos = []
        inactivos = []
        
        for client in queryset:
            client_data = ClientSerializer(client).data
            if client.habitaciones_asignadas.exists():
                activos.append(client_data)
            else:
                inactivos.append(client_data)
        
        return Response({
            'total': queryset.count(),
            'activos': {
                'count': len(activos),
                'clientes': activos
            },
            'inactivos': {
                'count': len(inactivos),
                'clientes': inactivos
            }
        })
    def retrieve(self, request, *args, **kwargs):
        """Override retrieve para agregar headers anti-caché"""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        
        response = Response(serializer.data)
        response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        response['Pragma'] = 'no-cache'
        response['Expires'] = '0'
        
        return response