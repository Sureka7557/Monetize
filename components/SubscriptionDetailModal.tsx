import React from "react";
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { FONTS } from "../app/constants/fonts";
import { formatCurrency } from "../lib/utils";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

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

interface Props {
  visible: boolean;
  subscription: UpcomingSubscription | null;
  onClose: () => void;
}

export default function SubscriptionDetailModal({ visible, subscription, onClose }: Props) {
  if (!subscription) return null;

  const annualCost = subscription.price * 12;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable
        onPress={onClose}
        style={{ flex: 1, backgroundColor: "rgba(74,55,40,0.5)", justifyContent: "flex-end" }}
      >
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View
            style={{
              backgroundColor: COLORS.background,
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
              padding: 24,
              paddingBottom: 44,
            }}
          >
            <View
              style={{
                width: 44, height: 4,
                backgroundColor: COLORS.cardBorder,
                borderRadius: 2,
                alignSelf: "center",
                marginBottom: 24,
              }}
            />

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 24,
                backgroundColor: COLORS.white,
                borderRadius: 20,
                padding: 16,
                borderWidth: 1,
                borderColor: COLORS.cardBorder,
              }}
            >
              <Image
                source={subscription.icon}
                style={{ width: 56, height: 56, marginRight: 14 }}
                resizeMode="contain"
              />
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: FONTS.bold, fontSize: 20, color: COLORS.textDark }}>
                  {subscription.name}
                </Text>
                <Text style={{ fontFamily: FONTS.regular, fontSize: 13, color: COLORS.muted, marginTop: 2 }}>
                  {subscription.category ?? "Subscription"}
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                style={{
                  width: 34, height: 34,
                  borderRadius: 17,
                  backgroundColor: COLORS.background,
                  borderWidth: 1,
                  borderColor: COLORS.cardBorder,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontFamily: FONTS.bold, fontSize: 14, color: COLORS.textDark }}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
              <View
                style={{
                  flex: 1, borderRadius: 20, padding: 16,
                  backgroundColor: COLORS.accent,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontFamily: FONTS.regular, fontSize: 12, color: COLORS.white, opacity: 0.85 }}>
                  Monthly
                </Text>
                <Text style={{ fontFamily: FONTS.bold, fontSize: 22, color: COLORS.white, marginTop: 4 }}>
                  {formatCurrency(subscription.price)}
                </Text>
              </View>

              <View
                style={{
                  flex: 1, borderRadius: 20, padding: 16,
                  backgroundColor: COLORS.accentGreen,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontFamily: FONTS.regular, fontSize: 12, color: COLORS.white, opacity: 0.85 }}>
                  Yearly
                </Text>
                <Text style={{ fontFamily: FONTS.bold, fontSize: 22, color: COLORS.white, marginTop: 4 }}>
                  {formatCurrency(annualCost)}
                </Text>
              </View>
            </View>

            <View
              style={{
                backgroundColor: COLORS.white,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: COLORS.cardBorder,
                paddingHorizontal: 16,
                marginBottom: 24,
              }}
            >
              <InfoRow
                icon={<EvilIcons name="calendar" size={24} color={COLORS.muted} />}
                label="Next Renewal"
                value={subscription.renewalDate ?? `In ${subscription.daysLeft} days`}
              />
              <InfoRow
                icon={<Entypo name="hour-glass" size={24} color={COLORS.muted} />}
                label="Days Left"
                value={`${subscription.daysLeft} day${subscription.daysLeft === 1 ? "" : "s"}`}
              />
              <InfoRow
                icon={<FontAwesome name="usd" size={24} color={COLORS.muted} />}
                label="Currency"
                value={subscription.currency}
              />
              <InfoRow
                icon={<MaterialIcons name="category" size={24} color={COLORS.muted} />}
                label="Category"
                value={subscription.category ?? "—"}
                isLast
              />
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={{
                backgroundColor: COLORS.accent,
                borderRadius: 18,
                paddingVertical: 16,
                alignItems: "center",
              }}
            >
              <Text style={{ fontFamily: FONTS.bold, fontSize: 16, color: COLORS.white }}>
                Done
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function InfoRow({
  icon,
  label,
  value,
  isLast = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  isLast?: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 14,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: COLORS.cardBorder,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        {icon}
        <Text style={{ fontFamily: FONTS.regular, fontSize: 14, color: COLORS.muted }}>
          {label}
        </Text>
      </View>
      <Text style={{ fontFamily: FONTS.semibold, fontSize: 14, color: COLORS.textDark }}>
        {value}
      </Text>
    </View>
  );
}