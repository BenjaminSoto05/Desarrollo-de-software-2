import logging
from django.utils import timezone

logger = logging.getLogger('core.audit')

def log_sensitive_access(user, obj, field, action):
    """
    Registra accesos a datos sensibles para auditoría.
    Cumple con Ley 19.628 y privacidad por diseño.
    """
    logger.info(
        f"Auditoría: Usuario {user.email} ({user.role}) accedió a campo '{field}' "
        f"en {obj.__class__.__name__} ID {obj.id} mediante acción '{action}' "
        f"el {timezone.now()}"
    )