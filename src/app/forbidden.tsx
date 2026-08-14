'use client';

import { useRouter } from 'next/navigation';

import ForbiddenLottie from '@/app/forbidden.json';

import Lottie from 'lottie-react';

export default function Forbidden() {
  // hooks
  const router = useRouter();

  return (
    <div className="flex h-[calc(100vh-100px)] w-full flex-col items-center justify-center gap-3">
      <div className="w-96">
        <Lottie animationData={ForbiddenLottie} loop />
      </div>

      <div className="">
        <button className="btn btn-info rounded-full px-10 text-white" onClick={() => router.push('/')}>
          돌아가기
        </button>
      </div>
    </div>
  );
}
