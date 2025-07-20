# clients/models.py - ACTUALIZADO con historial
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator, RegexValidator
from django.core.exceptions import ValidationError
import re

class Client(models.Model):
    TIPO_DOCUMENTO_CHOICES = [
        ('DNI', 'DNI'),
        ('pasaporte', 'Pasaporte'),
        ('carnet_extranjeria', 'Carnet de extranjería'),
    ]
    
    TIPO_PAGO_CHOICES = [
        ('efectivo', 'Efectivo'),
        ('billetera_digital', 'Billetera digital'),
        ('visa', 'Visa'),
    ]
    
    # Campos obligatorios
    nombres = models.CharField(
        max_length=100,
        help_text="Nombres del cliente"
    )
    
    apellidos = models.CharField(
        max_length=100,
        help_text="Apellidos del cliente"
    )
    
    tipo_documento = models.CharField(
        max_length=20,
        choices=TIPO_DOCUMENTO_CHOICES,
        help_text="Tipo de documento de identidad"
    )
    
    numero_documento = models.CharField(
        max_length=30,
        help_text="Número de documento de identidad"
    )
    
    numero_habitaciones_deseadas = models.PositiveIntegerField(
        validators=[
            MinValueValidator(1, message="Debe desear al menos 1 habitación"),
            MaxValueValidator(10, message="Máximo 10 habitaciones por reserva")
        ],
        help_text="Cantidad de habitaciones que desea reservar"
    )
    
    tipo_pago = models.CharField(
        max_length=20,
        choices=TIPO_PAGO_CHOICES,
        help_text="Tipo de pago seleccionado"
    )
    
    monto_pagado = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0.01, message="El monto debe ser mayor a 0")],
        help_text="Monto pagado por el cliente"
    )
    
    # Campos opcionales
    edad = models.PositiveIntegerField(
        blank=True,
        null=True,
        validators=[
            MinValueValidator(1, message="La edad debe ser mayor a 0"),
            MaxValueValidator(120, message="La edad debe ser menor a 120 años")
        ],
        help_text="Edad del cliente"
    )
    
    telefono = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        validators=[
            RegexValidator(
                regex=r'^\d{7,15}$',
                message="El teléfono debe contener entre 7 y 15 dígitos"
            )
        ],
        help_text="Número de teléfono del cliente"
    )
    
    direccion = models.TextField(
        max_length=200,
        blank=True,
        null=True,
        help_text="Dirección del cliente"
    )
    
    fecha_ingreso = models.DateTimeField(
        blank=True,
        null=True,
        help_text="Fecha y hora de ingreso"
    )
    
    fecha_salida = models.DateTimeField(
        blank=True,
        null=True,
        help_text="Fecha y hora de salida planeada"
    )
    
    fecha_salida_real = models.DateTimeField(
        blank=True,
        null=True,
        help_text="Fecha y hora real de salida (cuando se liberan las habitaciones)"
    )
    
    # Campos de auditoría
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'clients'
        verbose_name = 'Cliente'
        verbose_name_plural = 'Clientes'
        ordering = ['-created_at']
        
        # Sin constraint de unicidad estricta para permitir re-registros
        indexes = [
            models.Index(fields=['tipo_documento', 'numero_documento'], name='idx_client_documento'),
            models.Index(fields=['fecha_ingreso'], name='idx_client_fecha_ingreso'),
            models.Index(fields=['fecha_salida_real'], name='idx_client_fecha_salida_real'),
            models.Index(fields=['created_at'], name='idx_client_created_at'),
        ]
    
    def __str__(self):
        return f"{self.nombres} {self.apellidos} - {self.numero_documento}"
    
    def clean(self):
        """Validaciones personalizadas"""
        super().clean()
        
        # Validar formato del documento según tipo
        if self.tipo_documento and self.numero_documento:
            if self.tipo_documento == 'DNI':
                if not re.match(r'^\d{8}$', self.numero_documento):
                    raise ValidationError({
                        'numero_documento': 'El DNI debe tener exactamente 8 dígitos numéricos'
                    })
            elif self.tipo_documento in ['pasaporte', 'carnet_extranjeria']:
                if not re.match(r'^[A-Za-z0-9]{1,30}$', self.numero_documento):
                    raise ValidationError({
                        'numero_documento': 'El documento debe tener hasta 30 caracteres alfanuméricos'
                    })
        
        # Validar fecha de salida
        if self.fecha_salida and self.fecha_ingreso:
            if self.fecha_salida <= self.fecha_ingreso:
                raise ValidationError({
                    'fecha_salida': 'La fecha de salida debe ser posterior a la fecha de ingreso'
                })
    
    def save(self, *args, **kwargs):
        """Override save para ejecutar validaciones"""
        self.full_clean()
        super().save(*args, **kwargs)
    
    @property
    def nombre_completo(self):
        """Retorna el nombre completo del cliente"""
        return f"{self.nombres} {self.apellidos}"
    
    @property
    def documento_completo(self):
        """Retorna el documento con su tipo"""
        return f"{self.get_tipo_documento_display()}: {self.numero_documento}"
    
    @property
    def monto_formateado(self):
        """Retorna el monto formateado con símbolo de moneda"""
        return f"S/ {self.monto_pagado:.2f}"
    
    @property
    def tipo_pago_display_custom(self):
        """Retorna el tipo de pago formateado"""
        return self.get_tipo_pago_display()
    
    # ✅ NUEVOS MÉTODOS: Para facilitar las consultas de validación inteligente
    @property
    def esta_activo(self):
        """Determina si el cliente está actualmente hospedado"""
        return self.habitaciones_asignadas.filter(estado='activo').exists()
    
    @classmethod
    def get_cliente_con_documento(cls, tipo_documento, numero_documento):
        """Obtiene cliente existente con el mismo documento"""
        return cls.objects.filter(
            tipo_documento=tipo_documento,
            numero_documento=numero_documento
        ).first()
    
    @classmethod
    def tiene_cliente_activo_con_documento(cls, tipo_documento, numero_documento, exclude_id=None):
        """Verifica si existe un cliente activo con el mismo documento"""
        queryset = cls.objects.filter(
            tipo_documento=tipo_documento,
            numero_documento=numero_documento,
            habitaciones_asignadas__estado='activo'
        ).distinct()
        
        if exclude_id:
            queryset = queryset.exclude(id=exclude_id)
        
        return queryset.exists()


class ClientRoom(models.Model):
    """Modelo intermedio para relacionar clientes con habitaciones - CON HISTORIAL"""
    
    ESTADO_CHOICES = [
        ('activo', 'Activo'),           # Cliente está hospedado en esta habitación
        ('liberado', 'Liberado'),       # Cliente se retiró, habitación liberada
    ]
    
    client = models.ForeignKey(
        Client,
        on_delete=models.CASCADE,
        related_name='habitaciones_asignadas'
    )
    
    room = models.ForeignKey(
        'rooms.Room',
        on_delete=models.CASCADE,
        related_name='clients_asignados'
    )
    
    # ✅ NUEVO CAMPO: Estado de la asignación
    estado = models.CharField(
        max_length=20,
        choices=ESTADO_CHOICES,
        default='activo',
        help_text="Estado de la asignación cliente-habitación"
    )
    
    fecha_asignacion = models.DateTimeField(auto_now_add=True)
    
    # ✅ NUEVO CAMPO: Fecha cuando se liberó la habitación
    fecha_liberacion = models.DateTimeField(
        blank=True,
        null=True,
        help_text="Fecha y hora cuando se liberó esta habitación"
    )
    
    class Meta:
        db_table = 'client_rooms'
        verbose_name = 'Cliente-Habitación'
        verbose_name_plural = 'Cliente-Habitaciones'
        
        # Evitar que el mismo cliente tenga la misma habitación duplicada EN ESTADO ACTIVO
        constraints = [
            models.UniqueConstraint(
                fields=['client', 'room', 'estado'],
                condition=models.Q(estado='activo'),
                name='unique_client_room_active'
            )
        ]
        
        indexes = [
            models.Index(fields=['client'], name='idx_clientroom_client'),
            models.Index(fields=['room'], name='idx_clientroom_room'),
            models.Index(fields=['estado'], name='idx_clientroom_estado'),
            models.Index(fields=['fecha_asignacion'], name='idx_clientroom_fecha'),
        ]
    
    def __str__(self):
        estado_display = f" ({self.get_estado_display()})" if self.estado == 'liberado' else ""
        return f"{self.client.nombre_completo} - Habitación {self.room.numero}{estado_display}"