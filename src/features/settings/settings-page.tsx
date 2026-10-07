import { useQuery } from '@tanstack/react-query'
import { Pencil, Plus } from 'lucide-react'
import { useState } from 'react'
import { centerQueries, courseQueries } from '@/api/centers'
import type { Center, Course } from '@/api/types'
import { DataTable } from '@/components/data-table'
import { DetailList } from '@/components/detail-list'
import { PageHeader } from '@/components/page-header'
import { QueryView } from '@/components/query-view'
import { ActiveBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useT } from '@/i18n'
import { labelOf } from '@/lib/utils'
import { PermissionsMatrix } from './permissions-matrix'
import { CenterPanel, CoursePanel } from './settings-panels'
import { StaffRegisterCard } from './staff-register-card'

export function SettingsPage() {
  const t = useT()

  return (
    <>
      <PageHeader module="settings" />
      <CenterCard />
      <Tabs defaultValue="courses">
        <div className="overflow-x-auto overflow-y-hidden">
          <TabsList>
            <TabsTrigger value="courses">{t.settings.courses}</TabsTrigger>
            <TabsTrigger value="staff">{t.settings.staff}</TabsTrigger>
            <TabsTrigger value="matrix">{t.settings.matrix}</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="courses">
          <CoursesSection />
        </TabsContent>
        <TabsContent value="staff">
          <StaffRegisterCard />
        </TabsContent>
        <TabsContent value="matrix">
          <PermissionsMatrix />
        </TabsContent>
      </Tabs>
    </>
  )
}

/** GET /centers/me/ */
function CenterCard() {
  const t = useT()
  const query = useQuery(centerQueries.me())
  const [editing, setEditing] = useState<Center | null>(null)

  return (
    <QueryView query={query} skeleton="list">
      {(center) => (
        <Card>
          <CardHeader>
            <CardTitle>{t.settings.center}</CardTitle>
            <CardAction>
              <Button variant="outline" size="sm" onClick={() => setEditing(center)}>
                <Pencil data-icon="inline-start" />
                {t.common.edit}
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <DetailList
              className="sm:grid-cols-2 lg:grid-cols-4"
              items={[
                { label: t.fields.name, value: center.name },
                { label: t.fields.phone, value: center.phone || '—' },
                { label: t.fields.address, value: center.address || '—' },
                { label: t.fields.contactPerson, value: center.contact_person || '—' },
                {
                  label: t.settings.contractStatus,
                  value: labelOf(t.settings.contractStatuses, center.contract_status),
                },
                {
                  label: t.settings.subscriptionTier,
                  value: labelOf(t.settings.subscriptionTiers, center.subscription_tier),
                },
                { label: t.fields.status, value: <ActiveBadge active={center.is_active} /> },
                { label: t.settings.centerId, value: <span className="font-mono text-xs break-all">{center.id}</span> },
              ]}
            />
          </CardContent>
          {editing && <CenterPanel center={editing} onClose={() => setEditing(null)} />}
        </Card>
      )}
    </QueryView>
  )
}

function CoursesSection() {
  const t = useT()
  const query = useQuery(courseQueries.all())
  const [editing, setEditing] = useState<Course | 'new' | null>(null)

  return (
    <section className="flex flex-col gap-3">
      <Button className="self-end" onClick={() => setEditing('new')}>
        <Plus data-icon="inline-start" />
        {t.settings.addCourse}
      </Button>
      <QueryView query={query} skeleton="list">
        {(courses) => (
          <DataTable
            rows={courses}
            columns={[
              { id: 'name', header: t.fields.name, cell: (c) => <span className="font-medium">{c.name}</span> },
              { id: 'status', header: t.fields.status, cell: (c) => <ActiveBadge active={c.is_active} /> },
              {
                id: 'actions',
                header: '',
                className: 'w-0 text-right',
                cell: (c) => (
                  <Button variant="ghost" size="icon-sm" aria-label={t.common.edit} onClick={() => setEditing(c)}>
                    <Pencil />
                  </Button>
                ),
              },
            ]}
          />
        )}
      </QueryView>
      {editing && <CoursePanel course={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
    </section>
  )
}
