import AppRoutes from './routes/routes'
import { SiteProvider } from './context/SiteContext'
import ScrollToTop from './components/ScrollToTop'

function App() {
  return (
    <SiteProvider>
      <ScrollToTop />
      <AppRoutes />
    </SiteProvider>
  )
}

export default App
