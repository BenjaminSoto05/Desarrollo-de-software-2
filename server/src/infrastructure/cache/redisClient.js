const Redis = require('ioredis');

let redisClient = null;

function createRedisClient() {
  if (process.env.NODE_ENV === 'test') {
    return {
      status: 'ready',
      async connect() {},
      async ping() { return 'PONG'; },
      async set() { return true; },
      async get() { return null; },
      async del() { return 1; },
      async quit() {},
    };
  }

  const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

  const client = new Redis(redisUrl, {
    lazyConnect: true,
    enableOfflineQueue: false,
    maxRetriesPerRequest: 3,
  });

  client.on('error', (err) => {
    console.error('❌ Redis error:', err.message);
  });

  return client;
}

async function connectRedis() {
  if (!redisClient) {
    redisClient = createRedisClient();
  }

  if (redisClient.status !== 'ready') {
    if (typeof redisClient.connect === 'function') {
      await redisClient.connect();
    }

    if (typeof redisClient.ping === 'function') {
      await redisClient.ping();
    }
  }

  return redisClient;
}

async function setCache(key, value, ttlSeconds = 60) {
  const client = await connectRedis();
  const serialized = typeof value === 'string' ? value : JSON.stringify(value);
  await client.set(key, serialized, 'EX', ttlSeconds);
  return true;
}

async function getCache(key) {
  const client = await connectRedis();
  const value = await client.get(key);

  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch (_error) {
    return value;
  }
}

async function deleteCache(key) {
  const client = await connectRedis();
  await client.del(key);
  return true;
}

async function closeRedis() {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}

module.exports = {
  connectRedis,
  setCache,
  getCache,
  deleteCache,
  closeRedis,
};
