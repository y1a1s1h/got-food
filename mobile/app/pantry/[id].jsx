import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Platform,
} from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getPantryByID } from "../../utils/api";
import {
  getPantryStatus,
  getCurrentDay,
  DAYS_ORDER,
  formatHoursText,
} from "../../utils/time";

const MAROON = "#861F41";

const STATUS_CONFIG = {
  open: { label: "Open Now", color: "#2e7d32", bg: "#e8f5e9" },
  closed: { label: "Closed", color: "#c62828", bg: "#ffebee" },
  varied: { label: "Hours Vary", color: "#e65100", bg: "#fff3e0" },
};

function InfoRow({ icon, children }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={18} color={MAROON} style={styles.infoIcon} />
      <View style={styles.infoContent}>{children}</View>
    </View>
  );
}

export default function PantryDetailScreen() {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [pantry, setPantry] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPantryByID(id).then((data) => {
      setPantry(data);
      if (data) navigation.setOptions({ title: data.name });
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={MAROON} />
      </View>
    );
  }

  if (!pantry) {
    return (
      <View style={styles.loader}>
        <Ionicons name="alert-circle-outline" size={40} color="#ccc" />
        <Text style={styles.errorText}>Pantry not found.</Text>
      </View>
    );
  }

  const status = getPantryStatus(pantry);
  const { label, color, bg } = STATUS_CONFIG[status] ?? STATUS_CONFIG.closed;
  const today = getCurrentDay();

  const sortedHours = DAYS_ORDER.map((day) =>
    pantry.hours?.find((h) => h.day_of_week === day)
  ).filter(Boolean);

  const openMaps = () => {
    const label = encodeURIComponent(pantry.name);
    const latlon = `${pantry.latitude},${pantry.longitude}`;
    const url =
      Platform.OS === "ios"
        ? `maps://app?q=${label}&ll=${latlon}`
        : `geo:${latlon}?q=${latlon}(${label})`;
    Linking.openURL(url).catch(() =>
      Linking.openURL(`https://www.google.com/maps?q=${latlon}`)
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
    >
      {/* Status badge */}
      <View style={[styles.statusBadge, { backgroundColor: bg }]}>
        <Text style={[styles.statusText, { color }]}>{label}</Text>
      </View>

      {/* Address */}
      <View style={styles.card}>
        <InfoRow icon="location-outline">
          <Text style={styles.infoText}>
            {pantry.address}{"\n"}
            {pantry.city}, {pantry.state} {pantry.zip}
          </Text>
          <TouchableOpacity style={styles.directionsBtn} onPress={openMaps}>
            <Ionicons name="navigate-outline" size={14} color={MAROON} />
            <Text style={styles.directionsBtnText}>Get Directions</Text>
          </TouchableOpacity>
        </InfoRow>
      </View>

      {/* Hours */}
      {sortedHours.length > 0 && (
        <View style={styles.card}>
          <InfoRow icon="time-outline">
            <Text style={styles.cardSectionTitle}>Hours of Operation</Text>
            {sortedHours.map((h) => {
              const isToday = h.day_of_week === today;
              const dayLabel =
                h.day_of_week.charAt(0) + h.day_of_week.slice(1).toLowerCase();
              return (
                <View
                  key={h.day_of_week}
                  style={[styles.hoursRow, isToday && styles.hoursRowToday]}
                >
                  <Text style={[styles.hoursDay, isToday && styles.hoursDayToday]}>
                    {dayLabel}
                  </Text>
                  <Text style={[styles.hoursTime, isToday && styles.hoursTimeToday]}>
                    {formatHoursText(h)}
                  </Text>
                </View>
              );
            })}
          </InfoRow>
        </View>
      )}

      {/* Contact */}
      {(pantry.phone || pantry.email || pantry.url) && (
        <View style={styles.card}>
          {pantry.phone && (
            <TouchableOpacity onPress={() => Linking.openURL(`tel:${pantry.phone}`)}>
              <InfoRow icon="call-outline">
                <Text style={[styles.infoText, styles.link]}>{pantry.phone}</Text>
              </InfoRow>
            </TouchableOpacity>
          )}
          {pantry.email && (
            <TouchableOpacity onPress={() => Linking.openURL(`mailto:${pantry.email}`)}>
              <InfoRow icon="mail-outline">
                <Text style={[styles.infoText, styles.link]}>{pantry.email}</Text>
              </InfoRow>
            </TouchableOpacity>
          )}
          {pantry.url && (
            <TouchableOpacity onPress={() => Linking.openURL(pantry.url)}>
              <InfoRow icon="link-outline">
                <Text style={[styles.infoText, styles.link]} numberOfLines={2}>
                  {pantry.url}
                </Text>
              </InfoRow>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Dietary / eligibility */}
      {(pantry.supported_diets?.length > 0 || pantry.eligibility?.length > 0) && (
        <View style={styles.card}>
          {pantry.supported_diets?.length > 0 && (
            <InfoRow icon="nutrition-outline">
              <Text style={styles.cardSectionTitle}>Dietary Support</Text>
              <View style={styles.tagRow}>
                {pantry.supported_diets.map((d) => (
                  <View key={d} style={styles.tag}>
                    <Text style={styles.tagText}>{d}</Text>
                  </View>
                ))}
              </View>
            </InfoRow>
          )}
          {pantry.eligibility?.length > 0 && (
            <InfoRow icon="people-outline">
              <Text style={styles.cardSectionTitle}>Serves ZIP Codes</Text>
              <Text style={styles.infoText}>{pantry.eligibility.join(", ")}</Text>
            </InfoRow>
          )}
        </View>
      )}

      {/* Comments */}
      {pantry.comments && (
        <View style={styles.card}>
          <InfoRow icon="chatbubble-ellipses-outline">
            <Text style={styles.cardSectionTitle}>Notes</Text>
            <Text style={styles.infoText}>{pantry.comments}</Text>
          </InfoRow>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  content: { padding: 16, gap: 12 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  errorText: { color: "#888", fontSize: 16 },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 4,
  },
  statusText: { fontWeight: "700", fontSize: 14 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    gap: 12,
  },
  infoRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  infoIcon: { marginTop: 2 },
  infoContent: { flex: 1, gap: 6 },
  infoText: { fontSize: 15, color: "#333", lineHeight: 22 },
  link: { color: MAROON, textDecorationLine: "underline" },
  cardSectionTitle: { fontSize: 13, fontWeight: "700", color: "#888", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 4 },
  directionsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  directionsBtnText: { color: MAROON, fontSize: 14, fontWeight: "600" },
  hoursRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  hoursRowToday: { backgroundColor: "#fce4ec" },
  hoursDay: { fontSize: 14, color: "#555", width: 95 },
  hoursDayToday: { color: MAROON, fontWeight: "700" },
  hoursTime: { fontSize: 14, color: "#333" },
  hoursTimeToday: { color: MAROON, fontWeight: "700" },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tag: {
    backgroundColor: "#fce4ec",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  tagText: { fontSize: 12, color: MAROON, fontWeight: "600" },
});
