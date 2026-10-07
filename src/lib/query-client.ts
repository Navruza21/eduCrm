import { QueryCache, QueryClient } from '@tanstack/react-query'
import { isApiError } from '@/api/errors'
import { useAuthStore } from '@/stores/auth-store'

export const queryClient: QueryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      // Expired or foreign token: drop the session, the guard sends the user to /login.
      if (isApiError(error, 401)) {
        useAuthStore.getState().clearSession()
        queryClient.clear()
      }
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: (failureCount, error) => !isApiError(error) && failureCount < 1,
      refetchOnWindowFocus: false,
    },
  },
})
