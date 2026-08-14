---
title: overlay-kit
scope: src/**/*.tsx
applies_to: opening modals / dialogs / overlays imperatively from event handlers
related:
  - ../conventions/react-sections.md
  - ./tailwind-daisyui.md
---

# overlay-kit

> Modal / dialog 는 `overlay.open(({ isOpen, close, unmount }) => <Modal ... />)` 로 imperative 하게 연다. exit animation 을 위해 `close()` 직후 `setTimeout(unmount, 300)` 으로 DOM 정리.

## Setup

Root layout 에 `<OverlayProvider>` 가 등록되어 있어야 한다 (이미 구현됨, `src/app/layout.tsx`).

```tsx
import { OverlayProvider } from 'overlay-kit';

// in RootLayout
<OverlayProvider>{children}</OverlayProvider>
```

## Opening a modal

```tsx
import { overlay } from 'overlay-kit';

const handleAddRoom = () => {
  overlay.open(({ isOpen, close, unmount }) => (
    <RoomFormModal
      open={isOpen}
      title="발표장 추가"
      onClose={() => {
        close();
        setTimeout(() => unmount(), 300);
      }}
      onSuccess={(room) => {
        onInputChange({ field: 'roomId', value: room.id });
      }}
    />
  ));
};
```

규칙:

- `isOpen` 을 modal component 의 `open` prop 에 전달 — close transition 동안 mount 유지.
- `close()` 호출 시 `isOpen` 이 `false` 로 바뀌어 exit animation 이 재생된다.
- `setTimeout(() => unmount(), 300)` 으로 transition 완료 후 DOM 에서 제거 (300ms 는 transition duration 과 맞춘다).
- `unmount` 를 즉시 호출하면 exit animation 이 생략되어 깜빡임이 발생할 수 있다.
- Modal 의 `onSuccess` / `onSubmit` 같은 결과 콜백은 일반 prop 으로 받아 caller 가 직접 처리한다.

## Why imperative (not declarative state)

- Modal 마다 `useState<boolean>` 을 만들고 caller 에 prop drilling 하는 비용이 사라진다.
- 같은 컴포넌트에서 여러 modal 을 순차/조건부로 열기 쉽다 (event handler 안에서 `overlay.open` 을 그대로 호출).
- Stacking 도 라이브러리가 알아서 처리.

## When NOT to use overlay-kit

- 페이지 본문 일부로 항상 보이는 inline panel — 일반 컴포넌트로 둔다.
- URL 에 반영되어야 하는 modal (예: 공유 가능한 deep-link) — Next.js parallel routes / intercepting routes 를 고려한다.
