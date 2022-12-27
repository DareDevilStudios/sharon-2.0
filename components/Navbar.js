import Image from 'next/image'
import React from 'react'
import Link from 'next/link'

const Navbar = () => {

    return (

        <div class="flex sm:flex-col md:flex-row flex-wrap items-center justify-around fixed z-50 px-2 sm:px-4 py-2.5 rounded bg-black  md:w-full">
            <Link href="/" class="flex items-center justify-center">
                {/* <Image src="/../public/home.png" class="h-6 mr-3 sm:h-9" alt="Flowbite Logo" width="40" height="40" /> */}
                <span class="self-center text-center text-2xl font-semibold whitespace-nowrap text-white">SHARON INDUSTRIES</span>
            </Link>
            {/* <button data-collapse-toggle="navbar-default" type="button" class="inline-flex items-center p-2 ml-3 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="navbar-default" aria-expanded="false">
                <span class="sr-only">Open main menu</span>
                <svg  class="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"></path></svg>
            </button> */}
                <ul class="flex flex-row p-4 rounded-lg md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium bg-black  md:dark:bg-black ">
                    <li>
                        <Link href="/" class="text-lg block py-2 pl-3 pr-4 text-sharon-or  rounded md:bg-transparent md:text-sharon-or md:p-0" aria-current="page">Home</Link>
                    </li>
                    <li>
                        <Link href="#" class="text-lg block py-2 pl-3 pr-4  rounded md:hover:bg-transparent md:border-0 md:hover:text-sharon-or md:p-0 text-gray-400 md:dark:hover:bg-transparent">About</Link>
                    </li>
                    {/* <li>
                        <a href="#" class="text-lg block py-2 pl-3 pr-4 text-gray-700 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-sharon-or md:p-0 dark:text-gray-400 md:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">Services</a>
                    </li>
                    <li>
                        <a href="#" class="text-lg block py-2 pl-3 pr-4 text-gray-700 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-sharon-or md:p-0 dark:text-gray-400 md:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">Pricing</a>
                    </li> */}
                    <li>
                        <Link href="#" class="text-lg block py-2 pl-3 pr-4  rounded md:hover:bg-transparent md:border-0 md:hover:text-sharon-or md:p-0 text-gray-400 md:dark:hover:bg-transparent">Contact</Link>
                    </li>
                </ul>
        </div>

    )
}

export default Navbar
