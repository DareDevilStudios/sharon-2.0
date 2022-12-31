import React from 'react'
import Image from 'next/image'

function Homeimg() {
    return (
        <div className="hidden w-100 md:w-1/2 m-auto justify-center items-center md:block ">
            <Image src="https://github.com/DareDevilStudios/sharon-2.0/blob/e727d4abd443e161625f4cea8c7c54bff62c1fbf/public/home.png?raw=true" priority alt="Picture of the author" width={500} height={500} />
        </div>
    )
}

export default Homeimg
