// ============================================================================
// Middleware: Autorización por Rol
// Capa: Presentation
// Verifica que el usuario tenga uno de los roles permitidos
// ============================================================================

/**
 * Crea un middleware que restringe el acceso a roles específicos.
 * Debe usarse después de authMiddleware.
 *
 * @param {...string} allowedRoles - Roles permitidos (ej: 'ESTUDIANTE', 'ADMIN')
 * @returns {Function} Middleware de Express
 *
 * @example
 * router.get('/admin', authMiddleware, roleMiddleware('ADMIN'), controller);
 * router.post('/solicitudes', authMiddleware, roleMiddleware('ADULTO_MAYOR', 'TUTOR'), controller);
 */
function roleMiddleware(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Autenticación requerida.',
      });
    }

    if (!allowedRoles.includes(req.user.rol)) {
      return res.status(403).json({
        success: false,
        error: `Acceso denegado. Se requiere uno de los siguientes roles: ${allowedRoles.join(', ')}.`,
      });
    }

    next();
  };
}

module.exports = roleMiddleware;
