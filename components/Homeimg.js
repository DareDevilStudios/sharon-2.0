import React from 'react'
import Image from 'next/image'
import HomeImg from '../public/home.png'

function Homeimg() {
    return (
        <div className="hidden w-100 md:w-1/2 m-auto justify-center items-center md:block ">
            <Image src={HomeImg} priority alt="Picture of the author" width={500} height={500} />
        </div>
    )
}

export default Homeimg
