const RegisterElderlyUseCase = require('../../../../../src/application/use-cases/user/RegisterElderlyUseCase');
const { ROLES } = require('../../../../../src/domain/entities/User');
const { UserValidationService } = require('../../../../../src/domain/services/UserValidationService');

describe('RegisterElderlyUseCase', () => {
  let userRepositoryMock;
  let hashServiceMock;
  let registerElderlyUseCase;

  beforeEach(() => {
    userRepositoryMock = {
      findByEmail: jest.fn(),
      findByRut: jest.fn(),
      create: jest.fn(),
    };
    hashServiceMock = {
      hash: jest.fn(),
    };
    registerElderlyUseCase = new RegisterElderlyUseCase(userRepositoryMock, hashServiceMock);
  });

  const validPayload = {
    email: 'adulto@test.com',
    password: 'password123',
    rut: '12345678-5',
    nombre: 'Juan',
    apellido: 'Perez',
    telefono: '+56912345678',
    rol: ROLES.ADULTO_MAYOR,
    comuna: 'Temuco',
    direccion: 'Calle Falsa 123',
  };

  it('debe registrar un Adulto Mayor correctamente', async () => {
    // Mock validaciones estáticas
    jest.spyOn(UserValidationService, 'validarRut').mockReturnValue({ valid: true });
    jest.spyOn(UserValidationService, 'validarComuna').mockReturnValue({ valid: true });
    
    userRepositoryMock.findByEmail.mockResolvedValue(null);
    userRepositoryMock.findByRut.mockResolvedValue(null);
    hashServiceMock.hash.mockResolvedValue('hashedPassword');
    userRepositoryMock.create.mockResolvedValue({
      id: 'am-1',
      ...validPayload,
      passwordHash: 'hashedPassword',
    });

    const result = await registerElderlyUseCase.execute(validPayload);

    expect(userRepositoryMock.create).toHaveBeenCalledWith({
      email: 'adulto@test.com',
      passwordHash: 'hashedPassword',
      rut: '12345678-5',
      nombre: 'Juan',
      apellido: 'Perez',
      telefono: '+56912345678',
      rol: ROLES.ADULTO_MAYOR,
      comuna: 'Temuco',
      direccion: 'Calle Falsa 123',
    });
    expect(result.passwordHash).toBeUndefined();
    expect(result.id).toBe('am-1');
  });

  it('debe lanzar error 400 si el rol no es ADULTO_MAYOR o TUTOR', async () => {
    const payload = { ...validPayload, rol: ROLES.ESTUDIANTE };
    await expect(registerElderlyUseCase.execute(payload))
      .rejects.toThrow(`El rol debe ser uno de: ${ROLES.ADULTO_MAYOR}, ${ROLES.TUTOR}.`);
  });

  it('debe lanzar error 400 si el RUT es inválido', async () => {
    jest.spyOn(UserValidationService, 'validarRut').mockReturnValue({ valid: false, error: 'RUT inválido' });
    await expect(registerElderlyUseCase.execute(validPayload))
      .rejects.toThrow('RUT inválido');
  });

  it('debe lanzar error 400 si la comuna es inválida', async () => {
    jest.spyOn(UserValidationService, 'validarRut').mockReturnValue({ valid: true });
    jest.spyOn(UserValidationService, 'validarComuna').mockReturnValue({ valid: false, error: 'Comuna inválida' });
    await expect(registerElderlyUseCase.execute(validPayload))
      .rejects.toThrow('Comuna inválida');
  });

  it('debe lanzar error 409 si el email ya existe', async () => {
    jest.spyOn(UserValidationService, 'validarRut').mockReturnValue({ valid: true });
    jest.spyOn(UserValidationService, 'validarComuna').mockReturnValue({ valid: true });
    userRepositoryMock.findByEmail.mockResolvedValue({ id: 'exists' });

    await expect(registerElderlyUseCase.execute(validPayload))
      .rejects.toThrow('Este correo electrónico ya está registrado.');
  });

  it('debe lanzar error 409 si el RUT ya existe', async () => {
    jest.spyOn(UserValidationService, 'validarRut').mockReturnValue({ valid: true });
    jest.spyOn(UserValidationService, 'validarComuna').mockReturnValue({ valid: true });
    userRepositoryMock.findByEmail.mockResolvedValue(null);
    userRepositoryMock.findByRut.mockResolvedValue({ id: 'exists' });

    await expect(registerElderlyUseCase.execute(validPayload))
      .rejects.toThrow('Este RUT ya está registrado.');
  });
});
