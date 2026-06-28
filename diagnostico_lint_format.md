# Diagnóstico Técnico: Lint y Format

Este documento presenta el diagnóstico técnico del repositorio tras evaluar la calidad del código, el formato y la preparación para la Integración Continua (CI).

---

## 1. Problemas Detectados

### Problema 1: Ausencia Completa de ESLint y Prettier en el Backend (`server/`)
* **Descripción**: El backend del proyecto no cuenta con ninguna herramienta de análisis de código estático (Linter) ni formateador automático de estilo configurado en sus dependencias de desarrollo ni en sus archivos de configuración.
* **Evidencia**:
  * **Archivo**: [package.json](file:///c:/Users/Kuro_Waza/.antigravity-ide/Desarrollo-de-software-2/server/package.json)
  * **Ruta**: `server/package.json`
  * **Línea aproximada**: Secciones `devDependencies` y `scripts` (Líneas 6-17 y 40-44).
  * **Fragmento relevante**:
    ```json
    "devDependencies": {
      "jest": "^30.4.2",
      "prisma": "^6.9.0",
      "supertest": "^7.2.2"
    }
    ```
    No existen configuraciones para `eslint` o `prettier` ni scripts asociados.
* **Impacto**:
  * **Calidad del código**: Alta probabilidad de introducir bugs silenciosos (variables no declaradas, importaciones redundantes, etc.).
  * **Mantenibilidad**: Estilo de codificación inconsistente entre diferentes archivos y desarrolladores.
  * **Pipeline CI**: Imposibilidad de validar la calidad del código del backend antes de realizar un merge, violando la rúbrica.
  * **Cumplimiento de la rúbrica**: Reprobación del criterio "Pipeline CI: Lint y Format" para el componente backend.
* **Solución propuesta**: Instalar `eslint`, `prettier` y `eslint-config-prettier` como dependencias de desarrollo en `server/`. Configurar `eslint.config.js` y `.prettierrc`, y agregar los scripts `lint`, `format` y `format:check`.
* **Prioridad**: Alta

---

### Problema 2: Ausencia de Prettier y Potenciales Conflictos de Formato en el Frontend (`client/`)
* **Descripción**: Aunque el frontend cuenta con ESLint, no tiene instalado Prettier para el formateo consistente del código. Esto puede provocar discrepancias de estilo entre el backend y frontend, y conflictos entre reglas de ESLint y el formato manual.
* **Evidencia**:
  * **Archivo**: [package.json](file:///c:/Users/Kuro_Waza/.antigravity-ide/Desarrollo-de-software-2/client/package.json)
  * **Ruta**: `client/package.json`
  * **Línea aproximada**: Secciones `devDependencies` (Líneas 18-30).
  * **Fragmento relevante**:
    ```json
    "devDependencies": {
      "@eslint/js": "^10.0.1",
      "eslint": "^10.3.0",
      "eslint-plugin-react-hooks": "^7.1.1",
      "eslint-plugin-react-refresh": "^0.5.2",
      ...
    }
    ```
    No se encuentra listado `prettier` ni la configuración correspondiente.
* **Impacto**:
  * **Calidad del código**: Errores menores de legibilidad e inconsistencia en sangrías, uso de comillas y saltos de línea.
  * **Mantenibilidad**: Dificultad para leer y revisar diffs en Pull Requests debido a cambios de formato ruidosos.
  * **Pipeline CI**: Falta de verificación de estilo automatizada en el pipeline de frontend.
* **Solución propuesta**: Instalar `prettier` y `eslint-config-prettier` en `client/`, crear `client/.prettierrc` alineado con el backend, y extender `client/eslint.config.js` para desactivar reglas conflictivas.
* **Prioridad**: Alta

---

### Problema 3: Scripts Incompletos para Ejecución de Linter y Formato
* **Descripción**: Los scripts actuales de `package.json` no permiten la ejecución ni la verificación automática del formato en ninguno de los dos proyectos. El frontend posee `"lint": "eslint ."`, pero carece de comandos para verificar el formato con Prettier. El backend carece de ambos.
* **Evidencia**:
  * **Archivo**: [package.json de client](file:///c:/Users/Kuro_Waza/.antigravity-ide/Desarrollo-de-software-2/client/package.json) e [package.json de server](file:///c:/Users/Kuro_Waza/.antigravity-ide/Desarrollo-de-software-2/server/package.json)
  * **Rutas**: `client/package.json` y `server/package.json`
* **Impacto**:
  * **Pipeline CI**: Bloqueo técnico. Al no existir comandos estandarizados, el pipeline de CI no puede invocar las comprobaciones correspondientes, impidiendo automatizar el flujo de calidad.
* **Solución propuesta**: Agregar `"lint": "eslint src/"`, `"format": "prettier --write src/"` y `"format:check": "prettier --check src/"` en `server/package.json`. Agregar `"format": "prettier --write src/"` y `"format:check": "prettier --check src/"` en `client/package.json`.
* **Prioridad**: Alta

---

### Problema 4: Inexistencia de Pipeline de Integración Continua (CI)
* **Descripción**: El repositorio no contiene configuraciones para ejecutar flujos de trabajo de CI (como archivos en `.github/workflows/`), imposibilitando la ejecución automatizada y el bloqueo de Pull Requests que no cumplan con los estándares de estilo y formato.
* **Evidencia**:
  * **Ruta**: Raíz del proyecto. No se encuentra el directorio `.github/workflows` ni archivos asociados.
* **Impacto**:
  * **Pipeline CI**: Incumplimiento directo de la rúbrica que requiere un pipeline funcional en GitHub Actions.
  * **Mantenibilidad**: La calidad de código dependerá de la disciplina manual de cada desarrollador antes de realizar commits.
* **Solución propuesta**: Crear el archivo `.github/workflows/ci.yml` configurando la instalación, el linter y la verificación del formato para ambos proyectos.
* **Prioridad**: Alta

---

## 2. Conclusión del Diagnóstico

El proyecto se encuentra actualmente **no apto** para superar la rúbrica del Pipeline CI. Mientras el frontend posee una base con ESLint v10, el backend está completamente desprotegido frente a deudas técnicas de formato y estilo. Sin embargo, debido al desacoplamiento actual de los proyectos, la implementación de un sistema moderno unificado utilizando Flat Configs de ESLint y reglas consistentes de Prettier es viable y directa de realizar.
