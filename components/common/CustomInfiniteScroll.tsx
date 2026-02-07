import * as React from "react";

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
  const observer = React.useRef<IntersectionObserver | null>(null);

  const observerRef = React.useCallback(
    (element: HTMLElement | null) => {
      if (isLoading) return;

      let safeThreshold = threshold;
      if (threshold < 0 || threshold > 1) {
        console.warn("threshold must be between 0 and 1. Using 1 instead.");
        safeThreshold = 1;
      }

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

  const items = React.Children.toArray(children);
  const observeIndex = reverse ? 0 : items.length - 1;

  return (
    <>
      {items.map((child, index) => {
        if (index === observeIndex) {
          return (
            <div key={index} ref={observerRef}>
              {child}
            </div>
          );
        }
        return child;
      })}
    </>
  );
}
