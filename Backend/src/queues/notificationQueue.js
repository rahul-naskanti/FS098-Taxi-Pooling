let Queue = null;
try {
  Queue = require('bullmq').Queue;
} catch (e) {
  Queue = null;
}

const redisOptions = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null
};

// Initialize BullMQ notification queue
let notificationQueue = null;
if (Queue && process.env.NODE_ENV !== 'test') {
  try {
    notificationQueue = new Queue('notification-queue', {
      connection: redisOptions,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000 // Retry after 1s, 2s, 4s
        },
        removeOnComplete: true,
        removeOnFail: false // Retain failed jobs for Dead Letter Queue inspection
      }
    });
  } catch (err) {
    notificationQueue = null;
  }
}

/**
 * Enqueues a notification job into BullMQ
 */
const addNotificationJob = async (type, payload) => {
  if (process.env.NODE_ENV === 'test' || !notificationQueue) {
    return { id: `mock_job_${Date.now()}`, name: type, data: payload };
  }
  try {
    const job = await notificationQueue.add(type, payload);
    return job;
  } catch (err) {
    console.error(`⚠️ Failed to enqueue notification job [${type}]:`, err.message);
    return null;
  }
};

module.exports = {
  notificationQueue,
  addNotificationJob
};
