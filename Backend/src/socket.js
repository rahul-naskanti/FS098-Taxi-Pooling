const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Driver = require('./models/Driver');
const AppError = require('./utils/AppError');
const cache = require('./utils/cache');

let io = null;

/**
 * Initialize Socket.IO server attached to Node HTTP server
 */
const initSocket = (httpServer) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  io = new Server(httpServer, {
    cors: {
      origin: clientUrl,
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  // Socket Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Authentication error: Missing access token'));
      }

      const secret = process.env.JWT_SECRET || 'supersecretjwtkeyfordev123!';
      const decoded = jwt.verify(token, secret);

      let user = null;
      if (decoded.role === 'driver') {
        user = await Driver.findById(decoded.id).select('-password').lean();
      } else {
        user = await User.findById(decoded.id).select('-password').lean();
        if (!user) {
          user = await Driver.findById(decoded.id).select('-password').lean();
        }
      }

      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.user = {
        id: user._id.toString(),
        role: user.role || decoded.role,
        fullName: user.fullName,
        email: user.email
      };

      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid or expired token'));
    }
  });

  // Socket Connection Handling
  io.on('connection', (socket) => {
    console.log(`🔌 [Socket.IO] Client connected: socketId=${socket.id}, userId=${socket.user.id}, role=${socket.user.role}`);

    // Register Ride Room & Real-Time Location Event Handlers
    require('./sockets/rideSocketHandler')(io, socket);

    socket.on('disconnect', (reason) => {
      console.log(`🔌 [Socket.IO] Client disconnected: socketId=${socket.id}, userId=${socket.user.id}, reason=${reason}`);
    });
  });

  return io;
};

/**
 * Access active Socket.IO server instance
 */
const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized! Call initSocket(httpServer) first.');
  }
  return io;
};

module.exports = {
  initSocket,
  getIO
};
