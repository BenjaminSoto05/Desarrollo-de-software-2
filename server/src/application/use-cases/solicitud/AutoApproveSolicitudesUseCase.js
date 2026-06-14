// ============================================================================
// Use Case: Aprobación Automática tras 48h
// Capa: Application
// RF-EJE-05: Aprobación automática tras 48 horas sin respuesta
// RN-12: Tras 48 horas sin respuesta, la tarea se aprueba automáticamente
// ============================================================================

const { ESTADOS } = require('../../../domain/entities/Solicitud');

class AutoApproveSolicitudesUseCase {
  /**
   * @param {import('../../../domain/repositories/SolicitudRepository')} solicitudRepository
   */
  constructor(solicitudRepository) {
    this.solicitudRepository = solicitudRepository;
  }

  /**
   * Busca solicitudes COMPLETADAS sin confirmar hace más de 48h
   * y las cambia a FINALIZADA automáticamente.
   * @returns {Promise<Object>} Resultado con cantidad aprobadas
   */
  async execute() {
    // Buscar solicitudes completadas sin confirmar hace >48h
    const solicitudesPendientes = await this.solicitudRepository.findCompletadasSinConfirmar();

    let aprobadas = 0;

    for (const solicitud of solicitudesPendientes) {
      await this.solicitudRepository.update(solicitud.id, {
        estado: ESTADOS.FINALIZADA,
      });
      aprobadas++;
    }

    return {
      message: `Aprobación automática completada.`,
      solicitudesAprobadas: aprobadas,
      totalRevisadas: solicitudesPendientes.length,
    };
  }
}

module.exports = AutoApproveSolicitudesUseCase;
