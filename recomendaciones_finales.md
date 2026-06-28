# Recomendaciones Finales y Refactorizaciones

Este documento consolida las recomendaciones estratégicas para mejorar el mantenimiento del código, mitigar riesgos técnicos futuros y elevar los estándares de calidad del software.

---

## 1. Refactorizaciones Estructurales Recomendadas

Tras auditar el código fuente de los proyectos frontend y backend, se sugieren las siguientes acciones de refactorización prioritarias:

### Refactorización 1: Unificación de Configuraciones Tooling en la Raíz
* **Problema**: El tener configuraciones duplicadas para `eslint` y `prettier` en carpetas separadas (`server/` y `client/`) dificulta aplicar reglas globales en la organización.
* **Motivo**: A medida que el equipo crezca, sincronizar cambios estilísticos en ambos proyectos de forma manual se volverá insostenible.
* **Solución propuesta**: Configurar ESLint y Prettier a nivel raíz con configuraciones heredadas en subcarpetas utilizando la capacidad multi-proyecto de ESLint Flat Config.
* **Impacto en Calidad**: Alto. Garantiza que las reglas básicas siempre estén alineadas.
* **Impacto en Mantenibilidad**: Muy Alto. Permite actualizar dependencias de tooling en un único lugar (`package.json` de la raíz).

### Refactorización 2: Uso de Husky y lint-staged para Validación Pre-commit
* **Problema**: Actualmente, el desarrollador puede subir código sin verificar localmente que cumple con las reglas de lint y formato, delegando todo el costo de retroalimentación al pipeline de CI.
* **Motivo**: Corregir errores estilísticos una vez subidos al repositorio consume recursos de cómputo del CI de forma innecesaria y ralentiza la velocidad del equipo.
* **Solución propuesta**: Instalar `husky` y `lint-staged` para ejecutar de manera automática `npm run lint` y `npm run format:check` únicamente sobre los archivos modificados que están listos para confirmarse (`git commit`).
* **Impacto en Calidad**: Alto. Impide que código roto o mal formateado sea guardado en el historial de Git.
* **Impacto en Mantenibilidad**: Medio. Ahorra tiempo al desarrollador y reduce las fallas en el pipeline de CI a prácticamente cero.

### Refactorización 3: Configuración del Linter en Entornos de Desarrollo (IDE)
* **Problema**: Los desarrolladores formatean el código al final o manualmente.
* **Motivo**: Pérdida de tiempo valioso depurando el formato.
* **Solución propuesta**: Compartir una carpeta `.vscode/settings.json` en el repositorio para activar "Format on Save" utilizando Prettier y ESLint de manera transparente e instantánea para cualquier desarrollador que clone el repositorio.
* **Impacto en Calidad**: Medio.
* **Impacto en Mantenibilidad**: Alto. Minimiza curvas de aprendizaje en nuevos desarrolladores.

---

## 2. Plan de Acción Futuro

Para consolidar las prácticas ágiles de DevOps y Arquitectura de Software:
1. **Establecer Ramas Protegidas**: Configurar en GitHub que la rama `main` requiera obligatoriamente que el job de GitHub Actions finalice con éxito para autorizar el Merge.
2. **Monitorear Cobertura (SonarQube)**: Configurar la publicación automatizada de los reportes generados por `jest` (`lcov.info`) hacia SonarQube para mantener visibilidad constante sobre la cobertura mínima del 70% estipulada en la rúbrica.
