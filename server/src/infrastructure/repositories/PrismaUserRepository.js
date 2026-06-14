// ============================================================================
// Implementación: PrismaUserRepository
// Capa: Infrastructure — Implementa el contrato de domain/repositories
// Principio: Dependency Inversion (la aplicación depende de la interfaz)
// ============================================================================

const UserRepository = require('../../domain/repositories/UserRepository');

class PrismaUserRepository extends UserRepository {
  /**
   * @param {import('@prisma/client').PrismaClient} prisma
   */
  constructor(prisma) {
    super();
    this.prisma = prisma;
  }

  async findById(id) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findByRut(rut) {
    return this.prisma.user.findUnique({ where: { rut } });
  }

  async create(userData) {
    return this.prisma.user.create({ data: userData });
  }

  async update(id, userData) {
    return this.prisma.user.update({
      where: { id },
      data: userData,
    });
  }

  async findAll(filters = {}) {
    const where = {};

    if (filters.rol) where.rol = filters.rol;
    if (filters.suspendido !== undefined) where.suspendido = filters.suspendido;

    return this.prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }
}

module.exports = PrismaUserRepository;
