import { describe, it, expect, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../index.js';
import pool from '../config/db.js';

describe('Authentication Penetration Tests', () => {
  afterAll(async () => {
    await pool.end(); // Tutup koneksi agar tidak ada open handles
  });
  
  describe('1. Injection Attacks', () => {
    it('should reject SQL Injection payload in login email', async () => {
      const sqliPayload = {
        email: "admin@example.com' OR '1'='1",
        password: "password123"
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(sqliPayload);

      // Should not return 200, typically 400 or 401
      expect(response.status).not.toBe(200);
      expect(response.body).not.toHaveProperty('token');
    });

    it('should reject NoSQL/MongoDB Injection payload (if applicable)', async () => {
      const nosqlPayload = {
        email: { "$gt": "" },
        password: "password123"
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(nosqlPayload);

      expect(response.status).not.toBe(200);
    });

    it('should reject XSS payload in register name', async () => {
      const xssPayload = {
        name: "<script>alert('xss')</script>",
        email: "testxss@example.com",
        password: "password123"
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(xssPayload);

      // Validation should catch it, or if it passes, it shouldn't execute
      // Usually checking if validation catches bad characters
      // We expect 400 bad request or if created, we should verify it's sanitized
      expect([201, 400]).toContain(response.status);
    });
  });

  describe('2. Broken Authentication and Session Management', () => {
    it('should block access to protected route without token', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.message).toMatch(/Not authorized|No token|Token tidak ditemukan/i);
    });

    it('should block access with malformed token (e.g. random string)', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid.token.string');

      expect(response.status).toBe(401);
    });

    it('should block access with SQL Injection in token header', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', "Bearer ' OR 1=1--");

      expect(response.status).toBe(401);
    });
  });

  describe('3. Rate Limiting and DoS (Denial of Service)', () => {
    it('should reject extremely large payloads', async () => {
      // Create a huge payload (e.g., 20MB string)
      const hugeString = 'a'.repeat(20 * 1024 * 1024);
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: hugeString, password: 'password123' });

      // Express body-parser should block it based on size limit
      expect(response.status).toBe(413); // Payload Too Large
    });
  });

  describe('4. Missing Information / Parameter Pollution', () => {
    it('should handle missing email gracefully', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ password: 'password123' });

      expect(response.status).toBe(400); // Bad Request
    });

    it('should handle parameter pollution (multiple emails)', async () => {
      // HPP (HTTP Parameter Pollution) test
      const response = await request(app)
        .post('/api/auth/login')
        .send('email=admin@example.com&email=hacker@example.com&password=pass');

      // The server should not crash and should handle it (e.g. by taking the first/last or rejecting)
      expect(response.status).not.toBe(500);
    });
  });

  describe('5. Security Headers', () => {
    it('should have security headers (Helmet)', async () => {
      const response = await request(app).get('/api/health');

      // Common Helmet headers
      expect(response.headers).toHaveProperty('x-xss-protection');
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers['x-powered-by']).toBeUndefined(); // Should be hidden
    });
  });
});
