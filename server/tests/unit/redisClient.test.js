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

let redisClientModule;

describe('Redis client', () => {
  const originalEnv = process.env.NODE_ENV;

  beforeAll(() => {
    process.env.NODE_ENV = 'development';
    redisClientModule = require('../../src/infrastructure/cache/redisClient');
  });

  afterAll(() => {
    process.env.NODE_ENV = originalEnv;
  });
  beforeEach(async () => {
    jest.clearAllMocks();
    mockRedisInstance.get.mockResolvedValue('{"status":"cached"}');
    mockRedisInstance.set.mockResolvedValue('OK');
    mockRedisInstance.del.mockResolvedValue(1);
    mockRedisInstance.quit.mockResolvedValue('OK');
    
    // Ensure redisClient is null before each test
    await redisClientModule.closeRedis();
  });

  it('debe conectar con Redis y almacenar un valor en caché', async () => {
    await redisClientModule.connectRedis();
    await redisClientModule.setCache('test:key', { status: 'cached' }, 60);

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
    const cachedValue = await redisClientModule.getCache('test:key');
    await redisClientModule.deleteCache('test:key');

    expect(mockRedisInstance.get).toHaveBeenCalledWith('test:key');
    expect(cachedValue).toEqual({ status: 'cached' });
    expect(mockRedisInstance.del).toHaveBeenCalledWith('test:key');
  });
});
