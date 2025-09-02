# StockWeather Frontend

**주식 종목에 대한 AI 기반 실시간 분석 서비스**

StockWeather는 사용자가 관심 있는 주식 종목에 대한 공시 정보와 시장 데이터를 AI가 실시간으로 분석하여 인사이트를 제공하는 웹 애플리케이션입니다.

## 📋 프로젝트 개요

### 기획 목표
- **실시간 주식 정보 분석**: 사용자가 선택한 종목의 공시 정보를 AI가 실시간으로 분석
- **직관적인 사용자 경험**: 간단한 검색으로 복잡한 주식 정보를 쉽게 이해할 수 있는 인터페이스 제공
- **개인화된 서비스**: 카카오 로그인을 통한 개인별 맞춤 서비스 및 검색 기록 관리
- **실시간 소통**: WebSocket을 통한 실시간 분석 진행 상황 및 결과 전달

### 핵심 기능
- 🔍 **주식 종목 검색**: 실시간 자동완성 기능을 통한 정확한 종목 검색
- 🤖 **AI 실시간 분석**: 선택된 종목의 공시 정보를 AI가 실시간으로 분석
- 📊 **분석 결과 시각화**: 분석된 내용을 사용자 친화적인 형태로 제공
- 👤 **개인화 서비스**: 카카오 로그인 기반 개인 맞춤 서비스
- 📱 **반응형 디자인**: 모바일 및 데스크톱 환경 모두 지원

## 🛠️ 기술 스택

### 프론트엔드 핵심 기술
- **Next.js 15.1.8**: React 기반 풀스택 프레임워크
- **React 19**: 최신 React 버전으로 향상된 성능과 기능
- **TypeScript**: 타입 안전성 보장
- **Tailwind CSS 3.4.17**: 유틸리티 우선 CSS 프레임워크

### UI/UX 라이브러리
- **@headlessui/react 2.2.4**: 접근성 친화적인 UI 컴포넌트
- **@heroicons/react 2.2.0**: SVG 아이콘 라이브러리
- **React Icons 5.5.0**: 다양한 아이콘 모음
- **Framer Motion 12.12.2**: 애니메이션 및 모션 그래픽

### 실시간 통신 및 HTTP
- **Socket.IO Client 4.8.1**: 실시간 양방향 통신
- **Axios 1.9.0**: HTTP 클라이언트 라이브러리

### 개발 도구
- **ESLint**: 코드 품질 관리
- **PostCSS**: CSS 처리 도구
- **Debug**: 디버깅 유틸리티

## 🏗️ 프로젝트 구조

```
stockweather-frontend/
├── pages/
│   ├── _app.tsx          # 앱 전역 설정
│   ├── index.tsx         # 홈페이지 (자동 리다이렉트)
│   ├── login.tsx         # 로그인 페이지
│   ├── dashboard.tsx     # 메인 대시보드
│   ├── stock-result.tsx  # 분석 결과 페이지
│   └── profile.tsx       # 프로필 관련 페이지들
├── components/
│   ├── Layout.tsx        # 공통 레이아웃
│   ├── Button.tsx        # 공통 버튼 컴포넌트
│   ├── Card.tsx          # 카드 UI 컴포넌트
│   ├── LoadingSpinner.tsx # 로딩 스피너
│   ├── ProtectedRoute.tsx # 인증 보호 라우트
│   └── SocketStatusMonitor.tsx # 소켓 연결 상태 모니터
├── contexts/
│   └── SocketContext.tsx  # Socket.IO 전역 상태 관리
├── services/             # API 서비스 레이어
├── types/               # TypeScript 타입 정의
├── utils/               # 유틸리티 함수들
└── api/                 # API 설정
```

## 🚀 개발 환경 설정

### 필수 요구사항
- Node.js 18+ 
- npm, yarn, pnpm 또는 bun

### 설치 및 실행
```bash
# 의존성 설치
npm install

# 개발 서버 실행 (포트 3001)
npm run dev

# 빌드
npm run build

# 프로덕션 실행
npm start

# 린트 검사
npm run lint
```

### 환경 변수 설정
`.env.local` 파일을 생성하고 다음 환경 변수들을 설정하세요:

```env
# 카카오 로그인 설정
NEXT_PUBLIC_KAKAO_CLIENT_ID=your_kakao_client_id
NEXT_PUBLIC_KAKAO_LOGOUT_REDIRECT_URI=http://localhost:3001/login

# API 서버 설정
NEXT_PUBLIC_API_BASE_URL=your_api_server_url
NEXT_PUBLIC_SOCKET_URL=your_websocket_server_url
```

## 📊 주요 진행 상황

### ✅ 완료된 기능들

#### 🔐 인증 시스템
- 카카오 소셜 로그인 구현 완료
- JWT 토큰 기반 인증 (localStorage → 쿠키 마이그레이션 완료)
- 토큰 유효성 검증 및 자동 리다이렉트
- 보호된 라우트 시스템

#### 🏠 메인 대시보드
- 사용자 프로필 표시 (카카오 프로필 이미지 포함)
- 실시간 주식 종목 검색 (자동완성 기능)
- 최근 검색 기록 관리 (localStorage 활용)
- 반응형 UI 디자인 (모바일 최적화)

#### 🔍 주식 검색 시스템
- 실시간 종목 검색 API 연동
- 자동완성 기능으로 사용자 편의성 향상
- 정확한 종목 선택을 위한 유효성 검증
- 검색 기록 자동 저장 및 관리

#### ⚡ 실시간 통신
- Socket.IO 기반 실시간 분석 진행 상황 전달
- 연결 안정성 개선 (재연결 로직 및 상태 모니터링)
- 분석 진행 메시지 실시간 업데이트
- 소켓 연결 상태 실시간 모니터링

#### 🎨 UI/UX
- Tailwind CSS 기반 현대적인 디자인 시스템
- 브랜드 컬러 및 일관된 디자인 언어
- 로딩 스피너 및 피드백 메시지
- 모바일 친화적인 반응형 디자인

### 🔧 기술적 개선 사항

#### 보안 강화
- JWT 토큰 쿠키 저장으로 XSS 공격 방어력 향상
- HTTP-only 쿠키 적용 검토 중
- CSRF 보호 메커니즘 강화

#### 성능 최적화
- Next.js 15 최신 기능 활용
- 이미지 최적화 (Next.js Image 컴포넌트 활용)
- 코드 스플리팅 및 동적 임포트
- API 호출 최적화 (중복 요청 방지)

#### 연결 안정성
- Socket.IO 연결 상태 실시간 모니터링
- 자동 재연결 메커니즘 구현
- 연결 실패 시 사용자 피드백 개선
- 타임아웃 및 에러 처리 강화

#### 코드 품질
- TypeScript 타입 안전성 강화
- 컴포넌트 재사용성 향상
- 상태 관리 최적화 (Context API 활용)
- 에러 바운더리 및 예외 처리 개선

### 🎯 현재 진행 중인 작업
- 분석 결과 페이지 UI 개선
- 추가적인 사용자 피드백 메커니즘
- 성능 모니터링 및 최적화
- 접근성(a11y) 개선

### 🔮 향후 계획
- PWA 지원 추가
- 다크 모드 지원
- 알림 시스템 구현
- 사용자 설정 관리
- A/B 테스팅 도구 통합

## 🌐 배포 정보

현재 개발 환경에서 포트 3001을 사용하여 실행됩니다.
프로덕션 배포는 추후 업데이트 예정입니다.

## 🤝 기여 방법

1. 이 저장소를 포크합니다
2. 새로운 기능 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

## 📄 라이센스

이 프로젝트는 MIT 라이센스 하에 있습니다.

---

> **StockWeather** - AI가 분석하는 똑똑한 주식 정보 서비스
