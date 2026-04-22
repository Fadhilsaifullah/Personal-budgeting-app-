import { useState, useEffect, useMemo } from 'react'
import { CircleCheck as CheckCircle2, Calculator } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import type { Budget } from '@/types'
import { calculateBudget, formatCurrency } from '@/lib/budget'
import { differenceInDays, parseISO, format } from 'date-fns'

interface SettingsProps {
  budget: Budget | null
  onSave: (values: Omit<Budget, 'id' | 'app_user_id' | 'created_at' | 'updated_at'>) => Promise<void>
}

export function Settings({ budget, onSave }: SettingsProps) {
  const today = format(new Date(), 'yyyy-MM-dd')
  const nextMonth = format(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0), 'yyyy-MM-dd')

  const [monthlyBudget, setMonthlyBudget] = useState(budget?.monthly_budget?.toString() ?? '')
  const [fixedWeeklyCost, setFixedWeeklyCost] = useState(budget?.fixed_weekly_cost?.toString() ?? '')
  const [startDate, setStartDate] = useState(budget?.start_date ?? today)
  const [endDate, setEndDate] = useState(budget?.end_date ?? nextMonth)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (budget) {
      setMonthlyBudget(budget.monthly_budget.toString())
      setFixedWeeklyCost(budget.fixed_weekly_cost.toString())
      setStartDate(budget.start_date)
      setEndDate(budget.end_date)
    }
  }, [budget])

  const preview = useMemo(() => {
    const mb = parseFloat(monthlyBudget) || 0
    const fc = parseFloat(fixedWeeklyCost) || 0
    if (!mb || !startDate || !endDate) return null
    const fakeBudget: Budget = {
      id: '', app_user_id: '', created_at: '', updated_at: '',
      monthly_budget: mb,
      fixed_weekly_cost: fc,
      start_date: startDate,
      end_date: endDate,
    }
    try {
      return calculateBudget(fakeBudget)
    } catch {
      return null
    }
  }, [monthlyBudget, fixedWeeklyCost, startDate, endDate])

  const daysInRange = startDate && endDate ? differenceInDays(parseISO(endDate), parseISO(startDate)) + 1 : 0
  const isValid = parseFloat(monthlyBudget) > 0 && daysInRange > 0

  const handleSave = async () => {
    if (!isValid) return
    setSaving(true)
    await onSave({
      monthly_budget: parseFloat(monthlyBudget),
      fixed_weekly_cost: parseFloat(fixedWeeklyCost) || 0,
      start_date: startDate,
      end_date: endDate,
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="p-4 space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Budget Setup</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Configure your monthly budget and spending limits</p>
      </div>

      <Card className="rounded-2xl border-border/60">
        <CardHeader className="px-4 pt-4 pb-3">
          <CardTitle className="text-base">Monthly Budget</CardTitle>
          <CardDescription>Set your total income or budget for this period</CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="monthly-budget" className="text-sm font-medium">Monthly Budget</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">Rp</span>
              <Input
                id="monthly-budget"
                type="number"
                inputMode="decimal"
                placeholder="0.00"
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(e.target.value)}
                className="pl-7"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fixed-cost" className="text-sm font-medium">Fixed Weekly Costs</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">Rp</span>
              <Input
                id="fixed-cost"
                type="number"
                inputMode="decimal"
                placeholder="0.00"
                value={fixedWeeklyCost}
                onChange={(e) => setFixedWeeklyCost(e.target.value)}
                className="pl-7"
              />
            </div>
            <p className="text-xs text-muted-foreground">Rent, subscriptions, etc. paid weekly</p>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/60">
        <CardHeader className="px-4 pt-4 pb-3">
          <CardTitle className="text-base">Date Range</CardTitle>
          <CardDescription>Define your budget period</CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="start-date" className="text-sm font-medium">Start Date</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="end-date" className="text-sm font-medium">End Date</Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          {daysInRange > 0 && (
            <p className="text-xs text-muted-foreground">{daysInRange} days total</p>
          )}
        </CardContent>
      </Card>

      {/* Preview */}
      {preview && (
        <Card className="rounded-2xl border-primary/20 bg-primary/5">
          <CardHeader className="px-4 pt-4 pb-2">
            <div className="flex items-center gap-2">
              <Calculator className="size-4 text-primary" />
              <CardTitle className="text-base text-primary">Budget Preview</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-2">
            <div className="flex justify-between text-sm py-1.5">
              <span className="text-muted-foreground">Total Fixed Costs</span>
              <span className="font-medium text-foreground">{formatCurrency(preview.totalFixedCost)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-sm py-1.5">
              <span className="text-muted-foreground">Net Usable Budget</span>
              <span className="font-semibold text-foreground">{formatCurrency(preview.netUsableBudget)}</span>
            </div>
            <Separator />
            <div className="flex justify-between py-1.5">
              <span className="text-sm text-muted-foreground">Daily Allowance</span>
              <span className="text-lg font-bold text-primary">{formatCurrency(preview.dailyAllowance)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Button
        onClick={handleSave}
        disabled={!isValid || saving}
        className={cn(
          'w-full h-14 text-base font-semibold rounded-2xl transition-all',
          saved && 'bg-emerald-500 hover:bg-emerald-500'
        )}
      >
        {saved ? (
          <span className="flex items-center gap-2">
            <CheckCircle2 className="size-5" />
            Saved!
          </span>
        ) : saving ? 'Saving...' : 'Save Budget'}
      </Button>
    </div>
  )
}

