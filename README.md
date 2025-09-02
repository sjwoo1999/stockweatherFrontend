# StockWeather 📈

> **"1초만에 확인하는 투자 전망"**  
> 개인에게 최적화된 투자 정보를 요약하고 분석하여 제공하는 AI 기반 투자 정보 SaaS

---

## 🌟 Why StockWeather?

### 💡 우리가 해결하는 문제

현대 개인 투자자들이 마주하는 핵심 문제들:

#### 🌊 **정보 과부하**
- 하루에 쏟아지는 수천 건의 투자 관련 정보
- 개인이 모든 정보를 소화하기 불가능한 상황
- 중요한 정보와 노이즈를 구분하기 어려움

#### 🎭 **신뢰도 문제** 
- 사설 토론방, 종목 추천방의 자극적이고 선동적인 정보
- 유튜브, 블로그 등 검증되지 않은 투자 조언
- 홍보성 콘텐츠와 객관적 분석의 구분 어려움

#### 📚 **분석의 복잡성**
- 금융 상품의 고도화와 복잡성 증가
- 글로벌 경제 상황의 실시간 변화
- 개인 투자자의 시간적, 전문적 한계

#### 🎯 **핵심 문제**
> *"현명한 투자를 위해 개인의 투자 성향에 맞는 정보를 올바르게 선별하고 해석해야 하지만,  
> 전업 투자자가 아닌 개인이 이를 체계적으로 수행하기는 매우 어렵다"*

---

## 🎯 우리의 솔루션

### 🏆 **StockWeather의 약속**
**개인 포트폴리오에 필요한 핵심 정보만 수집, 요약, 전달하여 고객의 시간을 절약합니다**

### 👥 **타겟 고객 페르소나**

**김나영 (27세, 직장인 1년차)**
- **투자 성향**: 장기적 관점의 신중한 투자
- **Pain Points**:
  - ⏰ 방대한 투자 정보를 소화할 시간 부족
  - 🤔 선동적 정보와 객관적 정보의 구분 어려움  
  - 📋 일관된 투자 판단 기준 설정의 어려움
- **Needs**: 포트폴리오 최적화된 신뢰성 높은 정보를 간결하게

### 🚀 **3단계 솔루션 로드맵**

#### **1단계: 개인 투자 성향 분석** 🔍
- **데이터 수집**: 나이, 직업, 투자 경력, 보유 종목 수 종합 분석
- **성향 산출**: AI 기반 개인별 투자 프로필 생성
- **활용**: 맞춤형 정보 제공 기준 및 유사 성향 커뮤니티 구축

#### **2단계: AI 기반 정보 분석** 🤖
- **신뢰성 확보**: 공인된 출처의 정보만 선별적 크롤링
- **시각적 요약**: 복잡한 재무 정보를 직관적으로 시각화
- **심층 분석**: AI가 생성한 투자 리포트 제공
- **피드백 학습**: 사용자 평가를 통한 개인 성향 실시간 업데이트

#### **3단계: 맞춤형 투자 전망** 📊
- **다중 시간축 전망**: 30일/분기/반기/1년 단위 전망 제시
- **개인화 추천**: 투자 성향 기반 상품 및 정보 추천
- **커뮤니티**: 유사 성향 사용자의 포트폴리오 및 리포트 공유

---

## 💻 현재 개발 상황

### ✅ **Phase 1: 핵심 인프라 구축 완료**

#### 🔐 **사용자 인증 시스템**
- 카카오 소셜 로그인 통합
- JWT 기반 보안 인증 (쿠키 기반으로 보안 강화)
- 사용자 세션 관리 및 자동 리다이렉트

#### 🎨 **사용자 인터페이스**
- 직관적인 대시보드 설계
- 실시간 종목 검색 (자동완성)
- 모바일 최적화 반응형 디자인
- 개인 프로필 및 검색 기록 관리

#### ⚡ **실시간 통신 인프라**
- Socket.IO 기반 실시간 분석 진행 상황 전달
- 연결 안정성 및 자동 재연결 시스템
- 분석 상태 실시간 모니터링

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

#### 🤖 **AI 분석 엔진 (MVP)**
- 종목별 공시 정보 실시간 크롤링
- AI 기반 정보 요약 및 분석
- 사용자별 분석 결과 전달 시스템

---

### 🚧 **Phase 2: 개인화 시스템 (진행 중)**

#### 📊 **투자 성향 분석 시스템**
- 사용자 프로필 데이터 수집 및 분석
- AI 기반 투자 성향 분류 알고리즘
- 개인별 맞춤형 정보 필터링

#### 📈 **고도화된 분석 기능**  
- 다중 시간축 투자 전망 (30일/분기/반기/1년)
- 포트폴리오 최적화 제안
- 리스크 분석 및 경고 시스템

#### 🎨 **UX 개선**
- 분석 결과 시각화 대시보드
- 인터랙티브 차트 및 그래프
- 모바일 앱 지원

---

### 🔮 **Phase 3: 커뮤니티 & 고도화 (계획)**

#### 👥 **투자자 커뮤니티**
- 유사 성향 투자자 매칭
- 포트폴리오 공유 및 벤치마킹
- 전문가 리포트 구독 서비스

#### 🔔 **알림 & 자동화**
- 개인화된 투자 알림
- 시장 변동 실시간 알림
- 자동 리포트 생성 및 전달

#### 📱 **플랫폼 확장**
- PWA (Progressive Web App) 지원
- 모바일 네이티브 앱
- API 서비스 제공

---

## 🏗️ **기술적 세부사항**

### 🔧 **현재 기술적 성과**

#### **보안 & 인프라**
- JWT 쿠키 기반 인증으로 XSS 방어력 향상
- Socket.IO 연결 안정성 개선 (자동 재연결, 상태 모니터링)
- 실시간 에러 처리 및 사용자 피드백 시스템

#### **성능 최적화**
- Next.js 15 최신 기능 활용 (React 19 지원)
- 이미지 최적화 및 코드 스플리팅
- API 호출 최적화 (중복 요청 방지, 캐싱)

#### **코드 품질**
- TypeScript 기반 타입 안전성 보장
- 컴포넌트 재사용성 향상 (Design System)
- Context API 기반 효율적 상태 관리

### 🎯 **단기 개발 목표 (Q1 2025)**
- ✅ 사용자 투자 성향 분석 시스템 구축
- ✅ AI 분석 결과 시각화 고도화  
- ✅ 다중 시간축 전망 기능 개발
- ✅ 모바일 최적화 완료

### 🔮 **장기 비전 (2025~)**
- 💡 **AI 고도화**: GPT-4 기반 심층 분석 및 예측
- 📊 **빅데이터**: 시장 데이터 통합 분석 플랫폼
- 🌐 **글로벌**: 해외 주식 시장 확장
- 🤝 **B2B**: 금융 기관 대상 API 서비스

---

## 📈 **비즈니스 모델 & 시장 전략**

### 💰 **수익 모델**
- **Freemium**: 기본 분석 무료, 심화 기능 유료
- **구독제**: 월간/연간 프리미엄 서비스
- **API**: B2B 파트너사 대상 데이터 제공
- **커뮤니티**: 프리미엄 투자자 네트워크 멤버십

### 🎯 **경쟁 우위**
1. **개인화**: 투자 성향 기반 맞춤형 정보 제공
2. **신뢰성**: 공인된 출처만 활용한 검증된 정보
3. **실시간**: Socket.IO 기반 즉시 분석 결과 전달
4. **접근성**: 복잡한 금융 정보를 직관적으로 시각화

### 📊 **목표 지표**
- **2024 Q4**: MVP 출시, 1,000명 베타 사용자
- **2025 Q2**: 10,000명 활성 사용자, 프리미엄 전환율 5%
- **2025 Q4**: 50,000명 사용자, B2B 파트너십 3개

---

## 🚀 **개발 환경 & 배포**

### 📋 **필수 요구사항**
- Node.js 18+
- npm/yarn/pnpm

### ⚙️ **설치 및 실행**
```bash
# 의존성 설치
npm install

# 개발 서버 실행 (포트 3001)
npm run dev

# 프로덕션 빌드
npm run build && npm start

# 코드 품질 검사
npm run lint
```

### 🔑 **환경 변수 설정**
```env
# 카카오 소셜 로그인
NEXT_PUBLIC_KAKAO_CLIENT_ID=your_kakao_client_id
NEXT_PUBLIC_KAKAO_LOGOUT_REDIRECT_URI=http://localhost:3001/login

# 백엔드 API 서버
NEXT_PUBLIC_API_BASE_URL=your_api_server_url
NEXT_PUBLIC_SOCKET_URL=your_websocket_server_url
```

### 🌐 **배포 전략**
- **개발**: localhost:3001 (현재)
- **스테이징**: Vercel/Netlify 배포
- **프로덕션**: AWS/GCP 클라우드 인프라

---

## 👥 **팀 & 기여**

### 🤝 **기여 방법**
1. 저장소 Fork
2. 기능 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 변경사항 커밋 (`git commit -m 'feat: add amazing feature'`)
4. 브랜치 Push (`git push origin feature/amazing-feature`)
5. Pull Request 생성

### 📞 **연락처**
- 📧 Email: contact@stockweather.com
- 💼 LinkedIn: StockWeather Official
- 🐦 Twitter: @StockWeather_AI

---

## 📄 **라이센스 & 법적 고지**

본 프로젝트는 MIT 라이센스 하에 있습니다.

**⚠️ 투자 유의사항**: StockWeather가 제공하는 정보는 투자 참고용이며, 투자 결정에 대한 책임은 전적으로 사용자에게 있습니다.

---

<div align="center">

### 🌟 **StockWeather**
> *"1초만에 확인하는 투자 전망"*

**개인 맞춤형 AI 투자 분석 서비스**

[![Next.js](https://img.shields.io/badge/Next.js-15.1.8-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)

</div>
