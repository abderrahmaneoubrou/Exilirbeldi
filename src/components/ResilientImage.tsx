import { useState } from 'react';
import { Wheat } from 'lucide-react';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}

export function ResilientImage({
  src,
  alt,
  className = '',
  fallbackTitle,
}: ResilientImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[#ECEAE2] text-[#5C615D] p-6 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <Wheat className="w-7 h-7 text-[#2D4732]/60 mb-2" strokeWidth={1.5} />
        <span className="font-display text-sm text-[#171C18]">
          {fallbackTitle || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
