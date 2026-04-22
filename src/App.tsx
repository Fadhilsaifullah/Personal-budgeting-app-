import { useState, useEffect, useMemo } from 'react'
import { BottomNav } from '@/components/BottomNav'
import { Dashboard } from '@/pages/Dashboard'
import { AddExpense } from '@/pages/AddExpense'
import { Insights } from '@/pages/Insights'
import { Settings } from '@/pages/Settings'
import { useBudget } from '@/hooks/useBudget'
import { useExpenses } from '@/hooks/useExpenses'
import { calculateBudget } from '@/lib/budget'
import type { NavTab } from '@/types'

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard')
  const { budget, loading: budgetLoading, saveBudget } = useBudget()
  const { expenses, loading: expensesLoading, addExpense, deleteExpense } = useExpenses()

  const calc = useMemo(() => (budget ? calculateBudget(budget) : null), [budget])

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {})
      })
    }
  }, [])

  const handleSetupBudget = () => setActiveTab('settings')

  return (
    <div className="min-h-svh bg-background flex flex-col">
      <div className="flex-1 overflow-y-auto pb-[72px] max-w-lg mx-auto w-full">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground text-xs font-bold">$</span>
              </div>
              <span className="font-semibold text-foreground tracking-tight">StudentBudget</span>
            </div>
            <span className="text-xs text-muted-foreground capitalize">{activeTab}</span>
          </div>
        </header>

        {/* Content */}
        <main>
          {activeTab === 'dashboard' && (
            <Dashboard
              budget={budget}
              expenses={expenses}
              budgetLoading={budgetLoading}
              expensesLoading={expensesLoading}
              onDeleteExpense={deleteExpense}
              onSetupBudget={handleSetupBudget}
            />
          )}
          {activeTab === 'add' && (
            <AddExpense
              onAdd={addExpense}
              dailyAllowance={calc?.dailyAllowance ?? null}
            />
          )}
          {activeTab === 'insights' && (
            <Insights budget={budget} expenses={expenses} />
          )}
          {activeTab === 'settings' && (
            <Settings budget={budget} onSave={saveBudget} />
          )}
        </main>
      </div>

      <BottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  )
}
