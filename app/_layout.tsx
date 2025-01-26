import "../global.css";

import { Slot } from "expo-router";
import Toast from 'react-native-toast-message';
import toastConfig from "@/lib/toastConfig";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function AppLayout() {
	return (
		<GestureHandlerRootView>
			<Slot />
      <Toast config={toastConfig} />
		</GestureHandlerRootView>
	);
}
