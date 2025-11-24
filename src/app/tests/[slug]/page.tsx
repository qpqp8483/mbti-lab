'use client';
import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/app/lib/supabase';
import { Tables } from '@/types/supabase';

type Test = Tables<'tests'>;

const categoryColors: Record<string, string> = {
  fun: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  character:
    'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  personality:
    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  lifestyle:
    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  career: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  classic:
    'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
};

const categoryLabels: Record<string, string> = {
  fun: '재미',
  character: '캐릭터',
  personality: '성격',
  lifestyle: '라이프스타일',
  career: '진로',
  classic: '정통',
};

export default function TestDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [test, setTest] = useState<Test | null>(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const key = slug;
    const isUuid = (s?: string) =>
      !!s &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        s,
      );

    let q = supabase().from('tests').select('*');
    q = isUuid(key) ? q.eq('id', key) : q.eq('slug', key);
    q.maybeSingle<Test>().then(({ data, error }) => {
      if (error) {
        console.error('Error fetching test:', error);
        setLoading(false);
      } else if (!data) {
        console.error('Test not found');
        setLoading(false);
      } else {
        setTest(data);
        // 질문 개수 가져오기
        supabase()
          .from('questions')
          .select('id', { count: 'exact', head: true })
          .eq('test_id', data.id)
          .then(({ count }) => {
            setQuestionCount(count ?? 0);
            setLoading(false);
          });
      }
    });
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-indigo-600 dark:border-zinc-800 dark:border-t-indigo-400" />
      </div>
    );
  }

  if (!test) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-600 dark:text-zinc-400">
            테스트를 찾을 수 없습니다.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900">
      <div className="mx-auto max-w-3xl px-6 py-16 sm:px-8">
        {/* Category Badge */}
        {test.category && (
          <span
            className={`inline-block rounded-full px-4 py-1.5 text-sm font-medium ${
              categoryColors[test.category] ??
              'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
            }`}
          >
            {categoryLabels[test.category] ?? test.category}
          </span>
        )}

        {/* Title */}
        <h1 className="mt-6 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl">
          {test.title}
        </h1>

        {/* Description */}
        {test.description && (
          <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            {test.description}
          </p>
        )}

        {/* Info Card */}
        <div className="mt-10 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            테스트 정보
          </h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-center text-zinc-600 dark:text-zinc-400">
              <svg
                className="mr-3 h-5 w-5"
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
              <span>
                총 {questionCount}개의 질문
                {questionCount === 0 && ' (아직 질문이 없습니다)'}
              </span>
            </div>
            <div className="flex items-center text-zinc-600 dark:text-zinc-400">
              <svg
                className="mr-3 h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>예상 소요 시간: 약 {Math.max(2, questionCount)} 분</span>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <div className="mt-10">
          {questionCount > 0 ? (
            <Link
              href={`/tests/${slug}/play`}
              className="block w-full rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-8 py-4 text-center text-lg font-semibold text-white shadow-lg transition-all hover:from-indigo-700 hover:to-fuchsia-700 hover:shadow-xl"
            >
              검사 시작하기
            </Link>
          ) : (
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 text-center dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-zinc-600 dark:text-zinc-400">
                아직 질문이 준비되지 않았습니다.
              </p>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-500">
                관리자가 질문을 추가하면 검사를 시작할 수 있습니다.
              </p>
            </div>
          )}
        </div>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            ← 다른 테스트 보기
          </Link>
        </div>
      </div>
    </div>
  );
}
