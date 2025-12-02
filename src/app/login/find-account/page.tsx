'use client';
import { supabase } from '@/app/lib/supabase';
import Link from 'next/link';
import { FormEvent, useState } from 'react';

export default function FindAccountPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    found: boolean;
    password?: string;
    message?: string;
  } | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) {
      setResult({ found: false, message: '이메일을 입력해주세요.' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase()
        .from('user_passwords')
        .select('password')
        .eq('email', email)
        .single();

      setLoading(false);

      if (error || !data) {
        setResult({
          found: false,
          message: '해당 이메일로 가입된 계정을 찾을 수 없습니다.',
        });
      } else {
        setResult({
          found: true,
          password: data.password,
          message: '계정을 찾았습니다!',
        });
      }
    } catch {
      setLoading(false);
      setResult({
        found: false,
        message: '오류가 발생했습니다. 다시 시도해주세요.',
      });
    }
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
              계정 찾기
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              가입한 이메일을 입력하세요
            </p>
            <div className="mt-3 rounded-lg bg-amber-50 p-3 dark:bg-amber-950/30">
              <p className="text-xs text-amber-800 dark:text-amber-400">
                ⚠️ 개발 환경 전용 기능입니다
              </p>
            </div>
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
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? '검색 중...' : '계정 찾기'}
          </button>

          {result && (
            <div
              className={`mt-6 rounded-lg p-4 ${
                result.found
                  ? 'bg-green-50 dark:bg-green-950/30'
                  : 'bg-red-50 dark:bg-red-950/30'
              }`}
            >
              <p
                className={`text-sm font-medium ${
                  result.found
                    ? 'text-green-800 dark:text-green-400'
                    : 'text-red-800 dark:text-red-400'
                }`}
              >
                {result.message}
              </p>
              {result.found && result.password && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between rounded-md bg-white/50 p-3 dark:bg-zinc-900/50">
                    <span className="text-xs text-zinc-600 dark:text-zinc-400">
                      이메일
                    </span>
                    <span className="font-mono text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {email}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-md bg-white/50 p-3 dark:bg-zinc-900/50">
                    <span className="text-xs text-zinc-600 dark:text-zinc-400">
                      비밀번호
                    </span>
                    <span className="font-mono text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {result.password}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 flex flex-col gap-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
            <Link
              href="/login"
              className="font-medium text-blue-600 underline-offset-2 hover:underline dark:text-blue-500"
            >
              로그인으로 돌아가기
            </Link>
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
