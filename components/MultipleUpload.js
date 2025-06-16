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
} from "firebase/firestore";
import { storage } from "../firebase";

export default function MultipleUpload() {
    const [Category, setCategory] = useState("");
    const [FilesMulti, setFilesMulti] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadMethod, setUploadMethod] = useState("file"); // "file" or "camera"
    const [showPreview, setShowPreview] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);
    const [stream, setStream] = useState(null);
    const [capturedImages, setCapturedImages] = useState([]);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);

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
                    setFilesMulti(prev => [...prev, capturedFile]);
                    
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
        setFilesMulti(files);
    };

    const MultipleProducts = async (e) => {
        e.preventDefault();
        
        if (FilesMulti.length === 0 || Category == null || Category.trim() === "") {
            alert("Please provide both category name and files");
            return;
        }

        setIsUploading(true);
        
        try {
            const categoryLower = Category.toLowerCase();
            
            for (let i = 0; i < FilesMulti.length; i++) {
                const imageRef2 = ref(storage, `${categoryLower}/${categoryLower}-${i+1}`);
                const eachProducts = collection(db, categoryLower);
                
                await uploadBytes(imageRef2, FilesMulti[i]).then((snapshot) => {
                    getDownloadURL(snapshot.ref)
                        .then(async (url) => {
                            await addDoc(eachProducts, { name: categoryLower, productUrl: url }).then(() => console.log(url));
                        })
                });
                console.log(`file ${i + 1} uploaded`);
            }
            
            alert(`${FilesMulti.length} products added to category: ${Category}`);
            
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
        }
    };

    return (
        <div className="w-full max-w-md">
            <div className="w-full rounded-lg shadow border bg-gray-800 border-gray-700">
                <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                    <h1 className="text-xl font-bold leading-tight tracking-tight md:text-2xl text-white">
                        Upload Multiple Files
                    </h1>
                    
                    <form id="multiple-upload-form" className="space-y-4 md:space-y-6" onSubmit={MultipleProducts}>
                        <div>
                            <label htmlFor="multiple-category" className="block mb-2 text-sm font-medium text-white">
                                Category Name
                            </label>
                            <input 
                                type="text" 
                                name="category" 
                                id="multiple-category" 
                                value={Category} 
                                onChange={(e) => setCategory(e.target.value)}
                                className="border sm:text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" 
                                placeholder="Enter category name" 
                                required 
                            />
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
                                        clearAllCapturedImages();
                                        stopCameraPreview();
                                    }}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                        uploadMethod === "file"
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
                                        setFilesMulti([]);
                                        stopCameraPreview();
                                    }}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                        uploadMethod === "camera"
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
                                    <p className="mt-2 text-sm text-gray-400">
                                        {FilesMulti.length} file(s) selected
                                    </p>
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
                                        {capturedImages.length > 0 && (
                                            <span className="text-sm mt-1">
                                                {capturedImages.length} photo(s) captured
                                            </span>
                                        )}
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

                                            {/* Photo counter */}
                                            {capturedImages.length > 0 && (
                                                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                                                    {capturedImages.length} captured
                                                </div>
                                            )}
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

                                {/* Captured Images Grid */}
                                {capturedImages.length > 0 && !showPreview && (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-white font-medium">
                                                Captured Photos ({capturedImages.length})
                                            </h3>
                                            <button
                                                type="button"
                                                onClick={clearAllCapturedImages}
                                                className="text-red-400 hover:text-red-300 text-sm"
                                            >
                                                Clear All
                                            </button>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-2">
                                            {capturedImages.map((image) => (
                                                <div key={image.id} className="relative group">
                                                    <img
                                                        src={image.url}
                                                        alt="Captured"
                                                        className="w-full h-24 object-cover rounded-lg"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeCapturedImage(image.id)}
                                                        className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-80 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
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

                        <button 
                            type="submit" 
                            disabled={isUploading || FilesMulti.length === 0}
                            className="w-full text-white bg-sharon-or hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors"
                        >
                            {isUploading ? 'Uploading...' : `Upload ${FilesMulti.length} Products`}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}