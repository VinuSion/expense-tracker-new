import React, { useState } from "react";
import { View, TextInput } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

import { Button } from "@/components/ui/button";
import { Muted } from "@/components/ui/typography";

import { useFetchCategories } from "@/hooks/useFetchCategories";
import { useInsertCategory } from "@/hooks/useInsertCategory";

import { getCategoryIcon } from "@/utils/helpers";
import { colors } from "@/utils/colors";
import { useColorScheme } from "@/lib/useColorScheme";

const AddCategoriesForm = () => {
	const { colorScheme } = useColorScheme();
	const { categories, refreshCategories } = useFetchCategories();
	const { insertCategory } = useInsertCategory();
	const [newCategory, setNewCategory] = useState<string>("");

	const handleAddCategory = async () => {
		if (!newCategory) {
			Toast.show({
				type: "error",
				text1: "You stupid idiot",
				text2:
					"Adding a category without typing anything? Lost your whole mind.",
			});
			return;
		}

		if (newCategory.length > 25) {
			Toast.show({
				type: "error",
				text1: "Im not reading all dat",
				text2: "Category name must not exceed 25 characters.",
			});
			return;
		}

		const isValid = /^[a-zA-Z\s]+$/.test(newCategory);
		if (!isValid) {
			Toast.show({
				type: "error",
				text1: "Yeah Shush man",
				text2: "Category name must only contain letters and spaces.",
			});
			return;
		}

		console.log("New Category Form Input:", newCategory);
		await insertCategory(newCategory.trim());
		refreshCategories();
		Toast.show({
			type: "success",
			text1: "Operation Successful",
			text2: "Added new category successfully!",
		});

		setNewCategory("");
	};

	return (
		<View className="w-full flex flex-col">
			<Muted className="mb-2">
				You can only create "Expense" categories right now because they're more
				common than "Income" categories. However, you can't delete or edit
				categories, so choose their names carefully!
			</Muted>
			<View className="flex-row flex gap-2 mb-4">
				<TextInput
					className="flex-1 border border-border rounded-md p-3 text-foreground"
					placeholder="Add New Category..."
					placeholderTextColor="#ccc"
					value={newCategory}
					onChangeText={setNewCategory}
					style={{ fontFamily: "Poppins" }}
				/>
				<Button size="icon" variant="default" onPress={handleAddCategory}>
					<MaterialIcons
						name="add-circle"
						size={24}
						color={
							colorScheme === "dark"
								? colors.dark.background
								: colors.light.background
						}
					/>
				</Button>
			</View>
			<View className="bg-background border border-border rounded-md flex-grow-0">
				<View className="flex flex-row flex-wrap gap-2 p-2">
					{categories.map((item) => (
						<View
							key={item.id}
							className="flex flex-row items-center gap-1 py-1 px-3 rounded-full bg-secondary"
						>
							<MaterialIcons
								name={getCategoryIcon(item.category_name)}
								size={10}
								color={
									colorScheme === "dark"
										? colors.dark.mutedForeground
										: colors.light.mutedForeground
								}
							/>
							<Muted>{item.category_name}</Muted>
						</View>
					))}
				</View>
			</View>
		</View>
	);
};

export default AddCategoriesForm;
