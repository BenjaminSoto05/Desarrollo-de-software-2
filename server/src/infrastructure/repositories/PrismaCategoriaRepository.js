// ============================================================================
// Implementación: PrismaCategoriaRepository
// Capa: Infrastructure
// ============================================================================

const CategoriaRepository = require('../../domain/repositories/CategoriaRepository');

class PrismaCategoriaRepository extends CategoriaRepository {
  /**
   * @param {import('@prisma/client').PrismaClient} prisma
   */
  constructor(prisma) {
    super();
    this.prisma = prisma;
  }

  async findAllActive() {
    return this.prisma.categoria.findMany({
      where: { activa: true },
      orderBy: { nombre: 'asc' },
    });
  }

  async findById(id) {
    return this.prisma.categoria.findUnique({ where: { id } });
  }

  async create(categoriaData) {
    return this.prisma.categoria.create({ data: categoriaData });
  }
}

module.exports = PrismaCategoriaRepository;
