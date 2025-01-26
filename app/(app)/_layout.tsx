import { useState, useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";

import { useDBStore } from "@/store/dbStore";
import { useColorScheme } from "@/lib/useColorScheme";

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
	initialRouteName: "(root)",
};

export default function AppLayout() {
	const [fontsLoaded] = useFonts({
		"Poppins": require("@/assets/fonts/Poppins-Regular.ttf"),
		"Poppins-Light": require("@/assets/fonts/Poppins-Light.ttf"),
		"Poppins-Bold": require("@/assets/fonts/Poppins-Bold.ttf"),
    "Poppins-SemiBold": require("@/assets/fonts/Poppins-SemiBold.ttf"),
		"Poppins-ExtraBold": require("@/assets/fonts/Poppins-ExtraBold.ttf"),
		"Poppins-Italic": require("@/assets/fonts/Poppins-Italic.ttf"),
	});

	const [isReady, setIsReady] = useState(false);
	const { dbExists, updateDBState } = useDBStore();
	const router = useRouter(); // Navigation controller
	const segments = useSegments(); // Current route segments
	const { colorScheme } = useColorScheme();

	// Add route guard
	useEffect(() => {
		if (!isReady || !fontsLoaded) return;

		const inProtectedGroup =
			segments[0] === "(app)" && segments[1] === "(protected)";
		console.log("Route Check:", { inProtectedGroup, dbExists });

		if (!dbExists && inProtectedGroup) {
			router.replace("/welcome");
		}

		SplashScreen.hideAsync();
	}, [isReady, segments, dbExists, fontsLoaded]);

	// Initialize database state and determine initial route
	useEffect(() => {
		async function prepareApp() {
			try {
				await updateDBState();
				setIsReady(true);
				SplashScreen.hideAsync();
			} catch (error) {
				console.error("Error initializing database state:", error);
			}
		}
		prepareApp();
	}, []);

	// Show splash screen until we're ready
	if (!isReady && !fontsLoaded) {
		return null;
	}

	return (
		<>
			<StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
			{dbExists ? (
				<Stack screenOptions={{ headerShown: false, gestureEnabled: false }}>
					<Stack.Screen name="(protected)" options={{ headerShown: false }} />
				</Stack>
			) : (
				<Stack screenOptions={{ headerShown: false, gestureEnabled: false }}>
					<Stack.Screen name="welcome" />
					{/* <Stack.Screen
						name="import"
						options={{
							presentation: "modal",
							headerShown: true,
							headerTitle: "Import Database",
							headerStyle: {
								backgroundColor:
									colorScheme === "dark"
										? colors.dark.background
										: colors.light.background,
							},
							headerTintColor:
								colorScheme === "dark"
									? colors.dark.foreground
									: colors.light.foreground,
							gestureEnabled: true,
						}}
					/>
					<Stack.Screen
						name="create"
						options={{
							presentation: "modal",
							headerShown: true,
							headerTitle: "Create Database",
							headerStyle: {
								backgroundColor:
									colorScheme === "dark"
										? colors.dark.background
										: colors.light.background,
							},
							headerTintColor:
								colorScheme === "dark"
									? colors.dark.foreground
									: colors.light.foreground,
							gestureEnabled: true,
						}}
					/> */}
				</Stack>
			)}
		</>
	);
}
