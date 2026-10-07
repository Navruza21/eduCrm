import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import { request, requestPage } from './client'
import type { Feedback, FeedbackCreate, PageParams, PublicFeedbackRequest, UUID } from './types'

export const feedbackApi = {
  list: (params: PageParams = {}) => requestPage<Feedback>('/feedback/', params),
  /** Entered by staff, e.g. a complaint that came by phone (`channel: "staff"`). */
  create: (body: FeedbackCreate) => request<Feedback>('/feedback/', { method: 'POST', body }),
  /**
   * Public, no CRM account: the student signs in with the learning platform's login
   * (`channel: "self"`). 400 — wrong login/password, 404 — no student with that phone here.
   */
  submit: (centerId: UUID, body: PublicFeedbackRequest) =>
    request<Feedback>(`/feedback/submit/${centerId}/`, { method: 'POST', body, auth: false }),
}

export const feedbackQueries = {
  list: (params: PageParams) =>
    queryOptions({
      queryKey: ['feedback', 'list', params],
      queryFn: () => feedbackApi.list(params),
      placeholderData: keepPreviousData,
    }),
}
