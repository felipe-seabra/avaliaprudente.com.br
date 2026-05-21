/**
 * Helper to check if a user role has administrative privileges.
 * Both 'admin' and 'super_admin' roles are considered administrators.
 */
export function isAdmin(role: string | null | undefined): boolean {
  return role === 'admin' || role === 'super_admin';
}

/**
 * Helper to check if a user has the specific 'super_admin' role.
 */
export function isSuperAdmin(role: string | null | undefined): boolean {
  return role === 'super_admin';
}
