// ============================================================================
// Controller: Categorías
// Capa: Presentation
// ============================================================================

class CategoriaController {
  /**
   * @param {Object} useCases
   */
  constructor(useCases) {
    this.getCategorias = useCases.getCategorias;
    this.handleGetAll = this.handleGetAll.bind(this);
  }

  /**
   * GET /api/categorias
   * Lista categorías activas para el formulario de creación
   */
  async handleGetAll(req, res, next) {
    try {
      const categorias = await this.getCategorias.execute();

      res.json({
        success: true,
        data: categorias,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CategoriaController;
