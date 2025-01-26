import { create } from 'zustand'
import { getCurrentMonthYear } from '@/utils/helpers'
import { Filters } from '@/utils/types'

const { month, year } = getCurrentMonthYear();

type FilterStore = {
  filters: Filters
  setFilters: (filters: Partial<Filters>) => void
  resetFilters: () => void
}

export const useFilterStore = create<FilterStore>((set) => ({
  filters: {
    dateRange: undefined,
    month: undefined,
    year: undefined,
    bankId: undefined,
    categoryId: undefined,
    transactionType: undefined,
    order: 'descending',
    title: `${month}, ${year} - Summary`,
    message: `No transactions for ${month} yet.`,
    dateRangePreset: 'none',
  },
  setFilters: (updatedFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...updatedFilters },
    })),
  resetFilters: () =>
    set({
      filters: {
        dateRange: undefined,
        month: undefined,
        year: undefined,
        bankId: undefined,
        categoryId: undefined,
        transactionType: undefined,
        order: 'descending',
        title: `${month}, ${year} - Summary`,
        message: `No transactions for ${month} yet.`,
        dateRangePreset: 'none',
      },
    }),
}))