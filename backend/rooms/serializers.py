# rooms/serializers.py
from rest_framework import serializers
from .models import Room

class RoomSerializer(serializers.ModelSerializer):
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    precio_formateado = serializers.CharField(read_only=True)
    esta_disponible = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Room
        fields = [
            'id', 'numero', 'tipo', 'tipo_display', 
            'precio_noche', 'precio_formateado', 'estado',
            'estado_display', 'descripcion', 'esta_disponible',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_numero(self, value):
        """Validar número de habitación"""
        if value <= 0:
            raise serializers.ValidationError("El número debe ser mayor a 0")
        if value > 9999:
            raise serializers.ValidationError("El número no puede tener más de 4 dígitos")
        return value
    
    def validate_precio_noche(self, value):
        """Validar precio por noche"""
        if value <= 0:
            raise serializers.ValidationError("El precio debe ser mayor a 0")
        return value
    
    def validate(self, data):
        """Validaciones adicionales"""
        # Verificar que el número no esté duplicado (excepto en updates)
        numero = data.get('numero')
        if numero:
            queryset = Room.objects.filter(numero=numero)
            if self.instance:
                queryset = queryset.exclude(pk=self.instance.pk)
            if queryset.exists():
                raise serializers.ValidationError({
                    'numero': 'Ya existe una habitación con este número'
                })
        return data

class RoomCreateSerializer(RoomSerializer):
    """Serializer específico para creación de habitaciones"""
    
    class Meta(RoomSerializer.Meta):
        fields = [
            'numero', 'tipo', 'precio_noche', 
            'estado', 'descripcion'
        ]

class RoomUpdateSerializer(RoomSerializer):
    """Serializer específico para actualización de habitaciones"""
    
    numero = serializers.IntegerField(required=False)
    tipo = serializers.CharField(required=False)
    precio_noche = serializers.DecimalField(max_digits=8, decimal_places=2, required=False)
    estado = serializers.CharField(required=False)
    
    class Meta(RoomSerializer.Meta):
        fields = [
            'numero', 'tipo', 'precio_noche', 
            'estado', 'descripcion'
        ]

class RoomEstadisticasSerializer(serializers.Serializer):
    """Serializer para estadísticas de habitaciones"""
    
    total = serializers.IntegerField()
    disponibles = serializers.IntegerField()
    ocupadas = serializers.IntegerField()  # Nuevo campo para habitaciones ocupadas
    sucias = serializers.IntegerField()
    mantenimiento = serializers.IntegerField()
    por_tipo = serializers.DictField()
    precio_promedio = serializers.DecimalField(max_digits=10, decimal_places=2)