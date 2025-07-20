# reports/serializers.py
from rest_framework import serializers
from django.conf import settings
from .models import ReportCache, ReportSchedule, ReportAudit

class ReportParametersSerializer(serializers.Serializer):
    """Serializer base para parámetros de reportes"""
    fecha_inicio = serializers.DateField(
        required=False,
        help_text="Fecha de inicio para el filtro (YYYY-MM-DD)"
    )
    fecha_fin = serializers.DateField(
        required=False,
        help_text="Fecha de fin para el filtro (YYYY-MM-DD)"
    )
    limit = serializers.IntegerField(
        required=False,
        default=10,
        min_value=1,
        max_value=100,
        help_text="Límite de resultados a mostrar"
    )
    
    def validate(self, data):
        """Validar que fecha_fin sea posterior a fecha_inicio"""
        fecha_inicio = data.get('fecha_inicio')
        fecha_fin = data.get('fecha_fin')
        
        if fecha_inicio and fecha_fin:
            if fecha_fin <= fecha_inicio:
                raise serializers.ValidationError({
                    'fecha_fin': 'La fecha de fin debe ser posterior a la fecha de inicio'
                })
        
        return data


class ClientFrequencyReportSerializer(serializers.Serializer):
    """Serializer para reporte de cliente más frecuente"""
    cliente_id = serializers.IntegerField(help_text="ID del cliente")
    nombre_completo = serializers.CharField(help_text="Nombre completo del cliente")
    tipo_documento = serializers.CharField(help_text="Tipo de documento")
    numero_documento = serializers.CharField(help_text="Número de documento")
    total_reservas = serializers.IntegerField(help_text="Total de reservas realizadas")
    total_habitaciones = serializers.IntegerField(help_text="Total de habitaciones utilizadas")
    monto_total_pagado = serializers.DecimalField(
        max_digits=12, 
        decimal_places=2,
        help_text="Monto total pagado por el cliente"
    )
    primera_reserva = serializers.DateTimeField(help_text="Fecha de la primera reserva")
    ultima_reserva = serializers.DateTimeField(help_text="Fecha de la última reserva")
    promedio_habitaciones_por_reserva = serializers.DecimalField(
        max_digits=5,
        decimal_places=2,
        help_text="Promedio de habitaciones por reserva"
    )
    frecuencia_mensual = serializers.DictField(
        help_text="Distribución de reservas por mes"
    )


class RoomPopularityReportSerializer(serializers.Serializer):
    """Serializer para reporte de habitación más vendida"""
    habitacion_id = serializers.IntegerField(help_text="ID de la habitación")
    numero = serializers.CharField(help_text="Número de la habitación")
    tipo = serializers.CharField(help_text="Tipo de habitación")
    tipo_display = serializers.CharField(help_text="Tipo de habitación (display)")
    precio_noche = serializers.DecimalField(
        max_digits=8,
        decimal_places=2,
        help_text="Precio por noche"
    )
    total_asignaciones = serializers.IntegerField(help_text="Total de veces asignada")
    total_clientes_unicos = serializers.IntegerField(help_text="Total de clientes únicos")
    ingresos_generados = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Ingresos totales generados"
    )
    dias_ocupados = serializers.IntegerField(help_text="Total de días ocupados")
    tasa_ocupacion = serializers.DecimalField(
        max_digits=5,
        decimal_places=2,
        help_text="Tasa de ocupación (%)"
    )
    promedio_estadia = serializers.DecimalField(
        max_digits=5,
        decimal_places=2,
        help_text="Promedio de días por estadía"
    )
    distribución_por_mes = serializers.DictField(
        help_text="Distribución de ocupación por mes"
    )


class SeasonalSalesReportSerializer(serializers.Serializer):
    """Serializer para reporte de temporada de mayor ventas"""
    periodo = serializers.CharField(help_text="Período (YYYY-MM o rango)")
    año = serializers.IntegerField(help_text="Año del período")
    mes = serializers.IntegerField(
        required=False,
        help_text="Mes del período (si aplica)"
    )
    total_reservas = serializers.IntegerField(help_text="Total de reservas en el período")
    total_habitaciones_vendidas = serializers.IntegerField(help_text="Total de habitaciones vendidas")
    ingresos_totales = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="Ingresos totales del período"
    )
    promedio_reservas_diarias = serializers.DecimalField(
        max_digits=8,
        decimal_places=2,
        help_text="Promedio de reservas por día"
    )
    clientes_unicos = serializers.IntegerField(help_text="Clientes únicos en el período")
    habitacion_mas_popular = serializers.DictField(
        help_text="Habitación más popular del período"
    )
    tipo_pago_preferido = serializers.DictField(
        help_text="Método de pago más utilizado"
    )
    distribución_semanal = serializers.DictField(
        help_text="Distribución de ventas por semana del mes"
    )


class GeneralStatsSerializer(serializers.Serializer):
    """Serializer para estadísticas generales"""
    periodo_analizado = serializers.DictField(help_text="Período analizado")
    resumen_clientes = serializers.DictField(help_text="Resumen de clientes")
    resumen_habitaciones = serializers.DictField(help_text="Resumen de habitaciones")
    resumen_ingresos = serializers.DictField(help_text="Resumen de ingresos")
    tendencias = serializers.DictField(help_text="Tendencias identificadas")


class ReportCacheSerializer(serializers.ModelSerializer):
    """Serializer para el modelo ReportCache"""
    report_type_display = serializers.CharField(source='get_report_type_display', read_only=True)
    is_expired = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = ReportCache
        fields = [
            'id', 'report_type', 'report_type_display', 'parameters',
            'data', 'generated_at', 'expires_at', 'is_valid', 'is_expired'
        ]
        read_only_fields = ['id', 'generated_at']


class ReportScheduleSerializer(serializers.ModelSerializer):
    """Serializer para el modelo ReportSchedule"""
    frequency_display = serializers.CharField(source='get_frequency_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    report_type_display = serializers.CharField(source='get_report_type_display', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    created_by_email = serializers.CharField(source='created_by.email', read_only=True)
    
    class Meta:
        model = ReportSchedule
        fields = [
            'id', 'name', 'report_type', 'report_type_display',
            'frequency', 'frequency_display', 'parameters',
            'last_generated', 'next_generation', 'status', 'status_display',
            'email_recipients', 'created_by', 'created_by_username', 'created_by_email',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'last_generated']
    
    def validate_email_recipients(self, value):
        """Validar formato de emails"""
        if value:
            emails = [email.strip() for email in value.split(',')]
            for email in emails:
                if email and '@' not in email:
                    raise serializers.ValidationError(
                        f"Email inválido: {email}"
                    )
        return value


class ReportScheduleCreateSerializer(serializers.ModelSerializer):
    """Serializer específico para crear reportes programados"""
    
    class Meta:
        model = ReportSchedule
        fields = [
            'name', 'report_type', 'frequency', 'parameters',
            'next_generation', 'email_recipients'
        ]
    
    def create(self, validated_data):
        """Crear reporte programado"""
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class ReportAuditSerializer(serializers.ModelSerializer):
    """Serializer para el modelo ReportAudit"""
    action_display = serializers.CharField(source='get_action_display', read_only=True)
    report_type_display = serializers.CharField(source='get_report_type_display', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = ReportAudit
        fields = [
            'id', 'report_type', 'report_type_display', 'action', 'action_display',
            'user', 'user_username', 'user_email', 'parameters', 'execution_time',
            'record_count', 'file_size', 'ip_address', 'user_agent',
            'success', 'error_message', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class ChartDataSerializer(serializers.Serializer):
    """Serializer para datos de gráficos"""
    chart_type = serializers.ChoiceField(
        choices=['bar', 'line', 'pie', 'area', 'column'],
        help_text="Tipo de gráfico"
    )
    title = serializers.CharField(help_text="Título del gráfico")
    subtitle = serializers.CharField(
        required=False,
        help_text="Subtítulo del gráfico"
    )
    x_axis_label = serializers.CharField(
        required=False,
        help_text="Etiqueta del eje X"
    )
    y_axis_label = serializers.CharField(
        required=False,
        help_text="Etiqueta del eje Y"
    )
    data = serializers.ListField(
        child=serializers.DictField(),
        help_text="Datos del gráfico"
    )
    colors = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        help_text="Colores personalizados para el gráfico"
    )
    metadata = serializers.DictField(
        required=False,
        help_text="Metadatos adicionales del gráfico"
    )


class DashboardDataSerializer(serializers.Serializer):
    """Serializer para datos del dashboard de reportes"""
    summary_cards = serializers.ListField(
        child=serializers.DictField(),
        help_text="Tarjetas de resumen"
    )
    charts = serializers.ListField(
        child=ChartDataSerializer(),
        help_text="Gráficos del dashboard"
    )
    recent_activity = serializers.ListField(
        child=serializers.DictField(),
        help_text="Actividad reciente"
    )
    quick_stats = serializers.DictField(
        help_text="Estadísticas rápidas"
    )
    generated_at = serializers.DateTimeField(
        help_text="Fecha y hora de generación"
    )


class ExportFormatSerializer(serializers.Serializer):
    """Serializer para opciones de exportación"""
    format = serializers.ChoiceField(
        choices=['pdf', 'excel', 'csv', 'json'],
        help_text="Formato de exportación"
    )
    include_charts = serializers.BooleanField(
        default=True,
        help_text="Incluir gráficos en la exportación"
    )
    include_raw_data = serializers.BooleanField(
        default=False,
        help_text="Incluir datos raw en la exportación"
    )
    file_name = serializers.CharField(
        required=False,
        help_text="Nombre personalizado del archivo"
    )
    email_to = serializers.EmailField(
        required=False,
        help_text="Email para enviar el reporte"
    )


class ReportFilterSerializer(serializers.Serializer):
    """Serializer para filtros avanzados de reportes"""
    tipo_documento = serializers.ChoiceField(
        choices=[('DNI', 'DNI'), ('pasaporte', 'Pasaporte'), ('carnet_extranjeria', 'Carnet de Extranjería')],
        required=False,
        help_text="Filtrar por tipo de documento"
    )
    tipo_pago = serializers.ChoiceField(
        choices=[('efectivo', 'Efectivo'), ('billetera_digital', 'Billetera Digital'), ('visa', 'Visa')],
        required=False,
        help_text="Filtrar por tipo de pago"
    )
    tipo_habitacion = serializers.ChoiceField(
        choices=[('simple', 'Simple'), ('doble', 'Doble'), ('suite', 'Suite'), ('familiar', 'Familiar')],
        required=False,
        help_text="Filtrar por tipo de habitación"
    )
    monto_min = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        required=False,
        help_text="Monto mínimo de pago"
    )
    monto_max = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        required=False,
        help_text="Monto máximo de pago"
    )
    solo_activos = serializers.BooleanField(
        required=False,
        default=False,
        help_text="Solo incluir clientes activos"
    )
    incluir_cancelados = serializers.BooleanField(
        required=False,
        default=False,
        help_text="Incluir reservas canceladas"
    )