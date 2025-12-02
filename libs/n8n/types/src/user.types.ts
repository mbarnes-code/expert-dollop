/**
 * User and authentication related types
 */

/**
 * User interface
 */
export interface IUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  disabled?: boolean;
  mfaEnabled?: boolean;
}

/**
 * Project sharing data
 */
export interface IProjectSharingData {
  id: string;
  name: string | null;
  icon: { type: 'emoji' | 'icon'; value: string } | null;
  type: 'personal' | 'team' | 'public';
  createdAt: string;
  updatedAt: string;
}

/**
 * Credentials interfaces
 */
export interface ICredentialsDecrypted<T extends object = ICredentialDataDecryptedObject> {
  id: string;
  name: string;
  type: string;
  data?: T;
  homeProject?: IProjectSharingData;
  sharedWithProjects?: IProjectSharingData[];
  isGlobal?: boolean;
}

export interface ICredentialsEncrypted {
  id?: string;
  name: string;
  type: string;
  data?: string;
}

export type CredentialInformation =
  | string
  | string[]
  | number
  | boolean
  | IDataObject
  | IDataObject[];

export interface ICredentialDataDecryptedObject {
  [key: string]: CredentialInformation;
}

// Re-import IDataObject for use in this file
import type { IDataObject } from './workflow.types';

/**
 * Role interfaces
 */
export interface IRole {
  id: string;
  name: string;
  slug: string;
  scope: 'global' | 'workflow' | 'credential' | 'project';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Auth result interfaces
 */
export interface IAuthResult {
  success: boolean;
  user?: IUser;
  token?: string;
  error?: string;
  requiresMfa?: boolean;
}

/**
 * Session data
 */
export interface ISessionData {
  userId: string;
  browserId?: string;
  usedMfa: boolean;
  issuedAt: number;
  expiresAt: number;
}
