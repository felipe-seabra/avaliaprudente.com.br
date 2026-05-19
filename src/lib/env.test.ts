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
    process.env.NODE_ENV = 'production';
    delete process.env.NEXT_PHASE;
    delete process.env.NEXT_PUBLIC_APP_URL;

    // Supress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => validateEnv()).toThrow(/Environment validation failed/);
    
    consoleSpy.mockRestore();
  });
});
