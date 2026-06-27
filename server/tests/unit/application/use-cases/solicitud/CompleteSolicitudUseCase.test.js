const CompleteSolicitudUseCase = require('../../../../../src/application/use-cases/solicitud/CompleteSolicitudUseCase');
const { ESTADOS } = require('../../../../../src/domain/entities/Solicitud');

describe('CompleteSolicitudUseCase', () => {
  let solicitudRepositoryMock;
  let completeSolicitudUseCase;

  beforeEach(() => {
    solicitudRepositoryMock = {
      findById: jest.fn(),
      update: jest.fn(),
    };
    completeSolicitudUseCase = new CompleteSolicitudUseCase(solicitudRepositoryMock);
  });

  it('debe marcar una solicitud como completada por el voluntario asignado', async () => {
    const mockSolicitud = {
      id: 'sol-1',
      estado: ESTADOS.EN_CURSO,
      voluntarioId: 'est-1',
    };
    solicitudRepositoryMock.findById.mockResolvedValue(mockSolicitud);
    solicitudRepositoryMock.update.mockResolvedValue({ ...mockSolicitud, estado: ESTADOS.COMPLETADA });

    const result = await completeSolicitudUseCase.execute('sol-1', 'est-1');

    expect(solicitudRepositoryMock.update).toHaveBeenCalledWith('sol-1', {
      estado: ESTADOS.COMPLETADA,
    });
    expect(result.estado).toBe(ESTADOS.COMPLETADA);
  });

  it('debe lanzar error 404 si la solicitud no existe', async () => {
    solicitudRepositoryMock.findById.mockResolvedValue(null);
    await expect(completeSolicitudUseCase.execute('sol-1', 'est-1'))
      .rejects.toThrow('Solicitud no encontrada.');
  });

  it('debe lanzar error 400 si la solicitud no está EN_CURSO', async () => {
    solicitudRepositoryMock.findById.mockResolvedValue({ id: 'sol-1', estado: ESTADOS.PENDIENTE });
    await expect(completeSolicitudUseCase.execute('sol-1', 'est-1'))
      .rejects.toThrow('Solo se pueden completar tareas que están en curso.');
  });

  it('debe lanzar error 403 si el voluntario no es el asignado', async () => {
    solicitudRepositoryMock.findById.mockResolvedValue({ id: 'sol-1', estado: ESTADOS.EN_CURSO, voluntarioId: 'est-1' });
    await expect(completeSolicitudUseCase.execute('sol-1', 'otro-voluntario'))
      .rejects.toThrow('Solo el voluntario asignado puede completar esta tarea.');
  });
});
