import { Tabs } from "expo-router";
import { Entypo, MaterialIcons, Feather } from "@expo/vector-icons";
import { View, StyleSheet } from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";

const C = {
  accent: "#4D97FF",
  inactive: "#7B8CA8",

  tabBar: "#F6F8FC",
  border: "#E4ECF8",

  pillBg: "rgba(77,151,255,0.12)",
  pillBorder: "rgba(77,151,255,0.35)",
};

function TabIcon({ children, focused }: { children: React.ReactNode; focused: boolean }) {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded) return null;
  if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />;
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
    width: 47,
    height: 30,
    borderRadius: 15,
  },
  iconWrapActive: {
    backgroundColor: C.pillBg,
    borderWidth: 1,
    borderColor: C.pillBorder,
  },
});

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: C.accent,
        tabBarInactiveTintColor: C.inactive,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: C.tabBar,
          borderTopColor: C.border,
          borderTopWidth: 1,
          height: 57,
          paddingTop: 0,
          paddingBottom: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused}>
              <Entypo name="home" size={23} color={color} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="subscriptions"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused}>
              <MaterialIcons name="subscriptions" size={24} color={color} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused}>
              <MaterialIcons name="insights" size={24} color={color} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused}>
              <Feather name="settings" size={24} color={color} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="subscriptions/[id]"
        options={{
          href: null,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused}>
              <MaterialIcons name="subscriptions" size={20} color={color} />
            </TabIcon>
          ),
        }}
      />
    </Tabs>
  );
}