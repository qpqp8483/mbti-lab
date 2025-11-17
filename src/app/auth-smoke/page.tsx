'use client';
import { useState } from 'react';
import { supabase } from '@/app/lib/supabase';
import type { TablesInsert, Database } from '@/types/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

export default function AuthSmoke() {
  const [log, setLog] = useState<string>('');

  const getUser = async () => {
    const { data } = await supabase().auth.getUser();
    setLog(JSON.stringify(data?.user, null, 2) || 'no user');
  };

  const readProtected = async () => {
    // RLS 걸린 테이블에서 '내 것만' 읽기 (처음엔 0건이 정상)
    const { data, error } = await supabase()
      .from('submissions')
      .select('id, created_at')
      .limit(5);
    setLog(
      error ? `READ ERROR: ${error.message}` : JSON.stringify(data, null, 2),
    );
  };

  const writeProtected = async () => {
    // 샘플 test가 있어야 함 (이전에 cat-mbti 시드 넣었으면 slug=cat-mbti 사용)
    const { data: t } = await supabase()
      .from('tests')
      .select('id')
      .eq('slug', 'cat-mbti')
      .single<{ id: string }>();
    if (!t) return setLog('cat-mbti 테스트가 없음: 샘플 SQL 먼저 넣어줘');

    const { data: u } = await supabase().auth.getUser();
    if (!u.user) return setLog('로그인 필요');

    const payload: TablesInsert<'submissions'> = {
      test_id: t.id,
      user_id: u.user.id,
      answers_json: {},
      scores_json: {},
      result_code: 'TEST',
    };
    const client = supabase() as unknown as SupabaseClient<Database>;
    const { error } = await client.from('submissions').insert(payload);
    setLog(
      error
        ? `WRITE ERROR: ${error.message}`
        : 'WRITE OK (submissions 1건 추가됨)',
    );
  };

  const signOut = async () => {
    await supabase().auth.signOut();
    setLog('signed out');
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Auth Smoke</h1>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={getUser}>1) 현재 사용자</button>
        <button onClick={readProtected}>2) 보호 테이블 읽기</button>
        <button onClick={writeProtected}>3) 보호 테이블 쓰기</button>
        <button onClick={signOut}>로그아웃</button>
      </div>
      <pre
        style={{
          marginTop: 16,
          background: '#111',
          color: '#0f0',
          padding: 12,
          overflow: 'auto',
        }}
      >
        {log}
      </pre>
    </div>
  );
}
