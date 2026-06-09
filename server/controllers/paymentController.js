const Razorpay = require('razorpay')
const crypto = require('crypto')

const getRazorpayKeyId = () => (process.env.RAZORPAY_KEY_ID || '').trim()
const getRazorpayKeySecret = () => (process.env.RAZORPAY_KEY_SECRET || '').trim()

const razorpay = new Razorpay({
  key_id: getRazorpayKeyId(),
  key_secret: getRazorpayKeySecret()
})

const getPaymentConfig = (req, res) => {
  const keyId = getRazorpayKeyId()

  if (!keyId) {
    return res.status(500).json({ message: 'Razorpay key is not configured' })
  }

  res.status(200).json({ keyId })
}

// Create order
const createPaymentOrder = async (req, res) => {
  try {
    if (!getRazorpayKeyId() || !getRazorpayKeySecret()) {
      return res.status(500).json({ message: 'Razorpay credentials are not configured' })
    }

    const { amount } = req.body

    const options = {
      amount: amount * 100, // Razorpay needs amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    }

    const order = await razorpay.orders.create(options)
    res.status(200).json(order)

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Verify payment
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

    const sign = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSign = crypto
      .createHmac('sha256', getRazorpayKeySecret())
      .update(sign)
      .digest('hex')

    if (razorpay_signature === expectedSign) {
      res.status(200).json({ success: true, message: 'Payment verified successfully' })
    } else {
      res.status(400).json({ success: false, message: 'Payment verification failed' })
    }

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = { getPaymentConfig, createPaymentOrder, verifyPayment }
