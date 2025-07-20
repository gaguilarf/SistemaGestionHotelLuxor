# rooms/views.py
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Avg
from .models import Room
from .serializers import (
    RoomSerializer, 
    RoomCreateSerializer, 
    RoomUpdateSerializer,
    RoomEstadisticasSerializer
)

class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['tipo', 'estado']
    search_fields = ['numero', 'descripcion']
    ordering_fields = ['numero', 'precio_noche', 'created_at']
    ordering = ['numero']
    
    def get_serializer_class(self):
        """Retorna el serializer apropiado según la acción"""
        if self.action == 'create':
            return RoomCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return RoomUpdateSerializer
        return RoomSerializer
    
    def get_queryset(self):
        """Personalizar queryset con filtros adicionales"""
        queryset = super().get_queryset()
        
        # Filtro por rango de precios
        precio_min = self.request.query_params.get('precio_min')
        precio_max = self.request.query_params.get('precio_max')
        
        if precio_min:
            try:
                queryset = queryset.filter(precio_noche__gte=float(precio_min))
            except ValueError:
                pass
                
        if precio_max:
            try:
                queryset = queryset.filter(precio_noche__lte=float(precio_max))
            except ValueError:
                pass
            
        return queryset
    
    def create(self, request, *args, **kwargs):
        """Crear nueva habitación"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Retornar con el serializer completo
        room = Room.objects.get(pk=serializer.instance.pk)
        response_serializer = RoomSerializer(room)
        headers = self.get_success_headers(serializer.data)
        return Response(
            response_serializer.data, 
            status=status.HTTP_201_CREATED, 
            headers=headers
        )
    
    def update(self, request, *args, **kwargs):
        """Actualizar habitación"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # Retornar con el serializer completo
        room = Room.objects.get(pk=instance.pk)
        response_serializer = RoomSerializer(room)
        return Response(response_serializer.data)
    
    @action(detail=False, methods=['get'])
    def disponibles(self, request):
        """Endpoint para obtener solo habitaciones disponibles"""
        habitaciones = self.get_queryset().filter(estado='disponible')
        serializer = self.get_serializer(habitaciones, many=True)
        return Response({
            'count': habitaciones.count(),
            'results': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def por_tipo(self, request):
        """Endpoint para obtener habitaciones agrupadas por tipo"""
        tipos_data = {}
        for tipo_key, tipo_label in Room.TIPO_CHOICES:
            habitaciones = self.get_queryset().filter(tipo=tipo_key)
            serializer = self.get_serializer(habitaciones, many=True)
            tipos_data[tipo_key] = {
                'label': tipo_label,
                'count': habitaciones.count(),
                'habitaciones': serializer.data
            }
        return Response(tipos_data)
    
    @action(detail=False, methods=['get'])
    def estadisticas(self, request):
        """Endpoint para obtener estadísticas de habitaciones"""
        queryset = self.get_queryset()
        
        # Estadísticas básicas
        stats = {
            'total': queryset.count(),
            'disponibles': queryset.filter(estado='disponible').count(),
            'ocupadas': queryset.filter(estado='ocupado').count(),  # Nuevo estado
            'sucias': queryset.filter(estado='sucio').count(),
            'mantenimiento': queryset.filter(estado='mantenimiento').count(),
            'por_tipo': {},
            'precio_promedio': 0
        }
        
        # Estadísticas por tipo
        for tipo_key, tipo_label in Room.TIPO_CHOICES:
            count = queryset.filter(tipo=tipo_key).count()
            precio_promedio_tipo = queryset.filter(tipo=tipo_key).aggregate(
                promedio=Avg('precio_noche')
            )['promedio'] or 0
            
            stats['por_tipo'][tipo_key] = {
                'label': tipo_label,
                'count': count,
                'precio_promedio': float(precio_promedio_tipo)
            }
        
        # Precio promedio general
        precio_promedio = queryset.aggregate(promedio=Avg('precio_noche'))['promedio']
        stats['precio_promedio'] = float(precio_promedio) if precio_promedio else 0
        
        # Habitaciones más caras y más baratas
        if stats['total'] > 0:
            mas_cara = queryset.order_by('-precio_noche').first()
            mas_barata = queryset.order_by('precio_noche').first()
            
            stats['habitacion_mas_cara'] = {
                'numero': mas_cara.numero,
                'precio': float(mas_cara.precio_noche),
                'tipo': mas_cara.get_tipo_display()
            } if mas_cara else None
            
            stats['habitacion_mas_barata'] = {
                'numero': mas_barata.numero,
                'precio': float(mas_barata.precio_noche),
                'tipo': mas_barata.get_tipo_display()
            } if mas_barata else None
        
        return Response(stats)
    
    @action(detail=True, methods=['patch'])
    def cambiar_estado(self, request, pk=None):
        """Endpoint para cambiar solo el estado de una habitación"""
        habitacion = self.get_object()
        nuevo_estado = request.data.get('estado')
        
        if nuevo_estado not in dict(Room.ESTADO_CHOICES):
            return Response(
                {'error': 'Estado inválido. Estados válidos: disponible, ocupado, sucio, mantenimiento'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        estado_anterior = habitacion.estado
        habitacion.estado = nuevo_estado
        habitacion.save()
        
        serializer = self.get_serializer(habitacion)
        return Response({
            'message': f'Estado cambiado de {estado_anterior} a {nuevo_estado}',
            'habitacion': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def buscar(self, request):
        """Endpoint personalizado de búsqueda"""
        query = request.query_params.get('q', '')
        if not query:
            return Response({'message': 'Parámetro de búsqueda requerido'}, status=400)
        
        # Búsqueda en múltiples campos
        queryset = self.get_queryset().filter(
            Q(numero__icontains=query) |
            Q(descripcion__icontains=query) |
            Q(tipo__icontains=query) |
            Q(estado__icontains=query)
        )
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'query': query,
            'count': queryset.count(),
            'results': serializer.data
        })
    
    @action(detail=False, methods=['post'])
    def check_numero_disponible(self, request):
        """Verificar si un número de habitación está disponible"""
        numero = request.data.get('numero')
        
        if not numero:
            return Response(
                {'error': 'Número de habitación requerido'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            numero = int(numero)
        except ValueError:
            return Response(
                {'error': 'El número debe ser un entero válido'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        existe = Room.objects.filter(numero=numero).exists()
        return Response({
            'numero': numero,
            'disponible': not existe,
            'message': 'Número disponible' if not existe else 'Número ya en uso'
        })