'use client';

import { RoleType } from '@/domain/users/apis/users.dto';

import cx from 'classnames';

function parseRoleType(role: RoleType) {
  switch (role) {
    case 'ROLE_ADMIN':
      return '관리자';
    case 'ROLE_MANAGER':
      return '운영자';
    case 'ROLE_USER':
      return '사용자';
    default:
      return '';
  }
}

export default function UserRoleBadge({ role }: Readonly<{ role: RoleType }>) {
  return (
    <div
      className={cx('badge badge-soft', {
        'badge-info': role === 'ROLE_USER',
        'badge-primary': role === 'ROLE_MANAGER',
        'badge-secondary': role === 'ROLE_ADMIN',
      })}
    >
      {parseRoleType(role)}
    </div>
  );
}
