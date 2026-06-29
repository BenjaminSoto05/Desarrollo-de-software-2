const AutoApproveSolicitudesUseCase = require('../../../../../src/application/use-cases/solicitud/AutoApproveSolicitudesUseCase');
const { ESTADOS } = require('../../../../../src/domain/entities/Solicitud');

describe('AutoApproveSolicitudesUseCase', () => {
  let solicitudRepositoryMock;
  let autoApproveSolicitudesUseCase;

  beforeEach(() => {
    solicitudRepositoryMock = {
      findCompletadasSinConfirmar: jest.fn(),
      update: jest.fn(),
    };
    autoApproveSolicitudesUseCase = new AutoApproveSolicitudesUseCase(solicitudRepositoryMock);
  });

  it('debe aprobar automáticamente las solicitudes completadas sin confirmar', async () => {
    const mockSolicitudes = [
      { id: 'sol-1', estado: ESTADOS.COMPLETADA },
      { id: 'sol-2', estado: ESTADOS.COMPLETADA },
    ];
    solicitudRepositoryMock.findCompletadasSinConfirmar.mockResolvedValue(mockSolicitudes);
    solicitudRepositoryMock.update.mockResolvedValue();

    const result = await autoApproveSolicitudesUseCase.execute();

    expect(solicitudRepositoryMock.findCompletadasSinConfirmar).toHaveBeenCalledTimes(1);
    expect(solicitudRepositoryMock.update).toHaveBeenCalledTimes(2);
    expect(solicitudRepositoryMock.update).toHaveBeenCalledWith('sol-1', { estado: ESTADOS.FINALIZADA });
    expect(solicitudRepositoryMock.update).toHaveBeenCalledWith('sol-2', { estado: ESTADOS.FINALIZADA });
    expect(result.solicitudesAprobadas).toBe(2);
    expect(result.totalRevisadas).toBe(2);
  });

  it('debe manejar correctamente el caso donde no hay solicitudes pendientes', async () => {
    solicitudRepositoryMock.findCompletadasSinConfirmar.mockResolvedValue([]);

    const result = await autoApproveSolicitudesUseCase.execute();

    expect(solicitudRepositoryMock.update).not.toHaveBeenCalled();
    expect(result.solicitudesAprobadas).toBe(0);
    expect(result.totalRevisadas).toBe(0);
  });
});
