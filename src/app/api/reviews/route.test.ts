import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockServerClient, mockCreateServerClient, mockCreateSupabaseClient } = vi.hoisted(() => {
  const mockServerClient = {
    auth: {
      getUser: vi.fn(),
    },
  }

  return {
    mockServerClient,
    mockCreateServerClient: vi.fn(),
    mockCreateSupabaseClient: vi.fn(),
  }
})

vi.mock('@/lib/supabase/server', () => ({
  createClient: mockCreateServerClient,
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: mockCreateSupabaseClient,
}))

describe('POST /api/reviews', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key'
    vi.resetModules()
    vi.clearAllMocks()
    mockCreateServerClient.mockResolvedValue(mockServerClient)
    mockCreateSupabaseClient.mockReturnValue({})
  })

  it('requires an authenticated user before accepting a review', async () => {
    mockServerClient.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    })

    const { POST } = await import('./route')
    const response = await POST(new Request('http://localhost/api/reviews', {
      method: 'POST',
      body: JSON.stringify({}),
    }))

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual({
      error: 'Faça login para enviar sua avaliação.',
    })
  })

  it('rejects authenticated submissions without a public display name', async () => {
    mockServerClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-1', app_metadata: { provider: 'google' }, user_metadata: {} } },
      error: null,
    })

    const { POST } = await import('./route')
    const response = await POST(new Request('http://localhost/api/reviews', {
      method: 'POST',
      body: JSON.stringify({
        business_id: '00000000-0000-0000-0000-000000000001',
        rating: 5,
        display_name: '',
      }),
    }))

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: 'Dados de avaliação inválidos.',
    })
  })
})
