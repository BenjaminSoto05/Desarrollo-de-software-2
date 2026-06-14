// ============================================================================
// Rutas: Evaluaciones
// Capa: Presentation
// RF-EJE-04: Evaluaciones con estrellas
// ============================================================================

const { Router } = require('express');
const { body } = require('express-validator');

// Middlewares
const authMiddleware = require('../middlewares/authMiddleware');
const { handleValidationErrors } = require('../middlewares/validationMiddleware');

// Infraestructura
const prisma = require('../../infrastructure/database/prismaClient');
const PrismaEvaluacionRepository = require('../../infrastructure/repositories/PrismaEvaluacionRepository');
const PrismaSolicitudRepository = require('../../infrastructure/repositories/PrismaSolicitudRepository');

// Use Cases
const CreateEvaluacionUseCase = require('../../application/use-cases/evaluacion/CreateEvaluacionUseCase');
const GetEvaluacionesUseCase = require('../../application/use-cases/evaluacion/GetEvaluacionesUseCase');

// Controller
const EvaluacionController = require('../controllers/EvaluacionController');

// Dependency Injection
const evaluacionRepository = new PrismaEvaluacionRepository(prisma);
const solicitudRepository = new PrismaSolicitudRepository(prisma);

const evaluacionController = new EvaluacionController({
  createEvaluacion: new CreateEvaluacionUseCase(evaluacionRepository, solicitudRepository),
  getEvaluaciones: new GetEvaluacionesUseCase(evaluacionRepository),
});

// Validaciones
const createEvaluacionRules = [
  body('solicitudId')
    .notEmpty().withMessage('El ID de la solicitud es requerido.')
    .isUUID().withMessage('ID de solicitud inválido.'),
  body('puntuacion')
    .notEmpty().withMessage('La puntuación es requerida.')
    .isInt({ min: 1, max: 5 }).withMessage('La puntuación debe ser un número entre 1 y 5.'),
  body('comentario')
    .optional()
    .isLength({ max: 500 }).withMessage('El comentario no debe superar los 500 caracteres.')
    .trim(),
  handleValidationErrors,
];

// Rutas
const router = Router();

router.use(authMiddleware);

/**
 * POST /api/evaluaciones
 * RF-EJE-04: Crear evaluación con estrellas
 */
router.post('/', createEvaluacionRules, evaluacionController.handleCreate);

/**
 * GET /api/evaluaciones/solicitud/:solicitudId
 * Obtener evaluaciones de una solicitud
 */
router.get('/solicitud/:solicitudId', evaluacionController.handleGetBySolicitud);

module.exports = router;
