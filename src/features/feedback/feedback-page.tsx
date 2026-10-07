import { useQuery } from '@tanstack/react-query'
import { Check, Copy, Link2, Plus } from 'lucide-react'
import { useState } from 'react'
import { DEFAULT_PAGE_SIZE } from '@/api/client'
import { feedbackQueries } from '@/api/feedback'
import { DataTable } from '@/components/data-table'
import { PageHeader } from '@/components/page-header'
import { Pagination } from '@/components/pagination'
import { QueryView } from '@/components/query-view'
import { RatingStars } from '@/components/rating'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useCanEdit, useSession } from '@/features/auth/hooks'
import { useStudentLookup } from '@/hooks/use-lookups'
import { useT } from '@/i18n'
import { useFormat } from '@/i18n/use-format'
import { FeedbackCreatePanel } from './feedback-create-panel'
import { publicFeedbackUrl } from './links'

export function FeedbackPage() {
  const t = useT()
  const f = useFormat()
  const { user } = useSession()
  const canEdit = useCanEdit('feedback')
  const students = useStudentLookup()
  const [page, setPage] = useState(1)
  const [creating, setCreating] = useState(false)
  const query = useQuery(feedbackQueries.list({ page, page_size: DEFAULT_PAGE_SIZE }))

  return (
    <>
      <PageHeader
        module="feedback"
        actions={
          canEdit && (
            <Button onClick={() => setCreating(true)}>
              <Plus data-icon="inline-start" />
              {t.feedback.add}
            </Button>
          )
        }
      />

      {user.center && <ShareLinkCard url={publicFeedbackUrl(user.center)} />}

      <QueryView query={query}>
        {(data) => (
          <div className="flex flex-col gap-3">
            <DataTable
              rows={data.results}
              columns={[
                {
                  id: 'date',
                  header: t.feedback.date,
                  cell: (r) => f.dateTime(r.created_at),
                  className: 'whitespace-nowrap',
                },
                {
                  id: 'student',
                  header: t.feedback.student,
                  cell: (r) => <span className="font-medium">{students.label(r.student)}</span>,
                },
                { id: 'teacher', header: t.feedback.teacher, cell: (r) => r.teacher_name || '—' },
                { id: 'rating', header: t.feedback.rating, cell: (r) => <RatingStars value={r.rating} /> },
                {
                  id: 'comment',
                  header: t.feedback.comment,
                  cell: (r) => <p className="max-w-md min-w-48 whitespace-normal">{r.comment}</p>,
                },
                {
                  id: 'channel',
                  header: t.feedback.channel,
                  cell: (r) => (
                    <Badge variant={r.channel === 'self' ? 'secondary' : 'outline'}>
                      {t.feedback.channels[r.channel]}
                    </Badge>
                  ),
                },
              ]}
            />
            <Pagination page={page} pageSize={DEFAULT_PAGE_SIZE} count={data.count} onPageChange={setPage} />
          </div>
        )}
      </QueryView>

      {creating && <FeedbackCreatePanel onClose={() => setCreating(false)} />}
    </>
  )
}

/** "Fikr-mulohaza havolangiz" — the center shares it with students and parents. */
function ShareLinkCard({ url }: { url: string }) {
  const t = useT()
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="size-4 text-muted-foreground" />
          {t.feedback.shareTitle}
        </CardTitle>
        <CardDescription>{t.feedback.shareHint}</CardDescription>
        <CardAction>
          <Button variant="outline" size="sm" onClick={copy}>
            {copied ? <Check data-icon="inline-start" /> : <Copy data-icon="inline-start" />}
            {copied ? t.common.copied : t.common.copy}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <code className="block truncate rounded-md bg-muted px-2 py-1.5 text-xs">{url}</code>
      </CardContent>
    </Card>
  )
}
