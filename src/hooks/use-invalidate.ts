import { useQueryClient } from '@tanstack/react-query'

/** Query key roots: 'students', 'groups', 'invoices', 'dashboard'… */
type QueryRoot =
  | 'auth'
  | 'centers'
  | 'branches'
  | 'courses'
  | 'students'
  | 'teachers'
  | 'groups'
  | 'invoices'
  | 'dashboard'
  | 'feedback'

/** Refetches everything under the given roots — after a write, server-computed numbers change too. */
export function useInvalidate() {
  const queryClient = useQueryClient()
  return (...roots: QueryRoot[]) =>
    Promise.all(roots.map((root) => queryClient.invalidateQueries({ queryKey: [root] })))
}
