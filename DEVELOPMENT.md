## 기술 스택

### Core Framework

- **Next.js 16.0.0** - App Router, React Compiler 활성화
- **React 19.2.0**
- **TypeScript 5** - Strict 모드

### Backend & Database

- **Supabase** - 인증 및 데이터베이스
  - `@supabase/supabase-js` (v2.76.1)
  - `@supabase/auth-helpers-nextjs` (v0.10.0)

### Styling

- **Tailwind CSS 4** - 유틸리티 기반 스타일링

### Development Tools

- **ESLint 9** - Flat Config, 경고 0개 강제
- **Husky** - pre-commit hook으로 lint + type check 실행

## 코딩 컨벤션

### 1. 디렉토리 구조

- `src/app/` - Next.js App Router 페이지 및 라우트
  - `components/` - 공유 컴포넌트
  - `lib/` - 유틸리티 및 클라이언트 설정
- `src/types/` - TypeScript 타입 정의
- `src/styles/` - 전역 스타일

### 2. TypeScript

- 객체 타입 정의 시 `interface` 우선 사용
- 타입만 import 시 `import type` 사용
- Strict 모드 활성화 (any 사용 금지)
- 환경 변수 등 확실한 경우에만 non-null assertion(`!`) 사용
- Optional chaining(`?.`), nullish coalescing(`??`) 적극 활용

### 3. Import

- 절대 경로 사용: `@/`로 시작 (`@/*` → `./src/*`)
- Import 순서: React → Next.js → 외부 라이브러리 → 내부 모듈 → 타입

### 4. React 컴포넌트

- 함수 선언 방식 사용: `export default function ComponentName()`
- 클라이언트 컴포넌트는 파일 최상단에 `'use client'` 명시
- `useEffect`에서 구독 등 사용 시 cleanup 함수 필수 작성

### 5. Supabase

- `@/app/lib/supabase.ts`의 `supabase()` 함수 사용
- Supabase 클라이언트에 `Database` 타입 제네릭 적용
- 데이터베이스 스키마 변경 시 `npm run types:gen`으로 타입 재생성 필수

### 6. 스타일링

- Tailwind CSS 유틸리티 클래스를 인라인 `className`으로 사용
- 조건부 스타일은 배열 + `join(' ')` 패턴 사용
- 다크 모드는 `dark:` 접두사 활용

### 7. 코드 포맷팅

- 인덴트: 2 스페이스
- 따옴표: 싱글 쿼트(`'`)
- 세미콜론: 항상 사용
- 주석: 한글 허용

### 8. Git 커밋

- pre-commit hook으로 자동 lint + type check 실행
- ESLint 경고 0개, TypeScript 에러 0개 필수

## 개발 워크플로우

### 환경 설정

- 환경 변수 설정: `.env.local` 파일에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 추가

### 주요 명령어

- `npm run dev` - 개발 서버 실행 (포트 3001)
- `npm run build` - 프로덕션 빌드
- `npm run lint` - ESLint 검사
- `npm run lint:fix` - ESLint 자동 수정
- `npm run type` - TypeScript 타입 체크
- `npm run check` - lint + type 검사 (pre-commit과 동일)
- `npm run types:gen` - Supabase 타입 재생성

## 주의사항

- 커밋 전 `npm run check` 통과 필수
- `any` 사용 금지, 명시적 타입 지정
- 민감 정보는 환경 변수로 관리
- Supabase 스키마 변경 시 타입 재생성 필수
- 재사용 컴포넌트는 `src/app/components/`에 위치
- 공통 타입은 `src/types/`에 별도 파일로 관리
