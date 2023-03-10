import Head from 'next/head'
import { Inter } from '@next/font/google'
import Navbar from '../components/Navbar'
import { useState, useEffect, useRef } from "react";
import { db } from "../firebase";
import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
} from "firebase/firestore";
import { useSelector, useDispatch } from 'react-redux'
import { addUrl, all_images, initialSet } from '../slice/counterSlice'
import DisplayCards from '../components/DisplayCards'

export default function products({ number }) {

    const dispatch = useDispatch()

    const urlMove = useSelector((state) => state.home.url)
    const productsRef = collection(db, urlMove);

    var imageUrls = useSelector((state) => state.home.image_url)

    const shouldlog = useRef(true);


    useEffect(() => {
        if (shouldlog.current) {
            shouldlog.current = false;
            dispatch(initialSet())
            const getUsers = async () => {
                const urls = await getDocs(productsRef);
                urls.forEach((doc) => {
                    // console.log(doc.data());
                    dispatch(all_images(doc.data()))
                })
            };
            getUsers();

        }
    }, []);


    return (
        <>
            <Head>
                <title>Create Next App</title>
                <meta name="description" content="Generated by create next app" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className="bg-black">
                <Navbar />

                {/* PRODUCTS SECTION */}

                <div className="w-screen bg-black p-2 md:p-8 ">

                    <h1 className="text-4xl font-bold text-center mt-28 md:mt-20 mb-10 text-white">
                        {urlMove.toUpperCase()}
                    </h1>

                    <DisplayCards imageUrls={imageUrls} />

                </div>
            </main>
        </>
    )
}