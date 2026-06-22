// ============================================================================
// Tests Unitarios: Entidad Solicitud
// Capa: Domain
// ============================================================================

const { Solicitud, ESTADOS, TRANSICIONES_VALIDAS } = require('../../../../src/domain/entities/Solicitud');

describe('Solicitud Entity', () => {
  const validProps = {
    id: 'sol-1',
    titulo: 'Compras en supermercado',
    descripcion: 'Necesito ayuda con las compras semanales',
    categoriaId: 'cat-1',
    solicitanteId: 'user-1',
    fechaProgramada: new Date('2026-07-01'),
    horaProgramada: '10:00',
    direccion: 'Av. Alemania 123',
    comuna: 'Temuco',
  };

  describe('constructor', () => {
    test('debe crear una solicitud con estado PENDIENTE por defecto', () => {
      const sol = new Solicitud(validProps);
      expect(sol.estado).toBe(ESTADOS.PENDIENTE);
      expect(sol.voluntarioId).toBeNull();
    });

    test('debe aceptar un estado inicial personalizado', () => {
      const sol = new Solicitud({ ...validProps, estado: ESTADOS.EN_CURSO, voluntarioId: 'vol-1' });
      expect(sol.estado).toBe(ESTADOS.EN_CURSO);
      expect(sol.voluntarioId).toBe('vol-1');
    });
  });

  describe('estaDisponible()', () => {
    test('debe retornar true cuando el estado es PENDIENTE', () => {
      const sol = new Solicitud(validProps);
      expect(sol.estaDisponible()).toBe(true);
    });

    test('debe retornar false cuando el estado es EN_CURSO', () => {
      const sol = new Solicitud({ ...validProps, estado: ESTADOS.EN_CURSO });
      expect(sol.estaDisponible()).toBe(false);
    });
  });

  describe('estaEnCurso()', () => {
    test('debe retornar true cuando el estado es EN_CURSO', () => {
      const sol = new Solicitud({ ...validProps, estado: ESTADOS.EN_CURSO });
      expect(sol.estaEnCurso()).toBe(true);
    });
  });

  describe('estaCerrada()', () => {
    test('debe retornar true cuando el estado es FINALIZADA', () => {
      const sol = new Solicitud({ ...validProps, estado: ESTADOS.FINALIZADA });
      expect(sol.estaCerrada()).toBe(true);
    });

    test('debe retornar true cuando el estado es CANCELADA', () => {
      const sol = new Solicitud({ ...validProps, estado: ESTADOS.CANCELADA });
      expect(sol.estaCerrada()).toBe(true);
    });

    test('debe retornar false cuando el estado es PENDIENTE', () => {
      const sol = new Solicitud(validProps);
      expect(sol.estaCerrada()).toBe(false);
    });
  });

  describe('puedeTransicionarA()', () => {
    test('PENDIENTE puede transicionar a EN_CURSO', () => {
      const sol = new Solicitud(validProps);
      expect(sol.puedeTransicionarA(ESTADOS.EN_CURSO)).toBe(true);
    });

    test('PENDIENTE puede transicionar a CANCELADA', () => {
      const sol = new Solicitud(validProps);
      expect(sol.puedeTransicionarA(ESTADOS.CANCELADA)).toBe(true);
    });

    test('PENDIENTE NO puede transicionar a COMPLETADA', () => {
      const sol = new Solicitud(validProps);
      expect(sol.puedeTransicionarA(ESTADOS.COMPLETADA)).toBe(false);
    });

    test('EN_CURSO puede transicionar a COMPLETADA', () => {
      const sol = new Solicitud({ ...validProps, estado: ESTADOS.EN_CURSO });
      expect(sol.puedeTransicionarA(ESTADOS.COMPLETADA)).toBe(true);
    });

    test('COMPLETADA puede transicionar a FINALIZADA', () => {
      const sol = new Solicitud({ ...validProps, estado: ESTADOS.COMPLETADA });
      expect(sol.puedeTransicionarA(ESTADOS.FINALIZADA)).toBe(true);
    });

    test('FINALIZADA no puede transicionar a ningún estado', () => {
      const sol = new Solicitud({ ...validProps, estado: ESTADOS.FINALIZADA });
      expect(sol.puedeTransicionarA(ESTADOS.PENDIENTE)).toBe(false);
      expect(sol.puedeTransicionarA(ESTADOS.EN_CURSO)).toBe(false);
    });

    test('CANCELADA no puede transicionar a ningún estado', () => {
      const sol = new Solicitud({ ...validProps, estado: ESTADOS.CANCELADA });
      expect(sol.puedeTransicionarA(ESTADOS.PENDIENTE)).toBe(false);
    });
  });

  describe('cambiarEstado()', () => {
    test('debe cambiar el estado cuando la transición es válida', () => {
      const sol = new Solicitud(validProps);
      sol.cambiarEstado(ESTADOS.EN_CURSO);
      expect(sol.estado).toBe(ESTADOS.EN_CURSO);
    });

    test('debe lanzar error cuando la transición es inválida', () => {
      const sol = new Solicitud(validProps);
      expect(() => sol.cambiarEstado(ESTADOS.FINALIZADA)).toThrow('Transición inválida');
    });
  });

  describe('asignarVoluntario()', () => {
    test('debe asignar voluntario y cambiar estado a EN_CURSO', () => {
      const sol = new Solicitud(validProps);
      sol.asignarVoluntario('vol-1');
      expect(sol.voluntarioId).toBe('vol-1');
      expect(sol.estado).toBe(ESTADOS.EN_CURSO);
    });

    test('debe lanzar error si la solicitud no está disponible', () => {
      const sol = new Solicitud({ ...validProps, estado: ESTADOS.EN_CURSO });
      expect(() => sol.asignarVoluntario('vol-2')).toThrow('no está disponible');
    });
  });

  describe('puedeSerEditadaPor()', () => {
    test('debe permitir edición al solicitante si está PENDIENTE', () => {
      const sol = new Solicitud(validProps);
      expect(sol.puedeSerEditadaPor('user-1')).toBe(true);
    });

    test('debe negar edición a otro usuario', () => {
      const sol = new Solicitud(validProps);
      expect(sol.puedeSerEditadaPor('user-2')).toBe(false);
    });

    test('debe negar edición si no está PENDIENTE', () => {
      const sol = new Solicitud({ ...validProps, estado: ESTADOS.EN_CURSO });
      expect(sol.puedeSerEditadaPor('user-1')).toBe(false);
    });
  });

  describe('puedeSerCanceladaPor()', () => {
    test('debe permitir cancelar al solicitante si PENDIENTE', () => {
      const sol = new Solicitud(validProps);
      expect(sol.puedeSerCanceladaPor('user-1')).toBe(true);
    });

    test('debe permitir cancelar al solicitante si EN_CURSO', () => {
      const sol = new Solicitud({ ...validProps, estado: ESTADOS.EN_CURSO });
      expect(sol.puedeSerCanceladaPor('user-1')).toBe(true);
    });

    test('debe negar cancelar a otro usuario', () => {
      const sol = new Solicitud(validProps);
      expect(sol.puedeSerCanceladaPor('user-99')).toBe(false);
    });
  });
});
