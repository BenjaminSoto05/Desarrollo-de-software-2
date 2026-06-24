const {
  RoleValidationError,
  SensitiveDataAccessError,
  TaskAssignmentError,
  AuthenticationError,
  NotFoundError,
} = require('../../../src/domain/exceptions');

describe('Domain Exceptions', () => {
  test('RoleValidationError → 400', () => {
    const e = new RoleValidationError('test');
    expect(e.statusCode).toBe(400);
    expect(e.name).toBe('RoleValidationError');
    expect(e.message).toBe('test');
  });

  test('SensitiveDataAccessError → 403', () => {
    const e = new SensitiveDataAccessError();
    expect(e.statusCode).toBe(403);
    expect(e.name).toBe('SensitiveDataAccessError');
  });

  test('TaskAssignmentError → 409', () => {
    const e = new TaskAssignmentError();
    expect(e.statusCode).toBe(409);
    expect(e.name).toBe('TaskAssignmentError');
  });

  test('AuthenticationError → 401', () => {
    const e = new AuthenticationError();
    expect(e.statusCode).toBe(401);
    expect(e.name).toBe('AuthenticationError');
  });

  test('NotFoundError → 404', () => {
    const e = new NotFoundError('No encontrado');
    expect(e.statusCode).toBe(404);
    expect(e.message).toBe('No encontrado');
  });
});
