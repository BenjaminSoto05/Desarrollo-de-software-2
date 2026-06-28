const UpdateSolicitudUseCase = require('../../../../../src/application/use-cases/solicitud/UpdateSolicitudUseCase');
const { ESTADOS } = require('../../../../../src/domain/entities/Solicitud');
const { SolicitudValidationService } = require('../../../../../src/domain/services/SolicitudValidationService');

describe('UpdateSolicitudUseCase', () => {
  let solicitudRepositoryMock;
  let categoriaRepositoryMock;
  let updateSolicitudUseCase;

  beforeEach(() => {
    solicitudRepositoryMock = {
      findById: jest.fn(),
      update: jest.fn(),
    };
    categoriaRepositoryMock = {
      findById: jest.fn(),
    };
    updateSolicitudUseCase = new UpdateSolicitudUseCase(solicitudRepositoryMock, categoriaRepositoryMock);
  });

  const mockSolicitudData = {
    id: 'sol-1',
    solicitanteId: 'am-1',
    estado: ESTADOS.PENDIENTE,
    fechaProgramada: new Date('2026-10-10T10:00:00'),
    horaProgramada: '10:00',
  };

  it('debe actualizar una solicitud si es el creador y está pendiente', async () => {
    solicitudRepositoryMock.findById.mockResolvedValue(mockSolicitudData);
    solicitudRepositoryMock.update.mockResolvedValue({ ...mockSolicitudData, titulo: 'Nuevo Título' });

    const result = await updateSolicitudUseCase.execute('sol-1', { titulo: 'Nuevo Título' }, 'am-1');

    expect(solicitudRepositoryMock.update).toHaveBeenCalledWith('sol-1', expect.objectContaining({
      titulo: 'Nuevo Título',
    }));
    expect(result.titulo).toBe('Nuevo Título');
  });

  it('debe lanzar error 403 si no es el creador', async () => {
    solicitudRepositoryMock.findById.mockResolvedValue(mockSolicitudData);
    await expect(updateSolicitudUseCase.execute('sol-1', { titulo: 'T2' }, 'otro-am'))
      .rejects.toThrow('No puedes editar esta solicitud.');
  });

  it('debe lanzar error 400 si la nueva categoría no existe', async () => {
    solicitudRepositoryMock.findById.mockResolvedValue(mockSolicitudData);
    categoriaRepositoryMock.findById.mockResolvedValue(null);

    await expect(updateSolicitudUseCase.execute('sol-1', { categoriaId: 'fake-cat' }, 'am-1'))
      .rejects.toThrow('La categoría seleccionada no es válida.');
  });

  it('debe lanzar error 400 si la validación de nueva fecha falla', async () => {
    solicitudRepositoryMock.findById.mockResolvedValue(mockSolicitudData);
    jest.spyOn(SolicitudValidationService, 'validarCreacion').mockReturnValue({ valid: false, errors: ['Fecha inválida'] });

    await expect(updateSolicitudUseCase.execute('sol-1', { fechaProgramada: '2022-01-01' }, 'am-1'))
      .rejects.toThrow('Fecha inválida');
  });

  it('debe lanzar error 404 si la solicitud no existe', async () => {
    solicitudRepositoryMock.findById.mockResolvedValue(null);
    await expect(updateSolicitudUseCase.execute('sol-1', { titulo: 'T2' }, 'am-1'))
      .rejects.toThrow('Solicitud no encontrada.');
  });
});
