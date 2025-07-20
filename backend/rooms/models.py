# rooms/models.py
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError

class Room(models.Model):
    TIPO_CHOICES = [
        ('simple', 'Simple'),
        ('doble', 'Doble'),
        ('triple', 'Triple'),
        ('familiar', 'Familiar (4 camas)'),
    ]
    
    ESTADO_CHOICES = [
        ('disponible', 'Disponible'),
        ('ocupado', 'Ocupado'),           # Nuevo estado
        ('sucio', 'Sucio'),
        ('mantenimiento', 'En mantenimiento'),
    ]
    
    numero = models.PositiveIntegerField(
        unique=True,
        validators=[
            MinValueValidator(1, message="El número de habitación debe ser mayor a 0"),
            MaxValueValidator(9999, message="El número de habitación no puede tener más de 4 dígitos")
        ],
        help_text="Número de habitación (máximo 4 dígitos)"
    )
    
    tipo = models.CharField(
        max_length=20,
        choices=TIPO_CHOICES,
        help_text="Tipo de habitación"
    )
    
    precio_noche = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        validators=[MinValueValidator(0.01, message="El precio debe ser mayor a 0")],
        help_text="Precio por noche en soles"
    )
    
    estado = models.CharField(
        max_length=20,
        choices=ESTADO_CHOICES,
        default='disponible',
        help_text="Estado actual de la habitación"
    )
    
    descripcion = models.TextField(
        blank=True,
        null=True,
        max_length=500,
        help_text="Descripción opcional de la habitación"
    )
    
    # Campos de auditoría
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'rooms'
        verbose_name = 'Habitación'
        verbose_name_plural = 'Habitaciones'
        ordering = ['numero']
        
    def __str__(self):
        return f"Habitación {self.numero} - {self.get_tipo_display()}"
    
    def clean(self):
        """Validaciones personalizadas"""
        super().clean()
        
        # Validar que el número sea positivo
        if self.numero and self.numero <= 0:
            raise ValidationError({'numero': 'El número de habitación debe ser mayor a 0'})
            
        # Validar precio
        if self.precio_noche and self.precio_noche <= 0:
            raise ValidationError({'precio_noche': 'El precio debe ser mayor a 0'})
    
    def save(self, *args, **kwargs):
        """Override save para ejecutar validaciones"""
        self.full_clean()
        super().save(*args, **kwargs)
    
    @property
    def esta_disponible(self):
        """Retorna True si la habitación está disponible"""
        return self.estado == 'disponible'
    
    @property
    def esta_ocupada(self):
        """Retorna True si la habitación está ocupada"""
        return self.estado == 'ocupado'
    
    @property
    def precio_formateado(self):
        """Retorna el precio formateado con símbolo de moneda"""
        return f"S/ {self.precio_noche:.2f}"
    
    @property
    def tipo_display_custom(self):
        """Retorna el tipo formateado"""
        return self.get_tipo_display()
    
    @property
    def estado_display_custom(self):
        """Retorna el estado formateado"""
        return self.get_estado_display()
    
    def cambiar_estado(self, nuevo_estado):
        """Método para cambiar el estado de la habitación con validación"""
        estados_validos = [choice[0] for choice in self.ESTADO_CHOICES]
        if nuevo_estado not in estados_validos:
            raise ValueError(f"Estado inválido. Estados válidos: {', '.join(estados_validos)}")
        
        estado_anterior = self.estado
        self.estado = nuevo_estado
        self.save()
        return f"Estado cambiado de {estado_anterior} a {nuevo_estado}"
    
    def ocupar(self):
        """Método específico para marcar la habitación como ocupada"""
        if self.estado != 'disponible':
            raise ValueError("Solo se pueden ocupar habitaciones disponibles")
        return self.cambiar_estado('ocupado')
    
    def liberar(self):
        """Método específico para liberar la habitación (cambiarla a sucio)"""
        if self.estado != 'ocupado':
            raise ValueError("Solo se pueden liberar habitaciones ocupadas")
        return self.cambiar_estado('sucio')
    
    def limpiar(self):
        """Método específico para marcar la habitación como disponible después de limpiarla"""
        if self.estado != 'sucio':
            raise ValueError("Solo se pueden limpiar habitaciones sucias")
        return self.cambiar_estado('disponible')
    
    def mantenimiento(self):
        """Método específico para poner la habitación en mantenimiento"""
        return self.cambiar_estado('mantenimiento')
    
    def finalizar_mantenimiento(self):
        """Método específico para finalizar el mantenimiento"""
        if self.estado != 'mantenimiento':
            raise ValueError("Solo se puede finalizar mantenimiento de habitaciones en mantenimiento")
        return self.cambiar_estado('disponible')