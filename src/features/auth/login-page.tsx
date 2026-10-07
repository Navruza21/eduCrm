import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { FormEvent } from 'react'
import { Navigate, useLocation } from 'react-router'
import { signIn } from '@/api/auth'
import { isApiError } from '@/api/errors'
import type { LoginRequest } from '@/api/types'
import { LanguageSwitcher } from '@/components/language-switcher'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MODULE_META, MODULES } from '@/config/modules'
import { canAccess } from '@/config/permissions'
import type { Role } from '@/config/roles'
import { useErrorText } from '@/hooks/use-error-text'
import { useT } from '@/i18n'
import { field } from '@/lib/form'
import { useAuthStore } from '@/stores/auth-store'

/** Test server accounts (edu.thesofmebel.uz/crm) — one-click sign-in under the form. */
const DEMO_ACCOUNTS: { role: Role; username: string; branch?: string }[] = [
  { role: 'director', username: 'director' },
  { role: 'accountant', username: 'accountant' },
  { role: 'manager', username: 'manager', branch: 'Chilonzor' },
  { role: 'manager', username: 'asosiy', branch: 'Asosiy filial' },
  { role: 'sales', username: 'sales' },
]
const DEMO_PASSWORD = 'Test2026!'

/** Go back to the page that asked for login — unless the new role can't open it. */
function redirectTarget(from: string | undefined, role: Role): string {
  if (!from) return '/'
  const module = MODULES.find((m) => from.startsWith(MODULE_META[m].path))
  return module && !canAccess(role, module) ? '/' : from
}

export function LoginPage() {
  const t = useT()
  const errorText = useErrorText()
  const location = useLocation()
  const queryClient = useQueryClient()
  const session = useAuthStore((state) => state.session)
  const setSession = useAuthStore((state) => state.setSession)

  const mutation = useMutation({
    mutationFn: (credentials: LoginRequest) => signIn(credentials),
    onSuccess: (newSession) => {
      queryClient.clear()
      setSession(newSession)
    },
  })

  if (session) {
    const from = (location.state as { from?: string } | null)?.from
    return <Navigate to={redirectTarget(from, session.user.role)} replace />
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    mutation.mutate({ username: field(data, 'username'), password: String(data.get('password') ?? '') })
  }

  // Wrong credentials: 401 from simplejwt, or 400 from a custom serializer.
  const invalidCredentials = isApiError(mutation.error, 401) || isApiError(mutation.error, 400)

  return (
    <div className="flex min-h-svh flex-col bg-muted/40">
      <header className="flex justify-end p-4">
        <LanguageSwitcher />
      </header>

      <main className="flex flex-1 justify-center px-4 pb-10 md:items-center">
        <Card className="w-full max-w-sm self-start md:self-auto">
          <CardHeader>
            <Logo className="mb-2 size-12" />
            <CardTitle className="text-xl">{t.auth.title}</CardTitle>
            <CardDescription>{t.auth.subtitle}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="username">{t.fields.username}</Label>
                <Input
                  id="username"
                  name="username"
                  autoComplete="username"
                  autoCapitalize="none"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">{t.fields.password}</Label>
                <Input id="password" name="password" type="password" autoComplete="current-password" required />
              </div>
              {mutation.isError && (
                <p role="alert" className="text-sm text-destructive">
                  {invalidCredentials ? t.auth.invalid : errorText(mutation.error)}
                </p>
              )}
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? t.auth.submitting : t.auth.submit}
              </Button>
            </form>

            <div className="mt-6 border-t pt-4">
              <p className="mb-3 text-xs text-muted-foreground">{t.auth.demoAccounts}</p>
              <div className="grid grid-cols-2 gap-2">
                {DEMO_ACCOUNTS.map((account) => (
                  <Button
                    key={account.username}
                    type="button"
                    variant="outline"
                    className="h-auto flex-col items-start gap-0.5 py-2"
                    disabled={mutation.isPending}
                    onClick={() => mutation.mutate({ username: account.username, password: DEMO_PASSWORD })}
                  >
                    <span>{t.roles[account.role]}</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {mutation.isPending && mutation.variables?.username === account.username
                        ? t.auth.submitting
                        : [account.username, account.branch].filter(Boolean).join(' · ')}
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
