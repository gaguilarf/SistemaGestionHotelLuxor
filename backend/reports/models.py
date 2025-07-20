# reports/models.py
from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core.validators import MinValueValidator
from datetime import datetime, timedelta

class ReportCache(models.Model):
    """
    Modelo para cachear resultados de reportes complejos y evitar recálculos frecuentes
    """
    REPORT_TYPE_CHOICES = [
        ('client_frequency', 'Cliente más frecuente'),
        ('room_popularity', 'Habitación más vendida'),
        ('seasonal_sales', 'Temporada de mayor ventas'),
        ('monthly_revenue', 'Ingresos mensuales'),
        ('occupancy_rate', 'Tasa de ocupación'),
        ('payment_methods', 'Métodos de pago'),
    ]
    
    report_type = models.CharField(
        max_length=50,
        choices=REPORT_TYPE_CHOICES,
        help_text="Tipo de reporte cacheado"
    )
    
    parameters = models.JSONField(
        default=dict,
        help_text="Parámetros utilizados para generar el reporte (fechas, filtros, etc.)"
    )
    
    data = models.JSONField(
        help_text="Datos del reporte en formato JSON"
    )
    
    generated_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Fecha y hora de generación del reporte"
    )
    
    expires_at = models.DateTimeField(
        help_text="Fecha y hora de expiración del cache"
    )
    
    is_valid = models.BooleanField(
        default=True,
        help_text="Indica si el cache sigue siendo válido"
    )
    
    class Meta:
        db_table = 'report_cache'
        verbose_name = 'Cache de Reporte'
        verbose_name_plural = 'Cache de Reportes'
        ordering = ['-generated_at']
        
        indexes = [
            models.Index(fields=['report_type'], name='idx_report_type'),
            models.Index(fields=['expires_at'], name='idx_report_expires'),
            models.Index(fields=['is_valid'], name='idx_report_valid'),
        ]
        
        # Constraint para evitar duplicados de reportes con los mismos parámetros
        constraints = [
            models.UniqueConstraint(
                fields=['report_type', 'parameters'],
                condition=models.Q(is_valid=True),
                name='unique_valid_report_cache'
            )
        ]
    
    def __str__(self):
        return f"{self.get_report_type_display()} - {self.generated_at.strftime('%d/%m/%Y %H:%M')}"
    
    @property
    def is_expired(self):
        """Verifica si el cache ha expirado"""
        return timezone.now() > self.expires_at
    
    def invalidate(self):
        """Invalidar el cache"""
        self.is_valid = False
        self.save()
    
    @classmethod
    def get_valid_cache(cls, report_type, parameters=None):
        """Obtener cache válido para un tipo de reporte y parámetros específicos"""
        if parameters is None:
            parameters = {}
            
        cache = cls.objects.filter(
            report_type=report_type,
            parameters=parameters,
            is_valid=True
        ).first()
        
        if cache and not cache.is_expired:
            return cache
        elif cache and cache.is_expired:
            cache.invalidate()
        
        return None
    
    @classmethod
    def create_cache(cls, report_type, data, parameters=None, cache_duration_hours=1):
        """Crear nuevo cache para un reporte"""
        if parameters is None:
            parameters = {}
            
        # Invalidar cache anterior del mismo tipo y parámetros
        cls.objects.filter(
            report_type=report_type,
            parameters=parameters,
            is_valid=True
        ).update(is_valid=False)
        
        # Crear nuevo cache
        expires_at = timezone.now() + timedelta(hours=cache_duration_hours)
        
        return cls.objects.create(
            report_type=report_type,
            parameters=parameters,
            data=data,
            expires_at=expires_at
        )


class ReportSchedule(models.Model):
    """
    Modelo para programar la generación automática de reportes
    """
    FREQUENCY_CHOICES = [
        ('daily', 'Diario'),
        ('weekly', 'Semanal'),
        ('monthly', 'Mensual'),
        ('quarterly', 'Trimestral'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Activo'),
        ('paused', 'Pausado'),
        ('completed', 'Completado'),
        ('failed', 'Fallido'),
    ]
    
    name = models.CharField(
        max_length=100,
        help_text="Nombre descriptivo del reporte programado"
    )
    
    report_type = models.CharField(
        max_length=50,
        choices=ReportCache.REPORT_TYPE_CHOICES,
        help_text="Tipo de reporte a generar"
    )
    
    frequency = models.CharField(
        max_length=20,
        choices=FREQUENCY_CHOICES,
        help_text="Frecuencia de generación"
    )
    
    parameters = models.JSONField(
        default=dict,
        help_text="Parámetros por defecto para el reporte"
    )
    
    last_generated = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Última vez que se generó el reporte"
    )
    
    next_generation = models.DateTimeField(
        help_text="Próxima fecha de generación programada"
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='active',
        help_text="Estado del reporte programado"
    )
    
    email_recipients = models.TextField(
        blank=True,
        help_text="Emails separados por coma para enviar el reporte"
    )
    
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        help_text="Usuario que creó el reporte programado"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'report_schedules'
        verbose_name = 'Reporte Programado'
        verbose_name_plural = 'Reportes Programados'
        ordering = ['-created_at']
        
        indexes = [
            models.Index(fields=['status'], name='idx_schedule_status'),
            models.Index(fields=['next_generation'], name='idx_schedule_next'),
            models.Index(fields=['report_type'], name='idx_schedule_type'),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.get_frequency_display()}"
    
    def calculate_next_generation(self):
        """Calcular la próxima fecha de generación según la frecuencia"""
        now = timezone.now()
        
        if self.frequency == 'daily':
            return now + timedelta(days=1)
        elif self.frequency == 'weekly':
            return now + timedelta(weeks=1)
        elif self.frequency == 'monthly':
            return now + timedelta(days=30)  # Aproximación
        elif self.frequency == 'quarterly':
            return now + timedelta(days=90)  # Aproximación
        
        return now + timedelta(days=1)  # Default
    
    def mark_as_generated(self):
        """Marcar como generado y calcular próxima fecha"""
        self.last_generated = timezone.now()
        self.next_generation = self.calculate_next_generation()
        self.save()


class ReportAudit(models.Model):
    """
    Modelo para auditoría de reportes generados
    """
    ACTION_CHOICES = [
        ('generated', 'Generado'),
        ('viewed', 'Visualizado'),
        ('downloaded', 'Descargado'),
        ('shared', 'Compartido'),
        ('deleted', 'Eliminado'),
    ]
    
    report_type = models.CharField(
        max_length=50,
        choices=ReportCache.REPORT_TYPE_CHOICES,
        help_text="Tipo de reporte"
    )
    
    action = models.CharField(
        max_length=20,
        choices=ACTION_CHOICES,
        help_text="Acción realizada"
    )
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        help_text="Usuario que realizó la acción"
    )
    
    parameters = models.JSONField(
        default=dict,
        help_text="Parámetros utilizados"
    )
    
    execution_time = models.FloatField(
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
        help_text="Tiempo de ejecución en segundos (para reportes generados)"
    )
    
    record_count = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="Número de registros procesados"
    )
    
    file_size = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="Tamaño del archivo generado en bytes"
    )
    
    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
        help_text="Dirección IP del usuario"
    )
    
    user_agent = models.TextField(
        blank=True,
        help_text="User Agent del navegador"
    )
    
    success = models.BooleanField(
        default=True,
        help_text="Indica si la acción fue exitosa"
    )
    
    error_message = models.TextField(
        blank=True,
        help_text="Mensaje de error si la acción falló"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'report_audit'
        verbose_name = 'Auditoría de Reporte'
        verbose_name_plural = 'Auditorías de Reportes'
        ordering = ['-created_at']
        
        indexes = [
            models.Index(fields=['report_type'], name='idx_audit_report_type'),
            models.Index(fields=['action'], name='idx_audit_action'),
            models.Index(fields=['user'], name='idx_audit_user'),
            models.Index(fields=['created_at'], name='idx_audit_created'),
            models.Index(fields=['success'], name='idx_audit_success'),
        ]
    
    def __str__(self):
        status = "✓" if self.success else "✗"
        return f"{status} {self.user.username} - {self.get_action_display()} - {self.get_report_type_display()}"
    
    @classmethod
    def log_action(cls, report_type, action, user, parameters=None, **kwargs):
        """Método de conveniencia para registrar acciones"""
        return cls.objects.create(
            report_type=report_type,
            action=action,
            user=user,
            parameters=parameters or {},
            **kwargs
        )