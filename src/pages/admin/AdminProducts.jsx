import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlinePencil, HiOutlineTrash, HiOutlinePlus, HiOutlineSearch, HiOutlinePhotograph, HiOutlineUpload, HiOutlineX, HiOutlineCheck, HiOutlineDownload } from 'react-icons/hi';
import AdminLayout from '@/components/admin/AdminLayout';
import toast from 'react-hot-toast';
import { getAllProductsAdmin, createProduct, updateProduct, deleteProduct, bulkUploadProducts, uploadImages, getCategories } from '@/services/api';
import Link from 'next/link';

const defaultCategories = ['Rings', 'Earrings', 'Necklaces', 'Bangles', 'Bracelets', 'Mangalsutra'];
const artificialMaterials = ['Alloy', 'Brass', 'Copper', 'Stainless Steel', 'Silver Plated', 'Gold Plated', 'Rose Gold Plated', 'Oxidized Metal', 'Artificial Jewellery', 'Kundan', 'Polki', 'American Diamond'];

const emptyForm = { name: '', description: '', shortDescription: '', price: '', mrp: '', category: '', material: '', weight: '', stone: '', stoneWeight: '', stock: '', sku: '', images: [], imageUrl: '', publicId: '', size: '', isFeatured: false, isBestseller: false, isNewArrival: false, isActive: true };

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [showBulk, setShowBulk] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [form, setForm] = useState({ ...emptyForm });
    const [imagePreview, setImagePreview] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [csvFile, setCsvFile] = useState(null);
    const [isUploadingCsv, setIsUploadingCsv] = useState(false);
    
    // Dynamic Dropdowns
    const [cmsCategories, setCmsCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    useEffect(() => {
        fetchProducts();
        fetchCmsCategories();
    }, []);

    const fetchCmsCategories = async () => {
        try {
            setLoadingCategories(true);
            const { data } = await getCategories();
            if (data.success && data.categories?.length > 0) {
                setCmsCategories(data.categories.map(c => ({ name: c.name, slug: c.slug, _id: c._id })));
            } else {
                setCmsCategories(defaultCategories.map(name => ({ name, slug: name.toLowerCase(), _id: name.toLowerCase() })));
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            setCmsCategories(defaultCategories.map(name => ({ name, slug: name.toLowerCase() })));
        } finally {
            setLoadingCategories(false);
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const { data } = await getAllProductsAdmin();
            if (data.success) {
                setProducts(data.products || []);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error(error.response?.data?.message || 'Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    const filtered = products.filter(p => {
        const catIdOrSlug = typeof p.category === 'object' ? (p.category?._id || p.category?.slug) : p.category;
        const matchCat = filter === 'all' || catIdOrSlug === filter;
        const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    };

    const handleImageSelect = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const formData = new FormData();
        files.forEach(file => formData.append('images', file));

        try {
            toast.loading('Uploading to Cloudinary...', { id: 'image-upload' });
            const { data } = await uploadImages(formData);
            if (data.success) {
                const newImages = data.urls;
                const firstRes = data.results[0];

                setImagePreview([...imagePreview, ...newImages]);
                setForm({ 
                    ...form, 
                    images: [...form.images, ...newImages],
                    imageUrl: form.imageUrl || firstRes.url,
                    publicId: form.publicId || firstRes.public_id
                });
                toast.success('Images uploaded to Cloudinary', { id: 'image-upload' });
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(error.response?.data?.message || 'Failed to upload to Cloudinary', { id: 'image-upload' });
        }
    };

    const removeImage = (idx) => {
        setImagePreview(imagePreview.filter((_, i) => i !== idx));
        setForm({ ...form, images: form.images.filter((_, i) => i !== idx) });
    };

    const openAddModal = () => { setEditingProduct(null); setForm({ ...emptyForm }); setImagePreview([]); setShowModal(true); };

    const openEditModal = (product) => {
        setEditingProduct(product);
        setForm({
            ...product,
            category: typeof product.category === 'object' ? (product.category?._id || product.category?.slug || '') : product.category,
            price: product.price?.toString() || '',
            mrp: product.mrp?.toString() || '',
            stock: product.stock?.toString() || '0',
            imageUrl: product.imageUrl || (product.images && product.images[0]) || '',
            publicId: product.publicId || ''
        });
        setImagePreview(product.images || []);
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.name || !form.price || !form.category || !form.material) {
            toast.error('Please fill required fields (Name, Price, Category, Material)');
            return;
        }

        const productData = {
            ...form,
            price: Number(form.price),
            mrp: Number(form.mrp) || Number(form.price),
            stock: Number(form.stock) || 0,
        };

        try {
            setIsSaving(true);
            toast.loading(editingProduct ? 'Updating product...' : 'Adding product...', { id: 'save-product' });

            if (editingProduct) {
                const { data } = await updateProduct(editingProduct._id, productData);
                if (data.success) {
                    setProducts(products.map(p => p._id === editingProduct._id ? data.product : p));
                    toast.success('Product updated', { id: 'save-product' });
                }
            } else {
                const { data } = await createProduct(productData);
                if (data.success) {
                    setProducts([data.product, ...products]);
                    toast.success('Product added successfully', { id: 'save-product' });
                }
            }
            setShowModal(false);
        } catch (error) {
            console.error('Save error:', error);
            toast.error(error.response?.data?.message || 'Failed to save product', { id: 'save-product' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggleStatus = async (productId, field, value) => {
        try {
            toast.loading('Updating...', { id: 'toggle' });
            const { data } = await updateProduct(productId, { [field]: value });
            if (data.success) {
                setProducts(products.map(p => p._id === productId ? data.product : p));
                toast.success('Status updated', { id: 'toggle' });
            }
        } catch (error) {
            console.error('Toggle error:', error);
            toast.error('Failed to update status');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;

        try {
            toast.loading('Deleting...', { id: 'delete' });
            await deleteProduct(id);
            setProducts(products.filter(p => p._id !== id));
            toast.success('Product deleted', { id: 'delete' });
        } catch (error) {
            console.error('Delete error:', error);
            toast.error(error.response?.data?.message || 'Failed to delete product', { id: 'delete' });
        }
    };

    const handleCsvSelect = (e) => {
        const file = e.target.files[0];
        if (file && file.type === "text/csv") {
            setCsvFile(file);
        } else {
            toast.error('Please select a valid CSV file');
            setCsvFile(null);
        }
    };

    const handleBulkUpload = async () => {
        if (!csvFile) {
            toast.error('Please select a CSV file first');
            return;
        }

        try {
            setIsUploadingCsv(true);
            toast.loading('Parsing and uploading CSV...', { id: 'bulk-upload' });

            const reader = new FileReader();
            reader.onload = async (e) => {
                const text = e.target.result;
                const rows = text.split('\n');
                const headers = rows[0].split(',').map(h => h.trim());

                const newProducts = [];
                for (let i = 1; i < rows.length; i++) {
                    if (!rows[i].trim()) continue;
                    const values = rows[i].split(',').map(v => v.trim());
                    const product = {};
                    headers.forEach((h, index) => {
                        product[h] = values[index];
                    });

                    if (product.name && product.price && product.category) {
                        newProducts.push({
                            name: product.name,
                            description: product.description || product.name,
                            price: Number(product.price),
                            mrp: Number(product.mrp) || Number(product.price),
                            stock: Number(product.stock) || 0,
                            category: product.category,
                            sku: product.sku || '',
                            material: product.material || '18K Gold',
                            images: product.images ? product.images.split('|') : []
                        });
                    }
                }

                if (newProducts.length === 0) {
                    toast.error('No valid products found in CSV', { id: 'bulk-upload' });
                    return;
                }

                try {
                    const { data } = await bulkUploadProducts({ products: newProducts });
                    if (data.success) {
                        toast.success(`${data.products.length} products uploaded`, { id: 'bulk-upload' });
                        fetchProducts();
                        setShowBulk(false);
                        setCsvFile(null);
                    }
                } catch (uploadError) {
                    toast.error(uploadError.response?.data?.message || 'Upload failed', { id: 'bulk-upload' });
                }
            };
            reader.readAsText(csvFile);

        } catch (error) {
            console.error('CSV parse error:', error);
            toast.error('Failed to parse CSV file', { id: 'bulk-upload' });
        } finally {
            setIsUploadingCsv(false);
        }
    };

    return (
        <AdminLayout title="Products" subtitle={`${products.length} total products`}>
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
                    <div className="relative flex-1 max-w-xs">
                        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-gold" />
                    </div>
                    <div className="flex gap-1 overflow-x-auto">
                        {['all', ...cmsCategories].map((cat) => {
                            const val = cat === 'all' ? 'all' : (cat._id || cat.slug);
                            const label = cat === 'all' ? 'All' : cat.name;
                            return (
                                <button key={val} onClick={() => setFilter(val)} className={`text-xs px-3 py-1.5 capitalize whitespace-nowrap rounded-lg border transition-colors ${filter === val ? 'bg-gold text-white border-gold' : 'bg-white border-gray-200 hover:border-gold text-gray-600'}`}>{label}</button>
                            );
                        })}
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setShowBulk(!showBulk)} className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium hover:border-gold transition-colors">
                        <HiOutlineUpload size={14} />Bulk Upload
                    </button>
                    <button onClick={openAddModal} className="flex items-center gap-1.5 px-4 py-2 bg-gold text-white rounded-lg text-xs font-medium hover:bg-amber-600 transition-colors">
                        <HiOutlinePlus size={14} />Add Product
                    </button>
                </div>
            </div>

            {/* Bulk Upload Panel */}
            <AnimatePresence>
                {showBulk && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-white rounded-xl border border-gray-100 p-6 mb-6 overflow-hidden">
                        <h3 className="font-heading font-semibold mb-3">Bulk Upload Products</h3>
                        <p className="text-xs text-gray-400 mb-4">Upload a CSV file with headers: name, description, price, mrp, stock, category, sku, material, images (pipe | separated).</p>
                        <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:border-gold transition-colors relative">
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleCsvSelect}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <HiOutlineUpload size={32} className={`${csvFile ? 'text-gold' : 'text-gray-300'} mx-auto mb-2`} />
                            <p className="text-sm text-gray-500">
                                {csvFile ? csvFile.name : 'Drag & drop CSV file here, or click to browse'}
                            </p>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={handleBulkUpload}
                                disabled={!csvFile || isUploadingCsv}
                                className={`px-4 py-2 bg-gold text-white rounded-lg text-xs font-medium hover:bg-amber-600 transition-colors ${(!csvFile || isUploadingCsv) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isUploadingCsv ? 'Uploading...' : 'Upload & Import'}
                            </button>
                            <button onClick={() => { setShowBulk(false); setCsvFile(null); }} className="text-xs text-gray-400 hover:text-charcoal px-3">Cancel</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Products Table */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead><tr className="text-left text-[11px] text-gray-400 uppercase tracking-wider bg-gray-50/80 border-b border-gray-100">
                            <th className="p-3">Product</th><th className="p-3">Category</th><th className="p-3">Price</th><th className="p-3">Stock</th><th className="p-3">Rating</th><th className="p-3">Status</th><th className="p-3 text-right">Actions</th>
                        </tr></thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center">
                                        <div className="flex justify-center items-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : filtered.length > 0 ? (
                                filtered.map((p) => (
                                    <tr key={p._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                        <td className="p-3">
                                            <div className="flex items-center gap-3">
                                                <img src={p.images?.[0] || 'https://via.placeholder.com/100'} alt="" className="w-10 h-10 object-cover rounded-md bg-ivory" />
                                                <div className="min-w-0">
                                                    <p className="font-medium text-xs truncate max-w-[200px]">{p.name}</p>
                                                    <p className="text-[10px] text-gray-400">{p.sku || 'No SKU'} · {p.material}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3"><span className="text-xs capitalize bg-gray-100 px-2 py-0.5 rounded">{typeof p.category === 'object' ? p.category?.name : (p.category || 'Unknown')}</span></td>
                                        <td className="p-3"><span className="text-xs font-medium">₹{(p.price || 0).toLocaleString('en-IN')}</span>{p.mrp > p.price && <span className="text-[10px] text-gray-400 line-through ml-1">₹{p.mrp.toLocaleString('en-IN')}</span>}</td>
                                        <td className="p-3"><span className={`text-xs px-2 py-0.5 rounded font-medium ${p.stock <= 5 ? 'bg-red-50 text-red-600' : p.stock <= 15 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>{p.stock}</span></td>
                                        <td className="p-3 text-xs">{p.averageRating > 0 ? `${p.averageRating} ⭐ (${p.numReviews})` : '—'}</td>
                                        <td className="p-3">
                                            <div className="flex gap-1">
                                                <button 
                                                    onClick={() => handleToggleStatus(p._id, 'isActive', !p.isActive)}
                                                    className={`text-[9px] px-1.5 py-0.5 rounded transition-colors ${p.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}
                                                >
                                                    {p.isActive ? 'Active' : 'Draft'}
                                                </button>
                                                <button 
                                                    onClick={() => handleToggleStatus(p._id, 'isFeatured', !p.isFeatured)}
                                                    className={`text-[9px] px-1.5 py-0.5 rounded transition-colors ${p.isFeatured ? 'bg-gold/10 text-gold' : 'bg-gray-100 text-gray-400'}`}
                                                >
                                                    Featured
                                                </button>
                                                <button 
                                                    onClick={() => handleToggleStatus(p._id, 'isBestseller', !p.isBestseller)}
                                                    className={`text-[9px] px-1.5 py-0.5 rounded transition-colors ${p.isBestseller ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'}`}
                                                >
                                                    Best
                                                </button>
                                            </div>
                                        </td>
                                        <td className="p-3 text-right">
                                            <div className="flex gap-1 justify-end">
                                                <button onClick={() => openEditModal(p)} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-500 transition-colors"><HiOutlinePencil size={14} /></button>
                                                <button onClick={() => handleDelete(p._id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition-colors"><HiOutlineTrash size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-gray-400 text-sm">No products found matching your search.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 pt-12 overflow-y-auto" onClick={() => setShowModal(false)}>
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl w-full max-w-2xl p-6 mb-8">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="font-heading text-lg font-semibold">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-charcoal"><HiOutlineX size={20} /></button>
                            </div>

                            <div className="space-y-4">
                                {/* Images */}
                                <div>
                                    <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">Product Images</label>
                                    <div className="flex gap-2 flex-wrap">
                                        {imagePreview.map((img, i) => (
                                            <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                                                <img src={img} alt="" className="w-full h-full object-cover" />
                                                <button onClick={() => removeImage(i)} className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"><HiOutlineX size={10} /></button>
                                            </div>
                                        ))}
                                        <label className="w-20 h-20 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gold transition-colors">
                                            <HiOutlinePhotograph size={18} className="text-gray-300" />
                                            <span className="text-[9px] text-gray-400 mt-1">Add</span>
                                            <input type="file" multiple accept="image/*" onChange={handleImageSelect} className="hidden" />
                                        </label>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="sm:col-span-2"><label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Product Name *</label><input name="name" value={form.name} onChange={handleChange} className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gold rounded-lg" /></div>
                                    <div><label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Price (₹) *</label><input name="price" type="number" value={form.price} onChange={handleChange} className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gold rounded-lg" /></div>
                                    <div><label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">MRP (₹)</label><input name="mrp" type="number" value={form.mrp} onChange={handleChange} className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gold rounded-lg" /></div>
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="text-xs text-gray-500 uppercase tracking-wider block">Category *</label>
                                            <Link href="/admin/cms" className="text-[10px] text-blue-500 hover:text-blue-700 hover:underline">Add Category</Link>
                                        </div>
                                        <select name="category" value={form.category} onChange={handleChange} className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gold rounded-lg shadow-sm transition-shadow">
                                            <option value="" disabled>{loadingCategories ? 'Loading...' : 'Select Category'}</option>
                                            {!loadingCategories && cmsCategories.length === 0 && <option disabled>No categories available</option>}
                                            {cmsCategories.map(c => <option key={c._id || c.slug} value={c._id || c.slug} className="capitalize">{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Material *</label>
                                        <input list="materials-list" name="material" value={form.material} onChange={handleChange} className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gold rounded-lg shadow-sm transition-shadow" placeholder="Type or select material" />
                                        <datalist id="materials-list">
                                            {artificialMaterials.map(m => <option key={m} value={m} />)}
                                        </datalist>
                                    </div>
                                    <div><label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Weight</label><input name="weight" value={form.weight} onChange={handleChange} className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gold rounded-lg" placeholder="e.g. 3.2g" /></div>
                                    <div><label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Stock *</label><input name="stock" type="number" value={form.stock} onChange={handleChange} className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gold rounded-lg" /></div>
                                    <div><label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Stone</label><input name="stone" value={form.stone} onChange={handleChange} className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gold rounded-lg" /></div>
                                    <div><label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">SKU</label><input name="sku" value={form.sku} onChange={handleChange} className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gold rounded-lg" /></div>
                                    <div className="sm:col-span-2"><label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Description</label><textarea name="description" value={form.description} onChange={handleChange} rows={3} className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gold rounded-lg" /></div>
                                </div>

                                {/* Flags */}
                                <div className="flex flex-wrap gap-4 pt-2">
                                    {[{ name: 'isActive', label: 'Active/Visible' }, { name: 'isFeatured', label: 'Featured' }, { name: 'isBestseller', label: 'Bestseller' }, { name: 'isNewArrival', label: 'New Arrival' }].map(flag => (
                                        <label key={flag.name} className="flex items-center gap-2 cursor-pointer border px-3 py-1.5 rounded-lg border-gray-200">
                                            <input type="checkbox" name={flag.name} checked={form[flag.name] || false} onChange={handleChange} className="accent-gold w-4 h-4 cursor-pointer" />
                                            <span className="text-sm font-medium text-gray-700">{flag.label}</span>
                                        </label>
                                    ))}
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                                    <button onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 font-medium transition-colors">Cancel</button>
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className={`flex items-center gap-1.5 px-6 py-2.5 bg-gold text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    >
                                        {isSaving ? (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <HiOutlineCheck size={16} />
                                        )}
                                        {editingProduct ? 'Update Product' : 'Add Product'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </AdminLayout>
    );
};

export default AdminProducts;
