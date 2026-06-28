# Configuración de ESLint

Este documento detalla las decisiones técnicas detrás del diseño de las configuraciones de ESLint para el frontend y el backend, garantizando buenas prácticas y compatibilidad con Prettier.

---

## 1. Configuración del Backend (`server/eslint.config.js`)

Se adoptó la arquitectura de configuración moderna **Flat Config** de ESLint v9/v10.

### Código de Configuración Propuesto
```javascript
const js = require('@eslint/js');
const globals = require('globals');
const eslintConfigPrettier = require('eslint-config-prettier');

module.exports = [
  js.configs.recommended,
  eslintConfigPrettier,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {
      'no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
      'no-console': 'off',
    },
  },
];
```

### Explicación de Reglas y Decisiones
* **`js.configs.recommended`**: Activa las reglas recomendadas de ESLint para prevenir errores comunes (variables no definidas, asignaciones duplicadas, etc.).
* **`eslintConfigPrettier`**: Desactiva todas las reglas estilísticas de ESLint que puedan colisionar con Prettier. Esto garantiza que ESLint solo reporte errores reales de lógica y no de sangría o comillas.
* **`globals.node` y `globals.jest`**: Permite el uso de variables de entorno globales de Node.js (como `module`, `require`, `process`) y de Jest (como `describe`, `test`, `expect`, `jest`) en los archivos de pruebas sin lanzar advertencias de "no definido".
* **`no-unused-vars: ['error', { 'argsIgnorePattern': '^_' }]`**: Lanza un error al declarar variables sin usar, pero permite omitir argumentos de funciones si empiezan con un guion bajo (útil en middleware de Express como `(err, req, res, _next) => {}`).

---

## 2. Configuración del Frontend (`client/eslint.config.js`)

El frontend ya contaba con ESLint preconfigurado por Vite. Se realizó una refactorización menor para incorporar Prettier y evitar conflictos estilísticos.

### Código de Configuración Actualizado
```javascript
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'
import eslintConfigPrettier from 'eslint-config-prettier'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  eslintConfigPrettier,
])
```

### Explicación del Cambio
* Se importa `eslint-config-prettier` y se añade al final de la definición del arreglo. Esto anula las reglas de formato de React y ESLint básico que colisionarían con el formateo automático de Prettier, asegurando consistencia absoluta al ejecutar el pipeline de CI.
