const request = require('supertest');
const app = require('../../src/app');

const elderlyUser = {
  email: 'adulto.eval@outlook.com',
  password: 'Password123',
  rut: '11111111-1',
  nombre: 'Marta',
  apellido: 'López',
  telefono: '+56911223344',
  rol: 'ADULTO_MAYOR',
  comuna: 'Temuco',
  direccion: 'Calle Falsa 456',
};

const studentUser = {
  email: 'voluntario.eval@alu.uct.cl',
  password: 'Password123',
  rut: '22222222-2',
  nombre: 'Diego',
  apellido: 'Ruiz',
  telefono: '+56933445566',
};

describe('E2E evaluaciones flow', () => {
  let elderlyToken;
  let studentToken;
  let solicitudId;

  beforeAll(async () => {
    await request(app).post('/api/auth/register/elderly').send(elderlyUser).expect(201);
    await request(app).post('/api/auth/register/student').send(studentUser).expect(201);

    const elderlyLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: elderlyUser.email, password: elderlyUser.password })
      .expect(200);

    const studentLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: studentUser.email, password: studentUser.password })
      .expect(200);

    elderlyToken = elderlyLogin.body.data.accessToken;
    studentToken = studentLogin.body.data.accessToken;
  });

  it('crea una evaluación tras finalizar una solicitud', async () => {
    const createSolicitudResponse = await request(app)
      .post('/api/solicitudes')
      .set('Authorization', `Bearer ${elderlyToken}`)
      .send({
        titulo: 'Acompañamiento a banco',
        descripcion: 'Requiere ayuda para ir al banco y realizar trámites.',
        categoriaId: '00000000-0000-0000-0000-000000000001',
        fechaProgramada: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        horaProgramada: '16:00',
        direccion: 'Calle Falsa 456',
        comuna: 'Temuco',
      })
      .expect(201);

    solicitudId = createSolicitudResponse.body.data.id;

    await request(app)
      .post(`/api/solicitudes/${solicitudId}/accept`)
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(200);

    await request(app)
      .post(`/api/solicitudes/${solicitudId}/complete`)
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(200);

    await request(app)
      .post(`/api/solicitudes/${solicitudId}/confirm`)
      .set('Authorization', `Bearer ${elderlyToken}`)
      .expect(200);

    const evaluacionResponse = await request(app)
      .post('/api/evaluaciones')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        solicitudId,
        puntuacion: 5,
        comentario: 'Excelente trabajo',
      })
      .expect(201);

    expect(evaluacionResponse.body.success).toBe(true);
    expect(evaluacionResponse.body.data.puntuacion).toBe(5);
  });
});
