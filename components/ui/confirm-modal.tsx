import React from "react";
import { View, Modal } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { H4, Muted } from "./typography";
import { Button } from "./button";

import { useColorScheme } from "@/lib/useColorScheme";

interface ConfirmModalProps {
	visible: boolean;
	title: string;
	description: string;
	confirmButtonText: string;
	onClose: () => void;
	onConfirm: () => void;
}

export default function ConfirmModal({
	visible,
	title,
	description,
	confirmButtonText,
	onClose,
	onConfirm,
}: ConfirmModalProps) {
	const { colorScheme } = useColorScheme();

	return (
		<Modal
			transparent={true}
			animationType="fade"
			visible={visible}
			onRequestClose={onClose}
		>
			<BlurView
				className="flex-1 justify-center items-center"
				tint={
					colorScheme === "dark" ? "systemMaterialDark" : "systemMaterialLight"
				}
				intensity={30}
				experimentalBlurMethod="dimezisBlurView"
			>
				<View
					className="flex items-center p-6 bg-background rounded-md border border-border"
					style={{
						width: "85%",
						shadowColor: "#000",
						shadowOffset: { width: 0, height: 2 },
						shadowOpacity: 0.5,
						shadowRadius: 10,
						elevation: 10,
					}}
				>
					<H4 className="mb-4">{title}</H4>
					<Muted className="mb-6">{description}</Muted>
					<View className="flex flex-row gap-2">
						<Button
							size="default"
							variant="secondary"
							className="flex-1"
							onPress={onClose}
							text="Cancel"
						/>
						<Button
							size="default"
							variant="destructive"
							className="flex-1 flex-row gap-1"
							onPress={onConfirm}
							text={confirmButtonText}
              textSemiBold
						>
							<MaterialIcons
								name="delete"
								size={18}
								color="white"
							/>
						</Button>
					</View>
				</View>
			</BlurView>
		</Modal>
	);
}
