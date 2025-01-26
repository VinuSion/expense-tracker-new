import { useCallback } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { useDBStore } from "@/store/dbStore";
import { TransactionsSummary, TransactionWithDetails } from "@/utils/types";

export function useFetchTransactions() {
	const { setCurrentTransactions, setTransactionsSummary } = useDBStore();
	const db = useSQLiteContext();

	const fetchCurrentTransactions = useCallback(async () => {
		const transactionsResult = await db.getAllAsync<TransactionWithDetails>(
			`SELECT t.*, c.category_name, c.category_type, b.bank_name, b.logo_url
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       JOIN banks b ON t.bank_id = b.id
       WHERE strftime('%Y-%m', t.transaction_date) = strftime('%Y-%m', 'now')
       ORDER BY t.transaction_date DESC`,
		);

		const transactionsByMonthResult = await db.getAllAsync<TransactionsSummary>(
			`
      SELECT
        COALESCE(SUM(CASE WHEN transaction_type = 'Expense' THEN amount ELSE 0 END), 0) AS totalExpenses,
        COALESCE(SUM(CASE WHEN transaction_type = 'Income' THEN amount ELSE 0 END), 0) AS totalIncome
      FROM transactions
      WHERE strftime('%Y-%m', transaction_date) = strftime('%Y-%m', 'now')
    `,
		);

		const transformedTransactions = transactionsResult.map((transaction) => ({
			id: transaction.id,
			transaction_date: transaction.transaction_date,
			transaction_description: transaction.transaction_description,
			transaction_type: transaction.transaction_type,
			amount: transaction.amount,
			category: {
				category_id: transaction.category_id,
				category_name: transaction.category_name,
				category_type: transaction.category_type,
			},
			bank: {
				bank_id: transaction.bank_id,
				bank_name: transaction.bank_name,
				logo_url: transaction.logo_url,
			},
		}));

		setCurrentTransactions(transformedTransactions);
		setTransactionsSummary(transactionsByMonthResult[0]);
	}, [db, setCurrentTransactions, setTransactionsSummary]);

	return { fetchCurrentTransactions };
}
