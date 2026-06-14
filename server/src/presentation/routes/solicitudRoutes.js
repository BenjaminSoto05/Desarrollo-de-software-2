// ============================================================================
// Rutas: Solicitudes
// Capa: Presentation
// Composición de dependencias + definición de endpoints
// ============================================================================

const { Router } = require('express');
const { body } = require('express-validator');

// Middlewares
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { handleValidationErrors } = require('../middlewares/validationMiddleware');

// Infraestructura
const prisma = require('../../infrastructure/database/prismaClient');
const PrismaSolicitudRepository = require('../../infrastructure/repositories/PrismaSolicitudRepository');
const PrismaCategoriaRepository = require('../../infrastructure/repositories/PrismaCategoriaRepository');
const PrismaUserRepository = require('../../infrastructure/repositories/PrismaUserRepository');

// Use Cases
const CreateSolicitudUseCase = require('../../application/use-cases/solicitud/CreateSolicitudUseCase');
const GetSolicitudesUseCase = require('../../application/use-cases/solicitud/GetSolicitudesUseCase');
const GetSolicitudDetailUseCase = require('../../application/use-cases/solicitud/GetSolicitudDetailUseCase');
const UpdateSolicitudUseCase = require('../../application/use-cases/solicitud/UpdateSolicitudUseCase');
const CancelSolicitudUseCase = require('../../application/use-cases/solicitud/CancelSolicitudUseCase');
const GetMisSolicitudesUseCase = require('../../application/use-cases/solicitud/GetMisSolicitudesUseCase');
const AcceptSolicitudUseCase = require('../../application/use-cases/solicitud/AcceptSolicitudUseCase');
const CancelAcceptedSolicitudUseCase = require('../../application/use-cases/solicitud/CancelAcceptedSolicitudUseCase');
const CompleteSolicitudUseCase = require('../../application/use-cases/solicitud/CompleteSolicitudUseCase');
const ConfirmSolicitudUseCase = require('../../application/use-cases/solicitud/ConfirmSolicitudUseCase');
const AutoApproveSolicitudesUseCase = require('../../application/use-cases/solicitud/AutoApproveSolicitudesUseCase');

// Controller
const SolicitudController = require('../controllers/SolicitudController');

// ============================================================================
// Dependency Injection
// ============================================================================

const solicitudRepository = new PrismaSolicitudRepository(prisma);
const categoriaRepository = new PrismaCategoriaRepository(prisma);
const userRepository = new PrismaUserRepository(prisma);

const solicitudController = new SolicitudController({
  createSolicitud: new CreateSolicitudUseCase(solicitudRepository, categoriaRepository, userRepository),
  getSolicitudes: new GetSolicitudesUseCase(solicitudRepository),
  getSolicitudDetail: new GetSolicitudDetailUseCase(solicitudRepository),
  updateSolicitud: new UpdateSolicitudUseCase(solicitudRepository, categoriaRepository),
  cancelSolicitud: new CancelSolicitudUseCase(solicitudRepository),
  getMisSolicitudes: new GetMisSolicitudesUseCase(solicitudRepository),
  acceptSolicitud: new AcceptSolicitudUseCase(solicitudRepository, userRepository, prisma),
  cancelAccepted: new CancelAcceptedSolicitudUseCase(solicitudRepository, userRepository),
  completeSolicitud: new CompleteSolicitudUseCase(solicitudRepository),
  confirmSolicitud: new ConfirmSolicitudUseCase(solicitudRepository),
  autoApprove: new AutoApproveSolicitudesUseCase(solicitudRepository),
});

// ============================================================================
// Reglas de validación
// ============================================================================

const createSolicitudRules = [
  body('titulo')
    .notEmpty().withMessage('El título es requerido.')
    .isLength({ min: 5, max: 100 }).withMessage('El título debe tener entre 5 y 100 caracteres.')
    .trim(),
  body('descripcion')
    .notEmpty().withMessage('La descripción es requerida.')
    .isLength({ min: 10, max: 500 }).withMessage('La descripción debe tener entre 10 y 500 caracteres.')
    .trim(),
  body('categoriaId')
    .notEmpty().withMessage('La categoría es requerida.')
    .isUUID().withMessage('ID de categoría inválido.'),
  body('fechaProgramada')
    .notEmpty().withMessage('La fecha programada es requerida.')
    .isISO8601().withMessage('Formato de fecha inválido (use ISO 8601).'),
  body('horaProgramada')
    .notEmpty().withMessage('La hora programada es requerida.')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Formato de hora inválido (use HH:mm).'),
  body('direccion')
    .notEmpty().withMessage('La dirección es requerida.')
    .isLength({ min: 5, max: 200 }).withMessage('La dirección debe tener entre 5 y 200 caracteres.')
    .trim(),
  body('comuna')
    .notEmpty().withMessage('La comuna es requerida.')
    .trim(),
  handleValidationErrors,
];

const updateSolicitudRules = [
  body('titulo').optional()
    .isLength({ min: 5, max: 100 }).withMessage('El título debe tener entre 5 y 100 caracteres.')
    .trim(),
  body('descripcion').optional()
    .isLength({ min: 10, max: 500 }).withMessage('La descripción debe tener entre 10 y 500 caracteres.')
    .trim(),
  body('categoriaId').optional()
    .isUUID().withMessage('ID de categoría inválido.'),
  body('fechaProgramada').optional()
    .isISO8601().withMessage('Formato de fecha inválido.'),
  body('horaProgramada').optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Formato de hora inválido.'),
  body('direccion').optional()
    .isLength({ min: 5, max: 200 }).trim(),
  body('comuna').optional().trim(),
  handleValidationErrors,
];

// ============================================================================
// Definición de rutas
// ============================================================================

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

/**
 * GET /api/solicitudes/mine
 * Mis solicitudes (creadas o aceptadas según rol)
 * IMPORTANTE: debe ir ANTES de /:id para que no lo capture como UUID
 */
router.get('/mine', solicitudController.handleGetMine);

/**
 * POST /api/solicitudes
 * RF-SOL-01, RF-SOL-02, RF-SOL-03
 * Solo ADULTO_MAYOR y TUTOR
 */
router.post(
  '/',
  roleMiddleware('ADULTO_MAYOR', 'TUTOR'),
  createSolicitudRules,
  solicitudController.handleCreate
);

/**
 * GET /api/solicitudes
 * RF-EMP-01: Listar con filtros (categoría, comuna, estado)
 */
router.get('/', solicitudController.handleGetAll);

/**
 * GET /api/solicitudes/:id
 * RF-EMP-02, RF-EMP-05: Detalle con datos condicionales
 */
router.get('/:id', solicitudController.handleGetById);

/**
 * PUT /api/solicitudes/:id
 * RF-SOL-04: Editar (solo si PENDIENTE y es el creador)
 */
router.put(
  '/:id',
  roleMiddleware('ADULTO_MAYOR', 'TUTOR'),
  updateSolicitudRules,
  solicitudController.handleUpdate
);

/**
 * DELETE /api/solicitudes/:id
 * RF-SOL-04: Cancelar solicitud
 */
router.delete('/:id', solicitudController.handleCancel);

/**
 * POST /api/solicitudes/:id/accept
 * RF-EMP-03: Aceptar solicitud como voluntario
 * RF-EMP-04: Máximo 2 solicitudes activas
 * Solo ESTUDIANTE
 */
router.post(
  '/:id/accept',
  roleMiddleware('ESTUDIANTE'),
  solicitudController.handleAccept
);

/**
 * POST /api/solicitudes/:id/cancel-acceptance
 * RF-EJE-01: Voluntario cancela tarea aceptada
 * RN-08: <4h = inasistencia
 */
router.post(
  '/:id/cancel-acceptance',
  roleMiddleware('ESTUDIANTE'),
  solicitudController.handleCancelAccepted
);

/**
 * POST /api/solicitudes/:id/complete
 * RF-EJE-02: Voluntario marca tarea como completada
 */
router.post(
  '/:id/complete',
  roleMiddleware('ESTUDIANTE'),
  solicitudController.handleComplete
);

/**
 * POST /api/solicitudes/:id/confirm
 * RF-EJE-03: Adulto Mayor confirma finalización
 * RN-11: Horas se acreditan tras confirmación
 */
router.post(
  '/:id/confirm',
  roleMiddleware('ADULTO_MAYOR', 'TUTOR'),
  solicitudController.handleConfirm
);

/**
 * POST /api/solicitudes/admin/auto-approve
 * RF-EJE-05: Aprobación automática tras 48h (admin o cron)
 */
router.post(
  '/admin/auto-approve',
  roleMiddleware('ADMIN'),
  solicitudController.handleAutoApprove
);

module.exports = router;
