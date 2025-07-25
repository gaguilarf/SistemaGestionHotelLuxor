# Generated by Django 5.0.1 on 2025-07-19 04:17

import django.core.validators
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='ReportSchedule',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(help_text='Nombre descriptivo del reporte programado', max_length=100)),
                ('report_type', models.CharField(choices=[('client_frequency', 'Cliente más frecuente'), ('room_popularity', 'Habitación más vendida'), ('seasonal_sales', 'Temporada de mayor ventas'), ('monthly_revenue', 'Ingresos mensuales'), ('occupancy_rate', 'Tasa de ocupación'), ('payment_methods', 'Métodos de pago')], help_text='Tipo de reporte a generar', max_length=50)),
                ('frequency', models.CharField(choices=[('daily', 'Diario'), ('weekly', 'Semanal'), ('monthly', 'Mensual'), ('quarterly', 'Trimestral')], help_text='Frecuencia de generación', max_length=20)),
                ('parameters', models.JSONField(default=dict, help_text='Parámetros por defecto para el reporte')),
                ('last_generated', models.DateTimeField(blank=True, help_text='Última vez que se generó el reporte', null=True)),
                ('next_generation', models.DateTimeField(help_text='Próxima fecha de generación programada')),
                ('status', models.CharField(choices=[('active', 'Activo'), ('paused', 'Pausado'), ('completed', 'Completado'), ('failed', 'Fallido')], default='active', help_text='Estado del reporte programado', max_length=20)),
                ('email_recipients', models.TextField(blank=True, help_text='Emails separados por coma para enviar el reporte')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Reporte Programado',
                'verbose_name_plural': 'Reportes Programados',
                'db_table': 'report_schedules',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='ReportAudit',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('report_type', models.CharField(choices=[('client_frequency', 'Cliente más frecuente'), ('room_popularity', 'Habitación más vendida'), ('seasonal_sales', 'Temporada de mayor ventas'), ('monthly_revenue', 'Ingresos mensuales'), ('occupancy_rate', 'Tasa de ocupación'), ('payment_methods', 'Métodos de pago')], help_text='Tipo de reporte', max_length=50)),
                ('action', models.CharField(choices=[('generated', 'Generado'), ('viewed', 'Visualizado'), ('downloaded', 'Descargado'), ('shared', 'Compartido'), ('deleted', 'Eliminado')], help_text='Acción realizada', max_length=20)),
                ('parameters', models.JSONField(default=dict, help_text='Parámetros utilizados')),
                ('execution_time', models.FloatField(blank=True, help_text='Tiempo de ejecución en segundos (para reportes generados)', null=True, validators=[django.core.validators.MinValueValidator(0)])),
                ('record_count', models.PositiveIntegerField(blank=True, help_text='Número de registros procesados', null=True)),
                ('file_size', models.PositiveIntegerField(blank=True, help_text='Tamaño del archivo generado en bytes', null=True)),
                ('ip_address', models.GenericIPAddressField(blank=True, help_text='Dirección IP del usuario', null=True)),
                ('user_agent', models.TextField(blank=True, help_text='User Agent del navegador')),
                ('success', models.BooleanField(default=True, help_text='Indica si la acción fue exitosa')),
                ('error_message', models.TextField(blank=True, help_text='Mensaje de error si la acción falló')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(help_text='Usuario que realizó la acción', on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Auditoría de Reporte',
                'verbose_name_plural': 'Auditorías de Reportes',
                'db_table': 'report_audit',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='ReportCache',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('report_type', models.CharField(choices=[('client_frequency', 'Cliente más frecuente'), ('room_popularity', 'Habitación más vendida'), ('seasonal_sales', 'Temporada de mayor ventas'), ('monthly_revenue', 'Ingresos mensuales'), ('occupancy_rate', 'Tasa de ocupación'), ('payment_methods', 'Métodos de pago')], help_text='Tipo de reporte cacheado', max_length=50)),
                ('parameters', models.JSONField(default=dict, help_text='Parámetros utilizados para generar el reporte (fechas, filtros, etc.)')),
                ('data', models.JSONField(help_text='Datos del reporte en formato JSON')),
                ('generated_at', models.DateTimeField(auto_now_add=True, help_text='Fecha y hora de generación del reporte')),
                ('expires_at', models.DateTimeField(help_text='Fecha y hora de expiración del cache')),
                ('is_valid', models.BooleanField(default=True, help_text='Indica si el cache sigue siendo válido')),
            ],
            options={
                'verbose_name': 'Cache de Reporte',
                'verbose_name_plural': 'Cache de Reportes',
                'db_table': 'report_cache',
                'ordering': ['-generated_at'],
                'indexes': [models.Index(fields=['report_type'], name='idx_report_type'), models.Index(fields=['expires_at'], name='idx_report_expires'), models.Index(fields=['is_valid'], name='idx_report_valid')],
            },
        ),
        migrations.AddConstraint(
            model_name='reportcache',
            constraint=models.UniqueConstraint(condition=models.Q(('is_valid', True)), fields=('report_type', 'parameters'), name='unique_valid_report_cache'),
        ),
        migrations.AddField(
            model_name='reportschedule',
            name='created_by',
            field=models.ForeignKey(help_text='Usuario que creó el reporte programado', on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddIndex(
            model_name='reportaudit',
            index=models.Index(fields=['report_type'], name='idx_audit_report_type'),
        ),
        migrations.AddIndex(
            model_name='reportaudit',
            index=models.Index(fields=['action'], name='idx_audit_action'),
        ),
        migrations.AddIndex(
            model_name='reportaudit',
            index=models.Index(fields=['user'], name='idx_audit_user'),
        ),
        migrations.AddIndex(
            model_name='reportaudit',
            index=models.Index(fields=['created_at'], name='idx_audit_created'),
        ),
        migrations.AddIndex(
            model_name='reportaudit',
            index=models.Index(fields=['success'], name='idx_audit_success'),
        ),
        migrations.AddIndex(
            model_name='reportschedule',
            index=models.Index(fields=['status'], name='idx_schedule_status'),
        ),
        migrations.AddIndex(
            model_name='reportschedule',
            index=models.Index(fields=['next_generation'], name='idx_schedule_next'),
        ),
        migrations.AddIndex(
            model_name='reportschedule',
            index=models.Index(fields=['report_type'], name='idx_schedule_type'),
        ),
    ]
