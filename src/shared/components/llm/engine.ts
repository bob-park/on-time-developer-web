import { CreateWebWorkerMLCEngine, WebWorkerMLCEngine } from '@mlc-ai/web-llm';

let enginePromise: Promise<WebWorkerMLCEngine> | null = null;

export type EngineModel = {
  id: string;
  displayName: string;
  size: number;
};

export const supportEngines = [
  {
    id: 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC',
    displayName: 'Qwen2.5 1.5B',
    size: 4,
  },
  {
    id: 'Qwen2.5-3B-Instruct-q4f16_1-MLC',
    displayName: 'Qwen2.5 3B',
    size: 8,
  },
  {
    id: 'Qwen2.5-7B-Instruct-q4f16_1-MLC',
    displayName: 'Qwen2.5 7B',
    size: 16,
  },
  {
    id: 'Qwen3-0.6B-q4f16_1-MLC',
    displayName: 'Qwen3 0.6B',
    size: 4,
  },
  {
    id: 'Qwen3-4B-q4f32_1-MLC',
    displayName: 'Qwen3 4B',
    size: 16,
  },
  {
    id: 'Qwen3-8B-q4f32_1-MLC',
    displayName: 'Qwen3 8B',
    size: 16,
  },
];

export const DEFAULT_MODEL_ID = 'Qwen2.5-3B-Instruct-q4f16_1-MLC';

type EngineProps = {
  modelId?: string;
};

export function getEngine(
  { modelId = DEFAULT_MODEL_ID }: EngineProps,
  onProgress?: (text: string, progress: number) => void,
) {
  if (!enginePromise) {
    enginePromise = CreateWebWorkerMLCEngine(
      new Worker(new URL('./worker.ts', import.meta.url), {
        type: 'module',
      }),
      modelId,
      {
        initProgressCallback: (p) => onProgress?.(p.text, p.progress),
      },
    ).catch((e) => {
      // 실패한 promise 를 캐싱하지 않아야 다음 호출에서 재시도할 수 있다
      enginePromise = null;
      throw e;
    });
  }
  return enginePromise;
}
