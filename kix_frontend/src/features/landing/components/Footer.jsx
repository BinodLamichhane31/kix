import { Instagram, Twitter, Facebook, Youtube, ArrowUpRight } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white dark:bg-brand-black border-t border-gray-200 dark:border-white/10 pt-20 pb-10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="space-y-6">
            <a href="#" className="text-3xl font-black tracking-tighter text-gray-900 dark:text-white italic block">
              KIX<span className="text-brand-accent">.</span>
            </a>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              Redefining footwear through technology and craftsmanship. Designed by you, crafted by us.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-brand-black dark:hover:text-brand-accent transition-colors"><Instagram size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-brand-black dark:hover:text-brand-accent transition-colors"><Twitter size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-brand-black dark:hover:text-brand-accent transition-colors"><Facebook size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-brand-black dark:hover:text-brand-accent transition-colors"><Youtube size={20} /></a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-gray-900 dark:text-white font-bold uppercase tracking-wider mb-6">Shop</h4>
            <ul className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
              <li><a href="#" className="hover:text-brand-black dark:hover:text-brand-accent transition-colors">New Arrivals</a></li>
              <li><a href="#" className="hover:text-brand-black dark:hover:text-brand-accent transition-colors">Best Sellers</a></li>
              <li><a href="#" className="hover:text-brand-black dark:hover:text-brand-accent transition-colors">Men's Shoes</a></li>
              <li><a href="#" className="hover:text-brand-black dark:hover:text-brand-accent transition-colors">Women's Shoes</a></li>
              <li><a href="#" className="hover:text-brand-black dark:hover:text-brand-accent transition-colors">Sale</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-gray-900 dark:text-white font-bold uppercase tracking-wider mb-6">Support</h4>
            <ul className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
              <li><a href="#" className="hover:text-brand-black dark:hover:text-brand-accent transition-colors">Track Order</a></li>
              <li><a href="#" className="hover:text-brand-black dark:hover:text-brand-accent transition-colors">Returns & Exchanges</a></li>
              <li><a href="#" className="hover:text-brand-black dark:hover:text-brand-accent transition-colors">Size Guide</a></li>
              <li><a href="#" className="hover:text-brand-black dark:hover:text-brand-accent transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-brand-black dark:hover:text-brand-accent transition-colors">FAQs</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-gray-900 dark:text-white font-bold uppercase tracking-wider mb-6">Stay in the Loop</h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Subscribe for exclusive drops and early access.</p>
            <form className="flex flex-col space-y-3">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-brand-black dark:focus:border-brand-accent transition-colors"
              />
              <button className="bg-brand-black dark:bg-white text-white dark:text-brand-black font-bold py-3 rounded-lg hover:bg-gray-800 dark:hover:bg-brand-accent transition-colors flex items-center justify-center space-x-2">
                <span>Subscribe</span>
                <ArrowUpRight size={16} />
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <p>&copy; 2024 KIX Inc. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Cookie Settings</a>
          </div>
        </div>

      </div>
    </footer>
  );
}

