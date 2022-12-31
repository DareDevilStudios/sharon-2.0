import React from 'react'
import Link from 'next/link'
import { useSelector, useDispatch } from 'react-redux'
import { urlChange } from '../slice/counterSlice'
import Image from 'next/image'

export const Card_keeper = (props) => {

    const dispatch = useDispatch()

    return (
        <div className="grid lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1 gap-5 justify-end w-full items-center">
            {props.imageUrls.map((imageUrl) => (

                <Link href={"/" + imageUrl.name} onClick={() => dispatch(urlChange(imageUrl.name)) } class="max-w-sm border rounded-lg shadow-md bg-gray-800 border-gray-700 flex flex-col items-center">
                    
                    <a >
                        <img class="rounded-t-lg scale-100 h-full md:max-h-60 hover:scale-105 ease-in duration-500" src={imageUrl.productUrl}  valt="" />
                    </a>
                    <div class="p-5 w-full flex flex-col items-center">
                        <a>
                            <h5 class="mb-3 text-2xl font-bold text-center tracking-tight text-white">{imageUrl.name}</h5>
                        </a>
                        <a class="inline-flex w-max items-center px-3 py-2 text-sm font-medium text-center text-white bg-sharon-or rounded-lg hover:bg-sharon-or focus:ring-4 focus:outline-none">
                            View more
                            {/* <svg aria-hidden="true" class="w-4 h-4 ml-2 -mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg> */}
                        </a>
                    </div>
                </Link>

            )
            )}
        </div>
    )
}
