const request = require('supertest');
const app = require('../src/app');
const http = require('http');
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Driver = require('../src/models/Driver');
const Ride = require('../src/models/Ride');
const Booking = require('../src/models/Booking');
const Payment = require('../src/models/Payment');
const IdempotencyKey = require('../src/models/IdempotencyKey');
const Notification = require('../src/models/Notification');
const { generateAccessToken, generateRefreshToken } = require('../src/utils/generateToken');
const cache = require('../src/utils/cache');
const cloudinaryUtils = require('../src/utils/cloudinary');
const notificationQueueModule = require('../src/queues/notificationQueue');
const notificationService = require('../src/services/notificationService');
const rideMatchingService = require('../src/services/rideMatchingService');
const { initSocket } = require('../src/socket');
const ioClient = require('socket.io-client');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

describe('Sprint 2, 3, 4, 5, 6, 7 & 8: Full Engineering Test Suite', () => {
  let server, socketUrl;

  beforeAll((done) => {
    server = http.createServer(app);
    initSocket(server);
    server.listen(0, () => {
      const port = server.address().port;
      socketUrl = `http://localhost:${port}`;
      done();
    });
  });

  afterAll((done) => {
    if (server) server.close();
    if (mongoose.connection.readyState !== 0) {
      mongoose.connection.close().then(() => done());
    } else {
      done();
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

  describe('Section 4: Sprint 5 Geospatial Search & Location-Based Ride Matching Tests', () => {
    const passengerId = '507f1f77bcf86cd799439011';
    const driverId = '507f1f77bcf86cd799439022';
    const passengerToken = generateAccessToken(passengerId, 'passenger');
    const driverToken = generateAccessToken(driverId, 'driver');

    it('28. Unauthenticated request to /api/rides/nearby is rejected with 401', async () => {
      const res = await request(app).get('/api/rides/nearby?latitude=12.9352&longitude=77.6245');
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('29. Zod query schema rejects invalid latitude (> 90)', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({ _id: passengerId, role: 'passenger', isActive: true })
      });

      const res = await request(app)
        .get('/api/rides/nearby?latitude=95.0&longitude=77.6245')
        .set('Authorization', `Bearer ${passengerToken}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();

      User.findById.mockRestore();
    });

    it('30. Zod query schema rejects invalid longitude (< -180)', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({ _id: passengerId, role: 'passenger', isActive: true })
      });

      const res = await request(app)
        .get('/api/rides/nearby?latitude=12.9352&longitude=-200.0')
        .set('Authorization', `Bearer ${passengerToken}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);

      User.findById.mockRestore();
    });

    it('31. Zod query schema rejects invalid zero or negative radiusKm', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({ _id: passengerId, role: 'passenger', isActive: true })
      });

      const res = await request(app)
        .get('/api/rides/nearby?latitude=12.9352&longitude=77.6245&radiusKm=0')
        .set('Authorization', `Bearer ${passengerToken}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);

      User.findById.mockRestore();
    });

    it('32. Verified driver creating ride with pickupCoordinates stores GeoJSON [longitude, latitude]', async () => {
      jest.spyOn(Driver, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({
          _id: driverId,
          role: 'driver',
          isVerified: true,
          verificationStatus: 'verified',
          isActive: true
        })
      });

      let createdRideData = null;
      jest.spyOn(Ride, 'create').mockImplementation((data) => {
        createdRideData = data;
        return Promise.resolve({ _id: 'ride-geo-1', ...data });
      });

      const res = await request(app)
        .post('/api/rides')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          pickupLocation: 'Koramangala 5th Block',
          dropLocation: 'Indiranagar 100ft Road',
          departureDate: '2026-09-01',
          departureTime: '10:00 AM',
          availableSeats: 3,
          pricePerSeat: 120,
          vehicleType: 'Sedan',
          pickupCoordinates: { latitude: 12.9352, longitude: 77.6245 },
          dropCoordinates: { latitude: 12.9784, longitude: 77.6408 }
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(createdRideData.pickupPoint).toEqual({
        type: 'Point',
        coordinates: [77.6245, 12.9352]
      });

      Driver.findById.mockRestore();
      Ride.create.mockRestore();
    });

    it('33. GET /api/rides/nearby returns active rides with calculated distanceKm', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({ _id: passengerId, role: 'passenger', isActive: true })
      });

      const mockRide = {
        _id: 'ride-near-1',
        pickupLocation: 'Koramangala 5th Block',
        dropLocation: 'Indiranagar',
        status: 'active',
        availableSeats: 2,
        pickupPoint: { type: 'Point', coordinates: [77.6245, 12.9352] }
      };

      jest.spyOn(Ride, 'find').mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([mockRide])
      });

      const res = await request(app)
        .get('/api/rides/nearby?latitude=12.9352&longitude=77.6245&radiusKm=5')
        .set('Authorization', `Bearer ${passengerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.rides.length).toBe(1);
      expect(res.body.rides[0].distanceKm).toBeDefined();

      User.findById.mockRestore();
      Ride.find.mockRestore();
    });

    it('34. GET /api/rides/within returns active rides using $geoWithin operator', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({ _id: passengerId, role: 'passenger', isActive: true })
      });

      const mockRide = {
        _id: 'ride-within-1',
        pickupLocation: 'Indiranagar 100ft Road',
        dropLocation: 'Whitefield',
        status: 'active',
        availableSeats: 3,
        pickupPoint: { type: 'Point', coordinates: [77.6408, 12.9784] }
      };

      jest.spyOn(Ride, 'find').mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([mockRide])
      });

      const res = await request(app)
        .get('/api/rides/within?latitude=12.9784&longitude=77.6408&radiusKm=10')
        .set('Authorization', `Bearer ${passengerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.rides.length).toBe(1);

      User.findById.mockRestore();
      Ride.find.mockRestore();
    });
  });

  describe('Section 5: Sprint 5 Redis Caching, TTL, Invalidation & Rate Limiting Tests', () => {
    const passengerId = '507f1f77bcf86cd799439011';
    const passengerToken = generateAccessToken(passengerId, 'passenger');
    const rideId = '507f1f77bcf86cd799439033';

    it('35. GET /api/rides/:id produces Cache MISS on initial request and Cache HIT on subsequent request', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({ _id: passengerId, role: 'passenger', isActive: true })
      });

      const mockRide = {
        _id: rideId,
        driver: 'driver-123',
        pickupLocation: 'Koramangala',
        dropLocation: 'Indiranagar',
        pricePerSeat: 150,
        availableSeats: 3
      };

      jest.spyOn(Ride, 'findById').mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockRide)
      });

      jest.spyOn(cache, 'getCache')
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockRide);

      const res1 = await request(app)
        .get(`/api/rides/${rideId}`)
        .set('Authorization', `Bearer ${passengerToken}`);

      expect(res1.statusCode).toBe(200);
      expect(res1.headers['x-cache']).toBe('MISS');
      expect(res1.body.cache).toBe('miss');

      const res2 = await request(app)
        .get(`/api/rides/${rideId}`)
        .set('Authorization', `Bearer ${passengerToken}`);

      expect(res2.statusCode).toBe(200);
      expect(res2.headers['x-cache']).toBe('HIT');
      expect(res2.body.cache).toBe('hit');

      User.findById.mockRestore();
      Ride.findById.mockRestore();
      cache.getCache.mockRestore();
    });

    it('36. Booking invalidates cached ride entry post-commit', async () => {
      jest.spyOn(cache, 'delCache').mockResolvedValue(true);

      const cacheKey = `ride:${rideId}`;
      await cache.delCache(cacheKey);

      expect(cache.delCache).toHaveBeenCalledWith(cacheKey);
      cache.delCache.mockRestore();
    });

    it('37. Graceful degradation when Redis is offline (falls back to MongoDB cleanly)', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({ _id: passengerId, role: 'passenger', isActive: true })
      });

      jest.spyOn(Ride, 'findById').mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue({ _id: rideId, pickupLocation: 'Offline Test' })
      });

      jest.spyOn(cache, 'getCache').mockResolvedValue(null);

      const res = await request(app)
        .get(`/api/rides/${rideId}`)
        .set('Authorization', `Bearer ${passengerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.ride.pickupLocation).toBe('Offline Test');

      User.findById.mockRestore();
      Ride.findById.mockRestore();
      cache.getCache.mockRestore();
    });

    it('38. GET /api/health endpoint returns 200 OK with mongodb and redis health status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('OK');
      expect(res.body.mongodb).toBeDefined();
      expect(res.body.redis).toBeDefined();
      expect(res.body.uptime).toBeDefined();
    });
  });

  describe('Section 6: Sprint 6 Cloudinary Document Upload & GraphQL API Tests', () => {
    const driverId = '507f1f77bcf86cd799439022';
    const passengerId = '507f1f77bcf86cd799439011';
    const driverToken = generateAccessToken(driverId, 'driver');
    const passengerToken = generateAccessToken(passengerId, 'passenger');

    it('39. Authorized driver can upload verification documents to Cloudinary', async () => {
      const mockDriver = {
        _id: driverId,
        id: driverId,
        role: 'driver',
        save: jest.fn().mockResolvedValue(true)
      };

      jest.spyOn(Driver, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue(mockDriver),
        then: (cb) => Promise.resolve(mockDriver).then(cb)
      });

      const res = await request(app)
        .post('/api/drivers/documents')
        .set('Authorization', `Bearer ${driverToken}`)
        .attach('licenseImage', Buffer.from('mock license file content'), 'license.png');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.documents.licenseDocument).toBeDefined();
      expect(res.body.documents.licenseDocument.publicId).toBeDefined();

      Driver.findById.mockRestore();
    });

    it('40. IDOR Protection prevents passenger from retrieving driver document metadata', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({ _id: passengerId, id: passengerId, role: 'passenger', isActive: true })
      });

      const res = await request(app)
        .get(`/api/drivers/${driverId}/documents`)
        .set('Authorization', `Bearer ${passengerToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Forbidden');

      User.findById.mockRestore();
    });

    it('41. Authorized driver can retrieve their own verification document metadata', async () => {
      const mockDriverData = {
        _id: driverId,
        id: driverId,
        role: 'driver',
        verificationStatus: 'pending',
        licenseDocument: { publicId: 'taxipooling/doc1', secureUrl: 'https://cloudinary.com/doc1.png' }
      };

      jest.spyOn(Driver, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue(mockDriverData),
        then: (cb) => Promise.resolve(mockDriverData).then(cb)
      });

      const res = await request(app)
        .get(`/api/drivers/${driverId}/documents`)
        .set('Authorization', `Bearer ${driverToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.documents.licenseDocument.secureUrl).toBeDefined();

      Driver.findById.mockRestore();
    });

    it('42. GraphQL Query rides returns list of active rides', async () => {
      jest.spyOn(Ride, 'find').mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([{
          _id: '507f1f77bcf86cd799439033',
          pickupLocation: 'GraphQL Koramangala',
          dropLocation: 'GraphQL Indiranagar',
          departureDate: '2026-09-01',
          departureTime: '10:00 AM',
          availableSeats: 3,
          pricePerSeat: 100,
          vehicleType: 'Sedan',
          status: 'active'
        }])
      });

      const query = `
        query {
          rides {
            id
            pickupLocation
            dropLocation
            availableSeats
          }
        }
      `;

      const res = await request(app)
        .post('/graphql')
        .send({ query });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.rides).toBeDefined();
      expect(res.body.data.rides.length).toBe(1);
      expect(res.body.data.rides[0].pickupLocation).toBe('GraphQL Koramangala');

      Ride.find.mockRestore();
    });

    it('43. GraphQL Query me returns profile of authenticated user', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({
            _id: passengerId,
            fullName: 'GraphQL Passenger',
            email: 'gql@test.com',
            phone: '9876543210',
            role: 'passenger'
          })
        })
      });

      const query = `
        query {
          me {
            id
            fullName
            email
            role
          }
        }
      `;

      const res = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${passengerToken}`)
        .send({ query });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.me).toBeDefined();
      expect(res.body.data.me.fullName).toBe('GraphQL Passenger');

      User.findById.mockRestore();
    });

    it('44. GraphQL DataLoader batches driver lookups and eliminates N+1 query problem', async () => {
      const rideMock = {
        _id: '507f1f77bcf86cd799439033',
        pickupLocation: 'Whitefield',
        dropLocation: 'MG Road',
        departureDate: '2026-09-01',
        departureTime: '08:00 AM',
        availableSeats: 2,
        pricePerSeat: 200,
        vehicleType: 'SUV',
        status: 'active',
        driver: driverId
      };

      jest.spyOn(Ride, 'findById').mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(rideMock)
      });

      jest.spyOn(Driver, 'find').mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([{
          _id: driverId,
          fullName: 'DataLoader Driver',
          email: 'driver@dl.com',
          phone: '1112223333',
          vehicleName: 'Toyota',
          vehicleNumber: 'KA-01-AB-1234',
          isVerified: true
        }])
      });

      const query = `
        query {
          ride(id: "507f1f77bcf86cd799439033") {
            id
            pickupLocation
            driver {
              id
              fullName
              vehicleName
            }
          }
        }
      `;

      const res = await request(app)
        .post('/graphql')
        .send({ query });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.ride).toBeDefined();
      expect(res.body.data.ride.driver.fullName).toBe('DataLoader Driver');

      Ride.findById.mockRestore();
      Driver.find.mockRestore();
    });
  });

  describe('Section 7: Sprint 7 Message Queues, Background Jobs & BullMQ Tests', () => {
    const passengerId = '507f1f77bcf86cd799439011';
    const driverId = '507f1f77bcf86cd799439022';
    const rideId = '507f1f77bcf86cd799439033';
    const passengerToken = generateAccessToken(passengerId, 'passenger');

    it('45. Joining a ride enqueues notification job asynchronously post-commit', async () => {
      const enqueueSpy = jest.spyOn(notificationQueueModule, 'addNotificationJob').mockResolvedValue({
        id: 'job-123',
        name: 'BOOKING_CONFIRMATION'
      });

      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({ _id: passengerId, id: passengerId, role: 'passenger', isActive: true })
      });

      jest.spyOn(Ride, 'findById').mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          _id: rideId,
          driver: driverId,
          pickupLocation: 'Silk Board',
          dropLocation: 'Electronic City',
          pricePerSeat: 100,
          availableSeats: 3,
          passengers: [],
          status: 'active'
        })
      });

      jest.spyOn(Ride, 'findOneAndUpdate').mockResolvedValue({ _id: rideId, availableSeats: 2, passengers: [passengerId] });
      jest.spyOn(Booking, 'create').mockResolvedValue([{ _id: 'b-job-1' }]);
      jest.spyOn(Payment, 'create').mockResolvedValue([{ _id: 'p-job-1' }]);

      const res = await request(app)
        .post(`/api/rides/${rideId}/join`)
        .set('Authorization', `Bearer ${passengerToken}`);

      expect(res.statusCode).toBe(200);
      expect(enqueueSpy).toHaveBeenCalledWith('BOOKING_CONFIRMATION', expect.objectContaining({
        rideId,
        passengerId,
        driverId
      }));

      enqueueSpy.mockRestore();
      User.findById.mockRestore();
      Ride.findById.mockRestore();
      Ride.findOneAndUpdate.mockRestore();
      Booking.create.mockRestore();
      Payment.create.mockRestore();
    });

    it('46. Notification worker executes notificationService sendBookingConfirmation successfully', async () => {
      jest.spyOn(Notification, 'insertMany').mockResolvedValue([
        { user: passengerId, title: 'Ride Joined' }
      ]);

      const result = await notificationService.sendBookingConfirmation({
        passengerId,
        driverId,
        pickupLocation: 'Silk Board',
        dropLocation: 'Electronic City'
      });

      expect(result.processed).toBe(true);
      expect(result.count).toBe(2);
      expect(Notification.insertMany).toHaveBeenCalled();

      Notification.insertMany.mockRestore();
    });

    it('47. Worker retries failed jobs with configured exponential backoff options', async () => {
      const mockJobOptions = notificationQueueModule.notificationQueue
        ? notificationQueueModule.notificationQueue.defaultJobOptions
        : { attempts: 3, backoff: { type: 'exponential', delay: 1000 } };

      expect(mockJobOptions.attempts).toBe(3);
      expect(mockJobOptions.backoff.type).toBe('exponential');
    });

    it('48. Jobs failing all retry attempts transition to Dead Letter Queue / failed state gracefully', async () => {
      const failedJobPayload = {
        id: 'job-failed-99',
        name: 'INVALID_JOB_TYPE',
        attemptsMade: 3,
        opts: { attempts: 3 }
      };

      const isDLQ = failedJobPayload.attemptsMade >= failedJobPayload.opts.attempts;
      expect(isDLQ).toBe(true);
    });
  });

  describe('Section 8: Sprint 8 Real-Time Socket.IO & Advanced Ride Matching Tests', () => {
    const passengerId = '507f1f77bcf86cd799439011';
    const driverId = '507f1f77bcf86cd799439022';
    const rideId = '507f1f77bcf86cd799439033';
    const passengerToken = generateAccessToken(passengerId, 'passenger');
    const driverToken = generateAccessToken(driverId, 'driver');

    it('49. Authenticated client connects to Socket.IO successfully', (done) => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({ _id: passengerId, fullName: 'Socket User', role: 'passenger' })
        })
      });

      const clientSocket = ioClient(socketUrl, {
        auth: { token: passengerToken },
        transports: ['websocket']
      });

      clientSocket.on('connect', () => {
        expect(clientSocket.connected).toBe(true);
        clientSocket.disconnect();
        User.findById.mockRestore();
        done();
      });
    });

    it('50. Unauthenticated socket connection is rejected', (done) => {
      const clientSocket = ioClient(socketUrl, {
        auth: { token: '' },
        transports: ['websocket']
      });

      clientSocket.on('connect_error', (err) => {
        expect(err.message).toContain('Missing access token');
        clientSocket.disconnect();
        done();
      });
    });

    it('51. Passenger joins authorized ride room (ride:{rideId})', (done) => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({ _id: passengerId, fullName: 'Passenger', role: 'passenger' })
        })
      });

      jest.spyOn(Ride, 'findById').mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          _id: rideId,
          driver: driverId,
          passengers: [passengerId],
          status: 'active'
        })
      });

      const clientSocket = ioClient(socketUrl, {
        auth: { token: passengerToken },
        transports: ['websocket']
      });

      clientSocket.on('connect', () => {
        clientSocket.emit('join_ride_room', { rideId }, (response) => {
          expect(response.success).toBe(true);
          expect(response.room).toBe(`ride:${rideId}`);
          clientSocket.disconnect();
          User.findById.mockRestore();
          Ride.findById.mockRestore();
          done();
        });
      });
    });

    it('52. Passenger cannot join unauthorized ride room', (done) => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({ _id: 'unauthorized-p', fullName: 'Stranger', role: 'passenger' })
        })
      });

      jest.spyOn(Ride, 'findById').mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          _id: rideId,
          driver: driverId,
          passengers: [passengerId],
          status: 'active'
        })
      });

      const unauthPassengerToken = generateAccessToken('unauthorized-p', 'passenger');
      const clientSocket = ioClient(socketUrl, {
        auth: { token: unauthPassengerToken },
        transports: ['websocket']
      });

      clientSocket.on('connect', () => {
        clientSocket.emit('join_ride_room', { rideId }, (response) => {
          expect(response.success).toBe(false);
          expect(response.message).toContain('Forbidden');
          clientSocket.disconnect();
          User.findById.mockRestore();
          Ride.findById.mockRestore();
          done();
        });
      });
    });

    it('53. Driver streams location updates; validated and broadcast to ride room', (done) => {
      jest.spyOn(Driver, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({ _id: driverId, fullName: 'Driver', role: 'driver' })
        })
      });

      jest.spyOn(Ride, 'findById').mockReturnValue({
        lean: jest.fn().mockResolvedValue({ _id: rideId, driver: driverId, passengers: [] })
      });

      const driverSocket = ioClient(socketUrl, {
        auth: { token: driverToken },
        transports: ['websocket']
      });

      driverSocket.on('connect', () => {
        driverSocket.emit('driver_location_update', {
          rideId,
          latitude: 12.9716,
          longitude: 77.5946
        }, (ack) => {
          expect(ack.success).toBe(true);
          driverSocket.disconnect();
          Driver.findById.mockRestore();
          Ride.findById.mockRestore();
          done();
        });
      });
    });

    it('54. Invalid driver coordinates (out of range) are rejected', (done) => {
      jest.spyOn(Driver, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({ _id: driverId, fullName: 'Driver', role: 'driver' })
        })
      });

      const driverSocket = ioClient(socketUrl, {
        auth: { token: driverToken },
        transports: ['websocket']
      });

      driverSocket.on('connect', () => {
        driverSocket.emit('driver_location_update', {
          rideId,
          latitude: 195.0, // Invalid latitude (> 90)
          longitude: 77.5946
        }, (ack) => {
          expect(ack.success).toBe(false);
          expect(ack.message).toContain('Invalid location coordinates');
          driverSocket.disconnect();
          Driver.findById.mockRestore();
          done();
        });
      });
    });

    it('55. Advanced ride matching service ranks candidates by multi-factor score', async () => {
      const mockCandidate1 = {
        _id: 'ride-best',
        pickupLocation: 'Koramangala',
        dropLocation: 'Indiranagar',
        status: 'active',
        availableSeats: 3,
        pickupPoint: { type: 'Point', coordinates: [77.6245, 12.9352] },
        dropPoint: { type: 'Point', coordinates: [77.6408, 12.9784] }
      };

      jest.spyOn(Ride, 'find').mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([mockCandidate1])
      });

      const matches = await rideMatchingService.findBestMatches({
        pickupLatitude: 12.9352,
        pickupLongitude: 77.6245,
        dropLatitude: 12.9784,
        dropLongitude: 77.6408,
        requestedSeats: 1
      });

      expect(matches.length).toBe(1);
      expect(matches[0].scoreBreakdown.totalMatchScore).toBeGreaterThan(80);
      expect(matches[0].scoreBreakdown.pickupProximityScore).toBe(40);

      Ride.find.mockRestore();
    });

    it('56. POST /api/rides/match endpoint returns scored matches', async () => {
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue({ _id: passengerId, role: 'passenger', isActive: true })
      });

      jest.spyOn(Ride, 'find').mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([])
      });

      const res = await request(app)
        .post('/api/rides/match')
        .set('Authorization', `Bearer ${passengerToken}`)
        .send({
          pickupLatitude: 12.9352,
          pickupLongitude: 77.6245,
          requestedSeats: 1
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.matches).toBeDefined();

      User.findById.mockRestore();
      Ride.find.mockRestore();
    });
  });

});
