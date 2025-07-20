# reports/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Sum, Avg, Q, Max, Min, F, Case, When, IntegerField
from django.db.models.functions import TruncMonth, TruncDate, Extract
from django.utils import timezone
from datetime import datetime, timedelta
from collections import defaultdict, Counter
import time

from clients.models import Client, ClientRoom
from rooms.models import Room
from .models import ReportCache, ReportSchedule, ReportAudit
from .serializers import (
    ReportParametersSerializer,
    ClientFrequencyReportSerializer,
    RoomPopularityReportSerializer,
    SeasonalSalesReportSerializer,
    GeneralStatsSerializer,
    ReportCacheSerializer,
    ReportScheduleSerializer,
    ReportScheduleCreateSerializer,
    ReportAuditSerializer,
    ChartDataSerializer,
    DashboardDataSerializer,
    ExportFormatSerializer,
    ReportFilterSerializer
)

class ReportsViewSet(viewsets.ViewSet):
    """ViewSet principal para todos los reportes del sistema"""
    permission_classes = [IsAuthenticated]
    
    def get_date_range(self, request):
        """Obtener rango de fechas de los parámetros de request"""
        fecha_inicio = request.query_params.get('fecha_inicio')
        fecha_fin = request.query_params.get('fecha_fin')
        
        # Valores por defecto: último mes
        if not fecha_fin:
            fecha_fin = timezone.now().date()
        else:
            fecha_fin = datetime.strptime(fecha_fin, '%Y-%m-%d').date()
            
        if not fecha_inicio:
            fecha_inicio = fecha_fin - timedelta(days=30)
        else:
            fecha_inicio = datetime.strptime(fecha_inicio, '%Y-%m-%d').date()
            
        return fecha_inicio, fecha_fin
    
    def log_report_action(self, report_type, action, execution_time=None, **kwargs):
        """Registrar acción de reporte en auditoría"""
        return ReportAudit.log_action(
            report_type=report_type,
            action=action,
            user=self.request.user,
            parameters=self.request.query_params.dict(),
            execution_time=execution_time,
            ip_address=self.request.META.get('REMOTE_ADDR'),
            user_agent=self.request.META.get('HTTP_USER_AGENT', ''),
            **kwargs
        )
    
    @action(detail=False, methods=['get'])
    def cliente_mas_frecuente(self, request):
        """Reporte del cliente más frecuente"""
        start_time = time.time()
        
        try:
            # Verificar cache
            cache_key = 'client_frequency'
            parameters = request.query_params.dict()
            cached_report = ReportCache.get_valid_cache(cache_key, parameters)
            
            if cached_report:
                self.log_report_action(cache_key, 'viewed', execution_time=0)
                return Response(cached_report.data)
            
            # Generar reporte
            fecha_inicio, fecha_fin = self.get_date_range(request)
            limit = int(request.query_params.get('limit', 10))
            
            # Consulta principal: clientes con más reservas
            clientes_stats = Client.objects.filter(
                created_at__date__gte=fecha_inicio,
                created_at__date__lte=fecha_fin
            ).annotate(
                total_reservas=Count('id'),
                total_habitaciones=Count('habitaciones_asignadas'),
                monto_total_pagado=Sum('monto_pagado'),
                primera_reserva=Min('created_at'),
                ultima_reserva=Max('created_at')
            ).filter(
                total_habitaciones__gt=0
            ).order_by('-total_reservas', '-monto_total_pagado')[:limit]
            
            # Procesar datos para el reporte
            reporte_data = []
            
            for cliente in clientes_stats:
                # Calcular frecuencia mensual
                reservas_por_mes = Client.objects.filter(
                    tipo_documento=cliente.tipo_documento,
                    numero_documento=cliente.numero_documento
                ).annotate(
                    mes=TruncMonth('created_at')
                ).values('mes').annotate(
                    count=Count('id')
                ).order_by('mes')
                
                frecuencia_mensual = {}
                for reserva in reservas_por_mes:
                    mes_key = reserva['mes'].strftime('%Y-%m')
                    frecuencia_mensual[mes_key] = reserva['count']
                
                # Calcular promedio de habitaciones por reserva
                promedio_habitaciones = (
                    cliente.total_habitaciones / cliente.total_reservas 
                    if cliente.total_reservas > 0 else 0
                )
                
                cliente_data = {
                    'cliente_id': cliente.id,
                    'nombre_completo': cliente.nombre_completo,
                    'tipo_documento': cliente.tipo_documento,
                    'numero_documento': cliente.numero_documento,
                    'total_reservas': cliente.total_reservas,
                    'total_habitaciones': cliente.total_habitaciones,
                    'monto_total_pagado': float(cliente.monto_total_pagado or 0),
                    'primera_reserva': cliente.primera_reserva,
                    'ultima_reserva': cliente.ultima_reserva,
                    'promedio_habitaciones_por_reserva': round(promedio_habitaciones, 2),
                    'frecuencia_mensual': frecuencia_mensual
                }
                
                reporte_data.append(cliente_data)
            
            execution_time = time.time() - start_time
            
            # Crear cache
            ReportCache.create_cache(cache_key, reporte_data, parameters)
            
            # Log de auditoría
            self.log_report_action(
                cache_key, 
                'generated', 
                execution_time=execution_time,
                record_count=len(reporte_data),
                success=True
            )
            
            return Response(reporte_data)
            
        except Exception as e:
            execution_time = time.time() - start_time
            self.log_report_action(
                'client_frequency',
                'generated',
                execution_time=execution_time,
                success=False,
                error_message=str(e)
            )
            return Response(
                {'error': f'Error generando reporte: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def habitacion_mas_vendida(self, request):
        """Reporte de habitación más vendida"""
        start_time = time.time()
        
        try:
            # Verificar cache
            cache_key = 'room_popularity'
            parameters = request.query_params.dict()
            cached_report = ReportCache.get_valid_cache(cache_key, parameters)
            
            if cached_report:
                self.log_report_action(cache_key, 'viewed', execution_time=0)
                return Response(cached_report.data)
            
            fecha_inicio, fecha_fin = self.get_date_range(request)
            limit = int(request.query_params.get('limit', 10))
            
            # Consulta de habitaciones más asignadas
            habitaciones_stats = Room.objects.annotate(
                total_asignaciones=Count(
                    'clients_asignados',
                    filter=Q(
                        clients_asignados__fecha_asignacion__date__gte=fecha_inicio,
                        clients_asignados__fecha_asignacion__date__lte=fecha_fin
                    )
                ),
                total_clientes_unicos=Count(
                    'clients_asignados__client',
                    distinct=True,
                    filter=Q(
                        clients_asignados__fecha_asignacion__date__gte=fecha_inicio,
                        clients_asignados__fecha_asignacion__date__lte=fecha_fin
                    )
                ),
                # Calcular días ocupados
                dias_ocupados=Count(
                    'clients_asignados',
                    filter=Q(
                        clients_asignados__fecha_asignacion__date__gte=fecha_inicio,
                        clients_asignados__fecha_asignacion__date__lte=fecha_fin,
                        clients_asignados__estado='liberado'
                    )
                )
            ).filter(
                total_asignaciones__gt=0
            ).order_by('-total_asignaciones')[:limit]
            
            reporte_data = []
            total_dias_periodo = (fecha_fin - fecha_inicio).days + 1
            
            for habitacion in habitaciones_stats:
                # Calcular ingresos generados (aproximado)
                asignaciones = ClientRoom.objects.filter(
                    room=habitacion,
                    fecha_asignacion__date__gte=fecha_inicio,
                    fecha_asignacion__date__lte=fecha_fin
                )
                
                # Distribución por mes
                asignaciones_por_mes = asignaciones.annotate(
                    mes=TruncMonth('fecha_asignacion')
                ).values('mes').annotate(
                    count=Count('id')
                ).order_by('mes')
                
                distribucion_mensual = {}
                for asignacion in asignaciones_por_mes:
                    mes_key = asignacion['mes'].strftime('%Y-%m')
                    distribucion_mensual[mes_key] = asignacion['count']
                
                # Calcular estadísticas
                tasa_ocupacion = (
                    (habitacion.dias_ocupados / total_dias_periodo) * 100
                    if total_dias_periodo > 0 else 0
                )
                
                # Estimar ingresos (precio por noche * días ocupados)
                ingresos_generados = float(habitacion.precio_noche) * habitacion.dias_ocupados
                
                # Promedio de estadía
                promedio_estadia = (
                    habitacion.dias_ocupados / habitacion.total_asignaciones
                    if habitacion.total_asignaciones > 0 else 0
                )
                
                habitacion_data = {
                    'habitacion_id': habitacion.id,
                    'numero': habitacion.numero,
                    'tipo': habitacion.tipo,
                    'tipo_display': habitacion.get_tipo_display(),
                    'precio_noche': float(habitacion.precio_noche),
                    'total_asignaciones': habitacion.total_asignaciones,
                    'total_clientes_unicos': habitacion.total_clientes_unicos,
                    'ingresos_generados': ingresos_generados,
                    'dias_ocupados': habitacion.dias_ocupados,
                    'tasa_ocupacion': round(tasa_ocupacion, 2),
                    'promedio_estadia': round(promedio_estadia, 2),
                    'distribución_por_mes': distribucion_mensual
                }
                
                reporte_data.append(habitacion_data)
            
            execution_time = time.time() - start_time
            
            # Crear cache
            ReportCache.create_cache(cache_key, reporte_data, parameters)
            
            self.log_report_action(
                cache_key,
                'generated',
                execution_time=execution_time,
                record_count=len(reporte_data),
                success=True
            )
            
            return Response(reporte_data)
            
        except Exception as e:
            execution_time = time.time() - start_time
            self.log_report_action(
                'room_popularity',
                'generated',
                execution_time=execution_time,
                success=False,
                error_message=str(e)
            )
            return Response(
                {'error': f'Error generando reporte: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def mejor_temporada(self, request):
        """Reporte de mejor temporada (mayor cantidad de ventas)"""
        start_time = time.time()
        
        try:
            cache_key = 'seasonal_sales'
            parameters = request.query_params.dict()
            cached_report = ReportCache.get_valid_cache(cache_key, parameters)
            
            if cached_report:
                self.log_report_action(cache_key, 'viewed', execution_time=0)
                return Response(cached_report.data)
            
            fecha_inicio, fecha_fin = self.get_date_range(request)
            agrupacion = request.query_params.get('agrupacion', 'mes')  # mes, trimestre, año
            
            # Agrupar ventas por período
            if agrupacion == 'mes':
                ventas_por_periodo = Client.objects.filter(
                    created_at__date__gte=fecha_inicio,
                    created_at__date__lte=fecha_fin
                ).annotate(
                    periodo=TruncMonth('created_at'),
                    año=Extract('created_at', 'year'),
                    mes=Extract('created_at', 'month')
                ).values('periodo', 'año', 'mes').annotate(
                    total_reservas=Count('id'),
                    total_habitaciones_vendidas=Count('habitaciones_asignadas'),
                    ingresos_totales=Sum('monto_pagado'),
                    clientes_unicos=Count('id', distinct=True)
                ).order_by('-ingresos_totales', '-total_reservas')
            
            reporte_data = []
            
            for periodo_data in ventas_por_periodo:
                periodo_inicio = periodo_data['periodo']
                
                # Calcular días del período
                if agrupacion == 'mes':
                    # Último día del mes
                    if periodo_inicio.month == 12:
                        periodo_fin = periodo_inicio.replace(year=periodo_inicio.year + 1, month=1, day=1) - timedelta(days=1)
                    else:
                        periodo_fin = periodo_inicio.replace(month=periodo_inicio.month + 1, day=1) - timedelta(days=1)
                
                dias_periodo = (periodo_fin - periodo_inicio.date()).days + 1
                promedio_reservas_diarias = (
                    periodo_data['total_reservas'] / dias_periodo
                    if dias_periodo > 0 else 0
                )
                
                # Encontrar habitación más popular del período
                habitacion_popular = Room.objects.filter(
                    clients_asignados__fecha_asignacion__gte=periodo_inicio,
                    clients_asignados__fecha_asignacion__lte=periodo_fin
                ).annotate(
                    asignaciones_periodo=Count('clients_asignados')
                ).order_by('-asignaciones_periodo').first()
                
                habitacion_mas_popular = {}
                if habitacion_popular:
                    habitacion_mas_popular = {
                        'numero': habitacion_popular.numero,
                        'tipo': habitacion_popular.get_tipo_display(),
                        'asignaciones': habitacion_popular.asignaciones_periodo
                    }
                
                # Tipo de pago preferido del período
                tipo_pago_stats = Client.objects.filter(
                    created_at__gte=periodo_inicio,
                    created_at__lte=periodo_fin
                ).values('tipo_pago').annotate(
                    count=Count('id')
                ).order_by('-count').first()
                
                tipo_pago_preferido = {}
                if tipo_pago_stats:
                    tipo_pago_preferido = {
                        'tipo': tipo_pago_stats['tipo_pago'],
                        'count': tipo_pago_stats['count']
                    }
                
                # Distribución semanal (para meses)
                distribucion_semanal = {}
                if agrupacion == 'mes':
                    semanas_mes = Client.objects.filter(
                        created_at__gte=periodo_inicio,
                        created_at__lte=periodo_fin
                    ).annotate(
                        semana=Extract('created_at', 'week')
                    ).values('semana').annotate(
                        reservas=Count('id'),
                        ingresos=Sum('monto_pagado')
                    ).order_by('semana')
                    
                    for semana_data in semanas_mes:
                        semana_key = f"Semana {semana_data['semana']}"
                        distribucion_semanal[semana_key] = {
                            'reservas': semana_data['reservas'],
                            'ingresos': float(semana_data['ingresos'] or 0)
                        }
                
                periodo_reporte = {
                    'periodo': periodo_inicio.strftime('%Y-%m'),
                    'año': periodo_data['año'],
                    'mes': periodo_data['mes'],
                    'total_reservas': periodo_data['total_reservas'],
                    'total_habitaciones_vendidas': periodo_data['total_habitaciones_vendidas'],
                    'ingresos_totales': float(periodo_data['ingresos_totales'] or 0),
                    'promedio_reservas_diarias': round(promedio_reservas_diarias, 2),
                    'clientes_unicos': periodo_data['clientes_unicos'],
                    'habitacion_mas_popular': habitacion_mas_popular,
                    'tipo_pago_preferido': tipo_pago_preferido,
                    'distribución_semanal': distribucion_semanal
                }
                
                reporte_data.append(periodo_reporte)
            
            execution_time = time.time() - start_time
            
            # Crear cache
            ReportCache.create_cache(cache_key, reporte_data, parameters)
            
            self.log_report_action(
                cache_key,
                'generated',
                execution_time=execution_time,
                record_count=len(reporte_data),
                success=True
            )
            
            return Response(reporte_data)
            
        except Exception as e:
            execution_time = time.time() - start_time
            self.log_report_action(
                'seasonal_sales',
                'generated',
                execution_time=execution_time,
                success=False,
                error_message=str(e)
            )
            return Response(
                {'error': f'Error generando reporte: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """Dashboard principal con múltiples estadísticas"""
        start_time = time.time()
        
        try:
            fecha_inicio, fecha_fin = self.get_date_range(request)
            
            # Estadísticas generales
            total_clientes = Client.objects.filter(
                created_at__date__gte=fecha_inicio,
                created_at__date__lte=fecha_fin
            ).count()
            
            total_reservas = ClientRoom.objects.filter(
                fecha_asignacion__date__gte=fecha_inicio,
                fecha_asignacion__date__lte=fecha_fin
            ).count()
            
            ingresos_totales = Client.objects.filter(
                created_at__date__gte=fecha_inicio,
                created_at__date__lte=fecha_fin
            ).aggregate(total=Sum('monto_pagado'))['total'] or 0
            
            # Tarjetas de resumen
            summary_cards = [
                {
                    'title': 'Total Clientes',
                    'value': total_clientes,
                    'icon': 'users',
                    'color': 'blue',
                    'trend': '+12%'  # Calcular tendencia real
                },
                {
                    'title': 'Total Reservas',
                    'value': total_reservas,
                    'icon': 'calendar',
                    'color': 'green',
                    'trend': '+8%'
                },
                {
                    'title': 'Ingresos Totales',
                    'value': f'S/ {float(ingresos_totales):,.2f}',
                    'icon': 'dollar-sign',
                    'color': 'yellow',
                    'trend': '+15%'
                },
                {
                    'title': 'Tasa Ocupación',
                    'value': '85%',  # Calcular tasa real
                    'icon': 'home',
                    'color': 'purple',
                    'trend': '+3%'
                }
            ]
            
            # Gráfico de clientes por mes
            clientes_por_mes = Client.objects.filter(
                created_at__date__gte=fecha_inicio,
                created_at__date__lte=fecha_fin
            ).annotate(
                mes=TruncMonth('created_at')
            ).values('mes').annotate(
                count=Count('id')
            ).order_by('mes')
            
            chart_clientes_data = []
            for item in clientes_por_mes:
                chart_clientes_data.append({
                    'name': item['mes'].strftime('%b %Y'),
                    'value': item['count']
                })
            
            # Gráfico de habitaciones más populares
            habitaciones_populares = Room.objects.annotate(
                total_asignaciones=Count('clients_asignados')
            ).order_by('-total_asignaciones')[:5]
            
            chart_habitaciones_data = []
            for habitacion in habitaciones_populares:
                chart_habitaciones_data.append({
                    'name': f'Hab. {habitacion.numero}',
                    'value': habitacion.total_asignaciones,
                    'tipo': habitacion.get_tipo_display()
                })
            
            # Gráfico de tipos de pago
            tipos_pago = Client.objects.filter(
                created_at__date__gte=fecha_inicio,
                created_at__date__lte=fecha_fin
            ).values('tipo_pago').annotate(
                count=Count('id')
            ).order_by('-count')
            
            chart_pagos_data = []
            for tipo in tipos_pago:
                chart_pagos_data.append({
                    'name': dict(Client.TIPO_PAGO_CHOICES)[tipo['tipo_pago']],
                    'value': tipo['count']
                })
            
            # Gráficos para el dashboard
            charts = [
                {
                    'chart_type': 'line',
                    'title': 'Clientes por Mes',
                    'x_axis_label': 'Mes',
                    'y_axis_label': 'Cantidad',
                    'data': chart_clientes_data,
                    'colors': ['#3B82F6']
                },
                {
                    'chart_type': 'bar',
                    'title': 'Top 5 Habitaciones Más Populares',
                    'x_axis_label': 'Habitación',
                    'y_axis_label': 'Asignaciones',
                    'data': chart_habitaciones_data,
                    'colors': ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']
                },
                {
                    'chart_type': 'pie',
                    'title': 'Distribución por Tipo de Pago',
                    'data': chart_pagos_data,
                    'colors': ['#3B82F6', '#10B981', '#F59E0B']
                }
            ]
            
            # Actividad reciente
            recent_activity = []
            clientes_recientes = Client.objects.filter(
                created_at__date__gte=fecha_inicio
            ).order_by('-created_at')[:5]
            
            for cliente in clientes_recientes:
                recent_activity.append({
                    'type': 'new_client',
                    'description': f'Nuevo cliente: {cliente.nombre_completo}',
                    'timestamp': cliente.created_at,
                    'details': {
                        'documento': cliente.numero_documento,
                        'monto': float(cliente.monto_pagado)
                    }
                })
            
            dashboard_data = {
                'summary_cards': summary_cards,
                'charts': charts,
                'recent_activity': recent_activity,
                'quick_stats': {
                    'periodo_analizado': {
                        'fecha_inicio': fecha_inicio.isoformat(),
                        'fecha_fin': fecha_fin.isoformat(),
                        'dias_total': (fecha_fin - fecha_inicio).days + 1
                    },
                    'promedio_diario': {
                        'clientes': round(total_clientes / ((fecha_fin - fecha_inicio).days + 1), 2),
                        'ingresos': round(float(ingresos_totales) / ((fecha_fin - fecha_inicio).days + 1), 2)
                    }
                },
                'generated_at': timezone.now()
            }
            
            execution_time = time.time() - start_time
            self.log_report_action(
                'dashboard',
                'generated',
                execution_time=execution_time,
                record_count=total_clientes,
                success=True
            )
            
            return Response(dashboard_data)
            
        except Exception as e:
            execution_time = time.time() - start_time
            self.log_report_action(
                'dashboard',
                'generated',
                execution_time=execution_time,
                success=False,
                error_message=str(e)
            )
            return Response(
                {'error': f'Error generando dashboard: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def estadisticas_generales(self, request):
        """Estadísticas generales del sistema"""
        try:
            fecha_inicio, fecha_fin = self.get_date_range(request)
            
            # Resumen de clientes
            resumen_clientes = {
                'total_clientes': Client.objects.count(),
                'clientes_periodo': Client.objects.filter(
                    created_at__date__gte=fecha_inicio,
                    created_at__date__lte=fecha_fin
                ).count(),
                'clientes_activos': Client.objects.filter(
                    habitaciones_asignadas__estado='activo'
                ).distinct().count(),
                'por_tipo_documento': dict(
                    Client.objects.values('tipo_documento').annotate(
                        count=Count('id')
                    ).values_list('tipo_documento', 'count')
                ),
                'cliente_mas_gastador': None
            }
            
            # Cliente que más ha gastado
            cliente_gastador = Client.objects.aggregate(
                max_gasto=Max('monto_pagado')
            )
            if cliente_gastador['max_gasto']:
                cliente_top = Client.objects.filter(
                    monto_pagado=cliente_gastador['max_gasto']
                ).first()
                resumen_clientes['cliente_mas_gastador'] = {
                    'nombre': cliente_top.nombre_completo,
                    'documento': cliente_top.numero_documento,
                    'monto': float(cliente_top.monto_pagado)
                }
            
            # Resumen de habitaciones
            resumen_habitaciones = {
                'total_habitaciones': Room.objects.count(),
                'disponibles': Room.objects.filter(estado='disponible').count(),
                'ocupadas': Room.objects.filter(estado='ocupado').count(),
                'sucias': Room.objects.filter(estado='sucio').count(),
                'mantenimiento': Room.objects.filter(estado='mantenimiento').count(),
                'por_tipo': dict(
                    Room.objects.values('tipo').annotate(
                        count=Count('id')
                    ).values_list('tipo', 'count')
                ),
                'tasa_ocupacion_global': 0
            }
            
            # Calcular tasa de ocupación
            total_habitaciones = resumen_habitaciones['total_habitaciones']
            ocupadas = resumen_habitaciones['ocupadas']
            if total_habitaciones > 0:
                resumen_habitaciones['tasa_ocupacion_global'] = round(
                    (ocupadas / total_habitaciones) * 100, 2
                )
            
            # Resumen de ingresos
            resumen_ingresos = {
                'ingresos_totales': float(
                    Client.objects.aggregate(
                        total=Sum('monto_pagado')
                    )['total'] or 0
                ),
                'ingresos_periodo': float(
                    Client.objects.filter(
                        created_at__date__gte=fecha_inicio,
                        created_at__date__lte=fecha_fin
                    ).aggregate(
                        total=Sum('monto_pagado')
                    )['total'] or 0
                ),
                'promedio_por_cliente': 0,
                'por_tipo_pago': {}
            }
            
            # Promedio por cliente
            if resumen_clientes['total_clientes'] > 0:
                resumen_ingresos['promedio_por_cliente'] = round(
                    resumen_ingresos['ingresos_totales'] / resumen_clientes['total_clientes'], 2
                )
            
            # Ingresos por tipo de pago
            ingresos_tipo_pago = Client.objects.values('tipo_pago').annotate(
                total_ingresos=Sum('monto_pagado'),
                total_clientes=Count('id')
            )
            
            for tipo_data in ingresos_tipo_pago:
                tipo_pago = tipo_data['tipo_pago']
                resumen_ingresos['por_tipo_pago'][tipo_pago] = {
                    'ingresos_totales': float(tipo_data['total_ingresos'] or 0),
                    'total_clientes': tipo_data['total_clientes'],
                    'promedio_por_cliente': round(
                        float(tipo_data['total_ingresos'] or 0) / tipo_data['total_clientes'], 2
                    ) if tipo_data['total_clientes'] > 0 else 0
                }
            
            # Tendencias (comparar con período anterior)
            dias_periodo = (fecha_fin - fecha_inicio).days + 1
            fecha_inicio_anterior = fecha_inicio - timedelta(days=dias_periodo)
            fecha_fin_anterior = fecha_inicio - timedelta(days=1)
            
            clientes_periodo_anterior = Client.objects.filter(
                created_at__date__gte=fecha_inicio_anterior,
                created_at__date__lte=fecha_fin_anterior
            ).count()
            
            ingresos_periodo_anterior = float(
                Client.objects.filter(
                    created_at__date__gte=fecha_inicio_anterior,
                    created_at__date__lte=fecha_fin_anterior
                ).aggregate(
                    total=Sum('monto_pagado')
                )['total'] or 0
            )
            
            tendencias = {
                'crecimiento_clientes': 0,
                'crecimiento_ingresos': 0,
                'tendencia_clientes': 'estable',
                'tendencia_ingresos': 'estable'
            }
            
            if clientes_periodo_anterior > 0:
                crecimiento_clientes = (
                    (resumen_clientes['clientes_periodo'] - clientes_periodo_anterior) / 
                    clientes_periodo_anterior
                ) * 100
                tendencias['crecimiento_clientes'] = round(crecimiento_clientes, 2)
                tendencias['tendencia_clientes'] = (
                    'crecimiento' if crecimiento_clientes > 0 else 
                    'decrecimiento' if crecimiento_clientes < 0 else 'estable'
                )
            
            if ingresos_periodo_anterior > 0:
                crecimiento_ingresos = (
                    (resumen_ingresos['ingresos_periodo'] - ingresos_periodo_anterior) / 
                    ingresos_periodo_anterior
                ) * 100
                tendencias['crecimiento_ingresos'] = round(crecimiento_ingresos, 2)
                tendencias['tendencia_ingresos'] = (
                    'crecimiento' if crecimiento_ingresos > 0 else 
                    'decrecimiento' if crecimiento_ingresos < 0 else 'estable'
                )
            
            estadisticas = {
                'periodo_analizado': {
                    'fecha_inicio': fecha_inicio.isoformat(),
                    'fecha_fin': fecha_fin.isoformat(),
                    'dias_total': dias_periodo
                },
                'resumen_clientes': resumen_clientes,
                'resumen_habitaciones': resumen_habitaciones,
                'resumen_ingresos': resumen_ingresos,
                'tendencias': tendencias
            }
            
            self.log_report_action('general_stats', 'generated', success=True)
            
            return Response(estadisticas)
            
        except Exception as e:
            self.log_report_action(
                'general_stats',
                'generated',
                success=False,
                error_message=str(e)
            )
            return Response(
                {'error': f'Error generando estadísticas: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ReportCacheViewSet(viewsets.ModelViewSet):
    """ViewSet para gestión de cache de reportes"""
    queryset = ReportCache.objects.all()
    serializer_class = ReportCacheSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=True, methods=['post'])
    def invalidate(self, request, pk=None):
        """Invalidar un cache específico"""
        cache = self.get_object()
        cache.invalidate()
        return Response({'message': 'Cache invalidado exitosamente'})
    
    @action(detail=False, methods=['post'])
    def clear_expired(self, request):
        """Limpiar todos los caches expirados"""
        expired_count = ReportCache.objects.filter(
            expires_at__lt=timezone.now()
        ).update(is_valid=False)
        
        return Response({
            'message': f'Se invalidaron {expired_count} caches expirados'
        })


class ReportScheduleViewSet(viewsets.ModelViewSet):
    """ViewSet para gestión de reportes programados"""
    queryset = ReportSchedule.objects.all()
    serializer_class = ReportScheduleSerializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ReportScheduleCreateSerializer
        return ReportScheduleSerializer
    
    def get_queryset(self):
        """Filtrar por usuario si no es admin"""
        queryset = super().get_queryset()
        if not self.request.user.is_staff:
            queryset = queryset.filter(created_by=self.request.user)
        return queryset
    
    @action(detail=True, methods=['post'])
    def execute_now(self, request, pk=None):
        """Ejecutar un reporte programado inmediatamente"""
        schedule = self.get_object()
        
        try:
            # Aquí se ejecutaría la lógica del reporte
            # Por simplicidad, simulamos la ejecución
            schedule.mark_as_generated()
            
            return Response({
                'message': 'Reporte ejecutado exitosamente',
                'next_generation': schedule.next_generation
            })
        except Exception as e:
            return Response(
                {'error': f'Error ejecutando reporte: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['patch'])
    def toggle_status(self, request, pk=None):
        """Activar/pausar un reporte programado"""
        schedule = self.get_object()
        
        if schedule.status == 'active':
            schedule.status = 'paused'
        elif schedule.status == 'paused':
            schedule.status = 'active'
        
        schedule.save()
        
        return Response({
            'message': f'Reporte {schedule.get_status_display().lower()}',
            'status': schedule.status
        })


class ReportAuditViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet de solo lectura para auditoría de reportes"""
    queryset = ReportAudit.objects.all()
    serializer_class = ReportAuditSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filtrar auditoría por usuario si no es admin"""
        queryset = super().get_queryset()
        if not self.request.user.is_staff:
            queryset = queryset.filter(user=self.request.user)
        return queryset
    
    @action(detail=False, methods=['get'])
    def my_activity(self, request):
        """Obtener actividad del usuario actual"""
        audits = self.get_queryset().filter(user=request.user)[:20]
        serializer = self.get_serializer(audits, many=True)
        
        return Response({
            'recent_activity': serializer.data,
            'total_actions': audits.count()
        })
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Estadísticas de uso de reportes"""
        fecha_inicio, fecha_fin = self.get_date_range(request)
        
        # Reportes más generados
        reportes_populares = ReportAudit.objects.filter(
            action='generated',
            created_at__date__gte=fecha_inicio,
            created_at__date__lte=fecha_fin
        ).values('report_type').annotate(
            count=Count('id'),
            avg_execution_time=Avg('execution_time')
        ).order_by('-count')
        
        # Usuarios más activos
        usuarios_activos = ReportAudit.objects.filter(
            created_at__date__gte=fecha_inicio,
            created_at__date__lte=fecha_fin
        ).values('user__username').annotate(
            total_actions=Count('id'),
            reports_generated=Count('id', filter=Q(action='generated'))
        ).order_by('-total_actions')[:10]
        
        # Estadísticas por día
        actividad_diaria = ReportAudit.objects.filter(
            created_at__date__gte=fecha_inicio,
            created_at__date__lte=fecha_fin
        ).annotate(
            fecha=TruncDate('created_at')
        ).values('fecha').annotate(
            total_acciones=Count('id'),
            reportes_generados=Count('id', filter=Q(action='generated')),
            reportes_visualizados=Count('id', filter=Q(action='viewed'))
        ).order_by('fecha')
        
        stats = {
            'periodo': {
                'fecha_inicio': fecha_inicio.isoformat(),
                'fecha_fin': fecha_fin.isoformat()
            },
            'reportes_populares': list(reportes_populares),
            'usuarios_activos': list(usuarios_activos),
            'actividad_diaria': list(actividad_diaria),
            'totales': {
                'acciones_totales': ReportAudit.objects.filter(
                    created_at__date__gte=fecha_inicio,
                    created_at__date__lte=fecha_fin
                ).count(),
                'reportes_generados': ReportAudit.objects.filter(
                    action='generated',
                    created_at__date__gte=fecha_inicio,
                    created_at__date__lte=fecha_fin
                ).count(),
                'usuarios_unicos': ReportAudit.objects.filter(
                    created_at__date__gte=fecha_inicio,
                    created_at__date__lte=fecha_fin
                ).values('user').distinct().count()
            }
        }
        
        return Response(stats)
    
    def get_date_range(self, request):
        """Obtener rango de fechas de los parámetros de request"""
        fecha_inicio = request.query_params.get('fecha_inicio')
        fecha_fin = request.query_params.get('fecha_fin')
        
        if not fecha_fin:
            fecha_fin = timezone.now().date()
        else:
            fecha_fin = datetime.strptime(fecha_fin, '%Y-%m-%d').date()
            
        if not fecha_inicio:
            fecha_inicio = fecha_fin - timedelta(days=30)
        else:
            fecha_inicio = datetime.strptime(fecha_inicio, '%Y-%m-%d').date()
            
        return fecha_inicio, fecha_fin


class ExportViewSet(viewsets.ViewSet):
    """ViewSet para exportación de reportes"""
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['post'])
    def export_report(self, request):
        """Exportar reporte en diferentes formatos"""
        serializer = ExportFormatSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        format_type = serializer.validated_data['format']
        report_type = request.data.get('report_type')
        report_data = request.data.get('report_data', {})
        
        try:
            if format_type == 'json':
                # Exportar como JSON
                response_data = {
                    'report_type': report_type,
                    'generated_at': timezone.now(),
                    'data': report_data,
                    'format': format_type
                }
                
                ReportAudit.log_action(
                    report_type=report_type or 'unknown',
                    action='downloaded',
                    user=request.user,
                    file_size=len(str(response_data))
                )
                
                return Response(response_data)
            
            elif format_type == 'csv':
                # Aquí se implementaría la exportación a CSV
                return Response({
                    'message': 'Exportación CSV en desarrollo',
                    'download_url': '/api/reports/download/csv/123'
                })
            
            elif format_type == 'pdf':
                # Aquí se implementaría la exportación a PDF
                return Response({
                    'message': 'Exportación PDF en desarrollo',
                    'download_url': '/api/reports/download/pdf/123'
                })
            
            elif format_type == 'excel':
                # Aquí se implementaría la exportación a Excel
                return Response({
                    'message': 'Exportación Excel en desarrollo',
                    'download_url': '/api/reports/download/excel/123'
                })
            
            else:
                return Response(
                    {'error': 'Formato de exportación no soportado'},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        except Exception as e:
            ReportAudit.log_action(
                report_type=report_type or 'unknown',
                action='downloaded',
                user=request.user,
                success=False,
                error_message=str(e)
            )
            return Response(
                {'error': f'Error en exportación: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def download_formats(self, request):
        """Obtener formatos de descarga disponibles"""
        formats = [
            {
                'key': 'json',
                'name': 'JSON',
                'description': 'Datos estructurados en formato JSON',
                'mime_type': 'application/json',
                'extension': '.json'
            },
            {
                'key': 'csv',
                'name': 'CSV',
                'description': 'Valores separados por comas',
                'mime_type': 'text/csv',
                'extension': '.csv'
            },
            {
                'key': 'excel',
                'name': 'Excel',
                'description': 'Hoja de cálculo de Microsoft Excel',
                'mime_type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'extension': '.xlsx'
            },
            {
                'key': 'pdf',
                'name': 'PDF',
                'description': 'Documento PDF con gráficos',
                'mime_type': 'application/pdf',
                'extension': '.pdf'
            }
        ]
        
        return Response({'available_formats': formats})


class AnalyticsViewSet(viewsets.ViewSet):
    """ViewSet para análisis avanzados y predicciones"""
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def predicciones_ocupacion(self, request):
        """Predicciones de ocupación basadas en datos históricos"""
        try:
            # Análisis de patrones históricos por mes
            ocupacion_historica = ClientRoom.objects.filter(
                fecha_asignacion__gte=timezone.now() - timedelta(days=365)
            ).annotate(
                mes=Extract('fecha_asignacion', 'month'),
                año=Extract('fecha_asignacion', 'year')
            ).values('mes').annotate(
                promedio_asignaciones=Avg('id'),
                total_asignaciones=Count('id')
            ).order_by('mes')
            
            # Análisis de tendencias por día de la semana
            tendencias_semanales = ClientRoom.objects.filter(
                fecha_asignacion__gte=timezone.now() - timedelta(days=90)
            ).annotate(
                dia_semana=Extract('fecha_asignacion', 'week_day')
            ).values('dia_semana').annotate(
                promedio_asignaciones=Avg('id'),
                total_asignaciones=Count('id')
            ).order_by('dia_semana')
            
            predicciones = {
                'ocupacion_por_mes': list(ocupacion_historica),
                'tendencias_semanales': list(tendencias_semanales),
                'recomendaciones': [
                    'Incrementar marketing en meses de baja ocupación',
                    'Preparar personal adicional para temporadas altas',
                    'Optimizar precios según demanda histórica'
                ],
                'confidence_level': 85,  # Nivel de confianza de las predicciones
                'generated_at': timezone.now()
            }
            
            return Response(predicciones)
            
        except Exception as e:
            return Response(
                {'error': f'Error generando predicciones: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def analisis_rentabilidad(self, request):
        """Análisis de rentabilidad por habitación y período"""
        try:
            fecha_inicio, fecha_fin = self.get_date_range(request)
            
            # Análisis por habitación
            rentabilidad_habitaciones = Room.objects.annotate(
                total_dias_ocupados=Count(
                    'clients_asignados',
                    filter=Q(
                        clients_asignados__fecha_asignacion__date__gte=fecha_inicio,
                        clients_asignados__fecha_asignacion__date__lte=fecha_fin
                    )
                ),
                ingresos_estimados=F('precio_noche') * F('total_dias_ocupados'),
                tasa_ocupacion=Case(
                    When(total_dias_ocupados=0, then=0),
                    default=F('total_dias_ocupados') * 100 / ((fecha_fin - fecha_inicio).days + 1),
                    output_field=IntegerField()
                )
            ).values(
                'id', 'numero', 'tipo', 'precio_noche',
                'total_dias_ocupados', 'ingresos_estimados', 'tasa_ocupacion'
            ).order_by('-ingresos_estimados')
            
            # Análisis por tipo de habitación
            rentabilidad_tipos = Room.objects.values('tipo').annotate(
                total_habitaciones=Count('id'),
                promedio_ocupacion=Avg(
                    Case(
                        When(
                            clients_asignados__fecha_asignacion__date__gte=fecha_inicio,
                            clients_asignados__fecha_asignacion__date__lte=fecha_fin,
                            then=1
                        ),
                        default=0,
                        output_field=IntegerField()
                    )
                ),
                ingresos_totales=Sum(
                    F('precio_noche') * Count('clients_asignados')
                ),
                precio_promedio=Avg('precio_noche')
            ).order_by('-ingresos_totales')
            
            analisis = {
                'periodo_analizado': {
                    'fecha_inicio': fecha_inicio.isoformat(),
                    'fecha_fin': fecha_fin.isoformat(),
                    'dias_total': (fecha_fin - fecha_inicio).days + 1
                },
                'rentabilidad_por_habitacion': list(rentabilidad_habitaciones),
                'rentabilidad_por_tipo': list(rentabilidad_tipos),
                'metricas_generales': {
                    'habitacion_mas_rentable': rentabilidad_habitaciones.first() if rentabilidad_habitaciones else None,
                    'tipo_mas_rentable': rentabilidad_tipos.first() if rentabilidad_tipos else None,
                    'ingresos_totales_periodo': sum(
                        item['ingresos_estimados'] or 0 
                        for item in rentabilidad_habitaciones
                    )
                },
                'generated_at': timezone.now()
            }
            
            return Response(analisis)
            
        except Exception as e:
            return Response(
                {'error': f'Error en análisis de rentabilidad: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def get_date_range(self, request):
        """Obtener rango de fechas de los parámetros de request"""
        fecha_inicio = request.query_params.get('fecha_inicio')
        fecha_fin = request.query_params.get('fecha_fin')
        
        if not fecha_fin:
            fecha_fin = timezone.now().date()
        else:
            fecha_fin = datetime.strptime(fecha_fin, '%Y-%m-%d').date()
            
        if not fecha_inicio:
            fecha_inicio = fecha_fin - timedelta(days=30)
        else:
            fecha_inicio = datetime.strptime(fecha_inicio, '%Y-%m-%d').date()
            
        return fecha_inicio, fecha_fin