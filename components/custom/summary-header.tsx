import { View } from "react-native";
import { H3, P, Muted } from "../ui/typography";

import { useFilterStore } from "@/store/filterStore";
import { useDBStore } from "@/store/dbStore";

import { formatAmount } from "@/utils/helpers";

const SummaryHeader = () => {
	const { filters } = useFilterStore();
	const { transactionsSummary } = useDBStore();

	return (
		<View className="mb-4">
			<H3 className="py-2" style={{ fontFamily: "Poppins-Bold" }}>{filters.title}</H3>
			<View className="flex justify-center p-4 bg-accent rounded-md border border-border">
				<View className="flex flex-column gap-1">
					<View className="flex-row items-center justify-between">
						<H3
							className="text-green-500"
							style={{ fontFamily: "Poppins-Bold" }}
						>
							+${formatAmount(transactionsSummary.totalIncome.cop)}{" "}
							<Muted>COP</Muted>
						</H3>
						{transactionsSummary.totalIncome.usd !== 0 && (
							<H3 className="text-green-500">
								+${formatAmount(transactionsSummary.totalIncome.usd)}{" "}
								<Muted>USD</Muted>
							</H3>
						)}
					</View>

					<View className="flex-row items-center justify-between">
						<H3
							className="text-destructive"
							style={{ fontFamily: "Poppins-Bold" }}
						>
							-${formatAmount(transactionsSummary.totalExpenses.cop)}{" "}
							<Muted>COP</Muted>
						</H3>
						{transactionsSummary.totalExpenses.usd !== 0 && (
							<H3 className="text-destructive">
								-${formatAmount(transactionsSummary.totalExpenses.usd)}{" "}
								<Muted>USD</Muted>
							</H3>
						)}
					</View>
				</View>
			</View>
		</View>
	);
};

export default SummaryHeader;
