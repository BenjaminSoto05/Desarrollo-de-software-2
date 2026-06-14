// ============================================================================
// Controller: Solicitudes
// Capa: Presentation
// Maneja requests HTTP y delega a Use Cases
// ============================================================================

class SolicitudController {
  /**
   * @param {Object} useCases
   */
  constructor(useCases) {
    this.createSolicitud = useCases.createSolicitud;
    this.getSolicitudes = useCases.getSolicitudes;
    this.getSolicitudDetail = useCases.getSolicitudDetail;
    this.updateSolicitud = useCases.updateSolicitud;
    this.cancelSolicitud = useCases.cancelSolicitud;
    this.getMisSolicitudes = useCases.getMisSolicitudes;
    this.acceptSolicitud = useCases.acceptSolicitud;
    this.cancelAccepted = useCases.cancelAccepted;
    this.completeSolicitud = useCases.completeSolicitud;
    this.confirmSolicitud = useCases.confirmSolicitud;
    this.autoApprove = useCases.autoApprove;

    // Bind para contexto en Express
    this.handleCreate = this.handleCreate.bind(this);
    this.handleGetAll = this.handleGetAll.bind(this);
    this.handleGetById = this.handleGetById.bind(this);
    this.handleUpdate = this.handleUpdate.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleGetMine = this.handleGetMine.bind(this);
    this.handleAccept = this.handleAccept.bind(this);
    this.handleCancelAccepted = this.handleCancelAccepted.bind(this);
    this.handleComplete = this.handleComplete.bind(this);
    this.handleConfirm = this.handleConfirm.bind(this);
    this.handleAutoApprove = this.handleAutoApprove.bind(this);
  }

  /**
   * POST /api/solicitudes
   * RF-SOL-01, RF-SOL-02, RF-SOL-03
   */
  async handleCreate(req, res, next) {
    try {
      const solicitud = await this.createSolicitud.execute(req.body, req.user.id);

      res.status(201).json({
        success: true,
        message: 'Solicitud creada exitosamente.',
        data: solicitud,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/solicitudes
   * RF-EMP-01: Listado con filtros
   */
  async handleGetAll(req, res, next) {
    try {
      const filters = {
        categoriaId: req.query.categoriaId,
        comuna: req.query.comuna,
        estado: req.query.estado || 'PENDIENTE',
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
      };

      const result = await this.getSolicitudes.execute(filters, req.user);

      res.json({
        success: true,
        data: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/solicitudes/:id
   * RF-EMP-02, RF-EMP-05
   */
  async handleGetById(req, res, next) {
    try {
      const solicitud = await this.getSolicitudDetail.execute(
        req.params.id,
        req.user
      );

      res.json({
        success: true,
        data: solicitud,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/solicitudes/:id
   * RF-SOL-04: Editar antes de aceptación
   */
  async handleUpdate(req, res, next) {
    try {
      const solicitud = await this.updateSolicitud.execute(
        req.params.id,
        req.body,
        req.user.id
      );

      res.json({
        success: true,
        message: 'Solicitud actualizada exitosamente.',
        data: solicitud,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/solicitudes/:id
   * RF-SOL-04: Cancelar solicitud
   */
  async handleCancel(req, res, next) {
    try {
      const solicitud = await this.cancelSolicitud.execute(
        req.params.id,
        req.user.id
      );

      res.json({
        success: true,
        message: 'Solicitud cancelada exitosamente.',
        data: solicitud,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/solicitudes/mine
   * Solicitudes del usuario autenticado
   */
  async handleGetMine(req, res, next) {
    try {
      const solicitudes = await this.getMisSolicitudes.execute(
        req.user.id,
        req.user.rol
      );

      res.json({
        success: true,
        data: solicitudes,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/solicitudes/:id/accept
   * RF-EMP-03: Aceptar solicitud como voluntario
   * RF-EMP-04: Máximo 2 activas
   * RF-EMP-05: Libera dirección al voluntario asignado
   */
  async handleAccept(req, res, next) {
    try {
      const solicitud = await this.acceptSolicitud.execute(
        req.params.id,
        req.user.id
      );

      res.json({
        success: true,
        message: 'Solicitud aceptada exitosamente. La dirección ya está disponible.',
        data: solicitud,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/solicitudes/:id/cancel-acceptance
   * RF-EJE-01: Cancelar tarea aceptada (con posible penalización)
   */
  async handleCancelAccepted(req, res, next) {
    try {
      const result = await this.cancelAccepted.execute(
        req.params.id,
        req.user.id
      );

      res.json({
        success: true,
        message: result.message,
        data: result.penalizacion,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/solicitudes/:id/complete
   * RF-EJE-02: Marcar tarea como completada
   */
  async handleComplete(req, res, next) {
    try {
      const solicitud = await this.completeSolicitud.execute(
        req.params.id,
        req.user.id
      );

      res.json({
        success: true,
        message: 'Tarea marcada como completada. Esperando confirmación del solicitante.',
        data: solicitud,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/solicitudes/:id/confirm
   * RF-EJE-03: Confirmar finalización
   */
  async handleConfirm(req, res, next) {
    try {
      const solicitud = await this.confirmSolicitud.execute(
        req.params.id,
        req.user.id
      );

      res.json({
        success: true,
        message: 'Tarea finalizada exitosamente. Las horas han sido acreditadas.',
        data: solicitud,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/solicitudes/admin/auto-approve
   * RF-EJE-05: Aprobación automática tras 48h
   */
  async handleAutoApprove(req, res, next) {
    try {
      const result = await this.autoApprove.execute();

      res.json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = SolicitudController;
