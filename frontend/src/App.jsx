import { Routes, Route } from 'react-router-dom'

// Public pages
import Home from './pages/public/Home'

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
    </Routes>
  )
}

export default App