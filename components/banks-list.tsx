import React, { useState } from "react";
import { View, TouchableOpacity, Modal, FlatList, Image } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { P, H4 } from "./ui/typography";
import { BlurView } from "expo-blur";
import { Button } from "./ui/button";

import { Bank } from "@/utils/types";
import { colors } from "@/utils/colors";
import { useColorScheme } from "@/lib/useColorScheme";

interface BanksListProps {
	banks: Bank[];
	selectedBank: Bank | null;
	setSelectedBank: (bank: Bank | null) => void;
}

export default function BanksList({
	banks,
	selectedBank,
	setSelectedBank,
}: BanksListProps) {
	const { colorScheme } = useColorScheme();
	const [modalVisible, setModalVisible] = useState(false);

	const handleBankPress = (bank: Bank) => {
		setSelectedBank(bank);
		setModalVisible(false);
	};

	return (
		<View>
			<TouchableOpacity
				className="flex-row items-center p-3 bg-primary rounded-md"
				onPress={() => setModalVisible(true)}
			>
				{selectedBank ? (
					<View className="w-8 h-8 rounded-full overflow-hidden">
						<Image
							source={{ uri: selectedBank.logo_url }}
							className="w-full h-full"
						/>
					</View>
				) : (
					<View className="w-8 h-8 rounded-full overflow-hidden flex justify-center items-center bg-background">
						<MaterialIcons
							name="savings"
							size={15}
							color={
								colorScheme === "dark"
									? colors.dark.foreground
									: colors.light.foreground
							}
						/>
					</View>
				)}
				<P
					className="text-background ml-2"
					style={{ fontFamily: "Poppins-SemiBold" }}
				>
					{selectedBank ? selectedBank.bank_name : "Select Bank"}
				</P>
			</TouchableOpacity>

			<Modal
				animationType="fade"
				transparent={true}
				visible={modalVisible}
				onRequestClose={() => setModalVisible(false)}
			>
				<BlurView
					className="flex-1 justify-center items-center"
					tint={
						colorScheme === "dark"
							? "systemMaterialDark"
							: "systemMaterialLight"
					}
					intensity={30}
					experimentalBlurMethod="dimezisBlurView"
				>
					<View
						className="flex items-center bg-background rounded-md border border-border"
						style={{
							width: "85%",
							shadowColor: "#000",
							shadowOffset: { width: 0, height: 2 },
							shadowOpacity: 0.5,
							shadowRadius: 10,
							elevation: 10,
						}}
					>
						<View className="w-full bg-background p-6 rounded-md">
							<H4 className="text-center pb-2">Select Bank</H4>
							<View className=" bg-background rounded-md border-border border">
								<FlatList
									data={banks}
									keyExtractor={(item) => item.id.toString()}
									renderItem={({ item }) => (
										<TouchableOpacity
											className={`flex-row items-center p-3 border-b border-border ${selectedBank?.id === item.id && "bg-primary"}`}
											onPress={() => handleBankPress(item)}
										>
											<View className="w-8 h-8 rounded-full overflow-hidden mr-3">
												<Image
													source={{ uri: item.logo_url }}
													className="w-full h-full"
												/>
											</View>
											<P
												className={`${selectedBank?.id === item.id ? "text-background" : "text-foreground"}`}
												style={{
													fontFamily:
														selectedBank?.id === item.id
															? "Poppins-SemiBold"
															: "Poppins",
												}}
											>
												{item.bank_name}
											</P>
										</TouchableOpacity>
									)}
									ListHeaderComponent={
										<TouchableOpacity
											className="flex-row items-center p-3 border-b border-border"
											onPress={() => {
												setSelectedBank(null);
												setModalVisible(false);
											}}
										>
											<View className="w-8 h-8 rounded-full overflow-hidden flex justify-center items-center bg-foreground mr-3">
												<MaterialIcons
													name="savings"
													size={15}
													color={
														colorScheme === "dark"
															? colors.dark.background
															: colors.light.background
													}
												/>
											</View>
											<P className="text-foreground">N/A</P>
										</TouchableOpacity>
									}
									style={{ maxHeight: 300 }}
								/>
							</View>
							<Button
								className="w-full mt-4"
								size="default"
								variant="secondary"
								onPress={() => setModalVisible(false)}
								text="Close"
							/>
						</View>
					</View>
				</BlurView>
			</Modal>
		</View>
	);
}
