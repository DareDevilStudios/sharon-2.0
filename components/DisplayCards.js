import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'

function DisplayCards(props) {
    const [isModalOpen, setisModalOpen] = useState(false)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    console.log(props.imageUrls)

    const handleImageClick = (imageIndex) => {
        setCurrentImageIndex(imageIndex)
        setisModalOpen(true)
    }

    const closeModal = () => {
        setisModalOpen(false)
    }

    const goToPrevious = () => {
        setCurrentImageIndex((prevIndex) => 
            prevIndex === 0 ? props.imageUrls.length - 1 : prevIndex - 1
        )
    }

    const goToNext = () => {
        setCurrentImageIndex((prevIndex) => 
            prevIndex === props.imageUrls.length - 1 ? 0 : prevIndex + 1
        )
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            closeModal()
        } else if (e.key === 'ArrowLeft') {
            goToPrevious()
        } else if (e.key === 'ArrowRight') {
            goToNext()
        }
    }

    return (
        <>
            <div className="grid lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1 gap-5 justify-center w-full items-center">
                {props.imageUrls.map((imageUrl, index) => (
                    <Link href={"#" + index} key={index} className="max-w-sm border rounded-lg shadow-md bg-black border-sharon-grey flex flex-col items-center">
                        <Link href={"#" + index} className="h-60 w-64 md:w-full relative">
                            <Image 
                                title={imageUrl.name} 
                                id={index} 
                                onClick={() => handleImageClick(index)} 
                                className="rounded-t-lg hover:scale-105 ease-in duration-500 cursor-pointer" 
                                src={imageUrl.productUrl} 
                                fill 
                                objectFit="contain" 
                                alt={imageUrl.name} 
                            />
                          
                        </Link>
                        <p>{imageUrl.name}</p>
                    </Link>
                ))}
            </div>

            {/* Image Slider Modal */}
            {isModalOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
                    onKeyDown={handleKeyDown}
                    tabIndex={0}
                >
                    <div className="relative w-full h-full flex items-center justify-center">
                        {/* Close Button */}
                        <button
                            onClick={closeModal}
                            className="absolute top-4 right-4 text-white text-2xl font-bold hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center"
                        >
                            ×
                        </button>

                        {/* Previous Button */}
                        <button
                            onClick={goToPrevious}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-2xl font-bold hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center"
                        >
                            ‹
                        </button>

                        {/* Next Button */}
                        <button
                            onClick={goToNext}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-2xl font-bold hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center"
                        >
                            ›
                        </button>

                        {/* Image Container */}
                        <div className="relative w-full h-full flex items-center justify-center">
                            <Image
                                src={props.imageUrls[currentImageIndex].productUrl}
                                alt={props.imageUrls[currentImageIndex].name}
                                fill
                                objectFit="contain"
                                className="max-w-full max-h-full"
                            />
                        </div>

                        {/* Image Info */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-center bg-black bg-opacity-50 px-4 py-2 rounded-lg">
                            <p className="font-semibold">{props.imageUrls[currentImageIndex].name}</p>
                            <p className="text-sm text-gray-300">
                                {currentImageIndex + 1} of {props.imageUrls.length}
                            </p>
                        </div>

                        {/* Image Counter Dots */}
                        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex space-x-2">
                            {props.imageUrls.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentImageIndex(index)}
                                    className={`w-3 h-3 rounded-full transition-colors ${
                                        index === currentImageIndex 
                                            ? 'bg-white' 
                                            : 'bg-gray-500 hover:bg-gray-400'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default DisplayCards
