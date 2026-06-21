// ============================================================================
// Tests Unitarios: SolicitudValidationService
// Capa: Domain — Reglas de negocio RN-04, RN-05, RN-08
// ============================================================================

const {
  SolicitudValidationService,
  HORARIO_INICIO,
  HORARIO_FIN,
  HORAS_ANTICIPACION_MINIMA,
  HORAS_CANCELACION_SIN_PENALIZACION,
} = require('../../../../src/domain/services/SolicitudValidationService');

describe('SolicitudValidationService', () => {

  describe('validarHorario() — RN-04', () => {
    test('debe aceptar hora 08:00', () => {
      const result = SolicitudValidationService.validarHorario('08:00');
      expect(result.valid).toBe(true);
    });

    test('debe aceptar hora 19:59', () => {
      const result = SolicitudValidationService.validarHorario('19:59');
      expect(result.valid).toBe(true);
    });

    test('debe rechazar hora 20:00', () => {
      const result = SolicitudValidationService.validarHorario('20:00');
      expect(result.valid).toBe(false);
      expect(result.error).toContain(`${HORARIO_INICIO}:00`);
    });

    test('debe rechazar hora 07:59', () => {
      const result = SolicitudValidationService.validarHorario('07:59');
      expect(result.valid).toBe(false);
    });

    test('debe rechazar hora 23:00', () => {
      const result = SolicitudValidationService.validarHorario('23:00');
      expect(result.valid).toBe(false);
    });

    test('debe rechazar hora 00:00', () => {
      const result = SolicitudValidationService.validarHorario('00:00');
      expect(result.valid).toBe(false);
    });

    test('debe rechazar formato inválido', () => {
      const result = SolicitudValidationService.validarHorario('abc');
      expect(result.valid).toBe(false);
    });

    test('debe rechazar hora null', () => {
      const result = SolicitudValidationService.validarHorario(null);
      expect(result.valid).toBe(false);
    });

    test('debe rechazar hora undefined', () => {
      const result = SolicitudValidationService.validarHorario(undefined);
      expect(result.valid).toBe(false);
    });

    test('debe rechazar hora con minutos inválidos', () => {
      const result = SolicitudValidationService.validarHorario('10:99');
      expect(result.valid).toBe(false);
    });
  });

  describe('validarFechaFutura()', () => {
    test('debe aceptar una fecha futura', () => {
      const futuro = new Date();
      futuro.setDate(futuro.getDate() + 7);
      const result = SolicitudValidationService.validarFechaFutura(futuro);
      expect(result.valid).toBe(true);
    });

    test('debe rechazar una fecha pasada', () => {
      const pasado = new Date('2020-01-01');
      const result = SolicitudValidationService.validarFechaFutura(pasado);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('pasado');
    });
  });

  describe('validarAnticipacion() — RN-05', () => {
    test('debe aceptar solicitud con más de 24h de anticipación', () => {
      const futuro = new Date();
      futuro.setDate(futuro.getDate() + 3);
      const result = SolicitudValidationService.validarAnticipacion(futuro, '10:00');
      expect(result.valid).toBe(true);
    });

    test('debe rechazar solicitud con menos de 24h de anticipación', () => {
      const pronto = new Date();
      pronto.setHours(pronto.getHours() + 2);
      const result = SolicitudValidationService.validarAnticipacion(pronto, pronto.getHours().toString().padStart(2, '0') + ':00');
      expect(result.valid).toBe(false);
      expect(result.error).toContain(`${HORAS_ANTICIPACION_MINIMA}`);
    });
  });

  describe('cancelacionGeneraInasistencia() — RN-08', () => {
    test('debe generar inasistencia si faltan menos de 4 horas', () => {
      const pronto = new Date();
      pronto.setHours(pronto.getHours() + 2);
      const hora = pronto.getHours().toString().padStart(2, '0') + ':00';
      const result = SolicitudValidationService.cancelacionGeneraInasistencia(pronto, hora);
      expect(result).toBe(true);
    });

    test('no debe generar inasistencia si faltan más de 4 horas', () => {
      const lejano = new Date();
      lejano.setDate(lejano.getDate() + 3);
      const result = SolicitudValidationService.cancelacionGeneraInasistencia(lejano, '10:00');
      expect(result).toBe(false);
    });
  });

  describe('validarCreacion()', () => {
    test('debe aceptar datos válidos', () => {
      const futuro = new Date();
      futuro.setDate(futuro.getDate() + 3);
      const result = SolicitudValidationService.validarCreacion({
        fechaProgramada: futuro,
        horaProgramada: '10:00',
      });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('debe acumular múltiples errores', () => {
      const pasado = new Date('2020-01-01');
      const result = SolicitudValidationService.validarCreacion({
        fechaProgramada: pasado,
        horaProgramada: '23:00',
      });
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(1);
    });
  });
});
