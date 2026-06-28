# Integración en Pipeline CI (GitHub Actions)

Este documento detalla la estructura propuesta para el manifiesto de GitHub Actions, encargada de auditar la calidad, formato y pruebas del código del proyecto en cada Push o Pull Request.

---

## 1. Manifiesto YAML (`.github/workflows/ci.yml`)

El siguiente workflow se define en la raíz del proyecto para ejecutarse automáticamente en la plataforma de GitHub.

```yaml
name: Integración Continua (CI)

on:
  push:
    branches: [ main, master, dev ]
  pull_request:
    branches: [ main, master, dev ]

jobs:
  # Job 1: Verificaciones y Pruebas del Backend (server)
  backend-ci:
    name: Backend CI (Lint, Format & Test)
    runs-on: ubuntu-latest
    steps:
      - name: Checkout del Repositorio
        uses: actions/checkout@v4

      - name: Configurar Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
          cache-dependency-path: server/package-lock.json

      - name: Instalar Dependencias
        run: npm ci
        working-directory: ./server

      - name: Ejecutar Migraciones de Prisma (Mock/SQLite)
        run: npx prisma generate
        working-directory: ./server

      - name: Ejecutar Linter (ESLint)
        run: npm run lint
        working-directory: ./server

      - name: Verificar Formato (Prettier)
        run: npm run format:check
        working-directory: ./server

      - name: Ejecutar Pruebas Unitarias e Integración
        run: npm run test:ci
        working-directory: ./server

  # Job 2: Verificaciones del Frontend (client)
  frontend-ci:
    name: Frontend CI (Lint & Format)
    runs-on: ubuntu-latest
    steps:
      - name: Checkout del Repositorio
        uses: actions/checkout@v4

      - name: Configurar Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
          cache-dependency-path: client/package-lock.json

      - name: Instalar Dependencias
        run: npm ci
        working-directory: ./client

      - name: Ejecutar Linter (ESLint)
        run: npm run lint
        working-directory: ./client

      - name: Verificar Formato (Prettier)
        run: npm run format:check
        working-directory: ./client
```

---

## 2. Explicación de los Pasos y Flujos de Control

* **Gatillos (`on`)**: El pipeline corre automáticamente al realizar cambios (`push`) o al abrir/actualizar solicitudes de integración (`pull_request`) en las ramas principales (`main`, `master`, `dev`).
* **Jobs en Paralelo**: Los jobs `backend-ci` y `frontend-ci` se ejecutan en paralelo para reducir el tiempo total de ejecución.
* **Mecanismo de Caché**: Utiliza `actions/setup-node` con `cache: 'npm'` apuntando al respectivo `package-lock.json`. Esto reduce significativamente los tiempos de ejecución al evitar descargar paquetes sin cambios.
* **Fallo Automático del Pipeline**: Si cualquiera de los comandos (`lint`, `format:check` o `test`) retorna un código de salida diferente de `0` (indicando fallos), el paso y el Job correspondiente se marcarán como fallidos. Esto impide que los merges se realicen con código defectuoso o mal formateado.
