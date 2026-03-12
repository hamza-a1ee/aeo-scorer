'use client';

import { ObjectFit, Size } from '@/types/types/image-viewer.type';
import { CSSProperties } from 'react';

// ===============================[ Interfaces ]===============================

export interface ImageItem {
  url: string;
  alt?: string;
  isImage?: boolean;
}

export interface ImageGalleryProps {
  images: (string | ImageItem)[];
  className?: string;
  imageClassName?: string;
  style?: CSSProperties;
  objectFit?: ObjectFit;
  rounded?: Size | 'full';
  imageSize?: number;
  imageWidth?: number;
  imageHeight?: number;
  gap?: number;
}

export interface BoxProps extends ImageGalleryProps {
  maxBoxLimit?: number;
}

// ===============================[ Utility Functions ]===============================

export function returnObjectFit(objectFit?: ObjectFit) {
  switch (objectFit) {
    case 'contain':
      return 'object-contain';
    case 'cover':
      return 'object-cover';
    case 'fill':
      return 'object-fill';
    case 'none':
      return 'object-none';
    case 'scale-down':
      return 'object-scale-down';
    default:
      return 'object-cover';
  }
}

export function returnRounded(rounded?: Size | 'full') {
  switch (rounded) {
    case '2xl':
      return 'rounded-2xl';
    case '3xl':
      return 'rounded-3xl';
    case '4xl':
      return 'rounded-4xl';
    case '5xl':
      return 'rounded-5xl';
    case 'lg':
      return 'rounded-lg';
    case 'base':
      return 'rounded-base';
    case 'sm':
      return 'rounded-sm';
    case 'xl':
      return 'rounded-xl';
    case 'xs':
      return 'rounded-xs';
    case 'full':
      return 'rounded-full';
    default:
      return 'rounded-lg';
  }
}

function isImageUrl(url: string): boolean {
  return /\.(jpg|jpeg|png|gif|bmp|svg|webp)$/i.test(url);
}

export function normalizeImages(images: (string | ImageItem)[]): ImageItem[] {
  return images?.map(item =>
    typeof item === 'string'
      ? { url: item, alt: 'Image', isImage: isImageUrl(item) }
      : {
          ...item,
          isImage: item.isImage ?? isImageUrl(item.url),
          alt: item.alt || 'Image',
        },
  );
}
