import { useEffect, useState } from 'react'
import { useSQLiteContext } from 'expo-sqlite'
import { useDBStore } from '@/store/dbStore'
import { Bank } from '@/utils/types'

export function useFetchBanks() {
  const { dbExists } = useDBStore()
  const db = useSQLiteContext()
  const [banks, setBanks] = useState<Bank[]>([])

  async function fetchBanks() {
    try {
      const result = await db.getAllAsync<Bank>(
        `SELECT * FROM banks;`
      )
      console.log('Banks Data:', result)
      setBanks(result)
    } catch (error) {
      console.error('Error fetching banks:', error)
    }
  }

  useEffect(() => {
    if (db && dbExists) {
      console.log('Fetching banks...')
      db.withTransactionAsync(async () => {
        await fetchBanks()
      })
    }
  }, [db, dbExists])

  return banks
}