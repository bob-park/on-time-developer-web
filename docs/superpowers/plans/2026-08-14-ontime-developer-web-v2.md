# OnTime Developer Web v2 (UI 개선) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** v1 구현에 대한 UI 개선 — 헤더 컨트롤 모던화, Footer 제거, 모바일 drawer, antd DatePicker, 대시보드 차트 버그 수정, 보고서 형식 변경.

**Architecture:** 기존 구조 유지. antd 는 DatePicker 계열만 사용하며 `AntdProvider`(ConfigProvider) 로 daisyUI 테마 쿠키와 동기화. 모바일 nav 는 daisyUI `drawer` 로 root layout 을 재구성.

**Tech Stack:** 기존 스택 + `antd` v5, `@ant-design/v5-patch-for-react-19`

**Spec:** `docs/superpowers/specs/2026-08-14-ontime-developer-web-v2-design.md`

## Global Constraints

- 신규 dependency 는 `antd`, `@ant-design/v5-patch-for-react-19` 딱 2개. antd 는 DatePicker/RangePicker 용도로만 사용 — 다른 antd 컴포넌트 금지.
- 아이콘은 인라인 SVG (stroke 기반) — 아이콘 라이브러리/이모지 금지.
- 커밋 전 `yarn lint` 0 errors + `yarn build` 성공 필수 (`ERR_INVALID_URL: '{BETTER_AUTH_URL}'` static-gen 로그는 로컬 env 문제 — 무시).
- `'use client'` 섹션 주석 순서, `cx`(classnames), daisyUI 토큰 우선 — 기존 컨벤션 유지.
- UI 문자열 변경은 `messages/ko.json` + `messages/en.json` 둘 다.
- 커밋 메시지: 한국어 + prefix (`feat:`/`fix:`/`build:`/`refactor:`).
- 기존 인터페이스 유지: `ReportPanel({ from, to })`, `usePeriodCommits`, `useCommits` 시그니처 변경 금지.

---

### Task 1: antd 도입 + AntdProvider (테마 연동)

**Files:**
- Modify: `package.json` (yarn add)
- Create: `src/shared/providers/antd/AntdProvider.tsx`
- Modify: `src/app/layout.tsx` (provider 삽입)

**Interfaces:**
- Consumes: `Theme` (`@/shared/providers/theme/ThemeProvider`), layout 의 `theme` 쿠키 값
- Produces: `AntdProvider({ current: Theme, children })` — 이후 태스크에서 antd DatePicker 가 테마를 상속받는 전제

- [ ] **Step 1: 의존성 설치**

```bash
yarn add antd @ant-design/v5-patch-for-react-19
```

- [ ] **Step 2: `src/shared/providers/antd/AntdProvider.tsx` 작성**

```tsx
'use client';

import '@ant-design/v5-patch-for-react-19';

import { Theme } from '@/shared/providers/theme/ThemeProvider';

import { ConfigProvider, theme as antdTheme } from 'antd';

export default function AntdProvider({ current, children }: Readonly<{ current: Theme; children: React.ReactNode }>) {
  const isDark = current === 'dark';

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: isDark ? '#1ed760' : '#169c46',
          borderRadius: 8,
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
```

- [ ] **Step 3: `src/app/layout.tsx` 에 삽입** — `import AntdProvider from '@/shared/providers/antd/AntdProvider';` 추가 후, `<OverlayProvider>` 바로 바깥을 감싼다 (`<AntdProvider current={theme}>` … `</AntdProvider>`, HydrationBoundary 안쪽).

- [ ] **Step 4: `yarn lint` + `yarn build` → 통과**

- [ ] **Step 5: Commit**

```bash
git add package.json yarn.lock src/shared/providers/antd src/app/layout.tsx
git commit -m "build: antd 도입 및 테마 연동 provider 추가"
```

---

### Task 2: 헤더 컨트롤 — 아이콘 버튼 (언어/테마) + 아바타 영역

**Files:**
- Modify: `src/shared/components/theme/ThemeSwitcher.tsx` (전체 재작성)
- Modify: `src/shared/components/i18n/LanguageSwitcher.tsx` (전체 재작성)
- Modify: `src/app/_layouts/Header.tsx` (아바타 드롭다운 부분)

**Interfaces:**
- Consumes: `setTheme` (`@/app/themeAction`), `setLocale`/`SUPPORTED_LOCALES`/`isSupportedLocale`/`DEFAULT_LOCALE` (`@/shared/i18n/...`), `UserAvatar`, `getUserinfo`
- Produces: `ThemeSwitcher({ current: Theme })` — props 시그니처 유지. `LanguageSwitcher()` — props 없음 유지.

- [ ] **Step 1: `ThemeSwitcher.tsx` 재작성** — 아이콘 원형 버튼 1개, 클릭 시 토글. dark 면 해(라이트로 전환 의미), light 면 달 아이콘.

```tsx
'use client';

import { setTheme } from '@/app/themeAction';
import { Theme } from '@/shared/providers/theme/ThemeProvider';

export default function ThemeSwitcher({ current }: Readonly<{ current: Theme }>) {
  // handle
  const handleToggle = () => {
    void setTheme(current === 'dark' ? 'light' : 'dark');
  };

  return (
    <button type="button" className="btn btn-ghost btn-circle" aria-label="toggle theme" onClick={handleToggle}>
      {current === 'dark' ? (
        <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
          />
        </svg>
      ) : (
        <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
          />
        </svg>
      )}
    </button>
  );
}
```

- [ ] **Step 2: `LanguageSwitcher.tsx` 재작성** — 지구본 아이콘 버튼 + 드롭다운, 현재 언어에 ✓.

```tsx
'use client';

import { useTransition } from 'react';

import { DEFAULT_LOCALE, Locale, SUPPORTED_LOCALES, isSupportedLocale } from '@/shared/i18n/config';
import { setLocale } from '@/shared/i18n/localeAction';

import cx from 'classnames';
import { useLocale } from 'next-intl';

const DISPLAY_LABEL: Record<Locale, string> = { ko: '한국어', en: 'English' };

export default function LanguageSwitcher() {
  // hooks
  const rawLocale = useLocale();
  const [isPending, startTransition] = useTransition();

  const currentLocale: Locale = isSupportedLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;

  // handle
  const handleChange = (target: Locale) => {
    if (target === currentLocale) return;

    startTransition(async () => {
      await setLocale(target);
    });
  };

  return (
    <div className={cx('dropdown dropdown-end', isPending && 'pointer-events-none opacity-60')}>
      <div tabIndex={0} role="button" className="btn btn-ghost btn-circle" aria-label="change language">
        <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" />
          <path strokeLinecap="round" d="M3 12h18M12 3c2.5 2.5 2.5 15.5 0 18M12 3c-2.5 2.5-2.5 15.5 0 18" />
        </svg>
      </div>
      <ul tabIndex={0} className="menu dropdown-content rounded-box bg-base-200 z-30 mt-2 w-36 p-2 shadow-lg">
        {SUPPORTED_LOCALES.map((locale) => (
          <li key={locale}>
            <button type="button" className="flex justify-between" onClick={() => handleChange(locale)}>
              {DISPLAY_LABEL[locale]}
              {locale === currentLocale && (
                <svg className="text-primary size-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 3: `Header.tsx` 아바타 영역 교체** — 기존 `dropdown dropdown-end` 블록을 아래로 교체. `userinfo` 관련 기존 코드(예: 아바타 URL 의 `userinfo.sub` — 현재 코드가 쓰는 필드를 그대로 유지)는 보존하고, `@userId` 는 email 로컬파트로 표시.

```tsx
{/* avatar dropdown — 기존 블록 교체 */}
<div className="dropdown dropdown-end">
  <div tabIndex={0} role="button" className="btn btn-ghost h-auto min-h-0 rounded-full py-1 pr-3 pl-1">
    <UserAvatar src={userinfo && `/api/v1/users/${userinfo.sub}/avatar`} username={userinfo?.name ?? '?'} />
    <span className="text-sm font-bold">{userinfo?.name}</span>
  </div>
  <ul tabIndex={0} className="menu dropdown-content rounded-box bg-base-200 z-30 mt-2 w-52 p-2 shadow-lg">
    <li className="pointer-events-none">
      <div className="flex flex-col items-start gap-0 py-2">
        <span className="font-bold">{userinfo?.name}</span>
        <span className="text-xs opacity-60">@{userinfo?.email?.split('@')[0]}</span>
      </div>
    </li>
    <li className="border-base-300 mt-1 border-t pt-1">
      <a href="/logout">
        <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
          />
        </svg>
        {t('logout')}
      </a>
    </li>
  </ul>
</div>
```

주의: `userinfo.sub` 가 현재 코드와 다르면(예: `.id`) **현재 코드의 필드를 유지**한다. `email` 필드가 세션 user 타입에 없으면 옵셔널 체이닝으로 안전하게 처리하고 report 에 명시.

- [ ] **Step 4: `yarn lint` + `yarn build` → 통과**

- [ ] **Step 5: Commit**

```bash
git add src/shared/components/theme src/shared/components/i18n src/app/_layouts/Header.tsx
git commit -m "feat: 헤더 컨트롤 모던화 (아이콘 버튼 언어/테마, 아바타 드롭다운)"
```

---

### Task 3: Footer 제거 + 모바일 daisyUI Drawer

**Files:**
- Delete: `src/app/_layouts/Footer.tsx`
- Create: `src/app/_layouts/MobileDrawerSide.tsx` (client)
- Modify: `src/app/layout.tsx` (drawer 구조 + Footer 제거)
- Modify: `src/app/_layouts/Header.tsx` (햄버거 → drawer label)
- Modify: `src/app/_layouts/HeaderNav.tsx` (데스크톱 전용으로 축소)

**Interfaces:**
- Consumes: `getUserinfo` (layout 에서 호출해 이름/아바타 src 전달), nav 메뉴 4개 (`nav` i18n keys)
- Produces: `MobileDrawerSide({ username, avatarSrc }: { username: string; avatarSrc?: string | false })` — drawer checkbox id 는 `"mobile-drawer"` 로 고정 (Header 의 label 과 공유)

- [ ] **Step 1: `HeaderNav.tsx` 를 데스크톱 전용으로 축소** — mobile dropdown 블록(`{/* mobile - hamburger */}` div) 을 삭제하고 desktop `<nav>` 만 남긴다 (fragment 불필요해지면 제거). `hidden md:flex` 클래스는 유지.

- [ ] **Step 2: `src/app/_layouts/MobileDrawerSide.tsx` 작성**

```tsx
'use client';

import { useEffect } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import UserAvatar from '@/domain/users/components/UserAvatar';

import cx from 'classnames';
import { useTranslations } from 'next-intl';

const MENUS = [
  { key: 'dashboard', href: '/dashboard' },
  { key: 'commits', href: '/commits' },
  { key: 'dailyReport', href: '/reports/daily' },
  { key: 'weeklyReport', href: '/reports/weekly' },
] as const;

export default function MobileDrawerSide({
  username,
  avatarSrc,
}: Readonly<{ username: string; avatarSrc?: string | false }>) {
  // hooks
  const pathname = usePathname();
  const t = useTranslations('nav');

  // useEffect
  useEffect(() => {
    const toggle = document.getElementById('mobile-drawer') as HTMLInputElement | null;

    if (toggle) {
      toggle.checked = false;
    }
  }, [pathname]);

  return (
    <div className="drawer-side z-40">
      <label htmlFor="mobile-drawer" aria-label="close menu" className="drawer-overlay" />
      <aside className="bg-base-200 flex min-h-full w-72 flex-col">
        <div className="flex flex-row items-center gap-2 p-4">
          <span className="bg-primary size-6 rounded-full" aria-hidden />
          <span className="text-lg font-bold">OnTime Developer</span>
        </div>

        <nav className="flex flex-col gap-1 px-3">
          {MENUS.map((menu) => (
            <Link
              key={menu.key}
              href={menu.href}
              className={cx(
                'rounded-lg px-4 py-3 text-sm font-bold',
                pathname.startsWith(menu.href) ? 'bg-primary text-primary-content' : 'opacity-70',
              )}
            >
              {t(menu.key)}
            </Link>
          ))}
        </nav>

        <div className="border-base-300 mt-auto flex flex-row items-center gap-3 border-t p-4">
          <UserAvatar src={avatarSrc} username={username} />
          <div className="flex flex-col">
            <span className="text-sm font-bold">{username}</span>
            <a href="/logout" className="link text-xs opacity-60">
              {t('logout')}
            </a>
          </div>
        </div>
      </aside>
    </div>
  );
}
```

- [ ] **Step 3: `layout.tsx` 를 drawer 구조로 변경** — Footer import/사용 제거, `getUserinfo` 를 layout 에서 호출, body 내부를 아래 구조로:

```tsx
// imports: Footer 제거, 추가:
// import MobileDrawerSide from '@/app/_layouts/MobileDrawerSide';
// import { getUserinfo } from '@/shared/auth/serverAction';

// RootLayout 함수 안, 기존 cookie/locale 로직 다음에:
const userinfo = await getUserinfo();

// JSX (ToastProvider 안쪽):
<ToastProvider limit={5} timeout={5}>
  <QueryErrorToast />
  <div className="drawer">
    <input id="mobile-drawer" type="checkbox" className="drawer-toggle" />
    <div className="drawer-content flex min-h-screen flex-col">
      <Header />
      <Contents>{children}</Contents>
      <Chatbot />
    </div>
    <MobileDrawerSide
      username={userinfo?.name ?? '?'}
      avatarSrc={userinfo && `/api/v1/users/${userinfo.sub}/avatar`}
    />
  </div>
</ToastProvider>
```

주의: 아바타 URL 필드는 Header.tsx 가 현재 쓰는 필드(`sub` 또는 `id`)와 동일하게 맞춘다.

- [ ] **Step 4: `Header.tsx` 햄버거 교체** — 기존 `<div className="md:hidden"><HeaderNav /></div>` 를 drawer label 로 교체:

```tsx
<label htmlFor="mobile-drawer" className="btn btn-ghost btn-square md:hidden" aria-label="open menu">
  <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
</label>
```

`<div className="hidden md:block"><HeaderNav /></div>` 는 `<HeaderNav />` 로 단순화 (nav 자체가 `hidden md:flex`).

- [ ] **Step 5: `src/app/_layouts/Footer.tsx` 삭제** (`git rm`)

- [ ] **Step 6: `yarn lint` + `yarn build` → 통과**

- [ ] **Step 7: Commit**

```bash
git add -A src/app/_layouts src/app/layout.tsx
git commit -m "feat: 모바일 drawer 네비 전환 및 footer 제거"
```

---

### Task 4: 대시보드 막대 차트 버그 수정

**Files:**
- Modify: `src/app/dashboard/_components/DashboardContents.tsx` (daily bar chart 부분)

**Interfaces:** 없음 (self-contained 버그 수정)

- [ ] **Step 1: 원인 확인** — 막대 div 의 `height: N%` 가 높이 auto 인 컬럼(`flex flex-1 flex-col`) 안에 있어 % 가 0 으로 해석됨.

- [ ] **Step 2: 차트 블록 수정** — 컬럼 안에서 막대를 고정 높이 래퍼로 감싼다:

```tsx
{/* daily bar chart */}
<div className="card bg-base-200 p-5 shadow">
  <div className="mb-4 text-sm opacity-70">{t('dailyChart')}</div>
  <div className="flex flex-row items-end gap-3">
    {dailyCounts.map((day) => (
      <div key={day.label} className="flex flex-1 flex-col items-center gap-1">
        <span className="text-xs opacity-70">{day.count}</span>
        <div className="flex h-24 w-full items-end">
          <div
            className="bg-primary w-full rounded-t"
            style={{ height: `${(day.count / maxDaily) * 100}%`, opacity: day.count === maxDaily ? 1 : 0.55 }}
          />
        </div>
        <span className="text-xs opacity-70">{day.label}</span>
      </div>
    ))}
  </div>
</div>
```

(외곽 `h-32` 는 제거 — 높이는 `h-24` 래퍼가 결정. count 0 이면 높이 0% 로 막대 없음 — 정상.)

- [ ] **Step 3: `yarn lint` + `yarn build` → 통과**

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard
git commit -m "fix: 대시보드 일일 커밋 수 막대 차트 미표시 수정"
```

---

### Task 5: antd DatePicker 적용 (일일/주간/커밋 필터)

**Files:**
- Modify: `src/app/reports/daily/_components/DailyReportContents.tsx`
- Modify: `src/app/reports/weekly/_components/WeeklyReportContents.tsx`
- Modify: `src/app/commits/_components/CommitsContents.tsx`

**Interfaces:**
- Consumes: `AntdProvider` (Task 1, layout 에 이미 배치), `ReportPanel({ from, to })` — 시그니처 불변
- Produces: 없음

- [ ] **Step 1: `DailyReportContents.tsx`** — `<input type="date">` 를 antd `DatePicker` 로 교체. state 를 `Dayjs` 로 변경:

```tsx
'use client';

import { useState } from 'react';

import ReportPanel from '@/domain/commits/components/ReportPanel';
import dayjs from '@/shared/dayjs';

import { DatePicker } from 'antd';
import type { Dayjs } from 'dayjs';
import { useTranslations } from 'next-intl';

export default function DailyReportContents() {
  // state
  const [date, setDate] = useState<Dayjs>(dayjs());

  // hooks
  const t = useTranslations('report');

  const from = date.startOf('day').format('YYYY-MM-DDTHH:mm:ss');
  const to = date.endOf('day').format('YYYY-MM-DDTHH:mm:ss');

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex flex-row flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">{t('dailyTitle')}</h1>
        <DatePicker allowClear={false} value={date} onChange={(value) => setDate(value)} />
      </div>

      <ReportPanel from={from} to={to} />
    </div>
  );
}
```

- [ ] **Step 2: `WeeklyReportContents.tsx`** — `DatePicker picker="week"` 로 교체:

```tsx
'use client';

import { useState } from 'react';

import ReportPanel from '@/domain/commits/components/ReportPanel';
import dayjs from '@/shared/dayjs';

import { DatePicker } from 'antd';
import type { Dayjs } from 'dayjs';
import { useTranslations } from 'next-intl';

export default function WeeklyReportContents() {
  // state
  const [date, setDate] = useState<Dayjs>(dayjs());

  // hooks
  const t = useTranslations('report');

  const weekStart = date.startOf('isoWeek');
  const weekEnd = weekStart.endOf('isoWeek');

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex flex-row flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">{t('weeklyTitle')}</h1>
        <div className="flex flex-row items-center gap-2">
          <span className="badge badge-ghost">
            {weekStart.format('YYYY-MM-DD')} ~ {weekEnd.format('YYYY-MM-DD')}
          </span>
          <DatePicker picker="week" allowClear={false} value={date} onChange={(value) => setDate(value)} />
        </div>
      </div>

      <ReportPanel from={weekStart.format('YYYY-MM-DDTHH:mm:ss')} to={weekEnd.format('YYYY-MM-DDTHH:mm:ss')} />
    </div>
  );
}
```

- [ ] **Step 3: `CommitsContents.tsx` 필터의 date input 2개를 `RangePicker` 로 교체**

`FilterFields` 의 `from: string; to: string` 을 `range: [Dayjs, Dayjs] | null` 로 바꾼다:

```tsx
// 추가 import
import { DatePicker } from 'antd';
import type { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;

type FilterFields = {
  commitMessage: string;
  repo: string;
  branch: string;
  range: [Dayjs, Dayjs] | null;
};

const EMPTY_FILTER: FilterFields = { commitMessage: '', repo: '', branch: '', range: null };

function toSearchRequest(fields: FilterFields): CommitSearchRequest {
  return {
    commitMessage: fields.commitMessage || undefined,
    repo: fields.repo || undefined,
    branch: fields.branch || undefined,
    createdDateFrom: fields.range ? fields.range[0].startOf('day').format('YYYY-MM-DDTHH:mm:ss') : undefined,
    createdDateTo: fields.range ? fields.range[1].endOf('day').format('YYYY-MM-DDTHH:mm:ss') : undefined,
  };
}
```

JSX 에서 기존 `<input type="date" ...>` 2개와 사이 `~` span 을 아래 하나로 교체:

```tsx
<RangePicker value={fields.range} onChange={(value) => setFields((prev) => ({ ...prev, range: value as [Dayjs, Dayjs] | null }))} />
```

`handleChange` 는 텍스트 필드 3개에만 쓰이므로 시그니처 유지. `dayjs` import 가 더 이상 안 쓰이면 제거.

- [ ] **Step 4: `yarn lint` + `yarn build` → 통과**

- [ ] **Step 5: Commit**

```bash
git add src/app/reports src/app/commits
git commit -m "feat: 날짜 선택을 antd DatePicker 로 교체 (일일/주간/커밋 필터)"
```

---

### Task 6: 보고서 형식 변경 + "주간 보고" 명칭

**Files:**
- Modify: `src/domain/commits/components/ReportPanel.tsx` (`SYSTEM_PROMPT` 교체)
- Modify: `messages/ko.json` (`nav.weeklyReport`, `report.weeklyTitle`)

**Interfaces:** 없음 (문자열/프롬프트만)

- [ ] **Step 1: `messages/ko.json`** — `"nav"."weeklyReport": "주간 작업 보고"` → `"주간 보고"`, `"report"."weeklyTitle": "주간 작업 보고"` → `"주간 보고"`. (en 은 그대로 "Weekly Report".)

- [ ] **Step 2: `ReportPanel.tsx` 의 `SYSTEM_PROMPT` 상수를 아래로 교체**

```ts
const SYSTEM_PROMPT = `너는 개발자의 커밋 내역으로 업무 보고서를 작성하는 도우미다.
입력은 "저장소 | 커밋 메시지" 형식의 목록이다.
아래 마크다운 형식만 출력한다. 인사말이나 다른 설명은 절대 출력하지 않는다.

## {저장소 이름}

### {관련 커밋을 묶은 작업 단위}

- 작업 내용을 요약한 설명

규칙:
- 저장소별로 ## 섹션을 만든다. 입력에 나온 저장소 순서를 유지한다.
- 각 저장소 안에서 관련 있는 커밋끼리 작업 단위로 묶어 ### 소제목을 붙인다.
- 각 작업 단위 아래에는 커밋 메시지를 그대로 나열하지 말고, 무엇을 했는지 1~2문장으로 요약한 설명을 불릿으로 쓴다.
- 모든 커밋이 어느 작업 단위엔가 반영되어야 한다. 없는 내용을 지어내지 않는다.`;
```

- [ ] **Step 3: `yarn lint` + `yarn build` → 통과**

- [ ] **Step 4: Commit**

```bash
git add src/domain/commits/components/ReportPanel.tsx messages/ko.json
git commit -m "feat: 보고서 작업 단위 요약 형식 적용 및 주간 보고 명칭 변경"
```

---

### Task 7: 최종 검증

**Files:** 수정 없음 (발견된 문제 수정만)

- [ ] **Step 1: `yarn lint` → 0 errors, `yarn build` → 성공**

- [ ] **Step 2: `yarn dev` 수동 체크리스트** (Chrome):
  - 헤더: 지구본 드롭다운(현재 언어 ✓, 전환 동작), 해/달 토글, `[아바타] 이름` + 드롭다운(`이름/@userId`, 로그아웃)
  - Footer 없음
  - 모바일 폭: 햄버거 → 좌측 drawer 슬라이드, active 그린 필, 메뉴 이동 시 자동 닫힘, 오버레이 탭 닫힘, 하단 사용자/로그아웃
  - 대시보드: 막대 차트 표시됨
  - antd 픽커: 일일(single)/주간(week)/커밋(range) — 라이트/다크 모두 어울리는지, 주간 선택 시 badge 월~일 범위
  - 보고서 생성: 작업 단위 그룹 + 요약 설명 형식, "주간 보고" 명칭
- [ ] **Step 3: 발견된 문제 수정 후 `fix:` 커밋**

---

## Self-Review 결과 (작성 시 반영 완료)

- 스펙 커버리지: §1(T2), §2(T2), §3(T3), §4(T3), §5(T1+T5), §6(T4), §7(T6) — 전부 매핑.
- antd `onChange` 의 null 가능성: `allowClear={false}` 로 single/week 픽커는 null 이 오지 않으나, 타입상 null 이면 lint/type 에러 시 `(value) => value && setDate(value)` 로 가드 — 구현자가 타입 에러를 만나면 이 가드를 적용.
- Weekly `picker="week"` 는 antd 로케일상 일요일 시작으로 표시될 수 있으나 실제 범위 계산은 `startOf('isoWeek')`(월요일) 로 badge 에 표시되므로 스펙(월~일)을 만족. 표시 주 시작 요일까지 맞추려면 antd locale 설정이 필요 — 범위 밖 (필요 시 후속).
