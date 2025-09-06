import Head from 'next/head'
import Navbar from '../../components/Navbar'
import { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import { db } from "../../firebase";
import {
    ref,
    uploadBytes,
    getDownloadURL,
    listAll,
    list,
} from "firebase/storage";
import {
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    query,
    where,
} from "firebase/firestore";
import { storage } from "../../firebase";
import { revalidatePages, getRevalidationTags } from "../../utils/revalidate";

export default function Home() {
    const router = useRouter();
    const productsRef = collection(db, "products");

    // State for categories management
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [isSavingAny, setIsSavingAny] = useState(false);
    const [savingCategoryId, setSavingCategoryId] = useState(null);
    const [pendingImageByCategoryId, setPendingImageByCategoryId] = useState({});
    
    // State for adding new categories
    const [showAddForm, setShowAddForm] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryFile, setNewCategoryFile] = useState(null);
    const [categoryProductFiles, setCategoryProductFiles] = useState([]);
    const [isAddingCategory, setIsAddingCategory] = useState(false);

    // Fetch all categories from products collection
    const fetchCategories = async () => {
        setLoadingCategories(true);
        try {
            const snapshot = await getDocs(productsRef);
            const list = snapshot.docs.map(d => {
                const data = d.data() || {};
                const name = typeof data.name === 'string' ? data.name : '';
                return { 
                    id: d.id, 
                    ...data, 
                    displayName: name.replace(/_/g, ' '),
                    originalName: name
                };
            });
            setCategories(list);
        } catch (error) {
            console.error('Error fetching categories:', error);
            alert('Failed to fetch categories');
        } finally {
            setLoadingCategories(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // Handle new category image selection
    const onPickNewCategoryImage = (categoryId, fileObj) => {
        setPendingImageByCategoryId(prev => ({ ...prev, [categoryId]: fileObj }));
    };

    // Migrate collection when category name changes
    const migrateCollection = async (oldName, newName) => {
        if (!oldName || !newName || oldName === newName) return;
        
        try {
            const oldColRef = collection(db, oldName);
            const newColRef = collection(db, newName);
            const oldDocs = await getDocs(oldColRef);

            // Copy all documents to new collection
            for (const d of oldDocs.docs) {
                const data = d.data() || {};
                const newData = { ...data };
                // Keep the original product name, don't change it to category name
                // Only update if the product name was the same as old category name
                if (newData.name === oldName) {
                    newData.name = newName;
                }
                await addDoc(newColRef, newData);
            }

            // Delete all documents from old collection
            for (const d of oldDocs.docs) {
                await deleteDoc(doc(db, oldName, d.id));
            }

            console.log(`Successfully migrated collection from ${oldName} to ${newName}`);
        } catch (error) {
            console.error('Error migrating collection:', error);
            throw error;
        }
    };

    // Save category changes
    const saveCategory = async (category) => {
        if (isSavingAny) return;
        
        setIsSavingAny(true);
        setSavingCategoryId(category.id);
        
        try {
            const currentName = category.originalName;
            const inputEl = document.getElementById(`cat-name-${category.id}`);
            const newName = inputEl ? inputEl.value.trim() : currentName;
            const sanitizedNewName = String(newName).replace(/\s+/g, '_');
            const docRef = doc(db, 'products', category.id);

            let newImageUrl = category.productUrl;
            const pendingFile = pendingImageByCategoryId[category.id];
            
            // Handle new image upload
            if (pendingFile) {
                const imageRef = ref(storage, `products/${sanitizedNewName}`);
                const snapshot = await uploadBytes(imageRef, pendingFile);
                newImageUrl = await getDownloadURL(snapshot.ref);
            }

            // Update category document in products collection
            await updateDoc(docRef, { 
                name: sanitizedNewName, 
                productUrl: newImageUrl 
            });

            // If name changed, migrate the category's collection
            if (currentName && sanitizedNewName && currentName !== sanitizedNewName) {
                await migrateCollection(currentName, sanitizedNewName);
            }

            // Update local state immediately instead of refetching
            setCategories(prevCategories => 
                prevCategories.map(cat => 
                    cat.id === category.id 
                        ? {
                            ...cat,
                            name: sanitizedNewName,
                            productUrl: newImageUrl,
                            displayName: newName,
                            originalName: sanitizedNewName
                        }
                        : cat
                )
            );

            // Clear pending image
            setPendingImageByCategoryId(prev => ({ ...prev, [category.id]: undefined }));
            
            // Trigger revalidation
            try {
                await revalidatePages(getRevalidationTags.categoryChange());
            } catch (error) {
                console.error('Revalidation failed:', error);
            }
            
            alert('Category saved successfully!');
        } catch (error) {
            console.error('Error saving category:', error);
            alert('Failed to save category. Please try again.');
        } finally {
            setSavingCategoryId(null);
            setIsSavingAny(false);
        }
    };

    // Delete category and its collection
    const deleteCategory = async (category) => {
        if (!window.confirm(`Are you sure you want to delete "${category.displayName}" and all its products?`)) {
            return;
        }

        try {
            // Delete the category document from products collection
            await deleteDoc(doc(db, 'products', category.id));
            
            // Delete all products in the category's collection
            const categoryCollectionRef = collection(db, category.originalName);
            const categorySnapshot = await getDocs(categoryCollectionRef);
            
            for (const docSnapshot of categorySnapshot.docs) {
                await deleteDoc(doc(db, category.originalName, docSnapshot.id));
            }

            // Update local state immediately instead of refetching
            setCategories(prevCategories => 
                prevCategories.filter(cat => cat.id !== category.id)
            );

            // Trigger revalidation
            try {
                await revalidatePages(getRevalidationTags.categoryChange());
            } catch (error) {
                console.error('Revalidation failed:', error);
            }

            alert(`Category "${category.displayName}" deleted successfully!`);
        } catch (error) {
            console.error('Error deleting category:', error);
            alert('Failed to delete category. Please try again.');
        }
    };

    // Add new category with products
    const addNewCategory = async () => {
        if (!newCategoryName.trim() || !newCategoryFile) {
            alert('Please provide both category name and main category image');
            return;
        }

        setIsAddingCategory(true);
        try {
            const sanitizedName = String(newCategoryName).trim().replace(/\s+/g, '_');
            
            // Upload main category image
            const imageRef = ref(storage, `products/${sanitizedName}`);
            const snapshot = await uploadBytes(imageRef, newCategoryFile);
            const imageUrl = await getDownloadURL(snapshot.ref);
            
            // Add main category to products collection
            const docRef = await addDoc(productsRef, {
                name: sanitizedName,
                productUrl: imageUrl
            });

            // If there are product images, upload them to the category collection
            if (categoryProductFiles.length > 0) {
                const categoryCollectionRef = collection(db, sanitizedName);
                
                // Upload all product images
                const uploadPromises = categoryProductFiles.map(async (file, index) => {
                    const productImageRef = ref(storage, `${sanitizedName}/${Date.now()}-${index}-${file.name}`);
                    const productSnapshot = await uploadBytes(productImageRef, file);
                    const productImageUrl = await getDownloadURL(productSnapshot.ref);
                    
                    // Add to category collection as products
                    return addDoc(categoryCollectionRef, {
                        name: sanitizedName,
                        productUrl: productImageUrl,
                        price: ''
                    });
                });

                await Promise.all(uploadPromises);
            }

            // Update local state immediately
            const newCategory = {
                id: docRef.id,
                name: sanitizedName,
                productUrl: imageUrl,
                displayName: newCategoryName.trim(),
                originalName: sanitizedName
            };

            setCategories(prevCategories => [...prevCategories, newCategory]);

            // Trigger revalidation
            try {
                await revalidatePages(getRevalidationTags.categoryChange());
            } catch (error) {
                console.error('Revalidation failed:', error);
            }

            // Reset form
            setNewCategoryName('');
            setNewCategoryFile(null);
            setCategoryProductFiles([]);
            setShowAddForm(false);

            const productCount = categoryProductFiles.length;
            alert(`Category "${newCategoryName}" added successfully${productCount > 0 ? ` with ${productCount} products` : ''}!`);
        } catch (error) {
            console.error('Error adding category:', error);
            alert('Failed to add category. Please try again.');
        } finally {
            setIsAddingCategory(false);
        }
    };


    return (
        <>
            <Head>
                <title>Sharon Admin - Categories Management</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className="bg-black min-h-screen">
                <Navbar />
                
                {/* Header */}
                <div className="px-6 py-8 max-w-7xl mx-auto">
                    <div className="flex justify-between items-center my-8">
                        <h1 className="md:text-3xl text-xl font-bold text-white">Categories Management</h1>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setShowAddForm(!showAddForm)}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                            >
                                {showAddForm ? 'Cancel' : 'Add Category'}
                            </button>
                            <button 
                                onClick={fetchCategories}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                                Refresh
                            </button>
                        </div>
                    </div>

                    {/* Add Category Form */}
                    {showAddForm && (
                        <div className="mb-8 p-6 bg-gray-800 rounded-lg border border-gray-700">
                            <h2 className="text-xl font-semibold text-white mb-4">Add New Category with Products</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Category Name</label>
                                    <input
                                        type="text"
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                                        placeholder="Enter category name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Main Category Image</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setNewCategoryFile(e.target.files && e.target.files[0])}
                                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-blue-500 focus:border-blue-500 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sharon-or file:text-white hover:file:bg-orange-600"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">This will be the main category display image</p>
                                </div>
                            </div>
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-300 mb-2">Product Images (Optional)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={(e) => setCategoryProductFiles(Array.from(e.target.files))}
                                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-blue-500 focus:border-blue-500 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                                />
                                <p className="text-xs text-gray-400 mt-1">
                                    Selected {categoryProductFiles.length} product images. These will be added as products to the category.
                                </p>
                            </div>
                            <div className="flex gap-3 mt-4">
                                <button
                                    onClick={addNewCategory}
                                    disabled={isAddingCategory}
                                    className={`px-6 py-2 text-white font-medium rounded-lg transition-colors ${
                                        isAddingCategory 
                                            ? 'bg-gray-600 opacity-60 cursor-not-allowed' 
                                            : 'bg-green-600 hover:bg-green-700'
                                    }`}
                                >
                                    {isAddingCategory ? 'Adding...' : 'Add Category'}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowAddForm(false);
                                        setNewCategoryName('');
                                        setNewCategoryFile(null);
                                        setCategoryProductFiles([]);
                                    }}
                                    className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}


                    {/* Categories Grid */}
                    {loadingCategories ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="text-white text-xl">Loading categories...</div>
                        </div>
                    ) : categories.length === 0 ? (
                        <div className="text-center text-gray-400 py-12">
                            <h3 className="text-xl font-semibold mb-2">No categories found</h3>
                            <p>Add some categories to get started</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {categories.map(cat => (
                                <div key={cat.id} className="rounded-lg shadow-lg border bg-gray-800 border-gray-700 p-6 space-y-4 hover:shadow-xl transition-shadow">
                                    {/* Category Image */}
                                    <div className="relative">
                                        {cat.productUrl ? (
                                            <img 
                                                src={cat.productUrl} 
                                                alt={cat.displayName} 
                                                className="w-full h-48 object-cover rounded-lg"
                                                onError={(e) => {
                                                    e.target.src = '/placeholder-image.png';
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-48 bg-gray-700 rounded-lg flex items-center justify-center text-gray-400">
                                                No Image
                                            </div>
                                        )}
                                    </div>

                                    {/* Category Name Input */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-300">Category Name</label>
                                        <input 
                                            id={`cat-name-${cat.id}`} 
                                            defaultValue={cat.displayName || ''} 
                                            className="border sm:text-sm rounded-lg w-full p-3 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500 focus:outline-none" 
                                            placeholder="Enter category name"
                                        />
                                    </div>

                                    {/* Image Upload */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-300">Replace Image</label>
                                        <input 
                                            type="file" 
                                            accept="image/*"
                                            onChange={(e) => onPickNewCategoryImage(cat.id, e.target.files && e.target.files[0])} 
                                            className="border sm:text-sm rounded-lg w-full p-3 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sharon-or file:text-white hover:file:bg-orange-600" 
                                        />
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col gap-2 pt-2">
                                        <button
                                            type="button"
                                            disabled={isSavingAny}
                                            onClick={() => saveCategory(cat)}
                                            className={`w-full text-white font-medium rounded-lg text-sm px-4 py-3 text-center transition-colors ${
                                                isSavingAny && savingCategoryId === cat.id 
                                                    ? "bg-blue-600 opacity-60 cursor-not-allowed" 
                                                    : "bg-blue-600 hover:bg-blue-500"
                                            }`}
                                        >
                                            {isSavingAny && savingCategoryId === cat.id ? 'Saving...' : 'Save Changes'}
                                        </button>
                                        
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                disabled={isSavingAny}
                                                onClick={() => {
                                                    router.push(`/admin/${cat.originalName}`);
                                                }}
                                                className={`flex-1 text-white font-medium rounded-lg text-sm px-3 py-2 text-center transition-colors ${
                                                    isSavingAny ? "bg-sharon-or opacity-60 cursor-not-allowed" : "bg-sharon-or hover:bg-orange-600"
                                                }`}
                                            >
                                                View
                                            </button>
                                            
                                            <button
                                                type="button"
                                                disabled={isSavingAny}
                                                onClick={() => deleteCategory(cat)}
                                                className={`flex-1 text-white font-medium rounded-lg text-sm px-3 py-2 text-center transition-colors ${
                                                    isSavingAny ? "bg-red-600 opacity-60 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
                                                }`}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>

                                    {/* Loading indicator */}
                                    {isSavingAny && savingCategoryId === cat.id && (
                                        <div className="text-center">
                                            <p className="text-xs text-gray-400">Saving changes, please wait...</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </>
    )
}
