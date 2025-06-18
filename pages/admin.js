import Head from 'next/head'
import Navbar from '../components/Navbar'
import SingleUpload from '../components/SingleUpload'
import MultipleUpload from '../components/MultipleUpload'
import { useState, useEffect, useCallback } from "react";
import { db, storage } from "../firebase";
import {
    collection,
    getDocs,
    doc,
    deleteDoc,
    updateDoc
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function Home() {
    const [activeComponent, setActiveComponent] = useState(null);
    const [products, setProducts] = useState([]);
    const [subproducts, setSubProducts] = useState({});
    const [loading, setLoading] = useState(true);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [editForm, setEditForm] = useState({
        name: '',
        price: '',
        productUrl: '',
        newImages: []
    });

    // Add scroll optimization state
    const [visibleRange, setVisibleRange] = useState({ start: 0, end: 12 });
    const ITEMS_PER_PAGE = 12;
    const SCROLL_THRESHOLD = 100;

    // Optimize scroll handling with useCallback
    const handleScroll = useCallback(() => {
        const scrollContainer = document.querySelector('.products-container');
        if (!scrollContainer) return;

        const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
        const scrollBottom = scrollHeight - scrollTop - clientHeight;

        if (scrollBottom < SCROLL_THRESHOLD) {
            setVisibleRange(prev => ({
                start: prev.start,
                end: Math.min(prev.end + ITEMS_PER_PAGE, products.length)
            }));
        }

        if (scrollTop < SCROLL_THRESHOLD && prev.start > 0) {
            setVisibleRange(prev => ({
                start: Math.max(0, prev.start - ITEMS_PER_PAGE),
                end: prev.end
            }));
        }
    }, [products.length]);

    // Add scroll event listener
    useEffect(() => {
        const scrollContainer = document.querySelector('.products-container');
        if (scrollContainer) {
            scrollContainer.addEventListener('scroll', handleScroll);
            return () => scrollContainer.removeEventListener('scroll', handleScroll);
        }
    }, [handleScroll]);

    // Fetch products and their subproducts from Firebase
    const fetchProducts = async () => {
        try {
            setLoading(true);
            const productsRef = collection(db, "products");
            const querySnapshot = await getDocs(productsRef);
            const productsData = [];
            
            querySnapshot.forEach((doc) => {
                productsData.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            setProducts(productsData);

            // Fetch subproducts for each product
            const subproductsData = {};
            
            // for (const product of productsData) {
            //     try {
            //         const subProductRef = collection(db, product.name);
            //         const subQuerySnapshot = await getDocs(subProductRef);
            //         const subProductsArray = [];
                    
            //         subQuerySnapshot.forEach((doc) => {
            //             subProductsArray.push({
            //                 id: doc.id,
            //                 ...doc.data()
            //             });
            //         });
                    
            //         subproductsData[product.name] = subProductsArray;
            //     } catch (error) {
            //         console.error(`Error fetching subproducts for ${product.name}:`, error);
            //         subproductsData[product.name] = [];
            //     }
            // }
            
            // setSubProducts(subproductsData);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    };

    // Delete product
    const handleDelete = async (productId) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                await deleteDoc(doc(db, "products", productId));
                setProducts(products.filter(product => product.id !== productId));
                alert("Product deleted successfully!");
            } catch (error) {
                console.error("Error deleting product:", error);
                alert("Failed to delete product.");
            }
        }
    };

    // Open edit modal
    const handleEdit = (product) => {
        setEditingProduct(product);
        setEditForm({
            name: product.name || '',
            price: product.price || '',
            productUrl: product.productUrl || '',
            newImages: []
        });
        setEditModalOpen(true);
    };

    // Close edit modal
    const closeEditModal = () => {
        setEditModalOpen(false);
        setEditingProduct(null);
        setEditForm({
            name: '',
            price: '',
            productUrl: '',
            newImages: []
        });
    };

    // Handle form input changes
    const handleFormChange = (field, value) => {
        setEditForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Handle image file selection
    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        try {
            // Create temporary URLs for preview
            const previewUrls = files.map(file => URL.createObjectURL(file));
            
            // Update form with preview URLs
            setEditForm(prev => ({
                ...prev,
                newImages: [...prev.newImages, ...previewUrls],
                // If no current image, set the first uploaded image as main
                productUrl: prev.productUrl || previewUrls[0] || ''
            }));

            // Upload files to Firebase Storage
            const uploadedUrls = [];
            for (const file of files) {
                const filename = `${Date.now()}-${file.name}`;
                const imageRef = ref(storage, `products/${filename}`);
                const snapshot = await uploadBytes(imageRef, file);
                const url = await getDownloadURL(snapshot.ref);
                uploadedUrls.push(url);
            }

            // Update form with actual Firebase Storage URLs
            setEditForm(prev => ({
                ...prev,
                newImages: prev.newImages.map((url, index) => {
                    // Replace preview URL with actual Firebase Storage URL
                    if (previewUrls.includes(url)) {
                        const previewIndex = previewUrls.indexOf(url);
                        return uploadedUrls[previewIndex];
                    }
                    return url;
                }),
                productUrl: prev.productUrl.startsWith('blob:') ? uploadedUrls[0] : prev.productUrl
            }));

        } catch (error) {
            console.error("Error uploading images:", error);
            alert("Failed to upload images. Please try again.");
        }
    };

    // Remove new image
    const removeNewImage = (index) => {
        setEditForm(prev => {
            const newImages = prev.newImages.filter((_, i) => i !== index);
            return {
                ...prev,
                newImages,
                // If removing the main image, set next available image as main
                productUrl: prev.productUrl === prev.newImages[index] 
                    ? (newImages[0] || '') 
                    : prev.productUrl
            };
        });
    };

    // Save product changes
    const handleSaveEdit = async () => {
        if (!editingProduct) return;

        try {
            // Prepare updated data
            const updatedData = {
                name: editForm.name,
                price: editForm.price,
                updatedAt: new Date().toISOString()
            };

            // Handle image updates
            if (editForm.productUrl) {
                updatedData.productUrl = editForm.productUrl;
            } else if (editForm.newImages.length > 0) {
                updatedData.productUrl = editForm.newImages[0];
            } else {
                updatedData.productUrl = null;
            }

            await updateDoc(doc(db, "products", editingProduct.id), updatedData);
            
            alert("Product updated successfully!");
            closeEditModal();
            
            // Refresh products from database to ensure UI shows updated data
            await fetchProducts();
            
        } catch (error) {
            console.error("Error updating product:", error);
            alert("Failed to update product.");
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const renderActiveComponent = () => {
        switch(activeComponent) {
            case 'single':
                return <SingleUpload />;
            case 'multiple':
                return <MultipleUpload />;
            default:
                return (
                    <div className="w-full h-full overflow-y-auto products-container" style={{ 
                        scrollBehavior: 'smooth',
                        WebkitOverflowScrolling: 'touch',
                        overscrollBehavior: 'contain'
                    }}>
                        <div className="p-8">
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-bold text-white mb-4">Product Gallery</h2>
                                <p className="text-gray-400">Manage your uploaded products</p>
                                <button 
                                    onClick={fetchProducts}
                                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                >
                                    Refresh Products
                                </button>
                            </div>

                            {loading ? (
                                <div className="flex justify-center items-center h-64">
                                    <div className="text-white text-xl">Loading products...</div>
                                </div>
                            ) : products.length === 0 ? (
                                <div className="text-center text-gray-400">
                                    <h3 className="text-xl font-semibold mb-2">No products found</h3>
                                    <p>Upload some products using the sidebar options</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" style={{
                                    willChange: 'transform',
                                    transform: 'translateZ(0)',
                                    backfaceVisibility: 'hidden'
                                }}>
                                    {products.map((product) => (
                                        <div key={product.id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow" style={{
                                            willChange: 'transform',
                                            transform: 'translateZ(0)',
                                            backfaceVisibility: 'hidden'
                                        }}>
                                            {/* Main Product Image */}
                                            <div className="relative" style={{ height: '300px' }}>
                                                {product.productUrl ? (
                                                    <img 
                                                        src={product.productUrl} 
                                                        alt={product.name}
                                                        className="w-full h-full object-cover"
                                                        loading="lazy"
                                                        decoding="async"
                                                        style={{
                                                            willChange: 'transform',
                                                            transform: 'translateZ(0)',
                                                            backfaceVisibility: 'hidden'
                                                        }}
                                                        onError={(e) => {
                                                            console.error('Image failed to load:', product.productUrl);
                                                            e.target.src = '/placeholder-image.png';
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                                                        <span className="text-gray-400">No Image</span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="p-4">
                                                <h3 className="text-white font-semibold text-lg mb-1 truncate">
                                                    {product.name}
                                                </h3>
                                                {product.price && (
                                                    <p className="text-green-400 font-medium mb-3">
                                                        ${product.price}
                                                    </p>
                                                )}
                                                
                                                {/* Additional Images */}
                                                {subproducts[product.name] && subproducts[product.name].length > 0 && (
                                                    <div className="mb-4">
                                                        <p className="text-gray-400 text-sm mb-2">
                                                            Additional Images ({subproducts[product.name].length})
                                                        </p>
                                                        <div className="grid grid-cols-3 gap-2">
                                                            {subproducts[product.name].slice(0, 6).map((subProduct, index) => (
                                                                <div key={subProduct.id} className="aspect-square relative">
                                                                    <img 
                                                                        src={subProduct.productUrl} 
                                                                        alt={`${product.name} ${index + 1}`}
                                                                        className="w-full h-full object-cover rounded-md"
                                                                        onError={(e) => {
                                                                            e.target.src = '/placeholder-image.png';
                                                                        }}
                                                                    />
                                                                </div>
                                                            ))}
                                                            {subproducts[product.name].length > 6 && (
                                                                <div className="aspect-square bg-gray-700 rounded-md flex items-center justify-center">
                                                                    <span className="text-white text-xs">+{subproducts[product.name].length - 6}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEdit(product)}
                                                        className="flex-1 px-3 py-2 bg-sharon-or hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(product.id)}
                                                        className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                );
        }
    };

    return (
        <>
            <Head>
                <title>Sharon</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className="bg-black min-h-screen">
                <Navbar />
                <div className="bg-black flex h-screen">
                    
                    {/* Left Sidebar */}
                    <aside className="w-64 h-full bg-gray-900 border-r border-gray-700">
                        <div className="p-6">
                            <h2 className="text-xl font-bold text-white mb-6">Upload Options</h2>
                            <nav className="space-y-4">
                                <button
                                    onClick={() => setActiveComponent(null)}
                                    className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                                        activeComponent === null
                                            ? 'bg-sharon-or text-white'
                                            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                    }`}
                                >
                                    View Products
                                </button>
                                <button
                                    onClick={() => setActiveComponent('single')}
                                    className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                                        activeComponent === 'single'
                                            ? 'bg-sharon-or text-white'
                                            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                    }`}
                                >
                                    Single Upload
                                </button>
                                <button
                                    onClick={() => setActiveComponent('multiple')}
                                    className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                                        activeComponent === 'multiple'
                                            ? 'bg-sharon-or text-white'
                                            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                    }`}
                                >
                                    Multiple Upload
                                </button>
                            </nav>
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <main className="flex-1 h-full">
                        <div className="h-full flex items-center justify-center p-8">
                            {renderActiveComponent()}
                        </div>
                    </main>

                </div>

                {/* Edit Modal */}
                {editModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-white">Edit Product</h2>
                                    <button
                                        onClick={closeEditModal}
                                        className="text-gray-400 hover:text-white text-2xl font-bold"
                                    >
                                        ×
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    {/* Current Product Image */}
                                    {editForm.productUrl && (
                                        <div>
                                            <label className="block text-white font-medium mb-2">Current Image</label>
                                            <div className="aspect-square w-32 mb-4 relative">
                                                <img 
                                                    src={editForm.productUrl} 
                                                    alt={editForm.name}
                                                    className="w-full h-full object-cover rounded-lg"
                                                    onError={(e) => {
                                                        e.target.src = '/placeholder-image.png';
                                                    }}
                                                />
                                                <button
                                                    onClick={() => handleFormChange('productUrl', '')}
                                                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold hover:bg-red-700"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Product Name */}
                                    <div>
                                        <label className="block text-white font-medium mb-2">Product Name</label>
                                        <input
                                            type="text"
                                            value={editForm.name}
                                            onChange={(e) => handleFormChange('name', e.target.value)}
                                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-sharon-or"
                                            placeholder="Enter product name"
                                        />
                                    </div>

                                    {/* Product Price */}
                                    <div>
                                        <label className="block text-white font-medium mb-2">Price</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={editForm.price}
                                            onChange={(e) => handleFormChange('price', e.target.value)}
                                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-sharon-or"
                                            placeholder="Enter price"
                                        />
                                    </div>

                                    {/* Add New Images */}
                                    <div>
                                        <label className="block text-white font-medium mb-2">Add New Images</label>
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-sharon-or file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sharon-or file:text-white hover:file:bg-orange-600"
                                        />
                                        
                                        {/* Preview new images */}
                                        {editForm.newImages.length > 0 && (
                                            <div className="mt-4">
                                                <p className="text-gray-400 text-sm mb-2">New Images Preview:</p>
                                                <div className="grid grid-cols-4 gap-2">
                                                    {editForm.newImages.map((imageUrl, index) => (
                                                        <div key={index} className="relative aspect-square">
                                                            <img 
                                                                src={imageUrl} 
                                                                alt={`New image ${index + 1}`}
                                                                className="w-full h-full object-cover rounded-md cursor-pointer hover:opacity-80"
                                                                onClick={() => handleFormChange('productUrl', imageUrl)}
                                                            />
                                                            <button
                                                                onClick={() => removeNewImage(index)}
                                                                className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold hover:bg-red-700"
                                                            >
                                                                ×
                                                            </button>
                                                            {editForm.productUrl === imageUrl && (
                                                                <div className="absolute bottom-1 left-1 bg-green-600 text-white text-xs px-2 py-1 rounded">
                                                                    Main
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-4 pt-6">
                                        <button
                                            onClick={handleSaveEdit}
                                            className="flex-1 px-6 py-3 bg-sharon-or hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
                                        >
                                            Save Changes
                                        </button>
                                        <button
                                            onClick={closeEditModal}
                                            className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </>
    )
}