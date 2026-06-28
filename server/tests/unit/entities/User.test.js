// =======================================================================
// Test: User.test.js
// Capa: Domain — Entidad User
// Cubre: getNombreCompleto, esEstudiante, puedeCrearSolicitudes,
//        puedeAceptarTareas, registrarInasistencia, esAdmin
// Rúbrica: Cobertura entidad de dominio ≥ 70%
// =======================================================================

const { User, ROLES, MAX_INASISTENCIAS } = require('../../../src/domain/entities/User');

describe('Entidad User', () => {
  // ── Helpers ─────────────────────────────────────────────────────────
  const crearUsuario = (overrides = {}) =>
    new User({
      email: 'juan@uct.cl',
      passwordHash: 'hash_seguro',
      rut: '12345678-9',
      nombre: 'Juan',
      apellido: 'Pérez',
      rol: ROLES.ESTUDIANTE,
      ...overrides,
    });

  // ── getNombreCompleto ─────────────────────────────────────────────
  describe('getNombreCompleto()', () => {
    it('debe retornar nombre y apellido concatenados', () => {
      const user = crearUsuario({ nombre: 'María', apellido: 'González' });
      expect(user.getNombreCompleto()).toBe('María González');
    });

    it('debe retornar nombre completo para usuario con un solo nombre', () => {
      const user = crearUsuario({ nombre: 'Luis', apellido: 'Rojas' });
      expect(user.getNombreCompleto()).toBe('Luis Rojas');
    });
  });

  // ── esEstudiante ──────────────────────────────────────────────────
  describe('esEstudiante()', () => {
    it('debe retornar true para rol ESTUDIANTE', () => {
      const user = crearUsuario({ rol: ROLES.ESTUDIANTE });
      expect(user.esEstudiante()).toBe(true);
    });

    it('debe retornar false para rol ADULTO_MAYOR', () => {
      const user = crearUsuario({ rol: ROLES.ADULTO_MAYOR });
      expect(user.esEstudiante()).toBe(false);
    });

    it('debe retornar false para rol TUTOR', () => {
      const user = crearUsuario({ rol: ROLES.TUTOR });
      expect(user.esEstudiante()).toBe(false);
    });

    it('debe retornar false para rol ADMIN', () => {
      const user = crearUsuario({ rol: ROLES.ADMIN });
      expect(user.esEstudiante()).toBe(false);
    });
  });

  // ── puedeCrearSolicitudes ─────────────────────────────────────────
  describe('puedeCrearSolicitudes()', () => {
    it('debe retornar true para ADULTO_MAYOR no suspendido', () => {
      const user = crearUsuario({ rol: ROLES.ADULTO_MAYOR, suspendido: false });
      expect(user.puedeCrearSolicitudes()).toBe(true);
    });

    it('debe retornar true para TUTOR no suspendido', () => {
      const user = crearUsuario({ rol: ROLES.TUTOR, suspendido: false });
      expect(user.puedeCrearSolicitudes()).toBe(true);
    });

    it('debe retornar false para ADULTO_MAYOR suspendido', () => {
      const user = crearUsuario({ rol: ROLES.ADULTO_MAYOR, suspendido: true });
      expect(user.puedeCrearSolicitudes()).toBe(false);
    });

    it('debe retornar false para ESTUDIANTE aunque no esté suspendido', () => {
      const user = crearUsuario({ rol: ROLES.ESTUDIANTE, suspendido: false });
      expect(user.puedeCrearSolicitudes()).toBe(false);
    });

    it('debe retornar false para ADMIN', () => {
      const user = crearUsuario({ rol: ROLES.ADMIN });
      expect(user.puedeCrearSolicitudes()).toBe(false);
    });
  });

  // ── puedeAceptarTareas ────────────────────────────────────────────
  describe('puedeAceptarTareas()', () => {
    it('debe retornar true para ESTUDIANTE no suspendido', () => {
      const user = crearUsuario({ rol: ROLES.ESTUDIANTE, suspendido: false });
      expect(user.puedeAceptarTareas()).toBe(true);
    });

    it('debe retornar false para ESTUDIANTE suspendido', () => {
      const user = crearUsuario({ rol: ROLES.ESTUDIANTE, suspendido: true });
      expect(user.puedeAceptarTareas()).toBe(false);
    });

    it('debe retornar false para ADULTO_MAYOR', () => {
      const user = crearUsuario({ rol: ROLES.ADULTO_MAYOR });
      expect(user.puedeAceptarTareas()).toBe(false);
    });

    it('debe retornar false para TUTOR', () => {
      const user = crearUsuario({ rol: ROLES.TUTOR });
      expect(user.puedeAceptarTareas()).toBe(false);
    });
  });

  // ── registrarInasistencia ─────────────────────────────────────────
  describe('registrarInasistencia()', () => {
    it('debe incrementar el contador de inasistencias en 1', () => {
      const user = crearUsuario({ inasistencias: 0 });
      user.registrarInasistencia();
      expect(user.inasistencias).toBe(1);
    });

    it('no debe suspender al usuario con menos de MAX_INASISTENCIAS', () => {
      const user = crearUsuario({ inasistencias: MAX_INASISTENCIAS - 2 });
      const resultado = user.registrarInasistencia();
      expect(resultado).toBe(false);
      expect(user.suspendido).toBe(false);
    });

    it(`debe suspender al usuario al alcanzar ${MAX_INASISTENCIAS} inasistencias`, () => {
      const user = crearUsuario({ inasistencias: MAX_INASISTENCIAS - 1 });
      const resultado = user.registrarInasistencia();
      expect(resultado).toBe(true);
      expect(user.suspendido).toBe(true);
    });

    it('debe retornar true si el usuario ya estaba suspendido y se registra otra inasistencia', () => {
      const user = crearUsuario({ inasistencias: MAX_INASISTENCIAS, suspendido: true });
      const resultado = user.registrarInasistencia();
      expect(resultado).toBe(true);
    });
  });

  // ── esAdmin ───────────────────────────────────────────────────────
  describe('esAdmin()', () => {
    it('debe retornar true para rol ADMIN', () => {
      const user = crearUsuario({ rol: ROLES.ADMIN });
      expect(user.esAdmin()).toBe(true);
    });

    it('debe retornar false para roles no administradores', () => {
      [ROLES.ESTUDIANTE, ROLES.ADULTO_MAYOR, ROLES.TUTOR].forEach((rol) => {
        const user = crearUsuario({ rol });
        expect(user.esAdmin()).toBe(false);
      });
    });
  });

  // ── Constructor defaults ──────────────────────────────────────────
  describe('Constructor — valores por defecto', () => {
    it('debe inicializar inasistencias en 0 si no se proporciona', () => {
      const user = crearUsuario();
      expect(user.inasistencias).toBe(0);
    });

    it('debe inicializar suspendido en false si no se proporciona', () => {
      const user = crearUsuario();
      expect(user.suspendido).toBe(false);
    });

    it('debe inicializar id en null si no se proporciona', () => {
      const user = crearUsuario();
      expect(user.id).toBeNull();
    });
  });
});
