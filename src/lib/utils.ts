import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const RESERVED_SLUGS = [
  'admin', 'dashboard', 'login', 'register', 'api', 'blocked', 
  'terms-reaccept', 'privacy', 'terms', 'auth', 'reset-password', 
  'forgot-password', 'favicon.ico', 'sitemap.xml', 'robots.txt', 
  'demo', 'demonstracao', 'new', 'edit', 'delete', 'settings',
  'support', 'help', 'pricing', 'about', 'contact', 'r'
]

/**
 * Normalizes a string into a URL-safe slug.
 * - Lowercase
 * - Accent-normalized
 * - Non-alphanumeric removed (replaced with -)
 * - Trimmed
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]/g, '-')     // Replace non-alphanumeric with -
    .replace(/-+/g, '-')            // Remove consecutive -
    .replace(/^-|-$/g, '')          // Trim - from start and end
}

/**
 * Validates if a slug is safe and not reserved.
 */
export function isValidSlug(slug: string): boolean {
  if (!slug || slug.length < 2) return false
  if (RESERVED_SLUGS.includes(slug.toLowerCase())) return false
  return /^[a-z0-9-]+$/.test(slug)
}
