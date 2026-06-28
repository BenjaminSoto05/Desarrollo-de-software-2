// Tests de Integracion para AcceptSolicitudUseCase
// Verifica interaccion entre Use Case, SolicitudRepository, UserRepository
// Mockea prisma.$transaction para evitar acceso a BD real

const AcceptSolicitudUseCase = require('../../../src/application/use-cases/solicitud/AcceptSolicitudUseCase');
const { ROLES, MAX_INASISTENCIAS } = require('../../../src/domain/entities/User');
const { ESTADOS } = require('../../../src/domain/entities/Solicitud');

describe('AcceptSolicitudUseCase (Integracion)', () => {
  let useCase;
  let mockSolicitudRepo;
  let mockUserRepo;
  let mockPrisma;

  beforeEach(() => {
    mockSolicitudRepo = {
      findById: jest.fn(),
      countActiveByVoluntario: jest.fn(),
      update: jest.fn(),
    };
    mockUserRepo = {
      findById: jest.fn(),
    };
    mockPrisma = {
      $transaction: jest.fn(),
    };

    useCase = new AcceptSolicitudUseCase(mockSolicitudRepo, mockUserRepo, mockPrisma);
  });

  describe('Aceptacion exitosa', () => {
    it('debe aceptar solicitud y cambiar estado a EN_CURSO', async () => {
      const estudiante = {
        id: 'est-001',
        rol: ROLES.ESTUDIANTE,
        suspendido: false,
      };
      const solicitudPendiente = {
        id: 'sol-001',
        estado: ESTADOS.PENDIENTE,
        solicitanteId: 'user-solicitante',
        voluntarioId: null,
      };
      const solicitudActualizada = {
        id: 'sol-001',
        estado: ESTADOS.EN_CURSO,
        voluntarioId: 'est-001',
        solicitanteId: 'user-solicitante',
      };

      mockUserRepo.findById.mockResolvedValue(estudiante);
      mockSolicitudRepo.countActiveByVoluntario.mockResolvedValue(0);

      const mockTx = {
        solicitud: {
          findUnique: jest.fn().mockResolvedValue(solicitudPendiente),
          count: jest.fn().mockResolvedValue(0),
          update: jest.fn().mockResolvedValue(solicitudActualizada),
        },
      };

      mockPrisma.$transaction.mockImplementation(async (fn) => fn(mockTx));

      const resultado = await useCase.execute('sol-001', 'est-001');

      expect(mockUserRepo.findById).toHaveBeenCalledWith('est-001');
      expect(mockSolicitudRepo.countActiveByVoluntario).toHaveBeenCalledWith('est-001');
      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(mockTx.solicitud.findUnique).toHaveBeenCalledWith({
        where: { id: 'sol-001' },
        include: expect.any(Object),
      });
      expect(mockTx.solicitud.update).toHaveBeenCalledWith({
        where: { id: 'sol-001' },
        data: { estado: ESTADOS.EN_CURSO, voluntarioId: 'est-001' },
        include: expect.any(Object),
      });
      expect(resultado.estado).toBe(ESTADOS.EN_CURSO);
      expect(resultado.voluntarioId).toBe('est-001');
    });
  });

  describe('Validaciones de estudiante', () => {
    it('debe rechazar si el usuario no existe', async () => {
      mockUserRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute('sol-001', 'est-inexistente')).rejects.toThrow(
        'Usuario no encontrado.'
      );
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });

    it('debe rechazar si el usuario no es ESTUDIANTE', async () => {
      mockUserRepo.findById.mockResolvedValue({
        id: 'user-001',
        rol: ROLES.ADULTO_MAYOR,
        suspendido: false,
      });

      await expect(useCase.execute('sol-001', 'user-001')).rejects.toThrow(
        'Solo los estudiantes pueden aceptar solicitudes.'
      );
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });

    it('debe rechazar usuario suspendido', async () => {
      mockUserRepo.findById.mockResolvedValue({
        id: 'est-001',
        rol: ROLES.ESTUDIANTE,
        suspendido: true,
      });

      await expect(useCase.execute('sol-001', 'est-001')).rejects.toThrow(
        'Tu cuenta está suspendida. No puedes aceptar solicitudes.'
      );
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });
  });

  describe('Limite de solicitudes activas', () => {
    it('debe rechazar voluntario con dos solicitudes activas', async () => {
      const estudiante = {
        id: 'est-001',
        rol: ROLES.ESTUDIANTE,
        suspendido: false,
      };

      mockUserRepo.findById.mockResolvedValue(estudiante);
      mockSolicitudRepo.countActiveByVoluntario.mockResolvedValue(2);

      try {
        await useCase.execute('sol-001', 'est-001');
        fail('Deberia haber lanzado error');
      } catch (error) {
        expect(error.message).toContain('permitido es');
      }
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });
  });

  describe('Validaciones dentro de transaccion', () => {
    it('debe rechazar solicitud que no esta PENDIENTE', async () => {
      const estudiante = {
        id: 'est-001',
        rol: ROLES.ESTUDIANTE,
        suspendido: false,
      };
      const solicitudEnCurso = {
        id: 'sol-001',
        estado: ESTADOS.EN_CURSO,
        solicitanteId: 'user-solicitante',
        voluntarioId: null,
      };

      mockUserRepo.findById.mockResolvedValue(estudiante);
      mockSolicitudRepo.countActiveByVoluntario.mockResolvedValue(0);

      const mockTx = {
        solicitud: {
          findUnique: jest.fn().mockResolvedValue(solicitudEnCurso),
          count: jest.fn(),
          update: jest.fn(),
        },
      };

      mockPrisma.$transaction.mockImplementation(async (fn) => fn(mockTx));

      await expect(useCase.execute('sol-001', 'est-001')).rejects.toThrow(
        'Esta solicitud ya no está disponible.'
      );
      expect(mockTx.solicitud.update).not.toHaveBeenCalled();
    });
  });
});
