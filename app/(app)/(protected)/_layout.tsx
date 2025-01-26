import { Suspense } from "react";
import { Tabs } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { Ionicons } from "@expo/vector-icons";
import { DB_NAME } from "@/utils/constants";
import LoadingScreen from "@/components/ui/loading-screen";

import { colors } from "@/utils/colors";
import { useColorScheme } from "@/lib/useColorScheme";

export default function ProtectedLayout() {
	const { colorScheme } = useColorScheme();

	return (
		<Suspense fallback={<LoadingScreen />}>
			<SQLiteProvider databaseName={DB_NAME} useSuspense>
				<Tabs
					screenOptions={{
						headerShown: false,
						tabBarStyle: {
							backgroundColor:
								colorScheme === "dark"
									? colors.dark.background
									: colors.light.background,
						},
						tabBarActiveTintColor:
							colorScheme === "dark"
								? colors.dark.foreground
								: colors.light.foreground,
					}}
				>
					<Tabs.Screen
						name="index"
						options={{
							title: "Home",
							tabBarIcon: ({ focused, color }) => (
								<Ionicons
									name={focused ? "home-sharp" : "home-outline"}
									color={color}
									size={24}
								/>
							),
						}}
					/>
					<Tabs.Screen
						name="settings"
						options={{
							title: "Settings",
							tabBarIcon: ({ focused, color }) => (
								<Ionicons
									name={focused ? "settings-sharp" : "settings-outline"}
									color={color}
									size={24}
								/>
							),
						}}
					/>
				</Tabs>
			</SQLiteProvider>
		</Suspense>
	);
}
