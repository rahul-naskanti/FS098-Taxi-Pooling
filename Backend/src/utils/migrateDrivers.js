const mongoose = require('mongoose');
const User = require('../models/User');
const Driver = require('../models/Driver');

const migrateDrivers = async () => {
  try {
    console.log('🔄 Checking for legacy driver accounts in users collection...');
    
    // Find all users who are registered as drivers in the users collection
    // Wait, since we updated User schema, the role enum doesn't include 'driver' anymore,
    // but mongoose will still retrieve records that already exist in MongoDB with role: 'driver'!
    const legacyDrivers = await mongoose.model('User').find({ role: 'driver' });
    
    if (legacyDrivers.length === 0) {
      console.log('✅ No legacy driver accounts found in users collection.');
      return;
    }

    console.log(`📦 Found ${legacyDrivers.length} legacy drivers. Starting migration...`);
    let migratedCount = 0;
    let deletedCount = 0;

    for (const legacy of legacyDrivers) {
      // Check if email already exists in Driver collection to avoid duplicate insertions
      const driverExists = await Driver.findOne({ email: legacy.email });
      
      let driverId;
      if (!driverExists) {
        // Create new Driver document copying all fields
        const newDriver = await Driver.create({
          fullName: legacy.fullName,
          email: legacy.email,
          phone: legacy.phone,
          password: legacy.password, // Keep the hashed password
          vehicleName: legacy.get('vehicleName') || 'Sedan',
          vehicleNumber: legacy.get('vehicleNumber') || 'N/A',
          licenseNumber: legacy.get('licenseNumber') || 'N/A',
          availableSeats: legacy.get('availableSeats') || 4,
          company: legacy.company || '',
          sosContact: legacy.sosContact || '',
          verificationStatus: legacy.get('verificationStatus') || 'pending',
          rejectionReason: legacy.get('rejectionReason') || '',
          isVerified: legacy.get('isVerified') || false,
          isActive: legacy.isActive !== undefined ? legacy.isActive : true,
          uploadedDocuments: legacy.get('uploadedDocuments') || { licenseImage: '', rcDocument: '', idProof: '' },
          createdAt: legacy.createdAt,
          updatedAt: legacy.updatedAt
        });
        
        driverId = newDriver._id;
        migratedCount++;
        console.log(`✅ Migrated driver: ${legacy.fullName} (${legacy.email})`);
      } else {
        driverId = driverExists._id;
        console.log(`ℹ️ Driver ${legacy.fullName} (${legacy.email}) already exists in drivers collection.`);
      }

      // Clean up users collection
      await User.deleteOne({ _id: legacy._id });
      deletedCount++;
      console.log(`🗑️ Removed legacy driver from users collection: ${legacy.fullName}`);
    }

    console.log(`🎉 Migration completed. Migrated: ${migratedCount}, Cleaned up users: ${deletedCount}`);
  } catch (error) {
    console.error('❌ Error during driver migration:', error);
  }
};

module.exports = migrateDrivers;
