import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, TextInput } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import CurrencyInput from "react-native-currency-input";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useFormData } from "@/hooks/useFormData";
import {
	NewTransaction,
	UpdateTransaction,
	TransactionType,
	TransactionFormProps,
	CurrencyType,
	Bank,
} from "@/utils/types";
import { formatDateToISO, formatDate } from "@/utils/helpers";

import OptionSwitcher from "../ui/option-switcher";
import { Muted, P } from "../ui/typography";
import { Button } from "@/components/ui/button";
import CategorySelector from "@/components/custom/categories-list";
import BanksSelector from "@/components/custom/banks-list";

import { colors } from "@/utils/colors";
import { useColorScheme } from "@/lib/useColorScheme";

const TransactionForm: React.FC<TransactionFormProps> = ({
	initialTransaction,
	mode = "new",
	onSubmitNew,
	onSubmitUpdate,
	onClose,
}) => {
	const { colorScheme } = useColorScheme();

	// Determine if it's an "update" or "new" transaction
	const isUpdateMode = mode === "update";

	// Set initial state
	const [transactionType, setTransactionType] = useState<TransactionType>(
		initialTransaction?.transaction_type || "Expense",
	);
	const [transactionDescription, setTransactionDescription] = useState<string>(
		initialTransaction?.transaction_description || "",
	);
	const [amount, setAmount] = useState<number | null>(
		initialTransaction?.amount || null,
	);
	const [currency, setCurrency] = useState<CurrencyType>(
		initialTransaction?.currency || "COP",
	);
	const [selectedCategory, setSelectedCategory] = useState<number | null>(
		initialTransaction?.category?.category_id || null,
	);
	const [selectedBank, setSelectedBank] = useState<Bank | null>(
		initialTransaction?.bank || null,
	);
	const [transactionDate, setTransactionDate] = useState<Date>(
		initialTransaction
			? new Date(initialTransaction.transaction_date)
			: new Date(),
	);
	const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

	// Fetch dynamic data
	const { banks, categories } = useFormData(transactionType);

	// Update state when initialTransaction changes
	useEffect(() => {
		if (initialTransaction) {
			setTransactionType(initialTransaction.transaction_type);
			setTransactionDescription(initialTransaction.transaction_description);
			setAmount(initialTransaction.amount);
			setCurrency(initialTransaction.currency);
			setSelectedCategory(initialTransaction.category.category_id);
			setSelectedBank(initialTransaction.bank);
			setTransactionDate(new Date(initialTransaction.transaction_date));
		}
	}, [initialTransaction]);

	// Handle Date Selection
	const handleDateChange = (_: any, selectedDate?: Date) => {
		const currentDate = selectedDate || transactionDate;
		setShowDatePicker(false);
		setTransactionDate(currentDate);
	};

	const resetForm = () => {
		setTransactionType(initialTransaction?.transaction_type || "Expense");
		setTransactionDescription(
			initialTransaction?.transaction_description || "",
		);
		setAmount(initialTransaction?.amount || null);
		setCurrency(initialTransaction?.currency || "COP");
		setSelectedCategory(initialTransaction?.category?.category_id || null);
		setSelectedBank(initialTransaction?.bank || null);
		setTransactionDate(
			initialTransaction
				? new Date(initialTransaction.transaction_date)
				: new Date(),
		);
	};

	// Handle Form Submission
	const handleSubmit = async () => {
		if (!amount || !selectedCategory || !selectedBank) {
			Toast.show({
				type: "error",
				text1: "Missing Something?",
				text2: "Please fill in all required fields.",
			});
			return;
		}

		const transactionData: NewTransaction | UpdateTransaction = {
			amount,
			currency: currency,
			transaction_date: formatDateToISO(transactionDate),
			transaction_description: transactionDescription,
			category_id: selectedCategory,
			bank: selectedBank,
			transaction_type: transactionType,
			...(isUpdateMode && { id: initialTransaction?.id }), // Include ID in update mode
		};

		console.log(
			`${isUpdateMode ? "Update" : "New"} Transaction Form Input`,
			transactionData,
		);

		if (isUpdateMode && onSubmitUpdate) {
			await onSubmitUpdate(transactionData as UpdateTransaction);
		} else if (!isUpdateMode && onSubmitNew) {
			await onSubmitNew(transactionData as NewTransaction);
      resetForm();
		}
		onClose();
	};

	return (
		<View className="py-2">
			<OptionSwitcher
				className="mb-2"
				option1="Expense"
				option2="Income"
				option1Text="Expense"
				option2Text="Income"
				selectedOption={transactionType}
				onSelectOption={setTransactionType}
			/>
			<View className="flex flex-col gap-1 justify-start mb-4">
				<P>Choose Date</P>
				<TouchableOpacity
					onPress={() => setShowDatePicker(true)}
					className="p-3 bg-secondary border-border border rounded-md"
				>
					<P className="text-foreground">{formatDate(transactionDate)}</P>
				</TouchableOpacity>
				{showDatePicker && (
					<DateTimePicker
						value={transactionDate}
						mode="date"
						display="default"
						onChange={handleDateChange}
					/>
				)}
			</View>
			<View className="flex flex-col gap-1 justify-start mb-4">
				<P>Description</P>
				<TextInput
					className="border border-border rounded-md p-3 text-foreground"
					placeholder="Description (optional)"
					placeholderTextColor="#ccc"
					value={transactionDescription}
					onChangeText={setTransactionDescription}
					style={{ fontFamily: "Poppins", height: 47 }}
				/>
			</View>
			<View className="flex flex-col gap-1 justify-start mb-4">
				<P>Amount</P>
				<View className="flex flex-row gap-2">
					<CurrencyInput
						value={amount}
						onChangeValue={setAmount}
						className="flex-1 border border-border rounded-md p-3 text-foreground"
						prefix="$"
						delimiter=","
						separator="."
						precision={0}
						placeholder="Amount"
						placeholderTextColor="#ccc"
						style={{ fontFamily: "Poppins" }}
					/>
					<View className="flex flex-row w-1/3 bg-background rounded-md border-border border">
						<TouchableOpacity
							className={`flex-1 items-center justify-center p-3 rounded-md ${
								currency === "COP" ? "bg-primary" : "bg-background"
							}`}
							onPress={() => setCurrency("COP")}
						>
							<P
								className={`${currency === "COP" ? "text-background" : "text-foreground"} text-center`}
								style={{
									fontFamily:
										currency === "COP" ? "Poppins-SemiBold" : "Poppins",
								}}
							>
								COP
							</P>
						</TouchableOpacity>
						<TouchableOpacity
							className={`flex-1 items-center justify-center p-3 rounded-md ${
								currency === "USD" ? "bg-primary" : "bg-background"
							}`}
							onPress={() => setCurrency("USD")}
						>
							<P
								className={`${currency === "USD" ? "text-background" : "text-foreground"} text-center`}
								style={{
									fontFamily:
										currency === "USD" ? "Poppins-SemiBold" : "Poppins",
								}}
							>
								USD
							</P>
						</TouchableOpacity>
					</View>
				</View>
			</View>
			<View className="flex flex-col gap-1 justify-start mb-4">
				<P>
					Choose Category <Muted>({transactionType})</Muted>
				</P>
				<CategorySelector
					categories={categories}
					selectedCategory={selectedCategory}
					setSelectedCategory={setSelectedCategory}
				/>
			</View>
			<View className="flex flex-col gap-1 justify-start mb-4">
				<P>Select Bank</P>
				<BanksSelector
					banks={banks}
					selectedBank={selectedBank}
					setSelectedBank={setSelectedBank}
				/>
			</View>
			<View className="flex-row gap-2 mt-4">
				<Button
					size="default"
					variant="secondary"
					className="flex-1"
					onPress={onClose}
					text="Cancel"
				/>
				<Button
					size="default"
					variant="default"
					className="flex-1 flex-row gap-1"
					onPress={handleSubmit}
					text={isUpdateMode ? "Update" : "Add"}
				>
					<MaterialIcons
						name={isUpdateMode ? "update" : "add-circle"}
						size={18}
						color={
							colorScheme === "dark"
								? colors.dark.background
								: colors.light.background
						}
					/>
				</Button>
			</View>
		</View>
	);
};

export default TransactionForm;
