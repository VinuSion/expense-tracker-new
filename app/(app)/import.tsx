import { View, Alert } from "react-native";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as SQLite from "expo-sqlite";
import { useDBStore } from "@/store/dbStore";
import { DEFAULT_DB_PATH } from "@/utils/constants";

import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";

export default function ImportScreen() {
	const router = useRouter();
	const { setDBExists } = useDBStore();

	async function handleImportDatabase() {
		try {
			// Request permission to read files
			const permissions =
				await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
			if (!permissions.granted) {
				Alert.alert("Permission Denied", "Permission required to read files.");
				return;
			}

			// Pick document
			const result = await DocumentPicker.getDocumentAsync({
				type: "application/octet-stream", // SQLite files
				copyToCacheDirectory: false,
			});

			if (result.canceled) {
				return;
			}

			const { uri, name } = result.assets[0];

			// Verify file extension
			if (!name.endsWith(".db")) {
				Alert.alert(
					"Invalid File",
					"Please select a valid SQLite database file.",
				);
				return;
			}

			// Read file content
			const fileInfo = await FileSystem.getInfoAsync(uri);
			if (!fileInfo.exists) {
				Alert.alert("File Not Found", "The selected file does not exist.");
				return;
			}

			// Copy file to app's document directory
			await FileSystem.copyAsync({
				from: uri,
				to: DEFAULT_DB_PATH,
			});

			// Verify database by opening it
			const db = await SQLite.openDatabaseAsync(DEFAULT_DB_PATH);
			await db.closeAsync();

			// Update state
			setDBExists(true);

			console.log("Database imported:", DEFAULT_DB_PATH);
			Alert.alert("Success", "Database imported successfully!");
			router.replace("./(protected)"); // Navigate to the main app
		} catch (error) {
			console.error("Error importing database:", error);
			Alert.alert("Import Failed", "Failed to import database.");
		}
	}

	return (
		<SafeAreaView className="flex-1 bg-background p-4" edges={["bottom"]}>
			<View className="flex-1 gap-4 web:m-4">
				<H1 className="self-start ">Import Existing Database</H1>
				<Muted className="text-center">
					Select a SQLite database file from your device to import.
				</Muted>
			</View>
			<Button
				size="default"
				variant="default"
				onPress={handleImportDatabase}
				className="web:m-4"
			>
				<Text>Import Database</Text>
			</Button>
		</SafeAreaView>
	);
}
