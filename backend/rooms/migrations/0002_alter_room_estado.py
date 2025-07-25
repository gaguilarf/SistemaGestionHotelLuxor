# Generated by Django 5.0.1 on 2025-07-12 07:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('rooms', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='room',
            name='estado',
            field=models.CharField(choices=[('disponible', 'Disponible'), ('ocupado', 'Ocupado'), ('sucio', 'Sucio'), ('mantenimiento', 'En mantenimiento')], default='disponible', help_text='Estado actual de la habitación', max_length=20),
        ),
    ]
