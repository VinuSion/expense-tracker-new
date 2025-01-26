import { useEffect, useState, useCallback } from 'react'
import { useSQLiteContext } from 'expo-sqlite'
import { useDBStore } from '@/store/dbStore'
import { Category } from '@/utils/types'

export function useFetchCategories() {
  const { dbExists } = useDBStore()
  const db = useSQLiteContext()
  const [categories, setCategories] = useState<Category[]>([])
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const fetchCategories = useCallback(async () => {
    try {
      const result = await db.getAllAsync<Category>(`SELECT * FROM categories;`)
      console.log('Categories Data:', result)
      setCategories(result)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }, [db])

  const refreshCategories = () => setRefreshTrigger((prev) => prev + 1)

  useEffect(() => {
    if (db && dbExists) {
      console.log('Fetching categories...')
      db.withTransactionAsync(async () => {
        await fetchCategories()
      })
    }
  }, [db, dbExists, refreshTrigger])

  return { categories, refreshCategories, fetchCategories }
}