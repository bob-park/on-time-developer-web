import { RoleType } from '@/domain/users/apis/users.dto';

const RoleHierarchy: Record<string, string[]> = {
  ROLE_ADMIN: ['ROLE_MANAGER'],
  ROLE_MANAGER: ['ROLE_USER'],
  ROLE_USER: [],
};

export function hasRole(current: RoleType, required: RoleType) {
  if (current === required) {
    return true;
  }

  return RoleHierarchy[current].includes(required);
}
