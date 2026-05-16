/**
 * Utility to handle Supabase Storage path operations and cleanup
 */

/**
 * Extracts the storage path from a public Supabase Storage URL
 * Example: https://.../storage/v1/object/public/business-assets/USER_ID/logos/FILE.webp
 * Returns: USER_ID/logos/FILE.webp
 */
export function extractStoragePath(publicUrl: string | null | undefined, bucketName: string = 'business-assets'): string | null {
  if (!publicUrl || !publicUrl.includes(bucketName)) return null
  
  try {
    const parts = publicUrl.split(`${bucketName}/`)
    if (parts.length > 1) {
      return parts[1]
    }
  } catch (err) {
    console.error('Failed to extract storage path:', err)
  }
  
  return null
}
