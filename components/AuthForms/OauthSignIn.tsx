'use client';

import { useSignInWithOAuth } from '@/utils/auth-helpers/client';
import { FcGoogle } from 'react-icons/fc';
import { useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

export default function OAuthSignIn() {
  const supabase = useSupabaseClient();
  const signInWithOAuth = useSignInWithOAuth();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session);
        localStorage.setItem(
          'lastAuthEvent',
          JSON.stringify({
            event,
            session: session ? 'Session exists' : 'No session'
          })
        );
      }
    );

    // Log any existing auth info from previous attempts
    const lastAuthEvent = localStorage.getItem('lastAuthEvent');
    if (lastAuthEvent) {
      console.log('Previous auth event:', JSON.parse(lastAuthEvent));
    }

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Initiating OAuth sign-in');
    localStorage.setItem('signInAttempt', new Date().toISOString());
    try {
      await signInWithOAuth(e);
    } catch (error) {
      console.error('OAuth sign-in error:', error);
      localStorage.setItem('signInError', JSON.stringify(error));
    }
  };

  return (
    <form onSubmit={handleSignIn}>
      <button
        className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-200 "
        type="submit"
        name="provider"
        value="google"
      >
        <FcGoogle className="mr-2 h-5 w-5" />
        Sign in with Google
      </button>
    </form>
  );
}
