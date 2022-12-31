import Image from 'next/image'
import React from 'react'


function DisplayCards(props) {
    return (


        <div className="bg-black grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-6 w-full">
            {props.imageUrls.map((imageUrl) => (
                <div class="border relative border-black mx-auto rounded-lg shadow-md bg-black h-60 w-72 md:h-64 md:w-80">
                    <Image class="rounded-t-lg h-full md:max-h-60 scale-100 hover:scale-105 ease-in duration-500" src={imageUrl.productUrl} objectFit="fit" layout="fill" alt="" />
                    {/* <Image class="rounded-t-lg h-full md:max-h-60 scale-100 hover:scale-105 ease-in duration-500" src={imageUrl.productUrl} width={300} height={300} alt="" /> */}
                </div>
            )
            )}
        </div>
                
    )
}

export default DisplayCards
