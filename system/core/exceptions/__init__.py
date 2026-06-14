from django.core.exceptions import PermissionDenied

class RoleValidationError(ValueError):
    """Error cuando el rol no es válido o no puede asignarse."""
    pass

class SensitiveDataAccessError(PermissionDenied):
    """Error cuando se intenta acceder a datos sensibles sin permisos."""
    pass

class TaskAssignmentError(ValueError):
    """Error en la asignación de tareas."""
    pass