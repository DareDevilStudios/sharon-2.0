import Link from 'next/link'
import React from 'react'

function Footer() {
    return (
        <footer class="p-4 bg-sharon-grey sm:p-6 ">
            <div class="mx-auto max-w-screen-xl">
                <div class="mb-6 md:mb-4">
                    <Link href="/" class="flex items-center">
                        <span class="self-center text-2xl font-semibold whitespace-nowrap text-white">Contact Us</span>
                    </Link>
                </div>
                <div class="flex flex-col md:justify-between">

                    <div class="grid grid-cols-2 gap-8 sm:gap-6 sm:grid-cols-3">
                        <div>
                            <h2 class="mb-6 text-sm font-semibold  uppercase text-white">Address</h2>
                            <ul class=" text-gray-400">
                                <li class="mb-4">
                                    <Link href="https://www.google.com/maps/place/SHARON+INDUSTRIES/@9.847249,76.4086673,17z/data=!3m1!4b1!4m5!3m4!1s0x3b0876f6aaaaaaab:0x24dcba3e08ddf0bd!8m2!3d9.847249!4d76.410856" class="hover:underline">Sharon Industries, kanjiramattom(po) Ernakulam pin: 682315</Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h2 class="mb-6 text-sm font-semibold  uppercase text-white">Call Us</h2>
                            <ul class=" text-gray-400">
                                <li class="mb-4">
                                    <Link href="tel:+919447797308" class="hover:underline ">+91 9447797308</Link>
                                </li>
                                <li>
                                    <Link href="tel:+919495997308" class="hover:underline">+91 9495997308</Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h2 class="mb-2 text-sm font-semibold uppercase text-white">Email Us</h2>
                            <ul class=" text-gray-400">
                                <li class="mb-4">
                                    <Link href="mailto:sharonindustries@gmail.com" class="hover:underline">sharonindustries@gmail.com</Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                    
                    {/* Location Section with Google Maps */}
                    <div class="mt-8 md:mt-0">
                        <h2 class="mb-6 text-sm font-semibold uppercase text-white">Location</h2>
                        <div class="w-full">
                            <iframe 
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3931.0371252646764!2d76.410856!3d9.847248999999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b0876f6aaaaaaab%3A0x24dcba3e08ddf0bd!2sSHARON%20INDUSTRIES!5e0!3m2!1sen!2sin!4v1757148000671!5m2!1sen!2sin" 
                                width="100%" 
                                height="300" 
                                style={{border: 0}} 
                                allowFullScreen="" 
                                loading="lazy" 
                                referrerPolicy="no-referrer-when-downgrade"
                                className="rounded-lg"
                            ></iframe>
                        </div>
                    </div>
                </div>
                <hr class="my-6 sm:mx-auto border-gray-700 lg:my-8" />
                <div class="flex justify-center">
                    <span class="text-sm text-center text-gray-400">© 2023 <Link href="/" class="hover:underline">SHARON</Link>. All Rights Reserved.
                    </span>
                </div>
                <div class="flex items-center justify-center md:justify-end">
                    <Link href="/login" class="mt-6 px-8 py-2 border-2 text-white font-bold bg-black border-sharon-or w-max rounded-lg flex">
                        {/* <svg class="mr-3 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg> */}
                        Are u an Admin ?
                    </Link>
                </div>
            </div>
        </footer>
    )
}

export default Footer
