'use client';

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';

const DEFAULT_FALLBACK = 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80';

export interface SafeImageProps extends Omit<ImageProps, 'src'> {
  src?: string | null;
  fallbackSrc?: string;
  category?: 'spot' | 'camera' | 'festival' | 'lab';
}

const THEMATIC_FALLBACKS: Record<string, string> = {
  spot: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800&auto=format&fit=crop&q=80',
  camera: 'https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?w=800&auto=format&fit=crop&q=80',
  festival: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80',
  lab: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80',
};

// 1. HTTP -> HTTPS 자동 업그레이드 및 폴백 정제
function sanitizeUrl(url: string | null | undefined, fallback: string): string {
  if (!url || typeof url !== 'string' || url.trim() === '') return fallback;
  let clean = url.trim();
  if (clean.startsWith('http://')) {
    clean = clean.replace('http://', 'https://');
  }
  return clean;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  fallbackSrc,
  category = 'spot',
  alt = 'DASI 이미지',
  className = '',
  ...props
}) => {
  const chosenFallback = fallbackSrc || THEMATIC_FALLBACKS[category] || DEFAULT_FALLBACK;

  const [imgSrc, setImgSrc] = useState<string>(() => sanitizeUrl(src, chosenFallback));
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // src 변경 시 상태 동기화
  React.useEffect(() => {
    setImgSrc(sanitizeUrl(src, chosenFallback));
    setHasError(false);
    setIsLoading(true);
  }, [src, chosenFallback]);

  return (
    <div className={`relative overflow-hidden ${props.fill ? 'w-full h-full' : ''} ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-vintage-100 dark:bg-stone-800 animate-pulse z-1 flex items-center justify-center">
          <span className="sr-only">이미지 로딩 중...</span>
        </div>
      )}
      <Image
        {...props}
        src={hasError ? chosenFallback : imgSrc}
        alt={alt}
        className={`${props.fill ? 'object-cover' : ''} transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          if (!hasError) {
            setHasError(true);
            setImgSrc(chosenFallback);
            setIsLoading(false);
          }
        }}
        unoptimized={props.unoptimized ?? true}
      />
    </div>
  );
};
