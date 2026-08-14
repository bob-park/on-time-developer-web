import { CreateWebWorkerMLCEngine, WebWorkerMLCEngine } from '@mlc-ai/web-llm';

let enginePromise: Promise<WebWorkerMLCEngine> | null = null;

export const DEFAULT_MODEL_ID = 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC';

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
    );
  }
  return enginePromise;
}
