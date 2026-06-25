// =======================================================================
// Test: Solicitud.test.js
// Capa: Domain — Entidad Solicitud
// Cubre: estaDisponible, puedeTransicionarA, cambiarEstado,
//        asignarVoluntario, puedeSerEditadaPor, puedeSerCanceladaPor
// Rúbrica: Cobertura entidad de dominio ≥ 70%
// =======================================================================

const { Solicitud, ESTADOS, TRANSICIONES_VALIDAS } = require('../../../src/domain/entities/Solicitud');

describe('Entidad Solicitud', () => {
  // ── Helpers ──────────────────────────────────────────────────────
  const crearSolicitud = (overrides = {}) =>
    new Solicitud({
      titulo: 'Ayuda con compras',
      descripcion: 'Necesito ayuda para ir al supermercado',
      categoriaId: 'cat-001',
      solicitanteId: 'user-solicitante-01',
      fechaProgramada: new Date('2026-08-10'),
      horaProgramada: '09:00',
      direccion: 'Av. Alemania 1234',
      comuna: 'Temuco',
      ...overrides,
    });

  // ── estaDisponible ────────────────────────────────────────────────
  describe('estaDisponible()', () => {
    it('debe retornar true cuando estado es PENDIENTE', () => {
      const sol = crearSolicitud({ estado: ESTADOS.PENDIENTE });
      expect(sol.estaDisponible()).toBe(true);
    });

    it('debe retornar false cuando estado es EN_CURSO', () => {
      const sol = crearSolicitud({ estado: ESTADOS.EN_CURSO });
      expect(sol.estaDisponible()).toBe(false);
    });

    it('debe retornar false cuando estado es CANCELADA', () => {
      const sol = crearSolicitud({ estado: ESTADOS.CANCELADA });
      expect(sol.estaDisponible()).toBe(false);
    });

    it('debe retornar false cuando estado es FINALIZADA', () => {
      const sol = crearSolicitud({ estado: ESTADOS.FINALIZADA });
      expect(sol.estaDisponible()).toBe(false);
    });
  });

  // ── puedeTransicionarA ────────────────────────────────────────────
  describe('puedeTransicionarA()', () => {
    it('PENDIENTE puede transicionar a EN_CURSO', () => {
      const sol = crearSolicitud({ estado: ESTADOS.PENDIENTE });
      expect(sol.puedeTransicionarA(ESTADOS.EN_CURSO)).toBe(true);
    });

    it('PENDIENTE puede transicionar a CANCELADA', () => {
      const sol = crearSolicitud({ estado: ESTADOS.PENDIENTE });
      expect(sol.puedeTransicionarA(ESTADOS.CANCELADA)).toBe(true);
    });

    it('PENDIENTE NO puede transicionar a FINALIZADA', () => {
      const sol = crearSolicitud({ estado: ESTADOS.PENDIENTE });
      expect(sol.puedeTransicionarA(ESTADOS.FINALIZADA)).toBe(false);
    });

    it('EN_CURSO puede transicionar a COMPLETADA', () => {
      const sol = crearSolicitud({ estado: ESTADOS.EN_CURSO });
      expect(sol.puedeTransicionarA(ESTADOS.COMPLETADA)).toBe(true);
    });

    it('EN_CURSO puede transicionar a CANCELADA', () => {
      const sol = crearSolicitud({ estado: ESTADOS.EN_CURSO });
      expect(sol.puedeTransicionarA(ESTADOS.CANCELADA)).toBe(true);
    });

    it('COMPLETADA solo puede transicionar a FINALIZADA', () => {
      const sol = crearSolicitud({ estado: ESTADOS.COMPLETADA });
      expect(sol.puedeTransicionarA(ESTADOS.FINALIZADA)).toBe(true);
      expect(sol.puedeTransicionarA(ESTADOS.CANCELADA)).toBe(false);
    });

    it('FINALIZADA no puede transicionar a ningún estado', () => {
      const sol = crearSolicitud({ estado: ESTADOS.FINALIZADA });
      Object.values(ESTADOS).forEach((estado) => {
        expect(sol.puedeTransicionarA(estado)).toBe(false);
      });
    });

    it('CANCELADA no puede transicionar a ningún estado', () => {
      const sol = crearSolicitud({ estado: ESTADOS.CANCELADA });
      Object.values(ESTADOS).forEach((estado) => {
        expect(sol.puedeTransicionarA(estado)).toBe(false);
      });
    });
  });

  // ── cambiarEstado ─────────────────────────────────────────────────
  describe('cambiarEstado()', () => {
    it('debe cambiar estado correctamente para transición válida', () => {
      const sol = crearSolicitud({ estado: ESTADOS.PENDIENTE });
      sol.cambiarEstado(ESTADOS.EN_CURSO);
      expect(sol.estado).toBe(ESTADOS.EN_CURSO);
    });

    it('debe lanzar Error para transición inválida', () => {
      const sol = crearSolicitud({ estado: ESTADOS.FINALIZADA });
      expect(() => sol.cambiarEstado(ESTADOS.PENDIENTE)).toThrow(
        'Transición inválida: FINALIZADA → PENDIENTE'
      );
    });

    it('debe lanzar Error al intentar reabrir una solicitud CANCELADA', () => {
      const sol = crearSolicitud({ estado: ESTADOS.CANCELADA });
      expect(() => sol.cambiarEstado(ESTADOS.EN_CURSO)).toThrow(Error);
    });

    it('debe completar flujo completo: PENDIENTE → EN_CURSO → COMPLETADA → FINALIZADA', () => {
      const sol = crearSolicitud({ estado: ESTADOS.PENDIENTE });
      sol.cambiarEstado(ESTADOS.EN_CURSO);
      sol.cambiarEstado(ESTADOS.COMPLETADA);
      sol.cambiarEstado(ESTADOS.FINALIZADA);
      expect(sol.estado).toBe(ESTADOS.FINALIZADA);
    });
  });

  // ── asignarVoluntario ─────────────────────────────────────────────
  describe('asignarVoluntario()', () => {
    it('debe asignar el voluntario y cambiar estado a EN_CURSO si está PENDIENTE', () => {
      const sol = crearSolicitud({ estado: ESTADOS.PENDIENTE });
      sol.asignarVoluntario('voluntario-001');
      expect(sol.voluntarioId).toBe('voluntario-001');
      expect(sol.estado).toBe(ESTADOS.EN_CURSO);
    });

    it('debe lanzar Error si la solicitud no está disponible (ya tiene estado EN_CURSO)', () => {
      const sol = crearSolicitud({ estado: ESTADOS.EN_CURSO });
      expect(() => sol.asignarVoluntario('voluntario-002')).toThrow(
        'La solicitud no está disponible para aceptar.'
      );
    });

    it('debe lanzar Error si la solicitud ya fue CANCELADA', () => {
      const sol = crearSolicitud({ estado: ESTADOS.CANCELADA });
      expect(() => sol.asignarVoluntario('voluntario-003')).toThrow(Error);
    });
  });

  // ── puedeSerEditadaPor ────────────────────────────────────────────
  describe('puedeSerEditadaPor()', () => {
    it('debe retornar true si el userId es el solicitante y la solicitud está PENDIENTE', () => {
      const sol = crearSolicitud({ solicitanteId: 'user-001', estado: ESTADOS.PENDIENTE });
      expect(sol.puedeSerEditadaPor('user-001')).toBe(true);
    });

    it('debe retornar false si el userId NO es el solicitante', () => {
      const sol = crearSolicitud({ solicitanteId: 'user-001', estado: ESTADOS.PENDIENTE });
      expect(sol.puedeSerEditadaPor('user-otro')).toBe(false);
    });

    it('debe retornar false si la solicitud ya no está PENDIENTE', () => {
      const sol = crearSolicitud({ solicitanteId: 'user-001', estado: ESTADOS.EN_CURSO });
      expect(sol.puedeSerEditadaPor('user-001')).toBe(false);
    });
  });

  // ── puedeSerCanceladaPor ──────────────────────────────────────────
  describe('puedeSerCanceladaPor()', () => {
    it('debe retornar true si el userId es el solicitante y la solicitud está PENDIENTE', () => {
      const sol = crearSolicitud({ solicitanteId: 'user-001', estado: ESTADOS.PENDIENTE });
      expect(sol.puedeSerCanceladaPor('user-001')).toBe(true);
    });

    it('debe retornar true si el userId es el solicitante y la solicitud está EN_CURSO', () => {
      const sol = crearSolicitud({ solicitanteId: 'user-001', estado: ESTADOS.EN_CURSO });
      expect(sol.puedeSerCanceladaPor('user-001')).toBe(true);
    });

    it('debe retornar false si el userId NO es el solicitante', () => {
      const sol = crearSolicitud({ solicitanteId: 'user-001', estado: ESTADOS.PENDIENTE });
      expect(sol.puedeSerCanceladaPor('user-otro')).toBe(false);
    });

    it('debe retornar false si la solicitud ya fue FINALIZADA', () => {
      const sol = crearSolicitud({ solicitanteId: 'user-001', estado: ESTADOS.FINALIZADA });
      expect(sol.puedeSerCanceladaPor('user-001')).toBe(false);
    });

    it('debe retornar false si la solicitud ya fue CANCELADA', () => {
      const sol = crearSolicitud({ solicitanteId: 'user-001', estado: ESTADOS.CANCELADA });
      expect(sol.puedeSerCanceladaPor('user-001')).toBe(false);
    });
  });

  // ── estaCerrada ───────────────────────────────────────────────────
  describe('estaCerrada()', () => {
    it('debe retornar true para estado FINALIZADA', () => {
      const sol = crearSolicitud({ estado: ESTADOS.FINALIZADA });
      expect(sol.estaCerrada()).toBe(true);
    });

    it('debe retornar true para estado CANCELADA', () => {
      const sol = crearSolicitud({ estado: ESTADOS.CANCELADA });
      expect(sol.estaCerrada()).toBe(true);
    });

    it('debe retornar false para estado PENDIENTE', () => {
      const sol = crearSolicitud({ estado: ESTADOS.PENDIENTE });
      expect(sol.estaCerrada()).toBe(false);
    });
  });

  // ── Constructor defaults ──────────────────────────────────────────
  describe('Constructor — valores por defecto', () => {
    it('debe inicializar estado en PENDIENTE si no se proporciona', () => {
      const sol = new Solicitud({
        titulo: 'Test',
        descripcion: 'Desc',
        categoriaId: 'cat-1',
        solicitanteId: 'user-1',
        fechaProgramada: new Date(),
        horaProgramada: '10:00',
        direccion: 'Calle 1',
        comuna: 'Temuco',
      });
      expect(sol.estado).toBe(ESTADOS.PENDIENTE);
    });

    it('debe inicializar voluntarioId en null si no se proporciona', () => {
      const sol = crearSolicitud();
      expect(sol.voluntarioId).toBeNull();
    });
  });
});
