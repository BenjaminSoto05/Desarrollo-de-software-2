# Resumen: Evaluación Final Diseño de Software (40%)

## Contexto General
Presentación y defensa de la versión final del proyecto (29 de junio al 3 de julio). Se evalúa la implementación técnica, justificación de decisiones y evolución del proyecto. **No hay informe escrito**, la entrega consiste en la presentación (PPT) y la demostración de un sistema 100% funcional.

---

## Requisitos Técnicos Mínimos

1. **Arquitectura:** Implementar y evidenciar uno de estos patrones: Capas, Limpia/Hexagonal, CQRS o Event Driven.
2. **CI/CD (GitHub Actions):** Pipeline automatizado que incluya:
   - Lint y Format.
   - Testing (Unitarias, Integración, E2E).
   - *Nota:* Incluir manifiesto YAML (se recomienda usar Makefile).
3. **Autenticación:** Sistema con JWT y Refresh Tokens (si el dominio lo requiere, se debe justificar).
4. **Calidad de Código (SonarQube):** - Integrado en el pipeline CI.
   - Generación de `coverage.xml`.
   - **Cobertura mínima del 70%**.
   - Resolución de problemas críticos.

---

## Rúbrica de Evaluación (100 Puntos)

Cada criterio se evalúa de **1 a 10 puntos** (1 = Deficiente, 10 = Excelente).

| Criterio | Descripción Breve |
| :--- | :--- |
| **Arquitectura** | Implementación correcta, separación de responsabilidades y justificación. |
| **Pipeline CI** | Funcionamiento automatizado de Lint, Format y Testing en GitHub Actions. |
| **Testing** | Calidad, pertinencia y cobertura de pruebas. |
| **SonarQube** | Integración y cumplimiento del >70% de cobertura. |
| **Autenticación** | Implementación de JWT + Refresh Tokens (cuando aplique). |
| **Correcciones** | Avance y mejoras en base a retroalimentación anterior. |
| **Implementación** | Cumplimiento del backlog, casos de uso y reglas de negocio. |
| **Presentación** | Calidad de exposición, PPT y profesionalismo. |
| **Defensa Técnica** | Capacidad del equipo para justificar decisiones. |
| **Demostración** | Sistema real funcionando y cumpliendo requerimientos. |

---

## Consideraciones Críticas
* **Defensa Técnica:** Cualquier integrante del equipo debe poder responder sobre cualquier parte del sistema. Un proyecto funcional sin una defensa sólida se penalizará fuertemente.
* **Evidencia:** Si no se puede demostrar la evidencia de un criterio, este será calificado con 1 punto.
* **Foco:** Se prioriza fuertemente la correcta integración entre la arquitectura, las pruebas, el pipeline CI/CD y las métricas de calidad de software.