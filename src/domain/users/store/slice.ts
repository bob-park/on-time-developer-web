import { UserState } from '@/domain/users/store/users.state';
import { BoundState } from '@/shared/store/rootStore';

import { SlicePattern } from 'zustand';

const createUserSlice: SlicePattern<UserState, BoundState> = (set) => ({
  showAddUserModal: false,
  showRemoveUserModal: false,
  showRestoreUserModal: false,
  updateShowAddUserModal: (show: boolean) =>
    set(
      () => {
        return {
          showAddUserModal: show,
        };
      },
      false,
      {
        type: 'users/updateShowAddUserModal',
      },
    ),
  updateShowRemoveUserModal: (show: boolean) =>
    set(
      () => {
        return {
          showRemoveUserModal: show,
        };
      },
      false,
      {
        type: 'users/updateShowRemoveUserModal',
      },
    ),
  updateShowRestoreUserModal: (show: boolean) =>
    set(
      () => {
        return {
          showRestoreUserModal: show,
        };
      },
      false,
      {
        type: 'users/updateShowRestoreUserModal',
      },
    ),
});

export default createUserSlice;
