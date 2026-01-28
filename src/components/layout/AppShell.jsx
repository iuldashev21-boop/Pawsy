import { Outlet, useLocation } from 'react-router-dom'
import AppHeader from './AppHeader'
import AppSidebar from './AppSidebar'
import BottomNav from './BottomNav'

function AmbientBackground() {
  return (
    <div className="hidden md:block fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div
        className="absolute -top-32 right-[10%] w-[700px] h-[700px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(244,162,97,0.06) 0%, rgba(244,162,97,0.02) 40%, transparent 70%)' }}
      />
      <div
        className="absolute top-[60%] -left-48 w-[600px] h-[600px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(126,200,200,0.05) 0%, rgba(126,200,200,0.015) 40%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-0 right-[30%] w-[400px] h-[400px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(232,146,79,0.03) 0%, transparent 60%)' }}
      />
    </div>
  )
}

function AppShell() {
  const { pathname } = useLocation()
  const isDashboard = pathname === '/dashboard'

  return (
    <div
      className="min-h-screen md:h-screen relative dashboard-grain md:flex md:flex-col md:overflow-hidden"
      style={{
        background: isDashboard
          ? 'linear-gradient(180deg, #FDF8F3 0%, #FFF5ED 100%)'
          : '#FAF6F1',
      }}
    >
      <AmbientBackground />

      <AppHeader />

      <div className="flex md:flex-1 md:min-h-0">
        <AppSidebar />

        <main className="flex-1 min-w-0 pb-24 md:pb-0 md:overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <BottomNav />
    </div>
  )
}

export default AppShell
