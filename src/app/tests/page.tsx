'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabase';

type Test = {
  id: string;
  slug: string | null;
  title: string;
  category: string | null;
};

export default function TestsPage() {
  const [tests, setTests] = useState<Test[]>([]);

  useEffect(() => {
    supabase()
      .from('tests')
      .select('id, slug, title, category')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) alert(error.message);
        else setTests(data ?? []);
      });
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>MBTI 검사</h1>
      <ul>
        {tests.map((t) => (
          <li key={t.id}>
            <a href={`/tests/${t.slug ?? t.id}`}>{t.title}</a>
            {t.category ? ` • ${t.category}` : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
