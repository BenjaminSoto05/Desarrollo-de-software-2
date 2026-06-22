// ============================================================================
// Tests Unitarios: Domain Exceptions
// Capa: Domain
// ============================================================================

const {
  RoleValidationError,
  SensitiveDataAccessError,
  TaskAssignmentError,
  AuthenticationError,
  NotFoundError,
} = require('../../../src/domain/exceptions');

describe('Domain Exceptions', () => {
  describe('RoleValidationError', () => {
    test('debe tener statusCode 400', () => {
      const err = new RoleValidationError();
      expect(err.statusCode).toBe(400);
      expect(err.name).toBe('RoleValidationError');
    });

    test('debe aceptar mensaje personalizado', () => {
      const err = new RoleValidationError('Rol inválido');
      expect(err.message).toBe('Rol inválido');
    });
  });

  describe('SensitiveDataAccessError', () => {
    test('debe tener statusCode 403', () => {
      const err = new SensitiveDataAccessError();
      expect(err.statusCode).toBe(403);
      expect(err.name).toBe('SensitiveDataAccessError');
      expect(err.message).toContain('19.628');
    });
  });

  describe('TaskAssignmentError', () => {
    test('debe tener statusCode 409', () => {
      const err = new TaskAssignmentError();
      expect(err.statusCode).toBe(409);
      expect(err.name).toBe('TaskAssignmentError');
    });
  });

  describe('AuthenticationError', () => {
    test('debe tener statusCode 401', () => {
      const err = new AuthenticationError();
      expect(err.statusCode).toBe(401);
      expect(err.name).toBe('AuthenticationError');
    });
  });

  describe('NotFoundError', () => {
    test('debe tener statusCode 404', () => {
      const err = new NotFoundError();
      expect(err.statusCode).toBe(404);
      expect(err.name).toBe('NotFoundError');
    });

    test('debe aceptar mensaje personalizado', () => {
      const err = new NotFoundError('Solicitud no encontrada');
      expect(err.message).toBe('Solicitud no encontrada');
    });
  });
});
