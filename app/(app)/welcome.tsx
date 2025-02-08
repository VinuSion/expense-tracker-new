import { useRouter } from "expo-router";
import { View } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as SQLite from "expo-sqlite";
import Toast from "react-native-toast-message";

import { useDBStore } from "@/store/dbStore";
import { restartApp } from "@/utils/helpers";
import {
	databaseDefinition,
	insertStatements,
	DEFAULT_DB_PATH,
	LATEST_SCHEMA_VERSION,
} from "@/utils/constants";

import { Image } from "@/components/image";
import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { H1, P, Muted } from "@/components/ui/typography";

export default function WelcomeScreen() {
	const router = useRouter();
	const { dbPath, setDBExists } = useDBStore();

	async function handleImportDatabase() {
		try {
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
				Toast.show({
					type: "error",
					text1: "Invalid File",
					text2: "Please select a valid SQLite database file and try again.",
				});
				return;
			}

			// Read file content
			const fileInfo = await FileSystem.getInfoAsync(uri);
			if (!fileInfo.exists) {
				Toast.show({
					type: "error",
					text1: "File Not Found",
					text2: "The selected file does not exist. Please try again.",
				});
				return;
			}

			// Copy file to app's document directory
			await FileSystem.copyAsync({
				from: uri,
				to: DEFAULT_DB_PATH,
			});

			// Verify database by opening it and handle migrations
			const db = await SQLite.openDatabaseAsync(DEFAULT_DB_PATH);

			try {
				let currentVersion = null;

				// Step 1: Check if schema_version table exists
				const schemaVersionResult = await db.getAllAsync(
					"SELECT name FROM sqlite_master WHERE type='table' AND name='schema_version'",
				);

				console.log(
					"Select Schema Version Table Result: ",
					schemaVersionResult,
				);

        // Step 2: Start Migration logic process
				if (schemaVersionResult.length === 0) {
					// The schema_version table does not exist, create it with the latest schema definition
					for (const schemaStatement of databaseDefinition) {
						await db.execAsync(schemaStatement);
					}
					const insertSchemaVersionResult = await db.runAsync(
						`INSERT INTO schema_version (version_number) VALUES (?)`,
						[LATEST_SCHEMA_VERSION],
					);
					console.log(
						"Migrate LEGACY DB to new Schema Result: ",
						insertSchemaVersionResult,
					);
				} else {
					// The schema_version table exists, get the current version
					const getVersionResult = await db.getAllAsync<{
						version_number: number;
					}>("SELECT version_number FROM schema_version");
					currentVersion = getVersionResult[0]?.version_number;

          console.warn("USER'S SCHEMA VERSION: ", currentVersion)
          console.warn("CURRENT SCHEMA VERSION: ", LATEST_SCHEMA_VERSION)

					if (Number(currentVersion) !== Number(LATEST_SCHEMA_VERSION)) {
						console.log("Applying schema migrations...");

						// Ensure foreign keys are enabled
						await db.execAsync("PRAGMA foreign_keys = ON");

            // Apply migrations to update the schema to the latest version
						for (const schemaStatement of databaseDefinition) {
							await db.execAsync(schemaStatement);
						}

						// Update schema version to latest
						const updateSchemaVersionResult = await db.runAsync(
							`UPDATE schema_version SET version_number = ? WHERE version_number = ?`,
							[LATEST_SCHEMA_VERSION, currentVersion],
						);
						console.log(
							"Update Migration Schema Version Result: ",
							updateSchemaVersionResult,
						);
					} else {
            console.log("Schema is already up-to-date.");
          }
				}

				// Close the database after migrations
				await db.closeAsync();
			} catch (error) {
				console.error("Error during database migration: ", error);
				Toast.show({
					type: "error",
					text1: "Database Migration Failed",
					text2:
						"Failed to apply database schema changes. Please try again later.",
				});
			}

			// Update state
			setDBExists(true);

			console.log("Database imported:", DEFAULT_DB_PATH);
			Toast.show({
				type: "success",
				text1: "Welcome Back!",
				text2: "Database imported successfully!",
			});
			router.replace("./(protected)"); // Navigate to the main app
			await restartApp();
		} catch (error) {
			console.error("Error importing database:", error);
			Toast.show({
				type: "error",
				text1: "Import Failed",
				text2: "Failed to import database. Please try again.",
			});
		}
	}

	async function handleCreateDatabase() {
		// Ensure dbPath has a value, falling back to a default path if null
		const resolvedDbPath = dbPath ?? DEFAULT_DB_PATH;

		let db: SQLite.SQLiteDatabase | null = null;
		try {
			db = await SQLite.openDatabaseAsync(resolvedDbPath);

			// Execute schema statements
			for (const schemaStatement of databaseDefinition) {
				await db.execAsync(schemaStatement);
			}

			// Execute insert statements
			for (const insert of insertStatements) {
				await db.execAsync(insert);
			}

			// Close connection before proceeding
			await db.closeAsync();

			console.log("Database created at:", resolvedDbPath);
			Toast.show({
				type: "success",
				text1: "Welcome Aboard!",
				text2: "Database created successfully!",
			});

			setDBExists(true);
			router.replace("./(protected)");
			await restartApp();
		} catch (error) {
			console.error("Error creating database:", error);
		} finally {
			// Ensure connection is closed even if error occurs
			if (db) {
				await db.closeAsync();
			}
		}
	}

	return (
		<SafeAreaView className="flex flex-1 bg-background p-4">
			<View className="flex flex-1 items-center justify-center gap-y-4 web:m-4">
				<Image
					source={require("@/assets/images/icon.png")}
					className="w-16 h-16 rounded-xl"
				/>
				<H1 className="text-center">Welcome to your Expense Tracker</H1>
				<Muted className="text-center">
					Let's get started by setting up your database.
				</Muted>
			</View>
			<View className="flex flex-col gap-y-4 web:m-4">
				<Button size="default" variant="default" onPress={handleImportDatabase}>
					<P
						className="text-background"
						style={{ fontFamily: "Poppins-SemiBold" }}
					>
						Import Database
					</P>
				</Button>
				<Button
					size="default"
					variant="secondary"
					onPress={handleCreateDatabase}
				>
					<P>Create New Database</P>
				</Button>
			</View>
		</SafeAreaView>
	);
}
