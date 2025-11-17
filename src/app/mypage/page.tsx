'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabase';
import { Submission } from '@/types/mypage';

export default function MyPage() {
  const [subs, setSubs] = useState<Submission[]>([]);

  useEffect(() => {
    (async () => {
      const { data: user } = await supabase().auth.getUser();
      const uid = user.user?.id;
      if (!uid) return;

      const { data, error } = await supabase()
        .from('submissions')
        .select('id, result_code, created_at, test_id, tests(title, slug)')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) alert(error.message);
      else setSubs(data as unknown as Submission[]);
    })();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>마이페이지</h1>
      <ul>
        {subs.map((s) => (
          <li key={s.id}>
            [{new Date(s.created_at).toLocaleString()}]
            <a href={`/tests/${s.tests?.slug ?? s.test_id}`}>
              {s.tests?.title ?? '테스트'}
            </a>{' '}
            → {s.result_code}
          </li>
        ))}
      </ul>
    </div>
  );
}
