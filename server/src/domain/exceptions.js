// ============================================================================
// Custom Exceptions — Capa Domain
// Equivalente a core/exceptions/__init__.py de Django
// Excepciones tipadas para manejo centralizado de errores
// ============================================================================

/**
 * RoleValidationError — Error cuando el rol no es válido o no puede asignarse.
 * Equivalente a: class RoleValidationError(ValueError) en Django
 */
class RoleValidationError extends Error {
  constructor(message = 'El rol no es válido o no puede asignarse.') {
    super(message);
    this.name = 'RoleValidationError';
    this.statusCode = 400;
  }
}

/**
 * SensitiveDataAccessError — Error al acceder a datos sensibles sin permisos.
 * Equivalente a: class SensitiveDataAccessError(PermissionDenied) en Django
 * Ley 19.628: Protección de datos personales
 */
class SensitiveDataAccessError extends Error {
  constructor(message = 'Acceso denegado a datos sensibles (Ley 19.628).') {
    super(message);
    this.name = 'SensitiveDataAccessError';
    this.statusCode = 403;
  }
}

/**
 * TaskAssignmentError — Error en la asignación de tareas.
 * Equivalente a: class TaskAssignmentError(ValueError) en Django
 */
class TaskAssignmentError extends Error {
  constructor(message = 'Error en la asignación de la tarea.') {
    super(message);
    this.name = 'TaskAssignmentError';
    this.statusCode = 409;
  }
}

/**
 * AuthenticationError — Error de autenticación.
 */
class AuthenticationError extends Error {
  constructor(message = 'Credenciales inválidas.') {
    super(message);
    this.name = 'AuthenticationError';
    this.statusCode = 401;
  }
}

/**
 * NotFoundError — Recurso no encontrado.
 */
class NotFoundError extends Error {
  constructor(message = 'Recurso no encontrado.') {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

module.exports = {
  RoleValidationError,
  SensitiveDataAccessError,
  TaskAssignmentError,
  AuthenticationError,
  NotFoundError,
};
