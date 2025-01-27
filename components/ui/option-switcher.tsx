import React from "react";
import { View, TouchableOpacity } from "react-native";
import { P } from "./typography";

interface OptionSwitcherProps<T> {
  className?: string;
	option1: T;
	option2: T;
	option1Text: string;
	option2Text: string;
	selectedOption: T;
	onSelectOption: (option: T) => void;
}

const OptionSwitcher = <T extends unknown>({
  className,
	option1,
	option2,
	option1Text,
	option2Text,
	selectedOption,
	onSelectOption,
}: OptionSwitcherProps<T>) => {
	return (
		<View className={`flex-row gap-2 p-1 bg-background rounded-md border-border border ${className}`}>
			<TouchableOpacity
				className={`flex-1 p-3 rounded-md ${
					selectedOption === option1 ? "bg-primary" : "bg-background"
				}`}
				onPress={() => onSelectOption(option1)}
			>
				<P
					className={`${
						selectedOption === option1 ? "text-background" : "text-foreground"
					} text-center`}
					style={{
						fontFamily:
							selectedOption === option1 ? "Poppins-SemiBold" : "Poppins",
					}}
				>
					{option1Text}
				</P>
			</TouchableOpacity>
			<TouchableOpacity
				className={`flex-1 p-3 rounded-md ${
					selectedOption === option2 ? "bg-primary" : "bg-background"
				}`}
				onPress={() => onSelectOption(option2)}
			>
				<P
					className={`${
						selectedOption === option2 ? "text-background" : "text-foreground"
					} text-center`}
					style={{
						fontFamily:
							selectedOption === option2 ? "Poppins-SemiBold" : "Poppins",
					}}
				>
					{option2Text}
				</P>
			</TouchableOpacity>
		</View>
	);
};

export default OptionSwitcher;
