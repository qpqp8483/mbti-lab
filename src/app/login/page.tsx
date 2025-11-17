'use client';
import { supabase } from '@/app/lib/supabase';
import Link from 'next/link';
import { FormEvent, useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    setLoading(true);
    const { error } = await supabase().auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) alert('이메일과 패스워드가 정확하지 않아요.');
    else window.location.href = '/';
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password) return;
    await onLogin();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-black">
      <div className="mx-auto flex min-h-screen items-center justify-center p-6">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md rounded-2xl border border-zinc-200/60 bg-white/70 p-6 shadow-xl backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/60 sm:p-8"
        >
          <div className="mb-6 text-center">
            <h1 className="bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-900 bg-clip-text text-2xl font-semibold text-transparent dark:from-zinc-100 dark:via-zinc-300 dark:to-zinc-100">
              로그인
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              이메일과 비밀번호로 로그인하세요
            </p>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                이메일
              </span>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                className="block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder:text-zinc-400 outline-none ring-0 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                비밀번호
              </span>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder:text-zinc-400 outline-none ring-0 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>

          <div className="my-6 flex items-center gap-3 text-zinc-400">
            <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
            <span className="text-xs">또는</span>
            <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
          </div>

          <div className="text-center text-sm text-zinc-600 dark:text-zinc-400">
            아직 계정이 없나요?{' '}
            <Link
              href="/login/signup"
              className="font-medium text-blue-600 underline-offset-2 hover:underline dark:text-blue-500"
            >
              회원가입
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
