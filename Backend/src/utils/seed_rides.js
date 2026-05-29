const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = 'mongodb+srv://naskantirahul17_db_user:xuzN0Fmo5ZAEh8FQ@taxi-pooling-cluster.zalna6d.mongodb.net/taxi-pooling?retryWrites=true&w=majority&appName=taxi-pooling-cluster';

const getTomorrowDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

const run = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    // Clear existing rides and drivers
    await mongoose.connection.db.collection('rides').deleteMany({});
    await mongoose.connection.db.collection('drivers').deleteMany({});
    console.log('Cleared existing rides and drivers.');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Password@123', salt);

    // Create 3 mock drivers
    const drivers = [
      {
        fullName: 'Rahul Kumar',
        email: 'rahul.driver@taxipool.com',
        phone: '9988776655',
        password: hashedPassword,
        vehicleName: 'Hyundai Creta',
        vehicleNumber: 'TS 09 EX 1234',
        licenseNumber: 'DL-1234567890123',
        availableSeats: 4,
        company: 'TaxiPool Tech',
        sosContact: '100',
        verificationStatus: 'verified',
        isVerified: true,
        isActive: true,
        role: 'driver',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        fullName: 'Sneha Reddy',
        email: 'sneha.driver@taxipool.com',
        phone: '9988776644',
        password: hashedPassword,
        vehicleName: 'Honda City',
        vehicleNumber: 'AP 28 BC 5678',
        licenseNumber: 'AP-1234567890124',
        availableSeats: 3,
        company: 'Capgemini',
        sosContact: '100',
        verificationStatus: 'verified',
        isVerified: true,
        isActive: true,
        role: 'driver',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        fullName: 'Amit Sharma',
        email: 'amit.driver@taxipool.com',
        phone: '9988776633',
        password: hashedPassword,
        vehicleName: 'Maruti Swift',
        vehicleNumber: 'TS 07 ED 9012',
        licenseNumber: 'DL-1234567890125',
        availableSeats: 2,
        company: 'Infosys',
        sosContact: '100',
        verificationStatus: 'pending',
        isVerified: false,
        isActive: true,
        role: 'driver',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const driverResult = await mongoose.connection.db.collection('drivers').insertMany(drivers);
    console.log('Inserted mock drivers:', driverResult.insertedCount);

    const rahulId = driverResult.insertedIds[0];
    const snehaId = driverResult.insertedIds[1];
    const amitId = driverResult.insertedIds[2];

    const tomorrow = getTomorrowDate();

    // Create mock rides
    const rides = [
      {
        driver: rahulId,
        pickupLocation: 'Ameerpet',
        dropLocation: 'Hitech City',
        departureDate: tomorrow,
        departureTime: '09:00 AM',
        availableSeats: 4,
        remainingSeats: 4,
        pricePerSeat: 120,
        farePerSeat: 120,
        vehicleType: 'SUV',
        vehicleNumber: 'TS 09 EX 1234',
        driverRating: 4.8,
        rideDistance: 12,
        rideDuration: 0.5,
        instantBooking: true,
        femaleFriendly: false,
        isVerifiedDriver: true,
        acService: true,
        notes: 'Commute to office. AC on. Instant confirmation.',
        status: 'active',
        passengers: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        driver: snehaId,
        pickupLocation: 'Secunderabad',
        dropLocation: 'Gachibowli',
        departureDate: tomorrow,
        departureTime: '08:30 AM',
        availableSeats: 3,
        remainingSeats: 3,
        pricePerSeat: 180,
        farePerSeat: 180,
        vehicleType: 'Sedan',
        vehicleNumber: 'AP 28 BC 5678',
        driverRating: 4.9,
        rideDistance: 28,
        rideDuration: 1.2,
        instantBooking: false,
        femaleFriendly: true,
        isVerifiedDriver: true,
        acService: true,
        notes: 'Co-workers pool. Female-friendly environment.',
        status: 'active',
        passengers: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        driver: amitId,
        pickupLocation: 'Kukatpally',
        dropLocation: 'Madhapur',
        departureDate: tomorrow,
        departureTime: '10:15 AM',
        availableSeats: 2,
        remainingSeats: 2,
        pricePerSeat: 90,
        farePerSeat: 90,
        vehicleType: 'Hatchback',
        vehicleNumber: 'TS 07 ED 9012',
        driverRating: 3.8,
        rideDistance: 9,
        rideDuration: 0.4,
        instantBooking: true,
        femaleFriendly: false,
        isVerifiedDriver: false,
        acService: false,
        notes: 'Budget pool. Windows down pool.',
        status: 'active',
        passengers: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        driver: rahulId,
        pickupLocation: 'Ameerpet',
        dropLocation: 'Gachibowli',
        departureDate: tomorrow,
        departureTime: '06:15 PM',
        availableSeats: 5,
        remainingSeats: 5,
        pricePerSeat: 150,
        farePerSeat: 150,
        vehicleType: 'SUV',
        vehicleNumber: 'TS 09 EX 1234',
        driverRating: 4.8,
        rideDistance: 18,
        rideDuration: 0.8,
        instantBooking: true,
        femaleFriendly: true,
        isVerifiedDriver: true,
        acService: true,
        notes: 'Return commute. Female friendly seats available.',
        status: 'active',
        passengers: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        driver: snehaId,
        pickupLocation: 'Hitech City',
        dropLocation: 'Secunderabad',
        departureDate: tomorrow,
        departureTime: '05:30 PM',
        availableSeats: 4,
        remainingSeats: 4,
        pricePerSeat: 200,
        farePerSeat: 200,
        vehicleType: 'Sedan',
        vehicleNumber: 'AP 28 BC 5678',
        driverRating: 4.9,
        rideDistance: 26,
        rideDuration: 1.1,
        instantBooking: false,
        femaleFriendly: false,
        isVerifiedDriver: true,
        acService: true,
        notes: 'Evening return pool to Secunderabad.',
        status: 'active',
        passengers: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        driver: amitId,
        pickupLocation: 'Ameerpet',
        dropLocation: 'Hitech City',
        departureDate: tomorrow,
        departureTime: '11:30 PM',
        availableSeats: 3,
        remainingSeats: 3,
        pricePerSeat: 80,
        farePerSeat: 80,
        vehicleType: 'Hatchback',
        vehicleNumber: 'TS 07 ED 9012',
        driverRating: 3.5,
        rideDistance: 12,
        rideDuration: 0.5,
        instantBooking: false,
        femaleFriendly: false,
        isVerifiedDriver: false,
        acService: false,
        notes: 'Late night budget ride.',
        status: 'active',
        passengers: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const rideResult = await mongoose.connection.db.collection('rides').insertMany(rides);
    console.log('Inserted mock rides:', rideResult.insertedCount);

    process.exit(0);
  } catch (err) {
    console.error('Error seeding:', err);
    process.exit(1);
  }
};

run();
