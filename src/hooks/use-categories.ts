import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategoryLimit,
} from '@/lib/categories-api'

function categoriesKey(userId: string) {
  return ['categories', userId] as const
}

export function useCategories(userId: string | undefined) {
  return useQuery({
    queryKey: userId ? categoriesKey(userId) : ['categories', 'anonymous'],
    queryFn: async () => {
      if (!userId) {
        return []
      }

      return listCategories()
    },
    enabled: Boolean(userId),
  })
}

export function useCreateCategory(userId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: { name: string; limit?: number }) => {
      if (!userId) {
        throw new Error('Usuário não autenticado.')
      }

      return createCategory(input.name, input.limit)
    },
    onSuccess: async () => {
      if (!userId) {
        return
      }

      await queryClient.invalidateQueries({ queryKey: categoriesKey(userId) })
    },
  })
}

export function useUpdateCategoryLimit(userId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      categoryId,
      limit,
    }: {
      categoryId: string
      limit: number | null
    }) => {
      if (!userId) {
        throw new Error('Usuário não autenticado.')
      }

      return updateCategoryLimit(categoryId, limit)
    },
    onSuccess: async () => {
      if (!userId) {
        return
      }

      await queryClient.invalidateQueries({ queryKey: categoriesKey(userId) })
    },
  })
}

export function useDeleteCategory(userId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (categoryId: string) => {
      if (!userId) {
        throw new Error('Usuário não autenticado.')
      }

      await deleteCategory(categoryId)
    },
    onSuccess: async () => {
      if (!userId) {
        return
      }

      await queryClient.invalidateQueries({ queryKey: categoriesKey(userId) })
    },
  })
}
