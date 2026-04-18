'use client';

import { useState } from 'react';
import Image from 'next/image';

interface Props {
  src?: string | null;
  name: string;
  size?: number;
  className?: string;
}

export default function ToolLogo({ src, name, size = 48, className = 'w-full h-full object-contain p-1' }: Props) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <span className="text-lg font-bold text-gray-400 dark:text-gray-500 select-none">
        {name[0]?.toUpperCase()}
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={name}
      width={size}
      height={size}
      className={className}
      onError={() => setFailed(true)}
      unoptimized
    />
  );
}
