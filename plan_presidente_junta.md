# Análisis e Implementación: Nuevo Actor "Presidente de Junta"

## 1. Análisis Objetivo: ¿Es fundamental este actor?

**Evaluación: ALTAMENTE FUNDAMENTAL (Crítico para la adopción real)**

- **Efectividad:** Los adultos mayores suelen tener una brecha digital significativa. Muchos no poseen un smartphone o no saben usar aplicaciones web modernas. Obligar a cada adulto mayor a registrarse con email y contraseña limitará severamente el uso de la app. El Presidente de Junta actúa como un "Hub" o puente comunitario: recoge necesidades de forma presencial (papel, teléfono) y las digitaliza en el sistema. Esto asegura que la ayuda llegue a quienes realmente la necesitan.
- **Tiempo y Dificultad de Implementación:** Es un cambio de dificultad **Media-Baja**. La arquitectura actual ya soporta intermediarios (como el `TUTOR`). Solo necesitamos agregar el rol y un par de campos para que el voluntario sepa a quién debe ayudar realmente. Tomará aproximadamente 1 a 2 horas implementar y testear.

## 2. Historias de Usuario sugeridas (Para tu Trello)

Si apruebas este plan, deberías agregar las siguientes tarjetas a tu Trello para reflejar este nuevo rol:
- **HU-PRES-01:** "Como Presidente de Junta, quiero registrarme en la plataforma validando mi RUT, para poder gestionar solicitudes de mi comunidad."
- **HU-PRES-02:** "Como Presidente de Junta, quiero crear solicitudes de ayuda a nombre de un adulto mayor de mi sector, especificando su nombre y dirección, para que un voluntario lo asista."
- **HU-PRES-03:** "Como Presidente de Junta, quiero poder confirmar que una tarea fue finalizada exitosamente por el voluntario en representación del adulto mayor."

## 3. Cambios Propuestos al Sistema

Para que esto funcione a la perfección, debemos hacer las siguientes modificaciones:

1. **Base de Datos (Prisma):**
   - Añadir `PRESIDENTE_JUNTA` a los roles.
   - Añadir campos `nombreBeneficiario` y `telefonoBeneficiario` (opcionales) a la Solicitud. Así el voluntario sabrá a qué abuelito ir a ver y cómo contactarlo.
2. **Entidades y Servicios:**
   - Modificar las reglas para permitir que el Presidente valide su RUT y Comuna.
3. **Casos de Uso:**
   - Actualizar el registro para permitir `PRESIDENTE_JUNTA`.
   - Actualizar la creación de solicitudes para aceptar el beneficiario final.
   - Actualizar la vista de detalle para que el voluntario pueda ver los datos del beneficiario.
4. **Tests:**
   - Actualizar nuestros 181 tests unitarios para que no se rompan y soporten esta nueva característica.
