import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'

function DisplayCards(props) {
    const [selectedImageIndex, setSelectedImageIndex] = useState(null);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);

    console.log(props.imageUrls)

    // WhatsApp message function
    const sendWhatsAppMessage = (product) => {
        const message = `Hi! I'm interested in this product: ${product.name || 'Product'}\n\nImage: ${product.productUrl}\n\nCould you please provide more details and pricing?`;
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/919447797308?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
    };

    // Gallery navigation functions
    const openGallery = (index) => {
        setSelectedImageIndex(index);
        setIsGalleryOpen(true);
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    };

    const closeGallery = () => {
        setIsGalleryOpen(false);
        setSelectedImageIndex(null);
        document.body.style.overflow = 'unset'; // Restore scrolling
    };

    const goToPrevious = () => {
        setSelectedImageIndex(prev => 
            prev === 0 ? props.imageUrls.length - 1 : prev - 1
        );
    };

    const goToNext = () => {
        setSelectedImageIndex(prev => 
            prev === props.imageUrls.length - 1 ? 0 : prev + 1
        );
    };

    // Handle keyboard navigation
    const handleKeyDown = (e) => {
        if (e.key === 'Escape') closeGallery();
        if (e.key === 'ArrowLeft') goToPrevious();
        if (e.key === 'ArrowRight') goToNext();
    };

    return (
        <>
            <div className="grid lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1 gap-5 justify-center w-full items-center">
                {props.imageUrls.map((imageUrl, index) => (
                    <div key={index} className="max-w-sm border rounded-lg shadow-md bg-black border-sharon-grey flex flex-col items-center group">
                        {/* Image Container */}
                        <div 
                            className="h-60 w-64 md:w-full relative cursor-pointer"
                            onClick={() => openGallery(index)}
                        >
                            <Image 
                                title={imageUrl.name} 
                                className="rounded-t-lg hover:scale-105 ease-in duration-500" 
                                src={imageUrl.productUrl} 
                                fill 
                                style={{ objectFit: "contain" }} 
                                alt={imageUrl.name}
                            />
                            {/* Overlay on hover */}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 rounded-t-lg flex items-center justify-center">
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Product Info and WhatsApp Button */}
                        <div className="p-4 w-full">
                            <h3 className="text-white text-lg font-semibold mb-3 text-center">
                                {imageUrl.name || 'Product'}
                            </h3>
                            <button
                                onClick={() => sendWhatsAppMessage(imageUrl)}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                                </svg>
                                Ask Price
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Fullscreen Gallery Modal */}
            {isGalleryOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center"
                    onKeyDown={handleKeyDown}
                    tabIndex={0}
                >
                    {/* Close Button */}
                    <button
                        onClick={closeGallery}
                        className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
                    >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Previous Button */}
                    <button
                        onClick={goToPrevious}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
                    >
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    {/* Next Button */}
                    <button
                        onClick={goToNext}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
                    >
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    {/* Main Image */}
                    <div className="relative max-w-4xl max-h-full mx-16">
                        <Image
                            src={props.imageUrls[selectedImageIndex]?.productUrl}
                            alt={props.imageUrls[selectedImageIndex]?.name || 'Product'}
                            width={800}
                            height={600}
                            style={{ objectFit: "contain" }}
                            className="max-w-full max-h-full"
                        />
                        
                        {/* Image Counter */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg">
                            {selectedImageIndex + 1} / {props.imageUrls.length}
                        </div>

                        {/* Product Name */}
                        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg">
                            {props.imageUrls[selectedImageIndex]?.name || 'Product'}
                        </div>
                    </div>

                    {/* Thumbnail Strip */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 max-w-4xl overflow-x-auto">
                        {props.imageUrls.map((imageUrl, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedImageIndex(index)}
                                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                                    index === selectedImageIndex ? 'border-white' : 'border-gray-600'
                                }`}
                            >
                                <Image
                                    src={imageUrl.productUrl}
                                    alt={imageUrl.name}
                                    width={64}
                                    height={64}
                                    style={{ objectFit: "cover" }}
                                />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </>
    )
}

export default DisplayCards
