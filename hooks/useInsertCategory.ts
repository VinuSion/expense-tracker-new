import { useCallback } from "react";
import { useSQLiteContext } from "expo-sqlite";
import Toast from "react-native-toast-message";

import { TransactionType } from "@/utils/types";

export function useInsertCategory() {
	const db = useSQLiteContext();

	const insertCategory = useCallback(
		async (
			category_name: string,
			category_type: TransactionType = "Expense",
		) => {
			try {
				const insertQuery = `
        INSERT INTO categories (category_name, category_type) VALUES (?, ?)
        `;

				const insertResult = await db.runAsync(insertQuery, [
					category_name,
					category_type,
				]);

				console.log("Insert New Category Result", insertResult);
        Toast.show({
          type: "success",
          text1: "Operation Successful",
          text2: "New Category added Successfully!",
        });
			} catch (error) {
				console.error("Failed to insert category:", error);
        Toast.show({
          type: "error",
          text1: "Operation Failed",
          text2: "Failed to add category. Please try again.",
        });
			}
		},
		[db],
	);

	return { insertCategory };
}
