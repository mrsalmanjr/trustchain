/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo, startTransition } from "react";

/* ========================================================================== */
/* Country Data — ISO numeric → [ISO3, name] */
/* ========================================================================== */
const CD: Record<string, [string, string]> = {
  "004": ["AFG", "Afghanistan"],
  "008": ["ALB", "Albania"],
  "012": ["DZA", "Algeria"],
  "024": ["AGO", "Angola"],
  "032": ["ARG", "Argentina"],
  "036": ["AUS", "Australia"],
  "040": ["AUT", "Austria"],
  "031": ["AZE", "Azerbaijan"],
  "050": ["BGD", "Bangladesh"],
  "056": ["BEL", "Belgium"],
  "204": ["BEN", "Benin"],
  "064": ["BTN", "Bhutan"],
  "068": ["BOL", "Bolivia"],
  "070": ["BIH", "Bosnia and Herz."],
  "072": ["BWA", "Botswana"],
  "076": ["BRA", "Brazil"],
  "096": ["BRN", "Brunei"],
  "100": ["BGR", "Bulgaria"],
  "854": ["BFA", "Burkina Faso"],
  "108": ["BDI", "Burundi"],
  "116": ["KHM", "Cambodia"],
  "120": ["CMR", "Cameroon"],
  "124": ["CAN", "Canada"],
  "140": ["CAF", "Central African Rep."],
  "148": ["TCD", "Chad"],
  "152": ["CHL", "Chile"],
  "156": ["CHN", "China"],
  "170": ["COL", "Colombia"],
  "178": ["COG", "Congo"],
  "180": ["COD", "Dem. Rep. Congo"],
  "188": ["CRI", "Costa Rica"],
  "384": ["CIV", "Côte d'Ivoire"],
  "191": ["HRV", "Croatia"],
  "192": ["CUB", "Cuba"],
  "196": ["CYP", "Cyprus"],
  "203": ["CZE", "Czechia"],
  "208": ["DNK", "Denmark"],
  "262": ["DJI", "Djibouti"],
  "214": ["DOM", "Dominican Rep."],
  "218": ["ECU", "Ecuador"],
  "818": ["EGY", "Egypt"],
  "222": ["SLV", "El Salvador"],
  "226": ["GNQ", "Eq. Guinea"],
  "232": ["ERI", "Eritrea"],
  "233": ["EST", "Estonia"],
  "748": ["SWZ", "Eswatini"],
  "231": ["ETH", "Ethiopia"],
  "242": ["FJI", "Fiji"],
  "246": ["FIN", "Finland"],
  "250": ["FRA", "France"],
  "266": ["GAB", "Gabon"],
  "270": ["GMB", "Gambia"],
  "268": ["GEO", "Georgia"],
  "276": ["DEU", "Germany"],
  "288": ["GHA", "Ghana"],
  "300": ["GRC", "Greece"],
  "304": ["GRL", "Greenland"],
  "320": ["GTM", "Guatemala"],
  "324": ["GIN", "Guinea"],
  "624": ["GNB", "Guinea-Bissau"],
  "328": ["GUY", "Guyana"],
  "332": ["HTI", "Haiti"],
  "340": ["HND", "Honduras"],
  "348": ["HUN", "Hungary"],
  "352": ["ISL", "Iceland"],
  "356": ["IND", "India"],
  "360": ["IDN", "Indonesia"],
  "364": ["IRN", "Iran"],
  "368": ["IRQ", "Iraq"],
  "372": ["IRL", "Ireland"],
  "376": ["ISR", "Israel"],
  "380": ["ITA", "Italy"],
  "388": ["JAM", "Jamaica"],
  "392": ["JPN", "Japan"],
  "400": ["JOR", "Jordan"],
  "398": ["KAZ", "Kazakhstan"],
  "404": ["KEN", "Kenya"],
  "408": ["PRK", "North Korea"],
  "410": ["KOR", "South Korea"],
  "414": ["KWT", "Kuwait"],
  "417": ["KGZ", "Kyrgyzstan"],
  "418": ["LAO", "Laos"],
  "428": ["LVA", "Latvia"],
  "422": ["LBN", "Lebanon"],
  "426": ["LSO", "Lesotho"],
  "430": ["LBR", "Liberia"],
  "434": ["LBY", "Libya"],
  "440": ["LTU", "Lithuania"],
  "442": ["LUX", "Luxembourg"],
  "450": ["MDG", "Madagascar"],
  "454": ["MWI", "Malawi"],
  "458": ["MYS", "Malaysia"],
  "466": ["MLI", "Mali"],
  "478": ["MRT", "Mauritania"],
  "484": ["MEX", "Mexico"],
  "498": ["MDA", "Moldova"],
  "496": ["MNG", "Mongolia"],
  "499": ["MNE", "Montenegro"],
  "504": ["MAR", "Morocco"],
  "508": ["MOZ", "Mozambique"],
  "104": ["MMR", "Myanmar"],
  "516": ["NAM", "Namibia"],
  "524": ["NPL", "Nepal"],
  "528": ["NLD", "Netherlands"],
  "554": ["NZL", "New Zealand"],
  "558": ["NIC", "Nicaragua"],
  "562": ["NER", "Niger"],
  "566": ["NGA", "Nigeria"],
  "578": ["NOR", "Norway"],
  "512": ["OMN", "Oman"],
  "586": ["PAK", "Pakistan"],
  "591": ["PAN", "Panama"],
  "598": ["PNG", "Papua New Guinea"],
  "600": ["PRY", "Paraguay"],
  "604": ["PER", "Peru"],
  "608": ["PHL", "Philippines"],
  "616": ["POL", "Poland"],
  "620": ["PRT", "Portugal"],
  "634": ["QAT", "Qatar"],
  "642": ["ROU", "Romania"],
  "643": ["RUS", "Russia"],
  "646": ["RWA", "Rwanda"],
  "682": ["SAU", "Saudi Arabia"],
  "686": ["SEN", "Senegal"],
  "688": ["SRB", "Serbia"],
  "694": ["SLE", "Sierra Leone"],
  "702": ["SGP", "Singapore"],
  "703": ["SVK", "Slovakia"],
  "705": ["SVN", "Slovenia"],
  "706": ["SOM", "Somalia"],
  "710": ["ZAF", "South Africa"],
  "728": ["SSD", "South Sudan"],
  "724": ["ESP", "Spain"],
  "144": ["LKA", "Sri Lanka"],
  "729": ["SDN", "Sudan"],
  "740": ["SUR", "Suriname"],
  "752": ["SWE", "Sweden"],
  "756": ["CHE", "Switzerland"],
  "760": ["SYR", "Syria"],
  "158": ["TWN", "Taiwan"],
  "762": ["TJK", "Tajikistan"],
  "834": ["TZA", "Tanzania"],
  "764": ["THA", "Thailand"],
  "626": ["TLS", "Timor-Leste"],
  "768": ["TGO", "Togo"],
  "780": ["TTO", "Trinidad and Tobago"],
  "788": ["TUN", "Tunisia"],
  "792": ["TUR", "Turkey"],
  "795": ["TKM", "Turkmenistan"],
  "800": ["UGA", "Uganda"],
  "804": ["UKR", "Ukraine"],
  "784": ["ARE", "UAE"],
  "826": ["GBR", "United Kingdom"],
  "840": ["USA", "United States"],
  "858": ["URY", "Uruguay"],
  "860": ["UZB", "Uzbekistan"],
  "862": ["VEN", "Venezuela"],
  "704": ["VNM", "Vietnam"],
  "887": ["YEM", "Yemen"],
  "894": ["ZMB", "Zambia"],
  "716": ["ZWE", "Zimbabwe"],
  "275": ["PSE", "Palestine"],
  "807": ["MKD", "North Macedonia"],
  "051": ["ARM", "Armenia"],
  "112": ["BLR", "Belarus"],
  "174": ["COM", "Comoros"],
  "084": ["BLZ", "Belize"],
  "090": ["SLB", "Solomon Islands"],
  "540": ["NCL", "New Caledonia"],
  "548": ["VUT", "Vanuatu"],
  "010": ["ATA", "Antarctica"],
  "-99": ["XKX", "Kosovo"],
};

/* ========================================================================== */
/* 3D Sphere Math */
/* ========================================================================== */
const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

interface ProjectedPoint {
  sx: number;
  sy: number;
  rx: number;
  ry: number;
  rz: number;
  v: boolean;
}

function project(
  lng: number,
  lat: number,
  lambda: number,
  phi: number,
  gamma: number,
  R: number,
  cx: number,
  cy: number
): ProjectedPoint {
  const lr = (lng - lambda) * D2R;
  const la = lat * D2R;
  const cl = Math.cos(la);

  // Unrotated unit-sphere position (post-Z-rotation by lambda)
  const x0 = cl * Math.cos(lr);
  const y0 = cl * Math.sin(lr);
  const z0 = Math.sin(la);

  // Rotate around Y by phi (tilts north pole forward)
  const cp = Math.cos(phi * D2R);
  const sp = Math.sin(phi * D2R);
  const x1 = x0 * cp + z0 * sp;
  const y1 = y0;
  const z1 = -x0 * sp + z0 * cp;

  // Rotate around X by gamma (rolls around the viewer-facing axis)
  const cg = Math.cos(gamma * D2R);
  const sg = Math.sin(gamma * D2R);
  const rx = x1;
  const ry = y1 * cg - z1 * sg;
  const rz = y1 * sg + z1 * cg;

  return {
    sx: cx + R * ry,
    sy: cy - R * rz,
    rx,
    ry,
    rz,
    v: rx >= 0,
  };
}

function unproject(
  px: number,
  py: number,
  lambda: number,
  phi: number,
  gamma: number,
  R: number,
  cx: number,
  cy: number
): { lng: number; lat: number } | null {
  const Ry = (px - cx) / R;
  const Rz = -(py - cy) / R;
  const r2 = Ry * Ry + Rz * Rz;
  if (r2 > 1) return null;

  // Inverse X rotation (roll): undo gamma in the (y, z) plane
  const cg = Math.cos(gamma * D2R);
  const sg = Math.sin(gamma * D2R);
  const y1 = Ry * cg + Rz * sg;
  const z1 = -Ry * sg + Rz * cg;

  // Visible-side depth (rotation preserves length, so y1²+z1² == r2)
  const x1 = Math.sqrt(Math.max(0, 1 - r2));

  // Inverse Y rotation: undo phi in the (x, z) plane
  const cp = Math.cos(phi * D2R);
  const sp = Math.sin(phi * D2R);
  const x0 = x1 * cp - z1 * sp;
  const y0 = y1;
  const z0 = x1 * sp + z1 * cp;

  const lat = Math.asin(clamp(z0, -1, 1)) * R2D;
  let lng = Math.atan2(y0, x0) * R2D + lambda;
  lng = (((lng + 180) % 360) + 360) % 360 - 180;
  return { lng, lat };
}

function limbIntersect(
  a: ProjectedPoint,
  b: ProjectedPoint,
  R: number,
  cx: number,
  cy: number
): ProjectedPoint | null {
  const dr = a.rx - b.rx;
  if (Math.abs(dr) < 1e-12) return null;
  const t = a.rx / dr;
  if (t < 0 || t > 1) return null;
  let ry = a.ry + t * (b.ry - a.ry);
  let rz = a.rz + t * (b.rz - a.rz);
  const norm = Math.sqrt(ry * ry + rz * rz);
  if (norm < 1e-9) return null;
  ry /= norm;
  rz /= norm;
  return {
    sx: cx + R * ry,
    sy: cy - R * rz,
    rx: 0,
    ry,
    rz,
    v: true,
  };
}

function ringToSegments(
  ring: number[][],
  lambda: number,
  phi: number,
  gamma: number,
  R: number,
  cx: number,
  cy: number
): ProjectedPoint[][] {
  const n = ring.length;
  if (n < 3) return [];
  const proj = new Array<ProjectedPoint>(n);
  let visCount = 0;
  for (let i = 0; i < n; i++) {
    const p = ring[i];
    proj[i] = project(p[0], p[1], lambda, phi, gamma, R, cx, cy);
    if (proj[i].v) visCount++;
  }
  if (visCount === 0) return [];
  if (visCount === n) return [proj.slice()];

  let startIdx = -1;
  for (let i = 0; i < n; i++) {
    if (!proj[i].v && proj[(i + 1) % n].v) {
      startIdx = i;
      break;
    }
  }

  if (startIdx === -1) return [proj.slice()];
  const segments: ProjectedPoint[][] = [];
  let cur: ProjectedPoint[] = [];

  for (let k = 0; k < n; k++) {
    const i = (startIdx + k) % n;
    const j = (startIdx + k + 1) % n;
    const A = proj[i];
    const B = proj[j];

    if (A.v && B.v) {
      cur.push(B);
    } else if (A.v && !B.v) {
      const inter = limbIntersect(A, B, R, cx, cy);
      if (inter) cur.push(inter);
      if (cur.length >= 2) segments.push(cur);
      cur = [];
    } else if (!A.v && B.v) {
      const inter = limbIntersect(A, B, R, cx, cy);
      if (inter) cur.push(inter);
      cur.push(B);
    }
  }
  return segments;
}

function segmentsToPath(segs: ProjectedPoint[][]): string {
  if (segs.length === 0) return "";
  let out = "";
  for (const seg of segs) {
    for (let i = 0; i < seg.length; i++) {
      const p = seg[i];
      out += (i === 0 ? "M" : "L") + p.sx.toFixed(1) + "," + p.sy.toFixed(1);
    }
    out += "Z";
  }
  return out;
}

function buildSphericalPath(
  type: string,
  coords: any,
  lambda: number,
  phi: number,
  gamma: number,
  R: number,
  cx: number,
  cy: number
): string {
  if (!coords) return "";
  if (type === "Polygon") {
    let out = "";
    for (const ring of coords) {
      out += segmentsToPath(ringToSegments(ring, lambda, phi, gamma, R, cx, cy));
    }
    return out;
  }
  if (type === "MultiPolygon") {
    let out = "";
    for (const poly of coords) {
      for (const ring of poly) {
        out += segmentsToPath(ringToSegments(ring, lambda, phi, gamma, R, cx, cy));
      }
    }
    return out;
  }
  return "";
}

/* ========================================================================== */
/* TopoJSON Decoder */
/* ========================================================================== */
function decArcs(t: any): number[][][] {
  const tf = t.transform;
  if (!tf) return t.arcs;
  const sx = tf.scale[0],
    sy = tf.scale[1],
    dx = tf.translate[0],
    dy = tf.translate[1];
  return t.arcs.map((a: number[][]) => {
    let x = 0,
      y = 0;
    return a.map((p: number[]) => {
      x += p[0];
      y += p[1];
      return [x * sx + dx, y * sy + dy];
    });
  });
}

function resolveRing(idx: number[], arcs: number[][][]): number[][] {
  const out: number[][] = [];
  for (const i of idx) {
    const a = i >= 0 ? arcs[i] : arcs[~i].slice().reverse();
    for (let j = out.length > 0 ? 1 : 0; j < a.length; j++) out.push(a[j]);
  }
  return out;
}

interface Feature {
  id: string;
  type: string;
  coords: any;
}

function extractFeatures(t: any): Feature[] {
  const arcs = decArcs(t);
  const gs = t.objects.countries?.geometries;
  if (!gs) return [];
  return gs.map((g: any) => {
    let c = null;
    if (g.type === "Polygon") c = g.arcs.map((r: number[]) => resolveRing(r, arcs));
    else if (g.type === "MultiPolygon")
      c = g.arcs.map((p: number[][]) => p.map((r: number[]) => resolveRing(r, arcs)));
    return {
      id: String(g.id ?? ""),
      type: g.type,
      coords: c,
    };
  });
}

/* ========================================================================== */
/* Hover hit-test (point-in-polygon over lng/lat) */
/* ========================================================================== */
function pointInRing(x: number, y: number, ring: number[][]): boolean {
  let inside = false;
  const n = ring.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = ring[i][0],
      yi = ring[i][1];
    const xj = ring[j][0],
      yj = ring[j][1];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

interface IndexedCountry {
  id: string;
  name: string;
  type: string;
  coords: any;
  rings: number[][][];
  bbox: {
    minLng: number;
    maxLng: number;
    minLat: number;
    maxLat: number;
  };
}

function findCountryAt(lng: number, lat: number, index: IndexedCountry[]): IndexedCountry | null {
  for (const c of index) {
    if (lng < c.bbox.minLng || lng > c.bbox.maxLng) continue;
    if (lat < c.bbox.minLat || lat > c.bbox.maxLat) continue;
    let inside = false;
    for (const ring of c.rings) {
      if (pointInRing(lng, lat, ring)) inside = !inside;
    }
    if (inside) return c;
  }
  return null;
}

/* ========================================================================== */
/* Utilities */
/* ========================================================================== */
function rgba(c: string, a: number): string {
  if (typeof c !== "string" || !c) return `rgba(0,0,0,${a})`;
  const s = c.trim();
  if (s.indexOf("rgb") === 0) {
    const m = s.match(/-?[\d.]+/g);
    if (m && m.length >= 3) {
      return `rgba(${m[0]},${m[1]},${m[2]},${a})`;
    }
    return `rgba(0,0,0,${a})`;
  }
  if (s.indexOf("hsl") === 0) {
    const m = s.match(/-?[\d.]+/g);
    if (m && m.length >= 3) {
      return `hsla(${m[0]},${m[1]}%,${m[2]}%,${a})`;
    }
    return `rgba(0,0,0,${a})`;
  }
  const h = s.replace("#", "");
  if (h.length !== 3 && h.length !== 6 && h.length !== 8) {
    return `rgba(0,0,0,${a})`;
  }
  const f = h.length === 3 ? h.split("").map((x) => x + x).join("") : h.slice(0, 6);
  return `rgba(${parseInt(f.slice(0, 2), 16)},${parseInt(f.slice(2, 4), 16)},${parseInt(
    f.slice(4, 6),
    16
  )},${a})`;
}

function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 1831565813) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DATA_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

/* ========================================================================== */
/* Props Interfaces */
/* ========================================================================== */
export interface Marker {
  label: string;
  description?: string;
  latitude: number;
  longitude: number;
  color?: string;
}

export interface CountryConfig {
  code: string;
  name: string;
  enabled: boolean;
}

export interface TacticalGlobe3DProps {
  markers?: Marker[];
  countries?: CountryConfig[];
  mapStyle?: {
    oceanColor?: string;
    landFill?: string;
    landStroke?: string;
    strokeWidth?: number;
    hoverColor?: string;
    disabledColor?: string;
  };
  tooltip?: {
    show?: boolean;
    background?: string;
    textColor?: string;
    borderColor?: string;
  };
  grid?: {
    show?: boolean;
    color?: string;
    opacity?: number;
  };
  layout?: {
    cornerRadius?: number;
    padding?: number;
    showBorder?: boolean;
    borderColor?: string;
  };
  interaction?: {
    autoRotate?: boolean;
    autoRotateSpeed?: number;
    rotateX?: number;
    rotateY?: number;
    rotateZ?: number;
    enableDrag?: boolean;
    dragSensitivity?: number;
    glowColor?: string;
    glowIntensity?: number;
    showStars?: boolean;
    showLabels?: boolean;
  };
}

/* ========================================================================== */
/* Default Configurations conforming to Luxury Dark Theme */
/* ========================================================================== */
const defaultMarkers: Marker[] = [
  { label: "India Validator Hub", description: "Consensus Node • Online", latitude: 20.5937, longitude: 78.9629, color: "#eab308" }, // gold
  { label: "London Router Gateway", description: "Audit Relayer • Active", latitude: 51.5074, longitude: -0.1278, color: "#a855f7" }, // purple
  { label: "New York Settlement Node", description: "Payment Pipeline • Online", latitude: 40.7128, longitude: -74.0060, color: "#eab308" },
  { label: "Tokyo Backup Relayer", description: "Cold Archive • Standby", latitude: 35.6762, longitude: 139.6503, color: "#a855f7" },
  { label: "Sydney Edge Ledger", description: "Block Producer • Active", latitude: -33.8688, longitude: 151.2093, color: "#eab308" }
];

const defaultCountries: CountryConfig[] = [
  { code: "USA", name: "United States", enabled: true },
  { code: "CAN", name: "Canada", enabled: true },
  { code: "BRA", name: "Brazil", enabled: true },
  { code: "GBR", name: "United Kingdom", enabled: true },
  { code: "FRA", name: "France", enabled: true },
  { code: "DEU", name: "Germany", enabled: true },
  { code: "UKR", name: "Ukraine", enabled: true },
  { code: "IND", name: "India", enabled: true },
  { code: "CHN", name: "China", enabled: true },
  { code: "JPN", name: "Japan", enabled: true },
  { code: "AUS", name: "Australia", enabled: true },
  { code: "ZAF", name: "South Africa", enabled: true }
];

export default function TacticalGlobe3D(props: TacticalGlobe3DProps) {
  // Merge user props with deep dark luxury theme defaults
  const mapStyleProps = useMemo(() => ({
    oceanColor: props.mapStyle?.oceanColor ?? "rgba(0, 0, 0, 0.4)",
    landFill: props.mapStyle?.landFill ?? "#130f26", // Dark violet-purple
    landStroke: props.mapStyle?.landStroke ?? "rgba(168, 85, 247, 0.25)", // Subtle purple borders
    strokeWidth: props.mapStyle?.strokeWidth ?? 0.5,
    hoverColor: props.mapStyle?.hoverColor ?? "#3b0764", // Deep rich purple hover
    disabledColor: props.mapStyle?.disabledColor ?? "#090514",
  }), [props.mapStyle]);

  const tooltipProps = useMemo(() => ({
    show: props.tooltip?.show ?? true,
    background: props.tooltip?.background ?? "rgba(10, 5, 25, 0.95)",
    textColor: props.tooltip?.textColor ?? "#ffffff",
    borderColor: props.tooltip?.borderColor ?? "rgba(168, 85, 247, 0.4)",
  }), [props.tooltip]);

  const gridProps = useMemo(() => ({
    show: props.grid?.show ?? true,
    color: props.grid?.color ?? "rgba(168, 85, 247, 0.2)",
    opacity: props.grid?.opacity ?? 0.2,
  }), [props.grid]);

  const layoutProps = useMemo(() => ({
    cornerRadius: props.layout?.cornerRadius ?? 16,
    padding: props.layout?.padding ?? 12,
    showBorder: props.layout?.showBorder ?? false,
    borderColor: props.layout?.borderColor ?? "rgba(168, 85, 247, 0.1)",
  }), [props.layout]);

  const interactionProps = useMemo(() => ({
    autoRotate: props.interaction?.autoRotate ?? true,
    autoRotateSpeed: props.interaction?.autoRotateSpeed ?? 5, // degrees/sec
    rotateX: props.interaction?.rotateX ?? -15, // tilt down slightly for better view
    rotateY: props.interaction?.rotateY ?? 20,
    rotateZ: props.interaction?.rotateZ ?? 0,
    enableDrag: props.interaction?.enableDrag ?? true,
    dragSensitivity: props.interaction?.dragSensitivity ?? 0.35,
    glowColor: props.interaction?.glowColor ?? "#7c3aed", // Luxury purple aura glow
    glowIntensity: props.interaction?.glowIntensity ?? 0.6,
    showStars: props.interaction?.showStars ?? true,
    showLabels: props.interaction?.showLabels ?? true,
  }), [props.interaction]);

  const markersProps = props.markers ?? defaultMarkers;
  const countriesProps = props.countries ?? defaultCountries;

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRefs = useRef<Map<string, SVGPathElement>>(new Map());
  const ghostPathRefs = useRef<Map<string, SVGPathElement>>(new Map());
  const markerRefs = useRef<Map<number, SVGGElement>>(new Map());
  const gridPathRef = useRef<SVGPathElement>(null);

  const [isClient, setIsClient] = useState(false);
  const [dims, setDims] = useState({ w: 450, h: 450 });
  const [feats, setFeats] = useState<Feature[] | null>(null);
  const [err, setErr] = useState(false);
  const [hM, setHM] = useState<{ screenX: number; screenY: number; label: string; description?: string } | null>(null);
  const [hC, setHC] = useState<{ screenX: number; screenY: number; name: string; code: string } | null>(null);
  const hCRef = useRef<{ screenX: number; screenY: number; name: string; code: string } | null>(null);

  const rotRef = useRef({
    lambda: interactionProps.rotateZ,
    phi: interactionProps.rotateY,
    gamma: interactionProps.rotateX,
  });

  const dragRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    startLambda: 0,
    startPhi: 0,
  });

  const lastMouseRef = useRef<{ x: number; y: number } | null>(null);
  const userInteractedRef = useRef<number>(0);

  /* SSR guard */
  useEffect(() => {
    setIsClient(true);
  }, []);

  /* Sync rotation props */
  useEffect(() => {
    if (!dragRef.current.active) {
      rotRef.current.lambda = interactionProps.rotateZ;
      rotRef.current.phi = interactionProps.rotateY;
      rotRef.current.gamma = interactionProps.rotateX;
    }
  }, [interactionProps.rotateX, interactionProps.rotateY, interactionProps.rotateZ]);

  /* Resize observer to dynamically adjust map dimensions */
  useEffect(() => {
    if (!isClient) return;
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0]?.contentRect;
      if (r && r.width > 0 && r.height > 0) {
        startTransition(() => {
          setDims({ w: r.width, h: r.height });
        });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [isClient]);

  /* Load TopoJSON Map Data */
  useEffect(() => {
    if (!isClient) return;
    let dead = false;
    fetch(DATA_URL)
      .then((r) => {
        if (!r.ok) throw new Error("TopoJSON load failed");
        return r.json();
      })
      .then((t) => {
        if (!dead) {
          startTransition(() => {
            setFeats(extractFeatures(t));
          });
        }
      })
      .catch(() => {
        if (!dead) {
          startTransition(() => {
            setErr(true);
          });
        }
      });
    return () => {
      dead = true;
    };
  }, [isClient]);

  const { w: W, h: H } = dims;
  const pad = layoutProps.padding;
  const innerW = Math.max(0, W - pad * 2);
  const innerH = Math.max(0, H - pad * 2);
  const glowMargin = 45;
  const R = Math.max(20, Math.min(innerW, innerH) / 2 - glowMargin);
  const cx = W / 2;
  const cy = H / 2;

  const countryIndex = useMemo(() => {
    if (!feats) return [];
    const out: IndexedCountry[] = [];
    let idx = 0;
    for (const f of feats) {
      const pad3 = String(f.id).padStart(3, "0");
      const e = CD[pad3];
      const a3 = e ? e[0] : (pad3 === "000" || !f.id ? `unk-${idx}` : pad3);
      const nm = e ? e[1] : a3;
      idx++;
      if (a3 === "ATA") continue; // skip Antarctica for aesthetics

      const rings: number[][][] = [];
      let minLng = Infinity,
        maxLng = -Infinity,
        minLat = Infinity,
        maxLat = -Infinity;

      const visit = (ring: number[][]) => {
        rings.push(ring);
        for (const p of ring) {
          if (p[0] < minLng) minLng = p[0];
          if (p[0] > maxLng) maxLng = p[0];
          if (p[1] < minLat) minLat = p[1];
          if (p[1] > maxLat) maxLat = p[1];
        }
      };

      if (f.type === "Polygon") {
        for (const r of f.coords) visit(r);
      } else if (f.type === "MultiPolygon") {
        for (const poly of f.coords) {
          for (const r of poly) visit(r);
        }
      }

      out.push({
        id: a3,
        name: nm,
        type: f.type,
        coords: f.coords,
        rings,
        bbox: { minLng, maxLng, minLat, maxLat },
      });
    }
    return out;
  }, [feats]);

  const cfgMap = useMemo(() => {
    const m = new Map<string, CountryConfig>();
    countriesProps.forEach((c) => m.set(c.code, c));
    return m;
  }, [countriesProps]);

  /* Generate background stars */
  const stars = useMemo(() => {
    if (!interactionProps.showStars) return [];
    const rnd = mulberry32(1234567);
    const N = 50;
    const out: { x: number; y: number; r: number; o: number }[] = [];
    for (let i = 0; i < N; i++) {
      const x = rnd() * W;
      const y = rnd() * H;
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy < (R + 15) * (R + 15)) continue;
      out.push({
        x,
        y,
        r: 0.5 + rnd() * 1.0,
        o: 0.2 + rnd() * 0.6,
      });
    }
    return out;
  }, [W, H, cx, cy, R, interactionProps.showStars]);

  /* Animation loop driving SVG paths update */
  useEffect(() => {
    if (!isClient || countryIndex.length === 0) return;
    if (W <= 0 || H <= 0 || R <= 0) return;

    let raf = 0;
    let lastTime = typeof performance !== "undefined" ? performance.now() : 0;
    const idleMs = 1200;

    const step = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      const sinceUser = now - userInteractedRef.current;

      if (interactionProps.autoRotate && !dragRef.current.active && sinceUser > idleMs) {
        rotRef.current.lambda += interactionProps.autoRotateSpeed * dt;
      }
      const { lambda, phi, gamma } = rotRef.current;

      // Update landmasses
      for (const c of countryIndex) {
        const d = buildSphericalPath(c.type, c.coords, lambda, phi, gamma, R, cx, cy);
        const p = pathRefs.current.get(c.id);
        if (p) p.setAttribute("d", d);
        const g = ghostPathRefs.current.get(c.id);
        if (g) g.setAttribute("d", d);
      }

      // Update grid lines
      if (gridProps.show && gridPathRef.current) {
        gridPathRef.current.setAttribute("d", buildGraticule(lambda, phi, gamma, R, cx, cy));
      }

      // Update node markers
      for (let i = 0; i < markersProps.length; i++) {
        const m = markersProps[i];
        const el = markerRefs.current.get(i);
        if (!el) continue;
        const p = project(m.longitude, m.latitude, lambda, phi, gamma, R, cx, cy);
        if (p.v) {
          const fade = clamp(p.rx * 4, 0, 1);
          el.style.opacity = String(fade);
          el.style.display = "";
          el.setAttribute("transform", `translate(${p.sx.toFixed(1)},${p.sy.toFixed(1)})`);
        } else {
          el.style.opacity = "0";
          el.style.display = "none";
        }
      }

      // Hit test for country under mouse cursor during idle auto-rotation
      if (lastMouseRef.current && !dragRef.current.active) {
        const m = lastMouseRef.current;
        const ll = unproject(m.x, m.y, lambda, phi, gamma, R, cx, cy);
        if (ll) {
          const c = findCountryAt(ll.lng, ll.lat, countryIndex);
          const currentHover = hCRef.current;
          if (c) {
            if (!currentHover || currentHover.code !== c.id) {
              const nextHover = { screenX: m.x, screenY: m.y, name: c.name, code: c.id };
              hCRef.current = nextHover;
              startTransition(() => {
                setHC(nextHover);
              });
            } else if (currentHover.screenX !== m.x || currentHover.screenY !== m.y) {
              const nextHover = { ...currentHover, screenX: m.x, screenY: m.y };
              hCRef.current = nextHover;
              startTransition(() => {
                setHC(nextHover);
              });
            }
          } else {
            if (currentHover) {
              hCRef.current = null;
              startTransition(() => {
                setHC(null);
              });
            }
          }
        } else {
          if (hCRef.current) {
            hCRef.current = null;
            startTransition(() => {
              setHC(null);
            });
          }
        }
      }

      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [isClient, countryIndex, markersProps, R, cx, cy, W, H, gridProps.show, interactionProps.autoRotate, interactionProps.autoRotateSpeed]);

  /* Direct DOM style update for hovered country path (extremely high performance) */
  useEffect(() => {
    for (const c of countryIndex) {
      const el = pathRefs.current.get(c.id);
      if (!el) continue;
      const cc = cfgMap.get(c.id);
      const enabled = cc ? cc.enabled : true;
      const isHov = hC?.code === c.id;
      const fill = isHov
        ? mapStyleProps.hoverColor
        : !enabled && cc
        ? mapStyleProps.disabledColor
        : mapStyleProps.landFill;
      el.setAttribute("fill", fill);
    }
  }, [countryIndex, cfgMap, hC, mapStyleProps.hoverColor, mapStyleProps.disabledColor, mapStyleProps.landFill]);

  /* Mouse/Touch Drag Handlers */
  const localMouse = (e: React.PointerEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (!interactionProps.enableDrag) return;
    const m = localMouse(e);
    const dx = m.x - cx;
    const dy = m.y - cy;
    if (dx * dx + dy * dy > (R + 10) * (R + 10)) return; // Only start drag if clicking on or near the globe disc

    dragRef.current = {
      active: true,
      startX: m.x,
      startY: m.y,
      startLambda: rotRef.current.lambda,
      startPhi: rotRef.current.phi,
    };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    hCRef.current = null;
    startTransition(() => {
      setHC(null);
      setHM(null);
    });
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const m = localMouse(e);
    lastMouseRef.current = m;
    if (dragRef.current.active) {
      const sens = interactionProps.dragSensitivity;
      const dx = m.x - dragRef.current.startX;
      const dy = m.y - dragRef.current.startY;
      rotRef.current.lambda = dragRef.current.startLambda - dx * sens;
      rotRef.current.phi = clamp(dragRef.current.startPhi + dy * sens, -85, 85);
      return;
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (dragRef.current.active) {
      dragRef.current.active = false;
      userInteractedRef.current = typeof performance !== "undefined" ? performance.now() : Date.now();
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  const onPointerLeave = () => {
    lastMouseRef.current = null;
    if (!dragRef.current.active) {
      hCRef.current = null;
      startTransition(() => {
        setHC(null);
        setHM(null);
      });
    }
  };

  const handleMarkerEnter = (i: number, e: React.MouseEvent) => {
    const m = markersProps[i];
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    startTransition(() => {
      setHM({
        screenX: e.clientX - rect.left,
        screenY: e.clientY - rect.top,
        label: m.label,
        description: m.description,
      });
    });
  };

  const handleMarkerMove = (i: number, e: React.MouseEvent) => {
    const m = markersProps[i];
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    startTransition(() => {
      setHM({
        screenX: e.clientX - rect.left,
        screenY: e.clientY - rect.top,
        label: m.label,
        description: m.description,
      });
    });
  };

  const handleMarkerLeave = () => {
    startTransition(() => {
      setHM(null);
    });
  };

  const { oceanColor, landStroke, strokeWidth } = mapStyleProps;
  const { show: showGrid, color: gridCol, opacity: gridOp } = gridProps;
  const { cornerRadius, showBorder, borderColor: bCol } = layoutProps;
  const { show: showTooltip, background: ttBg, textColor: ttCol, borderColor: ttBord } = tooltipProps;
  const { glowColor, glowIntensity, enableDrag, showLabels } = interactionProps;

  const loading = !feats && !err;
  const uid = useRef(Math.random().toString(36).slice(2, 6)).current;

  const fG = "g" + uid;
  const fL = "l" + uid;
  const gO = "o" + uid;
  const gShade = "s" + uid;
  const gAtm = "a" + uid;
  const clipDisc = "c" + uid;

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        boxSizing: "border-box",
        borderRadius: cornerRadius,
        padding: pad,
        background: "transparent",
        border: showBorder ? `1px solid ${bCol}` : "none",
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        color: "#d8ddd9",
        touchAction: "none",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
      <style>{`
        .mm-c {
          transition: fill 140ms ease, filter 140ms ease;
        }
        .mm-c:hover {
          filter: brightness(1.25) saturate(1.1);
        }
        @keyframes mm-pulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.8); opacity: 0.05; }
        }
        .mm-pulse {
          animation: mm-pulse 2.2s ease-out infinite;
          transform-box: fill-box;
          transform-origin: center;
        }
      `}</style>

      {loading && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(168, 85, 247, 0.4)",
            fontSize: 12,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          <div className="flex flex-col items-center gap-2">
            <span className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></span>
            <span>Initializing Tactical Globe...</span>
          </div>
        </div>
      )}

      {err && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 6,
            color: rgba("#ff6b6b", 0.7),
            fontSize: 11,
          }}
        >
          <span>Map data unavailable</span>
          <span style={{ fontSize: 9, opacity: 0.6 }}>Check network connectivity</span>
        </div>
      )}

      <svg
        ref={svgRef}
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={onPointerLeave}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          cursor: enableDrag ? (dragRef.current.active ? "grabbing" : "grab") : "default",
          willChange: "transform",
          transform: "translateZ(0)",
          backfaceVisibility: "hidden",
        }}
      >
        <defs>
          <filter id={fG} x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id={fL} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feColorMatrix
              in="b"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.2 0"
            />
          </filter>
          <radialGradient id={gShade} cx="38%" cy="32%" r="78%">
            <stop offset="0%" stopColor={rgba("#ffffff", 0.15)} />
            <stop offset="50%" stopColor={rgba("#ffffff", 0)} />
            <stop offset="88%" stopColor={rgba("#000000", 0.4)} />
            <stop offset="100%" stopColor={rgba("#000000", 0.65)} />
          </radialGradient>
          <radialGradient id={gAtm} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={rgba(glowColor, 0)} />
            <stop offset={`${(R / Math.max(R + 32, 1) * 100).toFixed(1)}%`} stopColor={rgba(glowColor, 0)} />
            <stop offset={`${((R + 6) / Math.max(R + 32, 1) * 100).toFixed(1)}%`} stopColor={rgba(glowColor, 0.45 * glowIntensity)} />
            <stop offset="100%" stopColor={rgba(glowColor, 0)} />
          </radialGradient>
          <linearGradient id={gO} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(24, 15, 50, 0.4)" />
            <stop offset="50%" stopColor="rgba(10, 5, 25, 0.1)" />
            <stop offset="100%" stopColor="rgba(5, 2, 15, 0.3)" />
          </linearGradient>
          <clipPath id={clipDisc}>
            <circle cx={cx} cy={cy} r={R} />
          </clipPath>
        </defs>

        {/* Stars background */}
        {interactionProps.showStars &&
          stars.map((s, i) => (
            <circle key={`star-${i}`} cx={s.x.toFixed(1)} cy={s.y.toFixed(1)} r={s.r.toFixed(2)} fill={rgba("#ffffff", s.o)} />
          ))}

        {/* Atmosphere glow ring */}
        <circle cx={cx} cy={cy} r={R + 32} fill={`url(#${gAtm})`} pointerEvents="none" filter={`url(#${fG})`} />

        {/* Ocean body */}
        <circle cx={cx} cy={cy} r={R} fill={oceanColor} />
        <circle cx={cx} cy={cy} r={R} fill={`url(#${gO})`} />

        {/* Clipped hemisphere contents */}
        <g clipPath={`url(#${clipDisc})`}>
          {/* Shadowed land mass copy for outline depth effect */}
          <g opacity={0.12} filter={`url(#${fL})`}>
            {countryIndex.map((c) => (
              <path
                key={`g-${c.id}`}
                ref={(el) => {
                  if (el) ghostPathRefs.current.set(c.id, el);
                  else ghostPathRefs.current.delete(c.id);
                }}
                fill={mapStyleProps.landFill}
                stroke="none"
                pointerEvents="none"
              />
            ))}
          </g>

          {/* Graticule grid */}
          {showGrid && (
            <path
              ref={gridPathRef}
              fill="none"
              stroke={gridCol}
              strokeWidth={0.5}
              strokeOpacity={gridOp}
              vectorEffect="non-scaling-stroke"
              pointerEvents="none"
            />
          )}

          {/* Main country landmass paths */}
          {countryIndex.map((c) => {
            const cc = cfgMap.get(c.id);
            const enabled = cc ? cc.enabled : true;
            const initialFill = !enabled && cc ? mapStyleProps.disabledColor : mapStyleProps.landFill;
            return (
              <path
                key={c.id}
                ref={(el) => {
                  if (el) pathRefs.current.set(c.id, el);
                  else pathRefs.current.delete(c.id);
                }}
                className="mm-c"
                fill={initialFill}
                stroke={landStroke}
                strokeWidth={strokeWidth}
                vectorEffect="non-scaling-stroke"
                style={{ cursor: "default" }}
              />
            );
          })}
        </g>

        {/* Sphere shading Overlay */}
        <circle cx={cx} cy={cy} r={R} fill={`url(#${gShade})`} pointerEvents="none" />
        <circle cx={cx} cy={cy} r={R} fill="none" stroke={rgba(glowColor, 0.4 * glowIntensity)} strokeWidth={1} pointerEvents="none" />

        {/* Pulsing validator node markers */}
        {markersProps.map((m, i) => {
          const sz = 4.5;
          const col = m.color || "#eab308";
          return (
            <g
              key={`marker-${i}-${m.label}`}
              ref={(el) => {
                if (el) markerRefs.current.set(i, el);
                else markerRefs.current.delete(i);
              }}
              style={{ cursor: "pointer", opacity: 0 }}
              onMouseEnter={(e) => handleMarkerEnter(i, e)}
              onMouseMove={(e) => handleMarkerMove(i, e)}
              onMouseLeave={handleMarkerLeave}
            >
              <circle className="mm-pulse" r={sz * 1.5} fill={rgba(col, 0.6)} />
              <circle r={sz * 2.3} fill={rgba(col, 0.15)} />
              <circle r={sz} fill={col} />
              <circle cx={-sz * 0.3} cy={-sz * 0.3} r={sz * 0.3} fill="rgba(255, 255, 255, 0.6)" />
              {showLabels && m.label && (
                <text
                  x={sz * 2.5}
                  y={sz * 0.3}
                  fill="#ffffff"
                  fontSize={9}
                  fontWeight={600}
                  letterSpacing="0.04em"
                  stroke="rgba(10, 5, 25, 0.9)"
                  strokeWidth={2.5}
                  strokeLinejoin="round"
                  paintOrder="stroke"
                  style={{ pointerEvents: "none", userSelect: "none" }}
                >
                  {m.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Tooltip for Markers */}
      {showTooltip && hM && (
        <div
          style={{
            position: "absolute",
            left: hM.screenX + 14,
            top: hM.screenY - 14,
            transform: "translateY(-100%)",
            background: ttBg,
            color: ttCol,
            border: `1px solid ${ttBord}`,
            borderRadius: 8,
            padding: "6px 10px",
            pointerEvents: "none",
            zIndex: 30,
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            maxWidth: 200,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.03em", whiteSpace: "nowrap" }}>
            {hM.label}
          </div>
          {hM.description && (
            <div style={{ fontSize: 9, opacity: 0.7, letterSpacing: "0.01em", lineHeight: 1.3 }}>
              {hM.description}
            </div>
          )}
        </div>
      )}

      {/* Tooltip for Countries */}
      {showTooltip && !hM && hC && (
        <div
          style={{
            position: "absolute",
            left: hC.screenX + 14,
            top: hC.screenY - 10,
            transform: "translateY(-100%)",
            background: ttBg,
            color: ttCol,
            border: `1px solid ${ttBord}`,
            borderRadius: 8,
            padding: "5px 8px",
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.02em",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            zIndex: 30,
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
          }}
        >
          {hC.name}
        </div>
      )}
    </div>
  );
}

/* ========================================================================== */
/* Graticule Generator */
/* ========================================================================== */
function buildGraticule(
  lambda: number,
  phi: number,
  gamma: number,
  R: number,
  cx: number,
  cy: number
): string {
  let out = "";
  // Parallels (latitudes)
  for (let lat = -60; lat <= 60; lat += 30) {
    let started = false;
    let prev: ProjectedPoint | null = null;
    for (let lng = -180; lng <= 180; lng += 5) {
      const p = project(lng, lat, lambda, phi, gamma, R, cx, cy);
      if (p.v) {
        if (!started || (prev && !prev.v)) {
          out += `M${p.sx.toFixed(1)},${p.sy.toFixed(1)}`;
          started = true;
        } else {
          out += `L${p.sx.toFixed(1)},${p.sy.toFixed(1)}`;
        }
      }
      prev = p;
    }
  }
  // Meridians (longitudes)
  for (let lng = -180; lng < 180; lng += 30) {
    let started = false;
    let prev: ProjectedPoint | null = null;
    for (let lat = -80; lat <= 80; lat += 5) {
      const p = project(lng, lat, lambda, phi, gamma, R, cx, cy);
      if (p.v) {
        if (!started || (prev && !prev.v)) {
          out += `M${p.sx.toFixed(1)},${p.sy.toFixed(1)}`;
          started = true;
        } else {
          out += `L${p.sx.toFixed(1)},${p.sy.toFixed(1)}`;
        }
      }
      prev = p;
    }
  }
  return out;
}
