# Reporte de Incidencias: Integración de SonarQube UCT

**Fecha:** 23 de Junio de 2026  
**Proyecto:** UCT-Vínculo Mayor (`Desarrollo-de-software-2`)  
**Servidor:** `https://sonarqube.inf.uct.cl`

---

## 1. Resumen Ejecutivo
El análisis de código estático (SonarScanner) funciona de manera local y en integración continua (GitHub Actions), compilando el proyecto y generando un reporte muy ligero (aprox. 394 KB). Sin embargo, la **fase de subida del reporte al servidor de la universidad falla invariablemente**.

Tras múltiples pruebas de diagnóstico exhaustivas de red, se concluye que **el Firewall/Proxy Inverso del servidor de la universidad rechaza activamente las conexiones de subida (`POST`) provenientes de redes externas**, cortando abruptamente la conexión TCP (`ECONNRESET` / `REFUSED_STREAM`).

---

## 2. Diagnóstico y Pruebas Realizadas

A lo largo del proceso de integración, se detectaron errores de red al intentar enviar el archivo final al endpoint `/api/ce/submit`. Para descartar fallas en nuestro código, aplicamos las siguientes soluciones progresivas:

### Intento 1: Optimización del tamaño del reporte
- **Hipótesis:** El servidor rechazaba la subida por exceso de tamaño (límite de `client_max_body_size` en Nginx).
- **Acción:** Se excluyeron todos los archivos no relacionados a código (PDFs, Markdown, imágenes) y se desactivó el sensor de control de versiones (`-Dsonar.scm.disabled=true`).
- **Resultado:** El reporte se redujo de varios Megabytes a apenas **394 KB**. El error persistió con un Time-Out exacto a los 5 minutos y un error `PROTOCOL_ERROR` de HTTP/2.

### Intento 2: Cambio de entorno (GitHub Actions IP Block)
- **Hipótesis:** La red de la UCT bloquea las direcciones IP públicas de los servidores de GitHub Actions por políticas de seguridad.
- **Acción:** Se ejecutó el escáner localmente desde el computador del alumno (red residencial).
- **Resultado:** La descarga de plugins desde el servidor funcionó (peticiones `GET`), pero al intentar subir el reporte final (petición `POST`), el servidor abortó la conexión (`java.net.SocketTimeoutException` y `StreamResetException: REFUSED_STREAM`).

### Intento 3: Bypass del protocolo HTTP/2 (WAF Evasion)
- **Hipótesis:** El proxy de la universidad (ej. Nginx) tiene un bug o regla estricta al manejar subidas pesadas bajo el protocolo HTTP/2, o bloquea cabeceras dinámicas como `Transfer-Encoding: chunked` comunes en clientes Java (OkHttp).
- **Acción:** Se desarrolló y ejecutó un servidor puente (Proxy Local) en Node.js para:
  1. Forzar el downgrade de la comunicación a HTTP/1.1 clásico.
  2. Almacenar el reporte en memoria para calcular un `Content-Length` estático.
  3. Eliminar cabeceras problemáticas para firewalls (`Transfer-Encoding` y `Expect: 100-continue`).
- **Resultado:** El servidor de la UCT cortó el socket de inmediato devolviendo un error físico de red: **`ECONNRESET` (socket hang up)** en el momento exacto en que se inició el método `POST`.

---

## 3. Conclusión Técnica

El proyecto local está perfectamente configurado (pasando 109 tests al 100% de cobertura). **El problema radica exclusivamente en la infraestructura de red del servidor `sonarqube.inf.uct.cl`.**

El firewall o proxy web de la universidad está configurado para:
- Permitir peticiones de lectura (`GET`) desde redes externas (permitiendo ver la página web).
- **Bloquear (cortar el socket) cualquier petición de escritura masiva (`POST /api/ce/submit`)** si proviene de una IP externa a la red local de la universidad.

### 4. Alternativas de Solución sugeridas

Para lograr enviar el análisis al servidor, el alumno debe realizar una de las siguientes acciones:
1. **Conexión Interna:** Conectarse a la VPN institucional de la universidad (si existe) y ejecutar el comando localmente.
2. **Conexión Presencial:** Ejecutar el comando desde el campus conectándose a la red eduroam o red de laboratorios.
3. **Revisión TI:** Que el equipo de TI de la universidad revise las reglas del WAF / Nginx para el endpoint `/api/ce/submit` y permita subidas desde IPs externas para los alumnos que utilicen integraciones automatizadas (GitHub Actions).

---
**Comando final de escaneo local a utilizar una vez en la red de la UCT:**
```powershell
$env:SONAR_TOKEN="TU_TOKEN_AQUI"
$env:SONAR_HOST_URL="https://sonarqube.inf.uct.cl"
npx sonarqube-scanner
```
