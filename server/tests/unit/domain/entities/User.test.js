// ============================================================================
// Tests Unitarios: Entidad User
// Capa: Domain
// ============================================================================

const { User, ROLES, MAX_INASISTENCIAS } = require('../../../../src/domain/entities/User');

describe('User Entity', () => {
  const validUserProps = {
    id: 'test-id',
    email: 'test@alu.uct.cl',
    passwordHash: 'hashedpass',
    rut: '12345678-9',
    nombre: 'Juan',
    apellido: 'Pérez',
    rol: ROLES.ESTUDIANTE,
  };

  describe('constructor', () => {
    test('debe crear un usuario con todas las propiedades', () => {
      const user = new User(validUserProps);
      expect(user.id).toBe('test-id');
      expect(user.email).toBe('test@alu.uct.cl');
      expect(user.nombre).toBe('Juan');
      expect(user.apellido).toBe('Pérez');
      expect(user.rol).toBe(ROLES.ESTUDIANTE);
      expect(user.inasistencias).toBe(0);
      expect(user.suspendido).toBe(false);
    });

    test('debe asignar valores por defecto cuando no se proporcionan opcionales', () => {
      const user = new User(validUserProps);
      expect(user.telefono).toBeNull();
      expect(user.comuna).toBeNull();
      expect(user.direccion).toBeNull();
      expect(user.inasistencias).toBe(0);
      expect(user.suspendido).toBe(false);
    });
  });

  describe('getNombreCompleto()', () => {
    test('debe retornar nombre y apellido concatenados', () => {
      const user = new User(validUserProps);
      expect(user.getNombreCompleto()).toBe('Juan Pérez');
    });
  });

  describe('esEstudiante()', () => {
    test('debe retornar true para rol ESTUDIANTE', () => {
      const user = new User({ ...validUserProps, rol: ROLES.ESTUDIANTE });
      expect(user.esEstudiante()).toBe(true);
    });

    test('debe retornar false para rol ADULTO_MAYOR', () => {
      const user = new User({ ...validUserProps, rol: ROLES.ADULTO_MAYOR });
      expect(user.esEstudiante()).toBe(false);
    });
  });

  describe('puedeCrearSolicitudes()', () => {
    test('debe retornar true para ADULTO_MAYOR no suspendido', () => {
      const user = new User({ ...validUserProps, rol: ROLES.ADULTO_MAYOR });
      expect(user.puedeCrearSolicitudes()).toBe(true);
    });

    test('debe retornar true para TUTOR no suspendido', () => {
      const user = new User({ ...validUserProps, rol: ROLES.TUTOR });
      expect(user.puedeCrearSolicitudes()).toBe(true);
    });

    test('debe retornar false para ESTUDIANTE', () => {
      const user = new User({ ...validUserProps, rol: ROLES.ESTUDIANTE });
      expect(user.puedeCrearSolicitudes()).toBe(false);
    });

    test('debe retornar false si el usuario está suspendido', () => {
      const user = new User({ ...validUserProps, rol: ROLES.ADULTO_MAYOR, suspendido: true });
      expect(user.puedeCrearSolicitudes()).toBe(false);
    });
  });

  describe('puedeAceptarTareas()', () => {
    test('debe retornar true para ESTUDIANTE no suspendido', () => {
      const user = new User({ ...validUserProps, rol: ROLES.ESTUDIANTE });
      expect(user.puedeAceptarTareas()).toBe(true);
    });

    test('debe retornar false para ADULTO_MAYOR', () => {
      const user = new User({ ...validUserProps, rol: ROLES.ADULTO_MAYOR });
      expect(user.puedeAceptarTareas()).toBe(false);
    });

    test('debe retornar false si está suspendido', () => {
      const user = new User({ ...validUserProps, rol: ROLES.ESTUDIANTE, suspendido: true });
      expect(user.puedeAceptarTareas()).toBe(false);
    });
  });

  describe('esAdmin()', () => {
    test('debe retornar true para ADMIN', () => {
      const user = new User({ ...validUserProps, rol: ROLES.ADMIN });
      expect(user.esAdmin()).toBe(true);
    });

    test('debe retornar false para otros roles', () => {
      const user = new User({ ...validUserProps, rol: ROLES.ESTUDIANTE });
      expect(user.esAdmin()).toBe(false);
    });
  });

  describe('registrarInasistencia()', () => {
    test('debe incrementar el contador de inasistencias', () => {
      const user = new User(validUserProps);
      user.registrarInasistencia();
      expect(user.inasistencias).toBe(1);
    });

    test('no debe suspender con menos de 3 inasistencias', () => {
      const user = new User(validUserProps);
      user.registrarInasistencia();
      user.registrarInasistencia();
      expect(user.suspendido).toBe(false);
      expect(user.inasistencias).toBe(2);
    });

    test('debe suspender al alcanzar 3 inasistencias (RN-09)', () => {
      const user = new User(validUserProps);
      user.registrarInasistencia();
      user.registrarInasistencia();
      const suspendido = user.registrarInasistencia();
      expect(suspendido).toBe(true);
      expect(user.suspendido).toBe(true);
      expect(user.inasistencias).toBe(MAX_INASISTENCIAS);
    });
  });
});
