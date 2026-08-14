'use client';

import { useRouter } from 'next/navigation';

import Lottie from 'lottie-react';

import NotFoundLottie from './not-found.json';

export default function NotFound() {
  // hooks
  const router = useRouter();

  return (
    <div className="flex h-[calc(100vh-100px)] w-full flex-col items-center justify-center gap-3 overflow-y-auto">
      <div className="w-96">
        <Lottie animationData={NotFoundLottie} loop />
      </div>

      <div className="">
        <button className="btn btn-info rounded-full px-10 text-white" onClick={() => router.push('/')}>
          돌아가기
        </button>
      </div>
    </div>
  );
}
