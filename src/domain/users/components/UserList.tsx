'use client';

import { BsThreeDotsVertical } from 'react-icons/bs';
import { IoTrashOutline } from 'react-icons/io5';
import { TbArrowBack } from 'react-icons/tb';

import { User } from '@/domain/users/apis/users.dto';
import UserAvatar from '@/domain/users/components/UserAvatar';
import UserRoleBadge from '@/domain/users/components/UserRoleBadge';
import TimeAgoKo from '@/shared/components/timeago';

import cx from 'classnames';

const UserItem = ({
  isMe = false,
  user,
  onClick,
  onDelete,
  onRestore,
}: Readonly<{
  isMe?: boolean;
  user: User;
  onClick?: (id: string) => void;
  onDelete?: (id: string) => void;
  onRestore?: (id: string) => void;
}>) => {
  // handle
  const handleRowClick = () => {
    onClick?.(user.id);
  };

  const handleDelete = () => {
    !isMe && !user.isDeleted && onDelete?.(user.id);
  };

  const handleRestore = () => {
    !isMe && user.isDeleted && onRestore?.(user.id);
  };

  return (
    <div
      className={cx(
        'flex cursor-pointer flex-row items-center gap-2 rounded-xl px-5 py-3 transition-all duration-300 hover:bg-gray-50',
      )}
      onClick={handleRowClick}
    >
      <div className="w-96 shrink">
        <div className="flex flex-row items-center gap-3">
          <div className="w-12 flex-none">
            <UserAvatar username={user.username} />
          </div>

          <div className="flex flex-col items-center gap-1">
            <div className="flex w-full flex-row items-center gap-2">
              <p
                className={cx('text-left text-base font-semibold', user.isDeleted && 'line-through decoration-double')}
              >
                {user.username}
              </p>
              {isMe && <div className="badge badge-xs badge-soft badge-success">나</div>}
              {user.isDeleted && <div className="badge badge-xs badge-soft badge-warning">삭제됨</div>}
            </div>
            <p
              className={cx(
                'text-semibold w-full text-xs text-gray-400',
                user.isDeleted && 'line-through decoration-double',
              )}
            >{`@${user.userId}`}</p>
          </div>
        </div>
      </div>
      <div className="w-28 flex-none">
        <div className="text-center">
          <UserRoleBadge role={user.role.type} />
        </div>
      </div>
      <div className="w-36 flex-none">
        <div className="text-center text-gray-500">
          <TimeAgoKo datetime={user.createdDate} />
        </div>
      </div>
      <div className="w-36 flex-none">
        <div className="text-center text-gray-500">
          {user.lastModifiedDate && <TimeAgoKo datetime={user.lastModifiedDate} />}
        </div>
      </div>
      <div className="w-12 flex-none">
        <div
          className="dropdown dropdown-end"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <button className="btn btn-ghost btn-circle text-gray-400" tabIndex={0}>
            <BsThreeDotsVertical className="size-6" />
          </button>
          <ul tabIndex={0} className="menu dropdown-content rounded-box z-[1] mt-1 w-36 bg-[#f5f7ff] p-2 shadow">
            <li>
              <div
                className={cx('flex flex-row items-center', !user.isDeleted && 'text-gray-300')}
                onClick={handleRestore}
              >
                <div className="w-6 flex-none">
                  <TbArrowBack className="size-5" />
                </div>
                <div className="">
                  <p className="">사용자 복원</p>
                </div>
              </div>
            </li>
            <li>
              <div
                className={cx(
                  'flex flex-row items-center hover:bg-red-100',
                  isMe || user.isDeleted ? 'text-gray-300' : 'text-red-400',
                )}
                onClick={handleDelete}
              >
                <div className="w-6 flex-none">
                  <IoTrashOutline className="size-5" />
                </div>
                <div className="">
                  <p className="">삭제</p>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default function UserList({
  me,
  users,
  onRowClick,
  onRowDelete,
  onRowRestore,
}: Readonly<{
  me?: User;
  users: User[];
  onRowClick?: (id: string) => void;
  onRowDelete?: (id: string) => void;
  onRowRestore?: (id: string) => void;
}>) {
  return (
    <div className="flex size-full flex-col gap-2">
      {/* headers */}
      <div className="flex flex-row gap-2 rounded-xl bg-gray-50 px-5 py-3">
        <div className="w-96 shrink">
          <p className="text-center font-semibold text-gray-400">사용자</p>
        </div>
        <div className="w-28 flex-none">
          <p className="text-center font-semibold text-gray-400">역할</p>
        </div>
        <div className="w-36 flex-none">
          <p className="text-center font-semibold text-gray-400">등록일</p>
        </div>
        <div className="w-36 flex-none">
          <p className="text-center font-semibold text-gray-400">수정일</p>
        </div>
        <div className="w-12 flex-none"></div>
      </div>

      {/* contents */}
      {users.map((user) => (
        <UserItem
          key={`user-item-${user.id}`}
          isMe={me?.id === user.id}
          user={user}
          onClick={onRowClick}
          onDelete={onRowDelete}
          onRestore={onRowRestore}
        />
      ))}
    </div>
  );
}
