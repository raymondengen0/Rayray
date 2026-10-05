/**
 * Service catalog for the Rayray app.
 *
 * This is the single place where the business owner edits the list of
 * services customers can book or request estimates for. Add, remove, or edit
 * entries freely — every screen reads from this array.
 */
export interface Service {
  /** Stable unique id, e.g. "furniture-assembly". Used when creating bookings/estimates. */
  id: string;
  /** Display name shown in the Services list and pickers. */
  name: string;
  /** Short description shown on the service card. */
  description: string;
  /** Bullet list of what's included, shown in the service detail bubble. */
  includes: string[];
  /** Estimated price range shown to customers, e.g. "$60–$120". Free text. */
  priceRange: string;
  /** Typical duration shown to customers, e.g. "1–2 hours". Free text. */
  typicalDuration: string;
}

export const SERVICES: Service[] = [
  {
    id: "furniture-assembly",
    name: "Furniture Assembly",
    description:
      "Flat-pack furniture, shelving, TV stands and more — assembled correctly the first time. " +
      "We bring our own tools, follow the manufacturer's instructions to the letter, and make sure " +
      "every piece is level, stable, and anchored where it should be. No leftover screws, no wobbly shelves.",
    includes: [
      "IKEA and other flat-pack furniture",
      "Shelving units and bookcases",
      "TV stands and wall mounts",
      "Wall anchoring for safety",
      "Packaging removed and tidied up",
    ],
    priceRange: "$60–$120",
    typicalDuration: "1–2 hours",
  },
  {
    id: "painting-touchups",
    name: "Painting & Touch-ups",
    description:
      "Interior walls, ceilings, trim and touch-ups for a fresh look. We do the prep properly — " +
      "patching, sanding, taping, and priming — so the finish looks sharp and lasts for years, not months. " +
      "You pick the color, we handle everything else, including cleanup.",
    includes: [
      "Single rooms or whole interiors",
      "Ceilings, walls, and trim",
      "Drywall patching before paint",
      "Color touch-ups and corrections",
      "Full prep, priming, and cleanup",
    ],
    priceRange: "$150–$400",
    typicalDuration: "Half day",
  },
  {
    id: "minor-plumbing",
    name: "Minor Plumbing",
    description:
      "Leaky faucets, running toilets, caulking and small fixture swaps. These are the small jobs " +
      "that prevent big water damage — fixed right, with quality parts, and tested before we leave. " +
      "If we spot a bigger issue, we'll tell you straight and estimate it separately.",
    includes: [
      "Faucet repairs and replacements",
      "Toilet repairs and rebuilds",
      "Caulking tubs, sinks, and showers",
      "Showerheads and fixture swaps",
      "Leak checks on every visit",
    ],
    priceRange: "$90–$200",
    typicalDuration: "1–3 hours",
  },
  {
    id: "minor-electrical",
    name: "Minor Electrical",
    description:
      "Light fixtures, ceiling fans, switches, outlets and dimmers. Safe, code-conscious work for " +
      "the everyday electrical jobs around your home. Power is tested and everything is left working " +
      "before we pack up.",
    includes: [
      "Light fixture installation",
      "Ceiling fan installation",
      "Switches, dimmers, and outlets",
      "Troubleshooting flickering lights and dead outlets",
      "Safety check on every job",
    ],
    priceRange: "$90–$220",
    typicalDuration: "1–3 hours",
  },
  {
    id: "drywall-repair",
    name: "Drywall Repair",
    description:
      "Patch holes, cracks and dents — sanded, primed and ready to paint. From doorknob holes to " +
      "larger cut-outs, we blend each repair so it disappears into the wall. When we're done, you " +
      "won't be able to tell anything was ever damaged.",
    includes: [
      "Small holes, dents, and dings",
      "Large patches and cut-outs",
      "Crack repair",
      "Texture matching",
      "Sanded, primed, and paint-ready",
    ],
    priceRange: "$80–$250",
    typicalDuration: "2–4 hours",
  },
  {
    id: "yard-work-cleanup",
    name: "Yard Work & Cleanup",
    description:
      "Mowing, leaf removal, hedge trimming and general yard cleanup. One visit can take your yard " +
      "from overgrown to looked-after. We haul away the debris so you're left with nothing but a tidy yard.",
    includes: [
      "Mowing and edging",
      "Leaf and branch removal",
      "Hedge and shrub trimming",
      "Garden bed cleanup",
      "Debris hauled away",
    ],
    priceRange: "$70–$180",
    typicalDuration: "2–5 hours",
  },
  {
    id: "room-renovation",
    name: "Room Renovation",
    description:
      "Full room makeovers — flooring, trim, paint and fixtures, handled start to finish. You get one " +
      "point of contact for the whole project, with a clear plan, upfront pricing, and a timeline before " +
      "any work begins. We protect your home while we work and leave every room broom-clean.",
    includes: [
      "Flooring installation",
      "Trim, baseboards, and casing",
      "Full repaint",
      "Fixture and hardware updates",
      "Project coordination from start to finish",
    ],
    priceRange: "$800–$3,000",
    typicalDuration: "2–5 days",
  },
  {
    id: "bathroom-renovation",
    name: "Bathroom Renovation",
    description:
      "Bathroom remodels — tiling, vanities, fixtures and finishing touches. We turn tired bathrooms " +
      "into clean, modern spaces that add real value to your home. Every project starts with a detailed " +
      "written estimate, so there are no surprises halfway through.",
    includes: [
      "Tile floors and shower surrounds",
      "Vanity and countertop installation",
      "Faucet, toilet, and fixture upgrades",
      "Lighting and exhaust fans",
      "Detailed written estimate up front",
    ],
    priceRange: "$1,500–$6,000",
    typicalDuration: "3–7 days",
  },
];

/** Look up a service by id. Returns undefined for unknown ids. */
export function getServiceById(id: string): Service | undefined {
  return SERVICES.find((s) => s.id === id);
}
