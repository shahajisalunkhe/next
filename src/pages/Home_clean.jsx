import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

import { HiStar, HiArrowRight } from 'react-icons/hi';
import ProductCard from '@/components/product/ProductCard';
import { getProducts } from '@/services/api';

// Import local images
import heroBanner from '../assets/images/hero-banner.png';
import lookbookOffice from '../assets/images/lookbook-office.png';
import lookbookParty from '../assets/images/lookbook-party.png';
import lookbookDaily from '../assets/images/lookbook-daily.png';
import lookbookLife1 from '../assets/images/lookbook-life-1.png';
import lookbookLife2 from '../assets/images/lookbook-life-2.png';
import lookbookParty from '../assets/images/lookbook-party.png';
import lookbookDaily from '../assets/images/lookbook-daily.png';
import lookbookOffice from '../assets/images/lookbook-office.png';
import lookbookFestive1 from '../assets/images/lookbook-festive-1.jpg';

import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';

const categories = [
    { name: 'Earrings', slug: 'earrings', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600', gradient: 'from-rose-100 to-amber-50' },
    { name: 'Necklaces', slug: 'necklaces', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600', gradient: 'from-amber-50 to-yellow-100' },
    { name: 'Bracelets', slug: 'bangles', image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600', gradient: 'from-emerald-50 to-teal-50' },
    { name: 'Mangalsutra', slug: 'necklaces', image: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=600', gradient: 'from-orange-50 to-rose-50' },
    { name: 'Mens', slug: 'rings', image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600', gradient: 'from-slate-100 to-gray-100' },
    { name: 'Rings', slug: 'rings', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600', gradient: 'from-purple-50 to-pink-50' },
];

const filterTabs = ['All', 'Necklaces', 'Bracelets', 'Earrings', 'Rings', 'Mens', 'Mangalsutra'];

const lookbookSlides = [
    { title: 'Office Wear', subtitle: 'Subtle & Sophisticated', image: lookbookOffice },
    { title: 'Party Wear', subtitle: 'Bold & Beautiful', image: lookbookParty },
    { title: 'Daily Wear', subtitle: 'Effortless Elegance', image: lookbookDaily },
    { title: 'Festive Wear', subtitle: 'Graceful & Grand', image: 'https://images.unsplash.com/photo-1589156229687-496a31ad1d1f?w=600' },
    { title: 'Traditional Look', subtitle: 'Timeless Beauty', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600' },
];

const giftCombos = [
    { name: 'Eternal Love Set', desc: 'Ring + Necklace Combo', price: 2499, mrp: 4999, image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400' },
    { name: 'Classic Charm Set', desc: 'Earrings + Bracelet Combo', price: 1999, mrp: 3999, image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400' },
    { name: 'Golden Glow Set', desc: 'Complete Jewellery Set', price: 3999, mrp: 7999, image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400' },
];

const reviews = [
    { name: 'Priya S.', rating: 5, text: 'Absolutely stunning! The quality exceeded my expectations. The gold plating is so thick and premium.', product: 'Celestial Solitaire Ring' },
    { name: 'Ananya P.', rating: 5, text: "Got the Diamond Drop Earrings as a gift for my mother. She was overwhelmed with joy. VIONARA's packaging is also very premium.", product: 'Diamond Drop Earrings' },
    { name: 'Ritu M.', rating: 5, text: "The Solitaire Pendant Necklace is my everyday go-to piece now. It's elegant, lightweight, and gets compliments everywhere.", product: 'Solitaire Pendant Necklace' },
    { name: 'Kavya R.', rating: 4, text: 'Beautiful Tennis Bangle! The diamonds are so sparkly and the clasp is very secure. Perfect for my wedding reception.', product: 'Diamond Tennis Bangle' },
];

const Home = () => {
    const [allProducts, setAllProducts] = useState([]);
    const [activeFilter, setActiveFilter] = useState('All');
    const [activeLookbook, setActiveLookbook] = useState(0);
    const [lookbookDirection, setLookbookDirection] = useState(0);

    const festiveSlides = [
        { title: 'The Royal Edit', subtitle: 'Exquisite & Grand', image: lookbookLife1 },
        { title: 'Golden Hour', subtitle: 'Timeless Glow', image: lookbookLife2 },
        { title: 'Evening Charm', subtitle: 'Bold & Beautiful', image: lookbookParty },
        { title: 'Everyday Luxe', subtitle: 'Effortless Style', image: lookbookDaily },
        { title: 'Chic Professional', subtitle: 'Subtle Sophistication', image: lookbookOffice },
        { title: 'Festive Grace', subtitle: 'Heritage Beauty', image: lookbookFestive1 },
    ];

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const { data } = await getProducts({ limit: 50 });
                if (data.success && data.products) {
                    setAllProducts(data.products);
                }
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };
        fetchProducts();
    }, []);

    // Auto rotate lookbook
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveLookbook(prev => (prev + 1) % lookbookSlides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const filteredProducts = activeFilter === 'All'
        ? allProducts.slice(0, 8)
        : allProducts.filter(p => {
            const cat = p.category?.toLowerCase();
            const filter = activeFilter.toLowerCase();
            if (filter === 'mangalsutra') return p.tags?.includes('mangalsutra');
            if (filter === 'mens') return p.tags?.includes('mens') || p.tags?.includes('men');
            if (filter === 'bracelets') return cat === 'bangles';
            return cat === filter;
        }).slice(0, 8);

    const featuredProducts = allProducts.filter(p => p.isFeatured).slice(0, 4);
    const bestsellers = allProducts.filter(p => p.isBestseller).slice(0, 4);

    return (
        <div className="overflow-hidden bg-white">
            
                <title>VIONARA | Elegance That Speaks</title>
                <meta name="description" content="Discover exquisite handcrafted jewellery. Shop luxury rings, earrings, necklaces and bracelets at VIONARA." />
                <meta property="og:title" content="VIONARA | Elegance That Speaks" />
                <meta property="og:description" content="Discover exquisite handcrafted jewellery at VIONARA." />
                <meta property="og:type" content="website" />
            

            {/* 
                 SECTION 1: HERO BANNER
             */}
            <section className="relative w-full bg-[#f5ebe0] overflow-hidden" id="hero-section">
                <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row items-center min-h-[420px] lg:min-h-[520px]">
                    {/* Model Image  Left Side */}
                    <div className="w-full lg:w-[55%] relative h-[350px] sm:h-[420px] lg:h-[520px] overflow-hidden">
                        <motion.img
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                            src={heroBanner}
                            alt="Vionara Jewellery Collection"
                            className="w-full h-full object-cover object-top lg:object-[center_15%]"
                        />
                    </div>

                    {/* Promo Text  Right Side */}
                    <div className="w-full lg:w-[45%] flex items-center justify-center p-8 sm:p-12 lg:p-16">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="text-center lg:text-left max-w-md"
                        >
                            <p className="text-[11px] tracking-[0.3em] uppercase text-gray-500 mb-4 font-medium">Limited Time Offer</p>

                            <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-charcoal font-medium mb-3 leading-[1.1]">
                                FLAT <span className="text-gold">999</span>
                            </h2>

                            <p className="text-gray-500 text-sm sm:text-base font-light mb-8 leading-relaxed">
                                Discover our exclusive collection of handcrafted jewellery. Premium quality at unbeatable prices.
                            </p>

                            <Link
                                to="/shop"
                                className="inline-flex items-center gap-2 bg-charcoal text-white px-8 py-3.5 text-[13px] font-medium tracking-[0.12em] uppercase hover:bg-gold transition-colors duration-300"
                            >
                                Shop Now
                                <HiArrowRight size={16} />
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* 
                 SECTION 2: CATEGORY GRID
             */}
            <section className="py-14 lg:py-20 bg-white" id="categories-section">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
                        {categories.map((cat, i) => (
                            <motion.div
                                key={cat.name}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.08, duration: 0.6 }}
                            >
                                <Link href={`/collections/${cat.slug}`} className="category-card block">
                                    <div className={`aspect-[3/4] bg-gradient-to-b ${cat.gradient} relative overflow-hidden rounded-xl`}>
                                        <img
                                            src={cat.image}
                                            alt={cat.name}
                                            className="w-full h-full object-cover mix-blend-multiply"
                                            loading="lazy"
                                        />
                                        {/* Category Name Overlay */}
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-3 sm:p-4">
                                            <h3 className="text-white text-[11px] sm:text-xs font-semibold tracking-[0.15em] uppercase text-center">
                                                {cat.name} 
                                            </h3>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 
                 SECTION 3: VIONARA TOP STYLES
             */}
            <section className="py-14 lg:py-20 bg-ivory-dark" id="top-styles-section">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Title */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-10"
                    >
                        <h2 className="text-2xl sm:text-3xl font-medium tracking-[0.15em] uppercase text-charcoal" style={{ fontFamily: 'var(--font-body)' }}>
                            VIONARA TOP STYLES
                        </h2>
                    </motion.div>

                    {/* Filter Tabs */}
                    <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10">
                        {filterTabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveFilter(tab)}
                                className={`filter-tab ${activeFilter === tab ? 'active' : ''}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Product Grid  4 per row */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((product, i) => (
                                <ProductCard key={product._id} product={product} index={i} />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-16">
                                <p className="text-gray-400 text-sm">No products found. Try a different filter.</p>
                            </div>
                        )}
                    </div>

                    {/* View All */}
                    <div className="text-center mt-10">
                        <Link
                            to="/shop"
                            className="inline-flex items-center gap-2 text-sm tracking-widest uppercase font-medium text-charcoal hover:text-gold transition-colors pb-1 border-b border-charcoal hover:border-gold"
                        >
                            View All Products <HiArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* 
                 SECTION 4: PROMOTIONAL BANNER
             */}
            <section className="py-14 lg:py-20 bg-white" id="promo-banner-section">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-charcoal to-charcoal-light min-h-[280px] sm:min-h-[340px] flex items-center">
                        {/* Decorative circles */}
                        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-gold/10" />
                        <div className="absolute -right-10 -bottom-10 w-60 h-60 rounded-full bg-gold/5" />

                        <div className="relative z-10 p-8 sm:p-12 lg:p-16 max-w-2xl">
                            <p className="text-gold text-[11px] tracking-[0.3em] uppercase mb-4 font-medium">Exclusive Collection</p>
                            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-white mb-4 leading-[1.1]">
                                The Gold Edit
                            </h2>
                            <p className="text-white/70 text-sm sm:text-base font-light mb-8 max-w-md leading-relaxed">
                                Discover our premium 18K gold-plated collection. Thick plating that lasts, at prices that surprise.
                            </p>
                            <Link
                                to="/shop"
                                className="inline-flex items-center gap-2 bg-gold text-white px-8 py-3.5 text-[13px] font-medium tracking-[0.12em] uppercase hover:bg-gold-light transition-colors duration-300"
                            >
                                Explore Now <HiArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* 
                 SECTION 5: GIFT COMBOS
             */}
            <section className="py-14 lg:py-20 bg-ivory" id="gift-combos-section">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-10"
                    >
                        <p className="text-gold text-[11px] tracking-[0.3em] uppercase mb-3 font-medium">Gift Sets</p>
                        <h2 className="font-heading text-3xl sm:text-4xl text-charcoal mb-2">FLAT 50% OFF</h2>
                        <p className="text-gray-500 text-sm font-light">Curated gift combos for every occasion</p>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {giftCombos.map((combo, i) => (
                            <motion.div
                                key={combo.name}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1, duration: 0.6 }}
                                className="group bg-white rounded-2xl overflow-hidden shadow-luxury hover:shadow-luxury-hover transition-all duration-500 hover:-translate-y-1 cursor-pointer"
                            >
                                <Link href="/shop">
                                    <div className="aspect-square overflow-hidden bg-gray-50">
                                        <img
                                            src={combo.image}
                                            alt={combo.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                            loading="lazy"
                                        />
                                    </div>
                                    <div className="p-5">
                                        <h3 className="font-medium text-charcoal text-base mb-1">{combo.name}</h3>
                                        <p className="text-gray-400 text-xs mb-3">{combo.desc}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-charcoal font-semibold">{combo.price.toLocaleString('en-IN')}</span>
                                            <span className="text-gray-400 text-sm line-through">{combo.mrp.toLocaleString('en-IN')}</span>
                                            <span className="text-green-600 text-xs font-medium">(50% OFF)</span>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 