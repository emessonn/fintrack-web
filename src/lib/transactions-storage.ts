import {
  DEFAULT_TRANSACTION_CATEGORY,
  type NewTransactionInput,
  type Transaction,
} from '@/types/finance'

function getStorageKey(userId: string) {
  return `fintrack:transactions:${userId}`
}

function readTransactions(userId: string): Transaction[] {
  const storageKey = getStorageKey(userId)
  const raw = window.localStorage.getItem(storageKey)

  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw) as Array<
      Transaction & { category?: Transaction['category'] }
    >

    if (!Array.isArray(parsed)) {
      return []
    }

    const normalized = parsed.map((transaction) => ({
      ...transaction,
      category: transaction.category || DEFAULT_TRANSACTION_CATEGORY,
    }))

    return normalized.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
  } catch {
    return []
  }
}

function writeTransactions(userId: string, transactions: Transaction[]) {
  const storageKey = getStorageKey(userId)
  window.localStorage.setItem(storageKey, JSON.stringify(transactions))
}

function generateTransactionId() {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export async function getTransactions(userId: string): Promise<Transaction[]> {
  return readTransactions(userId)
}

export async function addTransaction(
  userId: string,
  input: NewTransactionInput,
): Promise<Transaction> {
  const transaction: Transaction = {
    id: generateTransactionId(),
    createdAt: new Date().toISOString(),
    amount: Number(input.amount),
    description: input.description.trim(),
    type: input.type,
    category: input.category,
  }

  const transactions = readTransactions(userId)
  writeTransactions(userId, [transaction, ...transactions])

  return transaction
}
