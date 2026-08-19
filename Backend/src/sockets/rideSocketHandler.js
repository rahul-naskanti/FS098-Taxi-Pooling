const Ride = require('../models/Ride');
const Booking = require('../models/Booking');
const cache = require('../utils/cache');

module.exports = (io, socket) => {
  /**
   * Handle Client Joining a Private Ride Room (ride:{rideId}) with RBAC Authorization
   */
  socket.on('join_ride_room', async (data, callback) => {
    try {
      const { rideId } = data || {};
      if (!rideId) {
        const errPayload = { success: false, message: 'rideId is required' };
        if (typeof callback === 'function') callback(errPayload);
        return socket.emit('socket_error', errPayload);
      }

      const ride = await Ride.findById(rideId).lean();
      if (!ride) {
        const errPayload = { success: false, message: 'Ride pool not found' };
        if (typeof callback === 'function') callback(errPayload);
        return socket.emit('socket_error', errPayload);
      }

      const userId = socket.user.id;
      const isDriver = ride.driver.toString() === userId;
      const isPassenger = (ride.passengers || []).some((p) => p.toString() === userId);
      const isAdmin = socket.user.role === 'admin';

      if (!isDriver && !isPassenger && !isAdmin) {
        const forbiddenPayload = { success: false, message: 'Forbidden: Not authorized to join this ride room' };
        if (typeof callback === 'function') callback(forbiddenPayload);
        return socket.emit('socket_error', forbiddenPayload);
      }

      const roomName = `ride:${rideId}`;
      socket.join(roomName);
      console.log(`👤 [Socket.IO] User ${userId} joined room ${roomName}`);

      const successPayload = { success: true, room: roomName, message: `Joined room ${roomName}` };
      if (typeof callback === 'function') callback(successPayload);
      socket.emit('joined_room', successPayload);
    } catch (err) {
      console.error('⚠️ [Socket.IO] join_ride_room error:', err.message);
      const errPayload = { success: false, message: 'Internal socket error joining room' };
      if (typeof callback === 'function') callback(errPayload);
      socket.emit('socket_error', errPayload);
    }
  });

  /**
   * Handle Driver Real-Time Location Updates & Broadcasting
   */
  socket.on('driver_location_update', async (data, callback) => {
    try {
      const { rideId, latitude, longitude } = data || {};

      if (socket.user.role !== 'driver') {
        const errPayload = { success: false, message: 'Forbidden: Only drivers can stream location updates' };
        if (typeof callback === 'function') callback(errPayload);
        return socket.emit('socket_error', errPayload);
      }

      const latNum = Number(latitude);
      const lngNum = Number(longitude);

      if (isNaN(latNum) || isNaN(lngNum) || latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
        const errPayload = { success: false, message: 'Invalid location coordinates. Latitude must be -90..90 and Longitude -180..180.' };
        if (typeof callback === 'function') callback(errPayload);
        return socket.emit('socket_error', errPayload);
      }

      if (rideId) {
        const ride = await Ride.findById(rideId).lean();
        if (!ride || ride.driver.toString() !== socket.user.id) {
          const errPayload = { success: false, message: 'Forbidden: Driver is not assigned to this ride pool' };
          if (typeof callback === 'function') callback(errPayload);
          return socket.emit('socket_error', errPayload);
        }
      }

      // Store ephemeral driver location in Redis (TTL 60 seconds)
      const locationData = {
        driverId: socket.user.id,
        latitude: latNum,
        longitude: lngNum,
        updatedAt: new Date().toISOString()
      };
      await cache.setCache(`driver_location:${socket.user.id}`, locationData, 60);

      // Broadcast location update to clients in private ride room
      if (rideId) {
        io.to(`ride:${rideId}`).emit('driver_location_updated', {
          rideId,
          ...locationData
        });
      }

      const ackPayload = { success: true, message: 'Location updated successfully' };
      if (typeof callback === 'function') callback(ackPayload);
    } catch (err) {
      console.error('⚠️ [Socket.IO] driver_location_update error:', err.message);
      const errPayload = { success: false, message: 'Internal socket error updating location' };
      if (typeof callback === 'function') callback(errPayload);
      socket.emit('socket_error', errPayload);
    }
  });

  /**
   * Leave Ride Room
   */
  socket.on('leave_ride_room', (data) => {
    const { rideId } = data || {};
    if (rideId) {
      const roomName = `ride:${rideId}`;
      socket.leave(roomName);
      console.log(`👤 [Socket.IO] User ${socket.user.id} left room ${roomName}`);
    }
  });
};
