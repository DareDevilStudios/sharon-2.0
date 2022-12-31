import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { Inter } from '@next/font/google'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Homeimg from '../components/Homeimg'
import Aboutus from '../components/Aboutus'
import { Card_keeper } from '../components/Card_keeper'
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
import { v4 } from "uuid";
import { useSelector, useDispatch } from 'react-redux'
import { addUrl, increment } from '../slice/counterSlice'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {

  const dispatch = useDispatch()
  const imageUrls = useSelector((state) => state.home.home_url)
  const url = useSelector((state) => state.home.url)
  const shouldlog = useRef(true);
  const productsRef = collection(db, "products");

  useEffect(() => {
    if (shouldlog.current) {
      shouldlog.current = false;
      console.log(url);
      if ( imageUrls.length === 0 ) {
        const getUsers = async () => {
          const urls = await getDocs(productsRef);
          urls.forEach((doc) => {
            dispatch(addUrl(doc.data()))
          })
        }
        getUsers();
      }


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

        {/* HERO SECTION */}

        <div className="flex flex-col md:flex-row pb-9 w-screen">

          {/* left */}

          <div className="flex flex-col w-100 md:w-1/2 justify-center items-center mt-20">
            <h1 className=" mt-14 md:mt-0  md:text-8xl text-6xl leading-tight text-sharon-or font-black text-center">DESIGN <br />
              YOUR <br /> DREAM <br />
              HOME
            </h1>
            <span className='text-sharon-greyy mt-4 text-center w-3/4 text-base md:text-lg'>
              Strong foundations, solid designs: <br />
              Trust us to bring your concrete visions to life.
            </span>
            <Link href="#about" class=" hover:bg-black  mt-6 px-8 py-2 border-2 text-white font-bold bg-sharon-or border-sharon-or w-max rounded-lg flex">
              <svg class="mr-3 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
              Know More
            </Link>
          </div>

          {/* Right */}

          <Homeimg />
        </div>

        {/* ABOUT SECTION */}

        <div className="flex flex-col md:flex-row p-8 w-screen bg-sharon-grey">

          {/* left */}
          <Aboutus />

          {/* Right */}
          <div className="flex flex-col w-100 h-100 md:w-1/2 justify-center items-center">
            <h1 className="text-3xl leading-tight text-white font-semibold mt-3 underline">ABOUT US</h1>
            <span className='text-sharon-greyy text-justify mt-4 flex flex-wrap w-4/5 text-lg md:text-xl'>
              Welcome to our Sharon Industries! We are a team of professionals dedicated to providing top-quality products for the construction industry. Our product line includes a wide range of designs, including pillars, water cuttings, wall designs, ventilations, parapet designs, and fencing.
            </span>
            <span className='text-sharon-greyy text-justify mt-4 flex flex-wrap w-4/5 text-lg md:text-xl'>
              Our products are made with the highest quality materials and techniques, ensuring that they are both beautiful and functional. We are committed to delivering exceptional customer service and stand behind our products with a satisfaction guarantee.            </span>
            <span className='text-sharon-greyy text-justify mt-4 flex flex-wrap w-4/5 text-lg md:text-xl'>
              Whether you're a contractor looking to add value to your projects or a homeowner looking to make a statement with your property, we have the products and expertise to help you achieve your goals. Thank you for considering our company for your concrete design needs. We look forward to working with you and helping bring your vision to life.
            </span>
          </div>

        </div>

        {/* PRODUCTS SECTION */}

        <div className="w-screen bg-black p-8 ">

          <h1 className="text-4xl font-bold my-8 text-center">
            Our Products
          </h1>

          <Card_keeper imageUrls={imageUrls} />

        </div>

        {/* Footer */}

        <div className="">
          <Footer />
        </div>

      </main>
    </>
  )
}
