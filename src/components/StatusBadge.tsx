import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: 'safe' | 'warning' | 'over'
  className?: string
}

const statusConfig = {
  safe: { label: 'On Track', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  warning: { label: 'Watch Out', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  over: { label: 'Over Budget', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold', config.className, className)}>
      <span
        className={cn(
          'size-1.5 rounded-full',
          status === 'safe' && 'bg-emerald-500',
          status === 'warning' && 'bg-amber-500',
          status === 'over' && 'bg-red-500'
        )}
      />
      {config.label}
    </span>
  )
}
