/**
 * Service catalog for the Rayray app.
 *
 * This is the single place where the business owner edits the list of
 * services customers can book or request quotes for. Add, remove, or edit
 * entries freely — every screen reads from this array.
 */
export interface Service {
  /** Stable unique id, e.g. "furniture-assembly". Used when creating bookings/quotes. */
  id: string;
  /** Display name shown in the Services list and pickers. */
  name: string;
  /** Short description shown on the service card. */
  description: string;
  /** Estimated price range shown to customers, e.g. "$60–$120". Free text. */
  priceRange: string;
  /** Typical duration shown to customers, e.g. "1–2 hours". Free text. */
  typicalDuration: string;
}

export const SERVICES: Service[] = [
  {
    id: "furniture-assembly",
    name: "Furniture Assembly",
    description: "Flat-pack furniture, shelving, TV stands and more — assembled correctly the first time.",
    priceRange: "$60–$120",
    typicalDuration: "1–2 hours",
  },
  {
    id: "painting-touchups",
    name: "Painting & Touch-ups",
    description: "Interior walls, ceilings, trim and touch-ups for a fresh look.",
    priceRange: "$150–$400",
    typicalDuration: "Half day",
  },
  {
    id: "minor-plumbing",
    name: "Minor Plumbing",
    description: "Leaky faucets, running toilets, caulking and small fixture swaps.",
    priceRange: "$90–$200",
    typicalDuration: "1–3 hours",
  },
  {
    id: "minor-electrical",
    name: "Minor Electrical",
    description: "Light fixtures, ceiling fans, switches, outlets and dimmers.",
    priceRange: "$90–$220",
    typicalDuration: "1–3 hours",
  },
  {
    id: "drywall-repair",
    name: "Drywall Repair",
    description: "Patch holes, cracks and dents — sanded, primed and ready to paint.",
    priceRange: "$80–$250",
    typicalDuration: "2–4 hours",
  },
  {
    id: "yard-work-cleanup",
    name: "Yard Work & Cleanup",
    description: "Mowing, leaf removal, hedge trimming and general yard cleanup.",
    priceRange: "$70–$180",
    typicalDuration: "2–5 hours",
  },
  {
    id: "room-renovation",
    name: "Room Renovation",
    description: "Full room makeovers — flooring, trim, paint and fixtures, handled start to finish.",
    priceRange: "$800–$3,000",
    typicalDuration: "2–5 days",
  },
  {
    id: "bathroom-renovation",
    name: "Bathroom Renovation",
    description: "Bathroom remodels — tiling, vanities, fixtures and finishing touches.",
    priceRange: "$1,500–$6,000",
    typicalDuration: "3–7 days",
  },
];

/** Look up a service by id. Returns undefined for unknown ids. */
export function getServiceById(id: string): Service | undefined {
  return SERVICES.find((s) => s.id === id);
}
