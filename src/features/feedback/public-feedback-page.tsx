import { useMutation } from '@tanstack/react-query'
import { CircleCheck, MessageSquareText } from 'lucide-react'
import type { FormEvent } from 'react'
import { useParams } from 'react-router'
import { errorDetails, isApiError } from '@/api/errors'
import { feedbackApi } from '@/api/feedback'
import type { PublicFeedbackRequest } from '@/api/types'
import { Field, FormError } from '@/components/form'
import { LanguageSwitcher } from '@/components/language-switcher'
import { RatingInput } from '@/components/rating'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useT } from '@/i18n'
import { field, optionalField } from '@/lib/form'

/** POST /feedback/submit/<center_id>/ — no CRM account, the learning platform's login instead. */
export function PublicFeedbackPage() {
  const t = useT()
  const { centerId = '' } = useParams()

  const mutation = useMutation({
    mutationFn: (body: PublicFeedbackRequest) => feedbackApi.submit(centerId, body),
  })

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    mutation.mutate({
      username: field(data, 'username'),
      password: String(data.get('password') ?? ''),
      rating: Number(field(data, 'rating')),
      comment: field(data, 'comment'),
      teacher_name: optionalField(data, 'teacher_name'),
    })
  }

  return (
    <div className="flex min-h-svh flex-col bg-muted/40">
      <header className="flex justify-end p-4">
        <LanguageSwitcher />
      </header>

      <main className="flex flex-1 justify-center px-4 pb-10 md:items-center">
        <Card className="w-full max-w-md self-start md:self-auto">
          {mutation.isSuccess ? (
            <CardHeader className="items-center text-center">
              <CircleCheck className="mx-auto mb-2 size-10 text-primary" />
              <CardTitle className="text-xl">{t.feedback.public.thanksTitle}</CardTitle>
              <CardDescription>{t.feedback.public.thanksText}</CardDescription>
              <Button variant="outline" className="mx-auto mt-4" onClick={() => mutation.reset()}>
                {t.feedback.public.another}
              </Button>
            </CardHeader>
          ) : (
            <>
              <CardHeader>
                <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <MessageSquareText className="size-5" />
                </div>
                <CardTitle className="text-xl">{t.feedback.public.title}</CardTitle>
                <CardDescription>{t.feedback.public.subtitle}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={onSubmit} className="flex flex-col gap-4">
                  <Field label={t.feedback.public.username} htmlFor="public-username">
                    <Input
                      id="public-username"
                      name="username"
                      autoComplete="username"
                      autoCapitalize="none"
                      required
                    />
                  </Field>
                  <Field label={t.feedback.public.password} htmlFor="public-password">
                    <Input
                      id="public-password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                    />
                  </Field>
                  <div className="grid gap-2">
                    <Label>{t.feedback.rating}</Label>
                    <RatingInput name="rating" label={t.feedback.rating} />
                  </div>
                  <Field label={t.feedback.comment} htmlFor="public-comment">
                    <Textarea id="public-comment" name="comment" rows={4} required />
                  </Field>
                  <Field label={t.feedback.teacher} htmlFor="public-teacher" optional>
                    <Input id="public-teacher" name="teacher_name" />
                  </Field>
                  <SubmitError error={mutation.error} />
                  <Button type="submit" disabled={mutation.isPending}>
                    {mutation.isPending ? t.feedback.public.submitting : t.feedback.public.submit}
                  </Button>
                </form>
              </CardContent>
            </>
          )}
        </Card>
      </main>
    </div>
  )
}

/** 400 without field details — wrong platform login; 404 — no student with that phone in the center. */
function SubmitError({ error }: { error: Error | null }) {
  const t = useT()
  if (!error) return null

  const known =
    isApiError(error, 400) && errorDetails(error).length === 0
      ? t.feedback.public.invalidCredentials
      : isApiError(error, 404)
        ? t.feedback.public.notFound
        : null

  if (!known) {
    return (
      <FormError
        error={error}
        labels={{ rating: t.feedback.rating, comment: t.feedback.comment, teacher_name: t.feedback.teacher }}
      />
    )
  }

  return (
    <p role="alert" className="text-sm text-destructive">
      {known}
    </p>
  )
}
