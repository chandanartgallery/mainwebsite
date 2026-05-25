'use client';

import { ImageOff } from 'lucide-react';
import { useMemo, useState, type HTMLAttributeReferrerPolicy } from 'react';

type SmartImageProps = {
  src?: null | string;
  alt: string;
  className?: string;
  containerClassName?: string;
  fallbackSrc?: string;
  fallbackLabel?: string;
  priority?: boolean;
  draggable?: boolean;
  referrerPolicy?: HTMLAttributeReferrerPolicy;
  onClick?: () => void;
  onLoaded?: () => void;
};

export default function SmartImage({
  src,
  alt,
  className = '',
  containerClassName = '',
  fallbackSrc,
  fallbackLabel,
  priority = false,
  draggable = false,
  referrerPolicy,
  onClick,
  onLoaded,
}: SmartImageProps) {
  const [imageState, setImageState] = useState<Record<string, { loaded: boolean; failed: boolean; usingFallback: boolean }>>({});
  const normalizedSrc = typeof src === 'string' ? src.trim() : '';
  const normalizedFallbackSrc = typeof fallbackSrc === 'string' ? fallbackSrc.trim() : '';
  const imageKey = `${normalizedSrc}|${normalizedFallbackSrc}`;
  const currentState = imageState[imageKey] || { loaded: false, failed: false, usingFallback: false };
  const hasSrc = (normalizedSrc || normalizedFallbackSrc).length > 0;
  const imageSrc = (!currentState.failed && (normalizedSrc || normalizedFallbackSrc)) || '';
  const safeAlt = useMemo(() => alt || 'Image', [alt]);

  return (
    <div className={`image-shell ${containerClassName}`}>
      {!currentState.loaded && hasSrc && !currentState.failed && <div className="image-skeleton" aria-hidden="true" />}

      {hasSrc && !currentState.failed ? (
        <img
          key={imageKey}
          src={imageSrc}
          alt={safeAlt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          draggable={draggable}
          referrerPolicy={referrerPolicy ?? 'no-referrer'}
          className={`${className} ${currentState.loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
          onLoad={() => {
            setImageState((prev) => ({
              ...prev,
              [imageKey]: {
                loaded: true,
                failed: false,
                usingFallback: currentState.usingFallback,
              },
            }));
            onLoaded?.();
          }}
          onError={(event) => {
            if (!currentState.usingFallback && normalizedFallbackSrc && normalizedSrc && event.currentTarget.src !== normalizedFallbackSrc) {
              setImageState((prev) => ({
                ...prev,
                [imageKey]: {
                  loaded: false,
                  failed: false,
                  usingFallback: true,
                },
              }));
              event.currentTarget.src = normalizedFallbackSrc;
              return;
            }
            setImageState((prev) => ({
              ...prev,
              [imageKey]: {
                loaded: false,
                failed: true,
                usingFallback: true,
              },
            }));
          }}
          onClick={onClick}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center text-stone-500 dark:text-stone-400">
          <ImageOff className="h-5 w-5" aria-hidden="true" />
          <span className="text-[0.68rem] font-semibold uppercase tracking-[0.16em]">
            {fallbackLabel || 'Preview unavailable'}
          </span>
        </div>
      )}
    </div>
  );
}
