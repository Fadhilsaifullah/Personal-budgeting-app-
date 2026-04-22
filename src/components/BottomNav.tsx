import { LayoutDashboard, CirclePlus as PlusCircle, ChartBar as BarChart2, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NavTab } from '@/types'

interface BottomNavProps {
  active: NavTab
  onChange: (tab: NavTab) => void
}

const tabs: { id: NavTab; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'add', label: 'Add', icon: PlusCircle },
  { id: 'insights', label: 'Insights', icon: BarChart2 },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
      <div className="flex items-stretch max-w-lg mx-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-1 py-3 px-2 transition-colors min-h-[60px]',
              'text-xs font-medium',
              active === id
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon
              className={cn(
                'size-5 transition-transform',
                active === id && 'scale-110'
              )}
            />
            <span>{label}</span>
            {active === id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" style={{ position: 'absolute' }} />
            )}
          </button>
        ))}
      </div>
    </nav>
  )
}
