const { UserValidationService } = require('../../../../src/domain/services/UserValidationService');

describe('UserValidationService', () => {
  describe('validarEmailEstudiante() — RN-02', () => {
    test('acepta @uct.cl', () => { expect(UserValidationService.validarEmailEstudiante('prof@uct.cl').valid).toBe(true); });
    test('acepta @alu.uct.cl', () => { expect(UserValidationService.validarEmailEstudiante('juan@alu.uct.cl').valid).toBe(true); });
    test('case-insensitive', () => { expect(UserValidationService.validarEmailEstudiante('J@ALU.UCT.CL').valid).toBe(true); });
    test('rechaza gmail', () => { expect(UserValidationService.validarEmailEstudiante('j@gmail.com').valid).toBe(false); });
    test('rechaza hotmail', () => { expect(UserValidationService.validarEmailEstudiante('j@hotmail.com').valid).toBe(false); });
    test('rechaza vacío', () => { expect(UserValidationService.validarEmailEstudiante('').valid).toBe(false); });
    test('rechaza null', () => { expect(UserValidationService.validarEmailEstudiante(null).valid).toBe(false); });
  });

  describe('validarRut()', () => {
    test('valida RUT correcto', () => { expect(UserValidationService.validarRut('12345678-5').valid).toBe(true); });
    test('rechaza DV incorrecto', () => { expect(UserValidationService.validarRut('12345678-0').valid).toBe(false); });
    test('rechaza vacío', () => { expect(UserValidationService.validarRut('').valid).toBe(false); });
    test('rechaza null', () => { expect(UserValidationService.validarRut(null).valid).toBe(false); });
    test('rechaza letras', () => { expect(UserValidationService.validarRut('ABCDEFGH-I').valid).toBe(false); });
    test('acepta con puntos', () => { expect(UserValidationService.validarRut('12.345.678-5').valid).toBe(true); });
  });

  describe('calcularDigitoVerificador()', () => {
    test('calcula DV correctamente', () => {
      expect(UserValidationService.calcularDigitoVerificador('12345678')).toBe('5');
    });
  });

  describe('validarComuna() — RN-03', () => {
    test('acepta Temuco', () => { expect(UserValidationService.validarComuna('Temuco').valid).toBe(true); });
    test('acepta Padre Las Casas', () => { expect(UserValidationService.validarComuna('Padre Las Casas').valid).toBe(true); });
    test('case-insensitive', () => { expect(UserValidationService.validarComuna('TEMUCO').valid).toBe(true); });
    test('rechaza Santiago', () => { expect(UserValidationService.validarComuna('Santiago').valid).toBe(false); });
    test('rechaza vacía', () => { expect(UserValidationService.validarComuna('').valid).toBe(false); });
  });

  describe('normalizarRut()', () => {
    test('normaliza con puntos', () => {
      expect(UserValidationService.normalizarRut('12.345.678-5')).toBe('12345678-5');
    });
    test('agrega guión', () => {
      expect(UserValidationService.normalizarRut('123456785')).toBe('12345678-5');
    });
  });

  describe('assignRoleByEmailDomain()', () => {
    test('ESTUDIANTE para @uct.cl', () => { expect(UserValidationService.assignRoleByEmailDomain('p@uct.cl')).toBe('ESTUDIANTE'); });
    test('ESTUDIANTE para @alu.uct.cl', () => { expect(UserValidationService.assignRoleByEmailDomain('j@alu.uct.cl')).toBe('ESTUDIANTE'); });
    test('ADULTO_MAYOR para externos', () => { expect(UserValidationService.assignRoleByEmailDomain('m@gmail.com')).toBe('ADULTO_MAYOR'); });
    test('ADULTO_MAYOR si null', () => { expect(UserValidationService.assignRoleByEmailDomain(null)).toBe('ADULTO_MAYOR'); });
  });
});
