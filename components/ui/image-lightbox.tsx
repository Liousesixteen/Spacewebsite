'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { SmartImage } from './smart-image';
import { cn } from '@/lib/utils';

export interface ImageLightboxProps {
  images: string[];
  alt: string;
}

export function ImageLightbox({ images, alt }: ImageLightboxProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const open = useCallback((index: number) => {
    setLightboxIndex(index);
  }, []);

  const close = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const goNext = useCallback(() => {
    setLightboxIndex((prev) => {
      if (prev === null) return null;
      return (prev + 1) % images.length;
    });
  }, [images.length]);

  const goPrev = useCallback(() => {
    setLightboxIndex((prev) => {
      if (prev === null) return null;
      return (prev - 1 + images.length) % images.length;
    });
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          close();
          break;
        case 'ArrowRight':
          goNext();
          break;
        case 'ArrowLeft':
          goPrev();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    // Prevent body scroll while lightbox is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [lightboxIndex, close, goNext, goPrev]);

  // Focus trap: focus overlay on open
  useEffect(() => {
    if (lightboxIndex !== null && overlayRef.current) {
      overlayRef.current.focus();
    }
  }, [lightboxIndex]);

  if (!images || images.length === 0) {
    return null;
  }

  // Single image: just a clickable single image
  if (images.length === 1) {
    return (
      <>
        <div
          className="relative w-full aspect-[16/9] cursor-pointer overflow-hidden rounded-lg group"
          onClick={() => open(0)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') open(0);
          }}
          aria-label={`View full-size image of ${alt}`}
        >
          <SmartImage
            src={images[0]}
            alt={alt}
            fallback="launch"
            fill
            sizes="(max-width: 768px) 100vw, 896px"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
            <span className="text-star-white opacity-0 group-hover:opacity-100 transition-opacity text-sm bg-black/50 px-3 py-1.5 rounded-full">
              点击放大
            </span>
          </div>
        </div>

        {/* Lightbox overlay for single image */}
        {lightboxIndex !== null && (
          <div
            ref={overlayRef}
            tabIndex={-1}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
            onClick={close}
            role="dialog"
            aria-modal="true"
            aria-label={`${alt} full size`}
          >
            <button
              className="absolute top-4 right-4 p-2 rounded-full bg-space-700/80 text-star-white hover:bg-space-600 transition-colors z-10"
              onClick={close}
              aria-label="Close lightbox"
            >
              <X className="w-6 h-6" />
            </button>
            <div
              className="relative max-w-[90vw] max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[0]}
                alt={alt}
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
            </div>
          </div>
        )}
      </>
    );
  }

  // Multiple images: thumbnail grid + lightbox
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {images.map((image, index) => (
          <div
            key={index}
            className="relative aspect-[16/10] cursor-pointer overflow-hidden rounded-lg group"
            onClick={() => open(index)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') open(index);
            }}
            aria-label={`View image ${index + 1} of ${alt}`}
          >
            <SmartImage
              src={image}
              alt={`${alt} ${index + 1}`}
              fallback="launch"
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
              <span className="text-star-white opacity-0 group-hover:opacity-100 transition-opacity text-sm bg-black/50 px-3 py-1.5 rounded-full">
                点击放大
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox overlay */}
      {lightboxIndex !== null && (
        <div
          ref={overlayRef}
          tabIndex={-1}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label={`${alt} full size image ${lightboxIndex + 1} of ${images.length}`}
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 p-2 rounded-full bg-space-700/80 text-star-white hover:bg-space-600 transition-colors z-10"
            onClick={close}
            aria-label="Close lightbox"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Image counter */}
          <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-space-700/80 text-star-white text-sm z-10">
            {lightboxIndex + 1} / {images.length}
          </div>

          {/* Previous button */}
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-space-700/80 text-star-white hover:bg-space-600 transition-colors z-10"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Next button */}
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-space-700/80 text-star-white hover:bg-space-600 transition-colors z-10"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Full-size image */}
          <div
            className="relative max-w-[85vw] max-h-[85vh] select-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[lightboxIndex]}
              alt={`${alt} ${lightboxIndex + 1}`}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
              draggable={false}
            />
          </div>
        </div>
      )}
    </>
  );
}
