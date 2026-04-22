/*
  # Student Budget App - Core Tables

  1. New Tables
    - `budgets`
      - `id` (uuid, primary key)
      - `monthly_budget` (numeric) - total monthly budget amount
      - `fixed_weekly_cost` (numeric) - recurring weekly fixed costs
      - `start_date` (date) - budget period start
      - `end_date` (date) - budget period end
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `expenses`
      - `id` (uuid, primary key)
      - `amount` (numeric) - expense amount
      - `category` (text) - Food, Transport, Social, Others
      - `note` (text) - optional note
      - `expense_date` (date) - date of expense
      - `created_at` (timestamptz)

  2. Security
    - RLS enabled on both tables
    - Public read/write for now (no auth requirement per spec)

  3. Notes
    - app_user_id stored as session identifier for anonymous usage
    - Indexes on expense_date for fast dashboard queries
*/

CREATE TABLE IF NOT EXISTS budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_user_id text NOT NULL DEFAULT 'default',
  monthly_budget numeric(12,2) NOT NULL DEFAULT 0,
  fixed_weekly_cost numeric(12,2) NOT NULL DEFAULT 0,
  start_date date NOT NULL,
  end_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_user_id text NOT NULL DEFAULT 'default',
  amount numeric(12,2) NOT NULL,
  category text NOT NULL CHECK (category IN ('Food', 'Transport', 'Social', 'Others')),
  note text DEFAULT '',
  expense_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_user ON expenses(app_user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user ON budgets(app_user_id);

ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read budgets"
  ON budgets FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert budgets"
  ON budgets FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public update budgets"
  ON budgets FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete budgets"
  ON budgets FOR DELETE
  TO anon
  USING (true);

CREATE POLICY "Allow public read expenses"
  ON expenses FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert expenses"
  ON expenses FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public update expenses"
  ON expenses FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete expenses"
  ON expenses FOR DELETE
  TO anon
  USING (true);
