// ============================================================================
// Use Case: Cancelar Solicitud
// Capa: Application
// RF-SOL-04: Cancelar solicitud antes de aceptación
// ============================================================================

const { Solicitud, ESTADOS } = require('../../../domain/entities/Solicitud');

class CancelSolicitudUseCase {
  /**
   * @param {import('../../../domain/repositories/SolicitudRepository')} solicitudRepository
   */
  constructor(solicitudRepository) {
    this.solicitudRepository = solicitudRepository;
  }

  /**
   * Cancela una solicitud.
   * RF-SOL-04: Solo el creador puede cancelar, y solo si está PENDIENTE o EN_CURSO.
   * @param {string} solicitudId
   * @param {string} userId - ID del usuario que solicita la cancelación
   * @returns {Promise<Object>} Solicitud cancelada
   */
  async execute(solicitudId, userId) {
    const solicitudData = await this.solicitudRepository.findById(solicitudId);

    if (!solicitudData) {
      const error = new Error('Solicitud no encontrada.');
      error.statusCode = 404;
      throw error;
    }

    const solicitud = new Solicitud(solicitudData);

    if (!solicitud.puedeSerCanceladaPor(userId)) {
      const error = new Error(
        'No puedes cancelar esta solicitud. Solo el creador puede cancelarla mientras no esté finalizada.'
      );
      error.statusCode = 403;
      throw error;
    }

    // Cambiar estado usando la máquina de estados del dominio
    solicitud.cambiarEstado(ESTADOS.CANCELADA);

    const updated = await this.solicitudRepository.update(solicitudId, {
      estado: ESTADOS.CANCELADA,
      voluntarioId: null, // Liberar voluntario si estaba asignado
    });

    return updated;
  }
}

module.exports = CancelSolicitudUseCase;
