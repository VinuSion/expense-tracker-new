import { useEffect, useCallback } from 'react'
import { useSQLiteContext } from 'expo-sqlite'
import { useDBStore } from '@/store/dbStore'

export function useFetchTotalTransactions() {
  const { dbExists, totalTransactions, setTotalTransactions } = useDBStore()
  const db = useSQLiteContext()

  const fetchTotalTransactions = useCallback(async () => {
    try {
      const result = await db.getAllAsync<{ total: number }>(`SELECT COUNT(*) as total FROM transactions;`)
      console.log('Total Transactions:', result[0]?.total)
      setTotalTransactions(result[0]?.total || 0)
    } catch (error) {
      console.error('Error fetching total transactions:', error)
    }
  }, [db, setTotalTransactions])

  return { fetchTotalTransactions }
}