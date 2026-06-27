const CreateSolicitudUseCase = require('../../../../../src/application/use-cases/solicitud/CreateSolicitudUseCase');
const { SolicitudValidationService } = require('../../../../../src/domain/services/SolicitudValidationService');
const { UserValidationService } = require('../../../../../src/domain/services/UserValidationService');

describe('CreateSolicitudUseCase', () => {
  let solicitudRepositoryMock;
  let categoriaRepositoryMock;
  let userRepositoryMock;
  let createSolicitudUseCase;

  beforeEach(() => {
    solicitudRepositoryMock = {
      create: jest.fn(),
    };
    categoriaRepositoryMock = {
      findById: jest.fn(),
    };
    userRepositoryMock = {
      findById: jest.fn(),
    };
    createSolicitudUseCase = new CreateSolicitudUseCase(solicitudRepositoryMock, categoriaRepositoryMock, userRepositoryMock);
  });

  const validSolicitante = {
    id: 'am-1',
    rol: 'ADULTO_MAYOR',
    suspendido: false,
  };

  const validCategoria = {
    id: 'cat-1',
    activa: true,
  };

  const validInput = {
    titulo: 'Ayuda compras',
    descripcion: 'Necesito ayuda',
    categoriaId: 'cat-1',
    fechaProgramada: '2026-12-12', // Fecha futura segura
    horaProgramada: '10:00',
    direccion: 'Mi casa',
    comuna: 'Temuco',
  };

  it('debe crear una solicitud correctamente', async () => {
    userRepositoryMock.findById.mockResolvedValue(validSolicitante);
    categoriaRepositoryMock.findById.mockResolvedValue(validCategoria);
    
    jest.spyOn(SolicitudValidationService, 'validarCreacion').mockReturnValue({ valid: true });
    jest.spyOn(UserValidationService, 'validarComuna').mockReturnValue({ valid: true });
    
    solicitudRepositoryMock.create.mockResolvedValue({ id: 'sol-1', ...validInput });

    const result = await createSolicitudUseCase.execute(validInput, 'am-1');

    expect(solicitudRepositoryMock.create).toHaveBeenCalledWith(expect.objectContaining({
      titulo: 'Ayuda compras',
      categoriaId: 'cat-1',
      solicitanteId: 'am-1',
    }));
    expect(result.id).toBe('sol-1');
  });

  it('debe lanzar error 404 si el solicitante no existe', async () => {
    userRepositoryMock.findById.mockResolvedValue(null);
    await expect(createSolicitudUseCase.execute(validInput, 'am-1')).rejects.toThrow('Usuario no encontrado.');
  });

  it('debe lanzar error 403 si el rol no puede crear solicitudes', async () => {
    userRepositoryMock.findById.mockResolvedValue({ ...validSolicitante, rol: 'ESTUDIANTE' });
    await expect(createSolicitudUseCase.execute(validInput, 'est-1')).rejects.toThrow('Solo adultos mayores o tutores pueden crear solicitudes.');
  });

  it('debe lanzar error 403 si el solicitante está suspendido', async () => {
    userRepositoryMock.findById.mockResolvedValue({ ...validSolicitante, suspendido: true });
    await expect(createSolicitudUseCase.execute(validInput, 'am-1')).rejects.toThrow('Tu cuenta está suspendida. No puedes crear solicitudes.');
  });

  it('debe lanzar error 400 si la categoría no existe o inactiva', async () => {
    userRepositoryMock.findById.mockResolvedValue(validSolicitante);
    categoriaRepositoryMock.findById.mockResolvedValue(null);
    await expect(createSolicitudUseCase.execute(validInput, 'am-1')).rejects.toThrow('La categoría seleccionada no existe.');
  });

  it('debe lanzar error 400 si la validación de fecha/hora falla', async () => {
    userRepositoryMock.findById.mockResolvedValue(validSolicitante);
    categoriaRepositoryMock.findById.mockResolvedValue(validCategoria);
    jest.spyOn(SolicitudValidationService, 'validarCreacion').mockReturnValue({ valid: false, errors: ['Error de fecha'] });
    
    await expect(createSolicitudUseCase.execute(validInput, 'am-1')).rejects.toThrow('Error de fecha');
  });
});
