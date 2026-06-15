import { View, Text, Image, ScrollView } from "react-native";
import { FONTS } from "../app/constants/fonts";
import { formatCurrency } from "../lib/utils";

const COLORS = {
  card: "#FFFFFF",
  cardBorder: "#E1B8A2",
  accent: "#CF7D65",
  accentGreen: "#6B6D43",
  muted: "#ABA66F",
  textDark: "#4A3728",
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