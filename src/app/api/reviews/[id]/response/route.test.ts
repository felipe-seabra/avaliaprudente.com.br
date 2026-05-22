import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockServerClient, mockCreateServerClient } = vi.hoisted(() => {
  const mockServerClient = {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  }

  return {
    mockServerClient,
    mockCreateServerClient: vi.fn(),
  }
})

vi.mock('@/lib/supabase/server', () => ({
  createClient: mockCreateServerClient,
}))

describe('POST /api/reviews/[id]/response', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    mockCreateServerClient.mockResolvedValue(mockServerClient)
  })

  it('returns 401 if user is not authenticated', async () => {
    mockServerClient.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    })

    const { POST } = await import('./route')
    const response = await POST(new Request('http://localhost/api/reviews/123/response', {
      method: 'POST',
      body: JSON.stringify({ content: 'Obrigado!' }),
    }), { params: Promise.resolve({ id: '123' }) })

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual({ error: 'Não autorizado.' })
  })

  it('returns 400 if content is empty', async () => {
    mockServerClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    })

    const { POST } = await import('./route')
    const response = await POST(new Request('http://localhost/api/reviews/123/response', {
      method: 'POST',
      body: JSON.stringify({ content: '' }),
    }), { params: Promise.resolve({ id: '123' }) })

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ error: 'A resposta não pode estar vazia.' })
  })
})
