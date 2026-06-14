// ============================================================================
// Servicio de Dominio: SolicitudValidationService
// Capa: Domain (lógica de negocio pura, sin dependencias externas)
// RF: RF-SOL-03
// RN: RN-04, RN-05, RN-06
// ============================================================================

/**
 * Horario operativo permitido — RN-04
 * Las tareas presenciales deben realizarse entre 08:00 y 20:00
 */
const HORARIO_INICIO = 8;  // 08:00
const HORARIO_FIN = 20;    // 20:00

/**
 * Horas mínimas de anticipación para crear solicitudes — RN-05
 */
const HORAS_ANTICIPACION_MINIMA = 24;

/**
 * Duración máxima de una tarea en horas — RN-06
 */
const DURACION_MAXIMA_HORAS = 4;

/**
 * Horas mínimas de anticipación para cancelar sin penalización — RN-08
 */
const HORAS_CANCELACION_SIN_PENALIZACION = 4;

/**
 * Máximo de solicitudes activas por estudiante — RF-EMP-04
 */
const MAX_SOLICITUDES_ACTIVAS = 2;

class SolicitudValidationService {
  /**
   * Valida que la hora programada esté dentro del horario operativo.
   * RN-04: Las tareas presenciales deben realizarse entre 08:00 y 20:00
   * @param {string} horaProgramada - Formato "HH:mm"
   * @returns {{ valid: boolean, error?: string }}
   */
  static validarHorario(horaProgramada) {
    if (!horaProgramada || typeof horaProgramada !== 'string') {
      return { valid: false, error: 'La hora programada es requerida.' };
    }

    const partes = horaProgramada.split(':');
    if (partes.length !== 2) {
      return { valid: false, error: 'Formato de hora inválido. Use HH:mm.' };
    }

    const hora = parseInt(partes[0], 10);
    const minutos = parseInt(partes[1], 10);

    if (isNaN(hora) || isNaN(minutos) || hora < 0 || hora > 23 || minutos < 0 || minutos > 59) {
      return { valid: false, error: 'La hora proporcionada no es válida.' };
    }

    if (hora < HORARIO_INICIO || hora >= HORARIO_FIN) {
      return {
        valid: false,
        error: `Las tareas solo pueden programarse entre las ${HORARIO_INICIO}:00 y las ${HORARIO_FIN}:00.`,
      };
    }

    return { valid: true };
  }

  /**
   * Valida que la solicitud se cree con al menos 24 horas de anticipación.
   * RN-05: Las solicitudes deben ingresarse con mínimo 24 horas de anticipación.
   * @param {Date} fechaProgramada
   * @param {string} horaProgramada - Formato "HH:mm"
   * @returns {{ valid: boolean, error?: string }}
   */
  static validarAnticipacion(fechaProgramada, horaProgramada) {
    const ahora = new Date();

    const [hora, minutos] = horaProgramada.split(':').map(Number);
    const fechaHoraProgramada = new Date(fechaProgramada);
    fechaHoraProgramada.setHours(hora, minutos, 0, 0);

    const diferenciaMs = fechaHoraProgramada.getTime() - ahora.getTime();
    const diferenciaHoras = diferenciaMs / (1000 * 60 * 60);

    if (diferenciaHoras < HORAS_ANTICIPACION_MINIMA) {
      return {
        valid: false,
        error: `Las solicitudes deben crearse con al menos ${HORAS_ANTICIPACION_MINIMA} horas de anticipación.`,
      };
    }

    return { valid: true };
  }

  /**
   * Valida que la fecha programada no sea en el pasado.
   * @param {Date} fechaProgramada
   * @returns {{ valid: boolean, error?: string }}
   */
  static validarFechaFutura(fechaProgramada) {
    const ahora = new Date();
    ahora.setHours(0, 0, 0, 0);

    const fecha = new Date(fechaProgramada);
    fecha.setHours(0, 0, 0, 0);

    if (fecha < ahora) {
      return {
        valid: false,
        error: 'La fecha programada no puede ser en el pasado.',
      };
    }

    return { valid: true };
  }

  /**
   * Determina si una cancelación genera inasistencia.
   * RN-08: Cancelar con menos de 4 horas cuenta como inasistencia.
   * @param {Date} fechaProgramada
   * @param {string} horaProgramada - Formato "HH:mm"
   * @returns {boolean} true si la cancelación genera inasistencia
   */
  static cancelacionGeneraInasistencia(fechaProgramada, horaProgramada) {
    const ahora = new Date();

    const [hora, minutos] = horaProgramada.split(':').map(Number);
    const fechaHoraProgramada = new Date(fechaProgramada);
    fechaHoraProgramada.setHours(hora, minutos, 0, 0);

    const diferenciaMs = fechaHoraProgramada.getTime() - ahora.getTime();
    const diferenciaHoras = diferenciaMs / (1000 * 60 * 60);

    return diferenciaHoras < HORAS_CANCELACION_SIN_PENALIZACION;
  }

  /**
   * Ejecuta todas las validaciones para la creación de una solicitud.
   * @param {Object} datos - { fechaProgramada, horaProgramada }
   * @returns {{ valid: boolean, errors: string[] }}
   */
  static validarCreacion(datos) {
    const errors = [];

    const resultadoHorario = this.validarHorario(datos.horaProgramada);
    if (!resultadoHorario.valid) errors.push(resultadoHorario.error);

    const resultadoFecha = this.validarFechaFutura(datos.fechaProgramada);
    if (!resultadoFecha.valid) errors.push(resultadoFecha.error);

    if (errors.length === 0) {
      const resultadoAnticipacion = this.validarAnticipacion(
        datos.fechaProgramada,
        datos.horaProgramada
      );
      if (!resultadoAnticipacion.valid) errors.push(resultadoAnticipacion.error);
    }

    return { valid: errors.length === 0, errors };
  }
}

module.exports = {
  SolicitudValidationService,
  HORARIO_INICIO,
  HORARIO_FIN,
  HORAS_ANTICIPACION_MINIMA,
  DURACION_MAXIMA_HORAS,
  HORAS_CANCELACION_SIN_PENALIZACION,
  MAX_SOLICITUDES_ACTIVAS,
};
