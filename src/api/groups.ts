import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import { fetchAllPages, request } from './client'
import type {
  Enrollment,
  EnrollmentCreate,
  Group,
  GroupCreate,
  GroupUpdate,
  PageParams,
  Paginated,
  UUID,
} from './types'

export const groupsApi = {
  list: (params: PageParams = {}) => request<Paginated<Group>>('/groups/', { query: params }),
  all: () => fetchAllPages<Group>('/groups/'),
  get: (id: UUID) => request<Group>(`/groups/${id}/`),
  create: (body: GroupCreate) => request<Group>('/groups/', { method: 'POST', body }),
  update: (id: UUID, body: GroupUpdate) => request<Group>(`/groups/${id}/`, { method: 'PATCH', body }),

  enrollments: (groupId: UUID) => fetchAllPages<Enrollment>(`/groups/${groupId}/enrollments/`),
  /** Never fails on a full group — the student lands on the waitlist (`is_waitlisted: true`). */
  enroll: (groupId: UUID, body: EnrollmentCreate) =>
    request<Enrollment>(`/groups/${groupId}/enrollments/`, { method: 'POST', body }),
  unenroll: (groupId: UUID, enrollmentId: UUID) =>
    request<void>(`/groups/${groupId}/enrollments/${enrollmentId}/`, { method: 'DELETE' }),
}

export const groupQueries = {
  list: (params: PageParams) =>
    queryOptions({
      queryKey: ['groups', 'list', params],
      queryFn: () => groupsApi.list(params),
      placeholderData: keepPreviousData,
    }),
  all: () => queryOptions({ queryKey: ['groups', 'all'], queryFn: () => groupsApi.all() }),
  enrollments: (groupId: UUID) =>
    queryOptions({
      queryKey: ['groups', groupId, 'enrollments'],
      queryFn: () => groupsApi.enrollments(groupId),
    }),
}
