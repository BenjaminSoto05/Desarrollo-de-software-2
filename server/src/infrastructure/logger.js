// ============================================================================
// Security Logger — RNF-SEG-03
// Equivalente al LOGGING de Django settings.py
// Escribe auditoría de seguridad a security.log
// ============================================================================

const winston = require('winston');
const path = require('path');

const logDir = path.join(__dirname, '..', '..', 'logs');

// Formato idéntico al Django verbose: {levelname} {asctime} {module} {message}
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ level, message, timestamp, module }) => {
    return `${level.toUpperCase()} ${timestamp} ${module || 'app'} ${message}`;
  })
);

// Logger principal de la aplicación
const logger = winston.createLogger({
  level: 'info',
  format: logFormat,
  transports: [
    // Console — solo warnings+ en producción
    new winston.transports.Console({
      level: process.env.NODE_ENV === 'production' ? 'warn' : 'info',
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      ),
    }),

    // Archivo de seguridad — equivalente al handler 'security' de Django
    new winston.transports.File({
      filename: path.join(logDir, 'security.log'),
      level: 'warn',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // Archivo general de errores
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});

// Logger específico para auditoría de seguridad (acceso a datos sensibles)
const securityLogger = {
  // Acceso a datos sensibles (dirección, teléfono) — Ley 19.628
  accessSensitiveData(userId, resource, solicitudId) {
    logger.warn(
      `Acceso a datos sensibles (${resource}) por usuario: ${userId} para solicitud ${solicitudId}`,
      { module: 'security.privacy' }
    );
  },

  // Intento de acceso denegado
  accessDenied(userId, resource, solicitudId) {
    logger.warn(
      `Intento de acceso denegado a ${resource} por: ${userId} en solicitud ${solicitudId}`,
      { module: 'security.privacy' }
    );
  },

  // Login exitoso
  loginSuccess(userId, email) {
    logger.info(`Login exitoso: ${email} (ID: ${userId})`, { module: 'security.auth' });
  },

  // Login fallido
  loginFailed(email, reason) {
    logger.warn(`Login fallido: ${email} — ${reason}`, { module: 'security.auth' });
  },

  // Suspensión de usuario (RN-09)
  userSuspended(userId, reason) {
    logger.warn(`Usuario suspendido: ${userId} — ${reason}`, { module: 'security.suspension' });
  },

  // Inasistencia registrada (RN-08)
  inasistenciaRegistered(userId, solicitudId) {
    logger.warn(
      `Inasistencia registrada para usuario ${userId} en solicitud ${solicitudId}`,
      { module: 'security.inasistencia' }
    );
  },

  // ============================================================
  // Auditoría de datos sensibles — Equivalente a core/audit/log_sensitive_access()
  // Cumple con Ley 19.628 y privacidad por diseño.
  // ============================================================
  logSensitiveAccess(user, entityName, entityId, field, action) {
    logger.info(
      `Auditoría: Usuario ${user.email} (${user.rol}) accedió a campo '${field}' ` +
      `en ${entityName} ID ${entityId} mediante acción '${action}' ` +
      `el ${new Date().toISOString()}`,
      { module: 'core.audit' }
    );
  },
};

module.exports = { logger, securityLogger };
