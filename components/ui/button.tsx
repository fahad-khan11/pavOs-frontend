import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-[#F4C542] focus-visible:ring-[#F4C542]/50 focus-visible:ring-[3px]",
  {
    variants: {
      variant: {
        default: 'bg-[#0e1d3a] dark:bg-[#0e1d3a] text-white hover:bg-[#0e1d3a]/90',
        destructive:
          'bg-red-600 dark:bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500/20 dark:focus-visible:ring-red-500/40',
        outline:
          'border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white',
        secondary:
          'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700',
        ghost:
          'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-white',
        link: 'text-[#0e1d3a] dark:text-[#F4C542] underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9',
        'icon-sm': 'size-8',
        'icon-lg': 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
