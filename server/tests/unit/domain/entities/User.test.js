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

    test('debe asignar valores por defecto', () => {
      const user = new User(validUserProps);
      expect(user.telefono).toBeNull();
      expect(user.comuna).toBeNull();
      expect(user.direccion).toBeNull();
    });
  });

  describe('getNombreCompleto()', () => {
    test('debe retornar nombre y apellido', () => {
      const user = new User(validUserProps);
      expect(user.getNombreCompleto()).toBe('Juan Pérez');
    });
  });

  describe('esEstudiante()', () => {
    test('true para ESTUDIANTE', () => {
      const user = new User({ ...validUserProps, rol: ROLES.ESTUDIANTE });
      expect(user.esEstudiante()).toBe(true);
    });
    test('false para ADULTO_MAYOR', () => {
      const user = new User({ ...validUserProps, rol: ROLES.ADULTO_MAYOR });
      expect(user.esEstudiante()).toBe(false);
    });
  });

  describe('puedeCrearSolicitudes()', () => {
    test('true para ADULTO_MAYOR no suspendido', () => {
      const user = new User({ ...validUserProps, rol: ROLES.ADULTO_MAYOR });
      expect(user.puedeCrearSolicitudes()).toBe(true);
    });
    test('true para TUTOR no suspendido', () => {
      const user = new User({ ...validUserProps, rol: ROLES.TUTOR });
      expect(user.puedeCrearSolicitudes()).toBe(true);
    });
    test('false para ESTUDIANTE', () => {
      const user = new User({ ...validUserProps, rol: ROLES.ESTUDIANTE });
      expect(user.puedeCrearSolicitudes()).toBe(false);
    });
    test('false si suspendido', () => {
      const user = new User({ ...validUserProps, rol: ROLES.ADULTO_MAYOR, suspendido: true });
      expect(user.puedeCrearSolicitudes()).toBe(false);
    });
  });

  describe('puedeAceptarTareas()', () => {
    test('true para ESTUDIANTE no suspendido', () => {
      const user = new User({ ...validUserProps, rol: ROLES.ESTUDIANTE });
      expect(user.puedeAceptarTareas()).toBe(true);
    });
    test('false para ADULTO_MAYOR', () => {
      const user = new User({ ...validUserProps, rol: ROLES.ADULTO_MAYOR });
      expect(user.puedeAceptarTareas()).toBe(false);
    });
    test('false si suspendido', () => {
      const user = new User({ ...validUserProps, rol: ROLES.ESTUDIANTE, suspendido: true });
      expect(user.puedeAceptarTareas()).toBe(false);
    });
  });

  describe('esAdmin()', () => {
    test('true para ADMIN', () => {
      const user = new User({ ...validUserProps, rol: ROLES.ADMIN });
      expect(user.esAdmin()).toBe(true);
    });
    test('false para otros roles', () => {
      const user = new User({ ...validUserProps, rol: ROLES.ESTUDIANTE });
      expect(user.esAdmin()).toBe(false);
    });
  });

  describe('registrarInasistencia() — RN-09', () => {
    test('incrementa contador', () => {
      const user = new User(validUserProps);
      user.registrarInasistencia();
      expect(user.inasistencias).toBe(1);
    });
    test('no suspende con menos de 3', () => {
      const user = new User(validUserProps);
      user.registrarInasistencia();
      user.registrarInasistencia();
      expect(user.suspendido).toBe(false);
    });
    test('suspende al alcanzar 3', () => {
      const user = new User(validUserProps);
      user.registrarInasistencia();
      user.registrarInasistencia();
      const result = user.registrarInasistencia();
      expect(result).toBe(true);
      expect(user.suspendido).toBe(true);
      expect(user.inasistencias).toBe(MAX_INASISTENCIAS);
    });
  });
});
