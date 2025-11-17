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
    setLoading(false);
    if (error) {
      alert(error.message);
      return;
    }
    alert('가입 완료! 이메일을 확인해 인증을 마쳐주세요.');
    window.location.href = '/login';
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTouched({ email: true, password: true, confirm: true });
    if (!runValidateAll()) return;
    await onSignup();
  };

  const setField = (field: keyof Touched) => (v: string) => {
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
                onChange={(e) => setField('email')(e.target.value)}
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
                onChange={(e) => setField('password')(e.target.value)}
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
                onChange={(e) => setField('confirm')(e.target.value)}
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

          <div className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
            이미 계정이 있나요?{' '}
            <Link
              href="/login"
              className="font-medium text-blue-600 underline-offset-2 hover:underline dark:text-blue-500"
            >
              로그인
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
