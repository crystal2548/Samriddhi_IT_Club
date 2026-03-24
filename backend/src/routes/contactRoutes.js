const express = require('express');
const { sendContactEmail } = require('../controllers/contactController');

const router = express.Router();

router.post('/send', sendContactEmail);

module.exports = router;
