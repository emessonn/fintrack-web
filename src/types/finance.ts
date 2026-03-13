export type TransactionType = 'income' | 'expense'

export const DEFAULT_TRANSACTION_CATEGORIES = [
  'Salário',
  'Moradia',
  'Alimentação',
  'Transporte',
  'Saúde',
  'Lazer',
  'Educação',
  'Outros',
] as const

export const DEFAULT_TRANSACTION_CATEGORY = 'Outros'

export type TransactionCategory = string

export interface Category {
  id: string
  name: string
  limit?: number
  createdAt?: string
  updatedAt?: string
}

export interface Transaction {
  id: string
  description: string
  amount: number
  type: TransactionType
  category: TransactionCategory
  createdAt: string
}

export interface NewTransactionInput {
  description: string
  amount: number
  type: TransactionType
  category: TransactionCategory
}

export type BillStatus = 'pending' | 'paid' | 'overdue'

export type BillRecurrence = 'none' | 'weekly' | 'monthly' | 'yearly'

export interface Bill {
  id: string
  description: string
  amount: number
  dueDate: string
  category: TransactionCategory
  status: BillStatus
  recurrence?: BillRecurrence
  paidAt?: string
  createdAt: string
  updatedAt?: string
}

export interface NewBillInput {
  description: string
  amount: number
  dueDate: string
  category: TransactionCategory
  recurrence: BillRecurrence
}
