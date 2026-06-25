// =======================================================================
// Test: SolicitudValidationService.test.js
// Capa: Domain — Servicio de Validación de Solicitudes
// Cubre: validarHorario, validarAnticipacion, validarFechaFutura,
//        cancelacionGeneraInasistencia, validarCreacion
// Rúbrica: Servicios de validación ≥ 70% cobertura
// =======================================================================

const {
  SolicitudValidationService,
  HORARIO_INICIO,
  HORARIO_FIN,
  HORAS_ANTICIPACION_MINIMA,
  HORAS_CANCELACION_SIN_PENALIZACION,
} = require('../../../src/domain/services/SolicitudValidationService');

// Helper: fecha futura a N horas desde ahora
const fechaEnHoras = (horas) => new Date(Date.now() + horas * 60 * 60 * 1000);

// Helper: fecha sin hora (medianoche)
const soloFecha = (offsetDias = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDias);
  d.setHours(0, 0, 0, 0);
  return d;
};

describe('SolicitudValidationService', () => {
  // ── validarHorario ────────────────────────────────────────────────
  describe('validarHorario()', () => {
    it('debe retornar valid:true para hora dentro del horario (09:00)', () => {
      expect(SolicitudValidationService.validarHorario('09:00')).toEqual({ valid: true });
    });

    it('debe retornar valid:true para el límite inferior exacto (08:00)', () => {
      expect(SolicitudValidationService.validarHorario('08:00')).toEqual({ valid: true });
    });

    it('debe retornar valid:true para hora en la tarde (15:30)', () => {
      expect(SolicitudValidationService.validarHorario('15:30')).toEqual({ valid: true });
    });

    it('debe retornar valid:true para hora justo antes del cierre (19:59)', () => {
      expect(SolicitudValidationService.validarHorario('19:59')).toEqual({ valid: true });
    });

    it(`debe retornar valid:false para hora antes de las ${HORARIO_INICIO}:00 (07:59)`, () => {
      const result = SolicitudValidationService.validarHorario('07:59');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it(`debe retornar valid:false para hora después de las ${HORARIO_FIN}:00 (20:00)`, () => {
      const result = SolicitudValidationService.validarHorario('20:00');
      expect(result.valid).toBe(false);
      // El mensaje incluye los límites del horario operativo
      expect(result.error).toBeDefined();
      expect(result.error.toLowerCase()).toMatch(/8/);
    });

    it('debe retornar valid:false para hora nula', () => {
      const result = SolicitudValidationService.validarHorario(null);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('La hora programada es requerida.');
    });

    it('debe retornar valid:false si horaProgramada no es string válido (undefined)', () => {
      const result = SolicitudValidationService.validarHorario(undefined);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('La hora programada es requerida.');
    });

    it('debe retornar valid:false para formato inválido sin separador', () => {
      const result = SolicitudValidationService.validarHorario('0900');
      expect(result.valid).toBe(false);
    });

    it('debe retornar valid:false para hora con caracteres no numéricos', () => {
      const result = SolicitudValidationService.validarHorario('ab:cd');
      expect(result.valid).toBe(false);
    });
  });

  // ── validarAnticipacion ───────────────────────────────────────────
  describe('validarAnticipacion()', () => {
    it(`debe retornar valid:true con más de ${HORAS_ANTICIPACION_MINIMA}h de anticipación`, () => {
      const fecha = fechaEnHoras(HORAS_ANTICIPACION_MINIMA + 1);
      const hora = `${fecha.getHours().toString().padStart(2, '0')}:00`;
      const result = SolicitudValidationService.validarAnticipacion(fecha, hora);
      expect(result.valid).toBe(true);
    });

    it(`debe retornar valid:false con menos de ${HORAS_ANTICIPACION_MINIMA}h de anticipación`, () => {
      const fecha = fechaEnHoras(HORAS_ANTICIPACION_MINIMA - 1);
      const hora = `${fecha.getHours().toString().padStart(2, '0')}:00`;
      const result = SolicitudValidationService.validarAnticipacion(fecha, hora);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('24 horas');
    });

    it('debe retornar valid:false para fecha en el pasado', () => {
      const fecha = fechaEnHoras(-1);
      const hora = '10:00';
      const result = SolicitudValidationService.validarAnticipacion(fecha, hora);
      expect(result.valid).toBe(false);
    });
  });

  // ── validarFechaFutura ────────────────────────────────────────────
  describe('validarFechaFutura()', () => {
    it('debe retornar valid:true para fecha de mañana', () => {
      const manana = soloFecha(1);
      expect(SolicitudValidationService.validarFechaFutura(manana)).toEqual({ valid: true });
    });

    it('debe retornar valid:true para fecha de hoy', () => {
      const hoy = soloFecha(0);
      expect(SolicitudValidationService.validarFechaFutura(hoy)).toEqual({ valid: true });
    });

    it('debe retornar valid:false para fecha de ayer', () => {
      const ayer = soloFecha(-1);
      const result = SolicitudValidationService.validarFechaFutura(ayer);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('pasado');
    });

    it('debe retornar valid:false para fecha de hace 30 días', () => {
      const pasado = soloFecha(-30);
      const result = SolicitudValidationService.validarFechaFutura(pasado);
      expect(result.valid).toBe(false);
    });
  });

  // ── cancelacionGeneraInasistencia ─────────────────────────────────
  describe('cancelacionGeneraInasistencia()', () => {
    it(`debe retornar false si la cancelación es con más de ${HORAS_CANCELACION_SIN_PENALIZACION}h de anticipación`, () => {
      const fecha = fechaEnHoras(HORAS_CANCELACION_SIN_PENALIZACION + 1);
      const hora = `${fecha.getHours().toString().padStart(2, '0')}:00`;
      expect(SolicitudValidationService.cancelacionGeneraInasistencia(fecha, hora)).toBe(false);
    });

    it(`debe retornar true si la cancelación es con menos de ${HORAS_CANCELACION_SIN_PENALIZACION}h (RN-08)`, () => {
      const fecha = fechaEnHoras(HORAS_CANCELACION_SIN_PENALIZACION - 1);
      const hora = `${fecha.getHours().toString().padStart(2, '0')}:00`;
      expect(SolicitudValidationService.cancelacionGeneraInasistencia(fecha, hora)).toBe(true);
    });

    it('debe retornar true para cancelación con fecha ya pasada', () => {
      const fecha = fechaEnHoras(-1);
      const hora = '10:00';
      expect(SolicitudValidationService.cancelacionGeneraInasistencia(fecha, hora)).toBe(true);
    });
  });

  // ── validarCreacion ───────────────────────────────────────────────
  describe('validarCreacion()', () => {
    it('debe retornar valid:true con datos completamente válidos', () => {
      const fechaProgramada = fechaEnHoras(HORAS_ANTICIPACION_MINIMA + 2);
      const hora = '10:00';
      const result = SolicitudValidationService.validarCreacion({
        fechaProgramada,
        horaProgramada: hora,
      });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('debe retornar valid:false con hora fuera de horario operativo', () => {
      const fechaProgramada = fechaEnHoras(HORAS_ANTICIPACION_MINIMA + 2);
      const result = SolicitudValidationService.validarCreacion({
        fechaProgramada,
        horaProgramada: '21:00',
      });
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('debe retornar valid:false con fecha en el pasado', () => {
      const result = SolicitudValidationService.validarCreacion({
        fechaProgramada: soloFecha(-1),
        horaProgramada: '10:00',
      });
      expect(result.valid).toBe(false);
    });

    it('debe acumular múltiples errores si hay varios problemas', () => {
      // hora inválida + fecha pasada
      const result = SolicitudValidationService.validarCreacion({
        fechaProgramada: soloFecha(-2),
        horaProgramada: '22:00',
      });
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(2);
    });

    it('debe retornar valid:false si hay anticipación insuficiente pero fecha es futura', () => {
      const fechaProxima = fechaEnHoras(1); // solo 1h de anticipación
      const hora = `${fechaProxima.getHours().toString().padStart(2, '0')}:00`;
      const result = SolicitudValidationService.validarCreacion({
        fechaProgramada: fechaProxima,
        horaProgramada: hora,
      });
      expect(result.valid).toBe(false);
    });
  });
});
