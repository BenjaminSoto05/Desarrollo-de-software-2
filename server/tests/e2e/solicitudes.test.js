const request = require('supertest');
const app = require('../../src/app');

const elderlyUser = {
  email: 'adulto.e2e@outlook.com',
  password: 'Password123',
  rut: '98765432-5',
  nombre: 'Luis',
  apellido: 'García',
  telefono: '+56912345678',
  rol: 'ADULTO_MAYOR',
  comuna: 'Temuco',
  direccion: 'Av. Siempre Viva 123',
};

const studentUser = {
  email: 'voluntario.e2e@alu.uct.cl',
  password: 'Password123',
  rut: '11222333-9',
  nombre: 'Carlos',
  apellido: 'Molina',
  telefono: '+56998877665',
};

describe('E2E solicitudes flow', () => {
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

  it('crea, lista, acepta, completa y confirma una solicitud', async () => {
    const createResponse = await request(app)
      .post('/api/solicitudes')
      .set('Authorization', `Bearer ${elderlyToken}`)
      .send({
        titulo: 'Compra de medicamentos',
        descripcion: 'Necesito ayuda para comprar medicamentos de forma rápida.',
        categoriaId: '00000000-0000-0000-0000-000000000001',
        fechaProgramada: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        horaProgramada: '14:00',
        direccion: 'Av. Siempre Viva 123',
        comuna: 'Temuco',
      })
      .expect(201);

    expect(createResponse.body.success).toBe(true);
    solicitudId = createResponse.body.data.id;

    const listResponse = await request(app)
      .get('/api/solicitudes')
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(200);

    expect(listResponse.body.success).toBe(true);
    expect(listResponse.body.data.length).toBeGreaterThan(0);

    const acceptResponse = await request(app)
      .post(`/api/solicitudes/${solicitudId}/accept`)
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(200);

    expect(acceptResponse.body.success).toBe(true);

    const completeResponse = await request(app)
      .post(`/api/solicitudes/${solicitudId}/complete`)
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(200);

    expect(completeResponse.body.success).toBe(true);

    const confirmResponse = await request(app)
      .post(`/api/solicitudes/${solicitudId}/confirm`)
      .set('Authorization', `Bearer ${elderlyToken}`)
      .expect(200);

    expect(confirmResponse.body.success).toBe(true);
  });
});
