# OnTime Developer Web v3 — UI 폴리시 + 모델 선택 설계

- 날짜: 2026-08-15
- 상태: 승인됨 (사용자 요구사항 + 터미널 문답으로 확정)
- 작업 브랜치: feature/weeks-job-summary
- 선행: v1/v2 스펙 (`2026-08-14-*.md`)

## 1. 헤더

### 아바타 영역
- `[아바타] 이름` 버튼의 width 확대: 좌우 패딩/갭 증가 (`gap-2 py-1.5 pr-4 pl-1.5`),
  이름 `text-base`. 드롭다운 폭 `w-52` → `w-60`.

### 언어 셀렉트
- 버튼에 **현재 선택된 언어가 보이게**: 지구본 아이콘 대신
  `[국기] 라벨` 형태 (예: `🇰🇷 한국어`) — 원형 버튼 → 필형 고스트 버튼.
- 드롭다운 항목 앞에 국기 이모지 표시: `🇰🇷 한국어` / `🇺🇸 English`, 현재 언어 ✓ 유지.

## 2. 대시보드 막대 차트
- 막대 최대 폭 40px: 막대 div 에 `max-w-10` (Tailwind 10 = 2.5rem = 40px) 추가,
  컬럼 내 중앙 정렬 유지 (고정 높이 래퍼에 `justify-center`).

## 3. 커밋 목록 아이템
- 메타 표시 순서: **repo → branch → author → commitId → createdDate**
- badge 표현: repo(기존 유지), **branch**, **author** — `badge badge-sm badge-ghost`
- commitId(7자 mono), createdDate 는 기존 plain 텍스트

## 4. AI 모델 선택
- 모델 목록: `engine.ts` 의 `supportEngines` (사용자 정의 Qwen 6종) 사용,
  기본값 `DEFAULT_MODEL_ID` (Qwen2.5-3B).
- 선택값은 전역 공유 — zustand slice (`llm`) 를 rootStore 에 등록:
  `{ llmModelId: string, setLlmModelId(id) }`.
- 선택 UI (`ModelSelect`, daisyUI `select select-sm`): **챗봇 패널 헤더** +
  **일일/주간 보고 페이지 상단** 에 배치. `displayName` 표시. 로딩/스트리밍 중 disabled.
- 모델 변경 시: 엔진 재생성 (기존 worker terminate 후 새로 로드), status 는
  `loading` 부터 다시 진행.

### progress 미동작 버그 수정 (일일/주간 보고)
- 원인: `getEngine` 이 최초 호출자의 `onProgress` 만 `initProgressCallback` 에
  등록 — 챗봇(루트 레이아웃)이 먼저 잡으면 보고 페이지 훅은 업데이트를 못 받음.
- 수정: engine 모듈에 **구독자 Set** 도입 — `subscribeProgress(cb): unsubscribe`.
  모든 `useWebLlm` 인스턴스가 mount 시 구독, initProgressCallback 은 Set 전체에
  브로드캐스트. 로드 완료/실패 상태도 같은 방식으로 전파해 어느 페이지에서든
  progress 와 ready 전환이 보이게 한다.

## 5. 챗봇 열림/닫힘 애니메이션
- 패널을 항상 mount 하고 클래스 토글로 전환:
  - 열림: 아래→위 슬라이드 + 페이드 인
  - 닫힘: 위→아래 슬라이드 + 페이드 아웃
- 구현: `transition-all duration-300`, 닫힘 상태 `translate-y-6 opacity-0
  pointer-events-none invisible` (모바일 풀스크린은 `max-sm:translate-y-full`).
  `visible/invisible` 로 닫힌 상태에서 포커스/스크린리더 노출 차단.

## 6. 보고서 (일일/주간 공통)
- 시스템 프롬프트 강화:
  - `fix:`, `feat:` 등 prefix 제거 (기존 규칙 유지·강조)
  - 작업 그룹(###) 명칭은 더욱 간결하게 (예: 2~6단어)
  - 각 작업 내용 불릿은 **최대 20자 이내**
- 출력 UI: 마크다운을 HTML 로 렌더 — 신규 dependency 없이 보고서 형식
  전용 경량 렌더러 `ReportMarkdown` 컴포넌트 작성
  (`##`→h2, `###`→h3, `- `→ul/li, 그 외 줄→p; 스트리밍 중에도 동작).
- **복사는 raw 마크다운 유지** (state 의 원본 문자열 복사 — 기존 동작).

## 7. 주간 보고 기간 문구
- 주 선택 시 표시:
  - 주차 라벨: `YYYY-MM N주차` — N = 해당 주 월요일 기준 `Math.ceil(date/7)`
  - 범위: `YYYY-MM-DD (ddd) - YYYY-MM-DD (ddd)` (요일은 dayjs 로케일 따름)

## 검증
- `yarn lint` + `yarn build` + 수동 (모델 전환/progress, 애니메이션, 마크다운 렌더,
  주간 문구, badge 순서).

## 범위 제외
- 모델 다운로드 캐시 관리/삭제 UI, 모델별 프롬프트 튜닝, 마크다운 전체 문법 지원.
