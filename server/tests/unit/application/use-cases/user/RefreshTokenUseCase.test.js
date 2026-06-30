const RefreshTokenUseCase = require('../../../../../src/application/use-cases/user/RefreshTokenUseCase');

describe('RefreshTokenUseCase', () => {
  let refreshTokenRepository;
  let userRepository;
  let jwtService;
  let useCase;

  beforeEach(() => {
    refreshTokenRepository = {
      findByTokenHash: jest.fn(),
      revokeAllByUserId: jest.fn(),
      revoke: jest.fn(),
      create: jest.fn(),
    };
    userRepository = {
      findById: jest.fn(),
    };
    jwtService = {
      verifyRefreshToken: jest.fn(),
      hashToken: jest.fn().mockReturnValue('hashed_token'),
      generateAccessToken: jest.fn().mockReturnValue('new_access'),
      generateRefreshToken: jest.fn().mockReturnValue('new_refresh'),
      getRefreshTokenExpiresAt: jest.fn().mockReturnValue(new Date('2030-01-01')),
    };
    useCase = new RefreshTokenUseCase(refreshTokenRepository, userRepository, jwtService);
  });

  it('debe lanzar error 400 si no se proporciona token', async () => {
    await expect(useCase.execute({})).rejects.toThrow('Refresh Token no proporcionado.');
  });

  it('debe lanzar error 401 si verifyRefreshToken falla', async () => {
    jwtService.verifyRefreshToken.mockImplementation(() => { throw new Error('invalido'); });
    await expect(useCase.execute({ token: 'bad' })).rejects.toThrow('Refresh Token inválido o expirado.');
  });

  it('debe lanzar error 401 si la sesión no existe en BD', async () => {
    refreshTokenRepository.findByTokenHash.mockResolvedValue(null);
    await expect(useCase.execute({ token: 'my_token' })).rejects.toThrow('Sesión no encontrada.');
  });

  it('debe lanzar error 401 y revocar si el token ya estaba revocado', async () => {
    refreshTokenRepository.findByTokenHash.mockResolvedValue({ revoked: true, userId: 'u1' });
    await expect(useCase.execute({ token: 'my_token' })).rejects.toThrow('Brecha de seguridad');
    expect(refreshTokenRepository.revokeAllByUserId).toHaveBeenCalledWith('u1');
  });

  it('debe lanzar error 401 si el token expiró', async () => {
    refreshTokenRepository.findByTokenHash.mockResolvedValue({ revoked: false, expiresAt: new Date('2000-01-01') });
    await expect(useCase.execute({ token: 'my_token' })).rejects.toThrow('Sesión expirada.');
  });

  it('debe lanzar error 403 si el usuario no existe o está suspendido', async () => {
    refreshTokenRepository.findByTokenHash.mockResolvedValue({ revoked: false, expiresAt: new Date('2030-01-01'), userId: 'u1' });
    userRepository.findById.mockResolvedValue({ suspendido: true });
    await expect(useCase.execute({ token: 'my_token' })).rejects.toThrow('Acceso denegado.');
  });

  it('debe generar y retornar nuevos tokens con usuario válido', async () => {
    refreshTokenRepository.findByTokenHash.mockResolvedValue({ revoked: false, expiresAt: new Date('2030-01-01'), userId: 'u1' });
    userRepository.findById.mockResolvedValue({ id: 'u1', email: 'test@uct.cl', rol: 'ESTUDIANTE', suspendido: false });
    
    const result = await useCase.execute({ token: 'my_token' });
    
    expect(result.accessToken).toBe('new_access');
    expect(result.refreshToken).toBe('new_refresh');
    expect(refreshTokenRepository.revoke).toHaveBeenCalledWith('hashed_token');
    expect(refreshTokenRepository.create).toHaveBeenCalled();
  });
});
