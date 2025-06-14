import { useState } from "react";
import { db } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";
import { storage } from "../firebase";

export default function SingleUpload() {
  const productsRef = collection(db, "products");
  const [Name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [file, setFile] = useState(null);

  const createProduct = async (e) => {
    e.preventDefault();

    if (file == null || Name == null || price == null || Name.trim() === "") {
      alert("Please provide both name, price and file");
      return;
    }

    try {
      const imageRef = ref(storage, `products/${Name}`);
      await uploadBytes(imageRef, file).then((snapshot) => {
        getDownloadURL(snapshot.ref).then(async (url) => {
          await addDoc(productsRef, {
            name: Name,
            price: price,
            productUrl: url,
          }).then(() => console.log(url));
        });
      });
      alert(`Product named ${Name} has been uploaded successfully`);

      // Reset form
      setName("");
      setPrice("");
      setFile(null);
      document.getElementById("single-upload-form").reset();
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed. Please try again.");
    }
  };

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

            <div>
              <label
                htmlFor="single-name"
                className="block mb-2 text-sm font-medium text-white"
              >
                Product price
              </label>
              <input
                type="text"
                name="name"
                id="single-name"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="border sm:text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter product price"
                required
              />
            </div>

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

            <button
              type="submit"
              className="w-full text-white bg-sharon-or hover:bg-orange-600 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors"
            >
              Upload Product
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
