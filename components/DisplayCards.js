import Image from 'next/image'
import Link from 'next/link'
import React from 'react'


function DisplayCards(props) {

    console.log(props.imageUrls)

    return (

        <div className="grid lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1 gap-5 justify-center w-full items-center">
            {props.imageUrls.map((imageUrl,index) => (
                
                <Link href={"#"+ index} class="max-w-sm border rounded-lg shadow-md bg-black border-sharon-grey flex flex-col items-center">

                    <Link href={"#"+ index} className="h-60 w-64 md:w-full relative" >
                        <Image title={imageUrl.name} id={index} class="rounded-t-lg  hover:scale-105 ease-in duration-500 " src={imageUrl.productUrl} fill objectFit="contain" valt={imageUrl.name} />
                    </Link>
                </Link>

            )
            )}
        </div>
                
    )
}

export default DisplayCards
