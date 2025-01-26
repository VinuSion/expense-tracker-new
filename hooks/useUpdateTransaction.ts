import { useCallback } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { useFetchTransactions } from "./useFetchTransactions";
import Toast from "react-native-toast-message";

import { useFilterStore } from '@/store/filterStore'
import { UpdateTransaction } from "@/utils/types";

export const useUpdateTransaction = () => {
	const db = useSQLiteContext();
	const { fetchCurrentTransactions } = useFetchTransactions();
  const { resetFilters } = useFilterStore()

	const updateTransaction = useCallback(
		async (transaction: UpdateTransaction) => {
			try {
				const {
					id,
					amount,
          currency,
					transaction_date,
					transaction_description,
					category_id,
					bank,
					transaction_type,
				} = transaction;

				const updateQuery = `
        UPDATE transactions
        SET amount = ?, currency = ?, transaction_date = ?, transaction_description = ?, category_id = ?, bank_id = ?, transaction_type = ?
        WHERE id = ?
        `;
				const updateResult = await db.runAsync(updateQuery, [
					amount,
          currency,
					transaction_date,
					transaction_description,
					category_id,
					bank?.id,
					transaction_type,
					id,
				]);

				console.log("Update Transaction Result", updateResult);
        resetFilters()
				await fetchCurrentTransactions();

        Toast.show({
                  type: "success",
                  text1: "Operation Successful",
                  text2: "Transaction updated successfully!",
                });
			} catch (error) {
				console.error("Failed to update transaction:", error);
        Toast.show({
          type: "error",
          text1: "Operation Failed",
          text2: "Failed to update transaction. Please try again.",
        });
			}
		},
		[db],
	);

	return { updateTransaction };
};
