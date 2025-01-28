import { useCallback } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { useFetchTransactions } from "./useFetchTransactions";
import { useFetchTotalTransactions } from "./useFetchTotalTransactions";
import Toast from "react-native-toast-message";

import { useFilterStore } from "@/store/filterStore";
import { NewTransaction } from "@/utils/types";

export const useInsertTransaction = () => {
	const db = useSQLiteContext();
	const { fetchCurrentTransactions } = useFetchTransactions();
  const { fetchTotalTransactions } = useFetchTotalTransactions();
	const { resetFilters } = useFilterStore();

	const insertTransaction = useCallback(
		async (transaction: NewTransaction) => {
			try {
				const {
					amount,
					currency,
					transaction_date,
					transaction_description,
					category_id,
					bank,
					transaction_type,
				} = transaction;

				const insertQuery = `
        INSERT INTO transactions (amount, currency, transaction_date, transaction_description, category_id, bank_id, transaction_type)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
				const insertResult = await db.runAsync(insertQuery, [
					amount,
					currency,
					transaction_date,
					transaction_description,
					category_id,
					bank?.id,
					transaction_type,
				]);

				console.log("Insert New Transaction Result", insertResult);
				resetFilters();
				await fetchCurrentTransactions();
        await fetchTotalTransactions();

				Toast.show({
					type: "success",
					text1: "Operation Successful",
					text2: "New Transaction inserted successfully!",
				});
			} catch (error) {
				console.error("Failed to insert transaction:", error);
				Toast.show({
					type: "error",
					text1: "Operation Failed",
					text2: "Failed to insert transaction. Please try again.",
				});
			}
		},
		[db],
	);

	return { insertTransaction };
};
