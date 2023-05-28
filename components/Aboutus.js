import Image from 'next/image'
import React from 'react'
import AboutImg from '../public/about_us_image.jpg'

function Homeimg() {
    return (
        <div id="about" className="flex w-100 md:w-1/2 m-auto justify-center items-center ">
            <Image className='rounded-lg' src={AboutImg} priority alt="Picture of the author" width={500} height={500} />
        </div>
    )
}

export default Homeimg
