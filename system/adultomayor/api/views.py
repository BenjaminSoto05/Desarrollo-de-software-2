from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from drf_spectacular.utils import extend_schema, OpenApiParameter
from .serializers import SolicitudSerializer
from ..infrastructure.repositories import SolicitudRepository
from ..application.services import crear_solicitud_desde_wizard, accept_task, close_task
from core.auth.permissions import CanPublishSolicitud, CanAcceptTask, CanCloseTask, CanViewSensitiveData

class SolicitudViewSet(viewsets.ModelViewSet):
    """
    API REST para la gestión de Solicitudes (RNF-MAN-02).
    Manejo centralizado de permisos y abstracción mediante Repository Pattern.
    """
    serializer_class = SolicitudSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Delegate to Repository Pattern (Clean Architecture)
        return SolicitudRepository.get_all_disponibles()

    def get_permissions(self):
        """Permisos específicos por acción."""
        if self.action == 'create':
            self.permission_classes = [permissions.IsAuthenticated, CanPublishSolicitud]
        elif self.action == 'accept':
            self.permission_classes = [permissions.IsAuthenticated, CanAcceptTask]
        elif self.action == 'close':
            self.permission_classes = [permissions.IsAuthenticated, CanCloseTask]
        return super().get_permissions()

    @extend_schema(
        summary="Crear una nueva Solicitud",
        description="Crea una solicitud delegando la lógica de negocio a la capa de Servicios."
    )
    def create(self, request, *args, **kwargs):
        # Simulamos que la data viene en el formato que espera el wizard para reusar el servicio
        # En la vida real el serializer validaría primero y pasaría un DTO limpio al servicio
        try:
            # Reutilizando el Service Layer (DRY)
            solicitud = crear_solicitud_desde_wizard(request.user, request.data)
            serializer = self.get_serializer(solicitud)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        summary="Aceptar una tarea",
        description="Permite a un Estudiante UCT aceptar una solicitud disponible."
    )
    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        solicitud = self.get_object()
        # Lógica delegada al servicio
        try:
            accept_task(request.user, solicitud)
            return Response({'message': 'Tarea aceptada exitosamente.'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        summary="Cerrar una tarea",
        description="Permite cerrar una tarea asignada."
    )
    @action(detail=True, methods=['post'])
    def close(self, request, pk=None):
        solicitud = self.get_object()
        try:
            close_task(request.user, solicitud)
            return Response({'message': 'Tarea cerrada exitosamente.'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
