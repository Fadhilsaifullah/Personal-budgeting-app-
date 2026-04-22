import { useState, useEffect, useCallback } from 'react'
import { supabase, APP_USER_ID } from '@/lib/supabase'
import type { Expense, ExpenseCategory } from '@/types'

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)

  const fetchExpenses = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('expenses')
      .select('*')
      .eq('app_user_id', APP_USER_ID)
      .order('expense_date', { ascending: false })
      .order('created_at', { ascending: false })
    setExpenses(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  const addExpense = useCallback(async (values: { amount: number; category: ExpenseCategory; note?: string; expense_date?: string }) => {
    const { data } = await supabase
      .from('expenses')
      .insert({
        app_user_id: APP_USER_ID,
        amount: values.amount,
        category: values.category,
        note: values.note ?? '',
        expense_date: values.expense_date ?? new Date().toISOString().split('T')[0],
      })
      .select()
      .single()
    if (data) setExpenses((prev) => [data, ...prev])
    return data
  }, [])

  const deleteExpense = useCallback(async (id: string) => {
    await supabase.from('expenses').delete().eq('id', id)
    setExpenses((prev) => prev.filter((e) => e.id !== id))
  }, [])

  return { expenses, loading, addExpense, deleteExpense, refetch: fetchExpenses }
}
