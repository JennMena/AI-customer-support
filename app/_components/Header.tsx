"use client";
import { useUser } from "@clerk/nextjs";
import Image from 'next/image'
import React from 'react'
import { SignedOut, SignedIn, SignInButton, UserButton } from '@clerk/nextjs'

export default function Header() {
    const { isSignedIn } = useUser();
    return (
        <div>
            <header>
                <div className="mx-auto flex h-16 max-w-screen-xl items-center gap-8 px-4 sm:px-6 lg:px-8 border-b">

                    <div className="flex items-center gap-3">
                        <Image src='/logo.svg' alt="Logo" width={40} height={40} />
                        <span className="text-xl font-bold text-dark_green">WanderTalk</span>
                    </div>

                    <div className="flex flex-1 items-center justify-end md:justify-between">
                        <nav aria-label="Global" className="hidden md:block">
                            <ul className="flex items-center gap-6 text-sm">
                                <li>
                                    <a className="text-gray-500 transition hover:text-gray-500/75" href="/"> Home </a>
                                </li>

                                <li>
                                    <a className="text-gray-500 transition hover:text-gray-500/75" href="#"> About WanderTalk! </a>
                                </li>
                            </ul>
                        </nav>

                        <div className="flex items-center gap-4">
                            <div className="sm:flex sm:gap-4">
                                {isSignedIn && (
                                    <a
                                        className="hidden rounded-md border-2 border-dark_green bg-gray-100 px-5 py-2.5 text-sm font-medium text-dark_green transition hover:bg-dark_green hover:text-white sm:block mr-4 cursor-pointer"
                                        href='/chat'
                                    >
                                      <span className="pointer-events-none">New Chat</span>
                                    </a>
                                )}

                                {isSignedIn && (
                                  <div className="flex items-center">
                                    <UserButton />
                                  </div>
                                )}
                                {!isSignedIn && (
                                    <a
                                        className="block rounded-md bg-light_green px-5 py-2.5 text-sm font-medium text-white transition hover:bg-dark_green "
                                        href='sign-in'
                                    >
                                        Get Started
                                    </a>
                                )}
                                {!isSignedIn && (
                                    <a
                                        className="hidden rounded-md bg-gray-100 px-5 py-2.5 text-sm font-medium text-dark_green transition hover:text-dark_green/75 sm:block"
                                        href={isSignedIn ? 'chat' : 'sign-up'}
                                    >
                                        Register
                                    </a>
                                )}

                            </div>

                            <button
                                className="block rounded bg-gray-100 p-2.5 text-gray-600 transition hover:text-gray-600/75 md:hidden"
                            >
                                <span className="sr-only">Toggle menu</span>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </header>
        </div>
    )
}
