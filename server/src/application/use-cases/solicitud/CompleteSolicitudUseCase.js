// ============================================================================
// Use Case: Marcar Solicitud como Completada (por el estudiante)
// Capa: Application
// RF-EJE-02: Estudiante marca tarea como "Completada"
// ============================================================================

const { ESTADOS } = require('../../../domain/entities/Solicitud');

class CompleteSolicitudUseCase {
  /**
   * @param {import('../../../domain/repositories/SolicitudRepository')} solicitudRepository
   */
  constructor(solicitudRepository) {
    this.solicitudRepository = solicitudRepository;
  }

  /**
   * Marca una solicitud como completada por el voluntario.
   * Cambia estado EN_CURSO → COMPLETADA.
   * @param {string} solicitudId
   * @param {string} voluntarioId - ID del estudiante voluntario
   * @returns {Promise<Object>} Solicitud actualizada
   */
  async execute(solicitudId, voluntarioId) {
    const solicitud = await this.solicitudRepository.findById(solicitudId);

    if (!solicitud) {
      const error = new Error('Solicitud no encontrada.');
      error.statusCode = 404;
      throw error;
    }

    if (solicitud.estado !== ESTADOS.EN_CURSO) {
      const error = new Error('Solo se pueden completar tareas que están en curso.');
      error.statusCode = 400;
      throw error;
    }

    if (solicitud.voluntarioId !== voluntarioId) {
      const error = new Error('Solo el voluntario asignado puede completar esta tarea.');
      error.statusCode = 403;
      throw error;
    }

    const updated = await this.solicitudRepository.update(solicitudId, {
      estado: ESTADOS.COMPLETADA,
    });

    return updated;
  }
}

module.exports = CompleteSolicitudUseCase;
