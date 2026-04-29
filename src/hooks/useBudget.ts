import { useState, useEffect, useCallback } from 'react'
import { supabase, APP_USER_ID } from '@/lib/supabase'
import type { Budget } from '@/types'

export function useBudget() {
  const [budget, setBudget] = useState<Budget | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchBudget = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('budgets')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    setBudget(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchBudget()
  }, [fetchBudget])

  const saveBudget = useCallback(async (values: Omit<Budget, 'id' | 'app_user_id' | 'created_at' | 'updated_at'>) => {
    if (budget) {
      const { data } = await supabase
        .from('budgets')
        .update({ ...values, updated_at: new Date().toISOString() })
        .eq('id', budget.id)
        .select()
        .single()
      setBudget(data)
    } else {
      const { data } = await supabase
        .from('budgets')
        .insert({ ...values, app_user_id: APP_USER_ID })
        .select()
        .single()
      setBudget(data)
    }
  }, [budget])

  return { budget, loading, saveBudget, refetch: fetchBudget }
}
