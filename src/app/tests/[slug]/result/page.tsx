'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/app/lib/supabase';
import type { Tables } from '@/types/supabase';

type ResultRow = Tables<'results'>;

export default function Result({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { code?: string };
}) {
  const code = searchParams?.code as string;
  const [result, setResult] = useState<ResultRow | null>(null);

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
      const { data: test } = await q.single<{ id: string }>();
      if (!test) return;

      const { data: res } = await supabase()
        .from('results')
        .select('*')
        .eq('test_id', test.id)
        .eq('code', code)
        .single();
      setResult(res);
    })();
  }, [params.slug, code]);

  return (
    <div style={{ padding: 24 }}>
      <h1>결과: {code}</h1>
      {result ? (
        <>
          <h2>{result.title}</h2>
          <p>{result.description}</p>
          {result.image_url && (
            <Image
              src={result.image_url}
              alt={result.code ?? 'result'}
              width={240}
              height={240}
            />
          )}
        </>
      ) : (
        <p>결과 카드 준비 중…</p>
      )}
      <a href="/mypage">마이페이지로</a>
    </div>
  );
}
