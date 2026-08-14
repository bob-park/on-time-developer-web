'use client';

import { use } from 'react';

import { ToastContext } from '@/shared/components/toast/ToastProvider';

export default function Home() {
  const { push } = use(ToastContext);

  return (
    <div className="size-full">
      home
      <div className="">
        <button className="btn" onClick={() => push('text', 'info')}>
          push
        </button>
      </div>
    </div>
  );
}
