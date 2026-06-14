// ============================================================================
// Use Case: Cancelar Tarea Aceptada (por el voluntario)
// Capa: Application
// RF-EJE-01: Cancelar tareas aceptadas
// RN-08: Cancelar con menos de 4 horas cuenta como inasistencia
// RN-09: Tres inasistencias generan suspensión
// ============================================================================

const { ESTADOS } = require('../../../domain/entities/Solicitud');
const { User, MAX_INASISTENCIAS } = require('../../../domain/entities/User');
const { SolicitudValidationService } = require('../../../domain/services/SolicitudValidationService');

class CancelAcceptedSolicitudUseCase {
  /**
   * @param {import('../../../domain/repositories/SolicitudRepository')} solicitudRepository
   * @param {import('../../../domain/repositories/UserRepository')} userRepository
   */
  constructor(solicitudRepository, userRepository) {
    this.solicitudRepository = solicitudRepository;
    this.userRepository = userRepository;
  }

  /**
   * Cancela una tarea aceptada por el voluntario.
   * Si faltan menos de 4 horas, se registra inasistencia (RN-08).
   * @param {string} solicitudId
   * @param {string} voluntarioId
   * @returns {Promise<Object>} Resultado con info de penalización
   */
  async execute(solicitudId, voluntarioId) {
    // 1. Verificar que la solicitud existe y está EN_CURSO
    const solicitud = await this.solicitudRepository.findById(solicitudId);

    if (!solicitud) {
      const error = new Error('Solicitud no encontrada.');
      error.statusCode = 404;
      throw error;
    }

    if (solicitud.estado !== ESTADOS.EN_CURSO) {
      const error = new Error('Solo se pueden cancelar tareas que están en curso.');
      error.statusCode = 400;
      throw error;
    }

    // 2. Verificar que el voluntario es quien la tiene asignada
    if (solicitud.voluntarioId !== voluntarioId) {
      const error = new Error('Solo el voluntario asignado puede cancelar esta tarea.');
      error.statusCode = 403;
      throw error;
    }

    // 3. Determinar si genera inasistencia (RN-08)
    const generaInasistencia = SolicitudValidationService.cancelacionGeneraInasistencia(
      solicitud.fechaProgramada,
      solicitud.horaProgramada
    );

    // 4. Devolver solicitud a PENDIENTE (liberar para otro voluntario)
    await this.solicitudRepository.update(solicitudId, {
      estado: ESTADOS.PENDIENTE,
      voluntarioId: null,
    });

    // 5. Si genera inasistencia, registrarla y verificar suspensión (RN-09)
    let penalizacion = null;

    if (generaInasistencia) {
      const userData = await this.userRepository.findById(voluntarioId);
      const user = new User(userData);
      const fueSuspendido = user.registrarInasistencia();

      await this.userRepository.update(voluntarioId, {
        inasistencias: user.inasistencias,
        suspendido: user.suspendido,
      });

      penalizacion = {
        inasistenciaRegistrada: true,
        inasistenciasActuales: user.inasistencias,
        maxInasistencias: MAX_INASISTENCIAS,
        suspendido: fueSuspendido,
        mensaje: fueSuspendido
          ? `Has sido suspendido por acumular ${MAX_INASISTENCIAS} inasistencias.`
          : `Inasistencia registrada (${user.inasistencias}/${MAX_INASISTENCIAS}). Cancelaste con menos de 4 horas de anticipación.`,
      };
    }

    return {
      message: 'Tarea cancelada. La solicitud vuelve a estar disponible.',
      penalizacion: penalizacion || {
        inasistenciaRegistrada: false,
        mensaje: 'Cancelación sin penalización (más de 4 horas de anticipación).',
      },
    };
  }
}

module.exports = CancelAcceptedSolicitudUseCase;
