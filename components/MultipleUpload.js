import { useState } from "react";
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
    const [FilesMulti, setFilesMulti] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const MultipleProducts = async (e) => {
        e.preventDefault();
        
        if (FilesMulti == null || Category == null || Category.trim() === "") {
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
            setFilesMulti(null);
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
                        <div>
                            <label htmlFor="multiple-files" className="block mb-2 text-sm font-medium text-white">
                                Select Files
                            </label>
                            <input 
                                type="file" 
                                name="images" 
                                id="multiple-files" 
                                multiple 
                                onChange={(e) => setFilesMulti(e.target.files)} 
                                className="border sm:text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" 
                                required 
                                accept="image/*"
                            />
                            {FilesMulti && (
                                <p className="mt-2 text-sm text-gray-400">
                                    {FilesMulti.length} file(s) selected
                                </p>
                            )}
                        </div>

                        <button 
                            type="submit" 
                            disabled={isUploading}
                            className="w-full text-white bg-sharon-or hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors"
                        >
                            {isUploading ? 'Uploading...' : 'Upload Products'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}