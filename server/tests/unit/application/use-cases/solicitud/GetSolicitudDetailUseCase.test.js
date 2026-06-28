const GetSolicitudDetailUseCase = require('../../../../../src/application/use-cases/solicitud/GetSolicitudDetailUseCase');

describe('GetSolicitudDetailUseCase', () => {
  let solicitudRepositoryMock;
  let getSolicitudDetailUseCase;

  beforeEach(() => {
    solicitudRepositoryMock = {
      findById: jest.fn(),
    };
    getSolicitudDetailUseCase = new GetSolicitudDetailUseCase(solicitudRepositoryMock);
  });

  const mockSolicitud = {
    id: 'sol-1',
    solicitanteId: 'am-1',
    voluntarioId: 'est-1',
    direccion: 'Calle Privada 123',
    solicitante: {
      nombre: 'Juan',
      telefono: '+56912345678',
      direccion: 'Calle Privada 123',
    },
  };

  it('debe mostrar datos privados si el usuario es el solicitante', async () => {
    solicitudRepositoryMock.findById.mockResolvedValue(mockSolicitud);
    const result = await getSolicitudDetailUseCase.execute('sol-1', { id: 'am-1', rol: 'ADULTO_MAYOR' });

    expect(result.direccion).toBe('Calle Privada 123');
    expect(result.solicitante.telefono).toBe('+56912345678');
  });

  it('debe mostrar datos privados si el usuario es el voluntario asignado', async () => {
    solicitudRepositoryMock.findById.mockResolvedValue(mockSolicitud);
    const result = await getSolicitudDetailUseCase.execute('sol-1', { id: 'est-1', rol: 'ESTUDIANTE' });

    expect(result.direccion).toBe('Calle Privada 123');
    expect(result.solicitante.telefono).toBe('+56912345678');
  });

  it('debe ocultar datos privados si el usuario no tiene permisos', async () => {
    solicitudRepositoryMock.findById.mockResolvedValue(mockSolicitud);
    const result = await getSolicitudDetailUseCase.execute('sol-1', { id: 'otro-est', rol: 'ESTUDIANTE' });

    expect(result.direccion).toBe('[Disponible después de aceptar la tarea]');
    expect(result.solicitante.telefono).toBeUndefined();
    expect(result.solicitante.direccion).toBeUndefined();
    expect(result.solicitante.nombre).toBe('Juan');
  });

  it('debe lanzar error 404 si la solicitud no existe', async () => {
    solicitudRepositoryMock.findById.mockResolvedValue(null);
    await expect(getSolicitudDetailUseCase.execute('sol-1', { id: 'est-1' }))
      .rejects.toThrow('Solicitud no encontrada.');
  });
});
