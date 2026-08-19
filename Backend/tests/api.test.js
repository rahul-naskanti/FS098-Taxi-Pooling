const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Driver = require('../src/models/Driver');
const Ride = require('../src/models/Ride');
const Booking = require('../src/models/Booking');
const Payment = require('../src/models/Payment');
const IdempotencyKey = require('../src/models/IdempotencyKey');
const { generateAccessToken, generateRefreshToken } = require('../src/utils/generateToken');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

describe('Sprint 2, 3 & 4: Full Engineering Test Suite', () => {

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });

  describe('Section 1: Authentication & Security Hardening Tests', () => {
    it('1. Registration succeeds with valid data', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue(null);
      jest.spyOn(Driver, 'findOne').mockResolvedValue(null);
      jest.spyOn(User, 'create').mockResolvedValue({
        _id: 'passenger-123',
        fullName: 'Valid Passenger',
        email: 'valid@passenger.com',
        phone: '9876543210',
        role: 'passenger'
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Valid Passenger',
          email: 'valid@passenger.com',
          phone: '9876543210',
          password: 'password123',
          role: 'passenger'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.headers['set-cookie']).toBeDefined();

      User.findOne.mockRestore();
      Driver.findOne.mockRestore();
      User.create.mockRestore();
    });

    it('2. Registration rejects invalid data', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: '',
          email: 'invalid-email',
          phone: '',
          password: '123'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });

    it('3. Login succeeds with valid credentials', async () => {
      const mockUser = {
        _id: 'user-id-123',
        fullName: 'Test User',
        email: 'user@test.com',
        phone: '1234567890',
        role: 'passenger',
        matchPassword: jest.fn().mockResolvedValue(true)
      };

      jest.spyOn(User, 'findOne').mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user@test.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.headers['set-cookie']).toBeDefined();

      User.findOne.mockRestore();
    });

    it('4. Login rejects invalid credentials', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue(null);
      jest.spyOn(Driver, 'findOne').mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nobody@test.com',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);

      User.findOne.mockRestore();
      Driver.findOne.mockRestore();
    });

    it('5. Protected route rejects unauthenticated request', async () => {
      const res = await request(app).get('/api/rides');
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('6. Valid access token allows request', async () => {
      const validToken = generateAccessToken('passenger-123', 'passenger');
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: 'passenger-123',
          fullName: 'Passenger',
          role: 'passenger',
          isActive: true
        })
      });
      jest.spyOn(Ride, 'find').mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([])
      });

      const res = await request(app)
        .get('/api/rides')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      User.findById.mockRestore();
      Ride.find.mockRestore();
    });

    it('7. Invalid access token rejects request', async () => {
      const res = await request(app)
        .get('/api/rides')
        .set('Authorization', 'Bearer invalid.jwt.token');

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('8. Expired access token rejects request', async () => {
      const expiredToken = jwt.sign(
        { id: 'passenger-123', role: 'passenger' },
        process.env.JWT_SECRET || 'supersecretjwtkeyfordev123!',
        { expiresIn: '-1s' }
      );

      const res = await request(app)
        .get('/api/rides')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('expired');
    });

    it('9. Refresh token creates a new access token', async () => {
      const validRefreshToken = generateRefreshToken('passenger-123', 'passenger');
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: 'passenger-123',
          fullName: 'Passenger',
          role: 'passenger'
        })
      });

      const res = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', [`refreshToken=${validRefreshToken}`]);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();

      User.findById.mockRestore();
    });

    it('10. Invalid refresh token is rejected', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', ['refreshToken=invalid.refresh.token']);

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('11. Logout clears/invalidates authentication state', async () => {
      const res = await request(app).post('/api/auth/logout');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.headers['set-cookie'][0]).toContain('refreshToken=;');
    });

    it('12. Unverified driver cannot create ride', async () => {
      const driverToken = generateAccessToken('unverified-driver-id', 'driver');
      jest.spyOn(Driver, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: 'unverified-driver-id',
          role: 'driver',
          isVerified: false,
          verificationStatus: 'pending',
          isActive: true
        })
      });

      const res = await request(app)
        .post('/api/rides')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          pickupLocation: 'Koramangala',
          dropLocation: 'Indiranagar',
          departureDate: '2026-09-01',
          departureTime: '09:00 AM',
          availableSeats: 3,
          pricePerSeat: 150,
          vehicleType: 'Sedan'
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('pending verification');

      Driver.findById.mockRestore();
    });

    it('13. Verified driver can create ride', async () => {
      const driverToken = generateAccessToken('verified-driver-id', 'driver');
      jest.spyOn(Driver, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: 'verified-driver-id',
          role: 'driver',
          isVerified: true,
          verificationStatus: 'verified',
          isActive: true
        })
      });
      jest.spyOn(Ride, 'create').mockResolvedValue({
        _id: 'ride-new-123',
        driver: 'verified-driver-id',
        pickupLocation: 'Koramangala',
        dropLocation: 'Indiranagar'
      });

      const res = await request(app)
        .post('/api/rides')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          pickupLocation: 'Koramangala',
          dropLocation: 'Indiranagar',
          departureDate: '2026-09-01',
          departureTime: '09:00 AM',
          availableSeats: 3,
          pricePerSeat: 150,
          vehicleType: 'Sedan'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);

      Driver.findById.mockRestore();
      Ride.create.mockRestore();
    });

    it('14. Passenger cannot access driver-only endpoint', async () => {
      const passengerToken = generateAccessToken('passenger-123', 'passenger');
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: 'passenger-123',
          role: 'passenger',
          isActive: true
        })
      });

      const res = await request(app)
        .get('/api/rides/driver/my-rides')
        .set('Authorization', `Bearer ${passengerToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);

      User.findById.mockRestore();
    });

    it('15. Driver cannot access admin-only endpoint', async () => {
      const driverToken = generateAccessToken('driver-123', 'driver');
      jest.spyOn(Driver, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: 'driver-123',
          role: 'driver',
          isActive: true
        })
      });

      const res = await request(app)
        .get('/api/admin/dashboard-stats')
        .set('Authorization', `Bearer ${driverToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);

      Driver.findById.mockRestore();
    });

    it('16. Normal passenger cannot access admin endpoint', async () => {
      const passengerToken = generateAccessToken('passenger-123', 'passenger');
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: 'passenger-123',
          role: 'passenger',
          isActive: true
        })
      });

      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${passengerToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);

      User.findById.mockRestore();
    });

    it('17. IDOR attempt is rejected when user accesses another user resource', async () => {
      const passengerToken = generateAccessToken('507f1f77bcf86cd799439011', 'passenger');
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: '507f1f77bcf86cd799439011',
          role: 'passenger',
          isActive: true
        })
      });

      const res = await request(app)
        .get('/api/users/507f1f77bcf86cd799439022')
        .set('Authorization', `Bearer ${passengerToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);

      User.findById.mockRestore();
    });
  });

  describe('Section 2: Sprint 3 Zod Validation Test Suite', () => {
    it('18. Zod Registration Schema rejects unexpected extra strict fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Attacker User',
          email: 'attacker@test.com',
          phone: '9876543210',
          password: 'password123',
          role: 'passenger',
          isAdmin: true
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Unrecognized key');
    });

    it('19. Zod Ride Creation Schema rejects negative prices and zero available seats', async () => {
      const driverToken = generateAccessToken('verified-driver-id', 'driver');
      jest.spyOn(Driver, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: 'verified-driver-id',
          role: 'driver',
          isVerified: true,
          isActive: true
        })
      });

      const res = await request(app)
        .post('/api/rides')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          pickupLocation: 'Koramangala',
          dropLocation: 'Indiranagar',
          departureDate: '2026-09-01',
          departureTime: '09:00 AM',
          availableSeats: 0,
          pricePerSeat: -50,
          vehicleType: 'Sedan'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();

      Driver.findById.mockRestore();
    });

    it('20. Zod Route Param Schema rejects malformed MongoDB ObjectIds early', async () => {
      const passengerToken = generateAccessToken('507f1f77bcf86cd799439011', 'passenger');
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: '507f1f77bcf86cd799439011',
          role: 'passenger',
          isActive: true
        })
      });

      const res = await request(app)
        .get('/api/rides/invalid-id-123')
        .set('Authorization', `Bearer ${passengerToken}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid MongoDB ObjectId format');

      User.findById.mockRestore();
    });

    it('21. Zod Query Param Schema coerces types and rejects invalid ratings', async () => {
      const passengerToken = generateAccessToken('507f1f77bcf86cd799439011', 'passenger');
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: '507f1f77bcf86cd799439011',
          role: 'passenger',
          isActive: true
        })
      });

      const res = await request(app)
        .get('/api/rides/search?rating=10')
        .set('Authorization', `Bearer ${passengerToken}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);

      User.findById.mockRestore();
    });
  });

  describe('Section 3: Sprint 4 Transactions, Concurrency & Idempotency Test Suite', () => {
    const passengerId = '507f1f77bcf86cd799439011';
    const driverId = '507f1f77bcf86cd799439022';
    const rideId = '507f1f77bcf86cd799439033';
    const passengerToken = generateAccessToken(passengerId, 'passenger');

    it('22. Transactional booking succeeds when seats are available', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: passengerId,
          role: 'passenger',
          isActive: true
        })
      });

      jest.spyOn(Ride, 'findById').mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          _id: rideId,
          driver: driverId,
          pickupLocation: 'Whitefield',
          dropLocation: 'MG Road',
          pricePerSeat: 200,
          availableSeats: 2,
          passengers: [],
          status: 'active'
        })
      });

      jest.spyOn(Ride, 'findOneAndUpdate').mockResolvedValue({
        _id: rideId,
        availableSeats: 1,
        passengers: [passengerId]
      });

      jest.spyOn(Booking, 'create').mockResolvedValue([{
        _id: 'booking-999',
        ride: rideId,
        passenger: passengerId,
        driver: driverId
      }]);

      jest.spyOn(Payment, 'create').mockResolvedValue([{
        _id: 'payment-999',
        transactionId: 'TXN-123'
      }]);

      const res = await request(app)
        .post(`/api/rides/${rideId}/join`)
        .set('Authorization', `Bearer ${passengerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.booking).toBeDefined();

      User.findById.mockRestore();
      Ride.findById.mockRestore();
      Ride.findOneAndUpdate.mockRestore();
      Booking.create.mockRestore();
      Payment.create.mockRestore();
    });

    it('23. Booking fails when zero seats remain', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: passengerId,
          role: 'passenger',
          isActive: true
        })
      });

      jest.spyOn(Ride, 'findById').mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          _id: rideId,
          driver: driverId,
          availableSeats: 0,
          passengers: ['507f1f77bcf86cd799439099'],
          status: 'active'
        })
      });

      const res = await request(app)
        .post(`/api/rides/${rideId}/join`)
        .set('Authorization', `Bearer ${passengerToken}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('no available seats remaining');

      User.findById.mockRestore();
      Ride.findById.mockRestore();
    });

    it('24. Idempotency middleware enforces X-Idempotency-Key retry cached response', async () => {
      const idempotencyKey = 'UNIQUE-KEY-88888888';
      const endpoint = `/api/rides/${rideId}/join`;
      const payloadString = `${endpoint}-${JSON.stringify({})}-${JSON.stringify({ id: rideId })}`;
      const requestHash = crypto.createHash('sha256').update(payloadString).digest('hex');

      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: passengerId,
          role: 'passenger',
          isActive: true
        })
      });

      jest.spyOn(IdempotencyKey, 'findOne').mockResolvedValue(null);
      jest.spyOn(IdempotencyKey, 'create').mockResolvedValue({ _id: 'idem-123' });
      jest.spyOn(IdempotencyKey, 'findByIdAndUpdate').mockResolvedValue({});

      jest.spyOn(Ride, 'findById').mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          _id: rideId,
          driver: driverId,
          pricePerSeat: 150,
          availableSeats: 3,
          passengers: []
        })
      });
      jest.spyOn(Ride, 'findOneAndUpdate').mockResolvedValue({ _id: rideId, availableSeats: 2, passengers: [passengerId] });
      jest.spyOn(Booking, 'create').mockResolvedValue([{ _id: 'b-1' }]);
      jest.spyOn(Payment, 'create').mockResolvedValue([{ _id: 'p-1' }]);

      // First Request with X-Idempotency-Key
      const res1 = await request(app)
        .post(`/api/rides/${rideId}/join`)
        .set('Authorization', `Bearer ${passengerToken}`)
        .set('X-Idempotency-Key', idempotencyKey);

      expect(res1.statusCode).toBe(200);
      expect(res1.body.success).toBe(true);

      // Mock finding completed record with matching payload hash on retry
      IdempotencyKey.findOne.mockResolvedValue({
        key: idempotencyKey,
        user: passengerId,
        endpoint,
        requestHash,
        status: 'completed',
        statusCode: 200,
        responseBody: res1.body
      });

      // Second Request with SAME X-Idempotency-Key (Retry)
      const res2 = await request(app)
        .post(`/api/rides/${rideId}/join`)
        .set('Authorization', `Bearer ${passengerToken}`)
        .set('X-Idempotency-Key', idempotencyKey);

      expect(res2.statusCode).toBe(200);
      expect(res2.body.success).toBe(true);

      User.findById.mockRestore();
      IdempotencyKey.findOne.mockRestore();
      IdempotencyKey.create.mockRestore();
      Ride.findById.mockRestore();
      Ride.findOneAndUpdate.mockRestore();
      Booking.create.mockRestore();
      Payment.create.mockRestore();
    });

    it('25. Same idempotency key from different user is rejected', async () => {
      const idempotencyKey = 'SHARED-KEY-99999999';

      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: passengerId,
          role: 'passenger',
          isActive: true
        })
      });

      // Key belongs to another user ("507f1f77bcf86cd799439088")
      jest.spyOn(IdempotencyKey, 'findOne').mockResolvedValue({
        key: idempotencyKey,
        user: '507f1f77bcf86cd799439088',
        status: 'completed'
      });

      const res = await request(app)
        .post(`/api/rides/${rideId}/join`)
        .set('Authorization', `Bearer ${passengerToken}`)
        .set('X-Idempotency-Key', idempotencyKey);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('different user accounts');

      User.findById.mockRestore();
      IdempotencyKey.findOne.mockRestore();
    });

    it('26. Short or invalid idempotency key length is rejected', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: passengerId,
          role: 'passenger',
          isActive: true
        })
      });

      const res = await request(app)
        .post(`/api/rides/${rideId}/join`)
        .set('Authorization', `Bearer ${passengerToken}`)
        .set('X-Idempotency-Key', 'short'); // < 8 characters

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('between 8 and 128 characters');

      User.findById.mockRestore();
    });

    it('27. Concurrent requests competing for 1 available seat result in exactly 1 success and 1 failure', async () => {
      const passenger1Id = '507f1f77bcf86cd799439011';
      const passenger2Id = '507f1f77bcf86cd799439022';
      const token1 = generateAccessToken(passenger1Id, 'passenger');
      const token2 = generateAccessToken(passenger2Id, 'passenger');

      let seats = 1;

      jest.spyOn(User, 'findById').mockImplementation((id) => ({
        select: jest.fn().mockResolvedValue({
          _id: id,
          role: 'passenger',
          isActive: true
        })
      }));

      jest.spyOn(Ride, 'findById').mockReturnValue({
        lean: jest.fn().mockImplementation(() => Promise.resolve({
          _id: rideId,
          driver: driverId,
          availableSeats: seats,
          passengers: [],
          pricePerSeat: 100,
          status: 'active'
        }))
      });

      // Atomic findOneAndUpdate simulation
      jest.spyOn(Ride, 'findOneAndUpdate').mockImplementation(() => {
        if (seats > 0) {
          seats -= 1;
          return Promise.resolve({ _id: rideId, availableSeats: seats, passengers: ['p'] });
        }
        return Promise.resolve(null);
      });

      jest.spyOn(Booking, 'create').mockResolvedValue([{ _id: 'b-concurrent' }]);
      jest.spyOn(Payment, 'create').mockResolvedValue([{ _id: 'p-concurrent' }]);

      // Fire 2 concurrent join requests
      const [res1, res2] = await Promise.all([
        request(app).post(`/api/rides/${rideId}/join`).set('Authorization', `Bearer ${token1}`),
        request(app).post(`/api/rides/${rideId}/join`).set('Authorization', `Bearer ${token2}`)
      ]);

      const statusCodes = [res1.statusCode, res2.statusCode].sort();

      // Exactly ONE succeeds (200) and ONE fails (400)
      expect(statusCodes).toEqual([200, 400]);
      expect(seats).toBe(0); // Seats must never become negative!

      User.findById.mockRestore();
      Ride.findById.mockRestore();
      Ride.findOneAndUpdate.mockRestore();
      Booking.create.mockRestore();
      Payment.create.mockRestore();
    });
  });

});
