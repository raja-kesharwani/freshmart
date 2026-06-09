import { useState } from 'react'
import { useCart } from '../context/useCart'
import { useAuth } from '../context/useAuth'
import { useNavigate } from 'react-router-dom'
import API from '../services/api'
import { resolveProductImage } from '../utils/productImage'

const PINCODE_REGEX = /^\d+$/
const RAZORPAY_KEY_ID = (import.meta.env.VITE_RAZORPAY_KEY_ID || '').trim()
const sanitizePincode = (value) => String(value || '').replace(/\D/g, '')
const isConfiguredRazorpayKey = (key) => key && key !== 'your_razorpay_key_id'

const getRazorpayKeyId = async () => {
  if (isConfiguredRazorpayKey(RAZORPAY_KEY_ID)) {
    return RAZORPAY_KEY_ID
  }

  const { data } = await API.get('/payment/config')
  return (data.keyId || '').trim()
}

function Checkout() {
  const { cartItems, cartTotal, clearCart, refreshCartStock } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [address, setAddress] = useState({
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    pincode: user?.address?.pincode || ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setAddress({
      ...address,
      [name]: name === 'pincode' ? sanitizePincode(value) : value
    })
  }

  const handleOrder = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    if (cartItems.length === 0) {
      setError('Your cart is empty')
      return
    }

    const deliveryAddress = {
      street: address.street.trim(),
      city: address.city.trim(),
      state: address.state.trim(),
      pincode: sanitizePincode(address.pincode)
    }

    if (!deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.state || !deliveryAddress.pincode) {
      setError('Please fill in all address fields')
      return
    }

    if (!PINCODE_REGEX.test(deliveryAddress.pincode)) {
      setError('Pincode should contain numbers only')
      return
    }

    if (!window.Razorpay) {
      setError('Payment gateway is not available')
      return
    }

    setLoading(true)
    setError('')

    try {
      const razorpayKeyId = await getRazorpayKeyId()

      if (!isConfiguredRazorpayKey(razorpayKeyId)) {
        setError('Payment key is not configured')
        setLoading(false)
        return
      }

      const latestCartItems = await refreshCartStock()
      const orderItems = latestCartItems.length > 0 ? latestCartItems : cartItems
      const unavailableItem = orderItems.find((item) => Number.isFinite(Number(item.stock)) && Number(item.stock) <= 0)
      const exceededStockItem = orderItems.find((item) => {
        const stock = Number(item.stock)
        return Number.isFinite(stock) && stock > 0 && item.quantity > stock
      })
      const orderTotal = orderItems.reduce((acc, item) => acc + (Number(item.price) || 0) * item.quantity, 0)

      if (unavailableItem) {
        setError(`${unavailableItem.name} is out of stock`)
        setLoading(false)
        return
      }

      if (exceededStockItem) {
        setError(`Only ${exceededStockItem.stock} ${exceededStockItem.name} available in stock`)
        setLoading(false)
        return
      }

      // Step 1 — Create Razorpay order from backend
      const { data } = await API.post('/payment/create-order', {
        amount: orderTotal
      })

      // Step 2 — Open Razorpay checkout
      const options = {
        key: razorpayKeyId,
        amount: data.amount,
        currency: 'INR',
        name: 'FreshMart',
        description: 'Fresh Groceries Order',
        order_id: data.id,
        handler: async (response) => {
          try {
            // Step 3 — Verify payment
            const { data: verifyData } = await API.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })

            if (verifyData.success) {
              // Step 4 — Save order in database after payment verification
              await API.post('/orders', {
                items: orderItems.map((item) => ({
                  product: item._id,
                  quantity: item.quantity,
                  price: item.price,
                  name: item.name,
                  image: resolveProductImage(item.name, item.image)
                })),
                deliveryAddress
              })

              clearCart()
              navigate('/order-success')
            } else {
              setError('Payment verification failed')
            }
          } catch (error) {
            setError(error.response?.data?.message || 'Payment succeeded but order could not be saved')
          } finally {
            setLoading(false)
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: '#22c55e'
        }
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()

    } catch (error) {
      setError(error.response?.data?.message || 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-10 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Checkout</h1>

      {cartItems.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 max-w-xl">
          <p className="text-gray-600 mb-4">Your cart is empty.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-semibold"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Address Form */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Delivery Address</h2>

            {error && (
              <div className="bg-red-50 text-red-500 text-sm px-4 py-3 rounded-xl mb-4">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Street Address</label>
                <input
                  type="text"
                  name="street"
                  placeholder=""
                  value={address.street}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">City</label>
                  <input
                    type="text"
                    name="city"
                    placeholder=""
                    value={address.city}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-400"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">State</label>
                  <input
                    type="text"
                    name="state"
                    placeholder=""
                    value={address.state}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-1 block">Pincode</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  name="pincode"
                  placeholder=""
                  value={address.pincode}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-400"
                />
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-fit">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>

            <div className="space-y-3 mb-4">
              {cartItems.map((item) => (
                <div key={item._id} className="flex justify-between text-sm text-gray-600">
                  <span>{item.name} x{item.quantity}</span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-3 flex justify-between font-bold text-gray-800 mb-6">
              <span>Total</span>
              <span>₹{cartTotal}</span>
            </div>

            <button
              onClick={handleOrder}
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Pay with Razorpay →'}
            </button>
          </div>

        </div>
      )}
    </div>
  )
}

export default Checkout
