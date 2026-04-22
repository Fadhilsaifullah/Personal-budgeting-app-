import type { BudgetCalculation, Budget, Expense } from '@/types'
import { differenceInDays, parseISO, format, isToday, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns'

export function calculateBudget(budget: Budget): BudgetCalculation {
  const start = parseISO(budget.start_date)
  const end = parseISO(budget.end_date)
  const totalDays = differenceInDays(end, start) + 1
  const totalWeeks = Math.ceil(totalDays / 7)
  const totalFixedCost = budget.fixed_weekly_cost * totalWeeks
  const netUsableBudget = Math.max(0, budget.monthly_budget - totalFixedCost)
  const dailyAllowance = totalDays > 0 ? netUsableBudget / totalDays : 0

  return { totalDays, totalWeeks, totalFixedCost, netUsableBudget, dailyAllowance }
}

export function getTodayExpenses(expenses: Expense[]): Expense[] {
  return expenses.filter((e) => {
    const d = parseISO(e.expense_date)
    return isToday(d)
  })
}

export function getTodayTotal(expenses: Expense[]): number {
  return getTodayExpenses(expenses).reduce((sum, e) => sum + e.amount, 0)
}

export function getSpendingStatus(spent: number, allowance: number): 'safe' | 'warning' | 'over' {
  if (allowance <= 0) return 'safe'
  const ratio = spent / allowance
  if (ratio >= 1) return 'over'
  if (ratio >= 0.75) return 'warning'
  return 'safe'
}

export function getRemainingDailyAllowance(spent: number, allowance: number): number {
  return allowance - spent
}

export function getThisWeekExpenses(expenses: Expense[]): Expense[] {
  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 })
  return expenses.filter((e) => {
    const d = parseISO(e.expense_date)
    return isWithinInterval(d, { start: weekStart, end: weekEnd })
  })
}

export function getDailyTotalsForWeek(expenses: Expense[]): { day: string; amount: number }[] {
  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart)
    date.setDate(weekStart.getDate() + i)
    return date
  })

  return days.map((date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const total = expenses
      .filter((e) => e.expense_date === dateStr)
      .reduce((sum, e) => sum + e.amount, 0)
    return { day: format(date, 'EEE'), amount: total }
  })
}

export function getWeekAverage(expenses: Expense[]): number {
  const weekExpenses = getThisWeekExpenses(expenses)
  if (weekExpenses.length === 0) return 0
  const dailyTotals = getDailyTotalsForWeek(expenses)
  const activeDays = dailyTotals.filter((d) => d.amount > 0)
  if (activeDays.length === 0) return 0
  return activeDays.reduce((sum, d) => sum + d.amount, 0) / activeDays.length
}

export function getHighestSpendingDay(expenses: Expense[]): { day: string; amount: number } | null {
  const dailyTotals = getDailyTotalsForWeek(expenses)
  const maxDay = dailyTotals.reduce((max, d) => (d.amount > max.amount ? d : max), { day: '', amount: 0 })
  return maxDay.amount > 0 ? maxDay : null
}

export function getCategoryTotals(expenses: Expense[]): Record<string, number> {
  return expenses.reduce(
    (acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount
      return acc
    },
    {} as Record<string, number>
  )
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
}).format(amount)
}

export function getTotalSpent(expenses: Expense[]): number {
  return expenses.reduce((sum, e) => sum + e.amount, 0)
}
