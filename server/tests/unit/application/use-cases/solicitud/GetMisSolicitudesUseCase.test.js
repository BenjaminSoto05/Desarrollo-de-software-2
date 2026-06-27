const GetMisSolicitudesUseCase = require('../../../../../src/application/use-cases/solicitud/GetMisSolicitudesUseCase');

describe('GetMisSolicitudesUseCase', () => {
  let solicitudRepositoryMock;
  let getMisSolicitudesUseCase;

  beforeEach(() => {
    solicitudRepositoryMock = {
      findBySolicitante: jest.fn(),
      findByVoluntario: jest.fn(),
    };
    getMisSolicitudesUseCase = new GetMisSolicitudesUseCase(solicitudRepositoryMock);
  });

  it('debe retornar solicitudes del solicitante si el rol es ADULTO_MAYOR', async () => {
    const mockData = [{ id: 'sol-1' }];
    solicitudRepositoryMock.findBySolicitante.mockResolvedValue(mockData);

    const result = await getMisSolicitudesUseCase.execute('am-1', 'ADULTO_MAYOR');

    expect(solicitudRepositoryMock.findBySolicitante).toHaveBeenCalledWith('am-1');
    expect(result).toEqual(mockData);
  });

  it('debe retornar solicitudes asignadas al voluntario si el rol es ESTUDIANTE', async () => {
    const mockData = [{ id: 'sol-2' }];
    solicitudRepositoryMock.findByVoluntario.mockResolvedValue(mockData);

    const result = await getMisSolicitudesUseCase.execute('est-1', 'ESTUDIANTE');

    expect(solicitudRepositoryMock.findByVoluntario).toHaveBeenCalledWith('est-1');
    expect(result).toEqual(mockData);
  });

  it('debe lanzar error 403 si el rol es inválido', async () => {
    await expect(getMisSolicitudesUseCase.execute('admin-1', 'ADMIN'))
      .rejects.toThrow('Rol no válido para esta consulta.');
  });
});
