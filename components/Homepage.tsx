'use client';

import React, { useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import Logo from './logo';
import { Lora, UnifrakturCook } from "next/font/google";
import Image from 'next/image';
import { ChatTeardropDots, GithubLogo, Keyboard } from '@phosphor-icons/react';
import Button from './button';
interface HomepageProps {
  db: any; // Use any type for db
  googleClientId: string;
  googleClientName: string;
}

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const unifraktur = UnifrakturCook({
  subsets: ["latin"],
  weight: ["700"],
});

export function Homepage({ db, googleClientId, googleClientName }: HomepageProps) {
  const [nonce] = useState(() => typeof window !== 'undefined' ? crypto.randomUUID() : '');

  if (!googleClientId || typeof window === 'undefined') {
    return <div>Loading login provider...</div>;
  }

  return (
    <div className='flex flex-col w-full p-2 h-full dark bg-sage-1'>
      <div className="w-full">
            <div className="flex flex-row items-center w-full max-w-7xl mx-auto pt-8 pb-4 justify-between">
              <div className="flex flex-row items-center w-max mx-auto gap-4">
                <Logo color="white"/>
              </div>
            </div>
          </div>
      <div
          className="flex flex-col w-full relative overflow-hidden rounded-lg max-w-6xl mx-auto"
          style={{
            backgroundImage: "url('/f3.png')",
            backgroundSize: "cover",
            backgroundPosition: "top",
          }}
        >
          <div className='absolute top-0 left-0 bg-gradient-to-b from-sage-1 via-sage-1/0 to-sage-1 h-full w-full'></div>
          <div className='absolute top-0 left-0 bg-gradient-to-r from-sage-1 via-sage-1/0 to-sage-1 h-full w-full'></div>

          <div className="flex flex-col items-center justify-center w-full max-w-7xl mx-auto pb-40 lg:pb-80 pt-20 px-4">
            <h1 className={`${lora.className} text-5xl font-medium bg-clip-text text-transparent bg-gradient-to-b pb-2 from-sage-12 to-sage-11 relative z-10 text-center`}>Your Interface to Intelligence</h1>
            <p className={`text-sm text-sage-11 relative z-10`}>Chaterface is an <span className='font-bold text-sage-12'>open source</span> chat interface for large language models.</p>

            <div className='mt-8'>
              <GoogleOAuthProvider clientId={googleClientId}>
                <GoogleLogin
                  theme='filled_black'
                  logo_alignment='center'
                  nonce={nonce}
                  onError={() => {
                    console.error('Google Login Failed');
                    alert('Login failed. Please try again.');
                  }}
                  onSuccess={async ({ credential }) => {
                    if (!credential) {
                      console.error('Google Login Failed: No credential received');
                      alert('Login failed: No credential received.');
                      return;
                    }
                    try {
                      await db.auth.signInWithIdToken({
                        clientName: googleClientName || '',
                        idToken: credential,
                        nonce,
                      });
                      // Login successful, AuthProvider will re-render with the user
                    } catch (err: any) {
                      console.error('InstantDB Sign In Failed:', err);
                      alert('Uh oh: ' + (err.body?.message || err.message || 'An unknown error occurred during sign in.'));
                    }
                  }}
                />
              </GoogleOAuthProvider>
            </div>
          </div>
        </div>

        <div className='flex flex-col max-w-6xl mx-auto'>
          <p className={`font-mono text-xs text-sage-11 uppercase text-center`}>Built With</p>

          <div className='flex flex-wrap items-center gap-8 mt-8'>
          
            <Image src="/logos/vercel.png" alt="InstantDB" width={100} height={100} className='h-5 opacity-50 filter w-auto invert hover:opacity-100 transition-opacity duration-300' />
            <Image src="/logos/nextjs.png" alt="InstantDB" width={100} height={100} className='h-5 opacity-50 filter w-auto invert hover:opacity-100 transition-opacity duration-300' />
            <Image src="/instant.svg" alt="InstantDB" width={100} height={100} className='h-5 opacity-50 filter w-auto invert hover:opacity-100 transition-opacity duration-300' />
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto my-16 w-full'>
          <div className='bg-sage-2 border border-sage-4 rounded-lg p-6 w-full'>
            <ChatTeardropDots size={18} weight="bold" className="text-orange-500"/>
            <h2 className='text-sage-12 text-lg font-medium mt-4'>Unified Interface</h2>
            <p className='text-sage-10 text-xs font-mono'>Access leading models from OpenAI, Anthropic, and Google all in one consistent chat interface.</p>
          </div>

          <div className='bg-sage-2 border border-sage-4 rounded-lg p-6 w-full'>
            <GithubLogo size={18} weight="bold" className="text-blue-500"/>
            <h2 className='text-sage-12 text-lg font-medium mt-4'>Fully Open Source</h2>
            <p className='text-sage-10 text-xs font-mono'>Chaterface is fully open source. You can inspect, modify, and contribute to the codebase.</p>
            <Button size="small" href="https://github.com/hyperaide/chaterface" target="_blank" className="mt-4 bg-sage-4 hover:bg-sage-5 text-sage-12 border border-sage-6" icon={<GithubLogo size={14} weight="bold" />}>View on GitHub</Button>
          </div>

          <div className='bg-sage-2 border border-sage-4 rounded-lg p-6 w-full'>
            <Keyboard size={18} weight="bold" className="text-cyan-500"/>
            <h2 className='text-sage-12 text-lg font-medium mt-4'>Keyboard Shortcuts</h2>
            <p className='text-sage-10 text-xs font-mono'>Chaterface supports keyboard shortcuts for faster navigation.</p>
          </div>
          
        </div>
    </div>
  );
}

export default Homepage;
