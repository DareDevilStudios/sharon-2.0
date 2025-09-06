import Head from 'next/head';
import Navbar from '../components/Navbar';
import { db } from "../firebase";
import {
  collection,
  getDocs,
} from "firebase/firestore";
import DisplayCards from '../components/DisplayCards';
import dynamic from "next/dynamic";

const Products = ({ imageUrls, urlMove }) => {

  return (
    <>
      <Head>
        <title>Sharon - {urlMove}</title>
        <meta name="description" content="Sharon Industries is a leading provider of high-quality precasted concrete products. We specialize in a wide range of designs including fencing, mokappu, beam support, pillars, show pillars, well designs, water cutting, parapets, ventilation, and garden designs. Browse our collection for innovative and durable concrete solutions for your construction projects. Contact us today to discuss your design requirements." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content={urlMove}/>
        <meta property="og:description" content={urlMove}/>
        <meta property="og:image" content={imageUrls[0]?.productUrl || '/home.png'}/>
        <meta name="twitter:image" content={imageUrls[0]?.productUrl || '/home.png'}/>
        <meta name='image' content={imageUrls[0]?.productUrl || '/home.png'} />
        <meta name="twitter:title" content={urlMove}/>
        <meta name="twitter:description" content={urlMove}/>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="bg-black">
        <Navbar />

        {/* PRODUCTS SECTION */}
        <div className="w-screen bg-black p-2 md:p-8">
          <h1 className="text-4xl font-bold text-center my-10 text-white">
            {urlMove.toUpperCase()}
          </h1>
          <DisplayCards imageUrls={imageUrls} />
        </div>
      </main>
    </>
  );
}

export async function getServerSideProps({ params, res }) {
  try {
    const urlMove = params.products;
    
    // Convert URL-friendly name back to original format for Firebase query
    // Replace hyphens with spaces to match the original product name
    const originalProductName = urlMove.replace(/-/g, " ");
    
    const productsRef = collection(db, originalProductName);

    const imageUrls = [];
    const querySnapshot = await getDocs(productsRef);
    querySnapshot.forEach((doc) => {
      imageUrls.push(doc.data());
    });

    // Set cache tags for revalidation - use category name as tag
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    res.setHeader('Cache-Tags', originalProductName);

    return {
      props: {
        imageUrls,
        urlMove: originalProductName, // Use original name for display
      },
    };
  } catch (error) {
    console.error('Error fetching product data:', error);
    return {
      props: {
        imageUrls: [],
        urlMove: params.products,
      },
    };
  }
}

export default dynamic(() => Promise.resolve(Products), { ssr: false })
