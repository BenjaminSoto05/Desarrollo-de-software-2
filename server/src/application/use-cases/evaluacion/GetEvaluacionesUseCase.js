// ============================================================================
// Use Case: Obtener Evaluaciones de una Solicitud
// Capa: Application
// ============================================================================

class GetEvaluacionesUseCase {
  /**
   * @param {import('../../../domain/repositories/EvaluacionRepository')} evaluacionRepository
   */
  constructor(evaluacionRepository) {
    this.evaluacionRepository = evaluacionRepository;
  }

  /**
   * Obtiene las evaluaciones de una solicitud.
   * @param {string} solicitudId
   * @returns {Promise<Object[]>}
   */
  async execute(solicitudId) {
    return this.evaluacionRepository.findBySolicitud(solicitudId);
  }
}

module.exports = GetEvaluacionesUseCase;
