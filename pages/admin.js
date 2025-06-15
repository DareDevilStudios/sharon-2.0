import Head from 'next/head'
import Navbar from '../components/Navbar'
import SingleUpload from '../components/SingleUpload'
import MultipleUpload from '../components/MultipleUpload'
import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
    collection,
    getDocs,
    doc,
    deleteDoc
} from "firebase/firestore";

export default function Home() {
    const [activeComponent, setActiveComponent] = useState(null);
    const [products, setProducts] = useState([]);
    const [subproducts, setSubProducts] = useState({});
    const [loading, setLoading] = useState(true);

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

    // Edit product (placeholder for now)
    const handleEdit = (product) => {
        alert(`Edit functionality for ${product.name} - Coming soon!`);
        // You can implement edit functionality here
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
                    <div className="w-full h-full overflow-y-auto">
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
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {products.map((product) => (
                                        <div key={product.id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                                            {/* Main Product Image */}
                                            <div className="aspect-square relative">
                                                <img 
                                                    src={product.productUrl} 
                                                    alt={product.name}
                                                 onError={(e) => {
    e.target.style.display = 'none'; // Hide broken images
}}
                                                />
                                            </div>
                                            
                                            <div className="p-4">
                                                <h3 className="text-white font-semibold text-lg mb-3 truncate">
                                                    {product.name}
                                                </h3>
                                                
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
                                                                    <span className="text-white text-xs">
                                                                        +{subproducts[product.name].length - 6}
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
            </main>
        </>
    )
}