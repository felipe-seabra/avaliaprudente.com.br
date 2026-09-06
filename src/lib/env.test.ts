import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { validateEnv } from './env';

describe('env validation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should not throw during build phase', () => {
    process.env.NEXT_PHASE = 'phase-production-build';
    expect(() => validateEnv()).not.toThrow();
  });

  it('should throw if required env vars are missing in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    delete process.env.NEXT_PHASE;
    delete process.env.NEXT_PUBLIC_APP_URL;

    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => validateEnv()).toThrow(/Environment validation failed/);
    
    consoleSpy.mockRestore();
  });

  it('SEC-08: should throw in production if SUDO_SECRET is missing or less than 32 chars', () => {
    vi.stubEnv('NODE_ENV', 'production');
    delete process.env.NEXT_PHASE;
    process.env.NEXT_PUBLIC_APP_URL = 'https://www.avaliaprudente.com.br';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';
    process.env.FINGERPRINT_PEPPER = 'a'.repeat(32);
    delete process.env.SUDO_SECRET;

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => validateEnv()).toThrow(/SUDO_SECRET/);

    // Test with less than 32 chars
    process.env.SUDO_SECRET = 'short-secret';
    expect(() => validateEnv()).toThrow(/SUDO_SECRET/);
    consoleSpy.mockRestore();
  });

  it('SEC-09: should throw in production if FINGERPRINT_PEPPER is missing or less than 32 chars', () => {
    vi.stubEnv('NODE_ENV', 'production');
    delete process.env.NEXT_PHASE;
    process.env.NEXT_PUBLIC_APP_URL = 'https://www.avaliaprudente.com.br';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';
    process.env.SUDO_SECRET = 's'.repeat(32);
    delete process.env.FINGERPRINT_PEPPER;

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => validateEnv()).toThrow(/FINGERPRINT_PEPPER/);

    // Test with less than 32 chars
    process.env.FINGERPRINT_PEPPER = 'short-pepper';
    expect(() => validateEnv()).toThrow(/FINGERPRINT_PEPPER/);
    consoleSpy.mockRestore();
  });

  it('should validate successfully in production when all secrets are properly configured', () => {
    vi.stubEnv('NODE_ENV', 'production');
    delete process.env.NEXT_PHASE;
    process.env.NEXT_PUBLIC_APP_URL = 'https://www.avaliaprudente.com.br';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';
    process.env.SUDO_SECRET = 's'.repeat(32);
    process.env.FINGERPRINT_PEPPER = 'p'.repeat(32);

    expect(() => validateEnv()).not.toThrow();
  });
});
