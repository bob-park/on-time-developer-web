'use client';

import { supportEngines } from '@/shared/components/llm/engine';
import { useStore } from '@/shared/store/rootStore';

export default function ModelSelect({ disabled }: Readonly<{ disabled?: boolean }>) {
  // store
  const modelId = useStore((state) => state.llm.modelId);
  const isBusy = useStore((state) => state.llm.isBusy);
  const setLlmModelId = useStore((state) => state.setLlmModelId);

  return (
    <select
      className="select select-sm w-40"
      aria-label="AI model"
      value={modelId}
      disabled={disabled || isBusy}
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
