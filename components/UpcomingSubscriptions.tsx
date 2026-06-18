import { View, Text, Image, ScrollView } from "react-native";
import { FONTS } from "../app/constants/fonts";
import { formatCurrency } from "../lib/utils";

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
  items: UpcomingSubscription[];
}

const UpcomingSubscriptions = ({ items }: Props) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 4 }}
    >
      {items.map((item) => (
        <View
          key={item.id}
          style={{
            marginRight: 12,
            width: 160,
            borderRadius: 16,
            padding: 16,
            backgroundColor: COLORS.card,
            borderWidth: 1,
            borderColor: COLORS.cardBorder,
          }}
        >
          <Image
            source={item.icon}
            style={{ marginBottom: 12, height: 40, width: 40, borderRadius: 10 }}
            resizeMode="contain"
          />
          <Text style={{ fontFamily: FONTS.semibold, fontSize: 18, color: COLORS.accent }}>
            {formatCurrency(item.price, item.currency ?? "USD")}
          </Text>
          <Text style={{ fontFamily: FONTS.regular, fontSize: 13, color: COLORS.muted }}>
            {item.daysLeft} {item.daysLeft === 1 ? "day" : "days"} left
          </Text>
          <Text style={{ fontFamily: FONTS.medium, marginTop: 8, color: COLORS.textDark }}>
            {item.name}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
};

export default UpcomingSubscriptions;