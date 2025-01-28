import { useState } from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import * as FileSystem from "expo-file-system";
import * as SQLite from "expo-sqlite";
import Toast from "react-native-toast-message";

import { SafeAreaView } from "@/components/safe-area-view";
import { MaterialIcons } from "@expo/vector-icons";

import AddCategoriesForm from "@/components/forms/add-categories-form";
import { H2, H4, Muted } from "@/components/ui/typography";
import ConfirmModal from "@/components/ui/confirm-modal";

import { useDBStore } from "@/store/dbStore";

import { generateTimestampedFilename } from "@/utils/helpers";
import { DEFAULT_DB_PATH } from "@/utils/constants";

import { colors } from "@/utils/colors";
import { useColorScheme } from "@/lib/useColorScheme";

export default function Settings() {
	const { colorScheme } = useColorScheme();

	const router = useRouter();
	const { totalTransactions, dbPath, deleteDB } = useDBStore();

	const [dialogVisible, setDialogVisible] = useState<boolean>(false);

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

	return (
		<SafeAreaView className="flex-1 bg-background">
			<ScrollView
				contentContainerStyle={{
					flexGrow: 1,
					padding: 16,
				}}
				keyboardShouldPersistTaps="always"
			>
				<View className="flex flex-row gap-1 items-center">
					<H2 style={{ fontFamily: "Poppins-Bold" }}>Your Data</H2>
					<Muted className="mb-2">
						{totalTransactions > 0
							? totalTransactions > 1
								? `(${totalTransactions} transactions)`
								: `(${totalTransactions} transaction)`
							: "(No transactions yet)"}
					</Muted>
				</View>
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

				<H2 style={{ fontFamily: "Poppins-Bold" }}>Add Categories</H2>
				<AddCategoriesForm />

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
