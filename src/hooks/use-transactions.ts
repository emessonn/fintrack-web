import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createTransaction, listTransactions } from '@/lib/transactions-api'
import type { NewTransactionInput } from '@/types/finance'

function transactionsKey(userId: string) {
  return ['transactions', userId] as const
}

export function useTransactions(userId: string | undefined) {
  return useQuery({
    queryKey: userId ? transactionsKey(userId) : ['transactions', 'anonymous'],
    queryFn: async () => {
      if (!userId) {
        return []
      }

      return listTransactions()
    },
    enabled: Boolean(userId),
  })
}

export function useCreateTransaction(userId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: NewTransactionInput) => {
      if (!userId) {
        throw new Error('Usuario nao autenticado.')
      }

      return createTransaction(input)
    },
    onSuccess: async () => {
      if (!userId) {
        return
      }

      await queryClient.invalidateQueries({ queryKey: transactionsKey(userId) })
    },
  })
}
