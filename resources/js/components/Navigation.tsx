import { useState, useEffect, useRef } from 'react';
import { Link } from '@inertiajs/react';
import { Search, ShoppingCart, Facebook, Instagram, Youtube, Sun, Moon, Menu, X, Heart } from 'lucide-react';
import { login, register } from '@/routes';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import ProductSearchModal from '@/components/product-search-modal';
import CartDropdown from '@/components/CartDropdown';
import NotificationDropdown from '@/components/notifications/NotificationDropdown';
import HowItWorksModal from '@/components/HowItWorksModal';
import { Kbd } from '@/components/ui/kbd';
import { toast } from 'sonner';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';

export default function Navigation() {
    const { auth } = usePage<SharedData>().props;
    const { url } = usePage();
    const { wishlistCount } = useWishlist();
    const { totalItems } = useCart();
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const [showHowItWorks, setShowHowItWorks] = useState(false);
    const cartButtonRef = useRef<HTMLButtonElement>(null);
    
    // Helper function to check if a path is active
    const isActive = (path: string) => {
        // Get current pathname
        const currentPath = window.location.pathname;
        
        if (path === '/') {
            return currentPath === '/';
        }
        return currentPath.startsWith(path);
    };

    // Initialize theme from localStorage or system preference
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
            setIsDarkMode(true);
            document.documentElement.classList.add('dark');
        } else {
            setIsDarkMode(false);
            document.documentElement.classList.remove('dark');
        }
    }, []);

    // Toggle theme function
    const toggleTheme = () => {
        const newTheme = !isDarkMode;
        setIsDarkMode(newTheme);
        
        if (newTheme) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };


    // Handle search keyboard shortcut
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Check for Ctrl+K (Windows/Linux) or ⌘K (Mac)
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setSearchOpen(true);
            }
            if (e.key === 'Escape') {
                setSearchOpen(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700/80 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-14 gap-4">
                    {/* Logo - left */}
                    <Link href="/" className="flex items-center gap-2 shrink-0">
                        <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center shadow-sm">
                            <ShoppingCart className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-lg font-bold text-gray-900 dark:text-white hidden sm:inline">BarfFoods</span>
                    </Link>

                    {/* Search - center, flexible */}
                    <div className="flex-1 max-w-xl mx-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Search className="h-4 w-4" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="input-bs pl-10 pr-11 py-2 text-sm cursor-pointer"
                                readOnly
                                onClick={() => setSearchOpen(true)}
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:block">
                                <Kbd className="px-1.5 py-0.5 text-xs text-muted-foreground bg-muted/80 rounded border border-border">
                                    {navigator.platform.toLowerCase().includes('mac') ? '⌘K' : 'Ctrl+K'}
                                </Kbd>
                            </div>
                        </div>
                    </div>

                    {/* Right: nav links (desktop), actions */}
                    <div className="hidden lg:flex items-center gap-1">
                        <Link
                            href="/"
                            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                isActive('/') ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                        >
                            Home
                        </Link>
                        <Link
                            href="/about"
                            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                isActive('/about') ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                        >
                            About
                        </Link>
                        <button
                            onClick={() => setShowHowItWorks(true)}
                            className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            How it works
                        </button>
                        <Link
                            href="/contact"
                            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                isActive('/contact') ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                        >
                            Contact
                        </Link>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <Link
                            href="/wishlist"
                            className="p-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors relative"
                        >
                            <Heart className="h-5 w-5" />
                            {wishlistCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 min-w-[1.25rem] h-5 px-1 bg-emerald-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
                                    {wishlistCount > 9 ? '9+' : wishlistCount}
                                </span>
                            )}
                        </Link>
                        <button
                            ref={cartButtonRef}
                            onClick={() => setCartOpen(!cartOpen)}
                            className="p-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors relative"
                        >
                            <ShoppingCart className="h-5 w-5" />
                            {totalItems > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 min-w-[1.25rem] h-5 px-1 bg-emerald-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
                                    {totalItems > 9 ? '9+' : totalItems}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={toggleTheme}
                            className="hidden sm:flex p-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            title={isDarkMode ? 'Light mode' : 'Dark mode'}
                        >
                            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        </button>
                        {auth.user ? (
                            <Link
                                href={auth.user.role === 'super_admin' ? '/admin/dashboard' : '/dashboard'}
                                className="btn-primary-bs bg-emerald-600 text-white hover:bg-emerald-700 px-3 sm:px-4 py-2 text-sm"
                            >
                                <span className="hidden sm:inline">Dashboard</span>
                                <span className="sm:hidden">Dash</span>
                            </Link>
                        ) : (
                            <Link href={login.url()} className="btn-primary-bs bg-emerald-600 text-white hover:bg-emerald-700 px-3 sm:px-4 py-2 text-sm">
                                Login
                            </Link>
                        )}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden p-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                        >
                            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 py-3">
                        <div className="flex flex-col gap-0.5">
                            <Link href="/" className="px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
                            <Link href="/about" className="px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg" onClick={() => setIsMobileMenuOpen(false)}>About</Link>
                            <button onClick={() => { setShowHowItWorks(true); setIsMobileMenuOpen(false); }} className="px-3 py-2.5 text-sm font-medium text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">How it works</button>
                            <Link href="/contact" className="px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg" onClick={() => setIsMobileMenuOpen(false)}>Contact</Link>
                            <div className="flex items-center gap-4 pt-3 mt-2 border-t border-gray-200 dark:border-gray-700">
                                <button type="button" onClick={() => toast.info('Facebook coming soon')} className="text-gray-500 hover:text-emerald-600" aria-label="Facebook"><Facebook className="h-5 w-5" /></button>
                                <button type="button" onClick={() => toast.info('Instagram coming soon')} className="text-gray-500 hover:text-emerald-600" aria-label="Instagram"><Instagram className="h-5 w-5" /></button>
                                <button type="button" onClick={() => toast.info('YouTube coming soon')} className="text-gray-500 hover:text-emerald-600" aria-label="YouTube"><Youtube className="h-5 w-5" /></button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <ProductSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
            <CartDropdown isOpen={cartOpen} onClose={() => setCartOpen(false)} buttonRef={cartButtonRef} />
            <HowItWorksModal isOpen={showHowItWorks} onClose={() => setShowHowItWorks(false)} />
        </nav>
    );
}
