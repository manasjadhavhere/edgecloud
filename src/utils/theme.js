// src/utils/theme.js
/**
 * Applies the event theme to <html data-theme="...">
 * and stores it in sessionStorage for persistence.
 */
export const EVENTS = {
  "iconic": {
    id: "iconic",
    name: "ET Edge Iconic Brands 2026",
    shortName: "Iconic Brands",
    date: "17 DECEMBER 2026",
    location: "Mumbai",
    logo: "/best_iconic_brands_of_india_2026.png",
    colors: { accent: "#C5A059", dark: "#8B1818" },
  },
  "tech": {
    id: "tech",
    name: "ET Edge Best Tech Brands 2026",
    shortName: "Best Tech Brands",
    date: "09 DECEMBER 2026",
    location: "Bengaluru",
    logo: "/best_tech_brands_2026.png",
    colors: { accent: "#00AEEF", dark: "#00529B" },
  },
  "consumer": {
    id: "consumer",
    name: "ET Edge Best Seller Consumer Brands 2026",
    shortName: "Consumer Brands",
    date: "2026",
    location: "TBD",
    logo: "/best_seller_consumer_brands_2026.png",
    colors: { accent: "#D4AF37", dark: "#0B132C" },
  },
};

export function applyTheme(eventId) {
  if (eventId) {
    document.documentElement.setAttribute("data-theme", eventId);
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
}

export function getStoredTheme() {
  return sessionStorage.getItem("ec_event") || null;
}

export function storeTheme(eventId) {
  if (eventId) {
    sessionStorage.setItem("ec_event", eventId);
    applyTheme(eventId);
  }
}

export function clearTheme() {
  sessionStorage.removeItem("ec_event");
  document.documentElement.removeAttribute("data-theme");
}

export function isLoggedIn() {
  return sessionStorage.getItem("ec_auth") === "true";
}

export function setLoggedIn() {
  sessionStorage.setItem("ec_auth", "true");
}
