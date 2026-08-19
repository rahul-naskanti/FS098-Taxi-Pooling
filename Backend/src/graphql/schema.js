const { buildSchema } = require('graphql');

const schema = buildSchema(`
  type User {
    id: ID!
    fullName: String!
    email: String!
    phone: String!
    role: String!
  }

  type Driver {
    id: ID!
    fullName: String!
    email: String!
    phone: String!
    vehicleName: String!
    vehicleNumber: String!
    isVerified: Boolean!
    verificationStatus: String
  }

  type Ride {
    id: ID!
    pickupLocation: String!
    dropLocation: String!
    departureDate: String!
    departureTime: String!
    availableSeats: Int!
    pricePerSeat: Float!
    vehicleType: String!
    notes: String
    status: String!
    driver: Driver
  }

  type JoinRideResponse {
    success: Boolean!
    message: String!
    ride: Ride
  }

  type Query {
    me: User
    ride(id: ID!): Ride
    rides: [Ride!]!
  }

  type Mutation {
    createRide(pickupLocation: String!, dropLocation: String!, departureDate: String!, departureTime: String!, availableSeats: Int!, pricePerSeat: Float!, vehicleType: String!, notes: String): Ride!
    joinRide(rideId: ID!): JoinRideResponse!
    cancelRide(rideId: ID!): Ride!
  }
`);

module.exports = schema;
