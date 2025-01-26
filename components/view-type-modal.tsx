import React, { useState } from "react";
import { View, TouchableOpacity, Modal } from "react-native";
import { BlurView } from "expo-blur";
import { MaterialIcons } from "@expo/vector-icons";

import { H4, P } from "./ui/typography";
import { Button } from "./ui/button";

import { useDBStore } from "@/store/dbStore";
import { viewOptions } from "@/utils/constants";

import { colors } from "@/utils/colors";
import { useColorScheme } from "@/lib/useColorScheme";

interface ViewTypeModalProps {
	visible: boolean;
	onClose: () => void;
}

interface ButtonOption {
	value: string;
	title: string;
	icon: any;
}

interface ButtonSwitchProps {
	options: ButtonOption[];
	selectedOption: string;
	onSelect: (option: any) => void;
}

const ButtonSwitch: React.FC<ButtonSwitchProps> = ({
	options,
	selectedOption,
	onSelect,
}) => {
	const { colorScheme } = useColorScheme();

	return (
		<View className="flex flex-row justify-between gap-1 mb-4">
			{options.map((option) => (
				<TouchableOpacity
					key={option.value}
					className={`flex-1 p-2 rounded border ${
						selectedOption === option.value
							? "bg-primary border-primary"
							: "bg-secondary border-border"
					} items-center`}
					onPress={() => onSelect(option.value)}
				>
					<MaterialIcons
						name={option.icon}
						size={24}
						color={
							selectedOption === option.value
								? colorScheme === "dark"
									? colors.dark.background
									: colors.light.background
								: colorScheme === "dark"
									? colors.dark.foreground
									: colors.light.foreground
						}
					/>
					<P
						className={`${
							selectedOption === option.value
								? "text-background"
								: "text-foreground"
						} text-center mt-2`}
						style={{
							fontFamily:
								selectedOption === option.value
									? "Poppins-SemiBold"
									: "Poppins",
						}}
					>
						{option.title}
					</P>
				</TouchableOpacity>
			))}
		</View>
	);
};

export default function ViewTypeModal({
	visible,
	onClose,
}: ViewTypeModalProps) {
	const { colorScheme } = useColorScheme();

	const { viewType, setViewType } = useDBStore();
	const [selectedViewType, setSelectedViewType] = useState(viewType);

	const handleConfirm = () => {
		setViewType(selectedViewType);
		onClose();
	};

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
					<H4 className="mb-4">Change View Type</H4>
					<ButtonSwitch
						options={viewOptions}
						selectedOption={selectedViewType}
						onSelect={setSelectedViewType}
					/>
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
							variant="default"
							className="flex-1 flex-row gap-1"
							onPress={handleConfirm}
							text="Confirm"
						>
							<MaterialIcons
								name="check-circle"
								size={18}
								color={
									colorScheme === "dark"
										? colors.dark.background
										: colors.light.background
								}
							/>
						</Button>
					</View>
				</View>
			</BlurView>
		</Modal>
	);
}
