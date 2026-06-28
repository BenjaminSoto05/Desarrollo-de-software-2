// =======================================================================
// Test: exceptions.test.js
// Capa: Domain — Excepciones personalizadas
// Cubre: nombre correcto, mensaje correcto, statusCode correcto
// Rúbrica: Excepciones de dominio con cobertura ≥ 70%
// =======================================================================

const {
  RoleValidationError,
  SensitiveDataAccessError,
  TaskAssignmentError,
  AuthenticationError,
  NotFoundError,
} = require('../../../src/domain/exceptions');

describe('Domain Exceptions', () => {
  // ── RoleValidationError ───────────────────────────────────────────
  describe('RoleValidationError', () => {
    it('debe tener name = "RoleValidationError"', () => {
      const err = new RoleValidationError();
      expect(err.name).toBe('RoleValidationError');
    });

    it('debe tener statusCode = 400', () => {
      const err = new RoleValidationError();
      expect(err.statusCode).toBe(400);
    });

    it('debe usar el mensaje por defecto si no se proporciona', () => {
      const err = new RoleValidationError();
      expect(err.message).toBe('El rol no es válido o no puede asignarse.');
    });

    it('debe aceptar un mensaje personalizado', () => {
      const err = new RoleValidationError('Rol no permitido para esta acción.');
      expect(err.message).toBe('Rol no permitido para esta acción.');
    });

    it('debe ser instancia de Error', () => {
      const err = new RoleValidationError();
      expect(err).toBeInstanceOf(Error);
    });

    it('debe ser instancia de RoleValidationError', () => {
      const err = new RoleValidationError();
      expect(err).toBeInstanceOf(RoleValidationError);
    });
  });

  // ── SensitiveDataAccessError ──────────────────────────────────────
  describe('SensitiveDataAccessError', () => {
    it('debe tener name = "SensitiveDataAccessError"', () => {
      const err = new SensitiveDataAccessError();
      expect(err.name).toBe('SensitiveDataAccessError');
    });

    it('debe tener statusCode = 403', () => {
      const err = new SensitiveDataAccessError();
      expect(err.statusCode).toBe(403);
    });

    it('debe usar el mensaje por defecto si no se proporciona', () => {
      const err = new SensitiveDataAccessError();
      expect(err.message).toContain('Ley 19.628');
    });

    it('debe aceptar un mensaje personalizado', () => {
      const err = new SensitiveDataAccessError('Acceso restringido.');
      expect(err.message).toBe('Acceso restringido.');
    });

    it('debe ser instancia de Error', () => {
      expect(new SensitiveDataAccessError()).toBeInstanceOf(Error);
    });
  });

  // ── TaskAssignmentError ───────────────────────────────────────────
  describe('TaskAssignmentError', () => {
    it('debe tener name = "TaskAssignmentError"', () => {
      const err = new TaskAssignmentError();
      expect(err.name).toBe('TaskAssignmentError');
    });

    it('debe tener statusCode = 409', () => {
      const err = new TaskAssignmentError();
      expect(err.statusCode).toBe(409);
    });

    it('debe usar el mensaje por defecto si no se proporciona', () => {
      const err = new TaskAssignmentError();
      expect(err.message).toBe('Error en la asignación de la tarea.');
    });

    it('debe aceptar un mensaje personalizado', () => {
      const err = new TaskAssignmentError('El estudiante ya tiene 2 tareas activas.');
      expect(err.message).toBe('El estudiante ya tiene 2 tareas activas.');
    });

    it('debe ser instancia de Error', () => {
      expect(new TaskAssignmentError()).toBeInstanceOf(Error);
    });
  });

  // ── AuthenticationError ───────────────────────────────────────────
  describe('AuthenticationError', () => {
    it('debe tener name = "AuthenticationError"', () => {
      const err = new AuthenticationError();
      expect(err.name).toBe('AuthenticationError');
    });

    it('debe tener statusCode = 401', () => {
      const err = new AuthenticationError();
      expect(err.statusCode).toBe(401);
    });

    it('debe usar el mensaje por defecto si no se proporciona', () => {
      const err = new AuthenticationError();
      expect(err.message).toBe('Credenciales inválidas.');
    });

    it('debe aceptar un mensaje personalizado', () => {
      const err = new AuthenticationError('Token expirado.');
      expect(err.message).toBe('Token expirado.');
    });

    it('debe ser instancia de Error', () => {
      expect(new AuthenticationError()).toBeInstanceOf(Error);
    });
  });

  // ── NotFoundError ─────────────────────────────────────────────────
  describe('NotFoundError', () => {
    it('debe tener name = "NotFoundError"', () => {
      const err = new NotFoundError();
      expect(err.name).toBe('NotFoundError');
    });

    it('debe tener statusCode = 404', () => {
      const err = new NotFoundError();
      expect(err.statusCode).toBe(404);
    });

    it('debe usar el mensaje por defecto si no se proporciona', () => {
      const err = new NotFoundError();
      expect(err.message).toBe('Recurso no encontrado.');
    });

    it('debe aceptar un mensaje personalizado', () => {
      const err = new NotFoundError('Usuario no encontrado.');
      expect(err.message).toBe('Usuario no encontrado.');
    });

    it('debe ser instancia de Error', () => {
      expect(new NotFoundError()).toBeInstanceOf(Error);
    });
  });

  // ── Comportamiento polimórfico ────────────────────────────────────
  describe('Comportamiento polimórfico — todas las excepciones', () => {
    const excepciones = [
      { Clase: RoleValidationError, statusCode: 400 },
      { Clase: SensitiveDataAccessError, statusCode: 403 },
      { Clase: TaskAssignmentError, statusCode: 409 },
      { Clase: AuthenticationError, statusCode: 401 },
      { Clase: NotFoundError, statusCode: 404 },
    ];

    excepciones.forEach(({ Clase, statusCode }) => {
      it(`${Clase.name} debe ser catchable como Error`, () => {
        expect(() => {
          throw new Clase();
        }).toThrow(Error);
      });

      it(`${Clase.name} debe tener statusCode = ${statusCode}`, () => {
        expect(new Clase().statusCode).toBe(statusCode);
      });
    });
  });
});
