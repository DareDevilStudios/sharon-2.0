import React from 'react'


function DisplayCards(props) {
    return (
        <div className="grid lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1 gap-5 justify-end w-full items-center">
            {props.imageUrls.map((imageUrl) => (

                <div class="max-w-sm bg-white border border-sharon-or rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-700">
                    <div>
                        <img class="rounded-t-lg scale-100 hover:scale-105 ease-in duration-500" src={imageUrl.productUrl} alt="" />
                    </div>
                </div>
            )
            )}
        </div>
    )
}

export default DisplayCards
