import { ActivityIndicator } from "react-native";
import { SafeAreaView } from "@/components/safe-area-view";
import { H1 } from "@/components/ui/typography";

import { colors } from "@/utils/colors";
import { useColorScheme } from "@/lib/useColorScheme";

export default function LoadingScreen() {
	const { colorScheme } = useColorScheme();

	return (
		<SafeAreaView className="flex flex-1 items-center justify-center bg-background p-4 gap-y-4">
			<ActivityIndicator
				size="large"
				color={
					colorScheme === "dark"
						? colors.dark.foreground
						: colors.light.foreground
				}
			/>
			<H1 className="text-center">Loading...</H1>
		</SafeAreaView>
	);
}
