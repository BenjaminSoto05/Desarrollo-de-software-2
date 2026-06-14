// ============================================================================
// Use Case: Confirmar Finalización (por el Adulto Mayor)
// Capa: Application
// RF-EJE-03: Enviar confirmación al Adulto Mayor
// RN-11: Las horas solo se acreditan tras confirmación
// ============================================================================

const { ESTADOS } = require('../../../domain/entities/Solicitud');

class ConfirmSolicitudUseCase {
  /**
   * @param {import('../../../domain/repositories/SolicitudRepository')} solicitudRepository
   */
  constructor(solicitudRepository) {
    this.solicitudRepository = solicitudRepository;
  }

  /**
   * El adulto mayor confirma que la tarea fue completada satisfactoriamente.
   * Cambia estado COMPLETADA → FINALIZADA (RN-11: acredita horas).
   * @param {string} solicitudId
   * @param {string} solicitanteId - ID del adulto mayor
   * @returns {Promise<Object>} Solicitud finalizada
   */
  async execute(solicitudId, solicitanteId) {
    const solicitud = await this.solicitudRepository.findById(solicitudId);

    if (!solicitud) {
      const error = new Error('Solicitud no encontrada.');
      error.statusCode = 404;
      throw error;
    }

    if (solicitud.estado !== ESTADOS.COMPLETADA) {
      const error = new Error(
        'Solo se pueden confirmar tareas que han sido marcadas como completadas por el voluntario.'
      );
      error.statusCode = 400;
      throw error;
    }

    if (solicitud.solicitanteId !== solicitanteId) {
      const error = new Error('Solo el solicitante puede confirmar la finalización.');
      error.statusCode = 403;
      throw error;
    }

    const updated = await this.solicitudRepository.update(solicitudId, {
      estado: ESTADOS.FINALIZADA,
    });

    return updated;
  }
}

module.exports = ConfirmSolicitudUseCase;
