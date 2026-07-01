// Setup global para tests de integracion
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-access-secret';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-refresh-secret';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
process.env.JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

jest.mock('@prisma/client', () => require('./mocks/prismaMock'));

// Limpiar mocks entre pruebas
global.afterEach(() => {
  jest.clearAllMocks();
});
