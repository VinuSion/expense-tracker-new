import { useRef, useState, useEffect } from "react";
import { View, ScrollView, FlatList, TouchableOpacity } from "react-native";

import TransactionForm from "@/components/forms/TransactionForm";
import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { H3, P, Muted } from "@/components/ui/typography";
import {
	CustomBottomSheet,
	CustomBottomSheetRef,
} from "@/components/ui/bottom-sheet";
import ViewTypeModal from "@/components/view-type-modal";

import { MaterialIcons } from "@expo/vector-icons";
import { useDBStore } from "@/store/dbStore";
import { useFilterStore } from "@/store/filterStore";
import { useFetchTransactions } from "@/hooks/useFetchTransactions";
import { useInsertTransaction } from "@/hooks/useInsertTransaction";

import {
	formatAmount,
	groupTransactionsByBank,
	groupTransactionsByCategory,
} from "@/utils/helpers";
import {
	TransformedTransaction,
	GroupedTransactionsByBank,
	GroupedTransactionsByCategory,
} from "@/utils/types";

import { colors } from "@/utils/colors";
import { useColorScheme } from "@/lib/useColorScheme";

export default function Home() {
	const { colorScheme } = useColorScheme();

	const { fetchCurrentTransactions } = useFetchTransactions();
	const { currentTransactions, transactionsSummary, dbExists, viewType } =
		useDBStore();
	const { filters } = useFilterStore();

	const { insertTransaction } = useInsertTransaction();
	const newTransactionSheet = useRef<CustomBottomSheetRef>(null);
	const filtersSheet = useRef<CustomBottomSheetRef>(null);

	const [viewTypeModalVisible, setViewTypeModalVisible] = useState(false);

	const [activeCardId, setActiveCardId] = useState<number | null>(null);
	const groupedTransactions = groupTransactionsByBank(currentTransactions);
	const groupedTransactionsByCategory =
		groupTransactionsByCategory(currentTransactions);

	const openNewTransactionSheet = () => {
		newTransactionSheet.current?.open(2);
	};

	const closeNewTransactionSheet = () => {
		newTransactionSheet.current?.close();
	};

	const openFiltersSheet = () => {
		filtersSheet.current?.open(2);
	};

	const closeFiltersSheet = () => {
		filtersSheet.current?.close();
	};

	useEffect(() => {
		if (dbExists) {
			console.warn("Calling Fetch Transactions...");
			fetchCurrentTransactions();
		}
	}, [dbExists]);

	return (
		<SafeAreaView className="flex-1 bg-background">
			<TouchableOpacity
				activeOpacity={1}
				onPress={() => setActiveCardId(null)}
				style={{ flex: 1, padding: 16 }}
			>
				<H3>{filters.title}</H3>
				<View className="flex flex-row items-center gap-2">
					<Button
						className="flex-1 flex-row gap-1"
						size="default"
						variant="default"
						onPress={openNewTransactionSheet}
						text="New Transaction"
					>
						<MaterialIcons
							name="add-circle"
							size={18}
							color={
								colorScheme === "dark"
									? colors.dark.background
									: colors.light.background
							}
						/>
					</Button>
					<Button
						size="icon"
						variant="default"
						className="h-12"
						onPress={() => setViewTypeModalVisible(true)}
					>
						<MaterialIcons
							name="view-cozy"
							size={24}
							color={
								colorScheme === "dark"
									? colors.dark.background
									: colors.light.background
							}
						/>
					</Button>
					<Button
						size="icon"
						variant="default"
						className="h-12"
						onPress={openFiltersSheet}
					>
						<MaterialIcons
							name="filter-alt"
							size={24}
							color={
								colorScheme === "dark"
									? colors.dark.background
									: colors.light.background
							}
						/>
					</Button>
				</View>
				<ViewTypeModal
					visible={viewTypeModalVisible}
					onClose={() => setViewTypeModalVisible(false)}
				/>
			</TouchableOpacity>
			<CustomBottomSheet ref={newTransactionSheet} title="New Transaction">
				<TransactionForm
					mode="new"
					onSubmit={insertTransaction}
					onClose={closeNewTransactionSheet}
				/>
			</CustomBottomSheet>
			<CustomBottomSheet ref={filtersSheet} title="Filters">
        
      </CustomBottomSheet>
		</SafeAreaView>
	);
}
