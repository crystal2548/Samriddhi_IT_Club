import AppRoutes from './routes/routes'
import { SiteProvider } from './context/SiteContext'

function App() {
  return (
    <SiteProvider>
      <AppRoutes />
    </SiteProvider>
  )
}

export default App
