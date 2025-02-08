import React from "react";
import { View, Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import TransactionCard from "./custom/transaction-card";
import { H4, P } from "./ui/typography";

import {
	GroupedTransactionsByCategory,
	TransformedTransaction,
} from "@/utils/types";
import { formatAmount, getCategoryIcon } from "@/utils/helpers";

import { colors } from "@/utils/colors";
import { useColorScheme } from "@/lib/useColorScheme";

interface CategoryGroupedProps {
	item: GroupedTransactionsByCategory;
	activeCardId: number | null;
	setActiveCardId: (id: number | null) => void;
  openUpdateTransactionSheet: (transaction: TransformedTransaction) => void;
}

const CategoryGrouped: React.FC<CategoryGroupedProps> = ({
	item,
	activeCardId,
	setActiveCardId,
  openUpdateTransactionSheet,
}) => {
	const { colorScheme } = useColorScheme();

	return (
		<View className="rounded-md mb-4">
			<Pressable
				className="flex-row items-center justify-between p-2 mb-2 bg-background border border-border rounded-md"
				onPress={() => setActiveCardId(null)}
			>
				<View className="flex-row items-center gap-2">
					<MaterialIcons
						name={getCategoryIcon(item.category_name)}
						size={24}
						color={
							colorScheme === "dark"
								? colors.dark.foreground
								: colors.light.foreground
						}
					/>
					<H4 style={{ fontFamily: "Poppins-Bold" }}>{item.category_name}</H4>
				</View>

				<View className="flex-col items-end justify-start">
					{item.category_type === "Expense" ? (
						<>
							<P
								className="text-destructive"
								style={{ fontFamily: "Poppins-SemiBold" }}
							>
								Expense
							</P>
							<P className="text-destructive">
								-${formatAmount(item.expenseAmount ?? 0)}
							</P>
						</>
					) : (
						<>
							<P
								className="text-green-500"
								style={{ fontFamily: "Poppins-SemiBold" }}
							>
								Income
							</P>
							<P className="text-green-500">
								-${formatAmount(item.incomeAmount ?? 0)}
							</P>
						</>
					)}
				</View>
			</Pressable>
			{item.transactions.map((transaction: TransformedTransaction) => (
				<TransactionCard
					key={transaction.id}
					transaction={transaction}
					isActive={transaction.id === activeCardId}
					showBank
					setActiveCardId={setActiveCardId}
          openUpdateTransactionSheet={openUpdateTransactionSheet}
				/>
			))}
		</View>
	);
};

export default CategoryGrouped;
