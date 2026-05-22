import { z } from 'zod'

export const userRoleSchema = z.enum(['reviewer', 'customer', 'admin', 'super_admin'])

export const updateRoleSchema = z.object({
  role: userRoleSchema
})

export type UpdateRoleInput = z.infer<typeof updateRoleSchema>
