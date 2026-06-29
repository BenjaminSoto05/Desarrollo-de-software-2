const SuspendUserUseCase = require('../../../../../src/application/use-cases/user/SuspendUserUseCase');

describe('SuspendUserUseCase', () => {
  let userRepositoryMock;
  let suspendUserUseCase;

  beforeEach(() => {
    userRepositoryMock = {
      findById: jest.fn(),
      update: jest.fn(),
    };
    suspendUserUseCase = new SuspendUserUseCase(userRepositoryMock);
  });

  it('debe registrar una inasistencia pero no suspender si no alcanza el máximo', async () => {
    const mockUserData = {
      id: 'student-1',
      inasistencias: 1,
      suspendido: false,
    };
    userRepositoryMock.findById.mockResolvedValue(mockUserData);
    
    // User.registrarInasistencia() mockeado implícitamente por el comportamiento de la clase real
    const result = await suspendUserUseCase.execute('student-1');

    expect(userRepositoryMock.update).toHaveBeenCalledWith('student-1', {
      inasistencias: 2,
      suspendido: false,
    });
    expect(result.suspendido).toBe(false);
    expect(result.inasistencias).toBe(2);
    expect(result.mensaje).toContain('Inasistencia registrada');
  });

  it('debe suspender al usuario al llegar a 3 inasistencias', async () => {
    const mockUserData = {
      id: 'student-2',
      inasistencias: 2,
      suspendido: false,
    };
    userRepositoryMock.findById.mockResolvedValue(mockUserData);
    
    const result = await suspendUserUseCase.execute('student-2');

    expect(userRepositoryMock.update).toHaveBeenCalledWith('student-2', {
      inasistencias: 3,
      suspendido: true,
    });
    expect(result.suspendido).toBe(true);
    expect(result.inasistencias).toBe(3);
    expect(result.mensaje).toContain('El usuario ha sido suspendido');
  });

  it('debe lanzar error 404 si el usuario no existe', async () => {
    userRepositoryMock.findById.mockResolvedValue(null);

    await expect(suspendUserUseCase.execute('non-existent'))
      .rejects.toThrow('Usuario no encontrado.');
  });
});
