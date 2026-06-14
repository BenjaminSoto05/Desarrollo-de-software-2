// ============================================================================
// Controller: Evaluaciones
// Capa: Presentation
// RF-EJE-04: Sistema de evaluación con estrellas
// ============================================================================

class EvaluacionController {
  /**
   * @param {Object} useCases
   */
  constructor(useCases) {
    this.createEvaluacion = useCases.createEvaluacion;
    this.getEvaluaciones = useCases.getEvaluaciones;

    this.handleCreate = this.handleCreate.bind(this);
    this.handleGetBySolicitud = this.handleGetBySolicitud.bind(this);
  }

  /**
   * POST /api/evaluaciones
   * RF-EJE-04: Evaluar con estrellas (1-5)
   */
  async handleCreate(req, res, next) {
    try {
      const evaluacion = await this.createEvaluacion.execute(
        req.body,
        req.user.id
      );

      res.status(201).json({
        success: true,
        message: 'Evaluación registrada exitosamente.',
        data: evaluacion,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/evaluaciones/solicitud/:solicitudId
   * Obtiene evaluaciones de una solicitud
   */
  async handleGetBySolicitud(req, res, next) {
    try {
      const evaluaciones = await this.getEvaluaciones.execute(
        req.params.solicitudId
      );

      res.json({
        success: true,
        data: evaluaciones,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = EvaluacionController;
