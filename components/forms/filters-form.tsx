import { useState, useEffect } from "react";
import { View, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import DateTimePicker from "@react-native-community/datetimepicker";

import CustomDropdown from "../ui/custom-dropdown";
import OptionSwitcher from "../ui/option-switcher";
import { Button } from "../ui/button";
import { P, Muted } from "../ui/typography";

import CategorySelector from "@/components/custom/categories-list";
import BanksSelector from "@/components/custom/banks-list";

import { toZonedTime } from "date-fns-tz";
import { format, parseISO, startOfWeek, endOfWeek } from "date-fns";

import { useFilterStore } from "@/store/filterStore";
import { useFormData } from "@/hooks/useFormData";
import { useFilteredTransactions } from "@/hooks/useFilteredTransactions";

import {
	DateRangePreset,
	TransactionType,
	Bank,
	FilterFormProps,
} from "@/utils/types";
import { getCurrentMonthYear, formatDate } from "@/utils/helpers";

import { EST_TIMEZONE } from "@/utils/constants";
import { colors } from "@/utils/colors";
import { useColorScheme } from "@/lib/useColorScheme";

const FiltersForm: React.FC<FilterFormProps> = ({ onClose }) => {
	const { colorScheme } = useColorScheme();
	const { filters, setFilters, resetFilters } = useFilterStore();
	const { fetchFilteredTransactions } = useFilteredTransactions();

	const [transactionType, setTransactionType] =
		useState<TransactionType>("Expense");
	const { banks, categories } = useFormData(transactionType);

	const [startDate, setStartDate] = useState<Date | undefined>(
		filters.dateRange?.start ? parseISO(filters.dateRange.start) : undefined,
	);
	const [endDate, setEndDate] = useState<Date | undefined>(
		filters.dateRange?.end ? parseISO(filters.dateRange.end) : undefined,
	);
	const [singleDayDate, setSingleDayDate] = useState<Date | undefined>(
		undefined,
	);
	const [selectedBank, setSelectedBank] = useState<Bank | null>(
		filters.bank ? filters.bank : null,
	);
	const [selectedCategory, setSelectedCategory] = useState<number | null>(
		filters.categoryId ? filters.categoryId : null,
	);

	const [showStartDatePicker, setShowStartDatePicker] = useState(false);
	const [showEndDatePicker, setShowEndDatePicker] = useState(false);

	const [selectedOrder, setSelectedOrder] = useState<
		"ascending" | "descending"
	>(filters.order || "descending");
	const [selectedPreset, setSelectedPreset] = useState<DateRangePreset>(
		filters.dateRangePreset ? filters.dateRangePreset : "none",
	);
	const { month, year } = getCurrentMonthYear();

	useEffect(() => {
		setStartDate(
			filters.dateRange?.start ? parseISO(filters.dateRange.start) : undefined,
		);
		setEndDate(
			filters.dateRange?.end ? parseISO(filters.dateRange.end) : undefined,
		);
		setSingleDayDate(undefined);
		setSelectedBank(filters.bank ? filters.bank : null);
		setSelectedCategory(filters.categoryId ? filters.categoryId : null);
		setSelectedOrder(filters.order || "descending");
		setSelectedPreset(
			filters.dateRangePreset ? filters.dateRangePreset : "none",
		);
	}, [filters]);

	const handlePresetChange = (preset: DateRangePreset) => {
		setSelectedPreset(preset);
		const today = new Date();

		setStartDate(undefined);
		setEndDate(undefined);
		setSingleDayDate(undefined);

		switch (preset) {
			case "today":
				setStartDate(today);
				setEndDate(today);
				break;
			case "thisWeek":
				setStartDate(startOfWeek(today));
				setEndDate(endOfWeek(today));
				break;
			default:
				setStartDate(undefined);
				setEndDate(undefined);
				setSingleDayDate(undefined);
				break;
		}
	};

	const handleStartDateChange = (_: any, selectedDate?: Date) => {
		setShowStartDatePicker(false);
		if (selectedDate) {
			if (endDate && selectedDate > endDate) {
				Toast.show({
					type: "error",
					text1: "Invalid Date Range",
					text2:
						"Please select a valid date range. You tried to select a start date greater than the end date.",
				});
			} else {
				setStartDate(selectedDate);
			}
		}
	};

	const handleEndDateChange = (_: any, selectedDate?: Date) => {
		setShowEndDatePicker(false);
		if (selectedDate) {
			if (startDate && selectedDate < startDate) {
				Toast.show({
					type: "error",
					text1: "Invalid Date Range",
					text2:
						"Please select a valid date range. You tried to select an end date less than the start date.",
				});
			} else {
				setEndDate(selectedDate);
			}
		}
	};

	const handleApply = async () => {
		let title = "";
		let message = "";

		if (startDate && endDate) {
			const startDateWithoutTime = new Date(startDate);
			startDateWithoutTime.setHours(0, 0, 0, 0);
			const endDateWithoutTime = new Date(endDate);
			endDateWithoutTime.setHours(0, 0, 0, 0);

			if (startDateWithoutTime.getTime() === endDateWithoutTime.getTime()) {
				title = `${format(startDate, "MMM dd, yyyy")}`;
				message = `No transactions for ${format(startDate, "MMM dd, yyyy")}`;
			} else {
				title = `${format(startDate, "MMM dd, yyyy")} - ${format(
					endDate,
					"MMM dd, yyyy",
				)}`;
				message = `No transactions from ${format(
					startDate,
					"MMM dd, yyyy",
				)} - ${format(endDate, "MMM dd, yyyy")}`;
			}
		} else if (startDate) {
			title = `${format(startDate, "MMM dd, yyyy")} - Today`;
			message = `No transactions for ${format(
				startDate,
				"MMM dd, yyyy",
			)} - Today`;
		} else if (endDate) {
			title = `All - ${format(endDate, "MMM dd, yyyy")}`;
			message = `No transactions for All - ${format(endDate, "MMM dd, yyyy")}`;
		} else {
			title = `${month}, ${year} - Summary`;
			message = `No transactions for ${month} yet.`;
		}

		const formattedStartDate = startDate
			? format(toZonedTime(startDate, EST_TIMEZONE), "yyyy-MM-dd") + " 00:00:00"
			: undefined;
		const formattedEndDate = endDate
			? format(toZonedTime(endDate, EST_TIMEZONE), "yyyy-MM-dd") + " 23:59:59"
			: undefined;

		const newFilters = {
			dateRange: {
				start: formattedStartDate,
				end: formattedEndDate,
			},
			bank: selectedBank ? selectedBank : undefined,
			categoryId: selectedCategory ? selectedCategory : undefined,
			order: selectedOrder,
			title,
			message,
			dateRangePreset: selectedPreset,
		};

		console.log("Filters in Form", newFilters);
		setFilters(newFilters);
		await fetchFilteredTransactions(newFilters);
		onClose();
	};

	const handleReset = async () => {
		resetFilters();
		setTransactionType("Expense");
		await fetchFilteredTransactions({});
	};

	return (
		<View className="py-2">
			<View className="flex flex-col gap-1 justify-start mb-4">
				<P>Date Range</P>
				<View className="flex flex-row gap-2">
					<CustomDropdown
						className="flex-1"
						options={[
							{ label: "Select Date Range", value: "none" },
							{ label: "Today", value: "today" },
							{ label: "Single Day", value: "singleDay" },
							{ label: "This Week", value: "thisWeek" },
							{ label: "Custom", value: "custom" },
						]}
						selectedValue={selectedPreset}
						onValueChange={handlePresetChange}
					/>

					<Button
						size="icon"
						variant="default"
						className="h-14"
						onPress={handleReset}
					>
						<MaterialIcons
							name="replay"
							size={24}
							color={
								colorScheme === "dark"
									? colors.dark.background
									: colors.light.background
							}
						/>
					</Button>
				</View>
			</View>

			{selectedPreset === "singleDay" && (
				<View className="flex flex-col gap-1 justify-start mb-4">
					<TouchableOpacity
						onPress={() => setShowStartDatePicker(true)}
						className="p-3 bg-secondary border-border border rounded-md"
					>
						<P className="text-foreground">
							{singleDayDate ? formatDate(singleDayDate) : "Select Date"}
						</P>
					</TouchableOpacity>
					{showStartDatePicker && (
						<DateTimePicker
							value={singleDayDate || new Date()}
							mode="date"
							display="default"
							onChange={(_, selectedDate) => {
								setShowStartDatePicker(false);
								if (selectedDate) {
									setSingleDayDate(selectedDate);
									setStartDate(selectedDate);
									setEndDate(selectedDate);
								}
							}}
						/>
					)}
				</View>
			)}

			{selectedPreset === "custom" && (
				<View className="flex flex-row gap-2 justify-start mb-4">
					<TouchableOpacity
						onPress={() => setShowStartDatePicker(true)}
						className="flex-1 items-center p-3 bg-secondary border-border border rounded-md"
					>
						<P className="text-foreground">
							{startDate ? formatDate(startDate) : "Select Start Date"}
						</P>
					</TouchableOpacity>
					{showStartDatePicker && (
						<DateTimePicker
							value={startDate || new Date()}
							mode="date"
							display="default"
							onChange={handleStartDateChange}
						/>
					)}
					<TouchableOpacity
						onPress={() => setShowEndDatePicker(true)}
						className="flex-1 items-center p-3 bg-secondary border-border border rounded-md"
					>
						<P className="text-foreground">
							{endDate ? formatDate(endDate) : "Select End Date"}
						</P>
					</TouchableOpacity>
					{showEndDatePicker && (
						<DateTimePicker
							value={endDate || new Date()}
							mode="date"
							display="default"
							onChange={handleEndDateChange}
						/>
					)}
				</View>
			)}

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

			<View className="flex flex-col gap-1 justify-start mb-4">
				<P>Transaction Type</P>
				<OptionSwitcher
					option1="Expense"
					option2="Income"
					option1Text="Expense"
					option2Text="Income"
					selectedOption={transactionType}
					onSelectOption={setTransactionType}
				/>
			</View>

			<View className="flex flex-col gap-1 justify-start mb-4">
				<P>Order</P>
				<OptionSwitcher
					option1="ascending"
					option2="descending"
					option1Text="Ascending"
					option2Text="Descending"
					selectedOption={selectedOrder}
					onSelectOption={setSelectedOrder}
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
					onPress={handleApply}
					text="Apply"
				>
					<MaterialIcons
						name="check-box"
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

export default FiltersForm;
