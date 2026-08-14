# OnTime Developer Web v3 (UI 폴리시 + 모델 선택) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 헤더/커밋 목록/차트 폴리시, 전역 AI 모델 선택 + progress 브로드캐스트 버그 수정, 챗봇 애니메이션, 보고서 마크다운 렌더 및 프롬프트/주간 문구 개선.

**Architecture:** 기존 구조 유지. 모델 선택은 zustand slice(전역) + engine 모듈의 구독자 Set 리팩터링으로 지원. 마크다운 렌더는 보고서 형식 전용 경량 컴포넌트 (신규 dependency 없음).

**Tech Stack:** 기존 스택 그대로 (신규 dependency 금지)

**Spec:** `docs/superpowers/specs/2026-08-15-ontime-developer-web-v3-design.md`

## Global Constraints

- **신규 dependency 금지** (마크다운 렌더러 포함 — 직접 구현).
- 커밋 전 `yarn lint` 0 errors + `yarn build` 성공 (`ERR_INVALID_URL: '{BETTER_AUTH_URL}'` static-gen 로그는 무시).
- `'use client'` 섹션 주석 순서 (`// ref`→`// state`→`// store`→`// hooks`→`// queries`→`// useEffect`→`// handle`), `cx`(classnames), daisyUI 토큰 우선.
- UI 문자열은 `messages/ko.json` + `messages/en.json` 둘 다.
- 커밋 메시지: 한국어 + prefix.
- `engine.ts` 의 사용자 정의 `supportEngines`/`DEFAULT_MODEL_ID` 는 **그대로 유지** (working tree 에 uncommitted 수정으로 존재 — 해당 태스크 커밋에 포함).
- zustand slice 는 `docs/agents/libs/zustand-slice.md` 의 `SlicePattern` + 기존 `src/domain/users/store/slice.ts` 패턴을 따른다.

---

### Task 1: 헤더 폴리시 (아바타 width + 언어 셀렉트 현재 언어/국기)

**Files:**
- Modify: `src/shared/components/i18n/LanguageSwitcher.tsx` (버튼/항목 부분)
- Modify: `src/app/_layouts/Header.tsx` (아바타 버튼/드롭다운 클래스)

**Interfaces:**
- Consumes: 기존 `DISPLAY_LABEL`, `SUPPORTED_LOCALES`, `setLocale`
- Produces: 없음 (시그니처 불변)

- [ ] **Step 1: `LanguageSwitcher.tsx` 수정** — 파일 상단에 국기 상수 추가, 버튼과 항목 교체. 기존 `DISPLAY_LABEL` 아래에:

```tsx
const FLAG: Record<Locale, string> = { ko: '🇰🇷', en: '🇺🇸' };
```

트리거 버튼(원형 지구본)을 현재 언어가 보이는 필형 버튼으로 교체:

```tsx
<div tabIndex={0} role="button" className="btn btn-ghost h-auto min-h-0 rounded-full px-3 py-1.5" aria-label="change language">
  <span aria-hidden>{FLAG[currentLocale]}</span>
  <span className="text-sm font-bold">{DISPLAY_LABEL[currentLocale]}</span>
</div>
```

(지구본 SVG 는 제거.) 드롭다운 항목의 라벨 부분을 국기 포함으로 교체:

```tsx
<button type="button" className="flex justify-between" onClick={() => handleChange(locale)}>
  <span>
    <span aria-hidden>{FLAG[locale]}</span> {DISPLAY_LABEL[locale]}
  </span>
  {locale === currentLocale && (
    /* 기존 체크 SVG 그대로 유지 */
  )}
</button>
```

- [ ] **Step 2: `Header.tsx` 아바타 버튼 확대** — 트리거의 클래스만 변경:
  `'btn btn-ghost h-auto min-h-0 rounded-full py-1 pr-3 pl-1'` → `'btn btn-ghost h-auto min-h-0 gap-2 rounded-full py-1.5 pr-5 pl-1.5'`,
  이름 `<span className="text-sm font-bold">` → `<span className="text-base font-bold">`,
  드롭다운 `w-52` → `w-60`.

- [ ] **Step 3: `yarn lint` + `yarn build` → 통과**

- [ ] **Step 4: Commit**

```bash
git add src/shared/components/i18n src/app/_layouts/Header.tsx
git commit -m "feat: 언어 셀렉트 현재 언어 표시 및 아바타 영역 확대"
```

---

### Task 2: 대시보드 막대 최대폭 + 커밋 아이템 badge/순서

**Files:**
- Modify: `src/app/dashboard/_components/DashboardContents.tsx` (차트 막대 래퍼/막대 클래스)
- Modify: `src/domain/commits/components/CommitListItem.tsx` (메타 행)

**Interfaces:** 없음

- [ ] **Step 1: 차트 막대 최대폭 40px** — 고정 높이 래퍼와 막대 클래스 수정:

```tsx
<div className="flex h-24 w-full items-end justify-center">
  <div
    className="bg-primary w-full max-w-10 rounded-t"
    style={{ height: `${(day.count / maxDaily) * 100}%`, opacity: day.count === maxDaily ? 1 : 0.55 }}
  />
</div>
```

(`max-w-10` = 2.5rem = 40px, `justify-center` 로 좁아진 막대 중앙 정렬.)

- [ ] **Step 2: `CommitListItem.tsx` 메타 행 교체** — 순서 repo → branch → author → commitId → createdDate, branch/author 를 badge 로:

```tsx
<div className="flex flex-row flex-wrap items-center gap-2 text-xs opacity-70">
  <span className="badge badge-sm badge-ghost">{commit.repo}</span>
  <span className="badge badge-sm badge-ghost">{commit.branch}</span>
  <span className="badge badge-sm badge-ghost">{commit.author}</span>
  <span className="font-mono">{commit.commitId.slice(0, 7)}</span>
  <span>{dayjs(commit.createdDate).format('YYYY-MM-DD HH:mm')}</span>
</div>
```

- [ ] **Step 3: `yarn lint` + `yarn build` → 통과**

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard src/domain/commits/components/CommitListItem.tsx
git commit -m "feat: 차트 막대 최대폭 및 커밋 아이템 badge 정리"
```

---

### Task 3: LLM 인프라 — engine 구독자/모델 전환 + llm slice + useWebLlm

**Files:**
- Modify: `src/shared/components/llm/engine.ts` (working tree 의 사용자 수정 포함해 커밋)
- Create: `src/shared/components/llm/store/llm.state.ts`
- Create: `src/shared/components/llm/store/slice.ts`
- Modify: `src/shared/store/rootStore.ts`
- Modify: `src/shared/components/llm/useWebLlm.tsx`

**Interfaces:**
- Consumes: `supportEngines`, `DEFAULT_MODEL_ID` (기존 유지)
- Produces:
  - `subscribeProgress(listener: (text: string, progress: number) => void): () => void`
  - `getEngine({ modelId? })` — modelId 가 바뀌면 기존 worker terminate 후 재생성
  - store: `useStore((s) => s.llm.modelId)`, `useStore((s) => s.setLlmModelId)`
  - `useWebLlm()` — 파라미터 제거(모델은 store 에서), 반환 shape 기존과 동일
    `{ status, progress, messages, isStreaming, onChatCompletion, onGenerate }`

- [ ] **Step 1: `engine.ts` 리팩터링** — `supportEngines`/`DEFAULT_MODEL_ID`/`EngineModel` 은 그대로 두고 아래로 교체:

```ts
type ProgressListener = (text: string, progress: number) => void;

let enginePromise: Promise<WebWorkerMLCEngine> | null = null;
let engineWorker: Worker | null = null;
let currentModelId: string | null = null;
const progressListeners = new Set<ProgressListener>();

export function subscribeProgress(listener: ProgressListener) {
  progressListeners.add(listener);

  return () => {
    progressListeners.delete(listener);
  };
}

type EngineProps = {
  modelId?: string;
};

export function getEngine({ modelId = DEFAULT_MODEL_ID }: EngineProps) {
  if (!enginePromise || currentModelId !== modelId) {
    // ponytail: 이전 모델이 생성 중이어도 즉시 교체 — 진행 중 스트림 보장 없음
    engineWorker?.terminate();

    const worker = new Worker(new URL('./worker.ts', import.meta.url), {
      type: 'module',
    });

    engineWorker = worker;
    currentModelId = modelId;

    const promise = CreateWebWorkerMLCEngine(worker, modelId, {
      initProgressCallback: (p) => progressListeners.forEach((listener) => listener(p.text, p.progress)),
    }).catch((e) => {
      // 실패한 promise 를 캐싱하지 않아야 다음 호출에서 재시도할 수 있다
      if (enginePromise === promise) {
        enginePromise = null;
      }
      throw e;
    });

    enginePromise = promise;
  }

  return enginePromise;
}
```

주의: `.catch` 안에서 `promise` 자기 참조를 위해 `const promise = ...` 에 담고 마지막에 `enginePromise = promise` 할당 — TS 에서 자기 참조 오류가 나면 `let` 선언 후 할당으로 조정.

- [ ] **Step 2: llm slice 작성** — 기존 `src/domain/users/store/slice.ts` 와 `users.state.ts` 를 읽고 같은 패턴으로:

`src/shared/components/llm/store/llm.state.ts`:

```ts
interface LlmState {
  llm: {
    modelId: string;
  };
  setLlmModelId: (modelId: string) => void;
}

export type { LlmState };
```

`src/shared/components/llm/store/slice.ts` (SlicePattern 사용 — users slice 의 형태를 그대로 따름):

```ts
import { SlicePattern } from 'zustand';

import { DEFAULT_MODEL_ID } from '@/shared/components/llm/engine';

import { LlmState } from './llm.state';

const createLlmSlice: SlicePattern<LlmState> = (set) => ({
  llm: {
    modelId: DEFAULT_MODEL_ID,
  },
  setLlmModelId: (modelId: string) =>
    set(
      (state) => {
        state.llm.modelId = modelId;
      },
      false,
      { type: 'llm/setLlmModelId' },
    ),
});

export default createLlmSlice;
```

(set 호출 시그니처가 users slice 와 다르면 users slice 방식을 따른다.)

`src/shared/store/rootStore.ts` — slice 등록:

```ts
import createLlmSlice from '@/shared/components/llm/store/slice';
import { LlmState } from '@/shared/components/llm/store/llm.state';
// spread 에 ...createLlmSlice(...a) 추가
export type BoundState = UserState & LlmState;
```

- [ ] **Step 3: `useWebLlm.tsx` 재작성** — modelId 파라미터 제거, store 사용, progress 구독, 모델 변경 시 재로딩:

```tsx
'use client';

import { useEffect, useState } from 'react';

import { useStore } from '@/shared/store/rootStore';

import { v4 as uuid } from 'uuid';

import { getEngine, subscribeProgress } from './engine';

type EngineStatus = 'loading' | 'ready' | 'unsupported';

type ChatMessages = {
  id: string;
  type: 'user' | 'assistant';
  message: string;
  date: Date;
};

export default function useWebLlm() {
  // state
  const [status, setStatus] = useState<EngineStatus>('loading');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [messages, setMessages] = useState<ChatMessages[]>([]);

  // store
  const modelId = useStore((state) => state.llm.modelId);

  // useEffect
  useEffect(() => {
    if (!('gpu' in navigator) || !navigator.userAgent.includes('Chrome')) {
      setStatus('unsupported');
      return;
    }

    setStatus('loading');
    setProgress(0);

    const unsubscribe = subscribeProgress((_, p) => setProgress(p));

    getEngine({ modelId })
      .then(() => setStatus('ready'))
      .catch(() => setStatus('unsupported'));

    return unsubscribe;
  }, [modelId]);

  // handle
  const handleGenerate = async ({
    system = '',
    user,
    onDelta,
  }: {
    system?: string;
    user: string;
    onDelta?: (fullText: string) => void;
  }) => {
    setIsStreaming(true);

    try {
      const engine = await getEngine({ modelId });

      const stream = await engine.chat.completions.create({
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: 0.3,
        stream: true,
      });

      let fullText = '';

      for await (const chunk of stream) {
        fullText += chunk.choices[0].delta.content ?? '';
        onDelta?.(fullText);
      }

      return fullText;
    } finally {
      setIsStreaming(false);
    }
  };

  const handleChatCompletion = async ({ system = '', user }: { system?: string; user: string }) => {
    const userMessage: ChatMessages = { id: uuid(), type: 'user', message: user, date: new Date() };
    const assistantMessage: ChatMessages = { id: uuid(), type: 'assistant', message: '', date: new Date() };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);

    await handleGenerate({
      system,
      user,
      onDelta: (fullText) =>
        setMessages((prev) =>
          prev.map((item) => (item.id === assistantMessage.id ? { ...item, message: fullText } : item)),
        ),
    });
  };

  return { status, progress, messages, isStreaming, onChatCompletion: handleChatCompletion, onGenerate: handleGenerate };
}
```

- [ ] **Step 4: 기존 사용처 확인** — `grep -rn 'useWebLlm(' src` : `Chatbot.tsx`, `ReportPanel.tsx` 모두 인자 없이 호출 중인지 확인 (인자 없음 → 변경 불필요).

- [ ] **Step 5: `yarn lint` + `yarn build` → 통과**

- [ ] **Step 6: Commit** (working tree 의 engine.ts 사용자 수정 포함)

```bash
git add src/shared/components/llm src/shared/store
git commit -m "feat: LLM 모델 전역 상태 및 progress 구독 구조로 개편"
```

---

### Task 4: ModelSelect 컴포넌트 + 챗봇/보고서 배치

**Files:**
- Create: `src/shared/components/llm/ModelSelect.tsx`
- Modify: `src/shared/components/chatbot/Chatbot.tsx` (패널 헤더)
- Modify: `src/domain/commits/components/ReportPanel.tsx` (상단 행)

**Interfaces:**
- Consumes: `supportEngines` (engine.ts), store `llm.modelId`/`setLlmModelId` (Task 3)
- Produces: `ModelSelect({ disabled?: boolean })`

- [ ] **Step 1: `ModelSelect.tsx` 작성**

```tsx
'use client';

import { supportEngines } from '@/shared/components/llm/engine';
import { useStore } from '@/shared/store/rootStore';

export default function ModelSelect({ disabled }: Readonly<{ disabled?: boolean }>) {
  // store
  const modelId = useStore((state) => state.llm.modelId);
  const setLlmModelId = useStore((state) => state.setLlmModelId);

  return (
    <select
      className="select select-sm w-40"
      aria-label="AI model"
      value={modelId}
      disabled={disabled}
      onChange={(e) => setLlmModelId(e.target.value)}
    >
      {supportEngines.map((engine) => (
        <option key={engine.id} value={engine.id}>
          {engine.displayName}
        </option>
      ))}
    </select>
  );
}
```

- [ ] **Step 2: 챗봇 패널 헤더에 배치** — `Chatbot.tsx` 의 패널 헤더 행을:

```tsx
<div className="flex flex-row items-center justify-between gap-2 p-3">
  <span className="flex-none font-bold">💬 {t('title')}</span>
  <ModelSelect disabled={isStreaming} />
  <button type="button" className="btn btn-ghost btn-sm btn-circle flex-none" onClick={() => setOpen(false)}>
    ✕
  </button>
</div>
```

- [ ] **Step 3: `ReportPanel.tsx` 상단 행에 배치** — 커밋 건수/생성 버튼 행을:

```tsx
<div className="flex flex-row flex-wrap items-center justify-between gap-2">
  <span className="text-sm opacity-70">{t('commits', { count: commits.length })}</span>
  <div className="flex flex-row items-center gap-2">
    <ModelSelect disabled={isStreaming} />
    <button /* 기존 생성 버튼 그대로 */>
  </div>
</div>
```

- [ ] **Step 4: `yarn lint` + `yarn build` → 통과**

- [ ] **Step 5: Commit**

```bash
git add src/shared/components/llm/ModelSelect.tsx src/shared/components/chatbot src/domain/commits/components/ReportPanel.tsx
git commit -m "feat: AI 모델 선택 셀렉트 추가 (챗봇/보고서)"
```

---

### Task 5: 챗봇 열림/닫힘 애니메이션

**Files:**
- Modify: `src/shared/components/chatbot/Chatbot.tsx` (패널 렌더 부분)

**Interfaces:** 없음

- [ ] **Step 1: 패널을 항상 mount 로 변경** — `{open && (<div className="card ...">…)}` 를 클래스 토글로 교체:

```tsx
<div
  className={cx(
    'card bg-base-200 flex h-[28rem] w-80 flex-col shadow-2xl transition-all duration-300',
    'max-sm:fixed max-sm:inset-0 max-sm:h-full max-sm:w-full max-sm:rounded-none',
    open
      ? 'visible translate-y-0 opacity-100'
      : 'invisible translate-y-6 opacity-0 max-sm:translate-y-full',
  )}
>
```

(`cx` import 는 이미 존재. `invisible` 이 transition 이후 적용되도록 daisyUI/tailwind 의 `transition-all` 에 `visibility` 가 포함됨 — 닫힌 상태에서 포커스/클릭 차단은 `invisible` 로 충분, `pointer-events-none` 은 `invisible` 에 내포되지 않으므로 함께 추가해도 무방.)

- [ ] **Step 2: 닫힌 상태 탭 이동 차단 확인** — `invisible` 은 포커스 대상에서 제외되므로 추가 조치 불필요. 자동 스크롤 effect 는 패널이 항상 mount 라 ref 가 유지됨 (기존 `open` 미포함 deps 이슈도 자연 해소 — 열려 있는 동안 스크롤 유지).

- [ ] **Step 3: `yarn lint` + `yarn build` → 통과**

- [ ] **Step 4: Commit**

```bash
git add src/shared/components/chatbot
git commit -m "feat: 챗봇 패널 슬라이드 애니메이션 추가"
```

---

### Task 6: 보고서 — 프롬프트 강화 + 마크다운 렌더 + 주간 문구

**Files:**
- Create: `src/domain/commits/components/ReportMarkdown.tsx`
- Modify: `src/domain/commits/components/ReportPanel.tsx` (SYSTEM_PROMPT + 출력 영역)
- Modify: `src/app/reports/weekly/_components/WeeklyReportContents.tsx` (기간 문구)
- Modify: `messages/ko.json`, `messages/en.json` (`report.weekOfMonth`)

**Interfaces:**
- Consumes: 없음
- Produces: `ReportMarkdown({ markdown: string })`

- [ ] **Step 1: `ReportMarkdown.tsx` 작성** — 보고서 형식(`##`/`###`/`- `) 전용 경량 렌더러:

```tsx
import { Fragment } from 'react';

export default function ReportMarkdown({ markdown }: Readonly<{ markdown: string }>) {
  const blocks: React.ReactNode[] = [];

  let items: string[] = [];
  let key = 0;

  const flushItems = () => {
    if (items.length === 0) {
      return;
    }

    blocks.push(
      <ul key={key++} className="list-disc pl-5">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>,
    );

    items = [];
  };

  markdown.split('\n').forEach((line) => {
    if (line.startsWith('### ')) {
      flushItems();
      blocks.push(
        <h3 key={key++} className="text-primary mt-3 text-sm font-bold">
          {line.slice(4)}
        </h3>,
      );
    } else if (line.startsWith('## ')) {
      flushItems();
      blocks.push(
        <h2 key={key++} className="mt-4 text-base font-bold first:mt-0">
          {line.slice(3)}
        </h2>,
      );
    } else if (line.startsWith('- ')) {
      items.push(line.slice(2));
    } else if (line.trim()) {
      flushItems();
      blocks.push(<p key={key++}>{line}</p>);
    }
  });

  flushItems();

  return <Fragment>{blocks}</Fragment>;
}
```

- [ ] **Step 2: `ReportPanel.tsx` 수정**
  1. `SYSTEM_PROMPT` 의 규칙 부분을 아래로 교체 (형식 블록은 유지):

```
규칙:
- 저장소별로 ## 섹션을 만든다. 입력에 나온 저장소 순서를 유지한다.
- 각 저장소 안에서 관련 있는 커밋끼리 작업 단위로 묶어 ### 소제목을 붙인다. 소제목은 2~6단어로 간결하게 쓴다.
- 각 작업 단위 아래 불릿은 무엇을 했는지 요약한 설명이다. 반드시 20자 이내로 쓴다.
- "feat:", "fix:", "refactor:", "build:", "docs:" 같은 커밋 prefix 는 결과에 절대 포함하지 않는다.
- 커밋 메시지를 그대로 옮겨 적지 않는다. 모든 커밋이 어느 작업 단위엔가 반영되어야 한다. 없는 내용을 지어내지 않는다.
```

  2. 출력 영역 — `<pre>` 를 마크다운 렌더로 교체 (복사는 기존 raw `report` 문자열 그대로):

```tsx
<div className="flex-1 overflow-y-auto p-4 pt-0 text-sm">
  {report ? <ReportMarkdown markdown={report} /> : <span className="opacity-50">{t('placeholder')}</span>}
</div>
```

- [ ] **Step 3: 주간 보고 기간 문구** — messages 추가:

`messages/ko.json` `report` 에: `"weekOfMonth": "{month} {week}주차"`
`messages/en.json` `report` 에: `"weekOfMonth": "{month} week {week}"`

`WeeklyReportContents.tsx` 의 badge 블록을:

```tsx
<div className="flex flex-row flex-wrap items-center gap-2">
  <span className="font-bold">
    {t('weekOfMonth', { month: weekStart.format('YYYY-MM'), week: Math.ceil(weekStart.date() / 7) })}
  </span>
  <span className="badge badge-ghost">
    {weekStart.format('YYYY-MM-DD (ddd)')} - {weekEnd.format('YYYY-MM-DD (ddd)')}
  </span>
  <DatePicker picker="week" ... {/* 기존 그대로 */} />
</div>
```

- [ ] **Step 4: `yarn lint` + `yarn build` → 통과**

- [ ] **Step 5: Commit**

```bash
git add src/domain/commits/components src/app/reports/weekly messages
git commit -m "feat: 보고서 마크다운 렌더 및 프롬프트 간결화, 주간 문구 개선"
```

---

### Task 7: 최종 검증

- [ ] **Step 1: `yarn lint` → 0 errors, `yarn build` → 성공**
- [ ] **Step 2: `yarn dev` 수동 체크리스트** (Chrome):
  - 언어 버튼에 현재 언어(국기+라벨), 드롭다운 국기 표시
  - 아바타 영역이 이전보다 넓게
  - 차트 막대 폭 ≤ 40px 중앙 정렬
  - 커밋 목록: repo/branch/author badge, 순서 확인
  - 챗봇: 열 때 아래→위, 닫을 때 위→아래 애니메이션
  - 모델 셀렉트(챗봇/보고서) — 변경 시 재로딩 + **progress 가 일일/주간 보고 페이지에서도 움직이는지**
  - 보고서: HTML 렌더(##/###/불릿), 복사하면 마크다운 원문, 불릿 20자 이내/prefix 없음
  - 주간 보고: `YYYY-MM N주차` + `YYYY-MM-DD (ddd) - YYYY-MM-DD (ddd)`
- [ ] **Step 3: 발견 문제 수정 후 `fix:` 커밋**

---

## Self-Review 결과 (작성 시 반영 완료)

- 스펙 커버리지: §1(T1), §2(T2), §3(T2), §4(T3+T4), §5(T5), §6(T6), §7(T6) — 전부 매핑.
- 타입 일관성: `subscribeProgress` 반환 `() => void` 를 useWebLlm effect cleanup 으로 직접 반환. `useWebLlm()` 인자 제거 — 두 사용처 모두 무인자 호출이라 안전.
- 모델 전환 중 스트리밍: 진행 중 스트림은 worker terminate 로 끊길 수 있음 — ModelSelect 가 `isStreaming` 시 disabled 라 UI 경로는 차단됨 (챗봇/보고서 각자의 스트리밍만 커버 — 서로 다른 화면 간 동시 사용은 허용된 한계, ponytail 주석으로 명시).
