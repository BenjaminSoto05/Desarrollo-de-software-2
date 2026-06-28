const { Evaluacion, PUNTUACION_MINIMA, PUNTUACION_MAXIMA } = require('../../../../src/domain/entities/Evaluacion');

describe('Evaluacion Entity', () => {
  const validProps = {
    id: 'eval-1', solicitudId: 'sol-1', evaluadorId: 'user-1',
    evaluadoId: 'user-2', puntuacion: 5, comentario: 'Excelente',
  };

  describe('constructor', () => {
    test('crea con puntuación válida', () => {
      const e = new Evaluacion(validProps);
      expect(e.puntuacion).toBe(5);
    });
    test('acepta mínima (1)', () => {
      expect(new Evaluacion({ ...validProps, puntuacion: PUNTUACION_MINIMA }).puntuacion).toBe(1);
    });
    test('acepta máxima (5)', () => {
      expect(new Evaluacion({ ...validProps, puntuacion: PUNTUACION_MAXIMA }).puntuacion).toBe(5);
    });
    test('null si no hay comentario', () => {
      expect(new Evaluacion({ ...validProps, comentario: undefined }).comentario).toBeNull();
    });
  });

  describe('validarPuntuacion()', () => {
    test('rechaza 0', () => { expect(() => new Evaluacion({ ...validProps, puntuacion: 0 })).toThrow(); });
    test('rechaza 6', () => { expect(() => new Evaluacion({ ...validProps, puntuacion: 6 })).toThrow(); });
    test('rechaza negativo', () => { expect(() => new Evaluacion({ ...validProps, puntuacion: -1 })).toThrow(); });
    test('rechaza decimal', () => { expect(() => new Evaluacion({ ...validProps, puntuacion: 3.5 })).toThrow(); });
    test('rechaza string', () => { expect(() => new Evaluacion({ ...validProps, puntuacion: 'cinco' })).toThrow(); });
  });

  describe('esAutoEvaluacion()', () => {
    test('true si mismo usuario', () => {
      expect(new Evaluacion({ ...validProps, evaluadorId: 'u1', evaluadoId: 'u1' }).esAutoEvaluacion()).toBe(true);
    });
    test('false si diferentes', () => {
      expect(new Evaluacion(validProps).esAutoEvaluacion()).toBe(false);
    });
  });
});
