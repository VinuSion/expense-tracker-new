import React from "react";
import { View, Image, Pressable } from "react-native";

import TransactionCard from "./custom/transaction-card";
import { H4, P } from "./ui/typography";

import {
	GroupedTransactionsByBank,
	TransformedTransaction,
} from "@/utils/types";
import { formatAmount } from "@/utils/helpers";

interface BankGroupedProps {
	item: GroupedTransactionsByBank;
	activeCardId: number | null;
	setActiveCardId: (id: number | null) => void;
  openUpdateTransactionSheet: (transaction: TransformedTransaction) => void;
}

const BankGrouped: React.FC<BankGroupedProps> = ({
	item,
	activeCardId,
	setActiveCardId,
  openUpdateTransactionSheet,
}) => {
	return (
		<View className="rounded-md mb-4">
			<Pressable
				className="flex-row items-center justify-between p-2 mb-2 bg-background border border-border rounded-md"
				onPress={() => setActiveCardId(null)}
			>
				<View className="flex-row items-center gap-2">
					<Image
						source={{ uri: item.logo_url }}
						className="rounded-full overflow-hidden"
            style={{width: 35, height: 35}}
					/>
					<H4 style={{ fontFamily: "Poppins-Bold" }}>{item.bank_name}</H4>
				</View>

				<View className="flex-col items-start justify-start">
					<P className="text-green-500">+${formatAmount(item.incomeAmount)}</P>
					<P className="text-destructive">
						-${formatAmount(item.expenseAmount)}
					</P>
				</View>
			</Pressable>
			{item.transactions.map((transaction: TransformedTransaction) => (
				<TransactionCard
					key={transaction.id}
					transaction={transaction}
					isActive={transaction.id === activeCardId}
					showCategory
					setActiveCardId={setActiveCardId}
          openUpdateTransactionSheet={openUpdateTransactionSheet}
				/>
			))}
		</View>
	);
};

export default BankGrouped;
