import multiprocessing

# Dirección IP y Puerto donde Gunicorn escuchará las peticiones (desde Nginx)
bind = "0.0.0.0:8000"

# RNF-REN-02: Escalabilidad y Concurrencia
# Fórmula recomendada: (Cores del Servidor x 2) + 1
workers = multiprocessing.cpu_count() * 2 + 1

# Clase de worker. Usamos 'gthread' para manejar conexiones concurrentes ligeras.
worker_class = "gthread"
threads = 4

# Límite de solicitudes por worker para evitar fugas de memoria en Django
max_requests = 1000
max_requests_jitter = 50

# RNF-DIS-01: Alta Disponibilidad
# Tiempo máximo antes de reiniciar un worker bloqueado
timeout = 30

# Mantener conexiones TCP activas ("keep-alive")
keepalive = 2

# Logging
accesslog = "-"
errorlog = "-"
loglevel = "info"
