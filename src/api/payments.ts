import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import { fetchAllPages, request, requestPage } from './client'
import type {
  Invoice,
  InvoiceCreate,
  InvoiceListParams,
  Payment,
  PaymentCreate,
  UUID,
} from './types'

export const invoicesApi = {
  /** `?status=pending|partial|paid|cancelled`, `?overdue=true`. */
  list: (params: InvoiceListParams = {}) => requestPage<Invoice>('/payments/invoices/', params),
  all: () => fetchAllPages<Invoice>('/payments/invoices/'),
  get: (id: UUID) => request<Invoice>(`/payments/invoices/${id}/`),
  create: (body: InvoiceCreate) => request<Invoice>('/payments/invoices/', { method: 'POST', body }),
  /** For fixing mistakes: the invoice becomes `cancelled`. */
  cancel: (id: UUID) => request<Invoice>(`/payments/invoices/${id}/cancel/`, { method: 'POST' }),

  payments: (invoiceId: UUID) => fetchAllPages<Payment>(`/payments/invoices/${invoiceId}/payments/`),
  addPayment: (invoiceId: UUID, body: PaymentCreate) =>
    request<Payment>(`/payments/invoices/${invoiceId}/payments/`, { method: 'POST', body }),
}

export const invoiceQueries = {
  list: (params: InvoiceListParams) =>
    queryOptions({
      queryKey: ['invoices', 'list', params],
      queryFn: () => invoicesApi.list(params),
      placeholderData: keepPreviousData,
    }),
  all: () => queryOptions({ queryKey: ['invoices', 'all'], queryFn: () => invoicesApi.all() }),
  detail: (id: UUID) => queryOptions({ queryKey: ['invoices', id], queryFn: () => invoicesApi.get(id) }),
  payments: (invoiceId: UUID) =>
    queryOptions({
      queryKey: ['invoices', invoiceId, 'payments'],
      queryFn: () => invoicesApi.payments(invoiceId),
    }),
}
