'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/app/lib/supabase';
import { Submission } from '@/types/mypage';

export default function MyPage() {
  const [subs, setSubs] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ email?: string } | null>(null);

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase().auth.getUser();
      const uid = userData.user?.id;
      setUser({ email: userData.user?.email });

      if (!uid) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase()
        .from('submissions')
        .select('id, result_code, created_at, test_id, tests(title, slug)')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) {
        console.error(error.message);
      } else {
        setSubs(data as unknown as Submission[]);
      }
      setLoading(false);
    })();
  }, []);

  const stats = {
    total: subs.length,
    thisMonth: subs.filter((s) => {
      const date = new Date(s.created_at);
      const now = new Date();
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    }).length,
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-zinc-200 border-t-indigo-600 dark:border-zinc-800 dark:border-t-indigo-400" />
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user?.email) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
            <svg
              className="h-8 w-8 text-zinc-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            로그인이 필요합니다
          </h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            검사 기록을 보려면 로그인해주세요
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            로그인하기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900">
      <div className="mx-auto max-w-5xl px-6 py-16 sm:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
            마이페이지
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            {user.email}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
                <svg
                  className="h-6 w-6 text-indigo-600 dark:text-indigo-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  총 검사 수
                </p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {stats.total}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-fuchsia-100 dark:bg-fuchsia-900/30">
                <svg
                  className="h-6 w-6 text-fuchsia-600 dark:text-fuchsia-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  이번 달
                </p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {stats.thisMonth}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="flex h-full items-center justify-center text-center"
            >
              <div>
                <svg
                  className="mx-auto h-8 w-8 text-indigo-600 dark:text-indigo-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <p className="mt-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                  새 검사 하기
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Test History */}
        <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              검사 기록
            </h2>
          </div>

          {subs.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                <svg
                  className="h-8 w-8 text-zinc-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400">
                아직 검사 기록이 없습니다
              </p>
              <Link
                href="/"
                className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
              >
                첫 검사 시작하기 →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {subs.map((s) => (
                <Link
                  key={s.id}
                  href={`/tests/${s.tests?.slug ?? s.test_id}/result?code=${s.result_code}`}
                  className="group block px-6 py-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-indigo-500 to-fuchsia-600">
                          <span className="text-sm font-bold text-white">
                            {s.result_code}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-zinc-900 group-hover:text-indigo-600 dark:text-zinc-100 dark:group-hover:text-indigo-400">
                            {s.tests?.title ?? '테스트'}
                          </p>
                          <p className="text-sm text-zinc-500 dark:text-zinc-500">
                            {new Date(s.created_at).toLocaleDateString('ko-KR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                    <svg
                      className="h-5 w-5 text-zinc-400 transition-transform group-hover:translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
