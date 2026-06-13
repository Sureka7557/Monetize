import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import Foundation from '@expo/vector-icons/Foundation';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-[#071A1A] px-6">
      <Text className="mb-2 text-4xl font-bold text-[#1DE9B6]">
        Monetize
      </Text>

      <Text className="mb-10 text-center text-[#B8D8D8]">
        Manage all your subscriptions in one place
      </Text>

      <Pressable
        onPress={() => router.push("/onboarding")}
        className="mb-4 w-56 rounded-xl bg-[#00C896] py-4"
      >
        <Text className="text-center text-lg font-semibold text-[#071A1A]">
          Get Started
        </Text>
      </Pressable>

      <Pressable
        onPress={() => router.push("/(auth)/sign-in")}
        className="mb-4 w-56 rounded-xl border border-[#00C896] py-4"
      >
        <Text className="text-center text-lg font-semibold text-[#00C896]">
          Sign In
        </Text>
      </Pressable>

      <Pressable
        onPress={() => router.push("/(auth)/sign-up")}
        className="mb-8 w-56 rounded-xl bg-[#123D3D] py-4"
      >
        <Text className="text-center text-lg font-semibold text-white">
          Create Account
        </Text>
      </Pressable>

      <View className="w-full max-w-sm rounded-2xl bg-[#0F2A2A] p-5">
        <Text className="mb-4 text-lg font-bold text-[#1DE9B6]">
          Quick Access
        </Text>

      <Pressable
        onPress={() => router.push("/subscription-details/spotify")}
        className="mb-3 flex-row items-center rounded-2xl bg-[#123D3D] p-4"
      >
        <View className="mr-4 rounded-full bg-[#00C896] p-3">
          <Foundation name="music" size={22} color="#071A1A" />
        </View>

        <View>
          <Text className="text-lg font-semibold text-white">
            Spotify
          </Text>
          <Text className="text-sm text-[#B8D8D8]">
            Music Subscription
          </Text>
        </View>
      </Pressable>

      <Pressable
        onPress={() => router.push("/subscription-details/claude-max")}
        className="flex-row items-center rounded-2xl bg-[#123D3D] p-4"
      >
        <View className="mr-4 rounded-full bg-[#1DE9B6] p-3">
          <FontAwesome6 name="robot" size={20} color="#071A1A" />
        </View>

        <View>
          <Text className="text-lg font-semibold text-white">
            Claude Max
          </Text>
          <Text className="text-sm text-[#B8D8D8]">
            AI Subscription
          </Text>
        </View>
      </Pressable>
      </View>
    </View>
  );
}