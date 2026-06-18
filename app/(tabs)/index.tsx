import { View, Text, Image, Pressable, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";

import { images } from "../constants/images";
import {
  HOME_USER,
  HOME_BALANCE,
  UPCOMING_SUBSCRIPTIONS,
  ALL_SUBSCRIPTIONS,
  
} from "../constants/data";
import { FONTS } from "../constants/fonts";
import { formatCurrency } from "../../lib/utils";
import { posthog } from "../../lib/postHog";

import ListHeading from "../../components/ListHeading";
import UpcomingSubscriptions from "../../components/UpcomingSubscriptions";
import SubscriptionDetailModal from "../../components/SubscriptionDetailModal";
import CreateSubscriptionModal from "../../components/CreateSubscriptionModal";

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
};

export default function HomeScreen() {
  const nextRenewal = new Date(HOME_BALANCE.nextRenewalDate);
  const renewalLabel = `${String(nextRenewal.getMonth() + 1).padStart(2, "0")}/${String(
    nextRenewal.getFullYear()
  ).slice(-2)}`;

  const [showCreate, setShowCreate] = useState(false);
  const [selectedSub, setSelectedSub] = useState<UpcomingSubscription | null>(null);
  const [allSubs, setAllSubs] = useState<UpcomingSubscription[]>(ALL_SUBSCRIPTIONS);
  const [upcomingSubs, setUpcomingSubs] = useState<UpcomingSubscription[]>(UPCOMING_SUBSCRIPTIONS);

  useEffect(() => {
    posthog.screen("Home");
  }, []);

  const handleCreate = (newSub: {
    name: string;
    price: number;
    frequency: "Monthly" | "Yearly";
    category: string;
  }) => {
    const created: UpcomingSubscription = {
      id: `user-${Date.now()}`,
      name: newSub.name,
      price: newSub.price,
      category: newSub.category,
      currency: "USD",
      daysLeft: newSub.frequency === "Monthly" ? 30 : 365,
      renewalDate: "",
      icon: images.avatar,
    };

    setAllSubs((prev) => [created, ...prev]);
    setUpcomingSubs((prev) => [created, ...prev]);

    posthog.capture("subscription_created", {
      subscription_name: newSub.name,
      subscription_price: newSub.price,
      subscription_frequency: newSub.frequency,
      subscription_category: newSub.category,
    });
  };

  const handleOpenCreate = () => {
    posthog.capture("create_subscription_modal_opened");
    setShowCreate(true);
  };

const handleSelectSub = (sub: UpcomingSubscription) => {
  console.log("SUB CLICKED:", sub.name);

  posthog.capture("subscription_viewed", {
    subscription_name: sub.name,
    subscription_price: sub.price,
    subscription_category: sub.category ?? "Unknown",
  });

  setSelectedSub(sub);
};
 
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView className="flex-1 px-5 pt-5">
        {/* Header */}
        <View className="mb-5 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Image source={images.avatar} className="mr-3 h-12 w-12 rounded-full" />
            <Text style={{ fontFamily: FONTS.semibold, fontSize: 16, color: COLORS.textDark }}>
            {HOME_USER.name}
          </Text>
          <Text style={{ fontFamily: FONTS.regular, fontSize: 14, color: COLORS.muted }}
          className="ml-5">
            {HOME_USER.role}
          </Text>
          </View>

          <Pressable
            onPress={handleOpenCreate}
            className="h-10 w-10 items-center justify-center rounded-full"
            style={{
              backgroundColor: COLORS.white,
              borderWidth: 1,
              borderColor: COLORS.cardBorder,
            }}
          >
            <Text style={{ fontFamily: FONTS.bold, fontSize: 22, color: COLORS.accent }}>
              +
            </Text>
          </Pressable>
        </View>

        {/* Balance Card */}
        <View className="mb-6 rounded-3xl p-6" style={{ backgroundColor: COLORS.softBlue }}>
          <Text
            className="mb-3"
            style={{ fontFamily: FONTS.medium, color: "rgba(255,255,255,0.85)" }}
          >
            Balance
          </Text>
          <View className="flex-row items-center justify-between">
            <Text style={{ fontFamily: FONTS.bold, fontSize: 36, color: COLORS.white }}>
              {formatCurrency(HOME_BALANCE.amount)}
            </Text>
            <Text
              style={{ fontFamily: FONTS.medium, color: "rgba(255,255,255,0.85)" }}
            >
              {renewalLabel}
            </Text>
          </View>
        </View>

        {/* Upcoming */}
        <ListHeading title="Upcoming" onViewAll={() => console.log("View all upcoming")} />
        <UpcomingSubscriptions items={upcomingSubs} />

        {/* All Subscriptions */}
        <View className="mt-8">
          <ListHeading
            title="All Subscriptions"
            onViewAll={() => console.log("View all subscriptions")}
          />
        </View>

        {allSubs.map((sub, index) => (
          <TouchableOpacity
            key={sub.id}
            onPress={() => handleSelectSub(sub)}
            className="flex-row items-center justify-between rounded-2xl p-4"
            style={{
              backgroundColor: COLORS.white,
              borderWidth: 1,
              borderColor: COLORS.cardBorder,
              marginBottom: index === allSubs.length - 1 ? 40 : 16,
            }}
          >
            <View className="flex-row items-center">
              <Image source={sub.icon} className="mr-3 h-12 w-12" resizeMode="contain" />
              <View>
                <Text
                  style={{ fontFamily: FONTS.semibold, fontSize: 16, color: COLORS.textDark }}
                >
                  {sub.name}
                </Text>
                <Text style={{ fontFamily: FONTS.regular, color: COLORS.muted }}>
                  {sub.renewalDate ?? `In ${sub.daysLeft} days`}
                </Text>
              </View>
            </View>
            <Text style={{ fontFamily: FONTS.bold, fontSize: 16, color: COLORS.accent }}>
              {formatCurrency(sub.price)}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Modals */}
        <SubscriptionDetailModal
          visible={!!selectedSub}
          subscription={selectedSub}
          onClose={() => setSelectedSub(null)}
        />
        <CreateSubscriptionModal
          visible={showCreate}
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
        />
      </ScrollView>
    </SafeAreaView>
  );
}