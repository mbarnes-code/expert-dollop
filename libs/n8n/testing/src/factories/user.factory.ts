/**
 * User Factory for creating test users
 * Used across cross-module integration tests
 */

import { generateNanoId } from '@expert-dollop/n8n-db';

export interface IUser {
  id?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  role?: 'global:owner' | 'global:admin' | 'global:member';
  disabled?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class UserFactory {
  /**
   * Create a basic test user
   */
  static create(overrides?: Partial<IUser>): IUser {
    const id = overrides?.id || generateNanoId();
    return {
      id,
      email: overrides?.email || `user${id.substring(0, 8)}@test.com`,
      firstName: overrides?.firstName || 'Test',
      lastName: overrides?.lastName || 'User',
      password: overrides?.password || 'hashedPassword123',
      role: overrides?.role || 'global:member',
      disabled: overrides?.disabled ?? false,
      createdAt: overrides?.createdAt || new Date(),
      updatedAt: overrides?.updatedAt || new Date()
    };
  }

  /**
   * Create an owner user
   */
  static createOwner(overrides?: Partial<IUser>): IUser {
    return this.create({ ...overrides, role: 'global:owner' });
  }

  /**
   * Create an admin user
   */
  static createAdmin(overrides?: Partial<IUser>): IUser {
    return this.create({ ...overrides, role: 'global:admin' });
  }

  /**
   * Create a member user
   */
  static createMember(overrides?: Partial<IUser>): IUser {
    return this.create({ ...overrides, role: 'global:member' });
  }

  /**
   * Create multiple test users
   */
  static createMany(count: number, overrides?: Partial<IUser>): IUser[] {
    return Array.from({ length: count }, (_, i) =>
      this.create({ ...overrides, email: `user${i}@test.com` })
    );
  }
}
