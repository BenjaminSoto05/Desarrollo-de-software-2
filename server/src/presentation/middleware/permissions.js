// ============================================================================
// Middleware: Role-Based Permissions — RNF-SEG
// Equivalente a core/auth/permissions.py de Django (DRF BasePermission)
// Permisos granulares por rol para cada operación
// ============================================================================

/**
 * Middleware factory: Restringe acceso por rol(es).
 * Equivalente a IsAdultoMayor, IsEstudianteUCT, IsAdministrador de Django.
 * @param  {...string} roles - Roles permitidos
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'No autenticado.' });
    }
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({
        success: false,
        error: `Permiso denegado. Se requiere rol: ${roles.join(' o ')}.`,
      });
    }
    next();
  };
}

// ============================================================================
// Permisos específicos (equivalentes directos de Django permissions.py)
// ============================================================================

/**
 * CanPublishSolicitud — Solo Adulto Mayor o Tutor puede publicar solicitudes.
 * Equivalente a: class CanPublishSolicitud(permissions.BasePermission)
 */
const canPublishSolicitud = requireRole('ADULTO_MAYOR', 'TUTOR');

/**
 * CanAcceptTask — Solo Estudiante UCT puede aceptar tareas.
 * Equivalente a: class CanAcceptTask(permissions.BasePermission)
 */
const canAcceptTask = requireRole('ESTUDIANTE');

/**
 * CanModerateContent — Solo Administrador puede moderar contenido.
 * Equivalente a: class CanModerateContent(permissions.BasePermission)
 */
const canModerateContent = requireRole('ADMIN');

/**
 * CanGenerateCertificate — Estudiante o Admin pueden generar certificados.
 * Equivalente a: class CanGenerateCertificate(permissions.BasePermission)
 */
const canGenerateCertificate = requireRole('ESTUDIANTE', 'ADMIN');

/**
 * IsAdultoMayor — Permiso para usuarios con rol Adulto Mayor.
 */
const isAdultoMayor = requireRole('ADULTO_MAYOR');

/**
 * IsEstudianteUCT — Permiso para usuarios con rol Estudiante UCT.
 */
const isEstudianteUCT = requireRole('ESTUDIANTE');

/**
 * IsAdministrador — Permiso para usuarios con rol Administrador.
 */
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
