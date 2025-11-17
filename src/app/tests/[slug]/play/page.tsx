'use client';
import { useEffect, useState } from 'react';
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

export default function Play({ params }: { params: { slug: string } }) {
  const [testId, setTestId] = useState<string>('');
  const [qs, setQs] = useState<QuestionVM[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({}); // {questionId: choiceId}

  useEffect(() => {
    (async () => {
      const key = params.slug;
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
  }, [params.slug]);

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
    window.location.href = `/tests/${params.slug}/result?code=${code}`;
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>검사 진행</h1>
      {qs.map((q) => (
        <div key={q.id} style={{ marginBottom: 16 }}>
          <p>
            <b>
              {q.order}. {q.text}
            </b>
          </p>
          {(q.choices ?? []).map((c) => (
            <label key={c.id} style={{ display: 'block', cursor: 'pointer' }}>
              <input
                type="radio"
                name={q.id}
                checked={answers[q.id] === c.id}
                onChange={() => pick(q.id, c.id)}
              />{' '}
              {c.text}
            </label>
          ))}
        </div>
      ))}
      <button onClick={onSubmit} disabled={qs.length === 0}>
        제출
      </button>
    </div>
  );
}
