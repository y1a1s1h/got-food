// ============================================================
// LOCAL NETWORK CONFIG
// Set this to your machine's local IP address when running
// the backend via docker-compose on the same network.
// Example: "http://192.168.1.42:5000"
// Run `ipconfig` (Windows) or `ifconfig` (Mac/Linux) to find it.
// ============================================================
export const BASE_URL = "http://192.168.0.126:5000";

function buildUrl(path, params = {}) {
  const url = new URL(path, BASE_URL);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== false) {
      url.searchParams.append(k, v);
    }
  });
  return url.toString();
}

export async function getPantries({
  openNow = false,
  eligibleZip = undefined,
  supportedDiets = undefined,
  showUnknown = true,
  variedOnly = false,
} = {}) {
  try {
    const params = {};
    if (openNow) params.open_now = "true";
    if (eligibleZip) params.eligibility = eligibleZip;
    if (supportedDiets?.length) params.supported_diets = supportedDiets.join(",");
    if (showUnknown) params.show_unknown = "true";
    if (variedOnly) params.varied_only = "true";

    const res = await fetch(buildUrl("/api/pantries", params));
    if (!res.ok) throw new Error(res.status);
    return await res.json();
  } catch (err) {
    console.error("getPantries error:", err);
    return null;
  }
}

export async function getAllPantries() {
  return getPantries();
}

export async function getPantryByID(id) {
  try {
    const res = await fetch(buildUrl(`/api/pantries/${id}`));
    if (!res.ok) throw new Error(res.status);
    return await res.json();
  } catch (err) {
    console.error("getPantryByID error:", err);
    return null;
  }
}

export async function getPantryHours(id) {
  try {
    const res = await fetch(buildUrl(`/api/pantries/${id}/hours`));
    if (!res.ok) throw new Error(res.status);
    return await res.json();
  } catch (err) {
    console.error("getPantryHours error:", err);
    return null;
  }
}
