import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import { fetchAllPages, request } from './client'
import type { PageParams, Paginated, Teacher, TeacherCreate, TeacherUpdate, UUID } from './types'

export const teachersApi = {
  list: (params: PageParams = {}) => request<Paginated<Teacher>>('/teachers/', { query: params }),
  all: () => fetchAllPages<Teacher>('/teachers/'),
  get: (id: UUID) => request<Teacher>(`/teachers/${id}/`),
  /** Director only. */
  create: (body: TeacherCreate) => request<Teacher>('/teachers/', { method: 'POST', body }),
  /** Director only. */
  update: (id: UUID, body: TeacherUpdate) => request<Teacher>(`/teachers/${id}/`, { method: 'PATCH', body }),
}

export const teacherQueries = {
  list: (params: PageParams) =>
    queryOptions({
      queryKey: ['teachers', 'list', params],
      queryFn: () => teachersApi.list(params),
      placeholderData: keepPreviousData,
    }),
  all: () => queryOptions({ queryKey: ['teachers', 'all'], queryFn: () => teachersApi.all() }),
}
