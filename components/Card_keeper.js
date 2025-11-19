import React from 'react'
import Link from 'next/link'
import { useSelector, useDispatch } from 'react-redux'
import { urlChange } from '../slice/counterSlice'
import Image from 'next/image'

export const Card_keeper = (props) => {

    const dispatch = useDispatch()

    return (
        <div className="grid lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1 gap-5 justify-center w-full items-center">
            {props.imageUrls.map((imageUrl, index) => (

                <Link 
                    key={imageUrl.id || index} 
                    href={"/" + imageUrl.name} 
                    onClick={() => dispatch(urlChange(imageUrl.name))} 
                    className="max-w-sm border rounded-lg shadow-md bg-gray-800 border-gray-700 flex flex-col items-center cursor-pointer hover:bg-gray-700 transition-colors"
                >
                    {/* Note: In Next.js 13+, you don't need the <a> tag inside Link. 
                        If you are on Next.js 12 or older, keep the <a> tag. 
                        I have kept the div structure for compatibility. */}
                    
                    <div className="h-60 w-64 md:w-full relative">
                        <Image 
                            title={imageUrl.name} 
                            className="rounded-t-lg hover:scale-105 ease-in duration-500" 
                            src={imageUrl.productUrl} 
                            fill 
                            style={{objectFit:"contain"}}
                            alt={imageUrl.name} 
                        />
                    </div>
                    <div className="px-5 py-3 w-full flex flex-col items-center">
                        <div>
                            <h5 className="mb-3 text-2xl font-bold text-center tracking-tight text-white">
                                {imageUrl.name.replace(/-/g, ' ').replace(/_/g, ' ')}
                            </h5>
                        </div>
                        <div className="inline-flex w-max items-center px-3 py-2 text-sm font-medium text-center text-white bg-sharon-or rounded-lg hover:bg-orange-600 focus:ring-4 focus:outline-none">
                            View more
                        </div>
                    </div>
                </Link>

            ))}
        </div>
    )
}