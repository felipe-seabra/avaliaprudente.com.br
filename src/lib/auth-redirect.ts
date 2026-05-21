const DEFAULT_REDIRECT_PATH = '/dashboard'

export function getSafeInternalRedirect(next: string | null, fallback = DEFAULT_REDIRECT_PATH) {
  if (!next) return fallback

  if (!next.startsWith('/') || next.startsWith('//') || next.includes('\\')) {
    return fallback
  }

  return next
}
