import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getPantryStatus } from "../utils/time";

const STATUS_CONFIG = {
  open: { label: "Open", color: "#2e7d32", bg: "#e8f5e9" },
  closed: { label: "Closed", color: "#c62828", bg: "#ffebee" },
  varied: { label: "Hours Vary", color: "#e65100", bg: "#fff3e0" },
};

export default function PantryCard({ pantry, onPress }) {
  const status = getPantryStatus(pantry);
  const { label, color, bg } = STATUS_CONFIG[status] ?? STATUS_CONFIG.closed;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.header}>
        <Text style={styles.name} numberOfLines={2}>
          {pantry.name}
        </Text>
        <View style={[styles.badge, { backgroundColor: bg }]}>
          <Text style={[styles.badgeText, { color }]}>{label}</Text>
        </View>
      </View>
      <View style={styles.row}>
        <Ionicons name="location-outline" size={14} color="#666" />
        <Text style={styles.sub} numberOfLines={1}>
          {pantry.address}, {pantry.city}, {pantry.state} {pantry.zip}
        </Text>
      </View>
      {pantry.phone ? (
        <View style={styles.row}>
          <Ionicons name="call-outline" size={14} color="#666" />
          <Text style={styles.sub}>{pantry.phone}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    gap: 6,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  name: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: "#222",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  sub: {
    fontSize: 13,
    color: "#555",
    flex: 1,
  },
});
