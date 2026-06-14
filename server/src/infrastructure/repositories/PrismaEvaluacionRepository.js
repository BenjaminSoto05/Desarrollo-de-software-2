// ============================================================================
// Implementación: PrismaEvaluacionRepository
// Capa: Infrastructure
// ============================================================================

const EvaluacionRepository = require('../../domain/repositories/EvaluacionRepository');

class PrismaEvaluacionRepository extends EvaluacionRepository {
  /**
   * @param {import('@prisma/client').PrismaClient} prisma
   */
  constructor(prisma) {
    super();
    this.prisma = prisma;
  }

  async create(evaluacionData) {
    return this.prisma.evaluacion.create({
      data: evaluacionData,
      include: {
        evaluador: {
          select: { id: true, nombre: true, apellido: true },
        },
        evaluado: {
          select: { id: true, nombre: true, apellido: true },
        },
      },
    });
  }

  async findBySolicitud(solicitudId) {
    return this.prisma.evaluacion.findMany({
      where: { solicitudId },
      include: {
        evaluador: {
          select: { id: true, nombre: true, apellido: true },
        },
      },
    });
  }

  async findByEvaluado(evaluadoId) {
    return this.prisma.evaluacion.findMany({
      where: { evaluadoId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async existsForSolicitudAndEvaluador(solicitudId, evaluadorId) {
    const count = await this.prisma.evaluacion.count({
      where: { solicitudId, evaluadorId },
    });
    return count > 0;
  }
}

module.exports = PrismaEvaluacionRepository;
