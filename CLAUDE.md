# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

MBTI Lab은 Next.js 16과 React 19를 기반으로 한 MBTI 테스트 애플리케이션입니다. Supabase를 백엔드로 사용하며, TypeScript와 Tailwind CSS로 작성되었습니다.

## 개발 환경 설정

### 필수 환경 변수
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase 프로젝트 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon public key

### 주요 명령어

```bash
# 개발 서버 실행 (포트 3001)
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# 린트 검사 (경고 0개 강제)
npm run lint

# 린트 자동 수정
npm run lint:fix

# 타입 체크
npm run type

# 린트 + 타입 체크 (pre-commit에서 실행됨)
npm run check

# Supabase 타입 생성
npm run types:gen
```

## 아키텍처

### 디렉토리 구조

- **`src/app/`**: Next.js App Router 기반 페이지 및 라우트
  - `layout.tsx`: 전역 레이아웃 (Header 포함)
  - `page.tsx`: 홈페이지
  - `login/`: 로그인/회원가입 페이지
  - `mypage/`: 마이페이지
  - `tests/`: MBTI 테스트 관련 페이지
    - `[slug]/`: 동적 라우트 - 특정 테스트
    - `[slug]/play/`: 테스트 진행 페이지
    - `[slug]/result/`: 테스트 결과 페이지
  - `auth-smoke/`: 인증 스모크 테스트 페이지
  - `components/`: 공유 컴포넌트
  - `lib/`: 유틸리티 및 클라이언트 설정
    - `supabase.ts`: Supabase 클라이언트 생성 함수

- **`src/types/`**: TypeScript 타입 정의
  - `supabase.ts`: Supabase 데이터베이스 스키마 타입 (자동 생성됨)
  - `mypage.ts`: 마이페이지 관련 타입

- **`src/styles/`**: 전역 스타일
  - `globals.css`: Tailwind 및 전역 CSS
  - `components.css`: 컴포넌트 전용 CSS

### 기술 스택 특이사항

- **React Compiler**: Next.js에서 실험적 React Compiler 활성화됨 (`next.config.ts`)
- **Supabase Auth Helpers**: `@supabase/auth-helpers-nextjs`를 사용하여 클라이언트 컴포넌트에서 Supabase 인증 처리
- **Path Alias**: `@/*`는 `src/*`로 매핑됨
- **Husky**: pre-commit 훅에서 `npm run check` (lint + type check) 실행

### Supabase 타입 재생성

데이터베이스 스키마가 변경되면 다음 명령어로 타입을 재생성:

```bash
npm run types:gen
```

프로젝트 레퍼런스는 `package.json`의 `config.project_ref`에 정의되어 있습니다.

## 코드 작성 가이드

### Import Path
절대 경로 import 사용: `@/`로 시작 (예: `import { supabase } from '@/app/lib/supabase'`)

### Supabase 클라이언트
클라이언트 컴포넌트에서 Supabase를 사용할 때는 `src/app/lib/supabase.ts`의 `supabase()` 함수를 사용하세요.

### 린트 및 타입 체크
커밋 전에 자동으로 `npm run check`가 실행되므로, 린트 경고나 타입 에러가 있으면 커밋이 차단됩니다.
