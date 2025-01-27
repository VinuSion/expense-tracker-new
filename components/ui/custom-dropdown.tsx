import React, { useState, useRef } from "react";
import {
	View,
	TouchableOpacity,
	Modal,
	FlatList,
	Dimensions,
	LayoutChangeEvent,
} from "react-native";
import { P } from "./typography";
import { MaterialIcons } from "@expo/vector-icons";
import { useColorScheme } from "@/lib/useColorScheme";
import { colors } from "@/utils/colors";

interface CustomDropdownProps {
	className?: string;
	options: { label: string; value: string }[];
	selectedValue: string;
	onValueChange: (value: any) => void;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
	className,
	options,
	selectedValue,
	onValueChange,
}) => {
	const { colorScheme } = useColorScheme();

	const [modalVisible, setModalVisible] = useState(false);
	const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
	const inputRef = useRef<View>(null);

	const handleSelect = (value: string) => {
		onValueChange(value);
		setModalVisible(false);
	};

	const handleOpen = () => {
		if (inputRef.current) {
			inputRef.current.measure((fx, fy, width, height, px, py) => {
				const screenHeight = Dimensions.get("window").height;
				const dropdownHeight = 30;
				const isDropdownBelow = py + height + dropdownHeight <= screenHeight;

				setDropdownPosition({
					top: isDropdownBelow ? py + height - dropdownHeight : py - dropdownHeight,
					left: px,
          width: width,
				});
				setModalVisible(true);
			});
		}
	};

	return (
		<View className={className}>
			<View ref={inputRef}>
				<TouchableOpacity
					className="flex-row justify-between items-center p-2 px-4 border border-border bg-background rounded-md h-14"
					onPress={handleOpen}
				>
					<P style={{ fontFamily: "Poppins-SemiBold" }}>
						{options.find((option) => option.value === selectedValue)?.label ||
							"Select an Option"}
					</P>
					<MaterialIcons
						name="arrow-drop-down"
						size={24}
						color={
							colorScheme === "dark"
								? colors.dark.foreground
								: colors.light.foreground
						}
					/>
				</TouchableOpacity>
			</View>

			<Modal visible={modalVisible} transparent={true} animationType="fade">
				<TouchableOpacity
					className="flex-1"
					onPress={() => setModalVisible(false)}
				>
					<View
						className="absolute max-h-1/2 rounded-md p-2 bg-background border border-border"
						style={{
							top: dropdownPosition.top,
							left: dropdownPosition.left,
              width: dropdownPosition.width,
						}}
					>
						<FlatList
							data={options}
							keyExtractor={(item) => item.value}
							renderItem={({ item }) => (
								<TouchableOpacity
									className="p-2"
									onPress={() => handleSelect(item.value)}
								>
									<P>{item.label}</P>
								</TouchableOpacity>
							)}
						/>
					</View>
				</TouchableOpacity>
			</Modal>
		</View>
	);
};

export default CustomDropdown;
