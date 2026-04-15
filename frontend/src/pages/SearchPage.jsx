import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Header from "../components/Header";
import Map from "../components/Map";
import Filter from "../components/MapFilters";
import Menu from "../components/MapMenu";
import { getAllPantries, getPantries } from "../utils/api_requests";
import { STATE_NAMES } from "../utils/state_names";

function SearchPage() {
  const [allPantries, setAllPantries] = useState([]);
  const [pantries, setPantries] = useState([]);
  const [selectedPantry, setSelectedPantry] = useState(null);
  const [pantrySelection, setPantrySelection] = useState(null);

  useEffect(() => {
    getAllPantries().then((data) => {
      console.log("Raw API response:", data);
      if (!data) return;
      setAllPantries(data);
      setPantries(data);
    });
  }, []);

  const handleSearch = ({
    searchLocation,
    kosher,
    halal,
    showOpen,
    noShowVaried,
    residentialZip,
  }) => {
    const diets = [];
    if (kosher) diets.push("KOSHER");
    if (halal) diets.push("HALAL");

    getPantries(
      showOpen,
      residentialZip || undefined,
      diets.length > 0 ? diets : undefined,
      true,
    ).then((data) => {
      if (!data) return;

      let filtered = data;

      if (noShowVaried) {
        filtered = filtered.filter((p) => !p.has_variable_hours);
      }

      if (searchLocation) {
        const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9\s]/g, "");
        const query = normalize(searchLocation);
        filtered = filtered.filter((p) => {
          const stateName = STATE_NAMES[p.state] ?? "";
          return [p.name, p.address, p.city, p.zip, p.state, stateName]
            .filter(Boolean)
            .some((field) => normalize(field).includes(query));
        });
      }
      setPantries(filtered);
    });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "white",
      }}
    >
      <Header />
      <Navbar />
      <main
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "1.5rem",
          padding: "5rem",
          alignItems: "start",
        }}
      >
        <Menu
          items={pantries}
          onSelectPantry={setSelectedPantry}
          pantrySelection={pantrySelection}
        />
        <Map
          pantries={pantries}
          selectedPantry={selectedPantry}
          onSelectPantry={(id) =>
            setPantrySelection((prev) => ({
              id,
              count: (prev?.count ?? 0) + 1,
            }))
          }
        />
        <Filter onSearch={handleSearch} pantries={allPantries} />
      </main>
    </div>
  );
}

export default SearchPage;
