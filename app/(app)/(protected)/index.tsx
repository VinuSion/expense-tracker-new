import { useRef, useState, useEffect } from "react";
import { View, FlatList, TouchableOpacity } from "react-native";

import { SafeAreaView } from "@/components/safe-area-view";

import SummaryHeader from "@/components/custom/summary-header";
import TransactionForm from "@/components/forms/transaction-form";
import FiltersForm from "@/components/forms/filters-form";
import BankGrouped from "@/components/bank-grouped";
import CategoryGrouped from "@/components/category-grouped";
import ViewTypeModal from "@/components/custom/view-type-modal";
import TransactionCard from "@/components/custom/transaction-card";

import { Button } from "@/components/ui/button";
import { Muted } from "@/components/ui/typography";
import {
	CustomBottomSheet,
	CustomBottomSheetRef,
} from "@/components/ui/bottom-sheet";

import { MaterialIcons } from "@expo/vector-icons";
import { useDBStore } from "@/store/dbStore";
import { useFilterStore } from "@/store/filterStore";
import { useFetchTransactions } from "@/hooks/useFetchTransactions";
import { useInsertTransaction } from "@/hooks/useInsertTransaction";
import { useUpdateTransaction } from "@/hooks/useUpdateTransaction";

import {
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
	const { currentTransactions, dbExists, viewType } = useDBStore();
	const { filters } = useFilterStore();

	const { insertTransaction } = useInsertTransaction();
  const { updateTransaction } = useUpdateTransaction();
  const [selectedTransaction, setSelectedTransaction] = useState<TransformedTransaction | null>(null);

	const newTransactionSheet = useRef<CustomBottomSheetRef>(null);
  const updateTransactionSheet = useRef<CustomBottomSheetRef>(null);
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

  const openUpdateTransactionSheet = (transaction: TransformedTransaction) => {
    setSelectedTransaction(transaction);
    updateTransactionSheet.current?.open(2);
  };

  const closeUpdateTransactionSheet = () => {
    updateTransactionSheet.current?.close();
    setSelectedTransaction(null);
    setActiveCardId(null);
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
				<SummaryHeader />
				<View className="flex flex-row items-center gap-2 mb-4">
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
				<View className="flex-1">
					{currentTransactions.length === 0 ? (
						<Muted className="text-center">{filters.message}</Muted>
					) : viewType === "bankGrouped" ? (
						<FlatList
							data={groupedTransactions}
							keyExtractor={(item) => item.bank_id.toString()}
							renderItem={({ item }: { item: GroupedTransactionsByBank }) => (
								<BankGrouped
									item={item}
									activeCardId={activeCardId}
									setActiveCardId={setActiveCardId}
                  openUpdateTransactionSheet={openUpdateTransactionSheet}
								/>
							)}
							className="gap-2 pb-2"
						/>
					) : viewType === "categoryGrouped" ? (
						<FlatList
							data={groupedTransactionsByCategory}
							keyExtractor={(item) => item.category_id.toString()}
							renderItem={({
								item,
							}: {
								item: GroupedTransactionsByCategory;
							}) => (
								<CategoryGrouped
									item={item}
									activeCardId={activeCardId}
									setActiveCardId={setActiveCardId}
                  openUpdateTransactionSheet={openUpdateTransactionSheet}
								/>
							)}
							className="gap-2 pb-2"
						/>
					) : (
						<FlatList
							data={currentTransactions}
							keyExtractor={(item) => item.id.toString()}
							renderItem={({ item }: { item: TransformedTransaction }) => (
								<TransactionCard
									transaction={item}
									isActive={item.id === activeCardId}
									showBank
									showCategory
									setActiveCardId={setActiveCardId}
                  openUpdateTransactionSheet={openUpdateTransactionSheet}
								/>
							)}
							className="gap-2 pb-2"
						/>
					)}
				</View>
				<ViewTypeModal
					visible={viewTypeModalVisible}
					onClose={() => setViewTypeModalVisible(false)}
				/>
			</TouchableOpacity>
			<CustomBottomSheet ref={newTransactionSheet} title="New Transaction">
				<TransactionForm
					mode="new"
					onSubmitNew={insertTransaction}
					onClose={closeNewTransactionSheet}
				/>
			</CustomBottomSheet>
      <CustomBottomSheet
        ref={updateTransactionSheet}
        title={`Update Transaction - (${selectedTransaction?.id})`}
        onChange={(index: number) => {
          if (index === -1) {
            setActiveCardId(null)
          }
        }}
      >
        <TransactionForm
          mode="update"
          initialTransaction={selectedTransaction || undefined}
          onSubmitUpdate={updateTransaction}
          onClose={closeUpdateTransactionSheet}
        />
      </CustomBottomSheet>
			<CustomBottomSheet ref={filtersSheet} title="Filters">
				<FiltersForm onClose={closeFiltersSheet} />
			</CustomBottomSheet>
		</SafeAreaView>
	);
}
