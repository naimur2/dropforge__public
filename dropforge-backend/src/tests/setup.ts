process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/dropforge_test';
process.env.JWT_SECRET = 'super-secret-jwt-key-that-is-at-least-32-chars';
process.env.JWT_REFRESH_SECRET = 'super-secret-jwt-refresh-key-that-is-at-least-32-chars';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.CLIENT_URL = 'http://localhost:3000';
