import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toast'
import { LoginPage, useAuthStore } from '@/features/auth'
import { AppLayout } from '@/features/shell'
import { DashboardPage } from '@/features/dashboard'
import { CustomersPage } from '@/features/customers'
import { ContactsPage } from '@/features/contacts'
import { ProductsPage } from '@/features/products'
import { DealsPage } from '@/features/deals'
import { VisitsPage } from '@/features/visits'
import { DocumentsPage } from '@/features/documents'
import { SamplesPage } from '@/features/samples'
import { QuotesPage } from '@/features/quotes'
import { PfiPage } from '@/features/pfi'
import { PosPage } from '@/features/pos'
import { OrdersPage } from '@/features/orders'
import { ReadinessPage } from '@/features/readiness'
import { MarketPage } from '@/features/market'
import { TravelPage } from '@/features/travel'
import { ReportsPage } from '@/features/reports'
import { UsersAdminPage } from '@/features/admin'

function RequireAuth({ children }: Readonly<{ children: React.ReactNode }>) {
  const accessToken = useAuthStore((s) => s.accessToken)
  if (!accessToken) return <Navigate to="/login" replace />
  return <>{children}</>
}

function App() {
  const accessToken = useAuthStore((s) => s.accessToken)

  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        <Route
          path="/login"
          element={accessToken ? <Navigate to="/dashboard" replace /> : <LoginPage />}
        />

        <Route
          element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/deals" element={<DealsPage />} />
          <Route path="/visits" element={<VisitsPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/samples" element={<SamplesPage />} />
          <Route path="/quotes" element={<QuotesPage />} />
          <Route path="/pfi" element={<PfiPage />} />
          <Route path="/pos" element={<PosPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/readiness" element={<ReadinessPage />} />
          <Route path="/market" element={<MarketPage />} />
          <Route path="/travel" element={<TravelPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/admin/users" element={<UsersAdminPage />} />
        </Route>

        <Route
          path="*"
          element={<Navigate to={accessToken ? '/dashboard' : '/login'} replace />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
