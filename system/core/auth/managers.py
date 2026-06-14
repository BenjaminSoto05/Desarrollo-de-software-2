from django.contrib.auth.models import BaseUserManager
from django.core.exceptions import ValidationError
from django.core.validators import validate_email

class CustomUserManager(BaseUserManager):
    """
    Custom manager para User con validación automática de rol basado en dominio de email.
    Implementa privacidad por diseño y seguridad en registro.
    """

    def _validate_email_domain(self, email):
        """Valida el dominio del email para asignar rol automáticamente."""
        try:
            validate_email(email)
        except ValidationError:
            raise ValidationError("Email inválido.")

        if email.endswith('@uct.cl'):
            return 'ESTUDIANTE_UCT'
        else:
            return 'ADULTO_MAYOR'

    def _create_user(self, email, password, **extra_fields):
        """Método base para crear usuario con email obligatorio."""
        if not email:
            raise ValueError('El email es obligatorio')
        email = self.normalize_email(email)

        # Asignar rol automáticamente basado en dominio
        role = self._validate_email_domain(email)
        extra_fields.setdefault('role', role)

        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        """Crea un usuario regular con rol automático."""
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        """Crea un superusuario con rol ADMINISTRADOR."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'ADMINISTRADOR')

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self._create_user(email, password, **extra_fields)