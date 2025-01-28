import { useCallback } from 'react'
import { useSQLiteContext } from 'expo-sqlite'
import Toast from "react-native-toast-message";

import { useFetchTransactions } from './useFetchTransactions'
import { useFetchTotalTransactions } from "./useFetchTotalTransactions";
import { useFilterStore } from '@/store/filterStore'

export const useDeleteTransaction = () => {
  const db = useSQLiteContext()
  const { fetchCurrentTransactions } = useFetchTransactions()
  const { fetchTotalTransactions } = useFetchTotalTransactions();
  const { resetFilters } = useFilterStore()

  const deleteTransaction = useCallback(
    async (id: number) => {
      try {
        const deleteQuery = `
        DELETE FROM transactions
        WHERE id = ?
        `
        const deleteResult = await db.runAsync(deleteQuery, [id])

        console.log('Delete Transaction Result', deleteResult)
        resetFilters()
        await fetchCurrentTransactions()
        await fetchTotalTransactions()

        Toast.show({
          type: "success",
          text1: "Operation Successful",
          text2: "Transaction deleted successfully!",
        });
      } catch (error) {
        console.error('Failed to delete transaction:', error)
        Toast.show({
          type: "error",
          text1: "Operation Failed",
          text2: "Failed to delete transaction. Please try again.",
        });
      }
    },
    [db]
  )

  return { deleteTransaction }
}