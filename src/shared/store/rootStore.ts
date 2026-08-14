import createUserSlice from '@/domain/users/store/slice';
import { UserState } from '@/domain/users/store/users.state';
import { LlmState } from '@/shared/components/llm/store/llm.state';
import createLlmSlice from '@/shared/components/llm/store/slice';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export const useStore = create<BoundState>()(
  devtools(
    immer((...a) => ({
      ...createUserSlice(...a),
      ...createLlmSlice(...a),
    })),
    { name: 'smart-scoreboard-manager', enabled: process.env.NODE_ENV !== 'production' },
  ),
);

export type BoundState = UserState & LlmState;
