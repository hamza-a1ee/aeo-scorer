'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { isImageUrl } from '@/utils/file.util';
import { ExternalLink, Minus, Plus } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

const MIN_SCALE = 0.5;
const MAX_SCALE = 4;
const SCALE_STEP = 0.25;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  url: string | null | undefined;
}

export default function PreviewDialog({
  open,
  onOpenChange,
  title,
  url,
}: Props) {
  const hasUrl = !!url?.trim();
  const isImage = hasUrl && isImageUrl(url as string);

  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, translateX: 0, translateY: 0 });

  const resetTransform = useCallback(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    if (!open) resetTransform();
  }, [open, resetTransform]);

  useEffect(() => {
    if (url) resetTransform();
  }, [url, resetTransform]);

  const zoomIn = () => setScale(s => Math.min(MAX_SCALE, s + SCALE_STEP));
  const zoomOut = () => setScale(s => Math.max(MIN_SCALE, s - SCALE_STEP));

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();
      setIsDragging(true);
      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
        translateX: translate.x,
        translateY: translate.y,
      };
    },
    [translate],
  );

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      setTranslate({
        x: dragStart.current.translateX + e.clientX - dragStart.current.x,
        y: dragStart.current.translateY + e.clientY - dragStart.current.y,
      });
    },
    [isDragging],
  );

  const onMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (!isDragging) return;
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging, onMouseMove, onMouseUp]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] w-full max-w-4xl overflow-hidden p-0 gap-0"
        showCloseButton={true}
      >
        {title && (
          <DialogHeader className="shrink-0 border-b px-6 py-3">
            <DialogTitle className="text-base font-medium">{title}</DialogTitle>
          </DialogHeader>
        )}

        {hasUrl && (isImage || true) && (
          <div className="flex items-center gap-2 border-b border-neutral-gray-20 px-4 py-2">
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={zoomOut}
              disabled={scale <= MIN_SCALE}
              aria-label="Zoom out"
            >
              <Minus className="size-4" />
            </Button>
            <span className="text-muted-foreground min-w-12 text-center text-sm">
              {Math.round(scale * 100)}%
            </span>
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={zoomIn}
              disabled={scale >= MAX_SCALE}
              aria-label="Zoom in"
            >
              <Plus className="size-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={resetTransform}
              className="ml-2"
            >
              Reset
            </Button>
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => url && window.open(url, '_blank', 'noopener,noreferrer')}
              className="ml-auto"
              aria-label="Open in new tab"
            >
              <ExternalLink className="size-4" />
              Open in new tab
            </Button>
          </div>
        )}

        <div
          className="relative min-h-[50vh] w-full overflow-hidden bg-neutral-gray-10 p-4 md:p-6"
          style={{
            cursor: isImage ? (isDragging ? 'grabbing' : 'grab') : 'default',
          }}
          onMouseDown={isImage ? onMouseDown : undefined}
          onKeyDown={e => {
            if (e.key === 'Escape') onOpenChange(false);
          }}
        >
          {!hasUrl ? (
            <p className="text-muted-foreground text-sm">
              No preview available.
            </p>
          ) : isImage ? (
            <div
              className="relative mx-auto h-[60vh] min-h-75 w-full max-w-3xl transition-transform duration-0"
              style={{
                transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
                transformOrigin: 'center center',
              }}
            >
              <Image
                src={url as string}
                alt={title ?? 'Preview'}
                fill
                className="object-contain pointer-events-none select-none"
                unoptimized
                sizes="(max-width: 1024px) 100vw, 896px"
                draggable={false}
              />
            </div>
          ) : (
            <div
              className="mx-auto h-[70vh] w-full max-w-3xl transition-transform duration-0"
              style={{
                transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
                transformOrigin: 'center center',
              }}
            >
              <iframe
                src={url as string}
                title={title ?? 'Document preview'}
                className="h-full w-full rounded-lg border border-neutral-gray-40 bg-white"
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
