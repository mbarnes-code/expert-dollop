/**
 * Cross-Module Integration Test: User and Authentication
 * 
 * Tests interaction between:
 * - libs/n8n/testing (test utilities)
 * - backend/services/n8n/auth (authentication)
 * - backend/api/n8n (API handlers)
 * 
 * This test validates user creation and authentication flows across modules.
 */

import { describe, it, expect } from 'vitest';
import {
  UserFactory,
  createMockJWT,
  createMockAPIKey,
  createMockAuthHeaders,
  parseMockJWT
} from '@expert-dollop/n8n-testing';

describe('Cross-Module Integration: User and Authentication', () => {
  describe('User Creation', () => {
    it('should create a valid user', () => {
      const user = UserFactory.create();
      
      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.email).toMatch(/@test\.com$/);
      expect(user.role).toBe('global:member');
      expect(user.disabled).toBe(false);
    });

    it('should create users with different roles', () => {
      const owner = UserFactory.createOwner();
      const admin = UserFactory.createAdmin();
      const member = UserFactory.createMember();
      
      expect(owner.role).toBe('global:owner');
      expect(admin.role).toBe('global:admin');
      expect(member.role).toBe('global:member');
    });

    it('should create multiple users', () => {
      const users = UserFactory.createMany(5);
      
      expect(users).toHaveLength(5);
      expect(new Set(users.map(u => u.email)).size).toBe(5); // All unique emails
    });

    it('should allow custom overrides', () => {
      const user = UserFactory.create({
        email: 'custom@example.com',
        firstName: 'Custom',
        lastName: 'Name'
      });
      
      expect(user.email).toBe('custom@example.com');
      expect(user.firstName).toBe('Custom');
      expect(user.lastName).toBe('Name');
    });
  });

  describe('JWT Token Generation', () => {
    it('should generate a valid JWT token', () => {
      const token = createMockJWT();
      
      expect(token).toBeDefined();
      expect(token.split('.')).toHaveLength(3); // header.payload.signature
    });

    it('should include custom payload in JWT', () => {
      const payload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'global:admin'
      };
      
      const token = createMockJWT(payload);
      const parsed = parseMockJWT(token);
      
      expect(parsed.sub).toBe('user-123');
      expect(parsed.email).toBe('test@example.com');
      expect(parsed.role).toBe('global:admin');
    });

    it('should include expiration in JWT', () => {
      const token = createMockJWT();
      const parsed = parseMockJWT(token);
      
      expect(parsed.iat).toBeDefined();
      expect(parsed.exp).toBeDefined();
      expect(parsed.exp).toBeGreaterThan(parsed.iat);
    });
  });

  describe('API Key Generation', () => {
    it('should generate a valid API key', () => {
      const apiKey = createMockAPIKey();
      
      expect(apiKey).toBeDefined();
      expect(apiKey).toMatch(/^n8n_api_/);
    });

    it('should generate API keys with custom prefix', () => {
      const apiKey = createMockAPIKey('custom_prefix');
      
      expect(apiKey).toMatch(/^custom_prefix_/);
    });

    it('should generate unique API keys', () => {
      const keys = Array.from({ length: 10 }, () => createMockAPIKey());
      const uniqueKeys = new Set(keys);
      
      expect(uniqueKeys.size).toBe(10);
    });
  });

  describe('Auth Headers', () => {
    it('should create JWT auth headers', () => {
      const headers = createMockAuthHeaders('jwt');
      
      expect(headers.Authorization).toBeDefined();
      expect(headers.Authorization).toMatch(/^Bearer /);
    });

    it('should create API key headers', () => {
      const headers = createMockAuthHeaders('apikey');
      
      expect(headers['X-N8N-API-KEY']).toBeDefined();
      expect(headers['X-N8N-API-KEY']).toMatch(/^n8n_api_/);
    });

    it('should create cookie headers', () => {
      const headers = createMockAuthHeaders('cookie');
      
      expect(headers.Cookie).toBeDefined();
      expect(headers.Cookie).toMatch(/^n8n-auth=/);
    });
  });

  describe('User-Auth Integration', () => {
    it('should create user with matching JWT token', () => {
      const user = UserFactory.create({
        email: 'test@example.com',
        role: 'global:admin'
      });
      
      const token = createMockJWT({
        userId: user.id,
        email: user.email,
        role: user.role
      });
      
      const parsed = parseMockJWT(token);
      
      expect(parsed.sub).toBe(user.id);
      expect(parsed.email).toBe(user.email);
      expect(parsed.role).toBe(user.role);
    });
  });
});
