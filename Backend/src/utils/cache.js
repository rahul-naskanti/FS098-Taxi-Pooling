const redis = require('redis');

let redisClient = null;
let isRedisConnected = false;

const initRedis = async () => {
  const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
  
  try {
    redisClient = redis.createClient({ 
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 3) {
            return false;
          }
          return Math.min(retries * 1000, 5000);
        }
      }
    });
    
    redisClient.on('error', (err) => {
      isRedisConnected = false;
    });

    redisClient.on('connect', () => {});

    redisClient.on('ready', () => {
      isRedisConnected = true;
    });

    await redisClient.connect();
  } catch (error) {
    redisClient = null;
    isRedisConnected = false;
  }
};

const getCache = async (key) => {
  if (!isRedisConnected || !redisClient) return null;
  try {
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  } catch (err) {
    return null;
  }
};

const setCache = async (key, value, ttlSeconds = 300) => {
  if (!isRedisConnected || !redisClient) return false;
  try {
    await redisClient.set(key, JSON.stringify(value), {
      EX: ttlSeconds
    });
    return true;
  } catch (err) {
    return false;
  }
};

const delCache = async (key) => {
  if (!isRedisConnected || !redisClient) return false;
  try {
    await redisClient.del(key);
    return true;
  } catch (err) {
    return false;
  }
};

const clearCachePattern = async (pattern) => {
  if (!isRedisConnected || !redisClient) return false;
  try {
    let cursor = 0;
    do {
      const reply = await redisClient.scan(cursor, {
        MATCH: pattern,
        COUNT: 100
      });
      cursor = reply.cursor;
      const keys = reply.keys;
      if (keys && keys.length > 0) {
        await redisClient.del(keys);
      }
    } while (cursor !== 0);
    return true;
  } catch (err) {
    return false;
  }
};

const isConnected = () => isRedisConnected;
const getClient = () => (isRedisConnected ? redisClient : null);

module.exports = {
  initRedis,
  getCache,
  setCache,
  delCache,
  clearCachePattern,
  isConnected,
  getClient
};
