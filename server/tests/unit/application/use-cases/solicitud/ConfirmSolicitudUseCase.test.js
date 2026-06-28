const ConfirmSolicitudUseCase = require('../../../../../src/application/use-cases/solicitud/ConfirmSolicitudUseCase');
const { ESTADOS } = require('../../../../../src/domain/entities/Solicitud');

describe('ConfirmSolicitudUseCase', () => {
  let solicitudRepositoryMock;
  let confirmSolicitudUseCase;

  beforeEach(() => {
    solicitudRepositoryMock = {
      findById: jest.fn(),
      update: jest.fn(),
    };
    confirmSolicitudUseCase = new ConfirmSolicitudUseCase(solicitudRepositoryMock);
  });

  it('debe confirmar una solicitud como FINALIZADA por el solicitante', async () => {
    const mockSolicitud = {
      id: 'sol-1',
      estado: ESTADOS.COMPLETADA,
      solicitanteId: 'am-1',
    };
    solicitudRepositoryMock.findById.mockResolvedValue(mockSolicitud);
    solicitudRepositoryMock.update.mockResolvedValue({ ...mockSolicitud, estado: ESTADOS.FINALIZADA });

    const result = await confirmSolicitudUseCase.execute('sol-1', 'am-1');

    expect(solicitudRepositoryMock.update).toHaveBeenCalledWith('sol-1', {
      estado: ESTADOS.FINALIZADA,
    });
    expect(result.estado).toBe(ESTADOS.FINALIZADA);
  });

  it('debe lanzar error 404 si la solicitud no existe', async () => {
    solicitudRepositoryMock.findById.mockResolvedValue(null);
    await expect(confirmSolicitudUseCase.execute('sol-1', 'am-1'))
      .rejects.toThrow('Solicitud no encontrada.');
  });

  it('debe lanzar error 400 si la solicitud no está COMPLETADA', async () => {
    solicitudRepositoryMock.findById.mockResolvedValue({ id: 'sol-1', estado: ESTADOS.EN_CURSO });
    await expect(confirmSolicitudUseCase.execute('sol-1', 'am-1'))
      .rejects.toThrow('Solo se pueden confirmar tareas que han sido marcadas como completadas por el voluntario.');
  });

  it('debe lanzar error 403 si el que confirma no es el solicitante original', async () => {
    solicitudRepositoryMock.findById.mockResolvedValue({ id: 'sol-1', estado: ESTADOS.COMPLETADA, solicitanteId: 'am-1' });
    await expect(confirmSolicitudUseCase.execute('sol-1', 'otro-am'))
      .rejects.toThrow('Solo el solicitante puede confirmar la finalización.');
  });
});
