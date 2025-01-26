import React, {
	useRef,
	useCallback,
	forwardRef,
	useImperativeHandle,
} from "react";
import { View } from "react-native";
import BottomSheet, {
	BottomSheetBackdrop,
  BottomSheetBackdropProps,
	BottomSheetView,
} from "@gorhom/bottom-sheet";
import { MaterialIcons } from "@expo/vector-icons";

import { colors } from "@/utils/colors";
import { useColorScheme } from "@/lib/useColorScheme";

import { Button } from "@/components/ui/button";
import { H3, Muted } from "@/components/ui/typography";

interface CustomBottomSheetProps {
	title?: string;
	children?: React.ReactNode;
	initialSnapIndex?: number;
	snapPoints?: string[];
	onChange?: (index: number) => void;
	onClose?: () => void;
}

export interface CustomBottomSheetRef {
	open: (index?: number) => void;
	close: () => void;
}

const CustomBottomSheet = forwardRef<
	CustomBottomSheetRef,
	CustomBottomSheetProps
>(
	(
		{
			title = "Title",
			children,
			initialSnapIndex = -1,
			snapPoints = ["50%", "75%", "95%"],
			onChange,
			onClose,
		},
		ref,
	) => {
		const { colorScheme } = useColorScheme();
		const customBottomSheetRef = useRef<BottomSheet>(null);

		const handleSheetChanges = useCallback(
			(index: number) => {
				onChange?.(index);
			},
			[onChange],
		);

		useImperativeHandle(ref, () => ({
			open: (index = 0) => {
				customBottomSheetRef.current?.snapToIndex(index); // Open to the specified snap point
			},
			close: () => {
				customBottomSheetRef.current?.close(); // Close the bottom sheet
				onClose?.();
			},
		}));

		const renderBackdrop = useCallback(
			(props: BottomSheetBackdropProps) => (
				<BottomSheetBackdrop
					{...props}
					appearsOnIndex={0}
					disappearsOnIndex={-1}
					opacity={colorScheme === "dark" ? 0.5 : 0.3}
				/>
			),
			[],
		);

		return (
			<BottomSheet
				ref={customBottomSheetRef}
				index={initialSnapIndex}
				snapPoints={snapPoints}
				onChange={handleSheetChanges}
				enablePanDownToClose
				handleIndicatorStyle={{
					backgroundColor:
						colorScheme === "dark"
							? colors.dark.foreground
							: colors.light.foreground,
				}}
				backgroundStyle={{
					backgroundColor:
						colorScheme === "dark" ? colors.dark.card : colors.light.background,
				}}
        backdropComponent={renderBackdrop}
			>
				<BottomSheetView>
					<View className="flex-row justify-between items-center px-3 pb-2 border-b border-border">
						<H3>{title}</H3>
						<Button
							size="icon"
							variant="secondary"
							className="w-auto p-2"
							onPress={() => customBottomSheetRef.current?.close()}
						>
							<MaterialIcons
								name="close"
								size={20}
								color={
									colorScheme === "dark"
										? colors.dark.foreground
										: colors.light.foreground
								}
							/>
						</Button>
					</View>
					<View className="p-2 gap-2">
						{children || <Muted>Content goes here</Muted>}
					</View>
				</BottomSheetView>
			</BottomSheet>
		);
	},
);

export { CustomBottomSheet };
