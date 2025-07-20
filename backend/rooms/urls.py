# rooms/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RoomViewSet

# Configurar el router para las rutas del ViewSet
router = DefaultRouter()
router.register(r'rooms', RoomViewSet)

# Definir las URLs
urlpatterns = [
    # Incluir todas las rutas del router
    path('', include(router.urls)),
]

# Las rutas generadas automáticamente por el router serán:
# GET    /api/rooms/                     - Listar todas las habitaciones
# POST   /api/rooms/                     - Crear nueva habitación
# GET    /api/rooms/{id}/                - Obtener una habitación específica
# PUT    /api/rooms/{id}/                - Actualizar habitación completa
# PATCH  /api/rooms/{id}/                - Actualizar habitación parcial
# DELETE /api/rooms/{id}/                - Eliminar habitación

# Rutas de acciones personalizadas (@action):
# GET    /api/rooms/disponibles/         - Habitaciones disponibles
# GET    /api/rooms/por_tipo/            - Habitaciones agrupadas por tipo
# GET    /api/rooms/estadisticas/        - Estadísticas de habitaciones
# GET    /api/rooms/buscar/?q=query      - Búsqueda personalizada
# POST   /api/rooms/check_numero_disponible/ - Verificar número disponible
# PATCH  /api/rooms/{id}/cambiar_estado/ - Cambiar estado de habitación