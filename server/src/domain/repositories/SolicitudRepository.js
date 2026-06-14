// ============================================================================
// Interfaz de Repositorio: SolicitudRepository
// Capa: Domain — Contrato que la infraestructura debe implementar
// Principio: Dependency Inversion (SOLID - D)
// ============================================================================

/**
 * Contrato para el acceso a datos de solicitudes.
 *
 * @interface
 */
class SolicitudRepository {
  /**
   * Busca una solicitud por ID con relaciones.
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    throw new Error('Método findById no implementado.');
  }

  /**
   * Lista solicitudes con filtros opcionales.
   * RF-EMP-01: Filtrar por categoría, comuna, fecha.
   * @param {Object} [filters] - { categoriaId, comuna, estado, page, limit }
   * @returns {Promise<{ data: Object[], total: number }>}
   */
  async findAll(filters) {
    throw new Error('Método findAll no implementado.');
  }

  /**
   * Busca solicitudes creadas por un usuario específico.
   * @param {string} solicitanteId
   * @returns {Promise<Object[]>}
   */
  async findBySolicitante(solicitanteId) {
    throw new Error('Método findBySolicitante no implementado.');
  }

  /**
   * Busca solicitudes aceptadas por un voluntario.
   * @param {string} voluntarioId
   * @returns {Promise<Object[]>}
   */
  async findByVoluntario(voluntarioId) {
    throw new Error('Método findByVoluntario no implementado.');
  }

  /**
   * Cuenta solicitudes activas (EN_CURSO) de un voluntario.
   * RF-EMP-04: Máximo 2 solicitudes activas.
   * @param {string} voluntarioId
   * @returns {Promise<number>}
   */
  async countActiveByVoluntario(voluntarioId) {
    throw new Error('Método countActiveByVoluntario no implementado.');
  }

  /**
   * Crea una nueva solicitud.
   * @param {Object} solicitudData
   * @returns {Promise<Object>}
   */
  async create(solicitudData) {
    throw new Error('Método create no implementado.');
  }

  /**
   * Actualiza una solicitud existente.
   * @param {string} id
   * @param {Object} solicitudData
   * @returns {Promise<Object>}
   */
  async update(id, solicitudData) {
    throw new Error('Método update no implementado.');
  }

  /**
   * Elimina una solicitud.
   * @param {string} id
   * @returns {Promise<void>}
   */
  async delete(id) {
    throw new Error('Método delete no implementado.');
  }

  /**
   * Busca solicitudes completadas sin confirmar hace más de 48 horas.
   * RF-EJE-05: Aprobación automática.
   * @returns {Promise<Object[]>}
   */
  async findCompletadasSinConfirmar() {
    throw new Error('Método findCompletadasSinConfirmar no implementado.');
  }
}

module.exports = SolicitudRepository;
