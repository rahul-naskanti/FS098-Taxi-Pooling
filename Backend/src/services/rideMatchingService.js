const Ride = require('../models/Ride');

// Helper to compute Haversine distance in kilometers
function calculateHaversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6378.1;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

class RideMatchingService {
  /**
   * Transparent multi-factor ride matching algorithm
   */
  async findBestMatches({
    pickupLatitude,
    pickupLongitude,
    dropLatitude,
    dropLongitude,
    departureDate,
    requestedSeats = 1,
    maxRadiusKm = 20,
    limit = 5
  }) {
    const pickupLat = Number(pickupLatitude);
    const pickupLng = Number(pickupLongitude);
    const dropLat = dropLatitude !== undefined ? Number(dropLatitude) : null;
    const dropLng = dropLongitude !== undefined ? Number(dropLongitude) : null;
    const seatsReq = Number(requestedSeats);

    // Phase 1: Candidate Filtering via MongoDB geospatial index & status filters
    const candidates = await Ride.find({
      status: 'active',
      availableSeats: { $gte: seatsReq },
      ...(departureDate && { departureDate }),
      pickupPoint: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [pickupLng, pickupLat]
          },
          $maxDistance: maxRadiusKm * 1000
        }
      }
    })
    .populate('driver', 'fullName email phone vehicleName vehicleNumber isVerified verificationStatus')
    .lean();

    // Phase 2: Multi-Factor Scoring
    const scoredMatches = candidates.map((ride) => {
      let pickupDistanceKm = null;
      let pickupScore = 0;

      if (ride.pickupPoint && ride.pickupPoint.coordinates) {
        const [rLng, rLat] = ride.pickupPoint.coordinates;
        pickupDistanceKm = calculateHaversineDistanceKm(pickupLat, pickupLng, rLat, rLng);
        // Proximity score (0 to 40 points): 40 points for 0km, decreasing linearly to 0 points at maxRadiusKm
        pickupScore = Math.max(0, 40 * (1 - pickupDistanceKm / maxRadiusKm));
      }

      let dropDistanceKm = null;
      let dropScore = 0;
      if (dropLat !== null && dropLng !== null && ride.dropPoint && ride.dropPoint.coordinates) {
        const [rDropLng, rDropLat] = ride.dropPoint.coordinates;
        dropDistanceKm = calculateHaversineDistanceKm(dropLat, dropLng, rDropLat, rDropLng);
        // Route/Destination compatibility score (0 to 30 points)
        dropScore = Math.max(0, 30 * (1 - dropDistanceKm / maxRadiusKm));
      } else {
        dropScore = 20; // Default baseline if destination coordinates are unprovided
      }

      // Seat availability bonus (0 to 15 points)
      const seatScore = ride.availableSeats >= seatsReq ? Math.min(15, 10 + (ride.availableSeats - seatsReq)) : 0;

      // Time & Status compatibility score (15 points)
      const timeScore = 15;

      const totalMatchScore = Number((pickupScore + dropScore + seatScore + timeScore).toFixed(1));

      return {
        ride,
        pickupDistanceKm,
        dropDistanceKm,
        scoreBreakdown: {
          pickupProximityScore: Number(pickupScore.toFixed(1)),
          destinationCompatibilityScore: Number(dropScore.toFixed(1)),
          seatAvailabilityScore: Number(seatScore.toFixed(1)),
          timeCompatibilityScore: timeScore,
          totalMatchScore
        }
      };
    });

    // Phase 3: Sort candidates by totalMatchScore in descending order
    scoredMatches.sort((a, b) => b.scoreBreakdown.totalMatchScore - a.scoreBreakdown.totalMatchScore);

    return scoredMatches.slice(0, limit);
  }
}

module.exports = new RideMatchingService();
