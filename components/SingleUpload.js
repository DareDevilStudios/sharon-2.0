import { useState, useRef, useEffect } from "react";
import { db } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";
import { storage } from "../firebase";
import { useConnection } from "./context/ConnectionContext";
export default function SingleUpload() {
  const productsRef = collection(db, "products");
  const [Name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [uploadMethod, setUploadMethod] = useState("file"); // "file" or "camera"
  const [capturedImage, setCapturedImage] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [stream, setStream] = useState(null);
  
  const {isOnline}=useConnection()
  
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
          
          setFile(capturedFile);
          setCapturedImage(canvas.toDataURL("image/jpeg"));
          setIsCapturing(false);
          
          // Stop the camera after capturing
          stopCameraPreview();
          
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

  // Retake photo
  const retakePhoto = () => {
    setCapturedImage(null);
    setFile(null);
  };

  // Cleanup camera when component unmounts or upload method changes
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const createProduct = async (e) => {
    
    e.preventDefault();

    if (file == null || Name == null || Name.trim() === "") {
      alert("Please provide both name and file");
      return;
    }

    try {
      if(!isOnline){
        alert(`Product "${Name}" has been queued and will be added to database after internet comes back`);
      }

      const imageRef = ref(storage, `products/${Name}`);
      await uploadBytes(imageRef, file).then((snapshot) => {
        getDownloadURL(snapshot.ref).then(async (url) => {
          await addDoc(productsRef, {
            name: Name,
            productUrl: url,
          }).then(() => console.log(url));
        });
      });
      alert(`Product named ${Name} has been uploaded successfully`);

      // Reset form
      setName("");
      setFile(null);
      setCapturedImage(null);
      setUploadMethod("file");
      stopCameraPreview();
      document.getElementById("single-upload-form").reset();
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed. Please try again.");
    }
  };



  // const createProduct = async (e) => {
  //   e.preventDefault();
  
  //   if (file == null || Name == null || Name.trim() === "") {
  //     alert("Please provide both name and file");
  //     return;
  //   }
  
  //   // Check if offline and show immediate feedback
  //   if (!isOnline) {
  //     alert(`Product "${Name}" has been queued and will be added to database after internet comes back`);
      
  //     // Reset form immediately for better UX
  //     setName("");
  //     setFile(null);
  //     setCapturedImage(null);
  //     setUploadMethod("file");
  //     stopCameraPreview();
  //     document.getElementById("single-upload-form").reset();
  //   }
  
  //   try {
  //     const imageRef = ref(storage, `products/${Name}`);
  //     await uploadBytes(imageRef, file).then((snapshot) => {
  //       getDownloadURL(snapshot.ref).then(async (url) => {
  //         await addDoc(productsRef, {
  //           name: Name,
  //           productUrl: url,
  //         }).then(() => console.log(url));
  //       });
  //     });
  
  //     // Only show this alert if we're online (avoid double alerts)
  //     if (is) {
  //       alert(`Product named ${Name} has been uploaded successfully`);
        
  //       // Reset form only if online (already reset above for offline)
  //       setName("");
  //       setFile(null);
  //       setCapturedImage(null);
  //       setUploadMethod("file");
  //       stopCameraPreview();
  //       document.getElementById("single-upload-form").reset();
  //     }
      
  //   } catch (error) {
  //     console.error("Upload error:", error);
      
  //     // Only show error alert if we're online
  //     if (navigator.onLine) {
  //       alert("Upload failed. Please try again.");
  //     }
  //     // If offline, the queued message was already shown above
  //   }
  // };

  return (
    <div className="w-full max-w-md">
      <div className="w-full rounded-lg shadow border bg-gray-800 border-gray-700">
        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
          <h1 className="text-xl font-bold leading-tight tracking-tight md:text-2xl text-white">
            Upload Single File
          </h1>
          
          <form
            id="single-upload-form"
            className="space-y-4 md:space-y-6"
            onSubmit={createProduct}
          >
            <div>
              <label
                htmlFor="single-name"
                className="block mb-2 text-sm font-medium text-white"
              >
                Product Name
              </label>
              <input
                type="text"
                name="name"
                id="single-name"
                value={Name}
                onChange={(e) => setName(e.target.value)}
                className="border sm:text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter product name"
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
                    setCapturedImage(null);
                    setFile(null);
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
                    setFile(null);
                    setCapturedImage(null);
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
                <label
                  htmlFor="single-file"
                  className="block mb-2 text-sm font-medium text-white"
                >
                  Select File
                </label>
                <input
                  type="file"
                  name="image"
                  id="single-file"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="border sm:text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
                  required
                  accept="image/*"
                />
              </div>
            )}

            {/* Camera Section with Preview */}
            {uploadMethod === "camera" && (
              <div>
                <label className="block mb-2 text-sm font-medium text-white">
                  Camera Capture
                </label>
                
                {!showPreview && !capturedImage && (
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
                {showPreview && !capturedImage && (
                  <div className="space-y-4">
                    <div className="relative bg-black rounded-lg overflow-hidden">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-64 object-cover"
                        style={{ transform: 'scaleX(-1)' }} // Mirror effect for front camera
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
                        ❌ Cancel
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

                {/* Captured Image Preview */}
                {capturedImage && (
                  <div className="space-y-4">
                    <div className="relative">
                      <img
                        src={capturedImage}
                        alt="Captured"
                        className="w-full rounded-lg"
                        style={{ maxHeight: "300px", objectFit: "cover" }}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={retakePhoto}
                        className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                      >
                        🔄 Retake
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          alert("Photo ready for upload!");
                        }}
                        className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                      >
                        ✅ Use Photo
                      </button>
                    </div>
                  </div>
                )}

                {/* Hidden canvas for photo capture */}
                <canvas ref={canvasRef} style={{ display: "none" }} />
              </div>
            )}

            <button
              type="submit"
              className="w-full text-white bg-sharon-or hover:bg-orange-600 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors"
              disabled={!file}
            >
              Upload Product
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}