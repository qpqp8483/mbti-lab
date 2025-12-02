'use client';
import { supabase } from '@/app/lib/supabase';
import Link from 'next/link';
import { FormEvent, useMemo, useState } from 'react';

type Errors = { email?: string; password?: string; confirm?: string };
type Touched = { email?: boolean; password?: boolean; confirm?: boolean };

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Touched>({});
  const [loading, setLoading] = useState(false);

  const validate = useMemo(
    () => ({
      email: (v: string) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
          ? ''
          : '올바른 이메일 형식이 아닙니다.',
      password: (v: string) =>
        v.length >= 6 ? '' : '비밀번호는 최소 6자 이상이어야 합니다.',
      confirm: (v: string, p: string) =>
        v === p ? '' : '비밀번호가 일치하지 않습니다.',
    }),
    [],
  );

  const runValidateAll = () => {
    const next: Errors = {
      email: validate.email(email),
      password: validate.password(password),
      confirm: validate.confirm(confirm, password),
    };
    setErrors(next);
    return Object.values(next).every((m) => !m);
  };

  const onSignup = async () => {
    setLoading(true);
    const { error } = await supabase().auth.signUp({ email, password });

    // 회원가입 성공 시 비밀번호를 user_passwords 테이블에 저장
    // 이메일 확인이 필요한 경우 세션이 없어서 실패할 수 있음 (로그인 시 재시도됨)
    if (!error) {
      const { error: pwError } = await supabase()
        .from('user_passwords')
        .upsert({ email, password, updated_at: new Date().toISOString() });

      if (pwError) {
        console.error('비밀번호 저장 실패 (로그인 시 재시도됨):', pwError);
      }
    }

    setLoading(false);
    if (error) {
      alert(error.message);
      return;
    }
    alert('가입 완료! 이제 로그인할 수 있습니다.');
    window.location.href = '/login';
  };

  const onGoogleSignup = async () => {
    const { error } = await supabase().auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) alert('Google 로그인 중 오류가 발생했습니다.');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTouched({ email: true, password: true, confirm: true });
    if (!runValidateAll()) return;
    await onSignup();
  };

  const handleFieldChange = (field: keyof Touched) => (v: string) => {
    if (field === 'email') {
      setEmail(v);
      if (touched.email) setErrors((p) => ({ ...p, email: validate.email(v) }));
    } else if (field === 'password') {
      setPassword(v);
      if (touched.password)
        setErrors((p) => ({ ...p, password: validate.password(v) }));
      if (touched.confirm)
        setErrors((p) => ({ ...p, confirm: validate.confirm(confirm, v) }));
    } else {
      setConfirm(v);
      if (touched.confirm)
        setErrors((p) => ({ ...p, confirm: validate.confirm(v, password) }));
    }
  };

  const markTouched = (field: keyof Touched) => () =>
    setTouched((p) => ({ ...p, [field]: true }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-black">
      <div className="mx-auto flex min-h-screen items-center justify-center p-6">
        {/* 브라우저 기본 툴팁/차단 비활성화 */}
        <form
          noValidate
          onSubmit={handleSubmit}
          className="w-full max-w-md rounded-2xl border border-zinc-200/60 bg-white/70 p-6 shadow-xl backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/60 sm:p-8"
        >
          <div className="mb-6 text-center">
            <h1 className="bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-900 bg-clip-text text-2xl font-semibold text-transparent dark:from-zinc-100 dark:via-zinc-300 dark:to-zinc-100">
              회원가입
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              이메일과 비밀번호로 계정을 만들어 보세요
            </p>
          </div>

          <div className="space-y-4">
            {/* 이메일 */}
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                이메일
              </span>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => handleFieldChange('email')(e.target.value)}
                onBlur={markTouched('email')}
                aria-invalid={Boolean(touched.email && errors.email)}
                aria-describedby="email-error"
                className={[
                  'block w-full rounded-lg border bg-white px-3 py-2 text-zinc-900 placeholder:text-zinc-400 outline-none transition dark:bg-zinc-900 dark:text-zinc-100',
                  touched.email && errors.email
                    ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500'
                    : 'border-zinc-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-zinc-700',
                ].join(' ')}
              />
              {touched.email && errors.email ? (
                <p id="email-error" className="mt-1 text-sm text-red-600">
                  {errors.email}
                </p>
              ) : null}
            </label>

            {/* 비밀번호 */}
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                비밀번호
              </span>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => handleFieldChange('password')(e.target.value)}
                onBlur={markTouched('password')}
                aria-invalid={Boolean(touched.password && errors.password)}
                aria-describedby="password-error"
                className={[
                  'block w-full rounded-lg border bg-white px-3 py-2 text-zinc-900 placeholder:text-zinc-400 outline-none transition dark:bg-zinc-900 dark:text-zinc-100',
                  touched.password && errors.password
                    ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500'
                    : 'border-zinc-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-zinc-700',
                ].join(' ')}
              />
              {touched.password && errors.password ? (
                <p id="password-error" className="mt-1 text-sm text-red-600">
                  {errors.password}
                </p>
              ) : null}
            </label>

            {/* 비밀번호 확인 */}
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                비밀번호 확인
              </span>
              <input
                type="password"
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => handleFieldChange('confirm')(e.target.value)}
                onBlur={markTouched('confirm')}
                aria-invalid={Boolean(touched.confirm && errors.confirm)}
                aria-describedby="confirm-error"
                className={[
                  'block w-full rounded-lg border bg-white px-3 py-2 text-zinc-900 placeholder:text-zinc-400 outline-none transition dark:bg-zinc-900 dark:text-zinc-100',
                  touched.confirm && errors.confirm
                    ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500'
                    : 'border-zinc-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-zinc-700',
                ].join(' ')}
              />
              {touched.confirm && errors.confirm ? (
                <p id="confirm-error" className="mt-1 text-sm text-red-600">
                  {errors.confirm}
                </p>
              ) : null}
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? '가입 중...' : '회원가입'}
          </button>

          <div className="my-6 flex items-center gap-3 text-zinc-400">
            <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
            <span className="text-xs">또는</span>
            <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
          </div>

          <button
            type="button"
            onClick={onGoogleSignup}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google로 계속하기
          </button>

          <div className="mt-6 flex flex-col gap-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
            <div>
              이미 계정이 있나요?{' '}
              <Link
                href="/login"
                className="font-medium text-blue-600 underline-offset-2 hover:underline dark:text-blue-500"
              >
                로그인
              </Link>
            </div>
            <Link
              href="/login/find-account"
              className="font-medium text-zinc-600 underline-offset-2 hover:underline dark:text-zinc-400"
            >
              계정 찾기
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
