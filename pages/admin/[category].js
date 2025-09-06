import Head from "next/head";
import Navbar from "../../components/Navbar";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase";
import { revalidatePages, getRevalidationTags } from "../../utils/revalidate";

const CategoryProducts = () => {
  const router = useRouter();
  const { category } = router.query;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    price: "",
    productUrl: "",
  });
  const [newImage, setNewImage] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    file: null,
  });
  const [isAdding, setIsAdding] = useState(false);

  // State for bulk product upload
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [bulkProductName, setBulkProductName] = useState(category || "");
  const [bulkProductFiles, setBulkProductFiles] = useState([]);
  const [isAddingBulkProducts, setIsAddingBulkProducts] = useState(false);

  // Fetch products for the category
  const fetchProducts = async () => {
    if (!category) return;

    setLoading(true);
    try {
      const productsRef = collection(db, category);
      const querySnapshot = await getDocs(productsRef);
      const productsList = [];

      querySnapshot.forEach((doc) => {
        productsList.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      setProducts(productsList);
    } catch (error) {
      console.error("Error fetching products:", error);
      alert("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category]);

  // Handle product edit
  const handleEdit = (product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name || "",
      price: product.price || "",
      productUrl: product.productUrl || "",
    });
    setNewImage(null);
  };

  // Save product changes
  const saveProduct = async () => {
    if (!editingProduct) return;

    setIsSaving(true);
    try {
      let newImageUrl = editForm.productUrl;

      // Handle new image upload
      if (newImage) {
        const imageRef = ref(
          storage,
          `${category}/${Date.now()}-${newImage.name}`
        );
        const snapshot = await uploadBytes(imageRef, newImage);
        newImageUrl = await getDownloadURL(snapshot.ref);
      }

      // Update product document
      const docRef = doc(db, category, editingProduct.id);
      await updateDoc(docRef, {
        name: editForm.name,
        price: editForm.price,
        productUrl: newImageUrl,
      });

      // Update local state
      setProducts((prevProducts) =>
        prevProducts.map((p) =>
          p.id === editingProduct.id
            ? {
                ...p,
                name: editForm.name,
                price: editForm.price,
                productUrl: newImageUrl,
              }
            : p
        )
      );

      // Reset form
      setEditingProduct(null);
      setEditForm({ name: "", price: "", productUrl: "" });
      setNewImage(null);

      // Trigger revalidation
      try {
        await revalidatePages(getRevalidationTags.productChange(category));
      } catch (error) {
        console.error('Revalidation failed:', error);
      }

      alert("Product updated successfully!");
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update product");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete product
  const deleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, category, productId));

      // Update local state
      setProducts((prevProducts) =>
        prevProducts.filter((p) => p.id !== productId)
      );

      // Trigger revalidation
      try {
        await revalidatePages(getRevalidationTags.productChange(category));
      } catch (error) {
        console.error('Revalidation failed:', error);
      }

      alert("Product deleted successfully!");
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product");
    }
  };

  // Add new product
  const addProduct = async () => {
    if (!newProduct.name || !newProduct.file) {
      alert("Please provide both product name and image");
      return;
    }

    setIsAdding(true);
    try {
      const imageRef = ref(
        storage,
        `${category}/${Date.now()}-${newProduct.file.name}`
      );
      const snapshot = await uploadBytes(imageRef, newProduct.file);
      const imageUrl = await getDownloadURL(snapshot.ref);

      // Add to collection
      const docRef = await addDoc(collection(db, category), {
        name: newProduct.name,
        price: newProduct.price,
        productUrl: imageUrl,
      });

      // Update local state
      const newProductData = {
        id: docRef.id,
        name: newProduct.name,
        price: newProduct.price,
        productUrl: imageUrl,
      };

      setProducts((prevProducts) => [...prevProducts, newProductData]);

      // Trigger revalidation
      try {
        await revalidatePages(getRevalidationTags.productChange(category));
      } catch (error) {
        console.error('Revalidation failed:', error);
      }

      // Reset form
      setNewProduct({ name: "", price: "", file: null });
      setShowAddForm(false);

      alert("Product added successfully!");
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Failed to add product");
    } finally {
      setIsAdding(false);
    }
  };

  // Add bulk products
  const addBulkProducts = async () => {
    if (!bulkProductName.trim() || bulkProductFiles.length === 0) {
      alert("Please provide product name and select multiple images");
      return;
    }

    setIsAddingBulkProducts(true);
    try {
      const sanitizedName = String(bulkProductName).trim().replace(/\s+/g, "_");

      // Upload all images and create product documents
      const uploadPromises = bulkProductFiles.map(async (file, index) => {
        const imageRef = ref(
          storage,
          `${category}/${Date.now()}-${index}-${file.name}`
        );
        const snapshot = await uploadBytes(imageRef, file);
        const imageUrl = await getDownloadURL(snapshot.ref);

        // Add to category collection
        const docRef = await addDoc(collection(db, category), {
          name: sanitizedName,
          price: "", // No price for bulk uploads
          productUrl: imageUrl,
        });

        return {
          id: docRef.id,
          name: sanitizedName,
          price: "",
          productUrl: imageUrl,
        };
      });

      const newProducts = await Promise.all(uploadPromises);

      // Update local state
      setProducts((prevProducts) => [...prevProducts, ...newProducts]);

      // Trigger revalidation
      try {
        await revalidatePages(getRevalidationTags.productChange(category));
      } catch (error) {
        console.error('Revalidation failed:', error);
      }

      // Reset form
      setBulkProductName("");
      setBulkProductFiles([]);
      setShowBulkForm(false);

      alert(
        `Bulk products "${bulkProductName}" with ${bulkProductFiles.length} images added successfully!`
      );
    } catch (error) {
      console.error("Error adding bulk products:", error);
      alert("Failed to add bulk products. Please try again.");
    } finally {
      setIsAddingBulkProducts(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading products...</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Sharon Admin - {category?.replace(/_/g, " ")} Products</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="bg-black min-h-screen">
        <Navbar />

        <div className="px-6 py-20 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex md:flex-row flex-col gap-3 justify-between items-center mb-8">
            <div>
              <h1 className="md:text-3xl text-xl font-bold text-white">
                {category?.replace(/_/g, " ").toUpperCase()} Products
              </h1>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                {showAddForm ? "Cancel" : "Add Product"}
              </button>
              <button
                onClick={() => {
                  setShowBulkForm(!showBulkForm);
                  setBulkProductName(category || "");
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                {showBulkForm ? "Cancel" : "Bulk Upload"}
              </button>
              <button
                onClick={() => router.push("/admin")}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Back to Categories
              </button>
            </div>
          </div>

          {/* Add Product Form */}
          {showAddForm && (
            <div className="mb-8 p-6 bg-gray-800 rounded-lg border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4">
                Add New Product
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) =>
                      setNewProduct((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                    placeholder="Enter product name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Price (Optional)
                  </label>
                  <input
                    type="text"
                    value={newProduct.price}
                    onChange={(e) =>
                      setNewProduct((prev) => ({
                        ...prev,
                        price: e.target.value,
                      }))
                    }
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                    placeholder="Enter price"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Product Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setNewProduct((prev) => ({
                        ...prev,
                        file: e.target.files[0],
                      }))
                    }
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-blue-500 focus:border-blue-500 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sharon-or file:text-white hover:file:bg-orange-600"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={addProduct}
                  disabled={isAdding}
                  className={`px-6 py-2 text-white font-medium rounded-lg transition-colors ${
                    isAdding
                      ? "bg-gray-600 opacity-60 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {isAdding ? "Adding..." : "Add Product"}
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewProduct({ name: "", price: "", file: null });
                  }}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Bulk Upload Form */}
          {showBulkForm && (
            <div className="mb-8 p-6 bg-gray-800 rounded-lg border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4">
                Bulk Upload Products
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={bulkProductName}
                    onChange={(e) => setBulkProductName(e.target.value)}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                    placeholder="Enter product name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Multiple Images
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) =>
                      setBulkProductFiles(Array.from(e.target.files))
                    }
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-blue-500 focus:border-blue-500 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Selected {bulkProductFiles.length} files. All will be named
                    as "{bulkProductName}"
                  </p>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={addBulkProducts}
                  disabled={isAddingBulkProducts}
                  className={`px-6 py-2 text-white font-medium rounded-lg transition-colors ${
                    isAddingBulkProducts
                      ? "bg-gray-600 opacity-60 cursor-not-allowed"
                      : "bg-purple-600 hover:bg-purple-700"
                  }`}
                >
                  {isAddingBulkProducts ? "Uploading..." : "Upload All Images"}
                </button>
                <button
                  onClick={() => {
                    setShowBulkForm(false);
                    setBulkProductName("");
                    setBulkProductFiles([]);
                  }}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Products Grid */}
          {products.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              <h3 className="text-xl font-semibold mb-2">No products found</h3>
              <p>Add some products to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="rounded-lg shadow-lg border bg-gray-800 border-gray-700 p-6 space-y-4 hover:shadow-xl transition-shadow"
                >
                  {/* Product Image */}
                  <div className="relative">
                    {product.productUrl ? (
                      <img
                        src={product.productUrl}
                        alt={product.name}
                        className="w-full h-48 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = "/placeholder-image.png";
                        }}
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-700 rounded-lg flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-white truncate">
                      {product.name || "Unnamed Product"}
                    </h3>
                    {product.price && (
                      <p className="text-green-400 font-medium">
                        ₹{product.price}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Edit Modal */}
        {editingProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    Edit Product
                  </h2>
                  <button
                    onClick={() => {
                      setEditingProduct(null);
                      setEditForm({ name: "", price: "", productUrl: "" });
                      setNewImage(null);
                    }}
                    className="text-gray-400 hover:text-white text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Current Image */}
                  {editForm.productUrl && (
                    <div>
                      <label className="block text-white font-medium mb-2">
                        Current Image
                      </label>
                      <div className="aspect-square w-32 mb-4 relative">
                        <img
                          src={editForm.productUrl}
                          alt={editForm.name}
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src = "/placeholder-image.png";
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Product Name */}
                  <div>
                    <label className="block text-white font-medium mb-2">
                      Product Name
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-sharon-or"
                      placeholder="Enter product name"
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-white font-medium mb-2">
                      Price (Optional)
                    </label>
                    <input
                      type="text"
                      value={editForm.price}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          price: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-sharon-or"
                      placeholder="Enter price"
                    />
                  </div>

                  {/* New Image */}
                  <div>
                    <label className="block text-white font-medium mb-2">
                      Replace Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setNewImage(e.target.files[0])}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-sharon-or file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sharon-or file:text-white hover:file:bg-orange-600"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-6">
                    <button
                      onClick={saveProduct}
                      disabled={isSaving}
                      className={`flex-1 px-6 py-3 font-medium rounded-lg transition-colors ${
                        isSaving
                          ? "bg-gray-600 opacity-60 cursor-not-allowed"
                          : "bg-sharon-or hover:bg-orange-600 text-white"
                      }`}
                    >
                      {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      onClick={() => {
                        setEditingProduct(null);
                        setEditForm({ name: "", price: "", productUrl: "" });
                        setNewImage(null);
                      }}
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
  );
};

export default CategoryProducts;
