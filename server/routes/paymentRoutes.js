const express = require('express')
const router = express.Router()
const { createPaymentOrder, verifyPayment } = require('../controllers/paymentController')
const { protect } = require('../middleware/authMiddleware')
const { requireDatabase } = require('../middleware/dbMiddleware')

router.post('/create-order', requireDatabase, protect, createPaymentOrder)
router.post('/verify', requireDatabase, protect, verifyPayment)

module.exports = router
