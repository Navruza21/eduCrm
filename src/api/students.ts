import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import { fetchAllPages, request } from './client'
import type { PageParams, Paginated, Student, StudentCreate, StudentUpdate, UUID } from './types'

export const studentsApi = {
  list: (params: PageParams = {}) => request<Paginated<Student>>('/students/', { query: params }),
  all: () => fetchAllPages<Student>('/students/'),
  get: (id: UUID) => request<Student>(`/students/${id}/`),
  create: (body: StudentCreate) => request<Student>('/students/', { method: 'POST', body }),
  /** Only `status` and `notes` can be changed. */
  update: (id: UUID, body: StudentUpdate) => request<Student>(`/students/${id}/`, { method: 'PATCH', body }),
}

export const studentQueries = {
  list: (params: PageParams) =>
    queryOptions({
      queryKey: ['students', 'list', params],
      queryFn: () => studentsApi.list(params),
      placeholderData: keepPreviousData,
    }),
  all: () => queryOptions({ queryKey: ['students', 'all'], queryFn: () => studentsApi.all() }),
}
