const LogoutUserUseCase = require('../../../../../src/application/use-cases/user/LogoutUserUseCase');

describe('LogoutUserUseCase', () => {
  let refreshTokenRepository;
  let jwtService;
  let useCase;

  beforeEach(() => {
    refreshTokenRepository = {
      revoke: jest.fn(),
    };
    jwtService = {
      hashToken: jest.fn().mockReturnValue('hashed_token'),
    };
    useCase = new LogoutUserUseCase(refreshTokenRepository, jwtService);
  });

  it('debe revocar el token proporcionado', async () => {
    const result = await useCase.execute({ token: 'my_token' });
    expect(jwtService.hashToken).toHaveBeenCalledWith('my_token');
    expect(refreshTokenRepository.revoke).toHaveBeenCalledWith('hashed_token');
    expect(result.success).toBe(true);
  });

  it('debe lanzar error 400 si no se proporciona token', async () => {
    await expect(useCase.execute({})).rejects.toThrow('Refresh Token no proporcionado.');
  });

  it('no debe lanzar error si revoke falla (ej. expiró)', async () => {
    refreshTokenRepository.revoke.mockRejectedValue(new Error('no existe'));
    const result = await useCase.execute({ token: 'my_token' });
    expect(result.success).toBe(true);
  });
});
