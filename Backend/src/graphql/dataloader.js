const DataLoader = require('dataloader');
const Driver = require('../models/Driver');

/**
 * Creates DataLoader instances for batching and caching database lookups
 * to eliminate the N+1 query problem across nested GraphQL fields.
 */
const createDataLoaders = () => {
  return {
    // Batches multiple individual driver ID queries into a single Mongoose $in query
    driverLoader: new DataLoader(async (driverIds) => {
      const uniqueIds = [...new Set(driverIds.map((id) => id.toString()))];
      const drivers = await Driver.find({ _id: { $in: uniqueIds } })
        .select('fullName email phone vehicleName vehicleNumber isVerified verificationStatus')
        .lean();

      const driverMap = {};
      drivers.forEach((driver) => {
        driverMap[driver._id.toString()] = {
          id: driver._id.toString(),
          ...driver
        };
      });

      return driverIds.map((id) => driverMap[id.toString()] || null);
    })
  };
};

module.exports = createDataLoaders;
