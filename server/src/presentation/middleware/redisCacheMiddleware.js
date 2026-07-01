const { getCache, setCache } = require('../../infrastructure/cache/redisClient');

function cacheMiddleware({ ttlSeconds = 60 } = {}) {
  return async function middleware(req, res, next) {
    try {
      const cacheKey = req.originalUrl || req.url;
      const cachedValue = await getCache(cacheKey);

      if (cachedValue !== null) {
        return res.json(cachedValue);
      }

      const originalJson = res.json.bind(res);
      res.json = (body) => {
        if (res.headersSent) {
          return originalJson(body);
        }

        Promise.resolve(setCache(cacheKey, body, ttlSeconds)).catch((error) => {
          console.error('❌ No se pudo guardar en caché:', error.message);
        });
        return originalJson(body);
      };

      return next();
    } catch (error) {
      console.error('❌ Error en middleware de caché:', error.message);
      return next();
    }
  };
}

module.exports = {
  cacheMiddleware,
};
