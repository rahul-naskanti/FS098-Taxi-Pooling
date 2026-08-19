const Notification = require('../models/Notification');
const mongoose = require('mongoose');

class NotificationService {
  /**
   * Process booking confirmation notification in background worker
   */
  async sendBookingConfirmation(payload) {
    const { passengerId, driverId, pickupLocation, dropLocation } = payload;

    const notificationsToCreate = [];

    if (passengerId) {
      notificationsToCreate.push({
        user: passengerId,
        userModel: 'User',
        title: 'Ride Joined Successfully',
        message: `Your booking for ride from ${pickupLocation || 'origin'} to ${dropLocation || 'destination'} has been confirmed.`,
        type: 'join'
      });
    }

    if (driverId) {
      notificationsToCreate.push({
        user: driverId,
        userModel: 'Driver',
        title: 'New Passenger Joined',
        message: `A new passenger has joined your ride pool from ${pickupLocation || 'origin'} to ${dropLocation || 'destination'}.`,
        type: 'join'
      });
    }

    if (notificationsToCreate.length > 0) {
      try {
        await Notification.insertMany(notificationsToCreate);
      } catch (err) {
        console.error('Failed to create notification records:', err.message);
      }
    }

    return { processed: true, count: notificationsToCreate.length };
  }

  /**
   * Process driver verification notification in background worker
   */
  async sendDriverVerificationStatus(payload) {
    const { driverId, status, reason } = payload;

    if (driverId) {
      try {
        await Notification.create({
          user: driverId,
          userModel: 'Driver',
          title: `Verification Status Updated: ${status.toUpperCase()}`,
          message: status === 'verified'
            ? 'Congratulations! Your driver account has been verified. You can now create ride pools.'
            : `Your driver verification was rejected. Reason: ${reason || 'Incomplete documentation'}.`,
          type: 'verification'
        });
      } catch (err) {
        console.error('Failed to create driver verification notification:', err.message);
      }
    }

    return { processed: true };
  }
}

module.exports = new NotificationService();
