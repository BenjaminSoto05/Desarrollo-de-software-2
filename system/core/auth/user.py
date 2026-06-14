from django.contrib.auth.models import AbstractUser
from django.db import models
from .managers import CustomUserManager

class User(AbstractUser):
    """
    Custom User model con rol automático basado en dominio de email.
    Implementa seguridad y privacidad por diseño.
    """
    ROLES = (
        ('ADULTO_MAYOR', 'Adulto Mayor'),
        ('ESTUDIANTE_UCT', 'Estudiante UCT'),
        ('ADMINISTRADOR', 'Administrador'),
    )

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLES, blank=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    class Meta:
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'

    def __str__(self):
        return f"{self.email} - {self.get_role_display()}"

    def clean(self):
        """Validación adicional para prevenir modificación manual de rol."""
        super().clean()
        # El rol se asigna automáticamente en el manager, no permitir edición manual
        if self.pk and self.role:  # Si ya existe, no cambiar rol
            original = User.objects.get(pk=self.pk)
            if original.role != self.role:
                raise ValidationError("El rol no puede modificarse manualmente.")

    def has_role(self, role):
        """Método helper para verificar rol."""
        return self.role == role