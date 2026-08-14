type LlmState = {
  llm: {
    modelId: string;
  };
  setLlmModelId: (modelId: string) => void;
};

export type { LlmState };
