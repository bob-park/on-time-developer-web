import {
  AppConfig,
  CreateWebWorkerMLCEngine,
  WebWorkerMLCEngine,
  deleteModelAllInfoInCache,
  hasModelInCache,
  prebuiltAppConfig,
} from '@mlc-ai/web-llm';

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
];

export const DEFAULT_MODEL_ID = 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC';

export const ENGINE_APP_CONFIG: AppConfig = {
  ...prebuiltAppConfig,
  // 기본 Cache API 백엔드 사용 (IndexedDB 미사용)
  cacheBackend: 'cache',
};

export function checkModelCached(modelId: string) {
  return hasModelInCache(modelId, ENGINE_APP_CONFIG);
}

export function deleteModelCache(modelId: string) {
  return deleteModelAllInfoInCache(modelId, ENGINE_APP_CONFIG);
}

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
      appConfig: ENGINE_APP_CONFIG,
      initProgressCallback: (p) => progressListeners.forEach((listener) => listener(p.text, p.progress)),
    }).catch((e) => {
      // 실패한 promise 를 캐싱하지 않아야 다음 호출에서 재시도할 수 있다
      if (enginePromise === promise) {
        enginePromise = null;
        currentModelId = null;
      }
      throw e;
    });

    enginePromise = promise;
  }

  return enginePromise;
}
