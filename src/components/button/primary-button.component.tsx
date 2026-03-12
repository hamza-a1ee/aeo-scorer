import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const primaryButtonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-60',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-base text-primary-foreground min-h-14 hover:bg-primary/90 disabled:bg-primary/70 disabled:hover:bg-primary/70',
        goBack:
          'bg-neutral-gray-0 w-max min-h-14 text-test-secondary text-base hover:bg-neutral-gray-10 disabled:bg-neutral-gray-10 disabled:text-test-secondary/80 disabled:hover:bg-neutral-gray-10',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

interface Props
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof primaryButtonVariants> {
  children: React.ReactNode;
}

export default function PrimaryButton({
  className,
  variant = 'default',
  children,
  ...props
}: Props) {
  return (
    <button
      type="button"
      className={cn(primaryButtonVariants({ variant, className }))}
      {...props}
    >
      {children}
    </button>
  );
}

export { primaryButtonVariants };
