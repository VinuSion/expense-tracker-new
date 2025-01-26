import React from "react";
import { View } from "react-native";
import { H4, Muted } from "@/components/ui/typography";
import { BaseToastProps } from "react-native-toast-message";

import { colors } from "@/utils/colors";
import { useColorScheme } from "@/lib/useColorScheme";

interface CustomToastProps extends BaseToastProps {
	text1?: string;
	text2?: string;
}

const toastConfig = {
	error: ({ text1, text2 }: CustomToastProps) => {
		const { colorScheme } = useColorScheme();

		return (
			<View
				style={{
					flexDirection: "row",
					alignItems: "center",
					justifyContent: "space-between",
					width: "95%",
					paddingHorizontal: 16,
					backgroundColor:
						colorScheme === "dark"
							? colors.dark.secondary
							: colors.light.secondary,
					borderLeftWidth: 5,
					borderLeftColor: "#DC3545",
					borderRadius: 8,
					paddingVertical: 12,
					shadowColor: "#000",
					shadowOffset: { width: 2, height: 4 },
					shadowOpacity: 0.5,
					shadowRadius: 6,
					elevation: 8,
				}}
			>
				<View style={{ flexDirection: "column", flex: 1 }}>
					<H4>{text1}</H4>
					{text2 && <Muted>{text2}</Muted>}
				</View>
			</View>
		);
	},
	success: ({ text1, text2 }: CustomToastProps) => {
		const { colorScheme } = useColorScheme();

		return (
			<View
				style={{
					flexDirection: "row",
					alignItems: "center",
					justifyContent: "space-between",
					width: "95%",
					paddingHorizontal: 16,
					backgroundColor:
						colorScheme === "dark"
							? colors.dark.secondary
							: colors.light.secondary,
					borderLeftWidth: 5,
					borderLeftColor: "#38D175",
					borderRadius: 8,
					paddingVertical: 12,
					shadowColor: "#000",
					shadowOffset: { width: 2, height: 4 },
					shadowOpacity: 0.5,
					shadowRadius: 6,
					elevation: 8,
				}}
			>
				<View style={{ flexDirection: "column", flex: 1 }}>
					<H4>{text1}</H4>
					{text2 && <Muted>{text2}</Muted>}
				</View>
			</View>
		);
	},
	info: ({ text1, text2 }: CustomToastProps) => {
		const { colorScheme } = useColorScheme();

		return (
			<View
				style={{
					flexDirection: "row",
					alignItems: "center",
					justifyContent: "space-between",
					width: "95%",
					paddingHorizontal: 16,
					backgroundColor:
						colorScheme === "dark"
							? colors.dark.secondary
							: colors.light.secondary,
					borderLeftWidth: 5,
					borderLeftColor: "#208FD9",
					borderRadius: 8,
					paddingVertical: 12,
					shadowColor: "#000",
					shadowOffset: { width: 2, height: 4 },
					shadowOpacity: 0.5,
					shadowRadius: 6,
					elevation: 8,
				}}
			>
				<View style={{ flexDirection: "column", flex: 1 }}>
					<H4>{text1}</H4>
					{text2 && <Muted>{text2}</Muted>}
				</View>
			</View>
		);
	},
};

export default toastConfig;
