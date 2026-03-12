import { useEffect, useRef, useCallback } from "react";

interface Props {
  dataLength: number;
  next: () => void;
  hasMore: boolean;
  loader: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export default function InfiniteScroll({
  dataLength,
  next,
  hasMore,
  loader,
  className,
  children,
}: Props) {
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore) {
        next();
      }
    },
    [hasMore, next]
  );

  useEffect(() => {
    const currentElement = loaderRef.current;
    if (!currentElement) return;

    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "200px",
      threshold: 0.5,
    });

    observer.observe(currentElement);

    return () => observer.disconnect();
  }, [handleObserver, dataLength]);

  return (
    <div className={className}>
      {children}
      {hasMore && (
        <div ref={loaderRef} className="infinite-scroll-loader">
          {loader}
        </div>
      )}
    </div>
  );
}
