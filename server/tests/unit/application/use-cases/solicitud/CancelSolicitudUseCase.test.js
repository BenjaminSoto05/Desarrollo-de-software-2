const CancelSolicitudUseCase = require('../../../../../src/application/use-cases/solicitud/CancelSolicitudUseCase');
const { ESTADOS } = require('../../../../../src/domain/entities/Solicitud');

describe('CancelSolicitudUseCase', () => {
  let solicitudRepositoryMock;
  let cancelSolicitudUseCase;

  beforeEach(() => {
    solicitudRepositoryMock = {
      findById: jest.fn(),
      update: jest.fn(),
    };
    cancelSolicitudUseCase = new CancelSolicitudUseCase(solicitudRepositoryMock);
  });

  it('debe cancelar una solicitud si es el creador', async () => {
    const mockSolicitudData = {
      id: 'sol-1',
      solicitanteId: 'am-1',
      estado: ESTADOS.PENDIENTE,
    };
    solicitudRepositoryMock.findById.mockResolvedValue(mockSolicitudData);
    solicitudRepositoryMock.update.mockResolvedValue({
      ...mockSolicitudData,
      estado: ESTADOS.CANCELADA,
      voluntarioId: null,
    });

    const result = await cancelSolicitudUseCase.execute('sol-1', 'am-1');

    expect(solicitudRepositoryMock.update).toHaveBeenCalledWith('sol-1', {
      estado: ESTADOS.CANCELADA,
      voluntarioId: null,
    });
    expect(result.estado).toBe(ESTADOS.CANCELADA);
  });

  it('debe lanzar error 403 si intenta cancelar una solicitud que no es suya', async () => {
    const mockSolicitudData = {
      id: 'sol-1',
      solicitanteId: 'am-1',
      estado: ESTADOS.PENDIENTE,
    };
    solicitudRepositoryMock.findById.mockResolvedValue(mockSolicitudData);

    await expect(cancelSolicitudUseCase.execute('sol-1', 'otro-id'))
      .rejects.toThrow('No puedes cancelar esta solicitud.');
  });

  it('debe lanzar error 404 si la solicitud no existe', async () => {
    solicitudRepositoryMock.findById.mockResolvedValue(null);

    await expect(cancelSolicitudUseCase.execute('sol-1', 'am-1'))
      .rejects.toThrow('Solicitud no encontrada.');
  });
});
