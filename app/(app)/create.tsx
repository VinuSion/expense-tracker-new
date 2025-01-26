import { View, Alert } from "react-native";
import { useRouter } from "expo-router";
import * as SQLite from "expo-sqlite";
import { useDBStore } from "@/store/dbStore";
import { DEFAULT_DB_PATH } from "@/utils/constants";
import { schemaStatements } from "@/utils/constants";

import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";

// const formSchema = z
// 	.object({
// 		email: z.string().email("Please enter a valid email address."),
// 		password: z
// 			.string()
// 			.min(8, "Please enter at least 8 characters.")
// 			.max(64, "Please enter fewer than 64 characters.")
// 			.regex(
// 				/^(?=.*[a-z])/,
// 				"Your password must have at least one lowercase letter.",
// 			)
// 			.regex(
// 				/^(?=.*[A-Z])/,
// 				"Your password must have at least one uppercase letter.",
// 			)
// 			.regex(/^(?=.*[0-9])/, "Your password must have at least one number.")
// 			.regex(
// 				/^(?=.*[!@#$%^&*])/,
// 				"Your password must have at least one special character.",
// 			),
// 		confirmPassword: z.string().min(8, "Please enter at least 8 characters."),
// 	})
// 	.refine((data) => data.password === data.confirmPassword, {
// 		message: "Your passwords do not match.",
// 		path: ["confirmPassword"],
// 	});

export default function CreateScreen() {
	const router = useRouter();
	const { dbPath, setDBExists } = useDBStore();

	async function handleCreateDatabase() {
		// Ensure dbPath has a value, falling back to a default path if null
		const resolvedDbPath = dbPath ?? DEFAULT_DB_PATH;

		let db: SQLite.SQLiteDatabase | null = null;
		try {
			db = await SQLite.openDatabaseAsync(resolvedDbPath);

			// Execute schema statements
			for (const statement of schemaStatements) {
				await db.execAsync(statement);
			}

			// Close connection before proceeding
			await db.closeAsync();

			console.log("Database created at:", resolvedDbPath);
			Alert.alert("Success", "Database created successfully!");

			setDBExists(true);
			router.replace("./(protected)");
		} catch (error) {
			console.error("Error creating database:", error);
		} finally {
			// Ensure connection is closed even if error occurs
			if (db) {
				await db.closeAsync();
			}
		}
	}

	// const form = useForm<z.infer<typeof formSchema>>({
	// 	resolver: zodResolver(formSchema),
	// 	defaultValues: {
	// 		email: "",
	// 		password: "",
	// 		confirmPassword: "",
	// 	},
	// });

	// async function onSubmit(data: z.infer<typeof formSchema>) {
	// 	try {
	// 		await signUp(data.email, data.password);

	// 		form.reset();
	// 	} catch (error: Error | any) {
	// 		console.log(error.message);
	// 	}
	// }

	return (
		<SafeAreaView className="flex-1 bg-background p-4" edges={["bottom"]}>
			<View className="flex-1 gap-4 web:m-4">
				<H1 className="self-start">Create New Database</H1>
				<Muted className="text-center">
					This will create a new database file on your device.
				</Muted>

				{/* <Form {...form}>
					<View className="gap-4">
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormInput
									label="Email"
									placeholder="Email"
									autoCapitalize="none"
									autoComplete="email"
									autoCorrect={false}
									keyboardType="email-address"
									{...field}
								/>
							)}
						/>
						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormInput
									label="Password"
									placeholder="Password"
									autoCapitalize="none"
									autoCorrect={false}
									secureTextEntry
									{...field}
								/>
							)}
						/>
						<FormField
							control={form.control}
							name="confirmPassword"
							render={({ field }) => (
								<FormInput
									label="Confirm Password"
									placeholder="Confirm password"
									autoCapitalize="none"
									autoCorrect={false}
									secureTextEntry
									{...field}
								/>
							)}
						/>
					</View>
				</Form> */}
			</View>
			<Button
				size="default"
				variant="default"
				onPress={handleCreateDatabase}
				className="web:m-4"
			>
				<Text>Create Database</Text>
			</Button>
		</SafeAreaView>
	);
}
