import { useEffect, useRef } from "react";

function useInfiniteScroll({
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
}: {
  fetchNextPage?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current || !fetchNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "100px" },
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return ref;
}

export default useInfiniteScroll;
