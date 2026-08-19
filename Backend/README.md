# 🚕 Taxi Pooling Backend — Architecture & API Documentation

## Sprint 1: Backend Architecture & Testing Foundation

This directory contains the Express.js / Node.js backend server for the FS098 Taxi Pooling Platform.

### 📐 Layered Architecture Overview
The application follows a clean 4-tier request lifecycle:
`Client` ➔ `App (Global Middlewares)` ➔ `Route (Route Middlewares)` ➔ `Controller` ➔ `Service` ➔ `Model` ➔ `Database`

- **`app.js`**: Declares Express application, mounts security/performance middlewares, API routes, and central error handlers. Exported for supertest integration testing.
- **`server.js`**: Handles environment configuration, database connection (`connectDB`), Redis initialization (`initRedis`), and starts the HTTP server listening on `PORT`.
- **`services/`**: Encapsulates core domain business logic, atomic updates, and database access (`rideService.js`).
- **`controllers/`**: Handles HTTP request parsing, calls domain services, and returns formatted JSON responses.
- **`middleware/`**:
  - `validateMiddleware.js`: Early request payload validation.
  - `authMiddleware.js`: JWT token verification and Role-Based Access Control.
  - `errorHandler.js`: Central operational and unexpected error formatting.
- **`utils/AppError.js`**: Custom operational error class with explicit HTTP status codes.

---

### 🧪 Running Automated Tests
The backend includes an automated API integration test suite built with **Jest** and **Supertest**.

```bash
# Run backend test suite
npm test
```
