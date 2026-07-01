const request = require('supertest');
const app = require('../../src/app');

const baseUser = {
  email: 'estudiante.e2e@alu.uct.cl',
  password: 'Password123',
  rut: '12345678-5',
  nombre: 'Ana',
  apellido: 'Pérez',
  telefono: '+56987654321',
};

describe('E2E auth flow', () => {
  let accessToken;
  let refreshToken;

  it('registra un estudiante, inicia sesión, refresca el token y consulta el perfil', async () => {
    const registerResponse = await request(app)
      .post('/api/auth/register/student')
      .send(baseUser)
      .expect(201);

    expect(registerResponse.body.success).toBe(true);
    expect(registerResponse.body.data.email).toBe(baseUser.email);

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: baseUser.email, password: baseUser.password })
      .expect(200);

    expect(loginResponse.body.success).toBe(true);
    accessToken = loginResponse.body.data.accessToken;
    refreshToken = loginResponse.body.data.refreshToken;

    const refreshResponse = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken })
      .expect(200);

    expect(refreshResponse.body.success).toBe(true);
    expect(refreshResponse.body.data.accessToken).toBeDefined();

    const profileResponse = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(profileResponse.body.success).toBe(true);
    expect(profileResponse.body.data.email).toBe(baseUser.email);
  });
});
