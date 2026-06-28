const AcceptSolicitudUseCase = require('../../../../../src/application/use-cases/solicitud/AcceptSolicitudUseCase');
const { ESTADOS } = require('../../../../../src/domain/entities/Solicitud');
const { MAX_SOLICITUDES_ACTIVAS } = require('../../../../../src/domain/services/SolicitudValidationService');

describe('AcceptSolicitudUseCase', () => {
  let solicitudRepositoryMock;
  let userRepositoryMock;
  let prismaMock;
  let acceptSolicitudUseCase;

  beforeEach(() => {
    solicitudRepositoryMock = {
      countActiveByVoluntario: jest.fn(),
    };
    userRepositoryMock = {
      findById: jest.fn(),
    };
    prismaMock = {
      $transaction: jest.fn(),
      solicitud: {
        findUnique: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
      },
    };
    acceptSolicitudUseCase = new AcceptSolicitudUseCase(solicitudRepositoryMock, userRepositoryMock, prismaMock);
  });

  const validEstudiante = {
    id: 'est-1',
    rol: 'ESTUDIANTE',
    suspendido: false,
  };

  const validSolicitud = {
    id: 'sol-1',
    estado: ESTADOS.PENDIENTE,
    solicitanteId: 'am-1',
  };

  it('debe aceptar la solicitud correctamente y retornar con dirección visible', async () => {
    userRepositoryMock.findById.mockResolvedValue(validEstudiante);
    solicitudRepositoryMock.countActiveByVoluntario.mockResolvedValue(0);

    // Mock implementation for Prisma transaction
    prismaMock.$transaction.mockImplementation(async (callback) => {
      prismaMock.solicitud.findUnique.mockResolvedValue(validSolicitud);
      prismaMock.solicitud.count.mockResolvedValue(0);
      prismaMock.solicitud.update.mockResolvedValue({ ...validSolicitud, estado: ESTADOS.EN_CURSO, voluntarioId: 'est-1' });
      return callback(prismaMock);
    });

    const result = await acceptSolicitudUseCase.execute('sol-1', 'est-1');

    expect(userRepositoryMock.findById).toHaveBeenCalledWith('est-1');
    expect(solicitudRepositoryMock.countActiveByVoluntario).toHaveBeenCalledWith('est-1');
    expect(prismaMock.solicitud.update).toHaveBeenCalledWith({
      where: { id: 'sol-1' },
      data: { estado: ESTADOS.EN_CURSO, voluntarioId: 'est-1' },
      include: expect.any(Object),
    });
    expect(result.estado).toBe(ESTADOS.EN_CURSO);
    expect(result.voluntarioId).toBe('est-1');
  });

  it('debe lanzar error 403 si el usuario no es estudiante', async () => {
    userRepositoryMock.findById.mockResolvedValue({ ...validEstudiante, rol: 'ADULTO_MAYOR' });
    
    await expect(acceptSolicitudUseCase.execute('sol-1', 'am-1'))
      .rejects.toThrow('Solo los estudiantes pueden aceptar solicitudes.');
  });

  it('debe lanzar error 403 si el estudiante está suspendido', async () => {
    userRepositoryMock.findById.mockResolvedValue({ ...validEstudiante, suspendido: true });
    
    await expect(acceptSolicitudUseCase.execute('sol-1', 'est-1'))
      .rejects.toThrow('Tu cuenta está suspendida. No puedes aceptar solicitudes.');
  });

  it('debe lanzar error 400 si el estudiante ya tiene el máximo de solicitudes', async () => {
    userRepositoryMock.findById.mockResolvedValue(validEstudiante);
    solicitudRepositoryMock.countActiveByVoluntario.mockResolvedValue(MAX_SOLICITUDES_ACTIVAS);

    await expect(acceptSolicitudUseCase.execute('sol-1', 'est-1'))
      .rejects.toThrow(`Ya tienes ${MAX_SOLICITUDES_ACTIVAS} solicitudes activas.`);
  });

  it('debe lanzar error 404 si la solicitud no existe en BD', async () => {
    userRepositoryMock.findById.mockResolvedValue(validEstudiante);
    solicitudRepositoryMock.countActiveByVoluntario.mockResolvedValue(0);

    prismaMock.$transaction.mockImplementation(async (callback) => {
      prismaMock.solicitud.findUnique.mockResolvedValue(null);
      return callback(prismaMock);
    });

    await expect(acceptSolicitudUseCase.execute('sol-1', 'est-1'))
      .rejects.toThrow('Solicitud no encontrada.');
  });
});
