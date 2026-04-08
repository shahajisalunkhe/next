import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { getHeroSetting } from '../../services/api';

const HeroBanner = () => {
    const [slides, setSlides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [current, setCurrent] = useState(0);

    // Fetch dynamic hero slides from CMS
    useEffect(() => {
        const fetchHero = async () => {
            try {
                const { data } = await getHeroSetting();
                if (data.success && data.heroSlides?.length > 0) {
                    setSlides(data.heroSlides);
                } else {
                    // Default fallback: all local hero images with new field names
                    setSlides([
                        { id: 'default-1', image: '/hero-banner.png', title: 'THE ART OF\nFINE JEWELLERY', subtitle: 'Exploring the intersection of luxury and craftsmanship', buttonText: 'Discover the Collection', buttonLink: '/shop' },
                        { id: 'default-2', image: '/hero-2.png', title: 'CRAFTED FOR\nEVERY MOMENT', subtitle: 'Where timeless elegance meets modern design', buttonText: 'Shop Now', buttonLink: '/shop' },
                        { id: 'default-3', image: '/hero-3.png', title: 'WEAR YOUR\nSTORY', subtitle: 'Fine jewellery that speaks without words', buttonText: 'Explore Now', buttonLink: '/shop' },
                        { id: 'default-4', image: '/hero-4.png', title: 'GIFTED WITH\nGRACE', subtitle: 'Thoughtfully curated pieces for someone special', buttonText: 'View Gifts', buttonLink: '/shop' },
                        { id: 'default-5', image: '/hero-premium.png', title: 'PREMIUM\nCOLLECTION', subtitle: 'The finest craftsmanship, exclusively at Vionara', buttonText: 'Shop Premium', buttonLink: '/shop' },
                    ]);
                }
            } catch (error) {
                console.error("Error fetching hero slides:", error);
                setSlides([
                    { id: '1', image: '/hero-banner.png', title: 'FINE JEWELLERY' }
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchHero();
    }, []);

    // Auto slide every 5 seconds
    const nextSlide = useCallback(() => {
        setCurrent((prev) => (prev + 1) % slides.length);
    }, [slides.length]);

    useEffect(() => {
        const timer = setInterval(nextSlide, 7000);
        return () => clearInterval(timer);
    }, [nextSlide]);

    const activeSlide = slides[current];
    // Backward-compatible field resolution (supports old: heading/subtext/link AND new: title/subtitle/buttonLink)
    const slideHeading = activeSlide?.title || activeSlide?.heading || '';
    const slideSubtitle = activeSlide?.subtitle || activeSlide?.subtext || '';
    const slideLink = activeSlide?.buttonLink || activeSlide?.link || '/shop';

    if (loading) {
        return <div className="w-full h-[55vh] md:h-[65vh] lg:h-[70vh] bg-charcoal animate-pulse flex items-center justify-center text-white/20 uppercase tracking-[0.5em] text-sm">Vionara Luxury</div>;
    }

    console.log("HeroBanner Slides Data:", slides);

    if (!(slides?.length > 0)) return null;

    return (
        <section className="w-full overflow-hidden" style={{ margin: 0, padding: 0 }}>
            <div className="relative w-full h-[55vh] md:h-[65vh] lg:h-[70vh] min-h-[400px] overflow-hidden">
                {/* Stacked Images — Crossfade */}
                {slides.map((slide, index) => (
                    <div
                        key={index}
                        className="absolute inset-0 w-full h-full"
                        style={{
                            opacity: index === current ? 1 : 0,
                            transition: 'opacity 1s ease-in-out',
                            zIndex: index === current ? 2 : 1,
                        }}
                    >
                        <img
                            src={slide.image}
                            alt={slide.title || slide.heading || 'Hero slide'}
                            className="w-full h-full"
                            style={{
                                objectFit: 'cover',
                                objectPosition: 'left center',
                            }}
                            draggable={false}
                        />
                    </div>
                ))}

                {/* Dark overlay — heavier on the right for text readability */}
                <div
                    className="absolute inset-0 z-[3]"
                    style={{
                        background: 'linear-gradient(to right, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.35) 40%, rgba(0,0,0,0.55) 100%)',
                    }}
                />

                {/* Text Content — Right Aligned like Sonani */}
                <div className="absolute inset-0 z-[4] flex items-center justify-end">
                    <div className="w-full md:w-[55%] lg:w-[50%] px-8 sm:px-12 lg:px-20 flex flex-col items-center text-center">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={current}
                                initial={{ opacity: 0, y: 25 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="flex flex-col items-center"
                            >
                                {/* Main Heading — Elegant Italic Serif */}
                                <h1
                                    className="font-heading text-3xl sm:text-4xl lg:text-[44px] xl:text-[50px] text-white leading-snug mb-6"
                                    style={{
                                        fontStyle: 'italic',
                                        fontWeight: 400,
                                        letterSpacing: '0.02em',
                                        whiteSpace: 'pre-line',
                                    }}
                                >
                                    {slideHeading}
                                </h1>

                                {/* Decorative Ornamental Divider */}
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="h-[1px] w-10 sm:w-14 bg-white/40" />
                                    <div className="relative w-3 h-3">
                                        <div className="absolute inset-0 rotate-45 border border-white/50 scale-75" />
                                        <div className="absolute inset-0 rotate-45 bg-white/30 scale-[0.35]" />
                                    </div>
                                    <div className="h-[1px] w-10 sm:w-14 bg-white/40" />
                                </div>

                                {/* Subtext */}
                                <p className="text-white/75 text-sm sm:text-base lg:text-lg font-light tracking-wide max-w-md mb-8 leading-relaxed">
                                    {slideSubtitle}
                                </p>

                                {/* Shop Now CTA — Subtle underline style */}
                                <Link
                                    href={slideLink}
                                    className="group inline-flex items-center gap-2 text-white text-[12px] sm:text-[13px] font-medium tracking-[0.2em] uppercase border-b border-white/40 pb-1.5 hover:border-white transition-all duration-300"
                                >
                                    {activeSlide.buttonText}
                                    <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Slide Indicator — Thin bottom bar */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[5] flex items-center gap-2.5">
                    {slides.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrent(i)}
                            className="group p-1"
                        >
                            <div
                                className={`h-[2px] rounded-full transition-all duration-500 ${
                                    i === current
                                        ? 'w-8 bg-white'
                                        : 'w-4 bg-white/30 group-hover:bg-white/50'
                                }`}
                            />
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HeroBanner;
