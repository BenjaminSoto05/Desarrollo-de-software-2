const crypto = require('crypto');
const JwtService = require('../src/infrastructure/services/JwtService');
const LoginUserUseCase = require('../src/application/use-cases/user/LoginUserUseCase');
const RefreshTokenUseCase = require('../src/application/use-cases/user/RefreshTokenUseCase');
const LogoutUserUseCase = require('../src/application/use-cases/user/LogoutUserUseCase');
const LogoutAllUsersUseCase = require('../src/application/use-cases/user/LogoutAllUsersUseCase');

// Definir variables de entorno ficticias para los tests
process.env.JWT_SECRET = 'test_access_secret';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret';
process.env.JWT_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';

describe('Auth Use Cases & Services Tests', () => {
  let jwtService;
  let mockUserRepo;
  let mockTokenRepo;
  let mockHashService;

  beforeEach(() => {
    jwtService = new JwtService();
    
    mockUserRepo = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByRut: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };

    mockTokenRepo = {
      create: jest.fn(),
      findByTokenHash: jest.fn(),
      revoke: jest.fn(),
      revokeAllByUserId: jest.fn(),
    };

    mockHashService = {
      compare: jest.fn(),
      hash: jest.fn(),
    };
  });

  describe('JwtService & Hashing', () => {
    it('debe firmar y verificar Access Tokens de forma correcta', () => {
      const payload = { id: 'user-123', email: 'estudiante@uct.cl', rol: 'ESTUDIANTE' };
      const token = jwtService.generateAccessToken(payload);
      
      const decoded = jwtService.verifyAccessToken(token);
      expect(decoded.id).toBe(payload.id);
      expect(decoded.email).toBe(payload.email);
    });

    it('debe hashear tokens de refresco usando SHA-256 a 64 caracteres hexadecimales', () => {
      const rawToken = 'my_refresh_token';
      const hash = jwtService.hashToken(rawToken);
      
      expect(hash).toHaveLength(64);
      expect(hash).toBe(
        crypto.createHash('sha256').update(rawToken).digest('hex')
      );
    });

    it('debe parsear correctamente las duraciones de los tokens a milisegundos', () => {
      expect(jwtService.parseDuration('15m')).toBe(15 * 60 * 1000);
      expect(jwtService.parseDuration('2h')).toBe(2 * 60 * 60 * 1000);
      expect(jwtService.parseDuration('7d')).toBe(7 * 24 * 60 * 60 * 1000);
    });
  });

  describe('LoginUserUseCase', () => {
    it('debe iniciar sesión exitosamente, registrar el token hasheado en BD y retornar ambos tokens', async () => {
      const fakeUser = {
        id: 'user-123',
        email: 'estudiante@uct.cl',
        passwordHash: 'hashed_pass',
        rol: 'ESTUDIANTE',
        suspendido: false,
      };

      mockUserRepo.findByEmail.mockResolvedValue(fakeUser);
      mockHashService.compare.mockResolvedValue(true);
      mockTokenRepo.create.mockResolvedValue({});

      const useCase = new LoginUserUseCase(mockUserRepo, mockTokenRepo, mockHashService, jwtService);
      const result = await useCase.execute({ email: 'estudiante@uct.cl', password: 'Password123' });

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.user.id).toBe(fakeUser.id);
      
      // Validar que se hasheó y guardó en la base de datos
      const expectedHash = jwtService.hashToken(result.refreshToken);
      expect(mockTokenRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tokenHash: expectedHash,
          userId: fakeUser.id,
        })
      );
    });
  });

  describe('RefreshTokenUseCase & Replay Attack Detection', () => {
    it('debe emitir nuevos tokens y rotar el Refresh Token anterior en un refresh exitoso', async () => {
      const rawToken = jwtService.generateRefreshToken({ id: 'user-123' });
      const hash = jwtService.hashToken(rawToken);

      const storedToken = {
        id: 'token-uuid',
        tokenHash: hash,
        userId: 'user-123',
        expiresAt: new Date(Date.now() + 1000000),
        revoked: false,
      };

      const user = { id: 'user-123', email: 'test@uct.cl', rol: 'ESTUDIANTE', suspendido: false };

      mockTokenRepo.findByTokenHash.mockResolvedValue(storedToken);
      mockUserRepo.findById.mockResolvedValue(user);
      mockTokenRepo.revoke.mockResolvedValue({});
      mockTokenRepo.create.mockResolvedValue({});

      const useCase = new RefreshTokenUseCase(mockTokenRepo, mockUserRepo, jwtService);
      const result = await useCase.execute({ token: rawToken });

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      
      // Debe revocar el antiguo y crear el nuevo rotado
      expect(mockTokenRepo.revoke).toHaveBeenCalledWith(hash);
      expect(mockTokenRepo.create).toHaveBeenCalled();
    });

    it('debe invalidar TODAS las sesiones si se detecta un Refresh Token ya revocado (Brecha de seguridad)', async () => {
      const rawToken = jwtService.generateRefreshToken({ id: 'user-123' });
      const hash = jwtService.hashToken(rawToken);

      const storedToken = {
        id: 'token-uuid',
        tokenHash: hash,
        userId: 'user-123',
        expiresAt: new Date(Date.now() + 1000000),
        revoked: true, // YA REVOCADO
      };

      mockTokenRepo.findByTokenHash.mockResolvedValue(storedToken);

      const useCase = new RefreshTokenUseCase(mockTokenRepo, mockUserRepo, jwtService);
      
      await expect(useCase.execute({ token: rawToken })).rejects.toThrow(
        'Brecha de seguridad detectada. Todas las sesiones del usuario han sido invalidadas.'
      );

      // Debe forzar la revocación total en lote
      expect(mockTokenRepo.revokeAllByUserId).toHaveBeenCalledWith('user-123');
    });
  });

  describe('Logout & Global Logout', () => {
    it('debe revocar un token específico en logout individual', async () => {
      const rawToken = 'some_token';
      const hash = jwtService.hashToken(rawToken);
      mockTokenRepo.revoke.mockResolvedValue({});

      const useCase = new LogoutUserUseCase(mockTokenRepo, jwtService);
      const result = await useCase.execute({ token: rawToken });

      expect(result.success).toBe(true);
      expect(mockTokenRepo.revoke).toHaveBeenCalledWith(hash);
    });

    it('debe invalidar todos los tokens del usuario en logout global', async () => {
      mockTokenRepo.revokeAllByUserId.mockResolvedValue(5);

      const useCase = new LogoutAllUsersUseCase(mockTokenRepo);
      const result = await useCase.execute('user-123');

      expect(result.success).toBe(true);
      expect(mockTokenRepo.revokeAllByUserId).toHaveBeenCalledWith('user-123');
    });
  });
});
