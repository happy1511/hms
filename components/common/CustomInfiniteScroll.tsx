"use client";

import React, { useCallback, useMemo, useRef } from "react";

interface InfiniteScrollProps {
  isLoading: boolean;
  hasMore: boolean;
  next: () => unknown;
  threshold?: number;
  root?: Element | Document | null;
  rootMargin?: string;
  reverse?: boolean;
  children?: React.ReactNode;
}

export default function InfiniteScroll({
  isLoading,
  hasMore,
  next,
  threshold = 1,
  root = null,
  rootMargin = "0px",
  reverse,
  children,
}: InfiniteScrollProps) {
  const observer = useRef<IntersectionObserver | null>(null);

  const observerRef = useCallback(
    (element: HTMLElement | null) => {
      let safeThreshold = threshold;

      if (threshold < 0 || threshold > 1) {
        safeThreshold = 1;
      }

      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      if (!element) return;

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            next();
          }
        },
        { threshold: safeThreshold, root, rootMargin },
      );

      observer.current.observe(element);
    },
    [hasMore, isLoading, next, threshold, root, rootMargin],
  );

  const flattenChildren = useMemo(
    () => React.Children.toArray(children),
    [children],
  );

  return (
    <>
      {!reverse && flattenChildren}

      <div ref={observerRef} style={{ height: 1 }} />

      {reverse && flattenChildren}
    </>
  );
}
