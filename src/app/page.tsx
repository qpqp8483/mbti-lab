'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/app/lib/supabase';

type Test = {
  id: string;
  slug: string | null;
  title: string;
  description: string | null;
  category: string | null;
};

const categoryColors: Record<string, string> = {
  fun: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  character: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  personality: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  lifestyle: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  career: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  classic: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
};

const categoryLabels: Record<string, string> = {
  fun: '재미',
  character: '캐릭터',
  personality: '성격',
  lifestyle: '라이프스타일',
  career: '진로',
  classic: '정통',
};

export default function Home() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase()
      .from('tests')
      .select('id, slug, title, description, category')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error(error);
        else setTests(data ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900">
      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-6 py-16 text-center sm:px-8 sm:py-24">
        <h1 className="bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-6xl">
          MBTI Lab
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          재미있는 MBTI 테스트로 나를 알아가는 시간
          <br />
          커피, 동물, 음식 등 다양한 테마로 나의 성격을 탐험해보세요
        </p>
      </section>

      {/* Tests Grid */}
      <section className="mx-auto max-w-7xl px-6 pb-24 sm:px-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-indigo-600 dark:border-zinc-800 dark:border-t-indigo-400" />
          </div>
        ) : tests.length === 0 ? (
          <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-zinc-600 dark:text-zinc-400">
              아직 등록된 테스트가 없습니다.
            </p>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-500">
              Supabase에서 supabase-seed-tests.sql 파일을 실행해주세요.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tests.map((test) => (
              <Link
                key={test.id}
                href={`/tests/${test.slug ?? test.id}`}
                className="group relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 transition-all hover:border-zinc-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
              >
                {/* Category Badge */}
                {test.category && (
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                      categoryColors[test.category] ?? 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                    }`}
                  >
                    {categoryLabels[test.category] ?? test.category}
                  </span>
                )}

                {/* Title */}
                <h3 className="mt-4 text-xl font-semibold text-zinc-900 group-hover:text-indigo-600 dark:text-zinc-100 dark:group-hover:text-indigo-400">
                  {test.title}
                </h3>

                {/* Description */}
                {test.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {test.description}
                  </p>
                )}

                {/* Arrow Icon */}
                <div className="mt-4 flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400">
                  테스트 시작하기
                  <svg
                    className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1"
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

                {/* Gradient Border Effect */}
                <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-indigo-500/0 via-fuchsia-500/0 to-indigo-500/0 opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
