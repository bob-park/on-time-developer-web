# OnTime Developer Web v2 — UI 개선 설계

- 날짜: 2026-08-14
- 상태: 승인됨 (목업 합의 완료)
- 작업 브랜치: feature/weeks-job-summary (현재 브랜치)
- 선행 스펙: `2026-08-14-ontime-developer-web-design.md` (v1 구현 완료 상태에서의 수정)
- 목업: `.superpowers/brainstorm/28529-1786718684/content/` (header-controls, mobile-drawer, report-format)

## 범위

v1 구현에 대한 UI 개선 + 버그 수정. 신규 dependency 는 antd 관련 2개만 허용.

## 1. 헤더 — 언어/테마 선택 (아이콘 버튼)

- `LanguageSwitcher` 재작성: 🌐(globe) 아이콘 원형 고스트 버튼 + daisyUI dropdown.
  항목 "한국어" / "English", 현재 로케일에 ✓ 표시. 기존 locale server action 그대로 사용.
- `ThemeSwitcher` 재작성: 아이콘 원형 고스트 버튼 1개. 현재 dark 면 ☀️(라이트로 전환),
  light 면 🌙(다크로 전환) 표시 — 클릭 한 번으로 토글. 기존 `setTheme` server action 유지.
- 아이콘은 인라인 SVG (heroicons 스타일) — 이모지/아이콘 라이브러리 추가 금지.

## 2. 헤더 — 아바타 영역

- 헤더 우측: `[아바타] 이름` 형태의 버튼 (원형 아바타 + 이름 텍스트).
- 드롭다운:
  - 상단: `이름` (bold) + `@userId` (muted). userId 는 better-auth 세션 user 에서
    가져오되, 필드가 없으면 email 의 `@` 앞부분을 fallback 으로 사용.
  - 구분선.
  - `로그아웃` 항목 (logout 아이콘 SVG + 텍스트, `/logout` 링크).

## 3. Footer 제거

- `src/app/layout.tsx` 에서 `<Footer />` 제거, `src/app/_layouts/Footer.tsx` 삭제.

## 4. 모바일 네비 — daisyUI Drawer

- 기존 모바일 드롭다운 제거, daisyUI `drawer` 로 교체.
- 구조: root layout 을 `drawer` 로 감싼다 — `drawer-content` 에 Header+본문,
  `drawer-side` 에 메뉴 패널. 햄버거 버튼(`drawer` checkbox label)은 Header 좌측,
  `lg:hidden` 이 아닌 기존과 동일하게 `md:hidden`.
- 드로어 패널 (`w-72 bg-base-200`):
  - 상단: 로고 + "OnTime Developer"
  - 메뉴 4개: 아이콘 + 라벨, active 항목은 `bg-primary text-primary-content` 필
  - 하단 (mt-auto, 구분선): 아바타 + 이름 + 로그아웃 링크
- 라우트 변경 시 자동 닫힘: 드로어 상태는 checkbox — client component 에서
  `usePathname` 변화를 감지해 checkbox 를 해제한다. 오버레이 탭 닫힘은 daisyUI 기본.

## 5. Date Picker — antd

- 신규 dependency: `antd` (v6 — React 19 네이티브 지원이라 별도 패치 불필요).
  antd 는 dayjs 기반 — 기존 dayjs 와 호환.
- 적용 위치:
  - 일일 보고: `DatePicker` (single) — 기존 `<input type="date">` 교체
  - 주간 보고: `DatePicker picker="week"` — 주 선택 UX 를 antd 위크 피커로
  - 커밋 목록 필터: `DatePicker.RangePicker` — from/to input 2개 교체
- 테마 연동: `AntdProvider` (client) 를 만들어 `ConfigProvider` 로 감싼다.
  - dark 테마면 `theme.darkAlgorithm`, light 면 default algorithm
  - `colorPrimary`: dark `#1ed760` / light `#169c46`
  - 현재 테마는 root layout 이 읽는 `data-theme` 쿠키 값을 props 로 전달
- SSR: antd v5 + App Router 는 `@ant-design/nextjs-registry` 없이도 동작하지만
  스타일 플리커가 보이면 registry 추가를 검토 (구현 중 판단, 기본은 미추가).

## 6. 대시보드 차트 버그 수정

- 증상: "일일 커밋 수" 막대가 렌더링되지 않음.
- 원인: 막대의 `height: N%` 가 높이 auto 인 컬럼 flex div 안에 있어 0 으로 계산됨.
- 수정: 각 컬럼에서 막대를 고정 높이 래퍼로 감싼다 —
  `<div className="flex h-24 w-full items-end"><div style={{height: '...%'}} .../></div>`
  (카운트/요일 라벨은 래퍼 밖 유지).

## 7. 보고서

- ko 명칭 변경: nav/페이지 타이틀 "주간 작업 보고" → "주간 보고" (en 은 그대로).
- 시스템 프롬프트 변경 (ReportPanel `SYSTEM_PROMPT`):
  - repo 별 `##`, 작업 단위 `###` 그룹 — 유지
  - 그룹 하위 불릿: 커밋 메시지 나열 대신 **작업 내용을 1~2문장으로 요약한 설명**
  - 예시:
    ```
    ## bob-park/on-time-developer-web

    ### Web LLM 기능 구현

    - 브라우저 내에서 동작하는 WebLLM 을 도입하고, 미지원 브라우저 감지를 추가하여 AI 기능 기반을 마련
    ```

## 에러/엣지

- antd RangePicker 클리어 시 from/to `undefined` 전달 (기존 `usePeriodCommits`
  invalid 가드와 `toSearchParams` 의 undefined 드롭이 그대로 동작).
- 일일/주간 DatePicker 는 `allowClear={false}` 로 빈 값 자체를 차단 (기본값 오늘/이번주).

## 검증

- `yarn lint` + `yarn build` + 수동 확인 (모바일 드로어, antd 픽커 라이트/다크,
  차트 막대 표시, 보고서 형식).

## 범위 제외

- 데스크톱 nav 구조 변경 없음. 챗봇/대시보드 위젯 구성 변경 없음.
- antd 는 DatePicker 용도로만 사용 — 다른 컴포넌트로 확산 금지.
