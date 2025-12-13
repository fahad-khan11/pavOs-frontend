import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-[#F4C542] focus-visible:ring-[#F4C542]/50 focus-visible:ring-[3px] transition-[color,box-shadow] overflow-hidden',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-[#0e1d3a] dark:bg-[#0e1d3a] text-white [a&]:hover:bg-[#0e1d3a]/90',
        secondary:
          'border-transparent bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white [a&]:hover:bg-gray-200 dark:[a&]:hover:bg-gray-700',
        destructive:
          'border-transparent bg-red-600 dark:bg-red-600 text-white [a&]:hover:bg-red-700 focus-visible:ring-red-500/20 dark:focus-visible:ring-red-500/40',
        outline:
          'border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white [a&]:hover:bg-gray-100 dark:[a&]:hover:bg-gray-800',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span'

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
