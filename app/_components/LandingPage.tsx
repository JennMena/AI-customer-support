import React from 'react'
import Constants from '../_utils/Constants'
import Image from 'next/image'

function LandingPage() {
    return (
        <div className="h-screen overflow-hidden">
            <section className="bg-[#FAFAFA] dark:bg-slate-800 h-full flex items-center">
                <div className="mx-auto max-w-screen-xl px-4 py-16 lg:py-24 lg:flex h-full">
                    <div className="mx-auto max-w-xl text-center">
                        <h1 className="text-3xl font-extrabold sm:text-5xl text-black dark:text-white">
                            Discover, explore, and plan your perfect trip with WanderTalk!
                        </h1>
                        <div className="flex justify-center">
                            <Image src="/images/option1.jpg" width={400} height={400} alt='Hero section image' />
                        </div>

                        <p className="mt-4 sm:text-xl/relaxed text-gray-500 dark:text-gray-300">
                            {Constants.descHero ? Constants.descHero : 'Your ultimate travel companion, providing personalized recommendations for travel locations, dining, events, and photo spots based on your interests.'}
                        </p>

                        <div className="mt-8 flex flex-wrap justify-center gap-4">
                            <a
                                className="block w-full rounded bg-primary px-12 py-3 text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none focus:ring active:bg-blue-500 sm:w-auto"
                                href="#"
                            >
                                Start Discovering
                            </a>

                            <a
                                className="dark:bg-gray-100 block w-full rounded px-12 py-3 text-sm font-medium text-primary shadow hover:text-blue-700 focus:outline-none focus:ring active:text-blue-500 sm:w-auto"
                                href="#"
                            >
                                Learn More
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default LandingPage
