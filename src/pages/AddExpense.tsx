import { useState } from 'react'
import { Utensils, Bus, Users, MoveHorizontal as MoreHorizontal, CircleCheck as CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { ExpenseCategory } from '@/types'
import { formatCurrency } from '@/lib/budget'

const CATEGORIES: { id: ExpenseCategory; label: string; icon: React.ElementType; colorClass: string }[] = [
  { id: 'Food', label: 'Food', icon: Utensils, colorClass: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800' },
  { id: 'Transport', label: 'Transport', icon: Bus, colorClass: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800' },
  { id: 'Social', label: 'Social', icon: Users, colorClass: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400 border-pink-200 dark:border-pink-800' },
  { id: 'Others', label: 'Others', icon: MoreHorizontal, colorClass: 'bg-secondary text-secondary-foreground border-border' },
]

const QUICK_AMOUNTS = [5, 10, 20, 50]

interface AddExpenseProps {
  onAdd: (values: { amount: number; category: ExpenseCategory; note?: string }) => Promise<unknown>
  dailyAllowance: number | null
}

export function AddExpense({ onAdd, dailyAllowance }: AddExpenseProps) {
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<ExpenseCategory>('Food')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  const parsedAmount = parseFloat(amount) || 0

  const handleSave = async () => {
    if (parsedAmount <= 0) return
    setSaving(true)
    await onAdd({ amount: parsedAmount, category, note: note.trim() })
    setSaving(false)
    setSuccess(true)
    setAmount('')
    setNote('')
    setTimeout(() => setSuccess(false), 2000)
  }

  return (
    <div className="p-4 space-y-5">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-foreground">Log Expense</h2>
        {dailyAllowance !== null && (
          <p className="text-sm text-muted-foreground mt-0.5">
            Daily allowance: {formatCurrency(dailyAllowance)}
          </p>
        )}
      </div>

      {/* Amount Input */}
      <Card className="rounded-2xl border-border/60">
        <CardContent className="p-5">
          <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">Amount</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-light text-muted-foreground">$</span>
            <Input
              type="number"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-3xl font-bold border-0 shadow-none p-0 h-auto focus-visible:ring-0 bg-transparent"
            />
          </div>
          <div className="flex gap-2 mt-4">
            {QUICK_AMOUNTS.map((a) => (
              <button
                key={a}
                onClick={() => setAmount(String(a))}
                className={cn(
                  'flex-1 h-8 rounded-lg text-sm font-medium transition-colors border',
                  amount === String(a)
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-muted text-muted-foreground border-transparent hover:bg-accent'
                )}
              >
                ${a}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Category Selection */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide px-1">Category</p>
        <div className="grid grid-cols-4 gap-2">
          {CATEGORIES.map(({ id, label, icon: Icon, colorClass }) => (
            <button
              key={id}
              onClick={() => setCategory(id)}
              className={cn(
                'flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all',
                category === id
                  ? `${colorClass} border-current shadow-sm scale-105`
                  : 'bg-card border-border text-muted-foreground hover:bg-accent'
              )}
            >
              <Icon className="size-5" />
              <span className="text-xs font-medium leading-none">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Note */}
      <Card className="rounded-2xl border-border/60">
        <CardContent className="p-4">
          <Input
            placeholder="Add a note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="border-0 shadow-none p-0 focus-visible:ring-0 bg-transparent text-sm"
          />
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button
        className={cn(
          'w-full h-14 text-base font-semibold rounded-2xl transition-all',
          success && 'bg-emerald-500 hover:bg-emerald-500'
        )}
        onClick={handleSave}
        disabled={parsedAmount <= 0 || saving}
      >
        {success ? (
          <span className="flex items-center gap-2">
            <CheckCircle2 className="size-5" />
            Saved!
          </span>
        ) : saving ? (
          'Saving...'
        ) : (
          `Save ${parsedAmount > 0 ? formatCurrency(parsedAmount) : 'Expense'}`
        )}
      </Button>
    </div>
  )
}
