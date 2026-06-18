import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { FONTS } from "@/app/constants/fonts";
import { formatCurrency } from "@/lib/utils";
import { ALL_SUBSCRIPTIONS } from "@/app/constants/data";
import { Feather } from "@expo/vector-icons";

const COLORS = {
  background: "#F6F8FC",
  card: "#FFFFFF",
  cardBorder: "#E4ECF8",

  accent: "#4D97FF",
  accentGreen: "#31C48D",

  muted: "#7B8CA8",
  textDark: "#23395D",

  white: "#FFFFFF",

  softBlue: "#5AA7FF",

  dark: "#1A2B4B",
};

const CARD_COLORS = [
  "#EAF3FF",
  "#DCEBFF",
  "#E8F7F1",
  "#F0F5FF",
  "#D6E9FF",
  "#E4F4FF",
];

export default function Subscriptions() {
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = ALL_SUBSCRIPTIONS.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
      >
        {/* Title */}
        <Text
          style={{
            fontFamily: FONTS.bold,
            fontSize: 30,
            color: COLORS.textDark,
            marginTop: 12,
            marginBottom: 16,
          }}
        >
          Subscriptions
        </Text>

        {/* Search Bar */}
        <View
          style={{
            backgroundColor: COLORS.card,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: COLORS.cardBorder,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 14,
            paddingVertical: 10,
            marginBottom: 20,
          }}
        >
          <Feather name="search" size={20} color={COLORS.muted} style={{ marginRight: 8 }} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search subscriptions..."
            placeholderTextColor={COLORS.muted}
            style={{
              flex: 1,
              fontFamily: FONTS.regular,
              fontSize: 15,
              color: COLORS.textDark,
            }}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <Feather name="x" size={20} color={COLORS.muted} />
            </Pressable>
          )}
        </View>

        {/* Subscription Cards */}
        {filtered.map((sub, index) => {
          const cardColor = CARD_COLORS[index % CARD_COLORS.length];
          const isExpanded = expandedId === sub.id;
          const plan = sub.category ?? "Subscription";
          const last4 = "8530";

          return (
            <Pressable
              key={sub.id}
              onPress={() => setExpandedId(isExpanded ? null : sub.id)}
              style={{
                backgroundColor: cardColor,
                borderRadius: 20,
                marginBottom: 12,
                overflow: "hidden",
              }}
            >
              {/* Main Row */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 18,
                  paddingVertical: 18,
                }}
              >
                <View
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 14,
                    backgroundColor: "rgba(255,255,255,0.55)",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 14,
                  }}
                >
                  <Image
                    source={sub.icon}
                    style={{ width: 34, height: 34 }}
                    resizeMode="contain"
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: FONTS.bold, fontSize: 16, color: COLORS.textDark }}>
                    {sub.name}
                  </Text>
                  <Text
                    style={{
                      fontFamily: FONTS.regular,
                      fontSize: 13,
                      color: COLORS.textDark,
                      opacity: 0.65,
                      marginTop: 2,
                    }}
                  >
                    {plan}
                  </Text>
                </View>

                <View style={{ alignItems: "flex-end" }}>
                  <Text style={{ fontFamily: FONTS.bold, fontSize: 16, color: COLORS.textDark }}>
                    {formatCurrency(sub.price)}
                  </Text>
                  <Text
                    style={{
                      fontFamily: FONTS.regular,
                      fontSize: 12,
                      color: COLORS.textDark,
                      opacity: 0.65,
                      marginTop: 2,
                    }}
                  >
                    Monthly
                  </Text>
                </View>
              </View>

              {/* Expanded Panel */}
              {isExpanded && (
                <View
                  style={{
                    borderTopWidth: 1,
                    borderTopColor: "rgba(0,0,0,0.08)",
                    paddingHorizontal: 18,
                    paddingTop: 14,
                    paddingBottom: 18,
                    backgroundColor: "rgba(255,255,255,0.35)",
                  }}
                >
                  {/* Payment info */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 10,
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <Feather name="credit-card" size={15} color={COLORS.textDark} />
                      <Text style={{ fontFamily: FONTS.regular, fontSize: 13, color: COLORS.textDark }}>
                        Payment info:{" "}
                        <Text style={{ fontFamily: FONTS.semibold }}>•••••{last4}</Text>
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={{
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: "rgba(0,0,0,0.15)",
                        paddingHorizontal: 16,
                        paddingVertical: 6,
                        backgroundColor: "rgba(255,255,255,0.6)",
                      }}
                    >
                      <Text style={{ fontFamily: FONTS.medium, fontSize: 13, color: COLORS.textDark }}>
                        Manage
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Plan details */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 14,
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <Feather name="package" size={15} color={COLORS.textDark} />
                      <Text style={{ fontFamily: FONTS.regular, fontSize: 13, color: COLORS.textDark }}>
                        Plan details:{" "}
                        <Text style={{ fontFamily: FONTS.semibold }}>{plan}</Text>
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={{
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: "rgba(0,0,0,0.15)",
                        paddingHorizontal: 16,
                        paddingVertical: 6,
                        backgroundColor: "rgba(255,255,255,0.6)",
                      }}
                    >
                      <Text style={{ fontFamily: FONTS.medium, fontSize: 13, color: COLORS.textDark }}>
                        Change
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Cancel button */}
                  <TouchableOpacity
                    style={{
                      backgroundColor: COLORS.dark,
                      borderRadius: 16,
                      paddingVertical: 14,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    <Feather name="x-circle" size={16} color={COLORS.white} />
                    <Text style={{ fontFamily: FONTS.semibold, fontSize: 15, color: COLORS.white }}>
                      Cancel Subscription
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}