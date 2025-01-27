import { useCallback } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { useDBStore } from "@/store/dbStore";
import { TransactionSummaryQuery, TransactionWithDetails } from "@/utils/types";

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

		const transactionsByMonthResult = await db.getAllAsync<TransactionSummaryQuery>(
			`SELECT
        COALESCE(SUM(CASE WHEN transaction_type = 'Expense' AND currency = 'COP' THEN amount ELSE 0 END), 0) AS totalCopExpenses,
        COALESCE(SUM(CASE WHEN transaction_type = 'Income' AND currency = 'COP' THEN amount ELSE 0 END), 0) AS totalCopIncome,
        COALESCE(SUM(CASE WHEN transaction_type = 'Expense' AND currency = 'USD' THEN amount ELSE 0 END), 0) AS totalUsdExpenses,
        COALESCE(SUM(CASE WHEN transaction_type = 'Income' AND currency = 'USD' THEN amount ELSE 0 END), 0) AS totalUsdIncome
      FROM transactions
      WHERE strftime('%Y-%m', transaction_date) = strftime('%Y-%m', 'now')`,
		);

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
		}));

		setCurrentTransactions(transformedTransactions);
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
	}, [db, setCurrentTransactions, setTransactionsSummary]);

	return { fetchCurrentTransactions };
}
