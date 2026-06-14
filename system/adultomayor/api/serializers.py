from rest_framework import serializers
from ..domain.models import Solicitud
from django.contrib.auth import get_user_model
from core.auth.permissions import CanViewSensitiveData

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'role']

class SolicitudSerializer(serializers.ModelSerializer):
    presidente = UserSerializer(read_only=True)
    voluntarios = UserSerializer(many=True, read_only=True)
    adultos_mayores = UserSerializer(many=True, read_only=True)
    direccion = serializers.SerializerMethodField()  # Campo sensible con masking

    def get_direccion(self, obj):
        """Implementa privacidad por diseño: solo muestra dirección si autorizado."""
        request = self.context.get('request')
        if request and CanViewSensitiveData().has_object_permission(request, self, obj):
            return obj.direccion
        return "**** Dirección protegida ****"

    class Meta:
        model = Solicitud
        fields = [
            'id', 'titulo', 'descripcion', 'estado', 
            'cantidad_voluntarios', 'cantidad_beneficiarios', 
            'presidente', 'voluntarios', 'adultos_mayores', 'direccion', 'created_at'
        ]
        read_only_fields = ['id', 'estado', 'created_at']
