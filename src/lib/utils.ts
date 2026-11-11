import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const locationMapping: Record<string, { lat: number; lng: number; regionName: string }> = {
  "hubli": { lat: 15.3647, lng: 75.1240, regionName: "Hubli Node (Karnataka)" },
  "hubballi": { lat: 15.3647, lng: 75.1240, regionName: "Hubli Node (Karnataka)" },
  "singhbhum": { lat: 22.45, lng: 85.82, regionName: "East Region (Jharkhand)" },
  "jharkhand": { lat: 22.45, lng: 85.82, regionName: "East Region (Jharkhand)" },
  "bangalore": { lat: 12.97, lng: 77.59, regionName: "South Node (Karnataka)" },
  "bengaluru": { lat: 12.97, lng: 77.59, regionName: "South Node (Karnataka)" },
  "karnataka": { lat: 12.97, lng: 77.59, regionName: "South Node (Karnataka)" },
  "barmer": { lat: 25.75, lng: 71.38, regionName: "West Hub (Rajasthan)" },
  "rajasthan": { lat: 25.75, lng: 71.38, regionName: "West Hub (Rajasthan)" },
  "mumbai": { lat: 19.07, lng: 72.87, regionName: "West Coast (Maharashtra)" },
  "maharashtra": { lat: 19.07, lng: 72.87, regionName: "West Coast (Maharashtra)" },
  "delhi": { lat: 28.61, lng: 77.20, regionName: "North Capital (NCR)" },
  "new delhi": { lat: 28.61, lng: 77.20, regionName: "North Capital (NCR)" },
  "ncr": { lat: 28.61, lng: 77.20, regionName: "North Capital (NCR)" },
  "chennai": { lat: 13.08, lng: 80.27, regionName: "South East Node (Tamil Nadu)" },
  "tamil nadu": { lat: 13.08, lng: 80.27, regionName: "South East Node (Tamil Nadu)" },
  "kolkata": { lat: 22.57, lng: 88.36, regionName: "East Coast (West Bengal)" },
  "west bengal": { lat: 22.57, lng: 88.36, regionName: "East Coast (West Bengal)" },
  "assam": { lat: 26.20, lng: 92.93, regionName: "Northeast Outpost (Assam)" },
  "guwahati": { lat: 26.20, lng: 92.93, regionName: "Northeast Outpost (Assam)" },
  "kerala": { lat: 10.85, lng: 76.27, regionName: "Malabar Node (Kerala)" },
  "kochi": { lat: 10.85, lng: 76.27, regionName: "Malabar Node (Kerala)" },
  "hyderabad": { lat: 17.38, lng: 78.48, regionName: "Deccan Node (Telangana)" },
  "telangana": { lat: 17.38, lng: 78.48, regionName: "Deccan Node (Telangana)" },
  "odisha": { lat: 20.95, lng: 85.09, regionName: "East Coast Hub (Odisha)" }
};

export function getGeoData(locationStr: string) {
  const normalized = (locationStr || "").toLowerCase();
  for (const [key, val] of Object.entries(locationMapping)) {
    if (normalized.includes(key)) {
      return val;
    }
  }
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
  }
  const lat = 12 + (Math.abs(hash % 16)); 
  const lng = 72 + (Math.abs((hash >> 4) % 17)); 
  return { lat, lng, regionName: `${locationStr} Node` };
}
