import { apiClient } from '@/lib/api'
import type {
  Bill,
  BillRecurrence,
  BillStatus,
  NewBillInput,
} from '@/types/finance'

interface BillResponse {
  id: string
  description: string
  amount: number
  dueDate: string
  category: string
  status: BillStatus
  recurrence?: BillRecurrence
  paidAt?: string
  createdAt: string
  updatedAt?: string
}

interface ListBillsResponse {
  bills: BillResponse[]
}

interface SingleBillResponse {
  bill: BillResponse
}

function mapBill(bill: BillResponse): Bill {
  return {
    id: bill.id,
    description: bill.description,
    amount: Number(bill.amount),
    dueDate: bill.dueDate,
    category: bill.category,
    status: bill.status,
    recurrence: bill.recurrence ?? 'none',
    paidAt: bill.paidAt,
    createdAt: bill.createdAt,
    updatedAt: bill.updatedAt,
  }
}

export async function listBills(): Promise<Bill[]> {
  const { data } = await apiClient.get<BillResponse[] | ListBillsResponse>(
    '/bills',
  )
  const bills = Array.isArray(data) ? data : data.bills
  return bills.map(mapBill)
}

export async function createBill(input: NewBillInput): Promise<Bill> {
  const payload = {
    description: input.description.trim(),
    amount: Number(input.amount),
    dueDate: input.dueDate,
    category: input.category,
    recurrence: input.recurrence,
  }
  const { data } = await apiClient.post<BillResponse | SingleBillResponse>(
    '/bills',
    payload,
  )
  const bill = 'bill' in data ? data.bill : data
  return mapBill(bill)
}

export async function markBillAsPaid(id: string): Promise<Bill> {
  const { data } = await apiClient.patch<BillResponse | SingleBillResponse>(
    `/bills/${id}`,
    { status: 'paid', paidAt: new Date().toISOString() },
  )
  const bill = 'bill' in data ? data.bill : data
  return mapBill(bill)
}

export async function updateBillRecurrence(
  id: string,
  recurrence: BillRecurrence,
): Promise<Bill> {
  const { data } = await apiClient.patch<BillResponse | SingleBillResponse>(
    `/bills/${id}`,
    { recurrence },
  )

  const bill = 'bill' in data ? data.bill : data

  return mapBill(bill)
}

export async function deleteBill(id: string): Promise<void> {
  await apiClient.delete(`/bills/${id}`)
}
