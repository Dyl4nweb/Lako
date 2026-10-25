import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPHP(amount: number | string): string {
  const numeric = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(numeric)) return "₱0.00";
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numeric);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).format(d);
}

export interface BarangayInfo {
  name: string;
  cluster: "Central" | "Coastal" | "East" | "West" | "South";
  deliveryEstimateMinutes: number;
  popularLandmarks: string[];
}

export const LINGAYEN_BARANGAYS: BarangayInfo[] = [
  { name: "Poblacion", cluster: "Central", deliveryEstimateMinutes: 25, popularLandmarks: ["Lingayen Town Plaza", "Epiphany of Our Lord Parish", "Lingayen Public Market", "Municipal Hall"] },
  { name: "Maniboc", cluster: "Coastal", deliveryEstimateMinutes: 30, popularLandmarks: ["Pangasinan Provincial Capitol", "Veterans Memorial Park", "Lingayen Baywalk", "Ramos House"] },
  { name: "Libsong East", cluster: "Coastal", deliveryEstimateMinutes: 30, popularLandmarks: ["Alvear Street East", "Lingayen Beach Front", "Sison Auditorium"] },
  { name: "Libsong West", cluster: "Coastal", deliveryEstimateMinutes: 30, popularLandmarks: ["Pangasinan National High School (PNHS)", "Capitol Gym"] },
  { name: "Baay", cluster: "Central", deliveryEstimateMinutes: 30, popularLandmarks: ["Baay Elementary School", "PNR Road Junction"] },
  { name: "Pangapisan North", cluster: "Coastal", deliveryEstimateMinutes: 35, popularLandmarks: ["Pangapisan Beach Area", "Salt-making farms (Asinan)"] },
  { name: "Pangapisan South", cluster: "Central", deliveryEstimateMinutes: 35, popularLandmarks: ["Bypass Road", "Pangapisan Chapel"] },
  { name: "Tonton", cluster: "Central", deliveryEstimateMinutes: 35, popularLandmarks: ["Tonton Bridge", "Riverside Dike"] },
  { name: "Domalandan Center", cluster: "West", deliveryEstimateMinutes: 40, popularLandmarks: ["Domalandan Plaza", "St. Columban's College Annex"] },
  { name: "Domalandan East", cluster: "West", deliveryEstimateMinutes: 40, popularLandmarks: ["East Elementary", "Highway Intersection"] },
  { name: "Domalandan West", cluster: "West", deliveryEstimateMinutes: 45, popularLandmarks: ["Agno River View Deck", "Domalandan West High School"] },
  { name: "Capandanan", cluster: "West", deliveryEstimateMinutes: 45, popularLandmarks: ["Capandanan Bridge", "Fishpond Access Road"] },
  { name: "Estanza", cluster: "West", deliveryEstimateMinutes: 45, popularLandmarks: ["Estanza National High School", "Salt Beds"] },
  { name: "Malimpuec", cluster: "West", deliveryEstimateMinutes: 50, popularLandmarks: ["Malimpuec Beach", "Coastal Watchtower"] },
  { name: "Sabangan", cluster: "Coastal", deliveryEstimateMinutes: 35, popularLandmarks: ["Sabangan Fishermen's Wharf", "Seaside Chapel"] },
  { name: "Aliwekwek", cluster: "Central", deliveryEstimateMinutes: 35, popularLandmarks: ["Aliwekwek Barangay Hall", "Irrigation Canal"] },
  { name: "Balangobong", cluster: "South", deliveryEstimateMinutes: 40, popularLandmarks: ["Balangobong Multipurpose Hall"] },
  { name: "Balococ", cluster: "South", deliveryEstimateMinutes: 40, popularLandmarks: ["Balococ Elementary School"] },
  { name: "Bantayan", cluster: "East", deliveryEstimateMinutes: 35, popularLandmarks: ["Bantayan Riverside", "Bantayan Chapel"] },
  { name: "Basing", cluster: "South", deliveryEstimateMinutes: 40, popularLandmarks: ["Basing Agrarian Road"] },
  { name: "Dorongan", cluster: "South", deliveryEstimateMinutes: 45, popularLandmarks: ["Dorongan Rice Fields Gateway"] },
  { name: "Dulag", cluster: "South", deliveryEstimateMinutes: 40, popularLandmarks: ["Dulag Barangay Health Station"] },
  { name: "Lasip", cluster: "South", deliveryEstimateMinutes: 40, popularLandmarks: ["Lasip Elementary School"] },
  { name: "Malawa", cluster: "South", deliveryEstimateMinutes: 40, popularLandmarks: ["Malawa Catholic Chapel"] },
  { name: "Matalava", cluster: "South", deliveryEstimateMinutes: 40, popularLandmarks: ["Matalava Trading Center"] },
  { name: "Naguelguel", cluster: "South", deliveryEstimateMinutes: 45, popularLandmarks: ["Naguelguel Boundary Marker"] },
  { name: "Namolan", cluster: "South", deliveryEstimateMinutes: 45, popularLandmarks: ["Namolan Basketball Court"] },
  { name: "Quibaol", cluster: "South", deliveryEstimateMinutes: 40, popularLandmarks: ["Quibaol National High School"] },
  { name: "Rosario", cluster: "East", deliveryEstimateMinutes: 35, popularLandmarks: ["Rosario Chapel", "Binmaley Boundary Border"] },
  { name: "Talogtog", cluster: "Central", deliveryEstimateMinutes: 30, popularLandmarks: ["Talogtog Dike Road"] },
  { name: "Tumbar", cluster: "South", deliveryEstimateMinutes: 45, popularLandmarks: ["Tumbar Elementary School"] },
  { name: "Wawa", cluster: "Coastal", deliveryEstimateMinutes: 30, popularLandmarks: ["Wawa River Mouth", "Naval Base Road"] },
];
