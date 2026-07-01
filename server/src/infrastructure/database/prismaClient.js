// ============================================================================
// Prisma Client Singleton
// Capa: Infrastructure
// Evita múltiples instancias de PrismaClient en desarrollo (hot reload)
// ============================================================================

let PrismaClient;

if (process.env.NODE_ENV === 'test') {
  PrismaClient = require('../../../tests/mocks/prismaMock').PrismaClient;
} else {
  ({ PrismaClient } = require('@prisma/client'));
}

/** @type {PrismaClient} */
let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: ['query', 'warn', 'error'],
    });
  }
  prisma = global.__prisma;
}

module.exports = prisma;
