type UserState = {
  showAddUserModal: boolean;
  showRemoveUserModal: boolean;
  showRestoreUserModal: boolean;
  updateShowAddUserModal: (show: boolean) => void;
  updateShowRemoveUserModal: (show: boolean) => void;
  updateShowRestoreUserModal: (show: boolean) => void;
};

export type { UserState };
