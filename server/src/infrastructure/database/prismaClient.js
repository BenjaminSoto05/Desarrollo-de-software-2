// ============================================================================
// Prisma Client Singleton
// Capa: Infrastructure
// Evita múltiples instancias de PrismaClient en desarrollo (hot reload)
// ============================================================================

const { PrismaClient } = require('@prisma/client');

/** @type {PrismaClient} */
let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // En desarrollo, reutilizar la instancia para evitar conexiones huérfanas
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: ['query', 'warn', 'error'],
    });
  }
  prisma = global.__prisma;
}

module.exports = prisma;
