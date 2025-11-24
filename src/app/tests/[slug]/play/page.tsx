'use client';
import { use, useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabase';
import type { Tables, TablesInsert, Database } from '@/types/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

type TestIdRow = Pick<Tables<'tests'>, 'id'>;
type QuestionRow = Pick<Tables<'questions'>, 'id' | 'text' | 'order'>;
type ChoiceRow = Pick<
  Tables<'choices'>,
  'id' | 'text' | 'order' | 'score_json' | 'question_id'
>;
type QuestionVM = QuestionRow & { choices: ChoiceRow[] };

export default function Play({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [testId, setTestId] = useState<string>('');
  const [qs, setQs] = useState<QuestionVM[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({}); // {questionId: choiceId}

  useEffect(() => {
    (async () => {
      const key = slug;
      const isUuid = (s?: string) =>
        !!s &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          s,
        );

      let q = supabase().from('tests').select('id');
      q = isUuid(key) ? q.eq('id', key) : q.eq('slug', key);
      const { data: tests } = await q.returns<TestIdRow[]>();
      const first = tests?.[0];
      if (!first) return;
      setTestId(first.id);

      const { data: questions } = await supabase()
        .from('questions')
        .select('id,text,order')
        .eq('test_id', first.id)
        .order('order')
        .returns<QuestionRow[]>();
      const qIds = (questions ?? []).map((q) => q.id);
      const { data: choices } = await supabase()
        .from('choices')
        .select('id,text,order,score_json,question_id')
        .in('question_id', qIds)
        .order('order')
        .returns<ChoiceRow[]>();

      const byQ = (questions ?? []).map((q) => ({
        id: q.id,
        text: q.text,
        order: q.order,
        choices: (choices ?? []).filter((c) => c.question_id === q.id),
      }));
      setQs(byQ);
    })();
  }, [slug]);

  const pick = (qid: string, cid: string) =>
    setAnswers((a) => ({ ...a, [qid]: cid }));

  const onSubmit = async () => {
    const { data: selected } = await supabase()
      .from('choices')
      .select('id,score_json')
      .in('id', Object.values(answers))
      .returns<Pick<ChoiceRow, 'id' | 'score_json'>[]>();

    const scores: Record<string, number> = {};
    (selected ?? []).forEach((c) => {
      const s = (c.score_json ?? {}) as Record<string, number>;
      Object.keys(s).forEach((k) => {
        scores[k] = (scores[k] ?? 0) + Number(s[k]);
      });
    });

    const decide = (L: string, R: string) =>
      (scores[L] ?? 0) >= (scores[R] ?? 0) ? L : R;
    const code = [
      decide('E', 'I'),
      decide('S', 'N'),
      decide('T', 'F'),
      decide('J', 'P'),
    ].join('');

    const { data: user } = await supabase().auth.getUser();
    const uid = user.user?.id;
    if (!uid) return alert('로그인 필요');

    const payload: TablesInsert<'submissions'> = {
      test_id: testId,
      user_id: uid,
      answers_json: answers,
      scores_json: scores,
      result_code: code,
    };
    const client = supabase() as unknown as SupabaseClient<Database>;
    const { error } = await client.from('submissions').insert(payload);
    if (error) return alert(error.message);
    window.location.href = `/tests/${slug}/result?code=${code}`;
  };

  const allAnswered = qs.length > 0 && qs.every((q) => answers[q.id]);
  const progress = qs.length > 0 ? (Object.keys(answers).length / qs.length) * 100 : 0;

  if (qs.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 mx-auto animate-spin rounded-full border-4 border-zinc-200 border-t-indigo-600 dark:border-zinc-800 dark:border-t-indigo-400" />
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900">
      <div className="mx-auto max-w-3xl px-6 py-8 sm:px-8">
        {/* Progress Bar */}
        <div className="sticky top-16 z-10 bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900 pb-4 mb-4 -mx-6 px-6 sm:-mx-8 sm:px-8">
          <div className="flex items-center justify-between text-sm text-zinc-600 dark:text-zinc-400 mb-2">
            <span>진행률</span>
            <span>{Object.keys(answers).length} / {qs.length}</span>
          </div>
          <div className="h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-8">
          {qs.map((q) => (
            <div
              key={q.id}
              className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                {q.order}. {q.text}
              </h3>
              <div className="space-y-3">
                {(q.choices ?? []).map((c) => {
                  const isSelected = answers[q.id] === c.id;
                  return (
                    <label
                      key={c.id}
                      className={`block cursor-pointer rounded-lg border-2 p-4 transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-950/30'
                          : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name={q.id}
                          checked={isSelected}
                          onChange={() => pick(q.id, c.id)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-600"
                        />
                        <span
                          className={`ml-3 ${
                            isSelected
                              ? 'font-medium text-zinc-900 dark:text-zinc-100'
                              : 'text-zinc-700 dark:text-zinc-300'
                          }`}
                        >
                          {c.text}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="mt-8 sticky bottom-8">
          <button
            onClick={onSubmit}
            disabled={!allAnswered}
            className={`w-full rounded-xl px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all ${
              allAnswered
                ? 'bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-700 hover:to-fuchsia-700 hover:shadow-xl'
                : 'bg-zinc-300 dark:bg-zinc-700 cursor-not-allowed'
            }`}
          >
            {allAnswered ? '결과 확인하기' : '모든 질문에 답해주세요'}
          </button>
        </div>
      </div>
    </div>
  );
}
