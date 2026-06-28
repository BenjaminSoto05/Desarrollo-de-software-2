// Factories para generar datos de prueba reutilizables
const { User, ROLES } = require('../../src/domain/entities/User');
const { Solicitud, ESTADOS } = require('../../src/domain/entities/Solicitud');
const { Categoria } = require('../../src/domain/entities/Categoria');

const crearUsuario = (overrides = {}) => new User({
  id: overrides.id || 'user-001',
  email: overrides.email || 'test@uct.cl',
  passwordHash: overrides.passwordHash || 'hashed-pass',
  rut: overrides.rut || '12345678-5',
  nombre: overrides.nombre || 'Test',
  apellido: overrides.apellido || 'User',
  telefono: overrides.telefono || null,
  rol: overrides.rol || ROLES.ESTUDIANTE,
  comuna: overrides.comuna || 'Temuco',
  direccion: overrides.direccion || null,
  inasistencias: overrides.inasistencias ?? 0,
  suspendido: overrides.suspendido ?? false,
  ...overrides,
});

const crearSolicitud = (overrides = {}) => new Solicitud({
  id: overrides.id || 'sol-001',
  titulo: overrides.titulo || 'Ayuda test',
  descripcion: overrides.descripcion || 'Descripcion de test',
  categoriaId: overrides.categoriaId || 'cat-001',
  solicitanteId: overrides.solicitanteId || 'user-solicitante',
  voluntarioId: overrides.voluntarioId || null,
  estado: overrides.estado || ESTADOS.PENDIENTE,
  fechaProgramada: overrides.fechaProgramada || new Date(Date.now() + 48 * 60 * 60 * 1000),
  horaProgramada: overrides.horaProgramada || '10:00',
  direccion: overrides.direccion || 'Calle Test 123',
  comuna: overrides.comuna || 'Temuco',
  ...overrides,
});

const crearCategoria = (overrides = {}) => new Categoria({
  id: overrides.id || 'cat-001',
  nombre: overrides.nombre || 'Compras',
  descripcion: overrides.descripcion || 'Ayuda con compras',
  activa: overrides.activa ?? true,
  ...overrides,
});

module.exports = {
  crearUsuario,
  crearSolicitud,
  crearCategoria,
  ROLES,
  ESTADOS,
};
