import type { InstanceType } from '@expert-dollop/n8n-constants';
import { customAlphabet } from 'nanoid';

// Standard alphabet for n8n IDs
const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const nanoid = customAlphabet(ALPHABET, 16);

/**
 * Generate a unique nano ID
 */
export function generateNanoId() {
  return nanoid();
}

/**
 * Generate a host instance ID with instance type prefix
 */
export function generateHostInstanceId(instanceType: InstanceType) {
  return `${instanceType}-${nanoid()}`;
}
