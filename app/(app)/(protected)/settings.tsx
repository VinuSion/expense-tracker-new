import { useState } from "react";
import {
	View,
	ScrollView,
	TouchableOpacity,
	TextInput,
	FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import * as FileSystem from "expo-file-system";
import * as SQLite from "expo-sqlite";
import Toast from "react-native-toast-message";

import { SafeAreaView } from "@/components/safe-area-view";
import { MaterialIcons } from "@expo/vector-icons";
import { Button } from "@/components/ui/button";
import { H2, H4, Muted, P } from "@/components/ui/typography";
import ConfirmModal from "@/components/ui/confirm-modal";

import { useDBStore } from "@/store/dbStore";
import { useFetchCategories } from "@/hooks/useFetchCategories";
import { useInsertCategory } from "@/hooks/useInsertCategory";

import { generateTimestampedFilename, getCategoryIcon } from "@/utils/helpers";
import { DEFAULT_DB_PATH } from "@/utils/constants";

import { colors } from "@/utils/colors";
import { useColorScheme } from "@/lib/useColorScheme";

export default function Settings() {
	const { colorScheme } = useColorScheme();
	const router = useRouter();
	const { dbPath, deleteDB } = useDBStore();

	const { categories, refreshCategories } = useFetchCategories();
	const { insertCategory } = useInsertCategory();

	const [dialogVisible, setDialogVisible] = useState<boolean>(false);
	const [newCategory, setNewCategory] = useState<string>("");

	const handleExportDB = async () => {
		try {
			// Resolve dbPath, falling back to a default path if null
			const resolvedDbPath = dbPath ?? DEFAULT_DB_PATH;

			// Check if database exists
			const fileInfo = await FileSystem.getInfoAsync(resolvedDbPath);
			if (!fileInfo.exists) {
				Toast.show({
					type: "error",
					text1: "Export Failed",
					text2: "No database found to export. Close the app and try again.",
				});
				return;
			}

			// Close any open DB connections
			const db = await SQLite.openDatabaseAsync(resolvedDbPath);
			await db.closeAsync();

			// Request permission to save the file
			const permissions =
				await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
			if (!permissions.granted) {
				Toast.show({
					type: "error",
					text1: "Permission Denied",
					text2: "Permission is required to save the database.",
				});
				return;
			}

			// Read database file as Base64
			const base64Data = await FileSystem.readAsStringAsync(resolvedDbPath, {
				encoding: FileSystem.EncodingType.Base64,
			});

			// Create a new file in the selected directory
			const destinationUri =
				await FileSystem.StorageAccessFramework.createFileAsync(
					permissions.directoryUri,
					generateTimestampedFilename("expense_tracker", "db"),
					"application/octet-stream",
				);

			// Write Base64 data to the new file
			await FileSystem.StorageAccessFramework.writeAsStringAsync(
				destinationUri,
				base64Data,
				{ encoding: FileSystem.EncodingType.Base64 },
			);

			Toast.show({
				type: "success",
				text1: "File Saved",
				text2: "Database exported successfully!",
			});
		} catch (error) {
			console.error("Error exporting database:", error);
			Toast.show({
				type: "error",
				text1: "Export Failed",
				text2:
					"An error occurred while exporting the database. Please try again.",
			});
		}
	};

	const confirmDelete = () => {
		setDialogVisible(false);
		deleteDB();
		console.log("Database Deleted");
		router.replace("../welcome");
	};

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
		<SafeAreaView className="flex-1 bg-background">
			<ScrollView
				contentContainerStyle={{
					flexGrow: 1,
					padding: 16,
				}}
				keyboardShouldPersistTaps="always"
			>
				<H2>Your Data</H2>
				<View className="w-full mb-8">
					<View className="bg-background border border-border rounded-lg">
						<TouchableOpacity
							activeOpacity={1}
							className="p-4 border-b border-border"
							onPress={handleExportDB}
						>
							<View className="flex-row items-center justify-between">
								<View className="flex-1 mr-2 gap-1">
									<H4>Export Database</H4>
									<Muted>
										Export your database to a file for backup. Choose somewhere
										safe to store it.
									</Muted>
								</View>
								<MaterialIcons
									name="save-alt"
									size={35}
									color={
										colorScheme === "dark"
											? colors.dark.foreground
											: colors.light.foreground
									}
								/>
							</View>
						</TouchableOpacity>

						<TouchableOpacity
							activeOpacity={1}
							className="p-4"
							onPress={() => setDialogVisible(true)}
						>
							<View className="flex-row items-center justify-between">
								<View className="flex-1 mr-2 gap-1">
									<H4 className="text-destructive">Delete Data</H4>
									<Muted>
										Deleting your data is permanent and cannot be undone. Please
										export your data first if you want to keep a backup.
									</Muted>
								</View>
								<MaterialIcons
									name="delete"
									size={35}
									color={
										colorScheme === "dark"
											? colors.dark.destructive
											: colors.light.destructive
									}
								/>
							</View>
						</TouchableOpacity>
					</View>
				</View>
        
				<H2>Add Categories</H2>
				<View className="w-full flex flex-col">
					<Muted className="mb-2">
						You can only create "Expense" categories right now because they're
						more common than "Income" categories. However, you can't delete or
						edit categories, so choose their names carefully!
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
				<ConfirmModal
					visible={dialogVisible}
					title="Delete My Data"
					description="This action cannot be undone. Are you sure you want to delete your data? Before you proceed, we recommend to export your data first."
					confirmButtonText="Delete"
					onClose={() => {
						setDialogVisible(false);
					}}
					onConfirm={confirmDelete}
				/>
			</ScrollView>
		</SafeAreaView>
	);
}
