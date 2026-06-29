const LoginUserUseCase = require('../../../../../src/application/use-cases/user/LoginUserUseCase');

describe('LoginUserUseCase', () => {
  let userRepositoryMock;
  let refreshTokenRepositoryMock;
  let hashServiceMock;
  let jwtServiceMock;
  let loginUserUseCase;

  beforeEach(() => {
    userRepositoryMock = { findByEmail: jest.fn() };
    refreshTokenRepositoryMock = { create: jest.fn() };
    hashServiceMock = { compare: jest.fn() };
    jwtServiceMock = {
      generateAccessToken: jest.fn(),
      generateRefreshToken: jest.fn(),
      hashToken: jest.fn(),
      getRefreshTokenExpiresAt: jest.fn(),
    };
    loginUserUseCase = new LoginUserUseCase(
      userRepositoryMock,
      refreshTokenRepositoryMock,
      hashServiceMock,
      jwtServiceMock
    );
  });

  it('debe iniciar sesión correctamente y retornar token', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@uct.cl',
      passwordHash: 'hashed123',
      rol: 'ESTUDIANTE',
      suspendido: false,
    };
    
    userRepositoryMock.findByEmail.mockResolvedValue(mockUser);
    hashServiceMock.compare.mockResolvedValue(true);
    jwtServiceMock.generateAccessToken.mockReturnValue('mock-access-token');
    jwtServiceMock.generateRefreshToken.mockReturnValue('mock-refresh-token');
    jwtServiceMock.hashToken.mockReturnValue('hashed-refresh-token');
    jwtServiceMock.getRefreshTokenExpiresAt.mockReturnValue(new Date('2030-01-01'));
    refreshTokenRepositoryMock.create.mockResolvedValue({});

    const result = await loginUserUseCase.execute({ email: 'TEST@uct.cl ', password: 'password123' });

    expect(userRepositoryMock.findByEmail).toHaveBeenCalledWith('test@uct.cl');
    expect(hashServiceMock.compare).toHaveBeenCalledWith('password123', 'hashed123');
    expect(jwtServiceMock.generateAccessToken).toHaveBeenCalledWith({
      id: 'user-1',
      email: 'test@uct.cl',
      rol: 'ESTUDIANTE',
    });
    
    expect(result.accessToken).toBe('mock-access-token');
    expect(result.refreshToken).toBe('mock-refresh-token');
    expect(result.user.email).toBe('test@uct.cl');
    expect(result.user.passwordHash).toBeUndefined();
    expect(refreshTokenRepositoryMock.create).toHaveBeenCalled();
  });

  it('debe lanzar error 401 si el usuario no existe', async () => {
    userRepositoryMock.findByEmail.mockResolvedValue(null);
    await expect(loginUserUseCase.execute({ email: 'fake@uct.cl', password: 'pw' }))
      .rejects.toThrow('Credenciales inválidas.');
  });

  it('debe lanzar error 401 si la contraseña es incorrecta', async () => {
    userRepositoryMock.findByEmail.mockResolvedValue({ passwordHash: 'hashed123' });
    hashServiceMock.compare.mockResolvedValue(false);
    await expect(loginUserUseCase.execute({ email: 'test@uct.cl', password: 'wrong' }))
      .rejects.toThrow('Credenciales inválidas.');
  });

  it('debe lanzar error 403 si el usuario está suspendido', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@uct.cl',
      passwordHash: 'hashed123',
      suspendido: true,
    };
    userRepositoryMock.findByEmail.mockResolvedValue(mockUser);
    hashServiceMock.compare.mockResolvedValue(true);
    await expect(loginUserUseCase.execute({ email: 'test@uct.cl', password: 'password123' }))
      .rejects.toThrow('Tu cuenta ha sido suspendida. Contacta al administrador.');
  });
});
