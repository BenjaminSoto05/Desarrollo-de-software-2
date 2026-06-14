from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from .domain.models import Profile, Solicitud

class UserRegisterForm(UserCreationForm):
    rut = forms.CharField(max_length=12, required=True, widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'RUT'}))
    rol = forms.ChoiceField(choices=Profile.ROLES, widget=forms.Select(attrs={'class': 'form-select'}))
    consentimiento_privacidad = forms.BooleanField(
        required=True,
        label="Acepto el tratamiento de mis datos personales según la Ley 19.628.",
        help_text="Tus datos sensibles (RUT, Dirección) solo serán accesibles bajo estricta necesidad por voluntarios asignados.",
        widget=forms.CheckboxInput(attrs={'class': 'form-check-input'})
    )

    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'email']
        widgets = {
            'username': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Nombre de usuario'}),
            'first_name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Nombre'}),
            'last_name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Apellido'}),
            'email': forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'Email'}),
        }

    def clean_rut(self):
        rut = self.cleaned_data.get('rut')
        if Profile.objects.filter(rut=rut).exists():
            raise forms.ValidationError("Este RUT ya está registrado.")
        return rut

    def clean_username(self):
        username = self.cleaned_data.get('username')
        if User.objects.filter(username=username).exists():
            raise forms.ValidationError("Este nombre de usuario ya está en uso.")
        return username

    def clean(self):
        cleaned_data = super().clean()
        rol = cleaned_data.get('rol')
        email = cleaned_data.get('email')

        if rol == 'VOLUNTARIO' and email and not email.endswith('@alu.uct.cl'):
            raise forms.ValidationError(
                "Para registrarse como voluntario, debe usar un correo con el dominio '@alu.uct.cl'."
            )

        return cleaned_data

    def save(self, commit=True):
        user = super().save(commit=False)
        if commit:
            user.save()
            Profile.objects.create(user=user, rut=self.cleaned_data['rut'], rol=self.cleaned_data['rol'])
        return user

class SolicitudForm(forms.ModelForm):
    class Meta:
        model = Solicitud
        fields = ['titulo', 'descripcion', 'cantidad_voluntarios', 'cantidad_beneficiarios']
        widgets = {
            'titulo': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Título de la solicitud'}),
            'descripcion': forms.Textarea(attrs={'class': 'form-control', 'placeholder': 'Descripción detallada', 'rows': 4}),
            'cantidad_voluntarios': forms.NumberInput(attrs={'class': 'form-control', 'min': 1}),
            'cantidad_beneficiarios': forms.NumberInput(attrs={'class': 'form-control', 'min': 1}),
        }

class SolicitudPaso2Form(forms.Form):
    descripcion = forms.CharField(
        widget=forms.Textarea(attrs={
            'class': 'w-full p-4 text-xl border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-amber-400 focus:border-blue-600',
            'rows': 5,
            'placeholder': 'Ejemplo: Necesito ayuda para ir al supermercado el martes en la mañana...',
            'aria-label': 'Descripción detallada de la ayuda que necesita'
        }),
        label="Cuéntanos más sobre lo que necesitas",
        required=True
    )
