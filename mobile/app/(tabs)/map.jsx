import { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
} from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import { useRouter } from "expo-router";
import { getAllPantries } from "../../utils/api";
import { getPantryStatus, getCurrentDay } from "../../utils/time";

const STATUS_COLORS = {
  open: "#2e7d32",
  closed: "#c62828",
  varied: "#e65100",
};

const INITIAL_REGION = {
  latitude: 38.8462,
  longitude: -77.3064,
  latitudeDelta: 0.3,
  longitudeDelta: 0.3,
};

export default function MapScreen() {
  const [pantries, setPantries] = useState([]);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    getAllPantries().then((data) => {
      if (data) setPantries(data);
      setLoading(false);
    });
  }, []);

  const fitToMarkers = () => {
    if (!mapRef.current || pantries.length === 0) return;
    const coords = pantries
      .filter((p) => p.latitude && p.longitude)
      .map((p) => ({ latitude: parseFloat(p.latitude), longitude: parseFloat(p.longitude) }));
    if (coords.length > 0) {
      mapRef.current.fitToCoordinates(coords, {
        edgePadding: { top: 60, right: 40, bottom: 60, left: 40 },
        animated: true,
      });
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#861F41" />
          <Text style={styles.loaderText}>Loading pantries...</Text>
        </View>
      ) : (
        <>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={INITIAL_REGION}
            onMapReady={fitToMarkers}
            showsUserLocation
          >
            {pantries
              .filter((p) => p.latitude && p.longitude)
              .map((p) => {
                const status = getPantryStatus(p);
                return (
                  <Marker
                    key={p.id}
                    coordinate={{
                      latitude: parseFloat(p.latitude),
                      longitude: parseFloat(p.longitude),
                    }}
                    pinColor={STATUS_COLORS[status]}
                  >
                    <Callout onPress={() => router.push(`/pantry/${p.id}`)}>
                      <View style={styles.callout}>
                        <Text style={styles.calloutName}>{p.name}</Text>
                        <Text style={styles.calloutAddr}>
                          {p.address}, {p.city}
                        </Text>
                        <Text
                          style={[styles.calloutStatus, { color: STATUS_COLORS[status] }]}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Text>
                        <Text style={styles.calloutTap}>Tap to view details</Text>
                      </View>
                    </Callout>
                  </Marker>
                );
              })}
          </MapView>

          {/* Legend */}
          <View style={styles.legend}>
            {Object.entries(STATUS_COLORS).map(([status, color]) => (
              <View key={status} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: color }]} />
                <Text style={styles.legendLabel}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  loaderText: { color: "#555", fontSize: 16 },
  callout: { width: 200, padding: 4 },
  calloutName: { fontWeight: "bold", fontSize: 14, marginBottom: 2 },
  calloutAddr: { fontSize: 12, color: "#555", marginBottom: 4 },
  calloutStatus: { fontSize: 12, fontWeight: "600", marginBottom: 2 },
  calloutTap: { fontSize: 11, color: "#888", fontStyle: "italic" },
  legend: {
    position: "absolute",
    bottom: 24,
    right: 12,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 8,
    padding: 10,
    gap: 6,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { fontSize: 13, color: "#333" },
});
