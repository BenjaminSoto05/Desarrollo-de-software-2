from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('register/', views.register, name='register'),
    path('solicitudes/', views.solicitudes_list, name='solicitudes_list'),
    path('eliminar_cuenta/', views.eliminar_cuenta, name='eliminar_cuenta'),
    path('solicitar-ayuda/paso1/', views.solicitud_paso1, name='solicitud_paso1'),
    path('solicitar-ayuda/paso2/', views.solicitud_paso2, name='solicitud_paso2'),
    path('solicitar-ayuda/paso3/', views.solicitud_paso3, name='solicitud_paso3'),
]
