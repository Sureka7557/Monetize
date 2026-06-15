import { Tabs } from "expo-router";
import { Entypo, MaterialIcons, Feather } from "@expo/vector-icons";
import { View, StyleSheet } from "react-native";

const C = {
  accent: "#CF7D65",                   // terracotta pink — active tab
  inactive: "#ABA66F",                 // warm sage — inactive
  tabBar: "#F2DEC7",                   // cream background
  border: "#E1B8A2",                   // rose border
  pillBg: "rgba(207,125,101,0.12)",    // soft terracotta pill
  pillBorder: "rgba(207,125,101,0.35)",
};

function TabIcon({ children, focused }: { children: React.ReactNode; focused: boolean }) {
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