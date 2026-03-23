const express = require('express')
const cloudinary = require('../config/cloudinary')

const router = express.Router()

// POST /api/upload/sign
router.post('/sign', (req, res) => {
  try {
    const timestamp = Math.round(Date.now() / 1000)

    // No upload_preset in paramsToSign for signed uploads
    const paramsToSign = { timestamp }

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET
    )
    res.json({
      signature,
      timestamp,
      api_key: process.env.CLOUDINARY_API_KEY,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    })
  } catch (err) {
    console.error('Sign error:', err)
    res.status(500).json({ error: 'Failed to generate signature' })
  }
})

module.exports = router