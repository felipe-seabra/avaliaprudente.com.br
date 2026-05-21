import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockSupabase, mockCreateClient } = vi.hoisted(() => {
  const mockSupabase = {
    auth: {
      exchangeCodeForSession: vi.fn(),
    },
  }

  return {
    mockSupabase,
    mockCreateClient: vi.fn(),
  }
})

vi.mock('@/lib/supabase/server', () => ({
  createClient: mockCreateClient,
}))

describe('auth callback redirects', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateClient.mockResolvedValue(mockSupabase)
  })

  it('preserves an internal review redirect after successful auth', async () => {
    mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({ error: null })
    const { GET } = await import('./route')

    const response = await GET(new Request('https://www.avaliaprudente.com.br/auth/callback?code=abc&next=%2Fr%2Fkifol-fertilizantes%3Freview%3D1'))

    expect(response.headers.get('location')).toBe('https://www.avaliaprudente.com.br/r/kifol-fertilizantes?review=1')
  })

  it('rejects external redirects and falls back to the dashboard', async () => {
    mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({ error: null })
    const { GET } = await import('./route')

    const response = await GET(new Request('https://www.avaliaprudente.com.br/auth/callback?code=abc&next=https%3A%2F%2Fevil.example'))

    expect(response.headers.get('location')).toBe('https://www.avaliaprudente.com.br/dashboard')
  })

  it('rejects protocol-relative redirects and falls back to the dashboard', async () => {
    mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({ error: null })
    const { GET } = await import('./route')

    const response = await GET(new Request('https://www.avaliaprudente.com.br/auth/callback?code=abc&next=%2F%2Fevil.example'))

    expect(response.headers.get('location')).toBe('https://www.avaliaprudente.com.br/dashboard')
  })

  it('returns expired review links to the review page with auth_error marker', async () => {
    mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({ error: new Error('expired') })
    const { GET } = await import('./route')

    const response = await GET(new Request('https://www.avaliaprudente.com.br/auth/callback?code=expired&next=%2Fr%2Fkifol-fertilizantes%3Freview%3D1'))

    expect(response.headers.get('location')).toBe('https://www.avaliaprudente.com.br/r/kifol-fertilizantes?review=1&auth_error=1')
  })

  it('supports redirect_to as a fallback for next parameter', async () => {
    mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({ error: null })
    const { GET } = await import('./route')

    const response = await GET(new Request('https://www.avaliaprudente.com.br/auth/callback?code=abc&redirect_to=%2Fr%2Fkifol-fertilizantes%3Freview%3D1'))

    expect(response.headers.get('location')).toBe('https://www.avaliaprudente.com.br/r/kifol-fertilizantes?review=1')
  })
})
