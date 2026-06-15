import { Stack } from "expo-router";
import "../global.css"
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import { Text } from "react-native";
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return <Text>Loading...</Text>;
  }
   
  return (
  <SafeAreaProvider>
    <Stack screenOptions={{ headerShown: false }} />
  </SafeAreaProvider>
); ;
}
