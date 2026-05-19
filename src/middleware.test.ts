import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { middleware } from './middleware';
import * as middlewareSupabase from '@/lib/supabase/middleware';

vi.mock('@/lib/supabase/middleware', () => ({
  updateSession: vi.fn(),
}));

describe('Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createRequest = (pathname: string, ip = '127.0.0.1') => {
    const url = new URL(`http://localhost${pathname}`);
    const req = new NextRequest(url);
    req.headers.set('x-forwarded-for', ip);
    return req;
  };

  it('should redirect anonymous users away from /dashboard', async () => {
    const req = createRequest('/dashboard');
    vi.mocked(middlewareSupabase.updateSession).mockResolvedValue({
      supabaseResponse: NextResponse.next(),
      user: null,
      role: 'customer',
      isBlocked: false,
      isDeleted: false,
      accountStatus: 'active',
      suspendedUntil: null,
      termsVersion: '1.2',
    });

    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/login');
  });

  it('should redirect anonymous users away from /admin', async () => {
    const req = createRequest('/admin/dashboard');
    vi.mocked(middlewareSupabase.updateSession).mockResolvedValue({
      supabaseResponse: NextResponse.next(),
      user: null,
      role: 'customer',
      isBlocked: false,
      isDeleted: false,
      accountStatus: 'active',
      suspendedUntil: null,
      termsVersion: '1.2',
    });

    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/login');
  });

  it('should redirect non-admin users away from /admin', async () => {
    const req = createRequest('/admin/dashboard');
    vi.mocked(middlewareSupabase.updateSession).mockResolvedValue({
      supabaseResponse: NextResponse.next(),
      user: { id: '1' } as NonNullable<Awaited<ReturnType<typeof middlewareSupabase.updateSession>>['user']>,
      role: 'customer',
      isBlocked: false,
      isDeleted: false,
      accountStatus: 'active',
      suspendedUntil: null,
      termsVersion: '1.2',
    });

    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/dashboard');
  });

  it('should allow admin users to access /admin', async () => {
    const req = createRequest('/admin/dashboard');
    const mockRes = NextResponse.next();
    vi.mocked(middlewareSupabase.updateSession).mockResolvedValue({
      supabaseResponse: mockRes,
      user: { id: '1' } as NonNullable<Awaited<ReturnType<typeof middlewareSupabase.updateSession>>['user']>,
      role: 'admin',
      isBlocked: false,
      isDeleted: false,
      accountStatus: 'active',
      suspendedUntil: null,
      termsVersion: '1.2',
    });

    const res = await middleware(req);
    expect(res).toBe(mockRes); // Returns the unmodified response
  });

  it('should redirect suspended users to /blocked?type=suspended', async () => {
    const req = createRequest('/dashboard');
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1); // tomorrow
    vi.mocked(middlewareSupabase.updateSession).mockResolvedValue({
      supabaseResponse: NextResponse.next(),
      user: { id: '1' } as NonNullable<Awaited<ReturnType<typeof middlewareSupabase.updateSession>>['user']>,
      role: 'customer',
      isBlocked: false,
      isDeleted: false,
      accountStatus: 'suspended',
      suspendedUntil: futureDate.toISOString(),
      termsVersion: '1.2',
    });

    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/blocked?type=suspended');
  });

  it('should not redirect admin users to /blocked, even if their account status is blocked (admin master bypass)', async () => {
    const req = createRequest('/admin/dashboard');
    const mockRes = NextResponse.next();
    vi.mocked(middlewareSupabase.updateSession).mockResolvedValue({
      supabaseResponse: mockRes,
      user: { id: '1' } as NonNullable<Awaited<ReturnType<typeof middlewareSupabase.updateSession>>['user']>,
      role: 'admin',
      isBlocked: true, // Should be ignored
      isDeleted: false,
      accountStatus: 'banned', // Should be ignored
      suspendedUntil: null,
      termsVersion: '1.2', // outdated terms should be ignored
    });

    const res = await middleware(req);
    expect(res).toBe(mockRes);
  });

  it('should redirect users with old terms to /terms-reaccept', async () => {
    const req = createRequest('/dashboard');
    vi.mocked(middlewareSupabase.updateSession).mockResolvedValue({
      supabaseResponse: NextResponse.next(),
      user: { id: '1' } as NonNullable<Awaited<ReturnType<typeof middlewareSupabase.updateSession>>['user']>,
      role: 'customer',
      isBlocked: false,
      isDeleted: false,
      accountStatus: 'active',
      suspendedUntil: null,
      termsVersion: '1.0', // Old terms
    });

    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/terms-reaccept');
  });
});
