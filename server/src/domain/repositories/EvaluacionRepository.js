// ============================================================================
// Interfaz de Repositorio: EvaluacionRepository
// Capa: Domain — Contrato que la infraestructura debe implementar
// ============================================================================

/**
 * @interface
 */
class EvaluacionRepository {
  /**
   * Crea una nueva evaluación.
   * @param {Object} evaluacionData
   * @returns {Promise<Object>}
   */
  async create(evaluacionData) {
    throw new Error('Método create no implementado.');
  }

  /**
   * Busca evaluaciones de una solicitud.
   * @param {string} solicitudId
   * @returns {Promise<Object[]>}
   */
  async findBySolicitud(solicitudId) {
    throw new Error('Método findBySolicitud no implementado.');
  }

  /**
   * Busca evaluaciones recibidas por un usuario (para calcular promedio).
   * @param {string} evaluadoId
   * @returns {Promise<Object[]>}
   */
  async findByEvaluado(evaluadoId) {
    throw new Error('Método findByEvaluado no implementado.');
  }

  /**
   * Verifica si un evaluador ya evaluó una solicitud.
   * @param {string} solicitudId
   * @param {string} evaluadorId
   * @returns {Promise<boolean>}
   */
  async existsForSolicitudAndEvaluador(solicitudId, evaluadorId) {
    throw new Error('Método existsForSolicitudAndEvaluador no implementado.');
  }
}

module.exports = EvaluacionRepository;
