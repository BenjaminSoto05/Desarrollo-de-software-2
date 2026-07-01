// ============================================================================
// Middleware consolidado: autorización por rol y permisos
// Capa: Presentation
// ============================================================================

/**
 * Middleware factory que restringe acceso a roles específicos.
 * @param {...string} allowedRoles - Roles permitidos
 * @returns {Function} Middleware de Express
 */
function requireRole(...allowedRoles) {
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

const canPublishSolicitud = requireRole('ADULTO_MAYOR', 'TUTOR');
const canAcceptTask = requireRole('ESTUDIANTE');
const canModerateContent = requireRole('ADMIN');
const canGenerateCertificate = requireRole('ESTUDIANTE', 'ADMIN');
const isAdultoMayor = requireRole('ADULTO_MAYOR');
const isEstudianteUCT = requireRole('ESTUDIANTE');
const isAdministrador = requireRole('ADMIN');

module.exports = {
  requireRole,
  canPublishSolicitud,
  canAcceptTask,
  canModerateContent,
  canGenerateCertificate,
  isAdultoMayor,
  isEstudianteUCT,
  isAdministrador,
};
