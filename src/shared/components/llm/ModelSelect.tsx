'use client';

import { supportEngines } from '@/shared/components/llm/engine';
import { useStore } from '@/shared/store/rootStore';

import { useTranslations } from 'next-intl';

export default function ModelSelect({ disabled }: Readonly<{ disabled?: boolean }>) {
  // store
  const modelId = useStore((state) => state.llm.modelId);
  const setLlmModelId = useStore((state) => state.setLlmModelId);

  // hooks
  const t = useTranslations('llm');

  return (
    <label className="flex flex-row items-center gap-2">
      <span className="flex-none text-sm opacity-70">{t('model')}</span>
      <select
        className="select select-sm w-40"
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
    </label>
  );
}
