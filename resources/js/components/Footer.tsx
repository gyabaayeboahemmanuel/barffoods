import { Link, usePage } from '@inertiajs/react';
import { Phone, Mail, MapPin } from 'lucide-react';
import { useState } from 'react';
import HowItWorksModal from './HowItWorksModal';

interface StoreAddress {
  company_name: string;
  phone: string;
  email: string;
  street_address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
}

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const { storeAddress } = usePage().props as any;

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">B</div>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">BarfFoods</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Fresh groceries delivered to your doorstep. Quality products from local stores.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Quick links</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-sm text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">About</Link></li>
              <li>
                <button onClick={() => setShowHowItWorks(true)} className="text-sm text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left">How it works</button>
              </li>
              <li><Link href="/products" className="text-sm text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Products</Link></li>
              <li><Link href="/stores" className="text-sm text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Stores</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Support</h3>
            <ul className="space-y-2">
              <li><Link href="/faq" className="text-sm text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">FAQ</Link></li>
              <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Contact</Link></li>
              <li><Link href="/track-order" className="text-sm text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Track order</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Contact</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{storeAddress?.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{storeAddress?.email}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                <span>
                  {storeAddress?.street_address}<br />
                  {storeAddress?.city}, {storeAddress?.state} {storeAddress?.zip_code}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground order-2 sm:order-1">
            © {currentYear} BarfFoods. All rights reserved.
          </p>
          <div className="flex items-center gap-4 order-1 sm:order-2">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Privacy</Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Terms</Link>
          </div>
        </div>
      </div>

      <HowItWorksModal isOpen={showHowItWorks} onClose={() => setShowHowItWorks(false)} />
    </footer>
  );
}
