import { useMemo } from 'react'
import { TrendingUp, Award, Target } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Cell, ReferenceLine } from 'recharts'
import type { Budget, Expense } from '@/types'
import {
  calculateBudget,
  getDailyTotalsForWeek,
  getWeekAverage,
  getHighestSpendingDay,
  getCategoryTotals,
  formatCurrency,
  getTotalSpent,
} from '@/lib/budget'
import { cn } from '@/lib/utils'

const chartConfig = {
  amount: { label: 'Spending', color: 'var(--chart-1)' },
} satisfies ChartConfig

const CATEGORY_COLORS: Record<string, string> = {
  Food: 'var(--chart-1)',
  Transport: 'var(--chart-2)',
  Social: 'var(--chart-3)',
  Others: 'var(--chart-4)',
}

interface InsightsProps {
  budget: Budget | null
  expenses: Expense[]
}

export function Insights({ budget, expenses }: InsightsProps) {
  const calc = useMemo(() => (budget ? calculateBudget(budget) : null), [budget])
  const weeklyData = useMemo(() => getDailyTotalsForWeek(expenses), [expenses])
  const weekAverage = useMemo(() => getWeekAverage(expenses), [expenses])
  const highestDay = useMemo(() => getHighestSpendingDay(expenses), [expenses])
  const categoryTotals = useMemo(() => getCategoryTotals(expenses), [expenses])
  const totalSpent = useMemo(() => getTotalSpent(expenses), [expenses])
  const remainingBudget = calc ? Math.max(0, calc.netUsableBudget - totalSpent) : 0
  const dailyAllowance = calc?.dailyAllowance ?? 0

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-lg font-semibold text-foreground">Weekly Insights</h2>

      {/* Bar Chart */}
      <Card className="rounded-2xl border-border/60">
        <CardHeader className="px-4 pt-4 pb-2">
          <CardTitle className="text-base">Daily Spending</CardTitle>
        </CardHeader>
        <CardContent className="px-2 pb-4">
          <ChartContainer config={chartConfig} className="min-h-[180px] w-full">
            <BarChart data={weeklyData} accessibilityLayer margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                tickFormatter={(v) => `$${v}`}
              />
              {dailyAllowance > 0 && (
                <ReferenceLine
                  y={dailyAllowance}
                  stroke="var(--chart-2)"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{ value: 'Limit', position: 'insideTopRight', fontSize: 10, fill: 'var(--muted-foreground)' }}
                />
              )}
              <ChartTooltip
                content={<ChartTooltipContent formatter={(v) => [formatCurrency(Number(v)), 'Spent']} />}
              />
              <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                {weeklyData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.amount > dailyAllowance && dailyAllowance > 0
                      ? 'var(--destructive)'
                      : entry.amount > dailyAllowance * 0.75 && dailyAllowance > 0
                      ? 'var(--chart-5)'
                      : 'var(--chart-1)'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="rounded-2xl border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="size-4 text-primary" />
              <span className="text-xs text-muted-foreground font-medium">Daily Average</span>
            </div>
            <p className="text-xl font-bold">{formatCurrency(weekAverage)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">this week</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="size-4 text-amber-500" />
              <span className="text-xs text-muted-foreground font-medium">Highest Day</span>
            </div>
            <p className="text-xl font-bold">{highestDay ? formatCurrency(highestDay.amount) : '—'}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{highestDay?.day ?? 'No data'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Prediction */}
      {calc && (
        <Card className="rounded-2xl border-border/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Target className="size-4 text-primary" />
              <span className="text-sm font-medium">Budget Remaining</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold">{formatCurrency(remainingBudget)}</span>
              <span className={cn(
                'text-xs font-semibold px-2 py-0.5 rounded-full',
                remainingBudget > calc.netUsableBudget * 0.5
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : remainingBudget > calc.netUsableBudget * 0.25
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              )}>
                {calc.netUsableBudget > 0 ? ((remainingBudget / calc.netUsableBudget) * 100).toFixed(0) : 0}% left
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  remainingBudget > calc.netUsableBudget * 0.5
                    ? 'bg-emerald-500'
                    : remainingBudget > calc.netUsableBudget * 0.25
                    ? 'bg-amber-400'
                    : 'bg-red-500'
                )}
                style={{ width: `${calc.netUsableBudget > 0 ? (remainingBudget / calc.netUsableBudget) * 100 : 0}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              of {formatCurrency(calc.netUsableBudget)} usable budget
            </p>
          </CardContent>
        </Card>
      )}

      {/* Category Breakdown */}
      {Object.keys(categoryTotals).length > 0 && (
        <Card className="rounded-2xl border-border/60">
          <CardHeader className="px-4 pt-4 pb-2">
            <CardTitle className="text-base">By Category</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-3">
            {Object.entries(categoryTotals)
              .sort(([, a], [, b]) => b - a)
              .map(([cat, amount]) => {
                const pct = totalSpent > 0 ? (amount / totalSpent) * 100 : 0
                return (
                  <div key={cat}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-foreground font-medium">{cat}</span>
                      <span className="text-muted-foreground">{formatCurrency(amount)} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: CATEGORY_COLORS[cat] ?? 'var(--chart-1)' }}
                      />
                    </div>
                  </div>
                )
              })}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
