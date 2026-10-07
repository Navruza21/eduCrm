import { queryOptions } from '@tanstack/react-query'
import { request } from './client'
import type { Dashboard } from './types'

export const dashboardApi = {
  /** Whole center for a director, only their branch for branch-bound staff. */
  get: () => request<Dashboard>('/dashboard/'),
}

export const dashboardQueries = {
  summary: () => queryOptions({ queryKey: ['dashboard'], queryFn: () => dashboardApi.get() }),
}
