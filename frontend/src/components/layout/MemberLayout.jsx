import { Outlet } from 'react-router-dom'
import Navbar from '../layout/Navbar'
import MemberSidebar from '../layout/MemberSidebar'

export default function MemberLayout() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="flex flex-1">
        <MemberSidebar />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
