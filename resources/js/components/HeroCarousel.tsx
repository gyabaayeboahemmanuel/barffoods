import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselSlide {
    id: number;
    image: string;
    imageAlt: string;
}

const slides: CarouselSlide[] = [
    {
        id: 1,
        image: "/assets/images/banner1.png",
        imageAlt: "Fresh vegetables and fruits basket"
    },
    {
        id: 2,
        image: "/assets/images/banner2.png",
        imageAlt: "Fresh fruits assortment"
    },
    {
        id: 3,
        image: "/assets/images/banner3.png",
        imageAlt: "Fresh vegetables discount"
    },
    {
        id: 4,
        image: "/assets/images/banner4.png",
        imageAlt: "Premium quality produce"
    },
    {
        id: 5,
        image: "/assets/images/banner5.png",
        imageAlt: "Healthy living products"
    }
];

export default function HeroCarousel() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    // Auto-play functionality
    useEffect(() => {
        if (!isAutoPlaying) return;

        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [isAutoPlaying]);

    const goToSlide = (index: number) => {
        setCurrentSlide(index);
        setIsAutoPlaying(false);
        // Resume auto-play after 10 seconds
        setTimeout(() => setIsAutoPlaying(true), 10000);
    };

    const goToPrevious = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 10000);
    };

    const goToNext = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 10000);
    };

    return (
        <div className="relative w-full overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div
                className="flex transition-transform duration-500 ease-out h-full"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
                {slides.map((slide) => (
                    <div key={slide.id} className="w-full flex-shrink-0">
                        <img
                            src={slide.image}
                            alt={slide.imageAlt}
                            className="w-full h-full object-cover min-h-[200px] sm:min-h-[280px]"
                        />
                    </div>
                ))}
            </div>

            <button
                onClick={goToPrevious}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/95 dark:bg-gray-800/95 border border-gray-200 dark:border-gray-600 shadow-md hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
                aria-label="Previous slide"
            >
                <ChevronLeft className="h-5 w-5" />
            </button>
            <button
                onClick={goToNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/95 dark:bg-gray-800/95 border border-gray-200 dark:border-gray-600 shadow-md hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
                aria-label="Next slide"
            >
                <ChevronRight className="h-5 w-5" />
            </button>
        </div>
    );
}
