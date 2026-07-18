import Image from 'next/image';
import { LOW_POLY_ASSETS, type LowPolyIconName } from '@/lib/low-poly-assets';

export function LowPolyIcon({
  name,
  size = 32,
  alt = '',
}: {
  name: LowPolyIconName;
  size?: number;
  alt?: string;
}) {
  return (
    <Image
      src={LOW_POLY_ASSETS.icon[name]}
      width={size}
      height={size}
      alt={alt}
      aria-hidden={alt ? undefined : true}
    />
  );
}
