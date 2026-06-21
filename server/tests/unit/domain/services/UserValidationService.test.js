// ============================================================================
// Tests Unitarios: UserValidationService
// Capa: Domain — Reglas de negocio RN-02, RN-03
// ============================================================================

const { UserValidationService, COMUNAS_PERMITIDAS } = require('../../../../src/domain/services/UserValidationService');

describe('UserValidationService', () => {

  describe('validarEmailEstudiante() — RN-02', () => {
    test('debe aceptar email @uct.cl', () => {
      const result = UserValidationService.validarEmailEstudiante('profesor@uct.cl');
      expect(result.valid).toBe(true);
    });

    test('debe aceptar email @alu.uct.cl', () => {
      const result = UserValidationService.validarEmailEstudiante('juan.perez@alu.uct.cl');
      expect(result.valid).toBe(true);
    });

    test('debe ser case-insensitive', () => {
      const result = UserValidationService.validarEmailEstudiante('Juan.Perez@ALU.UCT.CL');
      expect(result.valid).toBe(true);
    });

    test('debe rechazar email de gmail', () => {
      const result = UserValidationService.validarEmailEstudiante('juan@gmail.com');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('dominio institucional');
    });

    test('debe rechazar email de hotmail', () => {
      const result = UserValidationService.validarEmailEstudiante('juan@hotmail.com');
      expect(result.valid).toBe(false);
    });

    test('debe rechazar email vacío', () => {
      const result = UserValidationService.validarEmailEstudiante('');
      expect(result.valid).toBe(false);
    });

    test('debe rechazar email null', () => {
      const result = UserValidationService.validarEmailEstudiante(null);
      expect(result.valid).toBe(false);
    });
  });

  describe('validarRut()', () => {
    test('debe validar un RUT correcto (11.111.111-1)', () => {
      // RUT válido conocido: 12.345.678-5
      const result = UserValidationService.validarRut('12345678-5');
      expect(result.valid).toBe(true);
    });

    test('debe rechazar un RUT con dígito verificador incorrecto', () => {
      const result = UserValidationService.validarRut('12345678-0');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('dígito verificador');
    });

    test('debe rechazar RUT vacío', () => {
      const result = UserValidationService.validarRut('');
      expect(result.valid).toBe(false);
    });

    test('debe rechazar RUT null', () => {
      const result = UserValidationService.validarRut(null);
      expect(result.valid).toBe(false);
    });

    test('debe rechazar RUT con letras en el cuerpo', () => {
      const result = UserValidationService.validarRut('ABCDEFGH-I');
      expect(result.valid).toBe(false);
    });

    test('debe aceptar RUT con puntos (formato completo)', () => {
      const result = UserValidationService.validarRut('12.345.678-5');
      expect(result.valid).toBe(true);
    });
  });

  describe('calcularDigitoVerificador()', () => {
    test('debe calcular correctamente el DV', () => {
      // RUT 12345678 → DV esperado: 5
      const dv = UserValidationService.calcularDigitoVerificador('12345678');
      expect(dv).toBe('5');
    });
  });

  describe('validarComuna() — RN-03', () => {
    test('debe aceptar Temuco', () => {
      const result = UserValidationService.validarComuna('Temuco');
      expect(result.valid).toBe(true);
    });

    test('debe aceptar Padre Las Casas', () => {
      const result = UserValidationService.validarComuna('Padre Las Casas');
      expect(result.valid).toBe(true);
    });

    test('debe ser case-insensitive', () => {
      const result = UserValidationService.validarComuna('TEMUCO');
      expect(result.valid).toBe(true);
    });

    test('debe rechazar Santiago', () => {
      const result = UserValidationService.validarComuna('Santiago');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('solo está disponible');
    });

    test('debe rechazar comuna vacía', () => {
      const result = UserValidationService.validarComuna('');
      expect(result.valid).toBe(false);
    });
  });

  describe('normalizarRut()', () => {
    test('debe normalizar RUT con puntos', () => {
      const result = UserValidationService.normalizarRut('12.345.678-5');
      expect(result).toBe('12345678-5');
    });

    test('debe agregar guión si no lo tiene', () => {
      const result = UserValidationService.normalizarRut('123456785');
      expect(result).toBe('12345678-5');
    });
  });

  describe('assignRoleByEmailDomain()', () => {
    test('debe asignar ESTUDIANTE para @uct.cl', () => {
      expect(UserValidationService.assignRoleByEmailDomain('prof@uct.cl')).toBe('ESTUDIANTE');
    });

    test('debe asignar ESTUDIANTE para @alu.uct.cl', () => {
      expect(UserValidationService.assignRoleByEmailDomain('juan@alu.uct.cl')).toBe('ESTUDIANTE');
    });

    test('debe asignar ADULTO_MAYOR para dominios externos', () => {
      expect(UserValidationService.assignRoleByEmailDomain('maria@gmail.com')).toBe('ADULTO_MAYOR');
    });

    test('debe asignar ADULTO_MAYOR si email es null', () => {
      expect(UserValidationService.assignRoleByEmailDomain(null)).toBe('ADULTO_MAYOR');
    });
  });
});
