const Redis = require('ioredis');

const mockRedisInstance = {
  ping: jest.fn().mockResolvedValue('PONG'),
  set: jest.fn().mockResolvedValue('OK'),
  get: jest.fn().mockResolvedValue('{"status":"cached"}'),
  del: jest.fn().mockResolvedValue(1),
  quit: jest.fn().mockResolvedValue('OK'),
  on: jest.fn(),
};

jest.mock('ioredis', () => jest.fn(() => mockRedisInstance));

const { connectRedis, setCache, getCache, deleteCache } = require('../../src/infrastructure/cache/redisClient');

describe('Redis client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRedisInstance.get.mockResolvedValue('{"status":"cached"}');
    mockRedisInstance.set.mockResolvedValue('OK');
    mockRedisInstance.del.mockResolvedValue(1);
    mockRedisInstance.quit.mockResolvedValue('OK');
  });

  it('debe conectar con Redis y almacenar un valor en caché', async () => {
    await connectRedis();
    await setCache('test:key', { status: 'cached' }, 60);

    expect(Redis).toHaveBeenCalled();
    expect(mockRedisInstance.ping).toHaveBeenCalled();
    expect(mockRedisInstance.set).toHaveBeenCalledWith(
      'test:key',
      '{"status":"cached"}',
      'EX',
      60
    );
  });

  it('debe leer y eliminar valores de caché', async () => {
    const cachedValue = await getCache('test:key');
    await deleteCache('test:key');

    expect(mockRedisInstance.get).toHaveBeenCalledWith('test:key');
    expect(cachedValue).toEqual({ status: 'cached' });
    expect(mockRedisInstance.del).toHaveBeenCalledWith('test:key');
  });
});
