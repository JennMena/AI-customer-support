import React from 'react'
import Image from 'next/image'
import Header from './Header'
import { DESC_HERO } from '@/lib/constants'

function LandingPage() {
    return (
        <div className="h-screen overflow-hidden relative">

            <video autoPlay loop muted className="absolute inset-0 object-cover w-full h-full">
                <source src="/assets/bg.mp4" type="video/mp4" />
            </video>
            <div className="bg-white backdrop-blur-lg opacity-90">
                <Header />
                </div>
            <section className="h-full flex items-center relative z-10">
                <div className="mx-auto max-w-screen-xl px-4 py-16 lg:py-24 lg:flex h-full">
                    <div className="mx-auto max-w-xl text-center">
                        <h1 className="text-3xl font-extrabold sm:text-6xl text-white rounded-lg p-4 transform transition-transform duration-300" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)' }}>
                            Discover, explore, and plan your perfect trip with WanderTalk!
                        </h1>
                        <p className="mt-4 sm:text-xl/relaxed text-gray-300 bg-white bg-opacity-30 backdrop-blur-lg p-4 rounded-lg shadow-lg">
                            {DESC_HERO}
                        </p>

                        <div className="mt-8 flex flex-wrap justify-center gap-4">
                            <a
                                className="block w-full rounded bg-light_green px-12 py-3 text-sm font-medium text-white shadow hover:bg-dark_green focus:outline-none focus:ring active:bg-dark_green500 sm:w-auto opacity-90"
                                href="sign-in"
                            >
                                Start Discovering
                            </a>

                            <a
                              className="block w-full rounded bg-light_green px-12 py-3 text-sm font-medium text-white shadow hover:bg-dark_green focus:outline-none focus:ring active:bg-dark_green 500 sm:w-auto opacity-90"
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
