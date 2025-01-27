import { useCallback } from 'react'
import { useSQLiteContext } from 'expo-sqlite'
import { useDBStore } from '@/store/dbStore'
import { TransactionWithDetails, TransactionSummaryQuery, Filters } from '@/utils/types'

export function useFilteredTransactions() {
  const db = useSQLiteContext()
  const { setCurrentTransactions, setTransactionsSummary } = useDBStore()

  const fetchFilteredTransactions = useCallback(async (filters: Filters) => {
    const conditions: string[] = []
    const params: (string | number)[] = []

    console.log('Filters', filters)

    // Handle date range filter
    if (filters.dateRange?.start && filters.dateRange?.end) {
      conditions.push('transaction_date BETWEEN ? AND ?')
      params.push(filters.dateRange.start, filters.dateRange.end)
    } else if (filters.dateRange?.start) {
      conditions.push('transaction_date >= ?')
      params.push(filters.dateRange.start)
    } else if (filters.dateRange?.end) {
      conditions.push('transaction_date <= ?')
      params.push(filters.dateRange.end)
    } else if (filters.month && filters.year) {
      conditions.push("strftime('%Y-%m', transaction_date) = ?")
      params.push(`${filters.year}-${filters.month}`)
    } else if (filters.year) {
      conditions.push("strftime('%Y', transaction_date) = ?")
      params.push(filters.year)
    } else {
      conditions.push("strftime('%Y-%m', transaction_date) = strftime('%Y-%m', 'now')")
    }

    // Handle other filters
    if (filters.bank !== undefined) {
      conditions.push('bank_id = ?')
      params.push(filters.bank?.id)
    }
    if (filters.categoryId !== undefined) {
      conditions.push('category_id = ?')
      params.push(filters.categoryId)
    }
    if (filters.transactionType !== undefined) {
      conditions.push('transaction_type = ?')
      params.push(filters.transactionType)
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    const orderClause = filters.order === 'ascending' ? 'ASC' : 'DESC'

    const transactionsResult = await db.getAllAsync<TransactionWithDetails>(
      `SELECT t.*, c.category_name, c.category_type, b.bank_name, b.logo_url
        FROM transactions t
        JOIN categories c ON t.category_id = c.id
        JOIN banks b ON t.bank_id = b.id
        ${whereClause}
        ORDER BY t.transaction_date ${orderClause}`,
      params
    )

    const transactionsByMonthResult = await db.getAllAsync<TransactionSummaryQuery>(
      `SELECT
        COALESCE(SUM(CASE WHEN transaction_type = 'Expense' AND currency = 'COP' THEN amount ELSE 0 END), 0) AS totalCopExpenses,
        COALESCE(SUM(CASE WHEN transaction_type = 'Income' AND currency = 'COP' THEN amount ELSE 0 END), 0) AS totalCopIncome,
        COALESCE(SUM(CASE WHEN transaction_type = 'Expense' AND currency = 'USD' THEN amount ELSE 0 END), 0) AS totalUsdExpenses,
        COALESCE(SUM(CASE WHEN transaction_type = 'Income' AND currency = 'USD' THEN amount ELSE 0 END), 0) AS totalUsdIncome
        FROM transactions
        ${whereClause}`,
      params
    )

    const transformedTransactions = transactionsResult.map((transaction) => ({
      id: transaction.id,
      transaction_date: transaction.transaction_date,
      transaction_description: transaction.transaction_description,
      transaction_type: transaction.transaction_type,
      amount: transaction.amount,
      currency: transaction.currency,
      category: {
        category_id: transaction.category_id,
        category_name: transaction.category_name,
        category_type: transaction.category_type,
      },
      bank: {
        id: transaction.bank_id,
        bank_name: transaction.bank_name,
        logo_url: transaction.logo_url,
      },
    }))

    console.log('Filtered Transformed Transactions', transformedTransactions)

    setCurrentTransactions(transformedTransactions)
    setTransactionsSummary({
			totalExpenses: {
				cop: transactionsByMonthResult[0].totalCopExpenses,
				usd: transactionsByMonthResult[0].totalUsdExpenses,
			},
			totalIncome: {
				cop: transactionsByMonthResult[0].totalCopIncome,
				usd: transactionsByMonthResult[0].totalUsdIncome,
			},
		});
  }, [db, setCurrentTransactions, setTransactionsSummary])

  return { fetchFilteredTransactions }
}