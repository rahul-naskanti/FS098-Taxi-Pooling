const redis = require('redis');

let redisClient = null;
let isRedisConnected = false;

const initRedis = async () => {
  const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
  console.log(`📡 Connecting to Redis at ${redisUrl}...`);
  
  try {
    redisClient = redis.createClient({ 
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 3) {
            console.warn('⚠️ Redis reconnection attempts exhausted. Operating without Redis cache.');
            return false;
          }
          return Math.min(retries * 1000, 5000);
        }
      }
    });
    
    redisClient.on('error', (err) => {
      // Log only on first few retries, otherwise it's silenced after reconnection limits
      if (isRedisConnected || !redisClient || redisClient.isOpen) {
        console.warn(`⚠️ Redis Client Error: ${err.message}`);
      }
      isRedisConnected = false;
    });

    redisClient.on('connect', () => {
      console.log('📡 Redis client connecting...');
    });

    redisClient.on('ready', () => {
      console.log('📡 Redis Client Connected & Ready!');
      isRedisConnected = true;
    });

    await redisClient.connect();
  } catch (error) {
    console.warn(`⚠️ Failed to connect to Redis: ${error.message}`);
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
    console.error(`⚠️ Redis getCache error for key ${key}:`, err.message);
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
    console.error(`⚠️ Redis setCache error for key ${key}:`, err.message);
    return false;
  }
};

const delCache = async (key) => {
  if (!isRedisConnected || !redisClient) return false;
  try {
    await redisClient.del(key);
    return true;
  } catch (err) {
    console.error(`⚠️ Redis delCache error for key ${key}:`, err.message);
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
    console.error(`⚠️ Redis clearCachePattern error for pattern ${pattern}:`, err.message);
    return false;
  }
};

const isConnected = () => isRedisConnected;

module.exports = {
  initRedis,
  getCache,
  setCache,
  delCache,
  clearCachePattern,
  isConnected
};
