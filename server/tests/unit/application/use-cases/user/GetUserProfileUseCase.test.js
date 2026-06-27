const GetUserProfileUseCase = require('../../../../../src/application/use-cases/user/GetUserProfileUseCase');

describe('GetUserProfileUseCase', () => {
  let userRepositoryMock;
  let getUserProfileUseCase;

  beforeEach(() => {
    userRepositoryMock = {
      findById: jest.fn(),
    };
    getUserProfileUseCase = new GetUserProfileUseCase(userRepositoryMock);
  });

  it('debe retornar el perfil del usuario sin la contraseña (passwordHash)', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@uct.cl',
      nombre: 'Juan',
      passwordHash: 'hashedpassword123',
    };
    userRepositoryMock.findById.mockResolvedValue(mockUser);

    const result = await getUserProfileUseCase.execute('user-123');

    expect(userRepositoryMock.findById).toHaveBeenCalledWith('user-123');
    expect(result).toEqual({
      id: 'user-123',
      email: 'test@uct.cl',
      nombre: 'Juan',
    });
    expect(result.passwordHash).toBeUndefined();
  });

  it('debe lanzar error 404 si el usuario no existe', async () => {
    userRepositoryMock.findById.mockResolvedValue(null);

    await expect(getUserProfileUseCase.execute('non-existent')).rejects.toThrow('Usuario no encontrado.');
    
    try {
      await getUserProfileUseCase.execute('non-existent');
    } catch (error) {
      expect(error.statusCode).toBe(404);
    }
  });
});
