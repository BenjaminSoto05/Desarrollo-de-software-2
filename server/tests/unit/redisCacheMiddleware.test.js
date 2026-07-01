const express = require('express');
const request = require('supertest');
const { getCache, setCache } = require('../../src/infrastructure/cache/redisClient');
const { cacheMiddleware } = require('../../src/presentation/middleware/redisCacheMiddleware');

jest.mock('../../src/infrastructure/cache/redisClient', () => ({
  getCache: jest.fn(),
  setCache: jest.fn(),
  deleteCache: jest.fn(),
  closeRedis: jest.fn(),
  connectRedis: jest.fn(),
}));

describe('redis cache middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe responder desde caché cuando existe un valor almacenado', async () => {
    getCache.mockResolvedValue({ ok: true, fromCache: true });

    const app = express();
    app.get('/test', cacheMiddleware({ ttlSeconds: 60 }), (req, res) => {
      res.json({ ok: false });
    });

    const response = await request(app).get('/test');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true, fromCache: true });
    expect(getCache).toHaveBeenCalledWith('/test');
    expect(setCache).not.toHaveBeenCalled();
  });

  it('debe almacenar la respuesta en caché cuando no existe un valor previo', async () => {
    getCache.mockResolvedValue(null);

    const app = express();
    app.get('/test', cacheMiddleware({ ttlSeconds: 60 }), (req, res) => {
      res.json({ ok: true });
    });

    const response = await request(app).get('/test');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
    expect(setCache).toHaveBeenCalledWith('/test', { ok: true }, 60);
  });
});
