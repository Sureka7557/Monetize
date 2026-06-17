import {
  View, Text, TouchableOpacity, StyleSheet, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { FONTS } from "../constants/fonts";
import { Feather } from "@expo/vector-icons";

const C = {
  bg: "#F2DEC7", card: "#FFFFFF", border: "#E1B8A2",
  accent: "#CF7D65", muted: "#ABA66F", textDark: "#4A3728",
  danger: "#C0392B",
};

function SettingsRow({
  icon, label, onPress, danger = false,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <View style={styles.rowLeft}>
        <Feather name={icon} size={20} color={danger ? C.danger : C.textDark} />
        <Text style={[styles.rowLabel, danger && { color: C.danger }]}>{label}</Text>
      </View>
      <Feather name="chevron-right" size={18} color={C.muted} />
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/(auth)/sign-in");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.container}>
        <Text style={styles.heading}>Settings</Text>

        {/* Profile Card */}
        <View style={styles.card}>
          <Text style={styles.name}>{user?.fullName ?? "User"}</Text>
          <Text style={styles.email}>
            {user?.primaryEmailAddress?.emailAddress}
          </Text>
        </View>

        {/* Rows */}
        <View style={styles.section}>
          <SettingsRow icon="user" label="Edit Profile" onPress={() => {}} />
          <SettingsRow icon="bell" label="Notifications" onPress={() => {}} />
          <SettingsRow icon="lock" label="Change Password" onPress={() => {}} />
          <SettingsRow icon="help-circle" label="Help & Support" onPress={() => {}} />
        </View>

        <View style={styles.section}>
          <SettingsRow icon="log-out" label="Sign Out" onPress={handleSignOut} danger />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  heading: { fontFamily: FONTS.bold, fontSize: 24, color: C.textDark, marginBottom: 20 },
  card: {
    backgroundColor: C.card, borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: C.border, marginBottom: 24,
  },
  name: { fontFamily: FONTS.semibold, fontSize: 18, color: C.textDark, marginBottom: 4 },
  email: { fontFamily: FONTS.regular, fontSize: 14, color: C.muted },
  section: {
    backgroundColor: C.card, borderRadius: 16,
    borderWidth: 1, borderColor: C.border, marginBottom: 16, overflow: "hidden",
  },
  row: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  rowLabel: { fontFamily: FONTS.medium, fontSize: 15, color: C.textDark },
});