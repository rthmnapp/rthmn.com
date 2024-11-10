'use client';

import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { redirectToPath } from './server';
import { getURL } from '@/utils/helpers';
import type { Provider } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';

export async function handleRequest(
  e: React.FormEvent<HTMLFormElement>,
  requestFunc: (formData: FormData) => Promise<string>,
  router: AppRouterInstance | null = null
): Promise<boolean | void> {
  // Prevent default form submission refresh
  e.preventDefault();

  const formData = new FormData(e.currentTarget);
  const redirectUrl: string = await requestFunc(formData);

  if (router) {
    // If client-side router is provided, use it to redirect
    return router.push(redirectUrl);
  } else {
    // Otherwise, redirect server-side
    return await redirectToPath(redirectUrl);
  }
}

export function useSignInWithOAuth() {
  const supabase = createClient();

  return async (e: React.FormEvent<HTMLFormElement>, provider: Provider) => {
    e.preventDefault();
    const redirectURL =
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:3000'
        : 'https://www.rthmn.com';

    if (provider === 'discord') {
      // Add both auth and connection scopes for Discord
      await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectURL,
          scopes: 'identify guilds.join', // Added guilds.join for server management
          queryParams: {
            // Add a flag to identify this as a sign-in flow
            'discord-sign-in': 'true'
          }
        }
      });
    } else {
      await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectURL
        }
      });
    }
  };
}
