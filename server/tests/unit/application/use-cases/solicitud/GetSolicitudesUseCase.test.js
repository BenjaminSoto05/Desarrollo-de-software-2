const GetSolicitudesUseCase = require('../../../../../src/application/use-cases/solicitud/GetSolicitudesUseCase');

describe('GetSolicitudesUseCase', () => {
  let solicitudRepositoryMock;
  let getSolicitudesUseCase;

  beforeEach(() => {
    solicitudRepositoryMock = {
      findAll: jest.fn(),
    };
    getSolicitudesUseCase = new GetSolicitudesUseCase(solicitudRepositoryMock);
  });

  it('debe retornar lista de solicitudes y ocultar datos sensibles', async () => {
    const mockData = {
      data: [
        {
          id: 'sol-1',
          direccion: 'Privado',
          solicitante: {
            nombre: 'Juan',
            telefono: '+569123',
            direccion: 'Privado',
          }
        },
      ],
      total: 1,
    };
    solicitudRepositoryMock.findAll.mockResolvedValue(mockData);

    const result = await getSolicitudesUseCase.execute({}, { id: 'user-1' });

    expect(solicitudRepositoryMock.findAll).toHaveBeenCalledWith({});
    expect(result.data[0].direccion).toBeUndefined();
    expect(result.data[0].solicitante.telefono).toBeUndefined();
    expect(result.data[0].solicitante.direccion).toBeUndefined();
    expect(result.data[0].solicitante.nombre).toBe('Juan');
    expect(result.total).toBe(1);
  });
});
