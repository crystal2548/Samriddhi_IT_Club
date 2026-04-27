import { Outlet } from 'react-router-dom'
import Navbar from '../layout/Navbar'
import MemberSidebar from '../layout/MemberSidebar'

export default function MemberLayout() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />
      <div style={{ display: 'flex', paddingTop: '64px' }}>
        <MemberSidebar />
        <main style={{ flex: 1, padding: '32px', overflowY: 'auto', minHeight: 'calc(100vh - 64px)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
