'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabase';
import { Tables } from '@/types/supabase';

type Test = Tables<'tests'>;

export default function TestDetail({ params }: { params: { slug: string } }) {
  const [test, setTest] = useState<Test | null>(null);

  useEffect(() => {
    const key = params.slug;
    const isUuid = (s?: string) =>
      !!s &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        s,
      );

    let q = supabase().from('tests').select('*');
    q = isUuid(key) ? q.eq('id', key) : q.eq('slug', key);
    q.single().then(({ data, error }) => {
      console.log(data);
      if (error) alert(error.message);
      else setTest(data);
    });
  }, [params.slug]);

  if (!test) return <div style={{ padding: 24 }}>로딩…</div>;
  return (
    <div style={{ padding: 24 }}>
      <h1>{test.title}</h1>
      <p>{test.description}</p>
      <a href={`/tests/${params.slug}/play`}>
        <button>검사 시작</button>
      </a>
    </div>
  );
}
