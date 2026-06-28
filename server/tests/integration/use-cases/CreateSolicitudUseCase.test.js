// Tests de Integracion para CreateSolicitudUseCase
const CreateSolicitudUseCase = require('../../../src/application/use-cases/solicitud/CreateSolicitudUseCase');
const { ROLES } = require('../../../src/domain/entities/User');

describe('CreateSolicitudUseCase (Integracion)', () => {
  let useCase;
  let mockSolicitudRepo;
  let mockCategoriaRepo;
  let mockUserRepo;

  beforeEach(() => {
    mockSolicitudRepo = { create: jest.fn() };
    mockCategoriaRepo = { findById: jest.fn() };
    mockUserRepo = { findById: jest.fn() };

    useCase = new CreateSolicitudUseCase(mockSolicitudRepo, mockCategoriaRepo, mockUserRepo);
  });

  describe('Creacion exitosa', () => {
    it('debe crear solicitud con datos validos', async () => {
      const input = {
        titulo: 'Ayuda con supermercado',
        descripcion: 'Necesito ayuda para ir al supermercado',
        categoriaId: 'cat-001',
        fechaProgramada: '2026-07-10',
        horaProgramada: '10:00',
        direccion: 'Calle Test 123',
        comuna: 'Temuco',
      };

      mockUserRepo.findById.mockResolvedValue({ id: 'user-001', rol: ROLES.ADULTO_MAYOR, suspendido: false });
      mockCategoriaRepo.findById.mockResolvedValue({ id: 'cat-001', activa: true });
      mockSolicitudRepo.create.mockResolvedValue({ id: 'sol-001', ...input, solicitanteId: 'user-001' });

      const resultado = await useCase.execute(input, 'user-001');

      expect(mockUserRepo.findById).toHaveBeenCalledWith('user-001');
      expect(mockCategoriaRepo.findById).toHaveBeenCalledWith('cat-001');
      expect(mockSolicitudRepo.create).toHaveBeenCalled();
      expect(resultado).toHaveProperty('id', 'sol-001');
    });
  });

  describe('Validaciones de solicitante', () => {
    it('debe rechazar si el solicitante no existe', async () => {
      mockUserRepo.findById.mockResolvedValue(null);

      const input = {
        titulo: 'Ayuda',
        descripcion: 'Descripcion valida',
        categoriaId: 'cat-001',
        fechaProgramada: '2026-07-10',
        horaProgramada: '10:00',
        direccion: 'Calle Test 123',
        comuna: 'Temuco',
      };

      await expect(useCase.execute(input, 'user-inexistente')).rejects.toThrow('Usuario no encontrado.');
      expect(mockCategoriaRepo.findById).not.toHaveBeenCalled();
      expect(mockSolicitudRepo.create).not.toHaveBeenCalled();
    });

    it('debe rechazar si el solicitante no es ADULTO_MAYOR ni TUTOR', async () => {
      mockUserRepo.findById.mockResolvedValue({ id: 'user-001', rol: ROLES.ESTUDIANTE, suspendido: false });

      const input = {
        titulo: 'Ayuda',
        descripcion: 'Descripcion valida',
        categoriaId: 'cat-001',
        fechaProgramada: '2026-07-10',
        horaProgramada: '10:00',
        direccion: 'Calle Test 123',
        comuna: 'Temuco',
      };

      await expect(useCase.execute(input, 'user-001')).rejects.toThrow(
        'Solo adultos mayores o tutores pueden crear solicitudes.'
      );
      expect(mockSolicitudRepo.create).not.toHaveBeenCalled();
    });

    it('debe rechazar si el solicitante esta suspendido', async () => {
      mockUserRepo.findById.mockResolvedValue({ id: 'user-001', rol: ROLES.ADULTO_MAYOR, suspendido: true });

      const input = {
        titulo: 'Ayuda',
        descripcion: 'Descripcion valida',
        categoriaId: 'cat-001',
        fechaProgramada: '2026-07-10',
        horaProgramada: '10:00',
        direccion: 'Calle Test 123',
        comuna: 'Temuco',
      };

      await expect(useCase.execute(input, 'user-001')).rejects.toThrow(
        'Tu cuenta está suspendida. No puedes crear solicitudes.'
      );
      expect(mockSolicitudRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('Validaciones de categoria', () => {
    it('debe rechazar categoria invalida (no existe)', async () => {
      mockUserRepo.findById.mockResolvedValue({ id: 'user-001', rol: ROLES.ADULTO_MAYOR, suspendido: false });
      mockCategoriaRepo.findById.mockResolvedValue(null);

      const input = {
        titulo: 'Ayuda',
        descripcion: 'Descripcion valida',
        categoriaId: 'cat-invalida',
        fechaProgramada: '2026-07-10',
        horaProgramada: '10:00',
        direccion: 'Calle Test 123',
        comuna: 'Temuco',
      };

      await expect(useCase.execute(input, 'user-001')).rejects.toThrow(
        'La categoría seleccionada no existe.'
      );
      expect(mockSolicitudRepo.create).not.toHaveBeenCalled();
    });

    it('debe rechazar categoria inactiva', async () => {
      mockUserRepo.findById.mockResolvedValue({ id: 'user-001', rol: ROLES.ADULTO_MAYOR, suspendido: false });
      mockCategoriaRepo.findById.mockResolvedValue({ id: 'cat-001', activa: false });

      const input = {
        titulo: 'Ayuda',
        descripcion: 'Descripcion valida',
        categoriaId: 'cat-001',
        fechaProgramada: '2026-07-10',
        horaProgramada: '10:00',
        direccion: 'Calle Test 123',
        comuna: 'Temuco',
      };

      await expect(useCase.execute(input, 'user-001')).rejects.toThrow(
        'La categoría seleccionada no está disponible.'
      );
      expect(mockSolicitudRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('Validaciones de horario y fecha', () => {
    it('debe rechazar hora fuera del horario permitido', async () => {
      mockUserRepo.findById.mockResolvedValue({ id: 'user-001', rol: ROLES.ADULTO_MAYOR, suspendido: false });
      mockCategoriaRepo.findById.mockResolvedValue({ id: 'cat-001', activa: true });

      const input = {
        titulo: 'Ayuda',
        descripcion: 'Descripcion valida',
        categoriaId: 'cat-001',
        fechaProgramada: '2026-07-10',
        horaProgramada: '07:00',
        direccion: 'Calle Test 123',
        comuna: 'Temuco',
      };

      try {
        await useCase.execute(input, 'user-001');
        fail('Deberia haber lanzado error');
      } catch (error) {
        expect(error.message).toContain('8:00');
      }
      expect(mockSolicitudRepo.create).not.toHaveBeenCalled();
    });

    it('debe rechazar fecha pasada', async () => {
      mockUserRepo.findById.mockResolvedValue({ id: 'user-001', rol: ROLES.ADULTO_MAYOR, suspendido: false });
      mockCategoriaRepo.findById.mockResolvedValue({ id: 'cat-001', activa: true });

      const input = {
        titulo: 'Ayuda',
        descripcion: 'Descripcion valida',
        categoriaId: 'cat-001',
        fechaProgramada: '2020-01-01',
        horaProgramada: '10:00',
        direccion: 'Calle Test 123',
        comuna: 'Temuco',
      };

      try {
        await useCase.execute(input, 'user-001');
        fail('Deberia haber lanzado error');
      } catch (error) {
        expect(error.message).toContain('no puede ser en el pasado');
      }
      expect(mockSolicitudRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('Validacion de comuna', () => {
    it('debe rechazar comuna fuera de la zona permitida', async () => {
      mockUserRepo.findById.mockResolvedValue({ id: 'user-001', rol: ROLES.ADULTO_MAYOR, suspendido: false });
      mockCategoriaRepo.findById.mockResolvedValue({ id: 'cat-001', activa: true });

      const input = {
        titulo: 'Ayuda',
        descripcion: 'Descripcion valida',
        categoriaId: 'cat-001',
        fechaProgramada: '2026-07-10',
        horaProgramada: '10:00',
        direccion: 'Calle Test 123',
        comuna: 'Santiago',
      };

      try {
        await useCase.execute(input, 'user-001');
        fail('Deberia haber lanzado error');
      } catch (error) {
        expect(error.message).toContain('temuco');
      }
      expect(mockSolicitudRepo.create).not.toHaveBeenCalled();
    });
  });
});
