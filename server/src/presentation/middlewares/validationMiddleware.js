// ============================================================================
// Middleware: Reglas de Validación para Auth
// Capa: Presentation
// Usa express-validator para validar inputs antes de llegar al controller
// ============================================================================

const { body, validationResult } = require('express-validator');

/**
 * Procesa los resultados de validación y retorna errores si los hay.
 */
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Error de validación.',
      details: errors.array().map((err) => ({
        campo: err.path,
        mensaje: err.msg,
      })),
    });
  }

  next();
}

/**
 * Reglas de validación para registro de estudiante.
 * RF-USR-01
 */
const registerStudentRules = [
  body('email')
    .isEmail().withMessage('Debe proporcionar un email válido.')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres.')
    .matches(/[A-Z]/).withMessage('La contraseña debe contener al menos una mayúscula.')
    .matches(/[0-9]/).withMessage('La contraseña debe contener al menos un número.'),
  body('rut')
    .notEmpty().withMessage('El RUT es requerido.')
    .isString(),
  body('nombre')
    .notEmpty().withMessage('El nombre es requerido.')
    .isLength({ min: 2, max: 50 }).withMessage('El nombre debe tener entre 2 y 50 caracteres.')
    .trim(),
  body('apellido')
    .notEmpty().withMessage('El apellido es requerido.')
    .isLength({ min: 2, max: 50 }).withMessage('El apellido debe tener entre 2 y 50 caracteres.')
    .trim(),
  body('telefono')
    .optional({ values: 'falsy' })
    .isMobilePhone('es-CL').withMessage('Debe proporcionar un teléfono válido.'),
  handleValidationErrors,
];

/**
 * Reglas de validación para registro de adulto mayor / tutor.
 * RF-USR-02
 */
const registerElderlyRules = [
  body('email')
    .isEmail().withMessage('Debe proporcionar un email válido.')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres.'),
  body('rut')
    .notEmpty().withMessage('El RUT es requerido.')
    .isString(),
  body('nombre')
    .notEmpty().withMessage('El nombre es requerido.')
    .isLength({ min: 2, max: 50 })
    .trim(),
  body('apellido')
    .notEmpty().withMessage('El apellido es requerido.')
    .isLength({ min: 2, max: 50 })
    .trim(),
  body('rol')
    .notEmpty().withMessage('El rol es requerido.')
    .isIn(['ADULTO_MAYOR', 'TUTOR']).withMessage('El rol debe ser ADULTO_MAYOR o TUTOR.'),
  body('telefono')
    .optional()
    .isString(),
  body('comuna')
    .optional()
    .isString()
    .trim(),
  body('direccion')
    .optional()
    .isString()
    .trim(),
  handleValidationErrors,
];

/**
 * Reglas de validación para login.
 * RF-USR-03
 */
const loginRules = [
  body('email')
    .isEmail().withMessage('Debe proporcionar un email válido.')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('La contraseña es requerida.'),
  handleValidationErrors,
];

module.exports = {
  registerStudentRules,
  registerElderlyRules,
  loginRules,
  handleValidationErrors,
};
