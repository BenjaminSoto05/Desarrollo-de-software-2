const { Solicitud, ESTADOS } = require('../../../../src/domain/entities/Solicitud');

describe('Solicitud Entity', () => {
  const validProps = {
    id: 'sol-1',
    titulo: 'Compras en supermercado',
    descripcion: 'Necesito ayuda con las compras',
    categoriaId: 'cat-1',
    solicitanteId: 'user-1',
    fechaProgramada: new Date('2026-07-01'),
    horaProgramada: '10:00',
    direccion: 'Av. Alemania 123',
    comuna: 'Temuco',
  };

  describe('constructor', () => {
    test('estado PENDIENTE por defecto', () => {
      const sol = new Solicitud(validProps);
      expect(sol.estado).toBe(ESTADOS.PENDIENTE);
      expect(sol.voluntarioId).toBeNull();
    });
  });

  describe('estaDisponible()', () => {
    test('true en PENDIENTE', () => {
      expect(new Solicitud(validProps).estaDisponible()).toBe(true);
    });
    test('false en EN_CURSO', () => {
      expect(new Solicitud({ ...validProps, estado: ESTADOS.EN_CURSO }).estaDisponible()).toBe(false);
    });
  });

  describe('estaEnCurso()', () => {
    test('true en EN_CURSO', () => {
      expect(new Solicitud({ ...validProps, estado: ESTADOS.EN_CURSO }).estaEnCurso()).toBe(true);
    });
  });

  describe('estaCerrada()', () => {
    test('true en FINALIZADA', () => {
      expect(new Solicitud({ ...validProps, estado: ESTADOS.FINALIZADA }).estaCerrada()).toBe(true);
    });
    test('true en CANCELADA', () => {
      expect(new Solicitud({ ...validProps, estado: ESTADOS.CANCELADA }).estaCerrada()).toBe(true);
    });
    test('false en PENDIENTE', () => {
      expect(new Solicitud(validProps).estaCerrada()).toBe(false);
    });
  });

  describe('puedeTransicionarA()', () => {
    test('PENDIENTE → EN_CURSO ✓', () => {
      expect(new Solicitud(validProps).puedeTransicionarA(ESTADOS.EN_CURSO)).toBe(true);
    });
    test('PENDIENTE → CANCELADA ✓', () => {
      expect(new Solicitud(validProps).puedeTransicionarA(ESTADOS.CANCELADA)).toBe(true);
    });
    test('PENDIENTE → COMPLETADA ✗', () => {
      expect(new Solicitud(validProps).puedeTransicionarA(ESTADOS.COMPLETADA)).toBe(false);
    });
    test('EN_CURSO → COMPLETADA ✓', () => {
      expect(new Solicitud({ ...validProps, estado: ESTADOS.EN_CURSO }).puedeTransicionarA(ESTADOS.COMPLETADA)).toBe(true);
    });
    test('COMPLETADA → FINALIZADA ✓', () => {
      expect(new Solicitud({ ...validProps, estado: ESTADOS.COMPLETADA }).puedeTransicionarA(ESTADOS.FINALIZADA)).toBe(true);
    });
    test('FINALIZADA → ninguno', () => {
      const sol = new Solicitud({ ...validProps, estado: ESTADOS.FINALIZADA });
      expect(sol.puedeTransicionarA(ESTADOS.PENDIENTE)).toBe(false);
      expect(sol.puedeTransicionarA(ESTADOS.EN_CURSO)).toBe(false);
    });
    test('CANCELADA → ninguno', () => {
      expect(new Solicitud({ ...validProps, estado: ESTADOS.CANCELADA }).puedeTransicionarA(ESTADOS.PENDIENTE)).toBe(false);
    });
  });

  describe('cambiarEstado()', () => {
    test('cambia si transición válida', () => {
      const sol = new Solicitud(validProps);
      sol.cambiarEstado(ESTADOS.EN_CURSO);
      expect(sol.estado).toBe(ESTADOS.EN_CURSO);
    });
    test('lanza error si transición inválida', () => {
      expect(() => new Solicitud(validProps).cambiarEstado(ESTADOS.FINALIZADA)).toThrow('Transición inválida');
    });
  });

  describe('asignarVoluntario()', () => {
    test('asigna y cambia a EN_CURSO', () => {
      const sol = new Solicitud(validProps);
      sol.asignarVoluntario('vol-1');
      expect(sol.voluntarioId).toBe('vol-1');
      expect(sol.estado).toBe(ESTADOS.EN_CURSO);
    });
    test('lanza error si no disponible', () => {
      expect(() => new Solicitud({ ...validProps, estado: ESTADOS.EN_CURSO }).asignarVoluntario('vol-2')).toThrow('no está disponible');
    });
  });

  describe('puedeSerEditadaPor()', () => {
    test('solicitante en PENDIENTE ✓', () => {
      expect(new Solicitud(validProps).puedeSerEditadaPor('user-1')).toBe(true);
    });
    test('otro usuario ✗', () => {
      expect(new Solicitud(validProps).puedeSerEditadaPor('user-2')).toBe(false);
    });
    test('solicitante si no PENDIENTE ✗', () => {
      expect(new Solicitud({ ...validProps, estado: ESTADOS.EN_CURSO }).puedeSerEditadaPor('user-1')).toBe(false);
    });
  });

  describe('puedeSerCanceladaPor()', () => {
    test('solicitante en PENDIENTE ✓', () => {
      expect(new Solicitud(validProps).puedeSerCanceladaPor('user-1')).toBe(true);
    });
    test('solicitante en EN_CURSO ✓', () => {
      expect(new Solicitud({ ...validProps, estado: ESTADOS.EN_CURSO }).puedeSerCanceladaPor('user-1')).toBe(true);
    });
    test('otro usuario ✗', () => {
      expect(new Solicitud(validProps).puedeSerCanceladaPor('user-99')).toBe(false);
    });
  });
});
