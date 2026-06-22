// ============================================================================
// Tests Unitarios: Entidad Evaluacion
// Capa: Domain
// ============================================================================

const { Evaluacion, PUNTUACION_MINIMA, PUNTUACION_MAXIMA } = require('../../../../src/domain/entities/Evaluacion');

describe('Evaluacion Entity', () => {
  const validProps = {
    id: 'eval-1',
    solicitudId: 'sol-1',
    evaluadorId: 'user-1',
    evaluadoId: 'user-2',
    puntuacion: 5,
    comentario: 'Excelente servicio',
  };

  describe('constructor', () => {
    test('debe crear una evaluación con puntuación válida', () => {
      const evaluacion = new Evaluacion(validProps);
      expect(evaluacion.puntuacion).toBe(5);
      expect(evaluacion.comentario).toBe('Excelente servicio');
    });

    test('debe aceptar puntuación mínima (1)', () => {
      const evaluacion = new Evaluacion({ ...validProps, puntuacion: PUNTUACION_MINIMA });
      expect(evaluacion.puntuacion).toBe(1);
    });

    test('debe aceptar puntuación máxima (5)', () => {
      const evaluacion = new Evaluacion({ ...validProps, puntuacion: PUNTUACION_MAXIMA });
      expect(evaluacion.puntuacion).toBe(5);
    });

    test('debe asignar null al comentario si no se proporciona', () => {
      const evaluacion = new Evaluacion({ ...validProps, comentario: undefined });
      expect(evaluacion.comentario).toBeNull();
    });
  });

  describe('validarPuntuacion()', () => {
    test('debe lanzar error con puntuación 0', () => {
      expect(() => new Evaluacion({ ...validProps, puntuacion: 0 })).toThrow(
        `La puntuación debe ser un entero entre ${PUNTUACION_MINIMA} y ${PUNTUACION_MAXIMA}`
      );
    });

    test('debe lanzar error con puntuación 6', () => {
      expect(() => new Evaluacion({ ...validProps, puntuacion: 6 })).toThrow();
    });

    test('debe lanzar error con puntuación negativa', () => {
      expect(() => new Evaluacion({ ...validProps, puntuacion: -1 })).toThrow();
    });

    test('debe lanzar error con puntuación decimal', () => {
      expect(() => new Evaluacion({ ...validProps, puntuacion: 3.5 })).toThrow();
    });

    test('debe lanzar error con puntuación no numérica', () => {
      expect(() => new Evaluacion({ ...validProps, puntuacion: 'cinco' })).toThrow();
    });
  });

  describe('esAutoEvaluacion()', () => {
    test('debe retornar true si evaluador y evaluado son el mismo', () => {
      const evaluacion = new Evaluacion({ ...validProps, evaluadorId: 'user-1', evaluadoId: 'user-1' });
      expect(evaluacion.esAutoEvaluacion()).toBe(true);
    });

    test('debe retornar false si evaluador y evaluado son diferentes', () => {
      const evaluacion = new Evaluacion(validProps);
      expect(evaluacion.esAutoEvaluacion()).toBe(false);
    });
  });
});
