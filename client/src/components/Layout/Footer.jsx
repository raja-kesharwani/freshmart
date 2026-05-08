import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="bg-gray-900 text-white px-4 sm:px-6 lg:px-10 py-10 sm:py-12 mt-8">
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7 sm:gap-8 mb-8">
        
        {/* Brand */}
        <div>
          <h2 className="text-2xl font-bold text-green-400 mb-3">🛒 FreshMart</h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            Shop from thousands of farm-fresh fruits, vegetables, dairy and daily essentials at unbeatable prices.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-bold text-lg mb-4">Quick Links</h3>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li><Link to="/" className="block hover:text-green-400 py-0.5">Home</Link></li>
            <li><Link to="/shop" className="block hover:text-green-400 py-0.5">Shop</Link></li>
            <li><Link to="/fresh" className="block hover:text-green-400 py-0.5">Fresh Produce</Link></li>
            <li><Link to="/deals" className="block hover:text-green-400 py-0.5">Deals</Link></li>
            <li><Link to="/about" className="block hover:text-green-400 py-0.5">About Us</Link></li>
          </ul>
        </div>

        {/* Customer Service */}
        <div>
          <h3 className="font-bold text-lg mb-4">Customer Service</h3>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li><Link to="/faqs" className="block hover:text-green-400 py-0.5">FAQs</Link></li>
            <li><Link to="/policy" className="block hover:text-green-400 py-0.5">Shipping Policy</Link></li>
            <li><Link to="/policy" className="block hover:text-green-400 py-0.5">Return Policy</Link></li>
            <li><Link to="/orders" className="block hover:text-green-400 py-0.5">Track Order</Link></li>
            <li><Link to="/help" className="block hover:text-green-400 py-0.5">Help & Support</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-bold text-lg mb-4">Contact Us</h3>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li>📧 rajakesharwani2628@gmail.com</li>
            <li>📞+91 82xxxx20</li>
            <li>📍Greater Noida, Uttar Pradesh</li>
          </ul>
          <div className="mt-4">
            <p className="text-sm text-gray-300 mb-2">Download App</p>
            <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-2">
              <a
                href="#"
                className="inline-flex items-center justify-center gap-2 bg-gray-700 px-3 py-2.5 rounded-lg text-xs cursor-pointer hover:bg-green-500 transition-colors min-h-10"
                aria-label="Download on the App Store"
              >
                <img src="/store/apple.svg" alt="Apple logo" className="w-3.5 h-3.5" />
                <span>App Store</span>
              </a>
              <a
                href="#"
                className="inline-flex items-center justify-center gap-2 bg-gray-700 px-3 py-2.5 rounded-lg text-xs cursor-pointer hover:bg-green-500 transition-colors min-h-10"
                aria-label="Get it on Google Play"
              >
                <img src="/store/google-play.svg" alt="Google Play logo" className="w-3.5 h-3.5" />
                <span>Play Store</span>
              </a>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom */}
      <div className="border-t border-gray-700 pt-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between text-gray-300 text-sm">
        <p className="text-center sm:text-left">© 2026 FreshMart. All rights reserved.</p>
        <div className="flex justify-center sm:justify-start gap-4">
          <Link to="/policy" className="hover:text-green-400">Privacy Policy</Link>
          <Link to="/policy" className="hover:text-green-400">Terms of Service</Link>
        </div>
      </div>

    </footer>
  )
}

export default Footer
