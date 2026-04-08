import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } ;
import { motion, AnimatePresence } from 'framer-motion';

import { HiStar, HiOutlineHeart, HiHeart, HiOutlineShoppingBag, HiCheck, HiOutlineTruck, HiShieldCheck, HiRefresh } from 'react-icons/hi';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import ProductCard from '@/components/product/ProductCard';
import { getProductBySlug, getRelatedProducts, addReview } from '@/services/api';
import toast from 'react-hot-toast';

const ProductDetail = () => {
    const { slug } = useParams();
    const router = useRouter();
    const { user, setShowLoginModal } = useAuth();
    const { addItem } = useCart();
    const { toggleItem, isInWishlist } = useWishlist();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [selectedImage, setSelectedImage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [pincode, setPincode] = useState('');
    const [pincodeResult, setPincodeResult] = useState(null);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
    const [submittingReview, setSubmittingReview] = useState(false);
    const [activeTab, setActiveTab] = useState('description');
    
    // Zoom state
    const [zoomParams, setZoomParams] = useState({ isZoomed: false, x: 0, y: 0 });
    const imageContainerRef = useRef(null);

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                const { data } = await getProductBySlug(slug);
                if (data.success) {
                    setProduct(data.product);
                    const relatedRes = await getRelatedProducts(data.product._id);
                    if (relatedRes.data.success) {
                        setRelatedProducts(relatedRes.data.products?.slice(0, 4) || []);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch product:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
        window.scrollTo(0, 0);
        setSelectedImage(0);
        setQuantity(1);
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center bg-white">
                <div className="w-8 h-8 flex gap-2 items-center justify-center">
                    <div className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gold rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center bg-white">
                <div className="text-center">
                    <h2 className="font-heading text-3xl text-charcoal mb-4">Piece Not Found</h2>
                    <p className="text-gray-500 mb-8 font-light">The piece you're looking for might have been moved or removed.</p>
                    <Link href="/shop" className="btn-dark inline-block">Explore Collection</Link>
                </div>
            </div>
        );
    }

    const wishlisted = isInWishlist(product._id);
    const discountPercent = product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

    const handleMouseMove = (e) => {
        if (!imageContainerRef.current) return;
        const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();
        
        // Calculate percentage position
        let x = ((e.clientX - left) / width) * 100;
        let y = ((e.clientY - top) / height) * 100;
        
        // Clamp values to prevent edge bouncing
        x = Math.max(0, Math.min(100, x));
        y = Math.max(0, Math.min(100, y));

        setZoomParams({ isZoomed: true, x, y });
    };

    const handleMouseLeave = () => {
        setZoomParams(prev => ({ ...prev, isZoomed: false }));
    };

    const submitReview = async (e) => {
        e.preventDefault();
        if (!user) {
            setShowLoginModal(true);
            return toast.error('Please login to review');
        }

        setSubmittingReview(true);
        try {
            const { data } = await addReview(product._id, reviewForm);
            if (data.success) {
                toast.success('Review added successfully!');
                setReviewForm({ rating: 5, comment: '' });
                const productRes = await getProductBySlug(slug);
                setProduct(productRes.data.product);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmittingReview(false);
        }
    };

    const handleWishlist = () => {
        toggleItem(product);
        toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist');
    };

    const handleAddToCart = () => {
        addItem(product, quantity);
        toast.success('Added to cart!');
    };

    const handleBuyNow = () => {
        if (!user) {
            setShowLoginModal(true);
            return toast.error('Please login to checkout');
        }

        router.push('/checkout', {
            state: {
                buyNowItem: {
                    product,
                    quantity,
                    price: product.price,
                    name: product.name,
                    image: product.images?.[0]
                }
            }
        });
    };

    const handleCheckPincode = () => {
        if (pincode.length === 6) {
            setPincodeResult({ available: true, message: `Delivery available in 3-5 business days via insured shipping` });
        } else {
            setPincodeResult({ available: false, message: 'Please enter a valid 6-digit pincode' });
        }
    };

    return (
        <div className="min-h-screen bg-white pb-20">
            
                <title>{product.name} | Vionara</title>
                <meta name="description" content={product.description?.substring(0, 160) || `Buy ${product.name} online at Vionara.`} />
            

            {/* Breadcrumb - Minimalist */}
            <div className="w-full bg-white border-b border-gray-100 py-4 mt-16 md:mt-20">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center text-[11px] uppercase tracking-widest text-gray-400 space-x-3">
                        <Link href="/" className="hover:text-charcoal transition-colors">Home</Link>
                        <span>/</span>
                        <Link href={`/collections/${product.category}`} className="hover:text-charcoal transition-colors">{product.category}</Link>
                        <span>/</span>
                        <span className="text-charcoal font-medium truncate max-w-[200px] sm:max-w-none">{product.name}</span>
                    </div>
                </div>
            </div>

            {/* Product Section */}
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
                <div className="flex flex-col lg:flex-row gap-12 xl:gap-24">
                    
                    {/* Left: Image Gallery */}
                    <div className="w-full lg:w-3/5 flex flex-col-reverse md:flex-row gap-4 lg:gap-6">
                        {/* Thumbnails */}
                        <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto no-scrollbar md:w-20 lg:w-24 flex-shrink-0 snap-x">
                            {product.images?.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedImage(i)}
                                    className={`relative aspect-[3/4] overflow-hidden bg-gray-50 flex-shrink-0 w-20 md:w-full snap-start transition-all duration-300 ${selectedImage === i ? 'ring-1 ring-gold ring-offset-2' : 'hover:opacity-75'}`}
                                >
                                    <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>

                        {/* Main Image with Zoom */}
                        <div className="flex-1 bg-gray-50 aspect-[4/5] md:aspect-auto md:h-[700px] relative overflow-hidden group cursor-crosshair">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={selectedImage}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="w-full h-full absolute inset-0"
                                    ref={imageContainerRef}
                                    onMouseMove={handleMouseMove}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    <img
                                        src={product.images?.[selectedImage] || product.images?.[0]}
                                        alt={product.name}
                                        className="w-full h-full object-cover origin-center transition-transform duration-[400ms] ease-out"
                                        style={{
                                            transformOrigin: zoomParams.isZoomed ? `${zoomParams.x}% ${zoomParams.y}%` : 'center center',
                                            transform: zoomParams.isZoomed ? 'scale(2)' : 'scale(1)'
                                        }}
                                        draggable="false"
                                    />
                                </motion.div>
                            </AnimatePresence>
                            
                            {/* Zoom hint (visible only briefly or on hover before zooming) */}
                            <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest text-charcoal flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity pointer-events-none">
                                Hover to Zoom
                            </div>
                        </div>
                    </div>

                    {/* Right: Product Info */}
                    <div className="w-full lg:w-2/5 flex flex-col lg:py-4">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-gold text-[10px] tracking-[0.3em] uppercase mb-4">{product.category}</p>
                                    <h1 className="font-heading text-3xl lg:text-4xl xl:text-5xl font-medium text-charcoal mb-4 leading-[1.1]">{product.name}</h1>
                                </div>
                                <button
                                    onClick={handleWishlist}
                                    className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:border-gold hover:text-gold transition-all flex-shrink-0 mt-2"
                                >
                                    {wishlisted ? <HiHeart size={20} className="text-red-500" /> : <HiOutlineHeart size={20} />}
                                </button>
                            </div>

                            <div className="flex items-center gap-3 mb-8">
                                <span className="text-2xl font-light text-charcoal">₹{product.price.toLocaleString('en-IN')}</span>
                                {product.mrp > product.price && (
                                    <>
                                        <span className="text-base text-gray-400 line-through font-light">₹{product.mrp.toLocaleString('en-IN')}</span>
                                        <span className="bg-charcoal text-white text-[10px] uppercase tracking-widest px-2 py-1">{discountPercent}% OFF</span>
                                    </>
                                )}
                            </div>

                            <p className="text-gray-500 text-[14px] leading-relaxed font-light mb-8 max-w-lg">
                                {product.description}
                            </p>

                            {/* Divider */}
                            <div className="w-full h-[1px] bg-gray-100 mb-8" />

                            {/* Specs Grid */}
                            <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-8 text-[13px] font-light">
                                {product.material && <div className="flex justify-between border-b border-gray-50 pb-2"><span className="text-gray-400">Material</span><span className="text-charcoal text-right font-medium">{product.material}</span></div>}
                                {product.weight && <div className="flex justify-between border-b border-gray-50 pb-2"><span className="text-gray-400">Weight</span><span className="text-charcoal text-right font-medium">{product.weight}</span></div>}
                                {product.stone && <div className="flex justify-between border-b border-gray-50 pb-2"><span className="text-gray-400">Stone</span><span className="text-charcoal text-right font-medium">{product.stone}</span></div>}
                                {product.stoneWeight && <div className="flex justify-between border-b border-gray-50 pb-2"><span className="text-gray-400">Carat</span><span className="text-charcoal text-right font-medium">{product.stoneWeight}</span></div>}
                            </div>

                            {/* Stock Indicator */}
                            <div className="mb-8">
                                {product.stock > 0 ? (
                                    <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-green-700">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        In Stock & Ready to Ship
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-red-500">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                        Currently Unavailable
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-4 mb-10">
                                <div className="flex gap-4">
                                    <div className="flex items-center border border-gray-300 w-32 shrink-0">
                                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="flex-1 py-3 text-gray-500 hover:text-charcoal transition-colors">−</button>
                                        <span className="w-8 text-center text-[13px]">{quantity}</span>
                                        <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className={`flex-1 py-3 text-gray-500 hover:text-charcoal transition-colors ${quantity >= product.stock ? 'opacity-30' : ''}`} disabled={quantity >= product.stock}>+</button>
                                    </div>
                                    <button 
                                        onClick={handleAddToCart} 
                                        disabled={product.stock === 0}
                                        className="btn-outline-gold flex-1 text-xs sm:text-sm"
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                                <button 
                                    onClick={handleBuyNow} 
                                    disabled={product.stock === 0}
                                    className="btn-dark w-full text-xs sm:text-sm"
                                >
                                    Proceed to Checkout
                                </button>
                            </div>

                            {/* Delivery & Trust */}
                            <div className="bg-gray-50 p-6 space-y-4">
                                <div className="flex border-b border-gray-200 pb-4">
                                    <input
                                        type="text"
                                        placeholder="Enter PIN Code"
                                        value={pincode}
                                        onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        className="w-full bg-transparent text-[13px] outline-none placeholder-gray-400"
                                    />
                                    <button onClick={handleCheckPincode} className="text-[11px] uppercase tracking-widest font-medium text-charcoal hover:text-gold transition-colors ml-4">Verify</button>
                                </div>
                                {pincodeResult && (
                                    <p className={`text-[12px] font-light ${pincodeResult.available ? 'text-green-700' : 'text-red-500'}`}>
                                        {pincodeResult.message}
                                    </p>
                                )}
                                
                                <div className="grid grid-cols-3 gap-2 pt-2">
                                    <div className="flex flex-col items-center justify-center text-center gap-2">
                                        <HiShieldCheck size={20} className="text-gray-400" />
                                        <span className="text-[10px] uppercase tracking-wider text-gray-500">Certified</span>
                                    </div>
                                    <div className="flex flex-col items-center justify-center text-center gap-2">
                                        <HiOutlineTruck size={20} className="text-gray-400" />
                                        <span className="text-[10px] uppercase tracking-wider text-gray-500">Insured</span>
                                    </div>
                                    <div className="flex flex-col items-center justify-center text-center gap-2">
                                        <HiRefresh size={20} className="text-gray-400" />
                                        <span className="text-[10px] uppercase tracking-wider text-gray-500">Returns</span>
                                    </div>
                                </div>
                            </div>

                        </motion.div>
                    </div>
                </div>

                {/* Additional Details & Reviews Tabs */}
                <div className="mt-24 lg:mt-32 max-w-4xl mx-auto">
                    <div className="flex justify-center gap-8 md:gap-16 border-b border-gray-200 mb-10">
                        {['description', 'reviews'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-4 text-[13px] tracking-[0.15em] uppercase transition-colors relative ${activeTab === tab ? 'text-charcoal font-medium' : 'text-gray-400 hover:text-charcoal'}`}
                            >
                                {tab === 'reviews' ? `Reviews (${product.numReviews})` : 'The Details'}
                                {activeTab === tab && (
                                    <motion.div layoutId="activeTab" className="absolute bottom-[-1px] left-0 right-0 h-[1px] bg-gold" />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="min-h-[200px]">
                        {activeTab === 'description' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                                <p className="text-gray-600 leading-loose font-light text-[15px]">{product.description}</p>
                                <div className="mt-8 flex justify-center text-gold gap-1">
                                    <HiStar size={12} /><HiStar size={12} /><HiStar size={12} />
                                </div>
                            </motion.div>
                        )}
                        {activeTab === 'reviews' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-16">
                                <div>
                                    <h3 className="font-heading text-2xl mb-8">Client Testimonials</h3>
                                    {product.reviews?.length === 0 ? (
                                        <p className="text-gray-400 font-light text-sm italic">Be the first to share your experience with this piece.</p>
                                    ) : (
                                        <div className="space-y-8">
                                            {product.reviews?.map((review, idx) => (
                                                <div key={idx} className="pb-8 border-b border-gray-100 last:border-0">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex gap-0.5">
                                                            {Array.from({ length: 5 }).map((_, i) => (
                                                                <HiStar key={i} size={12} className={i < review.rating ? 'text-gold' : 'text-gray-200'} />
                                                            ))}
                                                        </div>
                                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">{new Date(review.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                    <p className="text-gray-600 text-[14px] leading-relaxed font-light italic mb-4">"{review.comment}"</p>
                                                    <p className="text-[11px] text-charcoal tracking-widest uppercase">— {/* Add user name if available in review object, else Anonymous */} Anonymous</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="bg-gray-50 p-8 h-fit">
                                    <h3 className="font-heading text-xl mb-6">Write a Review</h3>
                                    {!user ? (
                                        <div className="text-center py-8">
                                            <p className="text-[13px] font-light text-gray-500 mb-6">Please sign in to share your thoughts.</p>
                                            <Link href="/auth" className="btn-dark w-full">Sign In</Link>
                                        </div>
                                    ) : (
                                        <form onSubmit={submitReview} className="space-y-6">
                                            <div>
                                                <label className="text-[10px] text-charcoal uppercase tracking-widest mb-3 block">Overall Rating</label>
                                                <div className="flex gap-2">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <button 
                                                            type="button" 
                                                            key={i} 
                                                            onClick={() => setReviewForm({ ...reviewForm, rating: i + 1 })}
                                                            className="hover:scale-110 transition-transform"
                                                        >
                                                            <HiStar size={20} className={i < reviewForm.rating ? 'text-gold' : 'text-gray-300'} />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-charcoal uppercase tracking-widest mb-3 block">Your Review</label>
                                                <textarea 
                                                    required 
                                                    rows="4" 
                                                    placeholder="Share your experience..."
                                                    value={reviewForm.comment} 
                                                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} 
                                                    className="w-full bg-white border border-gray-200 p-4 text-[13px] font-light outline-none focus:border-gold transition-colors resize-none"
                                                />
                                            </div>
                                            <button type="submit" disabled={submittingReview} className="btn-dark w-full">
                                                {submittingReview ? 'Submitting...' : 'Submit Review'}
                                            </button>
                                        </form>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="mt-24 lg:mt-32 border-t border-gray-100 pt-16">
                        <div className="text-center mb-12">
                            <h2 className="font-heading text-3xl mb-3">You May Also Like</h2>
                            <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400">Discover more from this collection</p>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                            {relatedProducts.slice(0, 4).map((p, i) => (
                                <ProductCard key={p._id} product={p} index={i} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetail;
