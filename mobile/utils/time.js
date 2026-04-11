const DAYS = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

export function getCurrentDay() {
  return DAYS[new Date().getDay()];
}

export function getPantryStatus(pantry) {
  const today = getCurrentDay();
  const todayHours = pantry.hours?.find((h) => h.day_of_week === today);
  if (!todayHours || todayHours.status === "CLOSED") return "closed";
  if (pantry.has_variable_hours) return "varied";
  return "open";
}

export const DAYS_ORDER = [
  "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY",
];

export function formatHoursText(h) {
  if (!h || h.status === "CLOSED" || (!h.open_time && !h.close_time)) return "Closed";
  if (h.open_time && !h.close_time) return `${h.open_time} – VARIES`;
  if (!h.open_time && h.close_time) return `Until ${h.close_time}`;
  return `${h.open_time} – ${h.close_time}`;
}
