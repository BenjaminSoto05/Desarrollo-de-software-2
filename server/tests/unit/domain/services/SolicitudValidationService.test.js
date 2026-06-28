const {
  SolicitudValidationService,
  HORARIO_INICIO,
  HORARIO_FIN,
  HORAS_ANTICIPACION_MINIMA,
} = require('../../../../src/domain/services/SolicitudValidationService');

describe('SolicitudValidationService', () => {
  describe('validarHorario() — RN-04', () => {
    test('acepta 08:00', () => { expect(SolicitudValidationService.validarHorario('08:00').valid).toBe(true); });
    test('acepta 19:59', () => { expect(SolicitudValidationService.validarHorario('19:59').valid).toBe(true); });
    test('rechaza 20:00', () => { expect(SolicitudValidationService.validarHorario('20:00').valid).toBe(false); });
    test('rechaza 07:59', () => { expect(SolicitudValidationService.validarHorario('07:59').valid).toBe(false); });
    test('rechaza 23:00', () => { expect(SolicitudValidationService.validarHorario('23:00').valid).toBe(false); });
    test('rechaza 00:00', () => { expect(SolicitudValidationService.validarHorario('00:00').valid).toBe(false); });
    test('rechaza formato inválido', () => { expect(SolicitudValidationService.validarHorario('abc').valid).toBe(false); });
    test('rechaza null', () => { expect(SolicitudValidationService.validarHorario(null).valid).toBe(false); });
    test('rechaza undefined', () => { expect(SolicitudValidationService.validarHorario(undefined).valid).toBe(false); });
  });

  describe('validarFechaFutura()', () => {
    test('acepta fecha futura', () => {
      const f = new Date(); f.setDate(f.getDate() + 7);
      expect(SolicitudValidationService.validarFechaFutura(f).valid).toBe(true);
    });
    test('rechaza fecha pasada', () => {
      expect(SolicitudValidationService.validarFechaFutura(new Date('2020-01-01')).valid).toBe(false);
    });
  });

  describe('validarAnticipacion() — RN-05', () => {
    test('acepta >24h', () => {
      const f = new Date(); f.setDate(f.getDate() + 3);
      expect(SolicitudValidationService.validarAnticipacion(f, '10:00').valid).toBe(true);
    });
    test('rechaza <24h', () => {
      const f = new Date(); f.setHours(f.getHours() + 2);
      const hora = f.getHours().toString().padStart(2, '0') + ':00';
      expect(SolicitudValidationService.validarAnticipacion(f, hora).valid).toBe(false);
    });
  });

  describe('cancelacionGeneraInasistencia() — RN-08', () => {
    test('genera si <4h', () => {
      const f = new Date(); f.setHours(f.getHours() + 2);
      const hora = f.getHours().toString().padStart(2, '0') + ':00';
      expect(SolicitudValidationService.cancelacionGeneraInasistencia(f, hora)).toBe(true);
    });
    test('no genera si >4h', () => {
      const f = new Date(); f.setDate(f.getDate() + 3);
      expect(SolicitudValidationService.cancelacionGeneraInasistencia(f, '10:00')).toBe(false);
    });
  });

  describe('validarCreacion()', () => {
    test('acepta datos válidos', () => {
      const f = new Date(); f.setDate(f.getDate() + 3);
      const r = SolicitudValidationService.validarCreacion({ fechaProgramada: f, horaProgramada: '10:00' });
      expect(r.valid).toBe(true);
      expect(r.errors).toHaveLength(0);
    });
    test('acumula errores', () => {
      const r = SolicitudValidationService.validarCreacion({ fechaProgramada: new Date('2020-01-01'), horaProgramada: '23:00' });
      expect(r.valid).toBe(false);
      expect(r.errors.length).toBeGreaterThanOrEqual(1);
    });
  });
});
