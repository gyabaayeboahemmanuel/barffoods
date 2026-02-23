import { Head, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import HeroCarousel from '@/components/HeroCarousel';
import FeaturesSection from '@/components/FeaturesSection';
import ShopByCategory from '@/components/ShopByCategory';
import ShopByStore from '@/components/ShopByStore';
import ProductSection from '@/components/ProductSection';
import StoreLocationsMap from '@/components/StoreLocationsMap';
import Footer from '@/components/Footer';
import { LocationProvider } from '@/contexts/LocationContext';
import { MapPin, X, Navigation as NavigationIcon } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

interface PageProps {
    nearbyStores: Array<{
        id: string;
        name: string;
        address: string;
        phone: string;
        latitude: number;
        longitude: number;
        delivery_radius: number;
        min_order_amount: number;
        delivery_fee: number;
        distance: number;
    }>;
    allStores: Array<{
        id: string;
        name: string;
        address: string;
        phone: string;
        latitude: number;
        longitude: number;
        delivery_radius: number;
        min_order_amount: number;
        delivery_fee: number;
        distance: number;
    }>;
    products: Array<{
        id: string;
        name: string;
        price: number | string;
        originalPrice?: number | string | null;
        rating: number | string;
        reviews: number | string;
        image: string;
        store: string;
        category: string;
        badges?: Array<{ text: string; color: 'red' | 'orange' | 'green' | 'yellow' | 'blue' | 'brown' | 'purple' }>;
    }>;
    categories: Array<{
        id: string;
        name: string;
        product_count: number;
    }>;
    userLocation: {
        latitude: number;
        longitude: number;
    };
    defaultMapLocation: {
        latitude: number;
        longitude: number;
        address: string;
        zoom: number;
    };
    [key: string]: any;
}

export default function Welcome() {
    const { props } = usePage<PageProps>();
    const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
    const [selectedStores, setSelectedStores] = useState<string[]>([]);
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [locationBannerDismissed, setLocationBannerDismissed] = useState(false);
    const [locationInput, setLocationInput] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    // No longer show location modal automatically — let users browse first.
    // They can set location via the optional banner or from the map section.
    useEffect(() => {
        const savedLocation = localStorage.getItem('barffoods_user_location');

        if (savedLocation) {
            const location = JSON.parse(savedLocation);

            if (location.latitude !== props.userLocation.latitude ||
                location.longitude !== props.userLocation.longitude) {
                router.get('/', {
                    latitude: location.latitude,
                    longitude: location.longitude
                }, {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true
                });
            }
        }
    }, []);

    // Search and save location
    const saveLocation = async () => {
        if (!locationInput.trim()) {
            toast.error('Please enter your location');
            return;
        }

        setIsSearching(true);

        try {
            // Geocode the location
            const response = await axios.get('https://nominatim.openstreetmap.org/search', {
                params: {
                    q: locationInput,
                    format: 'json',
                    limit: 1,
                    addressdetails: 1
                },
                headers: {
                    'User-Agent': 'BarfFoods-Store-Locator'
                }
            });

            if (response.data && response.data.length > 0) {
                const location = response.data[0];
                const lat = parseFloat(location.lat);
                const lng = parseFloat(location.lon);

                // Save to localStorage
                const locationData = {
                    latitude: lat,
                    longitude: lng,
                    address: location.display_name,
                    savedAt: new Date().toISOString()
                };
                localStorage.setItem('barffoods_user_location', JSON.stringify(locationData));

                // Update page with new location
                router.get('/', {
                    latitude: lat,
                    longitude: lng
                }, {
                    preserveState: false,
                    preserveScroll: false,
                    replace: true,
                    onSuccess: () => {
                        setShowLocationModal(false);
                        toast.success(`✅ Location saved: ${location.display_name}`);
                    }
                });
            } else {
                toast.error('Location not found. Please try a different address.');
            }
        } catch (error) {
            console.error('Geocoding error:', error);
            toast.error('Failed to find location. Please try again.');
        } finally {
            setIsSearching(false);
        }
    };

    // Skip and use default location
    const skipLocationSetup = () => {
        const defaultLocation = {
            latitude: 40.7128,
            longitude: -74.0060,
            address: 'New York, NY (Default)',
            savedAt: new Date().toISOString()
        };
        localStorage.setItem('barffoods_user_location', JSON.stringify(defaultLocation));
        setShowLocationModal(false);
        toast.info('Using default location. You can update it anytime from the map.');
    };

    const hasLocation = () => !!localStorage.getItem('barffoods_user_location');

    // Use browser geolocation
    const useAutoDetect = () => {
        setIsSearching(true);
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                // Save to localStorage
                const locationData = {
                    latitude: lat,
                    longitude: lng,
                    address: 'Auto-detected location',
                    savedAt: new Date().toISOString()
                };
                localStorage.setItem('barffoods_user_location', JSON.stringify(locationData));

                // Update page
                router.get('/', {
                    latitude: lat,
                    longitude: lng
                }, {
                    preserveState: false,
                    preserveScroll: false,
                    replace: true,
                    onSuccess: () => {
                        setShowLocationModal(false);
                        toast.success('✅ Location detected and saved!');
                        setIsSearching(false);
                    }
                });
            },
            (error) => {
                setIsSearching(false);
                toast.error('Could not detect location. Please enter it manually.');
                console.error('Geolocation error:', error);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    return (
        <>
            <Head title="BarfFoods - Fresh Groceries Delivered">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>
            
            <LocationProvider
                initialLocation={props.userLocation}
                initialNearbyStores={props.nearbyStores}
                initialAllStores={props.allStores}
            >
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900/50">
                {!hasLocation() && !locationBannerDismissed && (
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-200/80 dark:border-emerald-800/50">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-sm text-emerald-800 dark:text-emerald-200">
                                    Set your location to see nearby stores and delivery estimates — optional.
                                </p>
                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={() => setShowLocationModal(true)}
                                        className="px-3 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                                    >
                                        Set location
                                    </button>
                                    <button
                                        onClick={() => setLocationBannerDismissed(true)}
                                        className="p-2 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-800/40 transition-colors"
                                        title="Dismiss"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {showLocationModal && (
                    <div className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center p-4">
                        <div className="card-bs max-w-lg w-full p-6 sm:p-8 relative shadow-xl">
                            <button
                                onClick={skipLocationSetup}
                                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-muted-foreground"
                                title="Skip for now"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            <div className="text-center mb-6">
                                <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mb-4">
                                    <MapPin className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                                    Set your location (optional)
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    We’ll show nearby stores and delivery estimates. You can skip and browse all stores.
                                </p>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        Enter your location
                                    </label>
                                    <input
                                        type="text"
                                        value={locationInput}
                                        onChange={(e) => setLocationInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && saveLocation()}
                                        placeholder="e.g. city or full address"
                                        className="input-bs px-4 py-2.5"
                                        disabled={isSearching}
                                        autoFocus
                                    />
                                </div>

                                <button
                                    onClick={saveLocation}
                                    disabled={isSearching || !locationInput.trim()}
                                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:pointer-events-none text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    {isSearching ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                            <span>Finding location...</span>
                                        </>
                                    ) : (
                                        <>
                                            <MapPin className="h-4 w-4" />
                                            <span>Save location</span>
                                        </>
                                    )}
                                </button>

                                <div className="relative py-2">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-200 dark:border-gray-600" />
                                    </div>
                                    <span className="relative flex justify-center text-xs text-muted-foreground bg-white dark:bg-gray-800 px-2">or</span>
                                </div>

                                <button
                                    onClick={useAutoDetect}
                                    disabled={isSearching}
                                    className="w-full py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <NavigationIcon className="h-4 w-4" />
                                    <span>Use my location</span>
                                </button>

                                <button
                                    onClick={skipLocationSetup}
                                    className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Skip for now
                                </button>
                            </div>

                            <div className="rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 p-3">
                                <p className="text-xs text-muted-foreground">
                                    Your location is stored on your device and can be changed anytime from the store map.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
                
                <Navigation />

                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    <HeroCarousel />
                </section>

                {/* Features Section */}
                <FeaturesSection />

                {/* Shop By Category */}
                <ShopByCategory 
                    onCategorySelect={setSelectedCategory} 
                    selectedCategory={selectedCategory}
                />

                {/* Shop By Store */}
                <ShopByStore 
                    onStoreSelect={(storeName) => {
                        setSelectedStores(prev => 
                            prev.includes(storeName) 
                                ? prev.filter(s => s !== storeName)
                                : [...prev, storeName]
                        );
                    }}
                    selectedStores={selectedStores}
                />

                {/* Product Section */}
                <div id="products">
                    <ProductSection 
                        nearbyStores={props.nearbyStores}
                        allStores={props.allStores}
                        initialProducts={props.products}
                        initialCategories={props.categories}
                        selectedCategory={selectedCategory}
                        onCategoryChange={setSelectedCategory}
                        externalSelectedStores={selectedStores}
                        onStoresChange={setSelectedStores}
                    />
                </div>
                
                {/* Store Locations & Delivery Zones */}
                <StoreLocationsMap defaultMapLocation={props.defaultMapLocation} onOpenLocationModal={() => setShowLocationModal(true)} />
                
                {/* Footer */}
                <Footer />
                </div>
            </LocationProvider>
        </>
    );
}