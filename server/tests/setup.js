// Setup global para tests de integracion
jest.mock('@prisma/client', () => require('../mocks/prismaMock'));

// Limpiar mocks entre pruebas
global.afterEach(() => {
  jest.clearAllMocks();
});
