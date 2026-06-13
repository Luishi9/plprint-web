import { cn } from '@/lib/utils';

interface IconProps {
  name: string;
  size?: number;
  className?: string;
  filled?: boolean;
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700;
}

export function Icon({
  name,
  size = 24,
  className,
  filled = false,
  weight = 400,
}: IconProps) {
  return (
    <span
      className={cn('material-symbols-rounded inline-flex items-center justify-center align-middle', className)}
      style={{
        fontSize: `${size}px`,
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' ${weight}, 'GRAD' 0, 'opsz' ${size}`,
        lineHeight: 1,
        verticalAlign: 'middle',
      }}
    >
      {name}
    </span>
  );
}
