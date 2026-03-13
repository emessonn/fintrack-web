import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createBill,
  deleteBill,
  listBills,
  markBillAsPaid,
  updateBillRecurrence,
} from '@/lib/bills-api'
import type { BillRecurrence, NewBillInput } from '@/types/finance'

function billsKey(userId: string) {
  return ['bills', userId] as const
}

export function useBills(userId: string | undefined) {
  return useQuery({
    queryKey: userId ? billsKey(userId) : ['bills', 'anonymous'],
    queryFn: async () => {
      if (!userId) {
        return []
      }
      return listBills()
    },
    enabled: Boolean(userId),
  })
}

export function useCreateBill(userId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: NewBillInput) => {
      if (!userId) {
        throw new Error('Usuario nao autenticado.')
      }
      return createBill(input)
    },
    onSuccess: async () => {
      if (!userId) return
      await queryClient.invalidateQueries({ queryKey: billsKey(userId) })
    },
  })
}

export function useMarkBillAsPaid(userId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (billId: string) => {
      if (!userId) {
        throw new Error('Usuario nao autenticado.')
      }
      return markBillAsPaid(billId)
    },
    onSuccess: async () => {
      if (!userId) return
      await queryClient.invalidateQueries({ queryKey: billsKey(userId) })
    },
  })
}

export function useDeleteBill(userId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (billId: string) => {
      if (!userId) {
        throw new Error('Usuario nao autenticado.')
      }
      await deleteBill(billId)
    },
    onSuccess: async () => {
      if (!userId) return
      await queryClient.invalidateQueries({ queryKey: billsKey(userId) })
    },
  })
}

export function useUpdateBillRecurrence(userId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      billId,
      recurrence,
    }: {
      billId: string
      recurrence: BillRecurrence
    }) => {
      if (!userId) {
        throw new Error('Usuario nao autenticado.')
      }

      return updateBillRecurrence(billId, recurrence)
    },
    onSuccess: async () => {
      if (!userId) return
      await queryClient.invalidateQueries({ queryKey: billsKey(userId) })
    },
  })
}
