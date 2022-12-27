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
import { storage } from "../firebase";
import { useRouter } from 'next/router';
import { getCookie } from 'next-cookies';

export default function products({ number }) {

    const dispatch = useDispatch()
    const urlMove = useSelector((state) => state.home.url)

    var imageUrls = useSelector((state) => state.home.image_url)


    const shouldlog = useRef(true);
    const productsRef = collection(db, urlMove);


    useEffect(() => {
        if (shouldlog.current) {
            shouldlog.current = false;
            console.log(urlMove);
            dispatch(initialSet())
            const getUsers = async () => {
                const urls = await getDocs(productsRef);
                urls.forEach((doc) => {
                    console.log(doc.data());
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
            <main className="bg-black h-screen">
                <Navbar />

                {/* PRODUCTS SECTION */}

                <div className="h-full w-screen bg-black p-8 ">

                    <h1 className="text-4xl font-bold m-12 text-center">
                        Our Products
                    </h1>

                    <DisplayCards imageUrls={imageUrls} />

                </div>
            </main>
        </>
    )
}