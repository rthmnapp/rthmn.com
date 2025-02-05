'use client';
import { FcGoogle } from 'react-icons/fc';
import { Scene } from '@/app/_components/Scene/Scene';
import type { Provider } from '@supabase/supabase-js';
import { getURL } from '@/utils/helpers';
import { createClient } from '@/utils/supabase/client';

function useSignInWithOAuth() {
    const supabase = createClient();

    return async (e: React.FormEvent<HTMLFormElement>, provider: Provider) => {
        e.preventDefault();
        const redirectURL = getURL('/auth/callback');

        if (provider === 'discord') {
            await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: redirectURL,
                    scopes: 'identify',
                },
            });
        } else {
            await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: redirectURL,
                },
            });
        }
    };
}

export default function SignIn() {
    const signInWithOAuth = useSignInWithOAuth();

    const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            await signInWithOAuth(e, 'google');
        } catch (error) {
            console.error('OAuth sign-in error:', error);
        }
    };

    return (
        <div className='flex h-screen'>
            <div className='relative hidden h-full w-1/2 lg:block'>
                <Scene scene='https://prod.spline.design/0PMxshYRA0EskOl3/scene.splinecode' />
            </div>
            <div className='flex w-full flex-col items-center justify-center bg-black lg:w-1/2'>
                <div className='w-96 max-w-xl'>
                    <h1 className={`font-outfit mb-6 text-5xl font-bold text-white`}>Ready to use RTHMN?</h1>
                    <p className={`font-kodemono mb-10 text-xl text-gray-300`}>Sign in with Google to get started</p>
                    <div className='space-y-4'>
                        <form onSubmit={handleSignIn}>
                            <button
                                className='flex w-full items-center justify-center space-x-3 rounded-md bg-linear-to-b from-gray-100 to-gray-300 p-[2px] text-white transition-all duration-200 hover:scale-[1.02] hover:from-gray-200 hover:to-gray-400'
                                type='submit'>
                                <span className='flex w-full items-center justify-center rounded-md bg-linear-to-b from-white to-gray-50 px-6 py-3 text-base font-medium text-gray-700'>
                                    <FcGoogle className='mr-3 h-6 w-6' />
                                </span>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
