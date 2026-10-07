import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import { fetchAllPages, request } from './client'
import type {
  Branch,
  BranchCreate,
  BranchUpdate,
  Center,
  CenterCreate,
  CenterUpdate,
  Course,
  CourseCreate,
  CourseUpdate,
  PageParams,
  Paginated,
  UUID,
} from './types'

export const centersApi = {
  /** super_admin only. A new center gets its first branch automatically. */
  list: (params: PageParams = {}) => request<Paginated<Center>>('/centers/', { query: params }),
  create: (body: CenterCreate) => request<Center>('/centers/', { method: 'POST', body }),
  /** The director's own center. */
  me: () => request<Center>('/centers/me/'),
  updateMe: (body: CenterUpdate) => request<Center>('/centers/me/', { method: 'PATCH', body }),
}

export const branchesApi = {
  list: (params: PageParams = {}) => request<Paginated<Branch>>('/centers/branches/', { query: params }),
  all: () => fetchAllPages<Branch>('/centers/branches/'),
  get: (id: UUID) => request<Branch>(`/centers/branches/${id}/`),
  create: (body: BranchCreate) => request<Branch>('/centers/branches/', { method: 'POST', body }),
  update: (id: UUID, body: BranchUpdate) =>
    request<Branch>(`/centers/branches/${id}/`, { method: 'PATCH', body }),
}

export const coursesApi = {
  list: (params: PageParams = {}) => request<Paginated<Course>>('/centers/courses/', { query: params }),
  all: () => fetchAllPages<Course>('/centers/courses/'),
  get: (id: UUID) => request<Course>(`/centers/courses/${id}/`),
  create: (body: CourseCreate) => request<Course>('/centers/courses/', { method: 'POST', body }),
  update: (id: UUID, body: CourseUpdate) =>
    request<Course>(`/centers/courses/${id}/`, { method: 'PATCH', body }),
}

export const centerQueries = {
  list: (params: PageParams) =>
    queryOptions({
      queryKey: ['centers', 'list', params],
      queryFn: () => centersApi.list(params),
      placeholderData: keepPreviousData,
    }),
  me: () => queryOptions({ queryKey: ['centers', 'me'], queryFn: () => centersApi.me() }),
}

export const branchQueries = {
  all: () => queryOptions({ queryKey: ['branches', 'all'], queryFn: () => branchesApi.all() }),
}

export const courseQueries = {
  all: () => queryOptions({ queryKey: ['courses', 'all'], queryFn: () => coursesApi.all() }),
}
