import React from 'react'

const About = () => {
  return (
    <div className="flex h-full w-screen">

          {/* left */}

          <div className="flex flex-col w-1/2 justify-center items-center ">
            <h1 className="text-8xl leading-tight text-sharon-or font-black text-center">DESIGN <br />
              YOUR <br /> DREAM <br />
              HOME
            </h1>
            <span className='text-sharon-greyy mt-4 text-center'>
              Strong foundations, solid designs: <br />
              Trust us to bring your concrete visions to life.
            </span>
            <button class="mt-6 px-8 py-2 border-2 border-sharon-or w-max hover:bg-sharon-or rounded-lg flex">
            <svg class="mr-3 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
              Know More
            </button>
          </div>

          {/* Right */}

          <div className="flex w-1/2 m-auto justify-center items-center ">
            <Image src="/../public/home.png" alt="Picture of the author" width={500} height={500} />
          </div>
    </div>
  )
}

export default About
