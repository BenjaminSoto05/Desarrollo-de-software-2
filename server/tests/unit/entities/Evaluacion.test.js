// =======================================================================
// Test: Evaluacion.test.js
// Capa: Domain — Entidad Evaluacion
// Cubre: validación rango 1–5, esAutoEvaluacion
// Rúbrica: Cobertura entidad de dominio ≥ 70%
// =======================================================================

const {
  Evaluacion,
  PUNTUACION_MINIMA,
  PUNTUACION_MAXIMA,
} = require('../../../src/domain/entities/Evaluacion');

describe('Entidad Evaluacion', () => {
  // ── Helper ────────────────────────────────────────────────────────
  const crearEvaluacion = (overrides = {}) =>
    new Evaluacion({
      solicitudId: 'sol-001',
      evaluadorId: 'user-evaluador',
      evaluadoId: 'user-evaluado',
      puntuacion: 4,
      ...overrides,
    });

  // ── Validación de puntuación (constructor) ────────────────────────
  describe('validarPuntuacion() — llamado en constructor', () => {
    it('debe crear la evaluación sin errores con puntuación válida: 1', () => {
      expect(() => crearEvaluacion({ puntuacion: 1 })).not.toThrow();
    });

    it('debe crear la evaluación sin errores con puntuación válida: 5', () => {
      expect(() => crearEvaluacion({ puntuacion: 5 })).not.toThrow();
    });

    it('debe crear la evaluación sin errores con puntuación válida: 3', () => {
      expect(() => crearEvaluacion({ puntuacion: 3 })).not.toThrow();
    });

    it(`debe lanzar Error si la puntuación es menor que ${PUNTUACION_MINIMA}`, () => {
      expect(() => crearEvaluacion({ puntuacion: 0 })).toThrow(
        `La puntuación debe ser un entero entre ${PUNTUACION_MINIMA} y ${PUNTUACION_MAXIMA}.`
      );
    });

    it(`debe lanzar Error si la puntuación es mayor que ${PUNTUACION_MAXIMA}`, () => {
      expect(() => crearEvaluacion({ puntuacion: 6 })).toThrow(
        `La puntuación debe ser un entero entre ${PUNTUACION_MINIMA} y ${PUNTUACION_MAXIMA}.`
      );
    });

    it('debe lanzar Error si la puntuación es negativa', () => {
      expect(() => crearEvaluacion({ puntuacion: -1 })).toThrow(Error);
    });

    it('debe lanzar Error si la puntuación es un número decimal (no entero)', () => {
      expect(() => crearEvaluacion({ puntuacion: 3.5 })).toThrow(Error);
    });

    it('debe lanzar Error si la puntuación es cero', () => {
      expect(() => crearEvaluacion({ puntuacion: 0 })).toThrow(Error);
    });

    it('debe lanzar Error si la puntuación es NaN', () => {
      expect(() => crearEvaluacion({ puntuacion: NaN })).toThrow(Error);
    });
  });

  // ── esAutoEvaluacion ──────────────────────────────────────────────
  describe('esAutoEvaluacion()', () => {
    it('debe retornar true cuando evaluadorId === evaluadoId', () => {
      const eval_ = crearEvaluacion({
        evaluadorId: 'user-001',
        evaluadoId: 'user-001',
      });
      expect(eval_.esAutoEvaluacion()).toBe(true);
    });

    it('debe retornar false cuando evaluadorId !== evaluadoId', () => {
      const eval_ = crearEvaluacion({
        evaluadorId: 'user-001',
        evaluadoId: 'user-002',
      });
      expect(eval_.esAutoEvaluacion()).toBe(false);
    });
  });

  // ── Constructor defaults ──────────────────────────────────────────
  describe('Constructor — valores por defecto', () => {
    it('debe inicializar id en null si no se proporciona', () => {
      const eval_ = crearEvaluacion();
      expect(eval_.id).toBeNull();
    });

    it('debe inicializar comentario en null si no se proporciona', () => {
      const eval_ = crearEvaluacion();
      expect(eval_.comentario).toBeNull();
    });

    it('debe asignar el comentario si se proporciona', () => {
      const eval_ = crearEvaluacion({ comentario: 'Excelente servicio' });
      expect(eval_.comentario).toBe('Excelente servicio');
    });
  });
});
