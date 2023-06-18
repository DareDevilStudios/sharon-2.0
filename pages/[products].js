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
        <meta property="og:image" content={imageUrls[0].productUrl}/>
        <meta name="twitter:image" content={imageUrls[0].productUrl}/>
        <meta name='image' content={imageUrls[0].productUrl} />
        <meta name="twitter:title" content={urlMove}/>
        <meta name="twitter:description" content={urlMove}/>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="bg-black">
        <Navbar />

        {/* PRODUCTS SECTION */}
        <div className="w-screen bg-black p-2 md:p-8">
          <h1 className="text-4xl font-bold text-center mt-28 md:mt-20 mb-10 text-white">
            {urlMove.toUpperCase()}
          </h1>
          <DisplayCards imageUrls={imageUrls} />
        </div>
      </main>
    </>
  );
}

export async function getStaticPaths() {
  const products = [
    "arch",
    "ball-pillar",
    "beam-support",
    "beeding",
    "charu-support",
    "charupadi",
    "concerete-pots",
    "cornis",
    "fencing",
    "fish-pond",
    "flowers",
    "furnace",
    "gatetop",
    "mokappu",
    "parapet-hole",
    "parapet",
    "parkbench",
    "pillar-top",
    "pillar",
    "products",
    "shade-support",
    "showpillar",
    "sopanam",
    "washing-table",
    "waste-management",
    "water-cutting",
    "well-cover-and-support"
  ];

  const paths = products.map((product) => ({
    params: { products: product },
  }));

  return {
    paths,
    fallback: false, // or 'blocking' if needed
  };
}

export async function getStaticProps({ params }) {
  const urlMove = params.products;
  const productsRef = collection(db, urlMove);

  const imageUrls = [];
  const querySnapshot = await getDocs(productsRef);
  querySnapshot.forEach((doc) => {
    imageUrls.push(doc.data());
  });

  return {
    props: {
      imageUrls,
      urlMove,
    },
  };
}

export default dynamic(() => Promise.resolve(Products), { ssr: false })
