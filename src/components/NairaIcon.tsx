/**
 * NairaIcon — A styled Naira (₦) symbol that matches the size and weight
 * of Lucide icons so it can be used as a drop-in replacement for DollarSign.
 *
 * Usage:
 *   import { NairaIcon } from '@/components/NairaIcon';
 *   <NairaIcon className="h-5 w-5" />
 */
interface NairaIconProps {
  className?: string;
}

export function NairaIcon({ className = 'h-5 w-5' }: NairaIconProps) {
  // Extract numeric size from className (e.g. "h-5 w-5" → 20px)
  // Falls back to 1em so it naturally scales with its parent font.
  return (
    <span
      aria-hidden="true"
      className={`inline-flex items-center justify-center font-bold leading-none select-none ${className}`}
      style={{ fontSize: '0.85em' }}
    >
      ₦
    </span>
  );
}
