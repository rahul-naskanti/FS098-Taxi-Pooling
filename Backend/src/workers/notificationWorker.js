let Worker = null;
try {
  Worker = require('bullmq').Worker;
} catch (e) {
  Worker = null;
}

const notificationService = require('../services/notificationService');

const redisOptions = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null
};

let notificationWorker = null;

// Instantiate background worker process if not running in test mode
if (Worker && process.env.NODE_ENV !== 'test') {
  try {
    notificationWorker = new Worker(
      'notification-queue',
      async (job) => {
        const { name, data } = job;
        switch (name) {
          case 'BOOKING_CONFIRMATION':
            return await notificationService.sendBookingConfirmation(data);
          case 'DRIVER_VERIFICATION':
            return await notificationService.sendDriverVerificationStatus(data);
          default:
            console.warn(`⚠️ Unknown job type encountered: ${name}`);
            return { processed: false };
        }
      },
      { connection: redisOptions }
    );

    notificationWorker.on('completed', (job) => {
      console.log(`✅ [BullMQ Worker] Job ${job.id} (${job.name}) completed successfully.`);
    });

    notificationWorker.on('failed', (job, err) => {
      const attempts = job ? job.attemptsMade : 0;
      const maxAttempts = job && job.opts ? job.opts.attempts : 3;

      console.error(
        `💥 [BullMQ Worker] Job ${job ? job.id : 'unknown'} failed (Attempt ${attempts}/${maxAttempts}): ${err.message}`
      );

      // Dead Letter Queue (DLQ) condition: job exhausted all retry attempts
      if (job && attempts >= maxAttempts) {
        console.error(
          `☠️ [Dead Letter Queue] Job ${job.id} (${job.name}) exhausted all ${maxAttempts} retry attempts. Moved to DLQ state.`
        );
      }
    });

    console.log('🚀 BullMQ Notification Worker initialized and listening to notification-queue.');

    // Graceful Shutdown Handler for BullMQ Worker
    const gracefulWorkerShutdown = async (signal) => {
      console.log(`⚠️ [Worker] Received ${signal}. Closing BullMQ Worker...`);
      if (notificationWorker) {
        await notificationWorker.close();
        console.log('✅ [Worker] BullMQ Worker closed cleanly.');
      }
      process.exit(0);
    };

    process.on('SIGTERM', () => gracefulWorkerShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulWorkerShutdown('SIGINT'));

  } catch (err) {
    console.error('⚠️ Failed to initialize BullMQ Worker:', err.message);
  }
}

module.exports = notificationWorker;
