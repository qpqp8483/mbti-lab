import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  console.log('[OAuth Callback] Received code:', code ? 'YES' : 'NO');

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            console.log('[OAuth Callback] Setting cookie:', name);
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            console.log('[OAuth Callback] Removing cookie:', name);
            cookieStore.set({ name, value: '', ...options });
          },
        },
      },
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('[OAuth Callback] Error:', error);
      return NextResponse.redirect(new URL('/login?error=oauth', requestUrl.origin));
    }

    console.log('[OAuth Callback] Session created:', data.session ? 'YES' : 'NO');
    console.log('[OAuth Callback] User:', data.user?.email);
  }

  return NextResponse.redirect(new URL('/', requestUrl.origin));
}
