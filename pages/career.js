import Head from 'next/head'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import CareerSection from '../components/CareerSection'

const Career = () => {
  return (
    <>
      <Head>
        <title>Sharon - Career</title>
        <meta name="description" content="Join Sharon Industries. Explore career opportunities in manufacturing, operations, and more." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="bg-black min-h-screen">
        <Navbar />
        <CareerSection />
        <Footer />
      </main>
    </>
  )
}

export default Career
