'use client';

import { getURL } from '@/utils/helpers';
import { createClient } from '@/utils/supabase/client';
import type { Provider } from '@supabase/supabase-js';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { redirectToPath } from './server';

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

export async function signInWithOAuth(
  e: React.FormEvent<HTMLFormElement>,
  provider: Provider
) {
  e.preventDefault();
  const supabase = createClient();
  const redirectURL =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000'
      : 'https://www.rthmn.com';

  console.log('Redirect URL:', redirectURL);

  await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: redirectURL
    }
  });
}
