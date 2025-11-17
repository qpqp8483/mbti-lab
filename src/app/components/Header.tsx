'use client';

import Link from 'next/link';
import React from 'react';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const client = supabase();

    // 초기 사용자 세션 확인
    client.auth
      .getUser()
      .then(({ data }) => setUser(data.user ?? null))
      .catch(() => setUser(null));

    // 로그인/로그아웃 상태 변화 구독
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    const client = supabase();
    await client.auth.signOut();
    router.refresh();
  };

  const linkClass = (href: string) => {
    const isActive = pathname === href;
    return [
      'relative px-4 py-2 text-sm font-medium transition-all duration-200',
      'hover:text-zinc-900 dark:hover:text-zinc-100',
      isActive
        ? 'text-zinc-900 dark:text-zinc-100'
        : 'text-zinc-600 dark:text-zinc-400',
    ].join(' ');
  };

  const activeIndicator = (href: string) =>
    pathname === href ? (
      <span className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-indigo-500 to-fuchsia-500" />
    ) : null;

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/50 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/80 dark:border-zinc-800/50 dark:bg-zinc-950/80">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="group flex items-center gap-2 transition-transform hover:scale-[1.02]"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-600 shadow-sm">
              <span className="text-sm font-bold text-white">M</span>
            </div>
            <span className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              MBTI Lab
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            <Link href="/tests" className={linkClass('/tests')}>
              Tests
              {activeIndicator('/tests')}
            </Link>
            {user ? (
              <>
                <Link href="/mypage" className={linkClass('/mypage')}>
                  My Page
                  {activeIndicator('/mypage')}
                </Link>
                <div className="mx-2 h-4 w-px bg-zinc-200 dark:bg-zinc-800" />
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-zinc-600 transition-all duration-200 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <div className="mx-2 h-4 w-px bg-zinc-200 dark:bg-zinc-800" />
                <Link
                  href="/login"
                  className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-zinc-800 hover:shadow-md dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  Login
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
