import { useState } from 'react';

import Image from 'next/image';

interface UserAvatarProps {
  src?: string | false;
  size?: 'sm' | 'md' | 'base' | 'lg' | 'xl';
  username: string;
}

export default function UserAvatar({ src, size = 'base', username }: Readonly<UserAvatarProps>) {
  // state
  const [isError, setIsError] = useState<boolean>(false);

  return (
    <div className="avatar">
      <div className="size-9 rounded-full">
        {src && !isError ? (
          <Image className="size-full rounded-full" src={src} alt="user-avatar" fill onError={() => setIsError(true)} />
        ) : (
          <div className="flex size-full items-center justify-center rounded-full bg-black">
            <span className="text-lg text-white">{username.charAt(0).toUpperCase()}</span>
          </div>
        )}
      </div>
    </div>
  );
}
