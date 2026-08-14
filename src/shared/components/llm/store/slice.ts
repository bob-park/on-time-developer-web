import { DEFAULT_MODEL_ID } from '@/shared/components/llm/engine';
import { LlmState } from '@/shared/components/llm/store/llm.state';
import { BoundState } from '@/shared/store/rootStore';

import { SlicePattern } from 'zustand';

const createLlmSlice: SlicePattern<LlmState, BoundState> = (set) => ({
  llm: {
    modelId: DEFAULT_MODEL_ID,
  },
  setLlmModelId: (modelId: string) =>
    set(
      () => {
        return {
          llm: {
            modelId,
          },
        };
      },
      false,
      {
        type: 'llm/setLlmModelId',
      },
    ),
});

export default createLlmSlice;
