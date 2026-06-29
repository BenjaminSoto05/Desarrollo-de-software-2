# Plan de Implementación: Lint y Format

Este documento describe el plan de implementación detallado para incorporar las herramientas de ESLint y Prettier en el proyecto, estructurando la ejecución de forma incremental y segura.

---

## 1. Plan de Trabajo e Hitos

| Prioridad | Archivo | Cambio requerido | Complejidad | Riesgo |
| :--- | :--- | :--- | :--- | :--- |
| **Alta** | `server/package.json` | Instalar dependencias (`eslint`, `prettier`, etc.) y configurar scripts. | Baja | Bajo |
| **Alta** | `server/eslint.config.js` | Crear configuración Flat de ESLint para Node.js y CommonJS. | Media | Bajo |
| **Alta** | `server/.prettierrc` | Crear reglas de formateo para backend. | Baja | Bajo |
| **Alta** | `client/package.json` | Instalar `prettier`, `eslint-config-prettier` y scripts de formato. | Baja | Bajo |
| **Alta** | `client/.prettierrc` | Crear reglas de formateo consistentes con backend. | Baja | Bajo |
| **Alta** | `client/eslint.config.js` | Integrar `eslint-config-prettier` en la configuración de Vite. | Baja | Bajo |
| **Alta** | `.github/workflows/ci.yml` | Implementar pipeline en GitHub Actions para validar Lint y Format. | Media | Bajo |
| **Media** | Código fuente (`src/`) | Ejecutar `npm run format` y corregir advertencias estilísticas. | Media | Medio |


---

## 2. Detalle por Componente

### Backend (`server/`)
1. **Instalación**:
   ```bash
   npm install --save-dev eslint prettier eslint-config-prettier globals @eslint/js
   ```
   *Justificación*: `eslint` analiza bugs lógicos y estilo, `prettier` formatea el estilo con opiniones estrictas, y `eslint-config-prettier` desactiva reglas conflictivas de ESLint. `globals` define los entornos (Node, Jest).
2. **Configuración**:
   - Crear `eslint.config.js` exportando una configuración Flat que configure el entorno `commonjs`, `globals.node` y `globals.jest`.
   - Crear `.prettierrc` con comillas simples, punto y coma, tabulación de 2 espacios y fin de línea en `auto`.
3. **Scripts en `package.json`**:
   - `"lint": "eslint src/"`
   - `"format": "prettier --write src/"`
   - `"format:check": "prettier --check src/"`

### Frontend (`client/`)
1. **Instalación**:
   ```bash
   npm install --save-dev prettier eslint-config-prettier
   ```
   *Justificación*: Se reutiliza el linter existente pero agregamos Prettier para consistencia inter-proyecto.
2. **Configuración**:
   - Crear `client/.prettierrc` compartiendo la misma estructura que el backend para garantizar consistencia.
   - Editar `client/eslint.config.js` añadiendo `eslintConfigPrettier` como el último elemento del arreglo de configuración.
3. **Scripts en `package.json`**:
   - `"format": "prettier --write src/"`
   - `"format:check": "prettier --check src/"`

---

## 3. Integración en Integración Continua (CI)

Una vez completadas las fases en local, el pipeline de CI implementado en GitHub Actions validará de manera automatizada:
1. Clonación del repositorio.
2. Caché de dependencias.
3. Ejecución de `npm run lint` y `npm run format:check` tanto en frontend como en backend.
4. Bloqueo de combinaciones de código a ramas protegidas en caso de fallos.
