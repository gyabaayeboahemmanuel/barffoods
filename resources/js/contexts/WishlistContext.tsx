import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { toast } from 'sonner';

const GUEST_WISHLIST_KEY = 'barffoods_guest_wishlist';

interface WishlistItem {
    id: string;
    product: {
        id: string;
        name: string;
        price: number | string;
        originalPrice?: number | string;
        image: string;
        store: string;
        category: string;
        inStock: boolean;
    };
    added_at: string;
}

interface WishlistContextType {
    wishlistItems: WishlistItem[];
    wishlistCount: number;
    isLoading: boolean;
    addToWishlist: (productId: string) => Promise<void>;
    removeFromWishlist: (productId: string) => Promise<void>;
    toggleWishlist: (productId: string) => Promise<void>;
    isInWishlist: (productId: string) => boolean;
    refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

interface WishlistProviderProps {
    children: ReactNode;
    user: any;
}

function loadGuestWishlistFromStorage(): WishlistItem[] {
    try {
        const raw = localStorage.getItem(GUEST_WISHLIST_KEY);
        if (!raw) return [];
        const arr = JSON.parse(raw);
        return Array.isArray(arr) ? arr : [];
    } catch {
        return [];
    }
}

function saveGuestWishlistToStorage(items: WishlistItem[]): void {
    localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(items));
}

export function WishlistProvider({ children, user }: WishlistProviderProps) {
    const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const wishlistCount = wishlistItems.length;

    const fetchWishlist = useCallback(async () => {
        if (user) {
            setIsLoading(true);
            try {
                const response = await fetch('/api/wishlist', {
                    headers: {
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setWishlistItems(data.wishlist_items || []);
                }
            } catch (error) {
                console.error('Error fetching wishlist:', error);
            } finally {
                setIsLoading(false);
            }
        } else {
            // Guest: load from localStorage
            setWishlistItems(loadGuestWishlistFromStorage());
        }
    }, [user]);

    const addToWishlist = async (productId: string) => {
        if (user) {
            try {
                const response = await fetch('/api/wishlist', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                    body: JSON.stringify({ product_id: productId }),
                });

                const data = await response.json();

                if (data.success) {
                    toast.success('Added to wishlist', {
                        description: 'Product has been added to your wishlist.',
                    });
                    await fetchWishlist();
                } else {
                    toast.error('Failed to add to wishlist', {
                        description: data.message || 'Please try again.',
                    });
                }
            } catch (error) {
                console.error('Error adding to wishlist:', error);
                toast.error('Failed to add to wishlist', { description: 'Please try again.' });
            }
            return;
        }

        // Guest: fetch product then store in localStorage
        if (wishlistItems.some(item => item.product.id === productId)) {
            toast.info('Already in wishlist', { description: 'This product is already in your wishlist.' });
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`/api/products/${productId}`, {
                headers: { 'Accept': 'application/json' },
            });
            if (!response.ok) throw new Error('Product not found');
            const data = await response.json();
            const p = data.product || data;
            const storeName = typeof p.store === 'string' ? p.store : (p.store?.name ?? '');
            const categoryName = typeof p.category === 'string' ? p.category : (p.category?.name ?? '');
            const item: WishlistItem = {
                id: `guest_${p.id}_${Date.now()}`,
                product: {
                    id: String(p.id),
                    name: p.name ?? '',
                    price: p.price ?? 0,
                    originalPrice: p.original_price ?? p.originalPrice,
                    image: p.image ?? '',
                    store: storeName,
                    category: categoryName,
                    inStock: p.inStock ?? (p.stock_quantity ?? 0) > 0,
                },
                added_at: new Date().toISOString(),
            };
            const next = [...loadGuestWishlistFromStorage(), item];
            saveGuestWishlistToStorage(next);
            setWishlistItems(next);
            toast.success('Added to wishlist', {
                description: 'Product has been added to your wishlist.',
            });
        } catch (error) {
            console.error('Error adding to wishlist:', error);
            toast.error('Failed to add to wishlist', { description: 'Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    const removeFromWishlist = async (productId: string) => {
        if (user) {
            try {
                const response = await fetch(`/api/wishlist/${productId}`, {
                    method: 'DELETE',
                    headers: {
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                });

                const data = await response.json();

                if (data.success) {
                    toast.success('Removed from wishlist', {
                        description: 'Product has been removed from your wishlist.',
                    });
                    await fetchWishlist();
                } else {
                    toast.error('Failed to remove from wishlist', {
                        description: data.message || 'Please try again.',
                    });
                }
            } catch (error) {
                console.error('Error removing from wishlist:', error);
                toast.error('Failed to remove from wishlist', { description: 'Please try again.' });
            }
            return;
        }

        // Guest: remove from localStorage
        const next = loadGuestWishlistFromStorage().filter(item => item.product.id !== productId);
        saveGuestWishlistToStorage(next);
        setWishlistItems(next);
        toast.success('Removed from wishlist', {
            description: 'Product has been removed from your wishlist.',
        });
    };

    const toggleWishlist = async (productId: string) => {
        if (isInWishlist(productId)) {
            await removeFromWishlist(productId);
        } else {
            await addToWishlist(productId);
        }
    };

    const isInWishlist = (productId: string): boolean => {
        return wishlistItems.some(item => item.product.id === productId);
    };

    const refreshWishlist = async () => {
        await fetchWishlist();
    };

    useEffect(() => {
        fetchWishlist();
    }, [fetchWishlist]);

    const hasMergedGuestRef = useRef(false);
    // When user logs in, merge guest wishlist into their account once and clear localStorage
    useEffect(() => {
        if (!user?.id) {
            hasMergedGuestRef.current = false;
            return;
        }
        const guestItems = loadGuestWishlistFromStorage();
        if (guestItems.length === 0 || hasMergedGuestRef.current) return;
        hasMergedGuestRef.current = true;

        const merge = async () => {
            for (const item of guestItems) {
                try {
                    await fetch('/api/wishlist', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                        },
                        body: JSON.stringify({ product_id: item.product.id }),
                    });
                } catch {
                    // ignore per-item errors
                }
            }
            saveGuestWishlistToStorage([]);
            await fetchWishlist();
        };
        merge();
    }, [user?.id]);

    const value: WishlistContextType = {
        wishlistItems,
        wishlistCount,
        isLoading,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        refreshWishlist,
    };

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
}
