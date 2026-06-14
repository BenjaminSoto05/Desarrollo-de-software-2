// ============================================================================
// Interfaz de Repositorio: CategoriaRepository
// Capa: Domain — Contrato que la infraestructura debe implementar
// ============================================================================

/**
 * @interface
 */
class CategoriaRepository {
  /**
   * Lista todas las categorías activas.
   * @returns {Promise<Object[]>}
   */
  async findAllActive() {
    throw new Error('Método findAllActive no implementado.');
  }

  /**
   * Busca una categoría por ID.
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    throw new Error('Método findById no implementado.');
  }

  /**
   * Crea una nueva categoría.
   * @param {Object} categoriaData
   * @returns {Promise<Object>}
   */
  async create(categoriaData) {
    throw new Error('Método create no implementado.');
  }
}

module.exports = CategoriaRepository;
