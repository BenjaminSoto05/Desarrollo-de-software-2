// ============================================================================
// Implementación: PrismaSolicitudRepository
// Capa: Infrastructure
// ============================================================================

const SolicitudRepository = require('../../domain/repositories/SolicitudRepository');

class PrismaSolicitudRepository extends SolicitudRepository {
  /**
   * @param {import('@prisma/client').PrismaClient} prisma
   */
  constructor(prisma) {
    super();
    this.prisma = prisma;
  }

  async findById(id) {
    return this.prisma.solicitud.findUnique({
      where: { id },
      include: {
        categoria: true,
        solicitante: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            comuna: true,
            rol: true,
          },
        },
        voluntario: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            rol: true,
          },
        },
        evaluaciones: true,
      },
    });
  }

  async findAll(filters = {}) {
    const where = {};
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    if (filters.categoriaId) where.categoriaId = filters.categoriaId;
    if (filters.comuna) where.comuna = { contains: filters.comuna, mode: 'insensitive' };
    if (filters.estado) where.estado = filters.estado;

    const [data, total] = await Promise.all([
      this.prisma.solicitud.findMany({
        where,
        include: {
          categoria: true,
          solicitante: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              comuna: true,
            },
          },
        },
        orderBy: { fechaProgramada: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.solicitud.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findBySolicitante(solicitanteId) {
    return this.prisma.solicitud.findMany({
      where: { solicitanteId },
      include: {
        categoria: true,
        voluntario: {
          select: { id: true, nombre: true, apellido: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByVoluntario(voluntarioId) {
    return this.prisma.solicitud.findMany({
      where: { voluntarioId },
      include: {
        categoria: true,
        solicitante: {
          select: { id: true, nombre: true, apellido: true, comuna: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * RF-EMP-04: Cuenta solicitudes activas (EN_CURSO) de un voluntario.
   */
  async countActiveByVoluntario(voluntarioId) {
    return this.prisma.solicitud.count({
      where: {
        voluntarioId,
        estado: 'EN_CURSO',
      },
    });
  }

  async create(solicitudData) {
    return this.prisma.solicitud.create({
      data: solicitudData,
      include: { categoria: true },
    });
  }

  async update(id, solicitudData) {
    return this.prisma.solicitud.update({
      where: { id },
      data: solicitudData,
      include: {
        categoria: true,
        solicitante: {
          select: { id: true, nombre: true, apellido: true },
        },
        voluntario: {
          select: { id: true, nombre: true, apellido: true },
        },
      },
    });
  }

  async delete(id) {
    return this.prisma.solicitud.delete({ where: { id } });
  }

  /**
   * RF-EJE-05: Solicitudes completadas sin confirmar hace más de 48 horas.
   */
  async findCompletadasSinConfirmar() {
    const hace48Horas = new Date();
    hace48Horas.setHours(hace48Horas.getHours() - 48);

    return this.prisma.solicitud.findMany({
      where: {
        estado: 'COMPLETADA',
        updatedAt: { lte: hace48Horas },
      },
    });
  }
}

module.exports = PrismaSolicitudRepository;
