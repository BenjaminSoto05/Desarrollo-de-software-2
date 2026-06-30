const LogoutAllUsersUseCase = require('../../../../../src/application/use-cases/user/LogoutAllUsersUseCase');

describe('LogoutAllUsersUseCase', () => {
  let refreshTokenRepository;
  let useCase;

  beforeEach(() => {
    refreshTokenRepository = {
      revokeAllByUserId: jest.fn(),
    };
    useCase = new LogoutAllUsersUseCase(refreshTokenRepository);
  });

  it('debe revocar todas las sesiones del usuario', async () => {
    const result = await useCase.execute('user123');
    expect(refreshTokenRepository.revokeAllByUserId).toHaveBeenCalledWith('user123');
    expect(result.success).toBe(true);
  });
});
