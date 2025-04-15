const request = require('supertest');
const express = require('express');
const knex = require('../../config/db');
const redis = require('../../config/redis');
const app = require('../../app'); // Assuming your Express app
const authRoutes = require('../../routes/authRoutes'); // Adjust based on your routes
require('dotenv').config({ path: '.env.test' });

app.use(express.json());
app.use('/auth', authRoutes);

// Mocking
jest.mock('../../config/db.js');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../../config/redis', () => ({
    get: jest.fn(),
    setex: jest.fn(),
    del: jest.fn(),
    incr: jest.fn(),
    expire: jest.fn(),
    multi: jest.fn(() => ({
        incr: jest.fn().mockReturnThis(),
        expire: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([null, null])
    })),
}));

// Helper
const mockUser = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedPassword',
    role: 'user'
};

const phone = '9999999999';
const validOtp = '123456';

describe('POST /auth/verify-otp', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return 401 if OTP is incorrect', async () => {
        redis.get.mockImplementation((key) => {
            if (key === `otp:${phone}`) return Promise.resolve(validOtp);
            if (key === `otp:attempts:${phone}`) return Promise.resolve('2');
            return Promise.resolve(null);
        });

        const res = await request(app).post('/api/v1/auth/verify-otp').send({
            phone,
            otp: '000000'
        });

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe('Invalid or expired OTP');
        expect(redis.multi).toHaveBeenCalled();
    });

    it('should block OTP verification after exceeding max attempts', async () => {
        redis.get.mockImplementation((key) => {
            if (key === `otp:attempts:${phone}`) return Promise.resolve('5');
            return Promise.resolve(null);
        });

        const res = await request(app).post('/api/v1/auth/verify-otp').send({
            phone,
            otp: '000000'
        });

        expect(res.statusCode).toBe(429);
        expect(res.body.message).toBe('Too many failed attempts. Please try again later.');
    });

    it('should verify OTP and return token', async () => {
        redis.get.mockImplementation((key) => {
            if (key === `otp:${phone}`) return Promise.resolve(validOtp);
            if (key === `otp:attempts:${phone}`) return Promise.resolve('0');
            return Promise.resolve(null);
        });

        redis.del.mockResolvedValue(1);

        knex.mockReturnValueOnce({
            where: () => ({
                first: jest.fn().mockResolvedValueOnce({ id: 1, phone, role: 'user' })
            })
        });

        const res = await request(app).post('/api/v1/auth/verify-otp').send({
            phone,
            otp: validOtp
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('OTP verified');
    });
});
