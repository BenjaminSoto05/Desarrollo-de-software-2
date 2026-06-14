from rest_framework import permissions
from django.core.exceptions import PermissionDenied

class IsAdultoMayor(permissions.BasePermission):
    """
    Permiso para usuarios con rol Adulto Mayor.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.has_role('ADULTO_MAYOR')

class IsEstudianteUCT(permissions.BasePermission):
    """
    Permiso para usuarios con rol Estudiante UCT.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.has_role('ESTUDIANTE_UCT')

class IsAdministrador(permissions.BasePermission):
    """
    Permiso para usuarios con rol Administrador.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.has_role('ADMINISTRADOR')

class CanPublishSolicitud(permissions.BasePermission):
    """
    Permiso para publicar solicitudes (solo Adulto Mayor).
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.has_role('ADULTO_MAYOR')

class CanAcceptTask(permissions.BasePermission):
    """
    Permiso para aceptar tareas (solo Estudiante UCT).
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.has_role('ESTUDIANTE_UCT')

class CanCloseTask(permissions.BasePermission):
    """
    Permiso para cerrar tareas (Adulto Mayor o Estudiante UCT asignado).
    """
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        # Adulto Mayor puede cerrar si es el presidente
        if request.user.has_role('ADULTO_MAYOR') and obj.presidente == request.user:
            return True
        # Estudiante UCT puede cerrar si está asignado
        if request.user.has_role('ESTUDIANTE_UCT') and request.user in obj.voluntarios.all():
            return True
        return False

class CanModerateContent(permissions.BasePermission):
    """
    Permiso para moderar contenido (solo Administrador).
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.has_role('ADMINISTRADOR')

class CanGenerateCertificate(permissions.BasePermission):
    """
    Permiso para generar certificados (Estudiante UCT emite, Administrador valida).
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.has_role('ESTUDIANTE_UCT') or request.user.has_role('ADMINISTRADOR')
        )

class CanViewSensitiveData(permissions.BasePermission):
    """
    Permiso para ver datos sensibles como dirección (solo cuando asignado a tarea).
    """
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        # Solo mostrar dirección si la tarea está asignada y el usuario es el voluntario asignado
        if obj.estado == 'ASIGNADA' and request.user in obj.voluntarios.all():
            return True
        return False