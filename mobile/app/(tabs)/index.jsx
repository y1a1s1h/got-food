import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getAllPantries, getPantries } from "../../utils/api";
import { getPantryStatus } from "../../utils/time";
import PantryCard from "../../components/PantryCard";
import FilterSheet from "../../components/FilterSheet";

const STATE_NAMES = {
  VA: "virginia", MD: "maryland", DC: "district of columbia",
  NC: "north carolina", WV: "west virginia",
};

const MAROON = "#861F41";

export default function PantriesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [pantries, setPantries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState(null);

  const load = useCallback(async (filters = null) => {
    setLoading(true);
    let data;
    if (!filters) {
      data = await getAllPantries();
    } else {
      const diets = [];
      if (filters.kosher) diets.push("KOSHER");
      if (filters.halal) diets.push("HALAL");
      data = await getPantries({
        openNow: filters.showOpen,
        eligibleZip: filters.residentialZip || undefined,
        supportedDiets: diets.length ? diets : undefined,
        showUnknown: true,
      });
      if (data && filters.noShowVaried) {
        data = data.filter((p) => !p.has_variable_hours);
      }
      if (data && filters.searchLocation) {
        const tokens = filters.searchLocation
          .toLowerCase()
          .split(/\s+/)
          .filter((t) => /[a-z0-9]/.test(t));
        data = data.filter((p) => {
          const stateName = STATE_NAMES[p.state] ?? "";
          const fields = [p.name, p.address, p.city, p.zip, p.state, stateName]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return tokens.every((t) => fields.includes(t));
        });
      }
    }
    if (data) setPantries(data);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    load(null);
  }, []);

  const handleSearch = (filters) => {
    setActiveFilters(filters);
    load(filters);
  };

  const hasActiveFilter =
    activeFilters &&
    (activeFilters.searchLocation ||
      activeFilters.residentialZip ||
      activeFilters.kosher ||
      activeFilters.halal ||
      activeFilters.showOpen ||
      activeFilters.noShowVaried);

  return (
    <View style={styles.container}>
      {/* Search bar / filter trigger */}
      <TouchableOpacity
        style={styles.searchBar}
        onPress={() => setFilterVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="search-outline" size={18} color="#888" />
        <Text style={styles.searchPlaceholder}>Search pantries, filters...</Text>
        {hasActiveFilter && (
          <View style={styles.filterBadge}>
            <Text style={styles.filterBadgeText}>Active</Text>
          </View>
        )}
        <Ionicons name="options-outline" size={18} color={hasActiveFilter ? MAROON : "#888"} />
      </TouchableOpacity>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={MAROON} />
          <Text style={styles.loaderText}>Loading pantries...</Text>
        </View>
      ) : (
        <FlatList
          data={pantries}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <PantryCard
              pantry={item}
              onPress={() => router.push(`/pantry/${item.id}`)}
            />
          )}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: insets.bottom + 16 },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load(activeFilters);
              }}
              tintColor={MAROON}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={40} color="#ccc" />
              <Text style={styles.emptyText}>No pantries found.</Text>
              <Text style={styles.emptySubtext}>Try adjusting your filters.</Text>
            </View>
          }
        />
      )}

      <FilterSheet
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        onSearch={handleSearch}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    margin: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  searchPlaceholder: { flex: 1, color: "#aaa", fontSize: 15 },
  filterBadge: {
    backgroundColor: "#fce4ec",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  filterBadgeText: { fontSize: 11, color: MAROON, fontWeight: "700" },
  list: { paddingTop: 4 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  loaderText: { color: "#666", fontSize: 16 },
  empty: { alignItems: "center", paddingTop: 80, gap: 8 },
  emptyText: { fontSize: 17, fontWeight: "600", color: "#888" },
  emptySubtext: { fontSize: 14, color: "#aaa" },
});
