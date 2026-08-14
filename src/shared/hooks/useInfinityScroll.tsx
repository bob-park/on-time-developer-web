'use client';

import { useEffect, useRef } from 'react';

interface InfinityScrollProps {
  hasMore: boolean;
  options?: {
    threshold: number;
    intersectionRatio: number;
  };
  onNext?: () => Promise<void>;
}

export default function useInfinityScroll({
  hasMore,
  options = { threshold: 1, intersectionRatio: 1 },
  onNext,
}: Readonly<InfinityScrollProps>) {
  // ref
  const ref = useRef<HTMLDivElement>(null);

  // useEffect
  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const observer = new IntersectionObserver(
      async (entries) => {
        const isExecute = entries.every((entry) => entry.intersectionRatio > options?.intersectionRatio);

        if (isExecute) {
          await onNext?.();
        }
      },
      { threshold: options.threshold },
    );

    hasMore ? observer.observe(ref.current) : observer.unobserve(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [hasMore]);

  return [ref];
}
