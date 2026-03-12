import { useState, useCallback } from 'react';

export function useImageGallery() {
  const [open, setOpen] = useState(false);
  const [initialIndex, setInitialIndex] = useState(0);

  const openGallery = useCallback((index = 0) => {
    setInitialIndex(index);
    setOpen(true);
  }, []);

  const closeGallery = useCallback(() => setOpen(false), []);

  return { open, initialIndex, openGallery, closeGallery };
}
