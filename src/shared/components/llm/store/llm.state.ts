type LlmState = {
  llm: {
    modelId: string;
    isBusy: boolean;
  };
  setLlmModelId: (modelId: string) => void;
  setLlmBusy: (isBusy: boolean) => void;
};

export type { LlmState };
