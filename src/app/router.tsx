import type { ComponentType } from 'react'
import { createBrowserRouter } from 'react-router'
import { AppLayout } from '@/components/layout/app-layout'
import { MODULE_META, MODULES, type ModuleId } from '@/config/modules'
import { HomeRedirect, RequireAuth, RequireModule } from '@/features/auth/guards'
import { LoginPage } from '@/features/auth/login-page'
import { BranchesPage } from '@/features/branches/branches-page'
import { CentersPage } from '@/features/centers/centers-page'
import { DashboardPage } from '@/features/dashboard/dashboard-page'
import { NotFoundPage } from '@/features/errors/status-pages'
import { FeedbackPage } from '@/features/feedback/feedback-page'
import { PUBLIC_FEEDBACK_PATH } from '@/features/feedback/links'
import { PublicFeedbackPage } from '@/features/feedback/public-feedback-page'
import { FinancePage } from '@/features/finance/finance-page'
import { GroupsPage } from '@/features/groups/groups-page'
import { SettingsPage } from '@/features/settings/settings-page'
import { StudentsPage } from '@/features/students/students-page'
import { TeachersPage } from '@/features/teachers/teachers-page'

const MODULE_PAGES: Record<ModuleId, ComponentType> = {
  dashboard: DashboardPage,
  students: StudentsPage,
  groups: GroupsPage,
  teachers: TeachersPage,
  finance: FinancePage,
  feedback: FeedbackPage,
  branches: BranchesPage,
  settings: SettingsPage,
  centers: CentersPage,
}

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  // Public: students and parents leave feedback without a CRM account.
  { path: PUBLIC_FEEDBACK_PATH, element: <PublicFeedbackPage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <HomeRedirect /> },
          ...MODULES.map((module) => {
            const Page = MODULE_PAGES[module]
            return {
              path: MODULE_META[module].path,
              element: (
                <RequireModule module={module}>
                  <Page />
                </RequireModule>
              ),
            }
          }),
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
])
