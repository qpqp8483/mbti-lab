# MBTI Lab

MBTI 성격 유형 테스트를 제공하는 웹 애플리케이션입니다.

## 기술 스택

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Backend**: Supabase (Authentication, Database)
- **Tooling**: ESLint, Husky

## 시작하기

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (포트 3001)
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

## 주요 기능

- 사용자 인증 (회원가입, 로그인, 로그아웃)
- MBTI 테스트 진행
- 테스트 결과 확인
- 마이페이지

## 개발 명령어

```bash
# 린트 검사 (경고 0개 강제)
npm run lint

# 린트 자동 수정
npm run lint:fix

# 타입 체크
npm run type

# 린트 + 타입 체크
npm run check

# Supabase 타입 생성
npm run types:gen
```

## 프로젝트 구조

```
src/
├── app/
│   ├── components/      # 공유 컴포넌트
│   ├── lib/            # 유틸리티 및 클라이언트 설정
│   ├── login/          # 로그인/회원가입 페이지
│   ├── mypage/         # 마이페이지
│   ├── tests/          # MBTI 테스트 관련 페이지
│   └── layout.tsx      # 전역 레이아웃
├── types/              # TypeScript 타입 정의
└── styles/             # 전역 스타일
```

## 코드 품질

이 프로젝트는 다음을 사용하여 코드 품질을 유지합니다:

- **ESLint**: 코드 스타일 및 잠재적 오류 검사
- **TypeScript**: 정적 타입 검사
- **Husky**: pre-commit 훅으로 커밋 전 자동 검사

커밋 시 자동으로 `npm run check` (lint + type check)가 실행되며, 오류가 있으면 커밋이 차단됩니다.
