import { useState } from "react";
import { View, Text, TouchableOpacity, Modal, FlatList } from "react-native";
import { H4, P } from "./ui/typography";
import { Button } from "./ui/button";
import { BlurView } from "expo-blur";
import { MaterialIcons } from "@expo/vector-icons";

import { getCategoryIcon } from "@/utils/helpers";
import { Category } from "@/utils/types";

import { colors } from "@/utils/colors";
import { useColorScheme } from "@/lib/useColorScheme";

interface CategorySelectorProps {
	categories: Category[];
	selectedCategory: number | null;
	setSelectedCategory: (id: number | null) => void;
}

export default function CategorySelector({
	categories,
	selectedCategory,
	setSelectedCategory,
}: CategorySelectorProps) {
	const { colorScheme } = useColorScheme();
	const [modalVisible, setModalVisible] = useState(false);

	const handleCategoryPress = (id: number) => {
		setSelectedCategory(id);
		setModalVisible(false);
	};

	return (
		<View>
			<TouchableOpacity
				className="flex-row items-center justify-center p-3 bg-primary rounded-md"
				onPress={() => setModalVisible(true)}
			>
				<MaterialIcons
					name={getCategoryIcon(
						categories.find((cat) => cat.id === selectedCategory)
							?.category_name || "",
					)}
					size={18}
					color={
						colorScheme === "dark"
							? colors.dark.background
							: colors.light.background
					}
				/>
				<P
					className="text-center text-background ml-2"
					style={{ fontFamily: "Poppins-SemiBold" }}
				>
					{categories.find((cat) => cat.id === selectedCategory)
						?.category_name || "Select Category"}
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
							<H4 className="text-center pb-2">Select Category</H4>
							<View className="p-2 bg-background rounded-md border-border border">
								<FlatList
									data={categories}
									numColumns={2}
									style={{ maxHeight: 300 }}
									keyExtractor={(item) => item.id.toString()}
									renderItem={({ item }) => (
										<TouchableOpacity
											className={`flex-1 items-center justify-center p-3 m-1 rounded-md ${
												selectedCategory === item.id
													? "bg-primary"
													: "bg-secondary"
											}`}
											onPress={() => handleCategoryPress(item.id)}
										>
											<MaterialIcons
												name={getCategoryIcon(item.category_name)}
												size={18}
												color={
													selectedCategory === item.id
														? colorScheme === "dark"
															? colors.dark.background
															: colors.light.background
														: colorScheme === "dark"
															? colors.dark.foreground
															: colors.light.foreground
												}
											/>
											<P
												className={`${
													selectedCategory === item.id
														? "text-background"
														: "text-foreground"
												} text-center mt-2`}
												style={{
													fontFamily:
														selectedCategory === item.id
															? "Poppins-SemiBold"
															: "Poppins",
												}}
											>
												{item.category_name}
											</P>
										</TouchableOpacity>
									)}
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
