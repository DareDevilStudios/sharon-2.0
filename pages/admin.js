import Head from 'next/head'
import Navbar from '../components/Navbar'
import { useState, useEffect } from "react";
import { db } from "../firebase";
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
} from "firebase/firestore";
import { storage } from "../firebase";

export default function Home() {

    const productsRef = collection(db, "products");

    const [Name, setName] = useState("");
    const [file, setFile] = useState(null);
    // file upload new technique

    const createProduct = async (e) => {
        if (file == null || Name == null) {
            alert("No file selected")
            return;
        }
        const imageRef = ref(storage, `products/${Name}`);
        await uploadBytes(imageRef, file).then((snapshot) => {
            getDownloadURL(snapshot.ref)
                .then(async (url) => {
                    await addDoc(productsRef, { name: Name, productUrl: url }).then(() => console.log(url));
                })
        });
        alert(`Product named ${Name} has been uploaded successfully`)
    };

    const [Category, setCategory] = useState("");
    const [FilesMulti, setFilesMulti] = useState(null);

    const MultipleProducts = async () => {
        if (FilesMulti == null || Category == null) {
            alert("No file selected")
            return;
        }
        setCategory(Category.toLowerCase())
        for (let i = 0; i < FilesMulti.length; i++) {
            const imageRef2 = ref(storage, `${Category}/${Category}-${i+1}`);
            const eachProducts = collection(db, `${Category}`);
            await uploadBytes(imageRef2, FilesMulti[i]).then((snapshot) => {
                getDownloadURL(snapshot.ref)
                    .then(async (url) => {
                        await addDoc(eachProducts, { name: Category, productUrl: url }).then(() => console.log(url));
                    })
            });
            console.log(`file ${i} uploaded`);
        };
        alert(`Product added into category : ${Category}`)
    };

    return (
        <>
            <Head>
                <title>Sharon</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className="bg-black">
                <Navbar />
                <div className="bg-black h-screen flex flex-col md:flex-row">

                    {/* left side */}
                    <section class="bg-black w-full md:w-1/2">
                        <div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">

                            <div class="w-full rounded-lg shadow border md:mt-0 sm:max-w-md xl:p-0 bg-gray-800 border-gray-700">
                                <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
                                    <h1 class="text-xl font-bold leading-tight tracking-tight md:text-2xl text-white">
                                        Upload SINGLE file
                                    </h1>
                                    <form class="space-y-4 md:space-y-6" action="#">
                                        <div>
                                            <label for="email" class="block mb-2 text-sm font-medium text-white">Name</label>
                                            <input type="text" name="name" id="name" value={Name} onChange={(e) => {
                                                setName(e.target.value);
                                            }} class=" border  sm:text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" placeholder="type product name" required="" />
                                        </div>
                                        <div>
                                            <label for="password" class="block mb-2 text-sm font-medium text-white">File</label>
                                            <input type="file" name="image" id="image" value={null} onChange={(e) => setFile(e.target.files[0])} class="border  sm:text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" required="" />
                                        </div>

                                        <button type="button" onClick={createProduct} class="w-full text-white bg-sharon-or font-medium rounded-lg text-sm px-5 py-2.5 text-center ">Upload</button>

                                    </form>
                                </div>
                            </div>
                        </div>
                    </section>


                    {/* right side */}
                    <section class="bg-black w-full md:w-1/2">
                        <div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">

                            <div class="w-full rounded-lg shadow border md:mt-0 sm:max-w-md xl:p-0 bg-gray-800 border-gray-700">
                                <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
                                    <h1 class="text-xl font-bold leading-tight tracking-tight md:text-2xl text-white">
                                        Upload MULTIPLE files
                                    </h1>
                                    <form class="space-y-4 md:space-y-6" action="#">
                                        <div>
                                            <label for="email" class="block mb-2 text-sm font-medium text-white">Category</label>
                                            <input type="text" name="name" id="name" value={Category} onChange={(e) => {
                                                setCategory(e.target.value);
                                            }} class="border  sm:text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" placeholder="type product name" required="" />
                                        </div>
                                        <div>
                                            <label for="password" class="block mb-2 text-sm font-medium text-white">File</label>
                                            <input type="file" name="image" id="image" multiple onChange={(e) => setFilesMulti(e.target.files)} class="border  sm:text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500" required="" />
                                        </div>

                                        <button type="button" onClick={MultipleProducts} class="w-full text-white bg-sharon-or font-medium rounded-lg text-sm px-5 py-2.5 text-center ">Upload</button>

                                    </form>
                                </div>
                            </div>
                        </div>
                    </section>

                </div>

            </main>
        </>
    )
}
