// Tests de integracion para LoginUserUseCase
// Verifica interaccion entre Use Case, UserRepository, RefreshTokenRepository,
// HashService y JwtService

const LoginUserUseCase = require('../../../src/application/use-cases/user/LoginUserUseCase');

describe('LoginUserUseCase (Integracion)', () => {
  let useCase;
  let mockUserRepository;
  let mockTokenRepository;
  let mockHashService;
  let jwtService;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
    };
    mockTokenRepository = {
      create: jest.fn(),
    };
    mockHashService = {
      compare: jest.fn(),
    };
    jwtService = {
      generateAccessToken: jest.fn(() => 'access-token-mock'),
      generateRefreshToken: jest.fn(() => 'refresh-token-mock'),
      hashToken: jest.fn(() => 'hashed-token-mock'),
      getRefreshTokenExpiresAt: jest.fn(() => new Date(Date.now() + 86400000)),
    };

    useCase = new LoginUserUseCase(
      mockUserRepository,
      mockTokenRepository,
      mockHashService,
      jwtService
    );
  });

  describe('Login exitoso', () => {
    it('debe iniciar sesion y retornar tokens JWT validos', async () => {
      const fakeUser = {
        id: 'user-123',
        email: 'estudiante@uct.cl',
        passwordHash: 'hashed-password',
        rol: 'ESTUDIANTE',
        suspendido: false,
      };

      mockUserRepository.findByEmail.mockResolvedValue(fakeUser);
      mockHashService.compare.mockResolvedValue(true);
      mockTokenRepository.create.mockResolvedValue({ id: 'token-1', tokenHash: 'hashed-token-mock' });

      const resultado = await useCase.execute({
        email: 'estudiante@uct.cl',
        password: 'Password123',
      });

      expect(resultado.accessToken).toBe('access-token-mock');
      expect(resultado.refreshToken).toBe('refresh-token-mock');
      expect(resultado.user.email).toBe('estudiante@uct.cl');
      expect(resultado.user).not.toHaveProperty('passwordHash');
      expect(mockTokenRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tokenHash: 'hashed-token-mock',
          userId: 'user-123',
        })
      );
    });
  });

  describe('Rechazo de credenciales', () => {
    it('debe rechazar credenciales incorrectas (email no encontrado)', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(
        useCase.execute({ email: 'noexiste@uct.cl', password: 'wrong' })
      ).rejects.toThrow('Credenciales inválidas.');
      expect(mockHashService.compare).not.toHaveBeenCalled();
    });

    it('debe rechazar credenciales incorrectas (password invalido)', async () => {
      const fakeUser = {
        id: 'user-123',
        email: 'estudiante@uct.cl',
        passwordHash: 'hashed-password',
        rol: 'ESTUDIANTE',
        suspendido: false,
      };

      mockUserRepository.findByEmail.mockResolvedValue(fakeUser);
      mockHashService.compare.mockResolvedValue(false);

      await expect(
        useCase.execute({ email: 'estudiante@uct.cl', password: 'wrong' })
      ).rejects.toThrow('Credenciales inválidas.');
      expect(mockTokenRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('Usuario suspendido', () => {
    it('debe rechazar login de usuario suspendido', async () => {
      const fakeUser = {
        id: 'user-123',
        email: 'estudiante@uct.cl',
        passwordHash: 'hashed-password',
        rol: 'ESTUDIANTE',
        suspendido: true,
      };

      mockUserRepository.findByEmail.mockResolvedValue(fakeUser);
      mockHashService.compare.mockResolvedValue(true);

      await expect(
        useCase.execute({ email: 'estudiante@uct.cl', password: 'Password123' })
      ).rejects.toThrow('Tu cuenta ha sido suspendida. Contacta al administrador.');
      expect(mockTokenRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('Obtener usuario sin datos sensibles', () => {
    it('no debe retornar passwordHash en la respuesta', async () => {
      const fakeUser = {
        id: 'user-123',
        email: 'estudiante@uct.cl',
        passwordHash: 'hashed-password',
        rol: 'ESTUDIANTE',
        suspendido: false,
      };

      mockUserRepository.findByEmail.mockResolvedValue(fakeUser);
      mockHashService.compare.mockResolvedValue(true);
      mockTokenRepository.create.mockResolvedValue({ id: 'token-1' });

      const resultado = await useCase.execute({
        email: 'estudiante@uct.cl',
        password: 'Password123',
      });

      expect(resultado.user).not.toHaveProperty('passwordHash');
    });
  });

  describe('Guardar refresh token en BD', () => {
    it('debe hashear el refresh token antes de guardarlo', async () => {
      const fakeUser = {
        id: 'user-123',
        email: 'estudiante@uct.cl',
        passwordHash: 'hashed-password',
        rol: 'ESTUDIANTE',
        suspendido: false,
      };

      mockUserRepository.findByEmail.mockResolvedValue(fakeUser);
      mockHashService.compare.mockResolvedValue(true);
      mockTokenRepository.create.mockResolvedValue({ id: 'token-1' });

      await useCase.execute({
        email: 'estudiante@uct.cl',
        password: 'Password123',
      });

      expect(jwtService.hashToken).toHaveBeenCalledWith('refresh-token-mock');
      expect(mockTokenRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tokenHash: 'hashed-token-mock',
          userId: 'user-123',
        })
      );
    });
  });
});
