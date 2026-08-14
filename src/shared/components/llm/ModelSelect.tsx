'use client';

import { useCallback, useEffect, useState } from 'react';

import { checkModelCached, deleteModelCache, subscribeProgress, supportEngines } from '@/shared/components/llm/engine';
import { useStore } from '@/shared/store/rootStore';

import cx from 'classnames';
import { useTranslations } from 'next-intl';

export default function ModelSelect({ disabled }: Readonly<{ disabled?: boolean }>) {
  // state
  const [cachedIds, setCachedIds] = useState<Set<string>>(new Set());

  // store
  const modelId = useStore((state) => state.llm.modelId);
  const isBusy = useStore((state) => state.llm.isBusy);
  const setLlmModelId = useStore((state) => state.setLlmModelId);

  // hooks
  const t = useTranslations('llm');

  const refreshCached = useCallback((isCancelled?: () => boolean) => {
    Promise.all(supportEngines.map(async (engine) => ((await checkModelCached(engine.id)) ? engine.id : null)))
      .then((ids) => {
        if (!isCancelled?.()) {
          setCachedIds(new Set(ids.filter((id): id is string => id !== null)));
        }
      })
      .catch(() => {});
  }, []);

  // useEffect
  useEffect(() => {
    let cancelled = false;

    refreshCached(() => cancelled);

    const unsubscribe = subscribeProgress((_, p) => {
      if (p >= 1) {
        refreshCached(() => cancelled);
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [refreshCached]);

  // handle
  const handleSelect = (id: string) => {
    setLlmModelId(id);

    // daisyUI focus dropdown 닫기
    (document.activeElement as HTMLElement | null)?.blur();
  };

  const handleDelete = async () => {
    try {
      await deleteModelCache(modelId);
    } finally {
      // 삭제 실패해도 실제 캐시 상태로 되돌린다
      refreshCached();
    }
  };

  const currentEngine = supportEngines.find((engine) => engine.id === modelId);
  const isDisabled = disabled || isBusy;

  return (
    <div className="flex flex-row items-center gap-2">
      <div className="dropdown">
        <div
          tabIndex={isDisabled ? -1 : 0}
          role="button"
          aria-label="AI model"
          className={cx('btn btn-sm w-52 justify-between font-normal', isDisabled && 'btn-disabled')}
        >
          <span className="truncate">{currentEngine?.displayName}</span>
          {cachedIds.has(modelId) && <span className="badge badge-success badge-xs flex-none">{t('downloaded')}</span>}
        </div>
        <ul tabIndex={0} className="menu dropdown-content rounded-box bg-base-200 z-30 mt-1 w-60 p-2 shadow-lg">
          {supportEngines.map((engine) => (
            <li key={engine.id}>
              <button
                type="button"
                className="flex flex-row items-center justify-between gap-2"
                onClick={() => handleSelect(engine.id)}
              >
                <span className="truncate">{engine.displayName}</span>
                {cachedIds.has(engine.id) && (
                  <span className="badge badge-success badge-xs flex-none">{t('downloaded')}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {cachedIds.has(modelId) && (
        <button
          type="button"
          className="btn btn-ghost btn-xs btn-square text-error"
          aria-label={t('deleteCache')}
          title={t('deleteCache')}
          disabled={isBusy || disabled}
          onClick={() => void handleDelete().catch(() => {})}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
