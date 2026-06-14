// ============================================================================
// Use Case: Aceptar Solicitud
// Capa: Application
// RF-EMP-03: Estudiante acepta una solicitud
// RF-EMP-04: Máximo 2 solicitudes activas por estudiante
// RF-EMP-05: Liberar dirección al voluntario asignado
// Control de concurrencia: Evitar doble aceptación simultánea
// ============================================================================

const { ESTADOS } = require('../../../domain/entities/Solicitud');
const { MAX_SOLICITUDES_ACTIVAS } = require('../../../domain/services/SolicitudValidationService');

class AcceptSolicitudUseCase {
  /**
   * @param {import('../../../domain/repositories/SolicitudRepository')} solicitudRepository
   * @param {import('../../../domain/repositories/UserRepository')} userRepository
   * @param {import('../../../infrastructure/database/prismaClient')} prisma - Para transacciones
   */
  constructor(solicitudRepository, userRepository, prisma) {
    this.solicitudRepository = solicitudRepository;
    this.userRepository = userRepository;
    this.prisma = prisma;
  }

  /**
   * Acepta una solicitud como voluntario.
   * Usa transacción Prisma para control de concurrencia.
   * @param {string} solicitudId
   * @param {string} estudianteId
   * @returns {Promise<Object>} Solicitud actualizada con dirección visible
   */
  async execute(solicitudId, estudianteId) {
    // 1. Verificar que el estudiante existe, es ESTUDIANTE, y no está suspendido
    const estudiante = await this.userRepository.findById(estudianteId);

    if (!estudiante) {
      const error = new Error('Usuario no encontrado.');
      error.statusCode = 404;
      throw error;
    }

    if (estudiante.rol !== 'ESTUDIANTE') {
      const error = new Error('Solo los estudiantes pueden aceptar solicitudes.');
      error.statusCode = 403;
      throw error;
    }

    if (estudiante.suspendido) {
      const error = new Error('Tu cuenta está suspendida. No puedes aceptar solicitudes.');
      error.statusCode = 403;
      throw error;
    }

    // 2. Verificar límite de solicitudes activas (RF-EMP-04)
    const activas = await this.solicitudRepository.countActiveByVoluntario(estudianteId);

    if (activas >= MAX_SOLICITUDES_ACTIVAS) {
      const error = new Error(
        `Ya tienes ${activas} solicitudes activas. El máximo permitido es ${MAX_SOLICITUDES_ACTIVAS}.`
      );
      error.statusCode = 400;
      throw error;
    }

    // 3. Aceptar con transacción para evitar doble aceptación (concurrencia)
    // Usamos update con condición de estado para garantizar atomicidad
    try {
      const solicitudActualizada = await this.prisma.$transaction(async (tx) => {
        // Verificar estado actual dentro de la transacción
        const solicitud = await tx.solicitud.findUnique({
          where: { id: solicitudId },
          include: { solicitante: true },
        });

        if (!solicitud) {
          const error = new Error('Solicitud no encontrada.');
          error.statusCode = 404;
          throw error;
        }

        if (solicitud.estado !== ESTADOS.PENDIENTE) {
          const error = new Error('Esta solicitud ya no está disponible.');
          error.statusCode = 409;
          throw error;
        }

        // No puede aceptar su propia solicitud
        if (solicitud.solicitanteId === estudianteId) {
          const error = new Error('No puedes aceptar tu propia solicitud.');
          error.statusCode = 400;
          throw error;
        }

        // Re-verificar conteo dentro de la transacción (doble check)
        const activasTx = await tx.solicitud.count({
          where: { voluntarioId: estudianteId, estado: ESTADOS.EN_CURSO },
        });

        if (activasTx >= MAX_SOLICITUDES_ACTIVAS) {
          const error = new Error(
            `Límite de solicitudes activas alcanzado (${MAX_SOLICITUDES_ACTIVAS}).`
          );
          error.statusCode = 400;
          throw error;
        }

        // Actualizar estado y asignar voluntario atómicamente
        const updated = await tx.solicitud.update({
          where: { id: solicitudId },
          data: {
            estado: ESTADOS.EN_CURSO,
            voluntarioId: estudianteId,
          },
          include: {
            categoria: true,
            solicitante: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                telefono: true,
                comuna: true,
                direccion: true,
              },
            },
            voluntario: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                email: true,
              },
            },
          },
        });

        return updated;
      });

      // RF-EMP-05: La dirección ahora es visible para el voluntario asignado
      return solicitudActualizada;
    } catch (error) {
      // Re-throw errores de negocio
      if (error.statusCode) throw error;

      // Error de concurrencia (otro estudiante aceptó primero)
      if (error.code === 'P2025') {
        const concurrencyError = new Error(
          'Esta solicitud ya fue aceptada por otro voluntario.'
        );
        concurrencyError.statusCode = 409;
        throw concurrencyError;
      }

      throw error;
    }
  }
}

module.exports = AcceptSolicitudUseCase;
