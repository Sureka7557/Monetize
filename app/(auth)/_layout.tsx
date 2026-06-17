import { Redirect, Stack } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";

export default function AuthLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  // Wait for Clerk to load before making routing decisions
  if (!isLoaded) return null;

  // If already signed in, kick them to the main app
  if (isSignedIn) return <Redirect href="/(tabs)" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}