'use client';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { ImageItem } from '@/utils/image-functions-and-utils';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
  images: ImageItem[];
  initialIndex: number;
  open: boolean;
  onClose: () => void;
}

// ===============================[ Image Modal ]===============================

const ImageGalleryModal = ({ images, initialIndex, open, onClose }: Props) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Only show images in modal
  const imageItems = images.filter(item => item.isImage);

  useEffect(() => {
    if (open) {
      // Find the correct image index in filtered array
      let imageIndex = 0;
      let count = 0;
      for (let i = 0; i <= initialIndex && i < images.length; i++) {
        if (images[i].isImage) {
          if (i === initialIndex) {
            imageIndex = count;
            break;
          }
          count++;
        }
      }
      setCurrentIndex(imageIndex);
    }
  }, [open, initialIndex, images]);

  const handlePrevious = () => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : imageItems.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev < imageItems.length - 1 ? prev + 1 : 0));
  };

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  if (!open || imageItems.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          'bg-black/70',
          'in-w-dvh h-dvh sm:max-w-none max-w-none max-h-none',
          'flex flex-col items-center',
          imageItems.length > 1 ? 'justify-between' : 'gap-10',
          'border-none rounded-none',
          'py-3',
          'px-2 md:px-6',
        )}
        showCloseButton={false}
        onClick={e => {
          e.stopPropagation();
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <DialogTitle className="hidden">Image Gallery</DialogTitle>
        {/* Top section */}
        <div className="flex items-center justify-between w-full">
          {/* Counter */}
          <div className="w-8 h-8" />
          <div className="bg-black/50 px-3 py-1 rounded text-white text-sm shrink-0">
            {currentIndex + 1} / {imageItems.length}
          </div>
          {/* Close button */}
          <button
            onClick={e => {
              e.stopPropagation();
              onClose();
            }}
            className="cursor-pointer p-3 bg-black/50 hover:bg-black/70 rounded-full text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Middle section */}
        <div className="flex w-full justify-between h-[calc(100%-160px)] gap-2">
          <div className="flex items-center">
            <button
              onClick={e => {
                e.stopPropagation();
                handlePrevious();
              }}
              className="p-1 md:p-3 bg-black/50 hover:bg-black/70 rounded-full text-white h-fit w-fit"
            >
              <ChevronLeft className="w-5 h-5 md:w-8 md:h-8" />
            </button>
          </div>
          <div className="flex items-center max-w-[calc(100%-32px)] max-h-[calc(100%)]">
            {/* eslint-disable-next-line */}
            <img
              src={imageItems[currentIndex]?.url}
              alt={imageItems[currentIndex]?.alt}
              className="h-full w-auto object-contain"
            />
          </div>
          <div className="flex items-center">
            <button
              onClick={e => {
                e.stopPropagation();
                handleNext();
              }}
              className="p-1 md:p-3 bg-black/50 hover:bg-black/70 rounded-full text-white h-fit w-fit"
            >
              <ChevronRight className="w-5 h-5 md:w-8 md:h-8" />
            </button>
          </div>
        </div>
        {/* End section */}
        {imageItems.length > 1 && (
          <div className="bg-black/70 rounded-lg p-2 shrink-0">
            <div className="flex space-x-2 max-w-full overflow-x-auto custom-scrollbar">
              {imageItems.map((item, index) => (
                <button
                  key={index}
                  onClick={e => {
                    e.stopPropagation();
                    setCurrentIndex(index);
                  }}
                  className={cn(
                    'w-12 h-12 rounded overflow-hidden shrink-0 border-2',
                    index === currentIndex
                      ? 'border-white'
                      : 'border-transparent',
                  )}
                >
                  {/* eslint-disable-next-line */}
                  <img
                    src={item.url}
                    alt={item.alt}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ImageGalleryModal;
