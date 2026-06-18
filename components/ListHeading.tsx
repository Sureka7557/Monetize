import { View, Text, Pressable } from "react-native";
import { FONTS } from "../app/constants/fonts";

const COLORS = {
  textDark: "#23395D",
  accent: "#4D97FF",

  borderMuted: "#E4ECF8",
  textMuted: "#7B8CA8",
};

interface ListHeadingProps {
  title: string;
  onViewAll?: () => void;
  showViewAll?: boolean;
}

const ListHeading = ({ title, onViewAll, showViewAll = true }: ListHeadingProps) => {
  return (
    <View style={{ marginBottom: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
      <Text style={{ fontFamily: FONTS.semibold, fontSize: 20, color: COLORS.textDark }}>
        {title}
      </Text>

      {showViewAll && (
        <Pressable
          onPress={onViewAll}
          style={{
            borderRadius: 20,
            borderWidth: 1,
            borderColor: COLORS.borderMuted,
            paddingHorizontal: 16,
            paddingVertical: 4,
          }}
        >
          <Text style={{ fontFamily: FONTS.medium, fontSize: 13, color: COLORS.textMuted }}>
            View all
          </Text>
        </Pressable>
      )}
    </View>
  );
};

export default ListHeading;