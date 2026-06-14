from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

# Create your models here.

class Profile(models.Model):
    ROLES = (
        ('ADULTO_MAYOR', 'Adulto Mayor'),
        ('ESTUDIANTE_UCT', 'Estudiante UCT'),
        ('ADMINISTRADOR', 'Administrador'),
    )
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    rut = models.CharField(max_length=12, unique=True)
    rol = models.CharField(max_length=20, choices=ROLES)
    direccion = models.TextField(blank=True, null=True)  # Campo sensible, solo accesible con permisos

    def __str__(self):
        return f"{self.user.username} - {self.rol}"

class Solicitud(models.Model):
    ESTADOS = (
        ('DISPONIBLE', 'Disponible'),
        ('ASIGNADA', 'Asignada'),
        ('FINALIZADA', 'Finalizada'),
    )
    titulo = models.CharField(max_length=100)
    descripcion = models.TextField()
    presidente = models.ForeignKey(User, on_delete=models.CASCADE, related_name='solicitudes_creadas')
    voluntarios = models.ManyToManyField(User, blank=True, related_name='solicitudes_voluntariado')
    adultos_mayores = models.ManyToManyField(User, blank=True, related_name='solicitudes_recibidas')
    estado = models.CharField(max_length=20, choices=ESTADOS, default='DISPONIBLE')
    cantidad_presidentes = models.IntegerField(default=1)
    cantidad_voluntarios = models.IntegerField(default=1)
    cantidad_beneficiarios = models.IntegerField(default=1)
    direccion = models.TextField(blank=True, null=True)  # Campo sensible, protegido por permisos
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.titulo
