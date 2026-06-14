import os
from celery import Celery

# Establecer el módulo de settings predeterminado para celery
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('config')

# Leer configuración de celery desde django settings (namespaces "CELERY_")
app.config_from_object('django.conf:settings', namespace='CELERY')

# Auto-descubrir tareas asíncronas en todas las apps instaladas
app.autodiscover_tasks()

@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
