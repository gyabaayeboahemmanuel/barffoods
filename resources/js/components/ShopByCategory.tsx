import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

interface Category {
    id: number;
    name: string;
    itemCount: number;
    image: string;
    imageUrl: string | null;
    backgroundColor: string;
}

interface ShopByCategoryProps {
    onCategorySelect?: (categoryName: string) => void;
    selectedCategory?: string;
}

// Fallback when category has no product image (color only; no emoji/box)
const defaultCategoryStyle = { image: '', backgroundColor: 'bg-gray-50 dark:bg-gray-800' };
const categoryColorMap: { [key: string]: string } = {
    'Fruits & Vegetables': 'bg-pink-50 dark:bg-pink-900/20',
    'Dairy & Eggs': 'bg-blue-50 dark:bg-blue-900/20',
    'Meat & Seafood': 'bg-red-50 dark:bg-red-900/20',
    'Bakery': 'bg-orange-50 dark:bg-orange-900/20',
    'Beverages': 'bg-green-50 dark:bg-green-900/20',
    'Snacks': 'bg-yellow-50 dark:bg-yellow-900/20',
    'Pantry Essentials': 'bg-gray-50 dark:bg-gray-800',
    'Frozen Foods': 'bg-blue-50 dark:bg-blue-900/20',
    'Health & Wellness': 'bg-green-50 dark:bg-green-900/20',
    'Household': 'bg-purple-50 dark:bg-purple-900/20',
};

export default function ShopByCategory({ onCategorySelect, selectedCategory }: ShopByCategoryProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    const scrollPositionRef = useRef(0);
    const [categories, setCategories] = useState<Category[]>([]);

    // Fetch categories from API
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('/api/products');
                const apiCategories = response.data.categories;
                
                // Map API categories to component format; use first product image when available
                const mappedCategories: Category[] = apiCategories.map((cat: any) => {
                    const imageUrl = cat.first_product_image && (cat.first_product_image.startsWith('http') || cat.first_product_image.startsWith('/')) ? cat.first_product_image : null;
                    const backgroundColor = categoryColorMap[cat.name] || defaultCategoryStyle.backgroundColor;
                    return {
                        id: parseInt(cat.id),
                        name: cat.name,
                        itemCount: cat.product_count || 0,
                        image: '', // unused when imageUrl is set
                        imageUrl,
                        backgroundColor
                    };
                });
                
                setCategories(mappedCategories);
            } catch (error) {
                console.error('Error fetching categories:', error);
                setCategories([]); // Empty array on error, no fallback data
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        const scrollContainer = scrollRef.current;
        if (!scrollContainer) return;

        let animationId: number;
        const scrollSpeed = 0.5; // pixels per frame

        const animate = () => {
            if (!isHovered) {
                scrollPositionRef.current += scrollSpeed;
                const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
                
                if (scrollPositionRef.current >= maxScroll) {
                    scrollPositionRef.current = 0;
                }
                
                scrollContainer.scrollLeft = scrollPositionRef.current;
            }
            animationId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        };
    }, [isHovered]);

    return (
        <div className="w-full py-10 bg-gray-50/80 dark:bg-gray-900/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="section-title text-center mb-2">Shop by category</h2>
                <p className="section-subtitle text-center mb-6">Browse our range of fresh products</p>

                <div className="relative overflow-hidden">
                    <div
                        ref={scrollRef}
                        className="flex gap-3 overflow-x-hidden scrollbar-hide"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                    >
                        {[...categories, ...categories, ...categories].map((category, index) => (
                            <div
                                key={`${category.id}-${index}`}
                                className={`card-bs flex-shrink-0 w-44 p-4 cursor-pointer group relative transition-shadow ${
                                    selectedCategory === category.name
                                        ? 'ring-2 ring-emerald-500 shadow-md'
                                        : 'hover:shadow-md'
                                }`}
                                onClick={() => {
                                    // Toggle selection: if already selected, deselect (pass undefined)
                                    const isDeselecting = selectedCategory === category.name;
                                    
                                    if (isDeselecting) {
                                        onCategorySelect?.(undefined as any);
                                    } else {
                                        onCategorySelect?.(category.name);
                                        
                                        // Only scroll to products section when selecting (not deselecting)
                                        setTimeout(() => {
                                            const productsSection = document.getElementById('products-section');
                                            if (productsSection) {
                                                productsSection.scrollIntoView({ 
                                                    behavior: 'smooth', 
                                                    block: 'start' 
                                                });
                                            }
                                        }, 100);
                                    }
                                }}
                            >
                                {/* Selected indicator with close icon on hover */}
                                {selectedCategory === category.name && (
                                    <div className="absolute top-2 right-2 group/close">
                                        <div className="w-5 h-5 bg-emerald-500 group-hover/close:bg-red-500 rounded-full flex items-center justify-center shadow-sm transition-colors">
                                            <svg className="w-3 h-3 text-white group-hover/close:hidden" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            <svg className="w-3 h-3 text-white hidden group-hover/close:block" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                )}
                                {/* Category Image - first product in category or placeholder */}
                                <div className="flex justify-center items-center mb-3 h-14 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700/50">
                                    {category.imageUrl ? (
                                        <img
                                            src={category.imageUrl}
                                            alt={category.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                    ) : (
                                        <span className="text-4xl text-gray-400 dark:text-gray-500">📦</span>
                                    )}
                                </div>

                                {/* Category Info */}
                                <div className="text-center">
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                                        {category.name}
                                    </h3>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                        Item ({category.itemCount})
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
