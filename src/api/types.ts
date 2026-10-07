// Request and response shapes of the backend API, field for field (API_DOCUMENTATION.md).
import type { Role, StaffRole } from '@/config/roles'

export type UUID = string
/** Money and other decimals come as strings: "250000.00". */
export type Decimal = string
/** ISO 8601 date-time. */
export type DateTime = string
/** "2026-10-05" */
export type DateString = string

/** Keeps autocomplete for the documented values but accepts any other the server sends. */
type OpenEnum<T extends string> = T | (string & {})

// 0. Common

export type ApiErrorBody = {
  success: false
  error: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
}

export type Paginated<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

/** Default page_size is 20, the maximum is 100. */
export type PageParams = {
  page?: number
  page_size?: number
}

// 2. Auth — /auth/

export type LoginRequest = {
  username: string
  password: string
}

export type TokenPair = {
  access: string
  refresh: string
}

export type TokenRefreshRequest = {
  refresh: string
}

/** `refresh` is only present when the server rotates refresh tokens. */
export type TokenRefreshResponse = {
  access: string
  refresh?: string
}

export type LogoutRequest = {
  refresh: string
}

export type User = {
  id: UUID
  username: string
  first_name: string
  last_name: string
  phone: string
  role: Role
  /** null for super_admin. */
  center: UUID | null
  /** Set when the user is attached to one branch — then they only see that branch. */
  branch: UUID | null
}

export type UserUpdate = Partial<Pick<User, 'first_name' | 'last_name' | 'phone'>>

/**
 * super_admin registers a `director` for any center; a director registers
 * manager / sales / accountant for their own center.
 */
export type RegisterRequest = {
  username: string
  password: string
  role: 'director' | StaffRole
  branch?: UUID
  /** super_admin only: the center the new director belongs to. */
  center?: UUID
  first_name?: string
  last_name?: string
  phone?: string
}

// 3. Centers — /centers/

export type ContractStatus = OpenEnum<'trial'>

export type SubscriptionTier = OpenEnum<'basic'>

export type Center = {
  id: UUID
  name: string
  logo: string | null
  address: string
  phone: string
  contact_person: string
  contract_status: ContractStatus
  subscription_tier: SubscriptionTier
  is_active: boolean
  created_at: DateTime
  updated_at: DateTime
}

export type CenterCreate = {
  name: string
  phone?: string
  address?: string
  contact_person?: string
}

export type CenterUpdate = Partial<CenterCreate>

export type Branch = {
  id: UUID
  name: string
  address: string
  phone: string
  contact_person: string
  is_active: boolean
  created_at: DateTime
  updated_at: DateTime
}

export type BranchCreate = {
  name: string
  address?: string
  phone?: string
  contact_person?: string
}

export type BranchUpdate = Partial<BranchCreate & { is_active: boolean }>

export type Course = {
  id: UUID
  name: string
  is_active: boolean
  created_at: DateTime
  updated_at: DateTime
}

/** A course name must be unique within the center — otherwise 400. */
export type CourseCreate = {
  name: string
}

export type CourseUpdate = Partial<{ name: string; is_active: boolean }>

// 4. Students — /students/

export const STUDENT_STATUSES = ['active', 'paused', 'stopped', 'left'] as const

export type StudentStatus = (typeof STUDENT_STATUSES)[number]

export type Student = {
  id: UUID
  branch: UUID | null
  full_name: string
  phone: string
  platform_student_id: string
  status: StudentStatus
  enrolled_at: DateTime
  notes: string
  created_at: DateTime
  updated_at: DateTime
}

export type StudentCreate = {
  full_name: string
  phone: string
  platform_student_id?: string
  branch?: UUID
}

/** PATCH accepts only these two fields. */
export type StudentUpdate = Partial<Pick<Student, 'status' | 'notes'>>

// 5. Teachers — /teachers/

export type TeacherStatus = OpenEnum<'active'>

export type Teacher = {
  id: UUID
  branch: UUID | null
  full_name: string
  phone: string
  /** Free text: "Ingliz tili, IELTS". */
  subjects: string
  platform_teacher_id: string
  status: TeacherStatus
  notes: string
  /** Computed live by the server. */
  group_count: number
  active_student_count: number
  /** This month's payments in the teacher's groups. */
  monthly_revenue: Decimal
  created_at: DateTime
  updated_at: DateTime
}

export type TeacherCreate = {
  full_name: string
  phone?: string
  subjects?: string
  branch?: UUID
}

export type TeacherUpdate = Partial<TeacherCreate & { notes: string }>

// 6. Groups — /groups/

export const GROUP_STATUSES = ['open', 'full', 'finished', 'archived'] as const

export type GroupStatus = (typeof GROUP_STATUSES)[number]

export type Group = {
  id: UUID
  branch: UUID | null
  name: string
  course: UUID | null
  teacher: UUID | null
  capacity: number
  monthly_price: Decimal
  schedule_note: string
  status: GroupStatus
  enrolled_count: number
  available_seats: number
  created_at: DateTime
  updated_at: DateTime
}

export type GroupCreate = {
  name: string
  capacity: number
  monthly_price: Decimal
  course?: UUID
  teacher?: UUID
  branch?: UUID
  schedule_note?: string
}

export type GroupUpdate = Partial<
  Omit<GroupCreate, 'course' | 'teacher'> & {
    course: UUID | null
    teacher: UUID | null
    status: GroupStatus
  }
>

export type EnrollmentStudent = Pick<Student, 'id' | 'full_name' | 'phone' | 'status'>

export type Enrollment = {
  id: UUID
  student: EnrollmentStudent
  /** The group was full — the student went to the waitlist instead of an error. */
  is_waitlisted: boolean
  created_at: DateTime
}

export type EnrollmentCreate = {
  student: UUID
}

// 7. Payments — /payments/

export const INVOICE_STATUSES = ['pending', 'partial', 'paid', 'cancelled'] as const

export type InvoiceStatus = (typeof INVOICE_STATUSES)[number]

export type Invoice = {
  id: UUID
  branch: UUID | null
  student: UUID
  group: UUID | null
  /** "2026-10" */
  period_label: string
  amount: Decimal
  due_date: DateString
  status: InvoiceStatus
  total_paid: Decimal
  outstanding_amount: Decimal
  is_overdue: boolean
  created_at: DateTime
}

export type InvoiceListParams = PageParams & {
  status?: InvoiceStatus
  /** Only invoices past their due date. */
  overdue?: boolean
}

export type InvoiceCreate = {
  student: UUID
  group?: UUID
  /** Taken from the group's monthly price when omitted. */
  amount?: Decimal
  due_date: DateString
  period_label: string
  branch?: UUID
}

export const PAYMENT_METHODS = ['cash', 'card', 'transfer'] as const

export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

export type Payment = {
  id: UUID
  amount: Decimal
  method: PaymentMethod
  paid_at: DateTime
  /** "director1 (Rahbar)" */
  recorded_by: string
  note: string
}

/** Partial payments are fine — the invoice moves pending → partial → paid by itself. */
export type PaymentCreate = {
  amount: Decimal
  method: PaymentMethod
  note?: string
}

// 8. Dashboard — /dashboard/

export type Dashboard = {
  /** "2026-09" */
  period: string
  monthly_revenue: Decimal
  active_students: number
  total_debt: Decimal
  overdue_invoices_count: number
  groups: {
    open_count: number
    /** Percent, 0–100. */
    average_fill_rate: number
  }
}

// 9. Feedback — /feedback/

export type FeedbackChannel = 'staff' | 'self'

export type Feedback = {
  id: UUID
  branch: UUID | null
  student: UUID
  teacher_name: string
  rating: number
  comment: string
  channel: FeedbackChannel
  created_at: DateTime
}

export type FeedbackCreate = {
  student: UUID
  rating: number
  comment: string
  teacher_name?: string
}

/** Public form: the student signs in with their learning-platform login, not a CRM account. */
export type PublicFeedbackRequest = {
  username: string
  password: string
  rating: number
  comment: string
  teacher_name?: string
}
