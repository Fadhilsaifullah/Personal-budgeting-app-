import { useMemo } from 'react'
import { Wallet, TrendingDown, Calendar, ArrowRight, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/StatusBadge'
import type { Budget, Expense } from '@/types'
import {
  calculateBudget,
  getTodayTotal,
  getSpendingStatus,
  getRemainingDailyAllowance,
  formatCurrency,
  getTotalSpent,
} from '@/lib/budget'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'

const CATEGORY_COLORS: Record<string, string> = {
  Food: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  Transport: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Social: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  Others: 'bg-secondary text-secondary-foreground',
}

interface DashboardProps {
  budget: Budget | null
  expenses: Expense[]
  budgetLoading: boolean
  expensesLoading: boolean
  onDeleteExpense: (id: string) => void
  onSetupBudget: () => void
}

export function Dashboard({ budget, expenses, budgetLoading, expensesLoading, onDeleteExpense, onSetupBudget }: DashboardProps) {
  const calc = useMemo(() => (budget ? calculateBudget(budget) : null), [budget])
  const todaySpent = useMemo(() => getTodayTotal(expenses), [expenses])
  const totalSpent = useMemo(() => getTotalSpent(expenses), [expenses])
  const remaining = calc ? getRemainingDailyAllowance(todaySpent, calc.dailyAllowance) : 0
  const status = calc ? getSpendingStatus(todaySpent, calc.dailyAllowance) : 'safe'

  const recentExpenses = expenses.slice(0, 8)

  if (budgetLoading || expensesLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    )
  }

  if (!budget) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 p-8 text-center min-h-[60vh]">
        <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center">
          <Wallet className="size-10 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Set Up Your Budget</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Start by setting your monthly budget and fixed costs to track your daily spending.
          </p>
        </div>
        <Button onClick={onSetupBudget} className="w-full max-w-xs">
          Get Started
          <ArrowRight className="size-4" />
        </Button>
      </div>
    )
  }

  const budgetUsedPercent = calc ? Math.min(100, (totalSpent / calc.netUsableBudget) * 100) : 0

  return (
    <div className="space-y-4 p-4">
      {/* Hero Card */}
      <Card
        className={cn(
          'rounded-2xl border-0 text-white overflow-hidden',
          status === 'safe' && 'bg-gradient-to-br from-emerald-500 to-teal-600',
          status === 'warning' && 'bg-gradient-to-br from-amber-400 to-orange-500',
          status === 'over' && 'bg-gradient-to-br from-red-500 to-rose-600'
        )}
      >
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-medium opacity-80">Remaining Today</p>
              <p className="text-4xl font-bold tracking-tight mt-1">
                {formatCurrency(Math.max(0, remaining))}
              </p>
            </div>
            <StatusBadge
              status={status}
              className={cn(
                'border border-white/20',
                status === 'safe' && 'bg-white/20 text-white',
                status === 'warning' && 'bg-white/20 text-white',
                status === 'over' && 'bg-white/20 text-white'
              )}
            />
          </div>
          <div className="flex items-center justify-between text-sm opacity-80">
            <span>Spent today: {formatCurrency(todaySpent)}</span>
            <span>Allowance: {formatCurrency(calc?.dailyAllowance ?? 0)}</span>
          </div>
          <div className="mt-3 h-1.5 rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full rounded-full bg-white/70 transition-all"
              style={{ width: `${Math.min(100, (todaySpent / (calc?.dailyAllowance || 1)) * 100)}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="rounded-2xl border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="size-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">Total Spent</span>
            </div>
            <p className="text-xl font-bold text-foreground">{formatCurrency(totalSpent)}</p>
            <div className="mt-2 h-1 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${budgetUsedPercent}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{budgetUsedPercent.toFixed(0)}% of budget</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="size-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">Remaining</span>
            </div>
            <p className="text-xl font-bold text-foreground">{formatCurrency(Math.max(0, (calc?.netUsableBudget ?? 0) - totalSpent))}</p>
            <p className="text-xs text-muted-foreground mt-1">of {formatCurrency(calc?.netUsableBudget ?? 0)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Expenses */}
      <Card className="rounded-2xl border-border/60">
        <CardHeader className="px-4 pt-4 pb-2">
          <CardTitle className="text-base">Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {recentExpenses.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No expenses logged yet</p>
          ) : (
            <div className="space-y-2">
              {recentExpenses.map((expense) => (
                <div key={expense.id} className="flex items-center gap-3 py-2 border-b border-border/40 last:border-0">
                  <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', CATEGORY_COLORS[expense.category])}>
                    {expense.category}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{expense.note || expense.category}</p>
                    <p className="text-xs text-muted-foreground">{format(parseISO(expense.expense_date), 'MMM d')}</p>
                  </div>
                  <span className="text-sm font-semibold text-foreground">{formatCurrency(expense.amount)}</span>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => onDeleteExpense(expense.id)}
                    className="text-muted-foreground hover:text-destructive shrink-0"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
