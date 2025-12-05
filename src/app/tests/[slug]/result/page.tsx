'use client';
import { use, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/app/lib/supabase';
import type { Tables } from '@/types/supabase';

type ResultRow = Tables<'results'>;
type SubmissionRow = Tables<'submissions'>;

interface ScoreBreakdown {
  dimension: string;
  left: { label: string; score: number; percentage: number };
  right: { label: string; score: number; percentage: number };
}

interface ScoreItem {
  code: string;
  title: string;
  score: number;
  percentage: number;
  isResult: boolean;
}

export default function Result({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ code?: string }>;
}) {
  const { slug } = use(params);
  const { code } = use(searchParams);
  const [result, setResult] = useState<ResultRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [scoreBreakdown, setScoreBreakdown] = useState<ScoreBreakdown[]>([]);
  const [scoreItems, setScoreItems] = useState<ScoreItem[]>([]);

  const calculateScoreBreakdown = (
    scores: Record<string, number>,
  ): ScoreBreakdown[] => {
    const dimensions = [
      { left: 'E', right: 'I', name: '외향성 vs 내향성' },
      { left: 'S', right: 'N', name: '감각 vs 직관' },
      { left: 'T', right: 'F', name: '사고 vs 감정' },
      { left: 'J', right: 'P', name: '판단 vs 인식' },
    ];

    return dimensions.map((dim) => {
      const leftScore = scores[dim.left] ?? 0;
      const rightScore = scores[dim.right] ?? 0;
      const total = leftScore + rightScore || 1; // 0으로 나누기 방지

      return {
        dimension: dim.name,
        left: {
          label: dim.left,
          score: leftScore,
          percentage: Math.round((leftScore / total) * 100),
        },
        right: {
          label: dim.right,
          score: rightScore,
          percentage: Math.round((rightScore / total) * 100),
        },
      };
    });
  };

  useEffect(() => {
    (async () => {
      if (!code) {
        console.error('No code provided');
        setLoading(false);
        return;
      }

      const key = slug;
      const isUuid = (s?: string) =>
        !!s &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          s,
        );

      let q = supabase().from('tests').select('id');
      q = isUuid(key) ? q.eq('id', key) : q.eq('slug', key);
      const { data: test, error: testError } = await q.maybeSingle<{
        id: string;
      }>();
      if (testError) {
        console.error('Error fetching test:', testError);
        setLoading(false);
        return;
      }
      if (!test) {
        setLoading(false);
        return;
      }

      const { data: res, error: resError } = await supabase()
        .from('results')
        .select('*')
        .eq('test_id', test.id)
        .eq('code', code)
        .maybeSingle();
      if (resError) {
        console.error('Error fetching result:', resError);
      }
      setResult(res);

      // 모든 결과 가져오기 (그래프 표시용)
      const { data: allResults } = await supabase()
        .from('results')
        .select('code, title')
        .eq('test_id', test.id);

      // 가장 최근 submission 가져와서 점수 계산
      const { data: user } = await supabase().auth.getUser();
      let scores: Record<string, number> = {};

      if (user.user) {
        const { data: submissions } = await supabase()
          .from('submissions')
          .select('scores_json')
          .eq('test_id', test.id)
          .eq('user_id', user.user.id)
          .eq('result_code', code)
          .order('created_at', { ascending: false })
          .limit(1)
          .returns<Pick<SubmissionRow, 'scores_json'>[]>();

        if (submissions && submissions.length > 0) {
          scores = (submissions[0].scores_json ?? {}) as Record<string, number>;
        }
      }

      // MBTI 차원이 있는지 확인
      const mbtiDimensions = ['E', 'I', 'S', 'N', 'T', 'F', 'J', 'P'];
      const isMbtiTest = mbtiDimensions.some(
        (dim) => scores[dim] !== undefined,
      );

      if (isMbtiTest) {
        // MBTI 테스트 (커피, classic-mbti 등): 차원 그래프
        const breakdown = calculateScoreBreakdown(scores);
        setScoreBreakdown(breakdown);
      } else if (allResults) {
        // 다른 테스트: 결과별 점수 그래프
        const hasScores = Object.keys(scores).length > 0;
        const totalScore = hasScores
          ? Object.values(scores).reduce((sum, s) => sum + s, 0) || 1
          : allResults.length;

        const items: ScoreItem[] = allResults
          .map((r) => ({
            code: r.code,
            title: r.title,
            score: scores[r.code] || 0,
            percentage: hasScores
              ? Math.round(((scores[r.code] || 0) / totalScore) * 100)
              : r.code === code
              ? 100
              : 0,
            isResult: r.code === code,
          }))
          .sort((a, b) => b.score - a.score);
        setScoreItems(items);
      }

      setLoading(false);
    })();
  }, [slug, code]);

  const handleShare = async () => {
    const url = window.location.href;

    // Web Share API 지원하는 경우
    if (navigator.share) {
      try {
        await navigator.share({
          title: result?.title || 'MBTI 검사 결과',
          text: `나의 결과는 ${code}! ${result?.title}`,
          url: url,
        });
      } catch (err) {
        console.log('Share failed:', err);
      }
      return;
    }

    // Clipboard API 지원하는 경우
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(url);
        alert('링크가 복사되었습니다!');
      } catch (err) {
        console.error('Clipboard failed:', err);
        fallbackCopyToClipboard(url);
      }
      return;
    }

    // 폴백: 텍스트 선택 방식
    fallbackCopyToClipboard(url);
  };

  const fallbackCopyToClipboard = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand('copy');
      alert('링크가 복사되었습니다!');
    } catch (err) {
      console.error('Fallback copy failed:', err);
      alert('링크 복사에 실패했습니다. 수동으로 복사해주세요: ' + text);
    }

    document.body.removeChild(textArea);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-zinc-200 border-t-indigo-600 dark:border-zinc-800 dark:border-t-indigo-400" />
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">
            결과 분석 중...
          </p>
        </div>
      </div>
    );
  }

  if (!code || !result) {
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
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            결과를 찾을 수 없습니다
          </h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            검사를 다시 진행해주세요
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
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
        {/* Result Card */}
        <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-indigo-500 to-fuchsia-600 px-8 py-12 text-center">
            <div className="mx-auto mb-4 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <span className="text-3xl font-bold text-white">{code}</span>
            </div>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">
              {result.title}
            </h1>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Image */}
            {result.image_url && (
              <div className="mb-8">
                <div className="relative w-full aspect-square max-w-2xl mx-auto overflow-hidden rounded-2xl">
                  <Image
                    src={result.image_url}
                    alt={result.code ?? 'result'}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}

            {/* Score Distribution - 모든 테스트 통일 */}
            {scoreItems.length > 0 && (
              <div className="mb-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="mb-4 text-center text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  결과별 점수 분포
                </h3>
                <div className="space-y-3">
                  {scoreItems.map((item) => (
                    <div key={item.code}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span
                          className={`font-medium ${
                            item.isResult
                              ? 'text-indigo-600 dark:text-indigo-400'
                              : 'text-zinc-600 dark:text-zinc-400'
                          }`}
                        >
                          {item.title}
                          {item.isResult && ' ✓'}
                        </span>
                        <span className="text-xs text-zinc-500">
                          {item.score}점 ({item.percentage}%)
                        </span>
                      </div>
                      <div className="h-6 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                        <div
                          className={`h-full transition-all duration-500 ${
                            item.isResult
                              ? 'bg-gradient-to-r from-indigo-500 to-fuchsia-600'
                              : 'bg-gradient-to-r from-zinc-400 to-zinc-500'
                          }`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-center text-xs text-zinc-500 dark:text-zinc-600">
                  가장 높은 점수를 받은 결과가 최종 유형입니다
                </p>
              </div>
            )}

            {/* MBTI 차원 그래프 (커피, classic-mbti 등) */}
            {scoreBreakdown.length > 0 && (
              <div className="mb-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="mb-4 text-center text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  성격 차원별 점수
                </h3>
                <div className="space-y-5 sm:space-y-6">
                  {scoreBreakdown.map((item, idx) => (
                    <div key={idx}>
                      {/* 차원 이름 - 모바일에서는 축약형 */}
                      <div className="mb-2 text-center">
                        <span className="text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400 sm:hidden">
                          {item.dimension.split(' vs ')[0].slice(0, 2)} vs{' '}
                          {item.dimension.split(' vs ')[1].slice(0, 2)}
                        </span>
                        <span className="hidden sm:inline text-sm font-medium text-zinc-600 dark:text-zinc-400">
                          {item.dimension}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 px-2 sm:gap-3 sm:px-0">
                        {/* Left side - 모바일 최적화 */}
                        <div className="flex w-10 sm:w-16 flex-col items-end">
                          <span className="text-base sm:text-lg font-bold text-indigo-600 dark:text-indigo-400">
                            {item.left.label}
                          </span>
                          <span className="text-[10px] sm:text-xs text-zinc-500">
                            {item.left.percentage}%
                          </span>
                        </div>

                        {/* Progress bar - 모바일에서 높이 증가 */}
                        <div className="relative flex-1">
                          <div className="h-10 sm:h-8 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                            <div className="flex h-full">
                              {/* Left bar */}
                              <div
                                className="flex items-center justify-end bg-gradient-to-r from-indigo-500 to-indigo-600 px-1.5 sm:px-2 transition-all duration-500"
                                style={{
                                  width: `${item.left.percentage}%`,
                                }}
                              >
                                {item.left.percentage > 10 && (
                                  <span className="text-[10px] sm:text-xs font-semibold text-white">
                                    {item.left.score}
                                  </span>
                                )}
                              </div>
                              {/* Right bar */}
                              <div
                                className="flex items-center justify-start bg-gradient-to-r from-fuchsia-600 to-fuchsia-500 px-1.5 sm:px-2 transition-all duration-500"
                                style={{
                                  width: `${item.right.percentage}%`,
                                }}
                              >
                                {item.right.percentage > 10 && (
                                  <span className="text-[10px] sm:text-xs font-semibold text-white">
                                    {item.right.score}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right side - 모바일 최적화 */}
                        <div className="flex w-10 sm:w-16 flex-col items-start">
                          <span className="text-base sm:text-lg font-bold text-fuchsia-600 dark:text-fuchsia-400">
                            {item.right.label}
                          </span>
                          <span className="text-[10px] sm:text-xs text-zinc-500">
                            {item.right.percentage}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-center text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-600 leading-relaxed">
                  각 차원별로 높은 점수를 받은 성향이 최종 MBTI 유형을
                  결정합니다
                </p>
              </div>
            )}

            {/* Description */}
            {result.description && (
              <div className="mb-8 rounded-2xl bg-zinc-50 p-6 dark:bg-zinc-900">
                <p className="whitespace-pre-wrap text-lg leading-relaxed text-zinc-700 dark:text-zinc-300">
                  {result.description}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid gap-4 sm:grid-cols-2">
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 rounded-xl border-2 border-zinc-200 bg-white px-6 py-3 font-semibold text-zinc-900 transition-all hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
                결과 공유하기
              </button>

              <Link
                href={`/tests/${slug}`}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:from-indigo-700 hover:to-fuchsia-700"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                다시 검사하기
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="mt-8 flex flex-col gap-3 border-t border-zinc-200 pt-6 dark:border-zinc-800 sm:flex-row sm:justify-center">
              <Link
                href="/mypage"
                className="text-center text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
              >
                내 검사 기록 보기 →
              </Link>
              <span className="hidden text-zinc-300 dark:text-zinc-700 sm:inline">
                |
              </span>
              <Link
                href="/"
                className="text-center text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
              >
                다른 테스트 보기 →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
