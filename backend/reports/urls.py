# reports/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ReportsViewSet,
    ReportCacheViewSet, 
    ReportScheduleViewSet,
    ReportAuditViewSet,
    ExportViewSet,
    AnalyticsViewSet
)

# Configurar el router para las rutas del ViewSet
router = DefaultRouter()

# Registrar ViewSets en el router
router.register(r'reports', ReportsViewSet, basename='reports')
router.register(r'cache', ReportCacheViewSet, basename='report-cache')
router.register(r'schedules', ReportScheduleViewSet, basename='report-schedule')
router.register(r'audit', ReportAuditViewSet, basename='report-audit')
router.register(r'export', ExportViewSet, basename='report-export')
router.register(r'analytics', AnalyticsViewSet, basename='analytics')

# Definir las URLs
urlpatterns = [
    # Incluir todas las rutas del router
    path('', include(router.urls)),
]

# Las rutas generadas automáticamente por el router serán:

# === REPORTES PRINCIPALES ===
# GET    /api/reports/                              - Listar tipos de reportes disponibles
# GET    /api/reports/cliente_mas_frecuente/        - Reporte de cliente más frecuente
# GET    /api/reports/habitacion_mas_vendida/       - Reporte de habitación más vendida  
# GET    /api/reports/mejor_temporada/              - Reporte de mejor temporada de ventas
# GET    /api/reports/dashboard/                    - Dashboard principal con múltiples métricas
# GET    /api/reports/estadisticas_generales/       - Estadísticas generales del sistema

# === GESTIÓN DE CACHE ===
# GET    /api/cache/                                - Listar caches de reportes
# POST   /api/cache/                                - Crear nuevo cache (uso interno)
# GET    /api/cache/{id}/                           - Obtener cache específico
# PUT    /api/cache/{id}/                           - Actualizar cache
# DELETE /api/cache/{id}/                           - Eliminar cache
# POST   /api/cache/{id}/invalidate/                - Invalidar cache específico
# POST   /api/cache/clear_expired/                  - Limpiar todos los caches expirados

# === REPORTES PROGRAMADOS ===
# GET    /api/schedules/                            - Listar reportes programados
# POST   /api/schedules/                            - Crear nuevo reporte programado
# GET    /api/schedules/{id}/                       - Obtener reporte programado específico
# PUT    /api/schedules/{id}/                       - Actualizar reporte programado
# DELETE /api/schedules/{id}/                       - Eliminar reporte programado
# POST   /api/schedules/{id}/execute_now/           - Ejecutar reporte inmediatamente
# PATCH  /api/schedules/{id}/toggle_status/         - Activar/pausar reporte programado

# === AUDITORÍA ===
# GET    /api/audit/                                - Listar auditorías de reportes
# GET    /api/audit/{id}/                           - Obtener auditoría específica
# GET    /api/audit/my_activity/                    - Actividad del usuario actual
# GET    /api/audit/stats/                          - Estadísticas de uso de reportes

# === EXPORTACIÓN ===
# POST   /api/export/export_report/                 - Exportar reporte en diferentes formatos
# GET    /api/export/download_formats/              - Obtener formatos de descarga disponibles

# === ANÁLISIS AVANZADOS ===
# GET    /api/analytics/predicciones_ocupacion/     - Predicciones de ocupación
# GET    /api/analytics/analisis_rentabilidad/      - Análisis de rentabilidad

# === PARÁMETROS COMUNES ===
# Todos los endpoints de reportes aceptan estos parámetros opcionales:
# - fecha_inicio: Fecha de inicio del filtro (formato: YYYY-MM-DD)
# - fecha_fin: Fecha de fin del filtro (formato: YYYY-MM-DD)  
# - limit: Límite de resultados (por defecto: 10, máximo: 100)

# === EJEMPLOS DE USO ===

# 1. Obtener cliente más frecuente del último mes:
# GET /api/reports/cliente_mas_frecuente/?fecha_inicio=2024-01-01&fecha_fin=2024-01-31&limit=5

# 2. Obtener habitación más vendida con límite de 3 resultados:
# GET /api/reports/habitacion_mas_vendida/?limit=3

# 3. Obtener mejor temporada agrupada por mes:
# GET /api/reports/mejor_temporada/?agrupacion=mes&fecha_inicio=2024-01-01

# 4. Dashboard completo con datos del último trimestre:
# GET /api/reports/dashboard/?fecha_inicio=2024-01-01&fecha_fin=2024-03-31

# 5. Exportar reporte a PDF:
# POST /api/export/export_report/
# Body: {
#   "format": "pdf",
#   "report_type": "client_frequency",
#   "report_data": {...},
#   "include_charts": true
# }

# 6. Crear reporte programado mensual:
# POST /api/schedules/
# Body: {
#   "name": "Reporte Mensual de Clientes",
#   "report_type": "client_frequency", 
#   "frequency": "monthly",
#   "next_generation": "2024-02-01T00:00:00Z",
#   "email_recipients": "admin@hotel.com"
# }

# 7. Obtener predicciones de ocupación:
# GET /api/analytics/predicciones_ocupacion/

# 8. Análisis de rentabilidad por habitación:
# GET /api/analytics/analisis_rentabilidad/?fecha_inicio=2024-01-01&fecha_fin=2024-01-31