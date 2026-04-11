import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  StyleSheet,
  ScrollView,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const MAROON = "#861F41";

function Checkbox({ label, value, onChange }) {
  return (
    <TouchableOpacity style={styles.checkRow} onPress={() => onChange(!value)} activeOpacity={0.7}>
      <View style={[styles.checkbox, value && styles.checkboxChecked]}>
        {value && <Ionicons name="checkmark" size={13} color="#fff" />}
      </View>
      <Text style={styles.checkLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function FilterSheet({ visible, onClose, onSearch }) {
  const [searchLocation, setSearchLocation] = useState("");
  const [residentialZip, setResidentialZip] = useState("");
  const [kosher, setKosher] = useState(false);
  const [halal, setHalal] = useState(false);
  const [showOpen, setShowOpen] = useState(false);
  const [noShowVaried, setNoShowVaried] = useState(false);

  const handleSearch = () => {
    onSearch({ searchLocation, residentialZip, kosher, halal, showOpen, noShowVaried });
    onClose();
  };

  const handleReset = () => {
    setSearchLocation("");
    setResidentialZip("");
    setKosher(false);
    setHalal(false);
    setShowOpen(false);
    setNoShowVaried(false);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelBtn}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Filters</Text>
          <TouchableOpacity onPress={handleReset}>
            <Text style={styles.resetBtn}>Reset</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Location search */}
          <Text style={styles.sectionLabel}>Search by Name or Location</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="search-outline" size={16} color="#888" style={{ marginLeft: 10 }} />
            <TextInput
              style={styles.input}
              placeholder="Address, city, zip..."
              value={searchLocation}
              onChangeText={setSearchLocation}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
          </View>

          <View style={styles.divider} />

          {/* Dietary restrictions */}
          <Text style={styles.sectionLabel}>Dietary Restrictions</Text>
          <Checkbox label="Kosher" value={kosher} onChange={setKosher} />
          <Checkbox label="Halal" value={halal} onChange={setHalal} />

          <View style={styles.divider} />

          {/* Eligibility zip */}
          <Text style={styles.sectionLabel}>Your Residential ZIP Code</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="home-outline" size={16} color="#888" style={{ marginLeft: 10 }} />
            <TextInput
              style={styles.input}
              placeholder="5-digit ZIP code..."
              value={residentialZip}
              onChangeText={(v) => setResidentialZip(v.replace(/\D/g, "").slice(0, 5))}
              keyboardType="number-pad"
              maxLength={5}
            />
          </View>

          <View style={styles.divider} />

          {/* Toggles */}
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Only Show Currently Open</Text>
            <Switch
              value={showOpen}
              onValueChange={setShowOpen}
              trackColor={{ true: MAROON }}
              thumbColor="#fff"
            />
          </View>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Exclude Pantries With Varied Hours</Text>
            <Switch
              value={noShowVaried}
              onValueChange={setNoShowVaried}
              trackColor={{ true: MAROON }}
              thumbColor="#fff"
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
            <Ionicons name="search" size={18} color="#fff" />
            <Text style={styles.searchBtnText}>Search</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: { fontSize: 17, fontWeight: "700", color: "#222" },
  cancelBtn: { fontSize: 16, color: "#555" },
  resetBtn: { fontSize: 16, color: MAROON, fontWeight: "600" },
  content: { padding: 20, gap: 12 },
  sectionLabel: { fontSize: 13, fontWeight: "700", color: "#444", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    overflow: "hidden",
  },
  input: { flex: 1, paddingVertical: 10, paddingHorizontal: 8, fontSize: 15, color: "#222" },
  checkRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 6 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: { backgroundColor: MAROON, borderColor: MAROON },
  checkLabel: { fontSize: 15, color: "#333" },
  divider: { height: 1, backgroundColor: "#e0e0e0", marginVertical: 8 },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    marginBottom: 4,
  },
  toggleLabel: { flex: 1, fontSize: 15, color: "#333", marginRight: 12 },
  footer: { padding: 20, paddingBottom: 36, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#eee" },
  searchBtn: {
    backgroundColor: MAROON,
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  searchBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
