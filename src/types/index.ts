export type ExpenseCategory = 'Food' | 'Transport' | 'Social' | 'Others'

export interface Budget {
  id: string
  app_user_id: string
  monthly_budget: number
  fixed_weekly_cost: number
  start_date: string
  end_date: string
  created_at: string
  updated_at: string
}

export interface Expense {
  id: string
  app_user_id: string
  amount: number
  category: ExpenseCategory
  note: string
  expense_date: string
  created_at: string
}

export interface BudgetCalculation {
  totalDays: number
  totalWeeks: number
  totalFixedCost: number
  netUsableBudget: number
  dailyAllowance: number
}

export type NavTab = 'dashboard' | 'add' | 'insights' | 'settings'
