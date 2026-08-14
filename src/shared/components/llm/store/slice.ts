import { DEFAULT_MODEL_ID } from '@/shared/components/llm/engine';
import { LlmState } from '@/shared/components/llm/store/llm.state';
import { BoundState } from '@/shared/store/rootStore';

import { SlicePattern } from 'zustand';

const createLlmSlice: SlicePattern<LlmState, BoundState> = (set) => ({
  llm: {
    modelId: DEFAULT_MODEL_ID,
    isBusy: false,
  },
  setLlmModelId: (modelId: string) =>
    set(
      (state) => {
        return {
          llm: {
            ...state.llm,
            modelId,
          },
        };
      },
      false,
      {
        type: 'llm/setLlmModelId',
      },
    ),
  setLlmBusy: (isBusy: boolean) =>
    set(
      (state) => {
        return {
          llm: {
            ...state.llm,
            isBusy,
          },
        };
      },
      false,
      {
        type: 'llm/setLlmBusy',
      },
    ),
});

export default createLlmSlice;
