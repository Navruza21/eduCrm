/** Backend roles (API docs, section 1). */
export const ROLES = ['super_admin', 'director', 'manager', 'sales', 'accountant'] as const

export type Role = (typeof ROLES)[number]

/** Roles a director can register for their own center (`POST /auth/register/`). */
export const STAFF_ROLES = ['manager', 'sales', 'accountant'] as const satisfies readonly Role[]

export type StaffRole = (typeof STAFF_ROLES)[number]
