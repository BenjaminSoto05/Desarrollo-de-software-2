from ..domain.models import Solicitud

class SolicitudRepository:
    """
    Repository Pattern: Abstrae las consultas directas al ORM de Django.
    Si alguna vez la base de datos o el modelo cambia, solo se modifica esta clase,
    manteniendo la capa de Aplicación (Services) intacta.
    """
    
    @staticmethod
    def get_all_disponibles():
        # Utiliza optimizaciones (select_related, prefetch_related) para evitar N+1 queries
        return Solicitud.objects.filter(estado='DISPONIBLE') \
                                .select_related('presidente') \
                                .prefetch_related('voluntarios', 'adultos_mayores') \
                                .order_by('-created_at')

    @staticmethod
    def get_by_id(solicitud_id):
        return Solicitud.objects.filter(id=solicitud_id).first()

    @staticmethod
    def get_by_presidente(user):
        return Solicitud.objects.filter(presidente=user).order_by('-created_at')
