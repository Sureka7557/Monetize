import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { FONTS } from "../app/constants/fonts";
import { posthog } from "@/lib/postHog";

const COLORS = {
  background: "#F2DEC7",
  card: "#FFFFFF",
  cardBorder: "#E1B8A2",
  accent: "#CF7D65",
  accentGreen: "#6B6D43",
  muted: "#ABA66F",
  textDark: "#4A3728",
  white: "#FFFFFF",
  softBlue: "#99B4AA",
  overlay: "rgba(74, 55, 40, 0.4)",
};

const FREQUENCIES = ["Monthly", "Yearly"] as const;
type Frequency = (typeof FREQUENCIES)[number];

const CATEGORIES = [
  "Entertainment",
  "AI Tools",
  "Developer Tools",
  "Design",
  "Productivity",
  "Other",
] as const;
type Category = (typeof CATEGORIES)[number];

interface CreateSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (subscription: {
    name: string;
    price: number;
    frequency: Frequency;
    category: Category;
  }) => void;
}

export default function CreateSubscriptionModal({
  visible,
  onClose,
  onCreate,
}: CreateSubscriptionModalProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("Monthly");
  const [category, setCategory] = useState<Category | null>(null);

  const handleCreate = () => {
    if (!name.trim() || !price.trim() || !category) return;

    const priceValue = parseFloat(price);

    const newSubscription = {
      name: name.trim(),
      price: priceValue,
      frequency,
      category,
    };

    onCreate(newSubscription);

    posthog.capture("subscription_created", {
      subscription_name: name.trim(),
      subscription_price: priceValue,
      subscription_frequency: frequency,
      subscription_category: category,
    });

    // Reset
    setName("");
    setPrice("");
    setFrequency("Monthly");
    setCategory(null);
    onClose();
  };

  const isValid = name.trim() !== "" && price.trim() !== "" && category !== null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* Backdrop */}
        <Pressable
          style={{ flex: 1, backgroundColor: COLORS.overlay }}
          onPress={onClose}
        />

        {/* Sheet */}
        <View
          style={{
            backgroundColor: COLORS.background,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            paddingHorizontal: 24,
            paddingTop: 20,
            paddingBottom: 36,
            maxHeight: "80%",
          }}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <Text
                style={{
                  fontFamily: FONTS.semibold,
                  fontSize: 18,
                  color: COLORS.textDark,
                }}
              >
                New Subscription
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Text
                  style={{
                    fontFamily: FONTS.bold,
                    fontSize: 18,
                    color: COLORS.muted,
                  }}
                >
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            {/* Name Field */}
            <Text
              style={{
                fontFamily: FONTS.medium,
                fontSize: 13,
                color: COLORS.textDark,
                marginBottom: 6,
              }}
            >
              Name
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Youtube Premium"
              placeholderTextColor={COLORS.muted}
              style={{
                backgroundColor: COLORS.white,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: COLORS.cardBorder,
                paddingHorizontal: 14,
                paddingVertical: 12,
                fontFamily: FONTS.regular,
                fontSize: 15,
                color: COLORS.textDark,
                marginBottom: 18,
              }}
            />

            {/* Price Field */}
            <Text
              style={{
                fontFamily: FONTS.medium,
                fontSize: 13,
                color: COLORS.textDark,
                marginBottom: 6,
              }}
            >
              Price
            </Text>
            <TextInput
              value={price}
              onChangeText={setPrice}
              placeholder="9.99"
              placeholderTextColor={COLORS.muted}
              keyboardType="decimal-pad"
              style={{
                backgroundColor: COLORS.white,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: COLORS.cardBorder,
                paddingHorizontal: 14,
                paddingVertical: 12,
                fontFamily: FONTS.regular,
                fontSize: 15,
                color: COLORS.textDark,
                marginBottom: 18,
              }}
            />

            {/* Frequency */}
            <Text
              style={{
                fontFamily: FONTS.medium,
                fontSize: 13,
                color: COLORS.textDark,
                marginBottom: 10,
              }}
            >
              Frequency
            </Text>
            <View
              style={{
                flexDirection: "row",
                gap: 10,
                marginBottom: 18,
              }}
            >
              {FREQUENCIES.map((f) => (
                <TouchableOpacity
                  key={f}
                  onPress={() => setFrequency(f)}
                  style={{
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor:
                      frequency === f ? COLORS.accent : COLORS.cardBorder,
                    backgroundColor:
                      frequency === f ? COLORS.accent : COLORS.white,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: FONTS.medium,
                      fontSize: 14,
                      color: frequency === f ? COLORS.white : COLORS.textDark,
                    }}
                  >
                    {f}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Category */}
            <Text
              style={{
                fontFamily: FONTS.medium,
                fontSize: 13,
                color: COLORS.textDark,
                marginBottom: 10,
              }}
            >
              Category
            </Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 28,
              }}
            >
              {CATEGORIES.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setCategory(c)}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor:
                      category === c ? COLORS.accent : COLORS.cardBorder,
                    backgroundColor:
                      category === c ? COLORS.accent : COLORS.white,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: FONTS.medium,
                      fontSize: 13,
                      color: category === c ? COLORS.white : COLORS.textDark,
                    }}
                  >
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Create Button */}
            <TouchableOpacity
              onPress={handleCreate}
              disabled={!isValid}
              style={{
                backgroundColor: isValid ? COLORS.accent : COLORS.cardBorder,
                borderRadius: 16,
                paddingVertical: 16,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: FONTS.bold,
                  fontSize: 16,
                  color: COLORS.white,
                }}
              >
                Create Subscription
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}