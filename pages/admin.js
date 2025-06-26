import Head from 'next/head'
import Navbar from '../components/Navbar'
import SingleUpload from '../components/CategoryUpload'

import { useState, useEffect, useCallback, useRef } from "react";
import { db, storage } from "../firebase";
import {
    collection,
    getDocs,
    doc,
    deleteDoc,
    updateDoc,
    addDoc
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { TurnedInNot } from '@mui/icons-material';
import { useConnection } from '../components/context/ConnectionContext';
import ProductUpload from '../components/ProductUpload';
import CategoryUpload from '../components/CategoryUpload';

// Utility functions
const PRODUCTS_KEY = 'sharon_products';
const SUBIMAGES_KEY = 'sharon_subimages';

const saveToLocalStorage = (key, value) => {
    console.log('Saving to localStorage:', key, value);
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.warn('Failed to save to localStorage', key, e);
    }
};
const loadFromLocalStorage = (key, fallback = null) => {
    try {
        const val = localStorage.getItem(key);
        return val ? JSON.parse(val) : fallback;
    } catch (e) {
        return fallback;
    }
};

async function createImageBlob(imageUrl) {
    try {

        console.log("here");
        
        const response = await fetch(imageUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const imageBlob = await response.blob();
        
        // Verify it's actually an image
        if (!imageBlob.type.startsWith('image/')) {
            throw new Error('Not a valid image type');
        }
        
        console.log(`Image blob created: ${imageBlob.size} bytes, type: ${imageBlob.type}`);
        return imageBlob;
        
    } catch (error) {
        console.error('Failed to create image blob:', error);
        return null;
    }
}



export default function Home() {
    const [activeComponent, setActiveComponent] = useState(null);
    const [products, setProducts] = useState([]);
    const [subproducts, setSubProducts] = useState({});
    const [loading, setLoading] = useState(true);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [editForm, setEditForm] = useState({
        name: '',
        productUrl: '',
        newImages: []
    });

    // Add scroll optimization state
    const [visibleRange, setVisibleRange] = useState({ start: 0, end: 12 });
    const ITEMS_PER_PAGE = 12;
    const SCROLL_THRESHOLD = 100;
    const {isOnline}=useConnection()

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
    const fetchProductsAndSubimages = async () => {
        if (navigator.onLine) {
        try {
            setLoading(true);
                // Fetch products
            const productsRef = collection(db, "products");
            const querySnapshot = await getDocs(productsRef);
            const productsData = [];
            
            querySnapshot.forEach((doc) => {
                productsData.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            const products = await Promise.all(
                productsData.map(async (data) => {
                    let imageBlob = await createImageBlob(data.productUrl);
                    return {
                        ...data,
                        offlineImage: imageBlob
                    };
                })
            );
            
            console.log("blob", products); // Now this will have all products with images
            
            setProducts(productsData);
                if (productsData.length > 0) {
                    saveToLocalStorage(PRODUCTS_KEY, productsData);
                }

                // Fetch subimages for each product
                const subimagesData = {};
            
            for (const product of productsData) {
                try {
                    const subProductRef = collection(db, product.name);
                    const subQuerySnapshot = await getDocs(subProductRef);
                        const subImagesArray = [];
                    
                    subQuerySnapshot.forEach((doc) => {
                            subImagesArray.push({
                            id: doc.id,
                            ...doc.data()
                        });
                    });
                    
                        subimagesData[product.id] = subImagesArray;
                } catch (error) {
                        subimagesData[product.id] = [];
                    }
                }
                setSubProducts(subimagesData);
                if (Object.keys(subimagesData).length > 0) {
                    saveToLocalStorage(SUBIMAGES_KEY, subimagesData);
            }
        } catch (error) {
                // If fetch fails, fallback to localStorage
                setProducts(loadFromLocalStorage(PRODUCTS_KEY, []));
                setSubProducts(loadFromLocalStorage(SUBIMAGES_KEY, {}));
        } finally {
            setLoading(false);
            }
        } else {
            // Offline: load from localStorage
            setProducts(loadFromLocalStorage(PRODUCTS_KEY, []));
            setSubProducts(loadFromLocalStorage(SUBIMAGES_KEY, {}));
        }
    };

    // On mount and on network status change
    useEffect(() => {
        fetchProductsAndSubimages();
        const handleOnline = () => fetchProductsAndSubimages();
        const handleOffline = () => fetchProductsAndSubimages();
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);



    async function deleteEntireCollection(collectionName) {
        const collectionRef = collection(db, collectionName);
        const snapshot = await getDocs(collectionRef);
        
        // Delete all documents in the collection
        const deletePromises = snapshot.docs.map(document => 
          deleteDoc(doc(db, collectionName, document.id))
        );
        
        await Promise.all(deletePromises);
        console.log(`Collection '${collectionName}' deleted successfully`);
      }

    // Delete product
    const handleDelete = async (productId,productName) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                if(!isOnline){
                    alert(`Deltion of the ${productName} is in queue after internet comes it will reflect in database `)
                }
                await deleteDoc(doc(db, "products", productId));
                await deleteEntireCollection(productName)
                setProducts(products.filter(product => product.id !== productId));
                alert(`Product ${productName} deleted successfully!`);
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
            await fetchProductsAndSubimages();
            
        } catch (error) {
            console.error("Error updating product:", error);
            alert("Failed to update product.");
        }
    };

    const [subimagesModalOpen, setSubimagesModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [subimages, setSubimages] = useState([]);
    const [loadingSubimages, setLoadingSubimages] = useState(false);
    const [subimagesPage, setSubimagesPage] = useState(1);
    const SUBIMAGES_PER_PAGE = 12;
    const [hasMoreSubimages, setHasMoreSubimages] = useState(true);
    const [imageCache, setImageCache] = useState(new Map());
    const [preloadedImages, setPreloadedImages] = useState(new Set());
    const PRELOAD_AHEAD = 24; // Number of images to preload ahead
    const [uploadingSubimage, setUploadingSubimage] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [cameraStream, setCameraStream] = useState(null);
    const videoRef = useRef(null);
    const [capturedImage, setCapturedImage] = useState(null);

    // Function to preload images
    const preloadImages = useCallback((urls) => {
        urls.forEach(url => {
            if (!preloadedImages.has(url)) {
                const img = new Image();
                img.src = url;
                img.onload = () => {
                    setPreloadedImages(prev => new Set([...prev, url]));
                    setImageCache(prev => new Map(prev).set(url, img));
                };
            }
        });
    }, [preloadedImages]);

    // Function to fetch subimages with pagination and preloading
    const fetchSubimages = async (productName, page = 1) => {
        try {
            setLoadingSubimages(true);
            const subProductRef = collection(db, productName);
            const subQuerySnapshot = await getDocs(subProductRef);
            const subImagesArray = [];
            
            subQuerySnapshot.forEach((doc) => {
                subImagesArray.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            // Calculate pagination
            const startIndex = (page - 1) * SUBIMAGES_PER_PAGE;
            const endIndex = startIndex + SUBIMAGES_PER_PAGE;
            const paginatedImages = subImagesArray.slice(startIndex, endIndex);
            
            // Preload next batch of images
            const nextBatchStart = endIndex;
            const nextBatchEnd = nextBatchStart + SUBIMAGES_PER_PAGE;
            const nextBatchImages = subImagesArray.slice(nextBatchStart, nextBatchEnd);
            preloadImages(nextBatchImages.map(img => img.productUrl));
            
            setSubimages(prev => page === 1 ? paginatedImages : [...prev, ...paginatedImages]);
            setHasMoreSubimages(endIndex < subImagesArray.length);
        } catch (error) {
            console.error(`Error fetching subimages for ${productName}:`, error);
            setSubimages([]);
        } finally {
            setLoadingSubimages(false);
        }
    };

    // Function to load more subimages
    const loadMoreSubimages = async () => {
        if (!loadingSubimages && hasMoreSubimages && selectedProduct) {
            const nextPage = subimagesPage + 1;
            setSubimagesPage(nextPage);
            await fetchSubimages(selectedProduct.name, nextPage);
        }
    };

    // Function to open subimages modal
    const openSubimagesModal = async (product) => {
        setSelectedProduct(product);
        setSubimagesModalOpen(true);
        setSubimagesPage(1);
        setHasMoreSubimages(true);
        await fetchSubimages(product.name, 1);
    };

    // Function to close subimages modal
    const closeSubimagesModal = () => {
        setSubimagesModalOpen(false);
        setSelectedProduct(null);
        setSubimages([]);
        setSubimagesPage(1);
        setHasMoreSubimages(true);
    };

    // Intersection Observer for infinite scroll
    useEffect(() => {
        if (!subimagesModalOpen) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMoreSubimages && !loadingSubimages) {
                    loadMoreSubimages();
                }
            },
            { threshold: 0.1 }
        );

        const loadMoreTrigger = document.getElementById('load-more-trigger');
        if (loadMoreTrigger) {
            observer.observe(loadMoreTrigger);
        }

        return () => {
            if (loadMoreTrigger) {
                observer.unobserve(loadMoreTrigger);
            }
        };
    }, [subimagesModalOpen, hasMoreSubimages, loadingSubimages]);

    // Optimized image component
    const OptimizedImage = useCallback(({ src, alt, className, style }) => {
        const [isLoaded, setIsLoaded] = useState(preloadedImages.has(src));
        const [error, setError] = useState(false);

        useEffect(() => {
            if (!isLoaded && !error) {
                const img = new Image();
                img.src = src;
                img.onload = () => {
                    setIsLoaded(true);
                    setImageCache(prev => new Map(prev).set(src, img));
                };
                img.onerror = () => setError(true);
            }
        }, [src, isLoaded, error]);

        if (error) {
            return (
                <div className={`${className} bg-gray-700 flex items-center justify-center`}>
                    <span className="text-gray-400">Failed to load</span>
                </div>
            );
        }

        return (
            <div className={`${className} relative`}>
                {!isLoaded && (
                    <div className="absolute inset-0 bg-gray-700 animate-pulse" />
                )}
                <img
                    src={src}
                    alt={alt}
                    className={`${className} transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                    style={{
                        ...style,
                        willChange: 'transform',
                        transform: 'translateZ(0)',
                        backfaceVisibility: 'hidden'
                    }}
                    loading="lazy"
                    decoding="async"
                    onError={() => setError(true)}
                />
            </div>
        );
    }, [preloadedImages]);

    // Function to handle subimage upload
    const handleSubimageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        try {
            setUploadingSubimage(true);
            for (const file of files) {
                const filename = `${Date.now()}-${file.name}`;
                const imageRef = ref(storage, `products/${selectedProduct.name}/${filename}`);
                const snapshot = await uploadBytes(imageRef, file);
                const url = await getDownloadURL(snapshot.ref);
                
                // Add to subimages collection
                await addDoc(collection(db, selectedProduct.name), {
                    productUrl: url,
                    createdAt: new Date().toISOString()
                });
            }
            
            // Refresh subimages
            await fetchSubimages(selectedProduct.name, subimagesPage);
        } catch (error) {
            console.error("Error uploading subimage:", error);
            alert("Failed to upload image. Please try again.");
        } finally {
            setUploadingSubimage(false);
        }
    };

    // Function to handle camera capture
    const handleCameraCapture = async () => {
        if (!videoRef.current) return;

        try {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
            
            // Convert canvas to blob
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg'));
            const imageUrl = URL.createObjectURL(blob);
            setCapturedImage({ blob, url: imageUrl });
            stopCamera();
            setShowCamera(false);
        } catch (error) {
            console.error("Error capturing image:", error);
            alert("Failed to capture image. Please try again.");
        }
    };

    // Function to handle captured image upload
    const handleCapturedImageUpload = async () => {
        if (!capturedImage) return;

        try {
            setUploadingSubimage(true);
            const file = new File([capturedImage.blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });

            // Upload the captured image
            const filename = `${Date.now()}-${file.name}`;
            const imageRef = ref(storage, `products/${selectedProduct.name}/${filename}`);
            const snapshot = await uploadBytes(imageRef, file);
            const url = await getDownloadURL(snapshot.ref);

            // Add to subimages collection
            await addDoc(collection(db, selectedProduct.name), {
                productUrl: url,
                createdAt: new Date().toISOString()
            });

            // Refresh subimages
            await fetchSubimages(selectedProduct.name, subimagesPage);
            setCapturedImage(null);
        } catch (error) {
            console.error("Error uploading captured image:", error);
            alert("Failed to upload image. Please try again.");
        } finally {
            setUploadingSubimage(false);
        }
    };

    // Function to cancel captured image
    const handleCancelCapturedImage = () => {
        if (capturedImage?.url) {
            URL.revokeObjectURL(capturedImage.url);
        }
        setCapturedImage(null);
    };

    // Function to handle camera setup
    const setupCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            setCameraStream(stream);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (error) {
            console.error("Error accessing camera:", error);
            alert("Failed to access camera. Please check your permissions.");
        }
    };

    // Function to stop camera
    const stopCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }
    };

    // Function to delete subimage
    const handleDeleteSubimage = async (subimageId) => {
        if (!window.confirm("Are you sure you want to delete this image?")) return;

        try {
            if(!isOnline){
                alert(`Deletion of ${selectedProduct.name} is in queue after internet comes deletion will reflect`)
            }
            setUploadingSubimage(true);
            // Delete from Firestore
            await deleteDoc(doc(db, selectedProduct.name, subimageId));
            
            // Refresh subimages
            await fetchSubimages(selectedProduct.name, subimagesPage);
        } catch (error) {
            console.error("Error deleting subimage:", error);
            alert("Failed to delete image. Please try again.");
        } finally {
            setUploadingSubimage(false);
        }
    };

    // Cleanup when modal closes
    useEffect(() => {
        if (!subimagesModalOpen) {
            stopCamera();
            setShowCamera(false);
            handleCancelCapturedImage();
        }
    }, [subimagesModalOpen]);

    const renderActiveComponent = () => {
        switch(activeComponent) {
            case 'single':
                return <CategoryUpload/>;
            case 'multiple':
                return <ProductUpload/>;
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
                                    onClick={fetchProductsAndSubimages}
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
                                                
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEdit(product)}
                                                        className="flex-1 px-3 py-2 bg-sharon-or hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(product.id,product.name)}
                                                        className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>

                                                {/* Subimages Button */}
                                                <button
                                                    onClick={() => openSubimagesModal(product)}
                                                    className="w-full mt-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors"
                                                >
                                                    View Additional Images
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Subimages Modal */}
                        {subimagesModalOpen && (
                            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                                <div className="bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                                    <div className="p-6">
                                        <div className="flex justify-between items-center mb-6">
                                            <h2 className="text-2xl font-bold text-white">
                                                Additional Images - {selectedProduct?.name}
                                            </h2>
                                            <button
                                                onClick={closeSubimagesModal}
                                                className="text-gray-400 hover:text-white text-2xl font-bold"
                                            >
                                                ×
                                            </button>
                                        </div>

                                        {/* Upload Options */}
                                        <div className="mb-6 flex gap-4">
                                            <label className="flex-1">
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept="image/*"
                                                    onChange={handleSubimageUpload}
                                                    className="hidden"
                                                    disabled={uploadingSubimage}
                                                />
                                                <div className="w-full px-4 py-2 bg-sharon-or hover:bg-orange-600 text-white text-center rounded-lg cursor-pointer transition-colors">
                                                    {uploadingSubimage ? 'Uploading...' : 'Upload from Files'}
                                                </div>
                                            </label>
                                            <button
                                                onClick={() => {
                                                    if (showCamera) {
                                                        stopCamera();
                                                        setShowCamera(false);
                                                    } else {
                                                        setShowCamera(true);
                                                        setupCamera();
                                                    }
                                                }}
                                                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                            >
                                                {showCamera ? 'Close Camera' : 'Take Photo'}
                                            </button>
                                        </div>

                                        {/* Camera View */}
                                        {showCamera && (
                                            <div className="mb-6 relative">
                                                <video
                                                    ref={videoRef}
                                                    autoPlay
                                                    playsInline
                                                    className="w-full h-64 object-cover rounded-lg"
                                                />
                                                <button
                                                    onClick={handleCameraCapture}
                                                    disabled={uploadingSubimage}
                                                    className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                                                >
                                                    Capture
                                                </button>
                                            </div>
                                        )}

                                        {/* Captured Image Preview */}
                                        {capturedImage && (
                                            <div className="mb-6">
                                                <div className="relative">
                                                    <img
                                                        src={capturedImage.url}
                                                        alt="Captured preview"
                                                        className="w-full h-64 object-contain rounded-lg bg-gray-800"
                                                    />
                                                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
                                                        <button
                                                            onClick={handleCapturedImageUpload}
                                                            disabled={uploadingSubimage}
                                                            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                                                        >
                                                            {uploadingSubimage ? 'Uploading...' : 'Confirm & Upload'}
                                                        </button>
                                                        <button
                                                            onClick={handleCancelCapturedImage}
                                                            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {loadingSubimages && subimages.length === 0 ? (
                                            <div className="flex justify-center items-center h-64">
                                                <div className="text-white text-xl">Loading images...</div>
                                            </div>
                                        ) : subimages.length === 0 ? (
                                            <div className="text-center text-gray-400 py-8">
                                                No additional images found
                                            </div>
                                        ) : (
                                            <>
                                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                                    {subimages.map((subimage) => (
                                                        <div key={subimage.id} className="aspect-square relative group bg-gray-800 rounded-lg p-2 flex flex-col justify-between">
                                                            <OptimizedImage
                                                                src={subimage.productUrl}
                                                                alt={`${selectedProduct?.name} subimage`}
                                                                className="w-full h-32 object-cover rounded-lg"
                                                            />
                                                            <div className="mt-2 text-center">
                                                                <div className="text-white text-sm truncate">{subimage.name || <span className="text-gray-400">No Name</span>}</div>
                                                                {subimage.price && (
                                                                    <div className="text-green-400 text-xs mt-1">${subimage.price}</div>
                                                                )}
                                                            </div>
                                                            <button
                                                                onClick={() => handleDeleteSubimage(subimage.id)}
                                                                className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                                title="Delete image"
                                                            >
                                                                ×
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                                
                                                {/* Loading trigger for infinite scroll */}
                                                {hasMoreSubimages && (
                                                    <div 
                                                        id="load-more-trigger"
                                                        className="h-10 flex items-center justify-center mt-4"
                                                    >
                                                        {loadingSubimages ? (
                                                            <div className="text-white">Loading more images...</div>
                                                        ) : (
                                                            <div className="h-1 w-full bg-gray-700"></div>
                                                        )}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
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
                                    Category Upload
                                </button>
                                <button
                                    onClick={() => setActiveComponent('multiple')}
                                    className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                                        activeComponent === 'multiple'
                                            ? 'bg-sharon-or text-white'
                                            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                    }`}
                                >
                                     Products Upload
                                  
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