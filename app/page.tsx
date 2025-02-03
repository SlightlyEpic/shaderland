'use client';

import { Logo3D } from '@/components/my/3d-logo';
import LogoutButton from '@/components/my/logout-button';
import ProfileCsr from '@/components/my/profile-csr';
import { Button } from '@/components/ui/button';
import { useUser } from '@auth0/nextjs-auth0/client';
import { SparklesIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
    const { user, isLoading, error} = useUser();

    return (
        <div className='relative w-full h-full flex flex-col'>
            <img src='/waves/white-blue-transparent.svg' alt='' className='object-cover absolute -z-10 w-full h-full' />
            <div className='w-full h-full flex justify-center items-center'>

                <div className='w-full flex items-center justify-evenly flex-col lg:flex-row p-8 gap-8 h-full'>
                    <div className='flex flex-col w-1/3 gap-8'>
                        <div className='w-max flex items-center justify-center flex-col md:flex-row gap-4 text-center md:text-left'>
                            <div className='relative w-[100px] h-[100px]'>
                                <Logo3D className='absolute z-10' />
                                <div className='absolute w-[100px] h-[100px] rounded-full bg-white' />
                                <div className='absolute w-[90px] h-[90px] top-[5px] left-[5px] rounded-full bg-primary' />
                            </div>
                            <div className='flex flex-col gap-2'>
                                <h1 className='text-4xl md:text-6xl font-extrabold'>Shaderland</h1>
                                <h2 className='flex items-center gap-2 text-xl md:text-sm text-center font-mono font-bold'>
                                    <SparklesIcon size={20} /> AI enhanced IDE for writing graphics shaders
                                </h2>
                            </div>
                        </div>
                        <div className='font-mono ml-[116px]'>
                            <div>Features:</div>
                            <div>• Explain code using AI</div>
                            <div>• Code with ease using AI autocomplete</div>
                            <div>• Integrated WebGL output preview</div>
                            <div>• Organize your shaders into multiple workspaces</div>
                        </div>
                    </div>

                    <div className='flex flex-col gap-2 scale-[2]'>
                        {user 
                            ? <Link href='/app'>
                                <button className='flex w-32 h-8 text-primary-foreground text-sm border border-primary-foreground backdrop-blur-md 
                                transition-colors duration-200 items-center justify-center bg-bgdark bg-opacity-20 rounded-md
                                hover:bg-white hover:text-primary font-bold hover:border-slate-300'>
                                    Go to app
                                </button>
                            </Link>
                            : <a href='/api/auth/login'>
                                <button className='flex w-32 h-8 text-primary-foreground text-sm border border-primary-foreground backdrop-blur-md 
                                transition-colors duration-200 items-center justify-center bg-bgdark bg-opacity-20 rounded-md
                                hover:bg-white hover:text-primary font-bold hover:border-slate-300'>
                                    Login
                                </button>
                            </a>
                        }
                    </div>
                </div>

            </div>
            <div className='self-center text-muted-foreground font-mono'>
                Built by ZTAK Squad
            </div>
        </div>
    );
}
