# OnTime Developer Web — 커밋 기반 보고 도구 설계

- 날짜: 2026-08-14
- 상태: 승인 대기
- 작업 브랜치: main (현재 브랜치에서 진행)
- 목업: `.superpowers/brainstorm/20362-1786713547/content/` (app-shell, chatbot, dashboard, commits, report, light-theme)

## 개요

로그인한 개발자 본인의 커밋을 조회하고, webLLM(브라우저 로컬 LLM)으로 일일/주간
보고서를 생성하는 도구. 전 페이지에서 고객지원 챗봇 사용 가능.

백엔드 API는 커밋 등록/조회 2개뿐이므로 (`~/Downloads/ontime-developer-apis.json`),
대시보드 통계와 보고서는 모두 커밋 목록 조회를 기반으로 클라이언트에서 처리한다.
보고서 저장 API는 없다 — 생성 결과는 화면 표시 + 클립보드 복사만 지원.

## 라우팅

| Route | 내용 |
|---|---|
| `/` | `/dashboard` 로 redirect |
| `/dashboard` | 대시보드 |
| `/commits` | 커밋 목록 |
| `/reports/daily` | 일일 보고 |
| `/reports/weekly` | 주간 보고 |

기존 `/login`, `/logout`, `/api/**` proxy 는 그대로 유지.

## 구조

`docs/agents/structure.md` 절차에 따라 신규 도메인 추가:

```
src/domain/commits/
  apis/commits.ts        # GET /v1/developers/commits (ky, 공유 api 인스턴스)
  apis/commits.dto.ts    # CommitResponse, CommitSearchRequest, PagedModel
  queries/commits.tsx    # useInfiniteQuery 기반 목록, 기간 조회 query
  components/            # CommitListItem, CommitFilterBar 등
src/shared/components/chatbot/   # 전역 챗봇 (FAB + 팝업 패널)
```

페이지별 sub-component 는 structure.md 의 "Page sub-components" 규칙을 따른다.

## API 연동

- 사용 엔드포인트: `GET /v1/developers/commits` (기존 `/api/[...path]` proxy 경유)
- 쿼리 파라미터: `repo`, `branch`, `author`, `commitMessage`, `createdDateFrom`,
  `createdDateTo`, `page`, `size`, `sort` (기본 `createdDate,desc`)
- **author 는 로그인 사용자로 자동 고정** — 모든 화면(목록/대시보드/보고서) 공통
- 커밋 목록: `useInfiniteQuery` + 기존 `useInfinityScroll` 훅으로 무한 스크롤
- 대시보드: 최근 2주 범위를 `size=1000` 1회 조회 후 클라이언트 계산
  (ponytail: 커밋 2주 1000건 초과 시 통계가 잘림 — 집계 API 생기면 교체)
- 사용자 아바타: `api/v1/users/{id}/avatar`, 404 시 이니셜 fallback
  (기존 `UserAvatar.tsx` 재사용/보강)

## 화면 설계 (목업 합의 완료)

### 앱 셸 — 상단 헤더 통합 nav

- 헤더: 로고 + "OnTime Developer" (클릭 → `/`), nav 4메뉴(대시보드/커밋 목록/
  일일 보고/주간 작업 보고), ThemeSwitcher, 사용자 아바타 드롭다운(로그아웃)
- 모바일: nav 가 햄버거 메뉴(드로어)로 전환
- 사이드바 없음 (메뉴 4개뿐 — 사이드바는 과함)

### 전역 챗봇 — 플로팅 버튼 + 팝업 패널

- 우하단 FAB, 클릭 시 채팅 패널 (모바일은 풀스크린)
- root layout 에 배치해 전 페이지 노출
- 역할: 사이트 사용법 안내 (정적 시스템 프롬프트, 데이터 연동 없음)
- 패널 내부에서 모델 로딩 progress / 미지원 브라우저 안내 처리

### 대시보드

- "이번주" 기준: 월요일 시작 (월 00:00 ~ 일 23:59:59, 로컬 타임존)
- 스탯 타일: 이번주 커밋 수(+ 지난주 대비 증감), 이번주 최다 커밋 repo + 브랜치
- 일일 커밋 수 막대 차트 (최근 7일, 월~일)
- 이번주 repo 별 커밋 분포 (가로 막대)
- 보고서 바로가기 카드 (일일/주간 보고 페이지로 이동)
- 최근 커밋 5건 리스트 + "전체 보기 →" (`/commits`)

### 커밋 목록

- 필터 바: 커밋 메시지 검색, repo(텍스트 입력), branch(텍스트 입력),
  날짜 범위, 초기화 — API 파라미터와 1:1 대응
- 행: 커밋 메시지(bold) + repo/branch 태그 + 해시 + 작성일시
- 무한 스크롤 (`useInfinityScroll` 재사용)

### 일일 보고 / 주간 보고 (동일 구조)

- 상단: 기간 선택 + "보고서 생성" 버튼
  - 일일: 날짜 1개 선택 → 해당일 00:00 ~ 23:59:59 커밋 (로컬 타임존, dayjs)
  - 주간: 날짜 1개 선택 → 그 날짜가 속한 주(월 00:00 ~ 일 23:59:59)로 해석,
    선택 UI 에 "2026-08-11 ~ 2026-08-17" 형태로 범위 표시
- 좌측: 해당 기간 커밋 목록 / 우측: 생성 결과 (스트리밍 표시) + 복사 버튼
- 생성은 사용자가 버튼을 눌러야 시작 (자동 생성 없음)
- 결과 저장 없음 — 화면 표시 + 클립보드 복사만
- 커밋 0건: 빈 상태 안내 + 생성 버튼 비활성

### 보고서 출력 형식 (시스템 프롬프트에 고정)

```
## {repo}

### {LLM 이 분류한 주제}

- 커밋 메시지
- 커밋 메시지
```

- repo 별 `##` 섹션, 그 아래 LLM 이 커밋을 주제별로 묶어 `###` 소제목 부여
- 커밋 메시지는 불릿으로 나열 (prefix 제거 등 정제는 LLM 재량)
- 주간 보고도 동일 형식

## webLLM

- 기존 `useWebLlm` / `engine.ts` (`Qwen2.5-1.5B-Instruct-q4f16_1-MLC`) 재사용
- 이번 작업에 포함할 훅 정리:
  - unsupported 분기(Chrome 아님)에서 `status` 가 `'loading'` 에 머무는 문제 수정
    — `status: 'unsupported'` 로 통일하고 `isSupport` state 는 제거
    (판별은 `status === 'unsupported'` 하나로)
  - 스트리밍 루프의 `console.log` 제거
  - 보고서용으로 messages 히스토리 없이 1회성 completion 이 필요 — 반환값에
    단건 스트리밍 콜백 지원 추가 (챗봇은 기존 messages 방식 유지)
- 로딩 UI: 최초 로딩 시 progress 바 (챗봇 패널 / 보고서 페이지), 완료 전
  생성/전송 버튼 비활성
- 미지원 브라우저: 챗봇 패널과 보고서 생성 영역에 안내 문구
  ("이 브라우저는 AI 기능을 지원하지 않습니다. Chrome 사용 권장") —
  커밋 조회 등 나머지 기능은 정상 동작

## 테마

- daisyUI 커스텀 테마 2개: `ontime-dark` / `ontime-light`
- 기존 `data-theme` 쿠키 + `setTheme` server action 방식 유지 (`libs/theme.md`)
- 다크: `docs/design/spotify-design.md` 그대로 — 배경 `#121212`, 서피스
  `#181818`/`#1f1f1f`, 액센트 `#1ed760`, pill 버튼, 헤비 섀도
- 라이트: 배경 `#fafafa`, 서피스 `#ffffff`, 액센트 `#169c46` (대비 확보),
  옅은 섀도 (`rgba(0,0,0,.08)`)

## i18n

- 신규 문자열은 `ko.json` / `en.json` 둘 다 추가 (next-intl v4 패턴 유지)

## 에러 처리

- API 에러: 기존 toast 패턴으로 표시
- 아바타 404: fallback 이니셜 아바타
- 보고서 생성 중 페이지 이탈: 허용 (저장 없음, 재생성 가능)

## 검증

- 테스트 스크립트 없는 프로젝트 — `yarn lint` + `yarn build` 통과 + 수동 검증
- 수동 검증 체크리스트: 4개 라우트 렌더, 필터/무한 스크롤, 일일/주간 보고 생성,
  챗봇 대화, 테마 전환(다크/라이트), 모바일 햄버거, 미지원 브라우저 안내
  (Safari 등에서 확인)

## 범위 제외 (YAGNI)

- 보고서 저장/이력 (API 없음)
- 커밋 등록 UI (POST 는 CLI 용도로 판단)
- repo/branch 드롭다운 (값 목록 API 없음 — 텍스트 입력)
- 챗봇의 커밋 데이터 연동 (사용법 안내만)
