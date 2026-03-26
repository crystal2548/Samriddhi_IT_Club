const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())

// Routes
const uploadRoutes = require('./routes/uplode')
const inviteRoutes = require('./routes/inviteRoutes')

app.use('/api/upload', uploadRoutes)
app.use('/api/invite', inviteRoutes)

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Samriddhi IT Club API is running!' })
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})