const CancelAcceptedSolicitudUseCase = require('../../../../../src/application/use-cases/solicitud/CancelAcceptedSolicitudUseCase');
const { ESTADOS } = require('../../../../../src/domain/entities/Solicitud');
const { MAX_INASISTENCIAS } = require('../../../../../src/domain/entities/User');
const { SolicitudValidationService } = require('../../../../../src/domain/services/SolicitudValidationService');

describe('CancelAcceptedSolicitudUseCase', () => {
  let solicitudRepositoryMock;
  let userRepositoryMock;
  let cancelAcceptedSolicitudUseCase;

  beforeEach(() => {
    solicitudRepositoryMock = {
      findById: jest.fn(),
      update: jest.fn(),
    };
    userRepositoryMock = {
      findById: jest.fn(),
      update: jest.fn(),
    };
    cancelAcceptedSolicitudUseCase = new CancelAcceptedSolicitudUseCase(solicitudRepositoryMock, userRepositoryMock);
  });

  const validSolicitud = {
    id: 'sol-1',
    estado: ESTADOS.EN_CURSO,
    voluntarioId: 'est-1',
    fechaProgramada: '2026-10-10',
    horaProgramada: '15:00',
  };

  it('debe cancelar una solicitud aceptada sin penalización si faltan más de 4 horas', async () => {
    solicitudRepositoryMock.findById.mockResolvedValue(validSolicitud);
    jest.spyOn(SolicitudValidationService, 'cancelacionGeneraInasistencia').mockReturnValue(false);

    const result = await cancelAcceptedSolicitudUseCase.execute('sol-1', 'est-1');

    expect(solicitudRepositoryMock.update).toHaveBeenCalledWith('sol-1', {
      estado: ESTADOS.PENDIENTE,
      voluntarioId: null,
    });
    expect(userRepositoryMock.findById).not.toHaveBeenCalled();
    expect(result.penalizacion.inasistenciaRegistrada).toBe(false);
  });

  it('debe cancelar una solicitud aceptada con penalización si faltan menos de 4 horas', async () => {
    solicitudRepositoryMock.findById.mockResolvedValue(validSolicitud);
    jest.spyOn(SolicitudValidationService, 'cancelacionGeneraInasistencia').mockReturnValue(true);
    userRepositoryMock.findById.mockResolvedValue({ id: 'est-1', inasistencias: 1, suspendido: false });

    const result = await cancelAcceptedSolicitudUseCase.execute('sol-1', 'est-1');

    expect(userRepositoryMock.update).toHaveBeenCalledWith('est-1', {
      inasistencias: 2,
      suspendido: false,
    });
    expect(result.penalizacion.inasistenciaRegistrada).toBe(true);
    expect(result.penalizacion.inasistenciasActuales).toBe(2);
    expect(result.penalizacion.suspendido).toBe(false);
  });

  it('debe suspender al usuario si alcanza el máximo de inasistencias al cancelar', async () => {
    solicitudRepositoryMock.findById.mockResolvedValue(validSolicitud);
    jest.spyOn(SolicitudValidationService, 'cancelacionGeneraInasistencia').mockReturnValue(true);
    userRepositoryMock.findById.mockResolvedValue({ id: 'est-1', inasistencias: MAX_INASISTENCIAS - 1, suspendido: false });

    const result = await cancelAcceptedSolicitudUseCase.execute('sol-1', 'est-1');

    expect(userRepositoryMock.update).toHaveBeenCalledWith('est-1', {
      inasistencias: MAX_INASISTENCIAS,
      suspendido: true,
    });
    expect(result.penalizacion.suspendido).toBe(true);
  });

  it('debe lanzar error 404 si la solicitud no existe', async () => {
    solicitudRepositoryMock.findById.mockResolvedValue(null);
    await expect(cancelAcceptedSolicitudUseCase.execute('sol-1', 'est-1'))
      .rejects.toThrow('Solicitud no encontrada.');
  });

  it('debe lanzar error 400 si la solicitud no está EN_CURSO', async () => {
    solicitudRepositoryMock.findById.mockResolvedValue({ ...validSolicitud, estado: ESTADOS.FINALIZADA });
    await expect(cancelAcceptedSolicitudUseCase.execute('sol-1', 'est-1'))
      .rejects.toThrow('Solo se pueden cancelar tareas que están en curso.');
  });

  it('debe lanzar error 403 si el voluntario que cancela no es el asignado', async () => {
    solicitudRepositoryMock.findById.mockResolvedValue(validSolicitud);
    await expect(cancelAcceptedSolicitudUseCase.execute('sol-1', 'otro-voluntario'))
      .rejects.toThrow('Solo el voluntario asignado puede cancelar esta tarea.');
  });
});
