import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const Button = ({ children, className, variant = 'default', size = 'default', ...props }) => {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
        {
          'bg-gym-green-600 hover:bg-gym-green-700 text-white shadow': variant === 'default',
          'bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-600': variant === 'secondary',
          'bg-gradient-to-r from-gym-green-600 to-emerald-600 hover:from-gym-green-700 text-white shadow-lg': variant === 'destructive',
        },
        {
          'h-10 py-2 px-4 text-sm': size === 'default',
          'h-9 px-3 text-xs rounded-md': size === 'sm',
          'h-12 px-6 text-lg': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
