import { apiClient } from '@/lib/api'
import type { Category } from '@/types/finance'

interface CategoryResponse {
  id: string
  name: string
  limit?: number | string | null
  createdAt?: string
  updatedAt?: string
}

interface ListCategoriesResponse {
  categories: CategoryResponse[]
}

interface CategoryWrapperResponse {
  category: CategoryResponse
}

function mapCategory(category: CategoryResponse): Category {
  return {
    id: category.id,
    name: category.name,
    limit:
      category.limit != null && category.limit !== ''
        ? Number(category.limit)
        : undefined,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  }
}

export async function listCategories(): Promise<Category[]> {
  const { data } = await apiClient.get<
    CategoryResponse[] | ListCategoriesResponse
  >('/categories')

  const categories = Array.isArray(data) ? data : data.categories

  return categories.map(mapCategory)
}

export async function getCategoryById(categoryId: string): Promise<Category> {
  const { data } = await apiClient.get<
    CategoryResponse | CategoryWrapperResponse
  >(`/categories/${categoryId}`)

  const category = 'category' in data ? data.category : data

  return mapCategory(category)
}

export async function createCategory(
  name: string,
  limit?: number,
): Promise<Category> {
  const payload: { name: string; limit?: number } = { name: name.trim() }
  if (limit != null && limit > 0) payload.limit = limit

  const { data } = await apiClient.post<
    CategoryResponse | CategoryWrapperResponse
  >('/categories', payload)

  const category = 'category' in data ? data.category : data

  return mapCategory(category)
}

export async function updateCategoryLimit(
  categoryId: string,
  limit: number | null,
): Promise<Category> {
  const { data } = await apiClient.patch<
    CategoryResponse | CategoryWrapperResponse
  >(`/categories/${categoryId}`, { limit })

  const category = 'category' in data ? data.category : data

  return mapCategory(category)
}

export async function updateCategory(
  categoryId: string,
  name: string,
): Promise<Category> {
  const { data } = await apiClient.patch<
    CategoryResponse | CategoryWrapperResponse
  >(`/categories/${categoryId}`, {
    name: name.trim(),
  })

  const category = 'category' in data ? data.category : data

  return mapCategory(category)
}

export async function deleteCategory(categoryId: string): Promise<void> {
  await apiClient.delete(`/categories/${categoryId}`)
}
