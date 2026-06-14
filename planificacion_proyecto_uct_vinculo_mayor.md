# Planificación del Proyecto — Sistema UCT-Vínculo Mayor

**Universidad Católica de Temuco**  
**Facultad de Ingeniería**

# SRS: Sistema UCT-Vínculo Mayor

## Autores
- Benjamin Sebastian
- Francisco Valderrama
- Sebastian Rivera
- Axel Gonzalez

## Docentes
- Guido Octavio Mellado Bravo
- Luciano Revillod

## Plataforma de Voluntariado para el Adulto Mayor
Temuco, Chile  
27 de abril de 2026

---

# Índice

1. [Resumen del Proyecto](#1-resumen-del-proyecto)
2. [Alcance a Cubrir (Primera Entrega - MVP)](#2-alcance-a-cubrir-primera-entrega---mvp)
3. [Objetivos del Proyecto](#3-objetivos-del-proyecto)
4. [Definición de Tecnologías a Utilizar](#4-definición-de-tecnologías-a-utilizar)

---

# 1. Resumen del Proyecto

El proyecto **UCT–Vínculo Mayor** surge como respuesta a la brecha digital y social que enfrentan muchos adultos mayores en la comuna de Temuco, quienes presentan dificultades para realizar tareas cotidianas como:

- Compras.
- Trámites.
- Actividades de acompañamiento.

Paralelamente, existe un grupo de estudiantes universitarios dispuestos a realizar voluntariado, pero sin una plataforma segura y organizada que facilite esta conexión.

## Solución Propuesta

La solución consiste en una plataforma web que actúa como intermediario entre:

- Adultos mayores.
- Estudiantes de la Universidad Católica de Temuco.

La plataforma permitirá:

- Publicar solicitudes de ayuda.
- Visualizar solicitudes disponibles.
- Aceptar tareas de voluntariado.
- Garantizar seguridad y privacidad.
- Mantener trazabilidad de las interacciones.
- Incorporar evaluaciones.
- Registrar horas de voluntariado.

---

# 2. Alcance a Cubrir (Primera Entrega - MVP)

Para la primera entrega se desarrollará un **Producto Mínimo Viable (MVP)** enfocado en las funcionalidades esenciales del sistema.

El objetivo es asegurar que los actores principales puedan interactuar de forma básica pero funcional.

## Funcionalidades del Adulto Mayor

El Adulto Mayor podrá:

- Registrarse.
- Iniciar sesión.
- Publicar solicitudes de ayuda.
- Ingresar:
  - Descripción.
  - Categoría.
  - Horario aproximado.
- Visualizar el estado de sus solicitudes.
- Confirmar la finalización de una tarea.
- Evaluar al estudiante mediante un sistema de estrellas.

## Funcionalidades del Estudiante UCT

El Estudiante UCT podrá:

- Iniciar sesión mediante correo institucional:
  - `@uct.cl`
  - `@alu.uct.cl`
- Visualizar solicitudes disponibles.
- Filtrar solicitudes por categoría.
- Aceptar solicitudes.
- Marcar tareas como finalizadas.

## Funcionalidades del Administrador

El Administrador podrá:

- Validar usuarios.
- Validar estudiantes.
- Visualizar solicitudes activas.
- Gestionar incidencias básicas.

### Ejemplos de incidencias
- Eliminar solicitudes inapropiadas.

## Restricciones del MVP

### Geolocalización
No se incluirá geolocalización avanzada.

Solo se utilizará:
- Información general.

### Notificaciones
Las notificaciones serán básicas.

No se incluirá:
- Integración completa SMS.
- Integración email en tiempo real.

### Sistema de Reportes
El sistema de reportes será limitado.

---

# 3. Objetivos del Proyecto

Los objetivos del proyecto están definidos en función de implementar las funcionalidades necesarias para cumplir con el alcance del MVP.

## Objetivos Funcionales

### Sistema de Autenticación
Implementar un sistema que permita:

- Diferenciar roles:
  - Adulto mayor.
  - Estudiante.
  - Administrador.
- Validar correos institucionales.

### Gestión de Solicitudes
Desarrollar un módulo que permita:

- Crear solicitudes.
- Visualizar solicitudes.
- Cerrar solicitudes.

### Visualización y Aceptación de Tareas
Implementar funcionalidades para:

- Mostrar tareas disponibles.
- Permitir aceptar solicitudes.

### Flujo Completo de Solicitudes
Desarrollar el flujo:

```text
Creación → Aceptación → Ejecución → Finalización
```

### Sistema de Evaluación
Incorporar:

- Calificación mediante estrellas.

## Reglas de Negocio Fundamentales

Garantizar:

- Servicio gratuito.
- Interacción controlada.
- Validación de usuarios institucionales.

### Restricciones
No se permitirán:

- Pagos.
- Intercambios monetarios.

## Requisitos No Funcionales Básicos

### Accesibilidad
La interfaz debe ser:

- Simple.
- Accesible.
- Pensada para adultos mayores.

### Rendimiento
El sistema debe mantener:

- Tiempos de carga menores a 3 segundos.

### Protección de Datos
Debe existir:

- Protección básica de datos personales.

---

# 4. Definición de Tecnologías a Utilizar

Se propone un stack tecnológico moderno, ampliamente utilizado y con buena documentación.

El stack está orientado a:

- Proyectos web académicos.
- Escalabilidad.
- Desarrollo rápido de MVP.

## Frontend: React.js

### Ventajas

- Interfaces dinámicas y reutilizables.
- Gran comunidad.
- Amplia documentación.
- Facilita interfaces accesibles.
- Adecuado para adultos mayores.

## Framework de Estilos: Tailwind CSS

### Ventajas

- Desarrollo rápido de interfaces.
- Diseño consistente.
- Diseño responsivo.
- Mejor accesibilidad.
- Menor complejidad en CSS personalizado.

## Backend: Node.js + Express

### Ventajas

- Construcción rápida de APIs REST.
- Alta compatibilidad con frontend moderno.
- Ideal para MVP.
- Flexibilidad y simplicidad.

## Base de Datos: PostgreSQL

### Ventajas

- Sistema robusto.
- Base de datos relacional confiable.
- Manejo claro de relaciones.
- Escalable.

### Relaciones Principales

- Usuarios.
- Solicitudes.
- Evaluaciones.

## ORM: Prisma

### Ventajas

- Facilita interacción con la base de datos.
- Reduce errores SQL.
- Mejora mantenibilidad.

## Autenticación: JWT (JSON Web Tokens)

### Ventajas

- Manejo seguro de sesiones.
- Compatible con múltiples roles.
- Ideal para arquitecturas API modernas.

## Validación de Correo Institucional

La validación será implementada desde backend.

### Restricciones
Solo podrán ingresar estudiantes con dominios:

- `@uct.cl`
- `@alu.uct.cl`

### Beneficio
Garantiza el cumplimiento del requisito funcional:

- `RF-USR-01`

## Control de Versiones: Git + GitHub

### Beneficios

- Trabajo colaborativo.
- Control de cambios.
- Historial de versiones.
- Coordinación entre integrantes.

## Despliegue (Opcional para MVP)

### Frontend
#### Vercel
Ventajas:
- Integración sencilla con React.
- Despliegue rápido.

### Backend
#### Render o Railway
Ventajas:
- Publicación rápida de APIs.
- Configuración sencilla.

## Resultado Esperado

Las tecnologías seleccionadas permitirán:

- Mantener un MVP funcional.
- Tener una versión accesible en línea.
- Facilitar futuras expansiones.
- Mejorar mantenibilidad y escalabilidad.

