import { useState, useRef, useEffect } from "react";
import { db } from "../firebase";
import {
    ref,
    uploadBytes,
    getDownloadURL,
} from "firebase/storage";
import {
    collection,
    addDoc,
    getDocs
} from "firebase/firestore";
import { storage } from "../firebase";
import { useConnection } from "./context/ConnectionContext";
import { LoginSharp } from "@mui/icons-material";
import { log2 } from "three/examples/jsm/nodes/Nodes.js";
import { getAllPendingCategories, getCategoriesFromDB, pendingProducts } from "../utils/indexedDb";
export default function ProductUpload() {
    const [Category,setCategory] = useState("");
    const [FilesMulti, setFilesMulti] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadMethod, setUploadMethod] = useState("file"); // "file" or "camera"
    const [showPreview, setShowPreview] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);
    const [stream, setStream] = useState(null);
    const [capturedImages, setCapturedImages] = useState([]);
    const [categorylist, setCategorylist] = useState([])
    const { isOnline } = useConnection()
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const CATEGORYLIST = 'Categories'
    // Start camera preview
    const startCameraPreview = async () => {
        try {
            console.log("Starting camera preview...");

            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'environment' // Use back camera on mobile
                }
            });

            setStream(mediaStream);
            setShowPreview(true);

            // Set video source after state update
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
            }, 100);

        } catch (error) {
            console.error("Camera error:", error);

            let message = "Camera access failed: ";
            if (error.name === "NotAllowedError") {
                message += "Permission denied. Please allow camera access.";
            } else if (error.name === "NotFoundError") {
                message += "No camera found.";
            } else if (error.name === "NotReadableError") {
                message += "Camera is busy. Close other camera apps.";
            } else {
                message += error.message;
            }

            alert(message);
        }
    };

    // Stop camera preview
    const stopCameraPreview = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setShowPreview(false);
    };

    // Capture photo from preview
    const capturePhoto = async () => {
        if (!videoRef.current || !canvasRef.current) {
            alert("Camera not ready");
            return;
        }

        setIsCapturing(true);

        try {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext("2d");

            // Set canvas dimensions to match video
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            // Draw the current video frame to canvas
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Check if canvas has content (not just black)
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            let hasContent = false;

            for (let i = 0; i < data.length; i += 4) {
                if (data[i] > 10 || data[i + 1] > 10 || data[i + 2] > 10) {
                    hasContent = true;
                    break;
                }
            }

            if (!hasContent) {
                throw new Error("Camera appears to be blocked or not working");
            }

            // Convert canvas to blob and create file
            canvas.toBlob((blob) => {
                if (blob && blob.size > 0) {
                    const capturedFile = new File([blob], `captured-${Date.now()}.jpg`, {
                        type: "image/jpeg"
                    });

                    const imageUrl = canvas.toDataURL("image/jpeg");

                    // Add to captured images array
                    const newCapturedImage = {
                        file: capturedFile,
                        url: imageUrl,
                        id: Date.now()
                    };

                    setCapturedImages(prev => [...prev, newCapturedImage]);

                    // Add to files array
                    setFilesMulti(prev => [...prev, { file: capturedFile, name: '', price: '' }]);

                    setIsCapturing(false);
                    console.log("Photo captured successfully, size:", blob.size);
                } else {
                    throw new Error("Failed to create image file");
                }
            }, "image/jpeg", 0.8);

        } catch (error) {
            console.error("Capture error:", error);
            setIsCapturing(false);
            alert("Photo capture failed: " + error.message);
        }
    };

    // Remove a captured image
    const removeCapturedImage = (imageId) => {
        setCapturedImages(prev => prev.filter(img => img.id !== imageId));

        // Also remove from files array
        const imageIndex = capturedImages.findIndex(img => img.id === imageId);
        if (imageIndex !== -1) {
            setFilesMulti(prev => prev.filter((_, index) => {
                // Find the corresponding file index in the files array
                const capturedFileIndex = capturedImages.slice(0, imageIndex).length;
                return index !== capturedFileIndex;
            }));
        }
    };

    // Clear all captured images
    const clearAllCapturedImages = () => {
        setCapturedImages([]);
        if (uploadMethod === "camera") {
            setFilesMulti([]);
        }
    };

    // Cleanup camera when component unmounts or upload method changes
    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    // Handle file input change
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setFilesMulti(prev => [
            ...prev,
            ...files.map(file => ({ file, name: '', price: '' }))
        ]);
    };

    // Handle name/price change for each file
    const handleFileMetaChange = (index, field, value) => {
        setFilesMulti(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
    };

    const MultipleProducts = async (e) => {
        e.preventDefault();
        if (FilesMulti.length === 0 || Category == null || Category.trim() === "") {
            alert("Please provide both categoryName name and files");
            return;
        }
        // Check all files have name and price
        if(isOnline){ 
            for (let i = 0; i < FilesMulti.length; i++) {
            if (!FilesMulti[i].name || !FilesMulti[i].price) {
                alert(`Please provide name and price for image ${i + 1}`);
                return;
            }
        }
        setIsUploading(true);
        try {
            const categoryName =Category;
            // if (!isOnline) {
            //     alert(`products for ${categoryName} added in queue after internet comes it will added to Database`)
            //     setIsUploading(false)
            // }
            // Use as entered
            for (let i = 0; i < FilesMulti.length; i++) {
                const { file, name, price } = FilesMulti[i];
                const imageRef2 = ref(storage, `${categoryName}/${name || (categoryName + '-' + (i + 1))}`);
                const eachProducts = collection(db, categoryName);
                // Upload file
                const snapshot = await uploadBytes(imageRef2, file);
                // Get download URL
                const url = await getDownloadURL(snapshot.ref);
                // Add to Firestore
                await addDoc(eachProducts, { name:categoryName,productName: name, price, productUrl: url });
                console.log(`file ${i + 1} uploaded: ${url}`);
            }
            alert(`${FilesMulti.length} products added to Category: ${Category}`);
            // Reset form
            setCategory("");
            setFilesMulti([]);
            setCapturedImages([]);
            setUploadMethod("file");
            stopCameraPreview();
            document.getElementById("multiple-upload-form").reset();
        } catch (error) {
            console.error("Upload error:", error);
            alert("Upload failed. Please try again.");
        } finally {
            setIsUploading(false);
        }}
        else{
            const categoryName =Category;
            const products=[]
            for(let i=0;i<FilesMulti.length;i++){
               const product={
                name:FilesMulti[i].name,
                price:FilesMulti[i].price,
                productUrl:FilesMulti[i].file
               }

               products.push(product)
                
            }
            await pendingProducts(products,categoryName)
        }
       
    };

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

    const fetchProductsAndSubimages = async () => {

        if (isOnline) {
            try {
                const productsRef = collection(db, "products");
                const querySnapshot = await getDocs(productsRef);
                const categoryData = [];
                querySnapshot.forEach((doc) => {
                    categoryData.push({
                        name: doc.data().name
                    });
                });

                const pendCate=await getAllPendingCategories()
                 const pendCategorylist=[]
                 pendCate.forEach((doc)=>{
                    pendCategorylist.push({
                        name:doc.name
                    })
                 })
                 const mergedCategories=[...categoryData,...pendCategorylist]
                setCategorylist(mergedCategories);
              



                if (categoryData.length > 0) {
                    saveToLocalStorage(CATEGORYLIST, categorylist);
                }



            } catch (error) {
                // If fetch fails, fallback to localStorage
                setCategorylist(loadFromLocalStorage(CATEGORYLIST, []));

            }
        } else {
            const cate=await getCategoriesFromDB()
            const categoryNames=[]
            cate.forEach((cat)=>{
                categoryNames.push({
                    name:cat.name
                })
            })
            
            const pendCate=await getAllPendingCategories()
            const pendCategorylist=[]
            pendCate.forEach((doc)=>{
               pendCategorylist.push({
                   name:doc.name
               })
            })
            const mergedCategories=[...categoryNames,...pendCategorylist]
           setCategorylist(mergedCategories);
         

        }
    };

    useEffect(() => {

        fetchProductsAndSubimages()
        console.log("useEffect");

    }, [])

    const removeFile = (index) => {
        setFilesMulti(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="w-full max-w-md">
            <div className="w-full rounded-lg shadow border bg-gray-800 border-gray-700 max-h-[85vh] flex flex-col">
                <div className="p-6 flex-shrink-0">
                    <h1 className="text-xl font-bold leading-tight tracking-tight md:text-2xl text-white">
                        Upload Multiple Products
                    </h1>
                </div>
    
                <div className="flex-1 overflow-y-auto px-6 pb-6">
                    <form id="multiple-upload-form" className="space-y-4 md:space-y-6" onSubmit={MultipleProducts}>
                        <div>
                            <label htmlFor="multiple-product" className="block mb-2 text-sm font-medium text-white">
                                Category Name
                            </label>
                            <select
                                value={Category}
                                onChange={e => setCategory(e.target.value)}
                                className="border sm:text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
                                required
                            >
                                <option value="">Select a Category</option>
                                {categorylist.map((cat, idx) => (
                                    <option key={idx} value={cat.name} >{cat.name}</option>
                                ))}
                            </select>
                        </div>
    
                        {/* Upload Method Selection */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-white">
                                Upload Method
                            </label>
                            <div className="flex gap-4 mb-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setUploadMethod("file");
                                        stopCameraPreview();
                                    }}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${uploadMethod === "file"
                                        ? "bg-sharon-or text-white"
                                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                        }`}
                                >
                                    📁 File Upload
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setUploadMethod("camera");
                                        stopCameraPreview();
                                    }}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${uploadMethod === "camera"
                                        ? "bg-sharon-or text-white"
                                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                        }`}
                                >
                                    📷 Camera
                                </button>
                            </div>
                        </div>
    
                        {/* File Upload */}
                        {uploadMethod === "file" && (
                            <div>
                                <label htmlFor="multiple-files" className="block mb-2 text-sm font-medium text-white">
                                    Select Files
                                </label>
                                <input
                                    type="file"
                                    name="images"
                                    id="multiple-files"
                                    multiple
                                    onChange={handleFileChange}
                                    className="border sm:text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
                                    required
                                    accept="image/*"
                                />
                                {FilesMulti.length > 0 && (
                                    <div className="mt-4 space-y-4 max-h-60 overflow-y-auto">
                                        {FilesMulti.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-4 bg-gray-700 p-2 rounded-lg relative">
                                                <img src={URL.createObjectURL(item.file)} alt={`preview-${idx}`} className="w-16 h-16 object-cover rounded" />
                                                <div className="flex-1 grid grid-cols-2 gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Name"
                                                        value={item.name}
                                                        onChange={e => handleFileMetaChange(idx, 'name', e.target.value)}
                                                        className="px-2 py-1 rounded bg-gray-800 text-white border border-gray-600"
                                                        required
                                                    />
                                                    <input
                                                        type="number"
                                                        placeholder="Price"
                                                        value={item.price}
                                                        onChange={e => handleFileMetaChange(idx, 'price', e.target.value)}
                                                        className="px-2 py-1 rounded bg-gray-800 text-white border border-gray-600"
                                                        required
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeFile(idx)}
                                                    className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                                                    title="Remove"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
    
                        {/* Camera Section */}
                        {uploadMethod === "camera" && (
                            <div>
                                <label className="block mb-2 text-sm font-medium text-white">
                                    Camera Capture
                                </label>
    
                                {!showPreview && (
                                    <button
                                        type="button"
                                        onClick={startCameraPreview}
                                        className="w-full py-8 border-2 border-dashed border-gray-600 rounded-lg hover:border-gray-500 transition-colors flex flex-col items-center justify-center text-gray-400 hover:text-gray-300"
                                    >
                                        <span className="text-4xl mb-2">📷</span>
                                        <span>Click to open camera</span>
                                    </button>
                                )}
    
                                {/* Camera Preview */}
                                {showPreview && (
                                    <div className="space-y-4">
                                        <div className="relative bg-black rounded-lg overflow-hidden">
                                            <video
                                                ref={videoRef}
                                                autoPlay
                                                playsInline
                                                muted
                                                className="w-full h-64 object-cover"
                                                style={{ transform: 'scaleX(-1)' }} // Mirror effect
                                            />
    
                                            {/* Camera overlay/frame */}
                                            <div className="absolute inset-0 border-2 border-white/20 rounded-lg pointer-events-none">
                                                <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-white/50"></div>
                                                <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-white/50"></div>
                                                <div className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-white/50"></div>
                                                <div className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-white/50"></div>
                                            </div>
                                        </div>
    
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={stopCameraPreview}
                                                className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                                            >
                                                ✅ Done
                                            </button>
                                            <button
                                                type="button"
                                                onClick={capturePhoto}
                                                disabled={isCapturing}
                                                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                                            >
                                                {isCapturing ? "📸 Capturing..." : "📸 Take Photo"}
                                            </button>
                                        </div>
                                    </div>
                                )}
    
                                {FilesMulti.length > 0 && (
                                    <div className="mt-4 space-y-4 max-h-60 overflow-y-auto">
                                        {FilesMulti.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-4 bg-gray-700 p-2 rounded-lg relative">
                                                <img src={URL.createObjectURL(item.file)} alt={`preview-${idx}`} className="w-16 h-16 object-cover rounded" />
                                                <div className="flex-1 grid grid-cols-2 gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Name"
                                                        value={item.name}
                                                        onChange={e => handleFileMetaChange(idx, 'name', e.target.value)}
                                                        className="px-2 py-1 rounded bg-gray-800 text-white border border-gray-600"
                                                        required
                                                    />
                                                    <input
                                                        type="number"
                                                        placeholder="Price"
                                                        value={item.price}
                                                        onChange={e => handleFileMetaChange(idx, 'price', e.target.value)}
                                                        className="px-2 py-1 rounded bg-gray-800 text-white border border-gray-600"
                                                        required
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeFile(idx)}
                                                    className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                                                    title="Remove"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
    
                                {/* Hidden canvas for photo capture */}
                                <canvas ref={canvasRef} style={{ display: "none" }} />
                            </div>
                        )}
    
                        {/* File count display */}
                        {FilesMulti.length > 0 && (
                            <div className="bg-gray-700 rounded-lg p-3">
                                <p className="text-white text-sm">
                                    <strong>{FilesMulti.length}</strong> file(s) ready for upload
                                </p>
                            </div>
                        )}
                    </form>
                </div>
    
                {/* Fixed submit button at bottom */}
                <div className="p-6 pt-0 flex-shrink-0 border-t border-gray-700">
                    <button
                        type="submit"
                        form="multiple-upload-form"
                        disabled={isUploading || FilesMulti.length === 0}
                        className="w-full text-white bg-sharon-or hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors"
                    >
                        {isUploading ? 'Uploading...' : `Upload ${FilesMulti.length} Products`}
                    </button>
                </div>
            </div>
        </div>
    );
}