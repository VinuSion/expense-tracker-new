import { useEffect, useState } from 'react'
import { useSQLiteContext } from 'expo-sqlite'
import { useDBStore } from '@/store/dbStore'
import { Bank, Category, TransactionType } from '@/utils/types'

export function useFormData(transactionType: TransactionType = 'Expense') {
  const { dbExists } = useDBStore()
  const db = useSQLiteContext()
  const [banks, setBanks] = useState<Bank[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  async function fetchBanks() {
    return db.getAllAsync<Bank>(`SELECT * FROM banks;`)
  }

  async function fetchCategories() {
    return db.getAllAsync<Category>(
      `SELECT * FROM categories WHERE category_type = ?;`,
      [transactionType]
    )
  }

  useEffect(() => {
    if (db && dbExists) {
      Promise.all([fetchBanks(), fetchCategories()])
        .then(([banksResult, categoriesResult]) => {
          setBanks(banksResult)
          setCategories(categoriesResult)
        })
        .catch((error) => {
          console.error('Error fetching data:', error)
        })
    }
  }, [db, dbExists, transactionType])

  return { banks, categories }
}