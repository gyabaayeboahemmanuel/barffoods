import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface CarouselSlide {
    id: number;
    image: string;
    imageAlt: string;
}

const slides: CarouselSlide[] = [
    { id: 1, image: "/assets/images/banner1.png", imageAlt: "Fresh vegetables and fruits basket" },
    { id: 2, image: "/assets/images/banner2.png", imageAlt: "Fresh fruits assortment" },
    { id: 3, image: "/assets/images/banner3.png", imageAlt: "Fresh vegetables discount" },
    { id: 4, image: "/assets/images/banner4.png", imageAlt: "Premium quality produce" },
    { id: 5, image: "/assets/images/banner5.png", imageAlt: "Healthy living products" },
];

export default function HeroCarousel() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    useEffect(() => {
        if (!isAutoPlaying) return;
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [isAutoPlaying]);

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
        <div className="relative w-full overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg min-h-[176px] sm:min-h-[256px] md:min-h-[304px]">
            <div
                className="flex transition-transform duration-500 ease-out h-full"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
                {slides.map((slide) => (
                    <div key={slide.id} className="relative w-full flex-shrink-0">
                        <img
                            src={slide.image}
                            alt={slide.imageAlt}
                            className="w-full h-full object-cover min-h-[176px] sm:min-h-[256px] md:min-h-[304px]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    </div>
                ))}
            </div>

            {/* Overlay headline + CTA (visible on all slides) */}
            <div className="absolute inset-0 flex flex-col justify-end md:justify-center md:items-start md:pl-12 lg:pl-16 pb-8 md:pb-0 pt-12 md:pt-0 px-4 sm:px-8 pointer-events-none">
                <div className="pointer-events-auto max-w-xl">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white drop-shadow-lg tracking-tight">
                        Fresh groceries, delivered
                    </h1>
                    <p className="text-white/95 text-base sm:text-lg mt-2 drop-shadow-md">
                        Shop from local stores. Fast delivery to your door.
                    </p>
                    <Link
                        href="#products-section"
                        className="inline-flex items-center justify-center mt-6 px-6 py-3.5 bg-white text-emerald-700 font-semibold rounded-xl shadow-lg hover:bg-gray-100 hover:shadow-xl transition-all duration-200 active:scale-[0.98]"
                    >
                        Shop now
                    </Link>
                </div>
            </div>

            <button
                onClick={goToPrevious}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-white/95 dark:bg-gray-800/95 border border-gray-200 dark:border-gray-600 shadow-lg hover:bg-white dark:hover:bg-gray-800 hover:scale-105 text-gray-700 dark:text-gray-300 transition-all"
                aria-label="Previous slide"
            >
                <ChevronLeft className="h-5 w-5" />
            </button>
            <button
                onClick={goToNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-white/95 dark:bg-gray-800/95 border border-gray-200 dark:border-gray-600 shadow-lg hover:bg-white dark:hover:bg-gray-800 hover:scale-105 text-gray-700 dark:text-gray-300 transition-all"
                aria-label="Next slide"
            >
                <ChevronRight className="h-5 w-5" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {slides.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => { setCurrentSlide(i); setIsAutoPlaying(false); setTimeout(() => setIsAutoPlaying(true), 10000); }}
                        className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                            i === currentSlide ? 'bg-white scale-125' : 'bg-white/60 hover:bg-white/80'
                        }`}
                        aria-label={`Go to slide ${i + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
