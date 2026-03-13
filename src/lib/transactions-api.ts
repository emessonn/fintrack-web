import { apiClient } from '@/lib/api'
import type { NewTransactionInput, Transaction } from '@/types/finance'

interface TransactionResponse {
  id: string
  description: string
  amount: number
  type: Transaction['type']
  category: Transaction['category']
  createdAt: string
}

interface ListTransactionsResponse {
  transactions: TransactionResponse[]
}

interface CreateTransactionResponse {
  transaction: TransactionResponse
}

function mapTransaction(transaction: TransactionResponse): Transaction {
  return {
    id: transaction.id,
    description: transaction.description,
    amount: Number(transaction.amount),
    type: transaction.type,
    category: transaction.category,
    createdAt: transaction.createdAt,
  }
}

export async function listTransactions(): Promise<Transaction[]> {
  const { data } = await apiClient.get<
    TransactionResponse[] | ListTransactionsResponse
  >('/transactions')

  const transactions = Array.isArray(data) ? data : data.transactions

  return transactions.map(mapTransaction)
}

export async function createTransaction(
  input: NewTransactionInput,
): Promise<Transaction> {
  const payload = {
    description: input.description.trim(),
    amount: Number(input.amount),
    type: input.type,
    category: input.category,
  }

  const { data } = await apiClient.post<
    TransactionResponse | CreateTransactionResponse
  >('/transactions', payload)

  const transaction = 'transaction' in data ? data.transaction : data

  return mapTransaction(transaction)
}
