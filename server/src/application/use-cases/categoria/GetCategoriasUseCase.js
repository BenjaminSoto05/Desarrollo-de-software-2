// ============================================================================
// Use Case: Obtener Categorías
// Capa: Application
// RF-SOL-01: Categorías predefinidas
// ============================================================================

class GetCategoriasUseCase {
  /**
   * @param {import('../../../domain/repositories/CategoriaRepository')} categoriaRepository
   */
  constructor(categoriaRepository) {
    this.categoriaRepository = categoriaRepository;
  }

  /**
   * Lista todas las categorías activas.
   * @returns {Promise<Object[]>}
   */
  async execute() {
    return this.categoriaRepository.findAllActive();
  }
}

module.exports = GetCategoriasUseCase;
