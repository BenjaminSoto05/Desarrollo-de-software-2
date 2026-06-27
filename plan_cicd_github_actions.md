# Plan de Implementación: Tarjeta 5 - Pipeline CI/CD con GitHub Actions

## 1. Resumen y Contexto
La Tarjeta 5 requiere implementar un Pipeline completo de CI/CD (Continuous Integration / Continuous Deployment) mediante GitHub Actions. 
Actualmente, el repositorio cuenta con un archivo `build.yml` que solo realiza la fase de Integración Continua (CI), pero le falta la fase de Despliegue (CD) y no realiza la compilación del frontend (Vite build). Además, el análisis de SonarQube ha presentado problemas por el firewall de la universidad.

## 2. Decisiones Importantes (¡Necesito tu visto bueno!)

**A. Destino de Despliegue (CD)**
Dado que el proyecto tiene un `Dockerfile` que empaqueta tanto el Backend como el Frontend en un solo contenedor, la mejor forma de implementar el "Continuous Deployment" sin gastar dinero es **construir y subir automáticamente esta imagen de Docker a GitHub Container Registry (GHCR)**. 
De esta forma, cualquier servidor (Render, Railway, VPS de la UCT) podrá descargar tu aplicación completa con un solo comando. *¿Estás de acuerdo con utilizar GHCR como el entregable de despliegue en tu Pipeline?*

**B. Fallo de SonarQube**
Como vimos antes, el firewall de la universidad bloquea la conexión de SonarQube. Para evitar que el Pipeline falle por completo y bloquee la creación de tu imagen Docker, sugiero añadir una regla de tolerancia a fallos (`continue-on-error: true`) al paso de SonarQube. Así el análisis se intentará, pero si la UCT lo bloquea, el Pipeline seguirá adelante y será exitoso. *¿Te parece bien?*

## 3. Cambios Propuestos

Vamos a crear el archivo `.github/workflows/ci-cd.yml` reemplazando el antiguo `build.yml`. Este tendrá dos etapas principales:

### Etapa 1: CI (Integración Continua)
- Configura Node.js v22.
- Instala dependencias para Backend y Frontend.
- Ejecuta `npm run lint` en ambas partes.
- **[NUEVO]** Compila el Frontend (`npm run build`) para verificar que no hay errores de sintaxis en React.
- **[NUEVO]** Ejecuta `npx prisma generate` en el Backend.
- Ejecuta las 181 pruebas unitarias del backend (`npm test`).
- Ejecuta SonarQube (con tolerancia a fallos).

### Etapa 2: CD (Despliegue Continuo)
- Esta etapa **solo** se ejecutará si la Etapa 1 fue 100% exitosa y si estás en la rama `main` o `dev-Benjamin`.
- Inicia sesión automáticamente en el registro de contenedores de GitHub.
- Toma tu `Dockerfile` y construye la imagen completa del proyecto.
- Sube la imagen a `ghcr.io/tu-usuario/vinculo-mayor:latest`.
