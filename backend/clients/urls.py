# clients/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClientViewSet

# Configurar el router para las rutas del ViewSet
router = DefaultRouter()
router.register(r'clients', ClientViewSet)

# Definir las URLs
urlpatterns = [
    # Incluir todas las rutas del router
    path('', include(router.urls)),
]

# Las rutas generadas automáticamente por el router serán:
# GET    /api/clients/                           - Listar todos los clientes
# POST   /api/clients/                           - Crear nuevo cliente con habitaciones
# GET    /api/clients/{id}/                      - Obtener un cliente específico
# PUT    /api/clients/{id}/                      - Actualizar cliente completo
# PATCH  /api/clients/{id}/                      - Actualizar cliente parcial
# DELETE /api/clients/{id}/                      - Eliminar cliente

# Rutas de acciones personalizadas (@action):
# GET    /api/clients/habitaciones_disponibles/  - Habitaciones disponibles para asignación
# GET    /api/clients/estadisticas/              - Estadísticas de clientes
# GET    /api/clients/buscar/?q=query            - Búsqueda personalizada
# POST   /api/clients/check_documento_disponible/ - Verificar documento disponible
# GET    /api/clients/{id}/habitaciones/         - Habitaciones de un cliente específico
# POST   /api/clients/{id}/liberar_habitaciones/ - Liberar habitaciones de un cliente