import Image from 'next/image'
import React from 'react'

function Homeimg() {
    return (
        <div id="about" className="flex w-100 md:w-1/2 m-auto justify-center items-center ">
            <Image className='rounded-lg' src="https://github.com/DareDevilStudios/sharon-2.0/blob/e727d4abd443e161625f4cea8c7c54bff62c1fbf/public/about_us_image.jpg?raw=true" priority alt="Picture of the author" width={500} height={500} />
        </div>
    )
}

export default Homeimg
