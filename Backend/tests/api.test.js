const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Driver = require('../src/models/Driver');
const Ride = require('../src/models/Ride');
const { generateAccessToken, generateRefreshToken } = require('../src/utils/generateToken');
const jwt = require('jsonwebtoken');

describe('Sprint 2: Authentication & Security Hardening Test Suite', () => {

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });

  // 1. Registration succeeds with valid data
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
    expect(res.headers['set-cookie']).toBeDefined(); // Verifies HTTP-Only refreshToken cookie set

    User.findOne.mockRestore();
    Driver.findOne.mockRestore();
    User.create.mockRestore();
  });

  // 2. Registration rejects invalid data
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
  });

  // 3. Login succeeds with valid credentials
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

  // 4. Login rejects invalid credentials
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

  // 5. Protected route rejects unauthenticated request
  it('5. Protected route rejects unauthenticated request', async () => {
    const res = await request(app).get('/api/rides');
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  // 6. Valid access token allows request
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

  // 7. Invalid access token rejects request
  it('7. Invalid access token rejects request', async () => {
    const res = await request(app)
      .get('/api/rides')
      .set('Authorization', 'Bearer invalid.jwt.token');

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  // 8. Expired access token rejects request
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

  // 9. Refresh token creates a new access token
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

  // 10. Invalid refresh token is rejected
  it('10. Invalid refresh token is rejected', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', ['refreshToken=invalid.refresh.token']);

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  // 11. Logout clears authentication state
  it('11. Logout clears/invalidates authentication state', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.headers['set-cookie'][0]).toContain('refreshToken=;'); // Verifies cookie clearing
  });

  // 12. Unverified driver cannot create ride
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

  // 13. Verified driver can create ride
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

  // 14. Passenger cannot access driver-only endpoint
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

  // 15. Driver cannot access admin-only endpoint
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

  // 16. Normal user cannot access admin endpoint
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

  // 17. IDOR attempt is rejected
  it('17. IDOR attempt is rejected when user accesses another user resource', async () => {
    const passengerToken = generateAccessToken('passenger-111', 'passenger');
    jest.spyOn(User, 'findById').mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: 'passenger-111',
        role: 'passenger',
        isActive: true
      })
    });

    // Requesting passenger-222's resource using passenger-111's token
    const res = await request(app)
      .get('/api/users/passenger-222')
      .set('Authorization', `Bearer ${passengerToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('do not have permission');

    User.findById.mockRestore();
  });

});
