import React from 'react'
import Link from 'next/Link'
import { useSelector, useDispatch } from 'react-redux'
import { urlChange } from '../slice/counterSlice'

export const Card_keeper = (props) => {

    const dispatch = useDispatch()

    return (
        <div className="grid lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1 gap-5 justify-end w-full items-center">
            {props.imageUrls.map((imageUrl) => (

                <Link href="/products" onClick={() => dispatch(urlChange(imageUrl.name)) } class="max-w-sm bg-white border border-sharon-or rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-700">
                    
                    <a >
                        <img class="rounded-t-lg scale-100 w-full h-full hover:scale-105 ease-in duration-500" src={imageUrl.productUrl} alt="" />
                    </a>
                    <div class="p-5">
                        <a>
                            <h5 class="mb-3 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{imageUrl.name}</h5>
                        </a>
                        <a class="inline-flex w-max items-center px-3 py-2 text-sm font-medium text-center text-white bg-sharon-or rounded-lg hover:bg-sharon-or focus:ring-4 focus:outline-none">
                            View more
                            <svg aria-hidden="true" class="w-4 h-4 ml-2 -mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                        </a>
                    </div>
                </Link>

            )
            )}
        </div>
    )
}
