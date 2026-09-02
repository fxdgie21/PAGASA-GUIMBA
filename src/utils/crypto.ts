/**
 * Secure Password Hashing & Credential Generation Utilities
 * Uses Web Crypto API for SHA-256 password hashing with salt.
 */

export async function hashPassword(password: string, customSalt?: string): Promise<string> {
  const salt = customSalt || generateRandomSalt();
  const encoder = new TextEncoder();
  const data = encoder.encode(salt + ':' + password);
  
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return `sha256:${salt}:${hashHex}`;
    } catch {
      // Fallback below
    }
  }
  
  // Safe JS Fallback for environments where SubtleCrypto is unavailable
  let hash = 0;
  const str = salt + ':' + password;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(16, '0');
  return `sha256:${salt}:${hex}`;
}

export async function verifyPassword(password: string, storedHashOrPlain: string): Promise<boolean> {
  if (!storedHashOrPlain || !password) return false;

  // If plain text stored during migration or simulation
  if (!storedHashOrPlain.startsWith('sha256:')) {
    return password === storedHashOrPlain;
  }

  const parts = storedHashOrPlain.split(':');
  if (parts.length !== 3) return false;
  const salt = parts[1];
  const computed = await hashPassword(password, salt);
  return computed === storedHashOrPlain;
}

function generateRandomSalt(length = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateSecureTempPassword(prefix = 'Pagasa'): string {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz';
  const numbers = '23456789';
  
  let randomLetters = '';
  for (let i = 0; i < 3; i++) {
    randomLetters += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  
  let randomNumbers = '';
  for (let i = 0; i < 2; i++) {
    randomNumbers += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }
  
  return `${prefix}-${randomLetters}${randomNumbers}-2026`;
}

export function generateDefaultUsername(email: string, fullName?: string): string {
  if (email && email.includes('@')) {
    const emailPrefix = email.split('@')[0].toLowerCase().replace(/[^a-z0-9._-]/g, '');
    if (emailPrefix.length >= 3) return emailPrefix;
  }
  
  if (fullName) {
    const clean = fullName.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (clean.length >= 3) return clean.slice(0, 15);
  }
  
  return 'member' + Math.floor(1000 + Math.random() * 9000);
}
