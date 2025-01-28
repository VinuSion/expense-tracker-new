import { useState, useEffect, useRef } from "react";
import { View, Image, TouchableOpacity, Animated } from "react-native";
import { BlurView } from "expo-blur";
import { LongPressGestureHandler, State } from "react-native-gesture-handler";
import { MaterialIcons } from "@expo/vector-icons";

import { Button } from "../ui/button";
import { H4, P, Muted } from "../ui/typography";
import ConfirmModal from "../ui/confirm-modal";

import { TransformedTransaction } from "@/utils/types";
import { formatDate, formatAmount, getCategoryIcon } from "@/utils/helpers";
import { useDeleteTransaction } from "@/hooks/useDeleteTransaction";

import { colors } from "@/utils/colors";
import { useColorScheme } from "@/lib/useColorScheme";

interface TransactionCardProps {
	transaction: TransformedTransaction;
	showBank?: boolean;
	showCategory?: boolean;
	isActive: boolean;
	setActiveCardId: (id: number | null) => void;
	openUpdateTransactionSheet: (transaction: TransformedTransaction) => void;
}

export default function TransactionCard({
	transaction,
	isActive,
	showBank = false,
	showCategory = false,
	setActiveCardId,
	openUpdateTransactionSheet,
}: TransactionCardProps) {
	const { colorScheme } = useColorScheme();

	const {
		id,
		amount,
		currency,
		transaction_type,
		transaction_description,
		transaction_date,
		category,
		bank,
	} = transaction;

	const formattedAmount = `${
		transaction_type === "Expense" ? "-" : "+"
	}$${formatAmount(amount)}`;

	const { deleteTransaction } = useDeleteTransaction();

	const wordCount = 55;
	const lettersInDescription = transaction_description
		? transaction_description.trim().length
		: 0;

	const [isExpanded, setIsExpanded] = useState(false);
	const [showWidgets, setShowWidgets] = useState(false);
	const [dialogVisible, setDialogVisible] = useState(false);

	const scale = useState(new Animated.Value(1))[0];

	useEffect(() => {
		if (!isActive) {
			Animated.spring(scale, {
				toValue: 1,
				useNativeDriver: true,
			}).start();
			setShowWidgets(false);
		}
	}, [isActive]);

	const handleLongPress = ({ nativeEvent }: any) => {
		if (nativeEvent.state === State.ACTIVE) {
			Animated.spring(scale, {
				toValue: 0.95,
				useNativeDriver: true,
			}).start();
			setShowWidgets(true);
			setActiveCardId(transaction.id);
		}
	};

	const confirmDelete = () => {
		console.log("Deleted transaction:", transaction.id);
		deleteTransaction(transaction.id);

		setDialogVisible(false);
		setActiveCardId(null);
	};

	return (
		<TouchableOpacity activeOpacity={1} onPress={() => setActiveCardId(null)}>
			<LongPressGestureHandler
				onHandlerStateChange={handleLongPress}
				minDurationMs={150}
			>
				<View style={{ position: "relative" }}>
					<Animated.View
						style={{ transform: [{ scale }] }}
						className="flex flex-col justify-between gap-2 rounded-md bg-muted p-4 mb-2 border border-border"
					>
						<View className="flex flex-row flex-wrap gap-2 justify-between">
							<View className="flex-row gap-1 items-center">
								<H4
									className={`${transaction_type === "Expense" ? "text-destructive" : "text-green-500"}`}
									style={{ fontFamily: "Poppins-SemiBold" }}
								>
									{formattedAmount}
								</H4>
								<Muted>{currency}</Muted>
							</View>

							<View className="flex flex-row flex-wrap gap-2 justify-end">
								{showBank && (
									<View
										className="flex flex-row items-center gap-1 py-1 rounded-full bg-background"
										style={{ paddingHorizontal: 5 }}
									>
										<Image
											source={{ uri: bank.logo_url }}
											className="rounded-full overflow-hidden"
											style={{ width: 18, height: 18 }}
										/>
										<Muted>{bank.bank_name}</Muted>
									</View>
								)}

								{showCategory && (
									<View
										className="flex flex-row items-center gap-1 py-1 rounded-full bg-background"
										style={{ paddingHorizontal: 5 }}
									>
										<MaterialIcons
											name={getCategoryIcon(category.category_name)}
											size={14}
											color={
												colorScheme === "dark"
													? colors.dark.mutedForeground
													: colors.light.mutedForeground
											}
										/>
										<Muted>{category.category_name}</Muted>
									</View>
								)}
							</View>
						</View>

						<View
							className={`flex ${lettersInDescription < wordCount ? "flex-wrap flex-row items-center" : "flex-col items-stretch"} gap-2 justify-between`}
						>
							{transaction_description && (
								<View
									className={`${lettersInDescription <= wordCount ? "flex" : "flex-1"} bg-background rounded py-1 px-3`}
								>
									{lettersInDescription < wordCount ? (
										<Muted>{transaction_description}</Muted>
									) : (
										<TouchableOpacity
											activeOpacity={1}
											className={`flex flex-row gap-1 justify-between ${isExpanded ? "items-start" : "items-center"}`}
											onPress={() => setIsExpanded(!isExpanded)}
										>
											{isExpanded ? (
												<Muted numberOfLines={8}>
													{transaction_description}
												</Muted>
											) : (
												<Muted numberOfLines={1}>
													{transaction_description}
												</Muted>
											)}
											<MaterialIcons
												style={{
													transform: isExpanded
														? "rotate(180deg)"
														: "rotate(0deg)",
												}}
												className={`${isExpanded ? "mt-0.5" : "mt-0"}`}
												name="expand-circle-down"
												size={14}
												color={
													colorScheme === "dark"
														? colors.dark.mutedForeground
														: colors.light.mutedForeground
												}
											/>
										</TouchableOpacity>
									)}
								</View>
							)}

							<View className="flex">
								<Muted className="text-foreground">
									{formatDate(transaction_date)}
								</Muted>
							</View>
						</View>
					</Animated.View>

					{showWidgets && (
						<View
							className="flex-row gap-4"
							style={{
								position: "absolute",
								zIndex: 5,
								top: "50%",
								right: 15,
								transform: [{ translateY: "-50%" }],
							}}
						>
							<Button
								size="icon"
								variant="default"
								className="h-12"
								onPress={() => openUpdateTransactionSheet(transaction)}
							>
								<MaterialIcons
									name="edit"
									size={20}
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
								onPress={() => setDialogVisible(true)}
							>
								<MaterialIcons
									name="delete"
									size={20}
									color={
										colorScheme === "dark"
											? colors.dark.background
											: colors.light.background
									}
								/>
							</Button>
						</View>
					)}

					{showWidgets && (
						<BlurView
							className="flex-1 h-full w-full rounded-md absolute overflow-hidden"
							tint={
								colorScheme === "dark"
									? "systemMaterialDark"
									: "systemMaterialLight"
							}
							intensity={10}
							experimentalBlurMethod="dimezisBlurView"
						/>
					)}

					<ConfirmModal
						visible={dialogVisible}
						title="Delete Transaction"
						description="Are you sure you want to delete this transaction?"
						confirmButtonText="Delete"
						onClose={() => {
							setDialogVisible(false);
							setActiveCardId(null);
						}}
						onConfirm={confirmDelete}
					/>
				</View>
			</LongPressGestureHandler>
		</TouchableOpacity>
	);
}
