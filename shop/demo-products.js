/*
 * DLS Bathroom Shop framework data
 * --------------------------------
 * These are demonstration product TYPES, not supplier products.
 * No supplier images, wording, codes or prices are included.
 *
 * When approved data arrives, each real product can use the same shape:
 * {
 *   id, supplier, sku, name, category, roomGroup, description,
 *   finishes[], dimensions, price, image, sourceUrl, tags[],
 *   recommendedFor[], requires[], active
 * }
 */
window.DLS_SHOP_PRODUCTS = [
  {
    id: "demo-close-coupled-wc",
    category: "Toilets",
    roomGroup: "toilet",
    name: "Close-coupled toilet",
    sku: "Supplier code pending",
    description: "A familiar complete toilet format with the cistern positioned directly behind the pan.",
    finishes: ["Gloss White"],
    dimensions: "Multiple sizes will be available",
    tags: ["toilet", "wc", "cistern", "seat", "close coupled", "standard"],
    recommendedFor: ["shower-room", "bathroom-bath", "bath-and-shower", "cloakroom"],
    requires: ["toilet-seat"],
    demo: true
  },
  {
    id: "demo-back-to-wall-wc",
    category: "Toilets",
    roomGroup: "toilet",
    name: "Back-to-wall toilet",
    sku: "Supplier code pending",
    description: "A streamlined pan designed to conceal the cistern inside furniture or a boxed wall.",
    finishes: ["Gloss White"],
    dimensions: "Standard and comfort-height options",
    tags: ["toilet", "wc", "back to wall", "concealed cistern", "comfort height"],
    recommendedFor: ["shower-room", "bathroom-bath", "bath-and-shower", "cloakroom"],
    requires: ["concealed-cistern", "flush-plate", "toilet-seat"],
    demo: true
  },
  {
    id: "demo-wall-hung-wc",
    category: "Toilets",
    roomGroup: "toilet",
    name: "Wall-hung toilet",
    sku: "Supplier code pending",
    description: "A floor-clearing toilet suited to clean contemporary rooms and easy floor maintenance.",
    finishes: ["Gloss White"],
    dimensions: "Compact and standard projections",
    tags: ["toilet", "wc", "wall hung", "floating", "frame", "modern"],
    recommendedFor: ["shower-room", "bathroom-bath", "bath-and-shower", "cloakroom"],
    requires: ["wc-frame", "concealed-cistern", "flush-plate", "toilet-seat"],
    demo: true
  },
  {
    id: "demo-compact-vanity",
    category: "Furniture & Basins",
    roomGroup: "basin",
    name: "Compact vanity and basin",
    sku: "Supplier code pending",
    description: "A space-saving basin unit designed for cloakrooms and smaller bathrooms.",
    finishes: ["Warm Oak", "Matte White", "Matte Black", "Reed Green"],
    dimensions: "400–500 mm widths",
    tags: ["small vanity", "basin", "sink", "cloakroom", "compact", "storage"],
    recommendedFor: ["shower-room", "bathroom-bath", "cloakroom"],
    requires: ["basin-tap", "basin-waste", "basin-trap"],
    demo: true
  },
  {
    id: "demo-600-vanity",
    category: "Furniture & Basins",
    roomGroup: "basin",
    name: "600 mm wall-hung vanity",
    sku: "Supplier code pending",
    description: "A practical single-basin unit with useful storage and a clear floor underneath.",
    finishes: ["Warm Oak", "Matte White", "Matte Black", "Stone Grey", "Reed Green"],
    dimensions: "Approximately 600 mm wide",
    tags: ["vanity", "basin", "sink", "600", "wall hung", "drawers", "storage"],
    recommendedFor: ["shower-room", "bathroom-bath", "bath-and-shower"],
    requires: ["basin-tap", "basin-waste", "basin-trap"],
    demo: true
  },
  {
    id: "demo-800-vanity",
    category: "Furniture & Basins",
    roomGroup: "basin",
    name: "800 mm feature vanity",
    sku: "Supplier code pending",
    description: "A wider statement unit offering increased worktop space and storage.",
    finishes: ["Warm Oak", "Matte White", "Stone Grey", "Reed Green"],
    dimensions: "Approximately 800 mm wide",
    tags: ["vanity", "basin", "sink", "800", "feature", "drawers", "storage"],
    recommendedFor: ["bathroom-bath", "bath-and-shower"],
    requires: ["basin-tap", "basin-waste", "basin-trap"],
    demo: true
  },
  {
    id: "demo-single-ended-bath",
    category: "Baths",
    roomGroup: "bath",
    name: "Single-ended fitted bath",
    sku: "Supplier code pending",
    description: "A versatile straight bath suited to bathing or a shower-over-bath layout.",
    finishes: ["Gloss White"],
    dimensions: "1500–1800 mm lengths",
    tags: ["bath", "straight bath", "single ended", "1700", "fitted", "shower bath"],
    recommendedFor: ["bathroom-bath"],
    requires: ["bath-panel", "bath-waste", "bath-filler"],
    demo: true
  },
  {
    id: "demo-freestanding-bath",
    category: "Baths",
    roomGroup: "bath",
    name: "Freestanding feature bath",
    sku: "Supplier code pending",
    description: "A statement bath for larger rooms with space around the exterior.",
    finishes: ["Gloss White", "Matte White"],
    dimensions: "1500–1800 mm lengths",
    tags: ["bath", "freestanding", "feature", "luxury", "oval", "fluted"],
    recommendedFor: ["bathroom-bath", "bath-and-shower"],
    requires: ["bath-waste", "bath-filler"],
    demo: true
  },
  {
    id: "demo-shower-bath",
    category: "Baths",
    roomGroup: "bath",
    name: "Shower bath",
    sku: "Supplier code pending",
    description: "A shaped bath that creates extra standing room for a combined bath and shower.",
    finishes: ["Gloss White"],
    dimensions: "Left- and right-handed options",
    tags: ["bath", "shower bath", "p shape", "l shape", "screen", "small room"],
    recommendedFor: ["bathroom-bath"],
    requires: ["bath-panel", "bath-waste", "bath-filler", "bath-screen", "shower-set"],
    demo: true
  },
  {
    id: "demo-riser-shower",
    category: "Showers",
    roomGroup: "shower",
    name: "Thermostatic riser shower",
    sku: "Supplier code pending",
    description: "An exposed shower combining an overhead rain head with a separate handset.",
    finishes: ["Chrome", "Matte Black", "Brushed Brass", "Gunmetal", "Brushed Bronze", "Brushed Nickel"],
    dimensions: "Adjustable-height models available",
    tags: ["shower", "riser", "rain head", "handset", "thermostatic", "exposed"],
    recommendedFor: ["shower-room", "bathroom-bath", "bath-and-shower"],
    requires: ["shower-screen-or-enclosure", "shower-tray-or-wetroom"],
    demo: true
  },
  {
    id: "demo-concealed-shower",
    category: "Showers",
    roomGroup: "shower",
    name: "Concealed shower set",
    sku: "Supplier code pending",
    description: "A built-in shower valve with separate controls, head and optional handset.",
    finishes: ["Chrome", "Matte Black", "Brushed Brass", "Gunmetal", "Brushed Bronze", "Brushed Nickel"],
    dimensions: "One-, two- and three-outlet controls",
    tags: ["shower", "concealed", "valve", "head", "handset", "built in"],
    recommendedFor: ["shower-room", "bath-and-shower"],
    requires: ["shower-head", "shower-handset", "shower-screen-or-enclosure", "shower-tray-or-wetroom"],
    demo: true
  },
  {
    id: "demo-wetroom-panel",
    category: "Screens & Trays",
    roomGroup: "screen",
    name: "Walk-in wetroom panel",
    sku: "Supplier code pending",
    description: "A simple fixed glass panel for an open walk-in shower area.",
    finishes: ["Chrome", "Matte Black", "Brushed Brass", "Gunmetal", "Brushed Bronze", "Brushed Nickel"],
    dimensions: "700–1400 mm panel widths",
    tags: ["screen", "wetroom", "walk in", "glass", "panel", "shower screen"],
    recommendedFor: ["shower-room", "bath-and-shower"],
    requires: ["support-arm", "shower-tray-or-wetroom"],
    demo: true
  },
  {
    id: "demo-shower-enclosure",
    category: "Screens & Trays",
    roomGroup: "screen",
    name: "Hinged shower enclosure",
    sku: "Supplier code pending",
    description: "An enclosed shower with hinged access, available in several shapes and sizes.",
    finishes: ["Chrome", "Matte Black", "Brushed Brass"],
    dimensions: "Square, rectangular and quadrant sizes",
    tags: ["shower", "enclosure", "door", "hinged", "quadrant", "glass"],
    recommendedFor: ["shower-room", "bath-and-shower"],
    requires: ["shower-tray"],
    demo: true
  },
  {
    id: "demo-shower-tray",
    category: "Screens & Trays",
    roomGroup: "screen",
    name: "Low-profile shower tray",
    sku: "Supplier code pending",
    description: "A slim shower base sized to match a compatible enclosure or wetroom screen.",
    finishes: ["White", "Stone Grey"],
    dimensions: "Multiple square and rectangular sizes",
    tags: ["shower tray", "tray", "waste", "low profile", "square", "rectangular"],
    recommendedFor: ["shower-room", "bath-and-shower"],
    requires: ["tray-waste", "shower-screen-or-enclosure"],
    demo: true
  },
  {
    id: "demo-basin-mixer",
    category: "Taps & Wastes",
    roomGroup: "tap",
    name: "Basin mixer tap",
    sku: "Supplier code pending",
    description: "A single-hole mixer available in finishes that can coordinate across the room.",
    finishes: ["Chrome", "Matte Black", "Brushed Brass", "Gunmetal", "Brushed Bronze", "Brushed Nickel"],
    dimensions: "Mini, standard and tall options",
    tags: ["tap", "basin tap", "mixer", "brassware", "tall tap", "cloakroom tap"],
    recommendedFor: ["shower-room", "bathroom-bath", "bath-and-shower", "cloakroom"],
    requires: ["basin-waste"],
    demo: true
  },
  {
    id: "demo-bath-filler",
    category: "Taps & Wastes",
    roomGroup: "tap",
    name: "Bath filler",
    sku: "Supplier code pending",
    description: "A bath filling option coordinated with the selected basin tap and room finish.",
    finishes: ["Chrome", "Matte Black", "Brushed Brass", "Gunmetal", "Brushed Bronze", "Brushed Nickel"],
    dimensions: "Deck-, wall- and overflow-mounted options",
    tags: ["bath tap", "bath filler", "brassware", "wall mounted", "overflow filler"],
    recommendedFor: ["bathroom-bath", "bath-and-shower"],
    requires: ["bath-waste"],
    demo: true
  },
  {
    id: "demo-led-mirror",
    category: "Mirrors & Cabinets",
    roomGroup: "mirror",
    name: "Illuminated bathroom mirror",
    sku: "Supplier code pending",
    description: "A wall mirror with integrated lighting and optional demister or charging features.",
    finishes: ["Frameless", "Matte Black", "Brushed Brass", "Gunmetal", "Brushed Bronze"],
    dimensions: "Round, pill and rectangular sizes",
    tags: ["mirror", "led mirror", "light", "demister", "round", "pill"],
    recommendedFor: ["shower-room", "bathroom-bath", "bath-and-shower", "cloakroom"],
    requires: [],
    demo: true
  },
  {
    id: "demo-mirror-cabinet",
    category: "Mirrors & Cabinets",
    roomGroup: "mirror",
    name: "Mirrored storage cabinet",
    sku: "Supplier code pending",
    description: "A mirror and hidden storage solution for everyday bathroom items.",
    finishes: ["Aluminium", "Matte Black", "Brushed Brass"],
    dimensions: "500–1200 mm widths",
    tags: ["mirror", "cabinet", "storage", "shaver socket", "led", "recessed"],
    recommendedFor: ["shower-room", "bathroom-bath", "bath-and-shower"],
    requires: [],
    demo: true
  },
  {
    id: "demo-heated-rail",
    category: "Heating",
    roomGroup: "heating",
    name: "Heated towel rail",
    sku: "Supplier code pending",
    description: "A practical bathroom radiator available in finishes that coordinate with the brassware.",
    finishes: ["Chrome", "Matte Black", "Brushed Brass", "Gunmetal", "Brushed Bronze", "Brushed Nickel"],
    dimensions: "Compact to full-height sizes",
    tags: ["radiator", "heated towel rail", "heating", "towel warmer", "electric"],
    recommendedFor: ["shower-room", "bathroom-bath", "bath-and-shower", "cloakroom"],
    requires: ["radiator-valves-or-element"],
    demo: true
  },
  {
    id: "demo-niche",
    category: "Finishing Details",
    roomGroup: "details",
    name: "Recessed shower niche",
    sku: "Supplier code pending",
    description: "Built-in storage for bottles, available with matching metal trims and optional lighting.",
    finishes: ["Tile finish", "Matte Black", "Brushed Brass", "Gunmetal", "Brushed Bronze", "Brushed Nickel"],
    dimensions: "Single and double-height options",
    tags: ["niche", "shelf", "shower storage", "led", "trim", "recessed"],
    recommendedFor: ["shower-room", "bathroom-bath", "bath-and-shower"],
    requires: ["waterproofing-and-trim"],
    demo: true
  },
  {
    id: "demo-accessory-set",
    category: "Finishing Details",
    roomGroup: "details",
    name: "Matching accessory set",
    sku: "Supplier code pending",
    description: "Coordinated toilet-roll holder, robe hook, towel ring and shelf options.",
    finishes: ["Chrome", "Matte Black", "Brushed Brass", "Gunmetal", "Brushed Bronze", "Brushed Nickel"],
    dimensions: "Choose individual pieces or a set",
    tags: ["accessories", "toilet roll holder", "robe hook", "towel ring", "shelf"],
    recommendedFor: ["shower-room", "bathroom-bath", "bath-and-shower", "cloakroom"],
    requires: [],
    demo: true
  }
];

window.DLS_SHOP_CATEGORIES = [
  "All products",
  "Toilets",
  "Furniture & Basins",
  "Baths",
  "Showers",
  "Screens & Trays",
  "Taps & Wastes",
  "Mirrors & Cabinets",
  "Heating",
  "Finishing Details"
];

window.DLS_BUILDER_STEPS = [
  {
    id: "room",
    title: "What type of room are you planning?",
    help: "This creates the right product checklist. You can still add or remove anything later.",
    options: [
      { value: "shower-room", label: "Shower room", description: "A shower without a bath", icon: "▱" },
      { value: "bathroom-bath", label: "Bathroom with bath", description: "Bath or shower-over-bath", icon: "◡" },
      { value: "bath-and-shower", label: "Bath and separate shower", description: "A larger complete bathroom", icon: "◇" },
      { value: "cloakroom", label: "Cloakroom", description: "Toilet and compact basin", icon: "○" }
    ]
  },
  {
    id: "size",
    title: "Roughly how much space do you have?",
    help: "Exact measurements come later. This simply prioritises sensible product sizes.",
    options: [
      { value: "Compact", label: "Compact", description: "Cloakroom or tight bathroom", icon: "S" },
      { value: "Standard", label: "Standard", description: "Typical UK bathroom", icon: "M" },
      { value: "Large", label: "Large", description: "Room for larger features", icon: "L" },
      { value: "Help me decide", label: "Help me decide", description: "DLS can check my dimensions", icon: "?" }
    ]
  },
  {
    id: "style",
    title: "Which overall look feels most like you?",
    help: "We will use this to order recommendations. It does not lock you into a collection.",
    options: [
      { value: "Contemporary", label: "Contemporary", description: "Clean lines and uncluttered shapes", icon: "□" },
      { value: "Warm spa", label: "Warm spa", description: "Soft stone, wood and gentle light", icon: "◌" },
      { value: "Classic", label: "Modern classic", description: "Timeless shapes with fresh finishes", icon: "◇" },
      { value: "Statement", label: "Statement", description: "Bold colour, texture or feature pieces", icon: "✦" },
      { value: "Help me decide", label: "Show me ideas", description: "Compare complete DLS looks", icon: "?" }
    ]
  },
  {
    id: "finish",
    title: "Choose the metal finish to carry through the room.",
    help: "Matching taps, shower controls, wastes, trims and accessories creates a calmer result.",
    options: [
      { value: "Chrome", label: "Chrome", description: "Bright, versatile and familiar", swatch: "#c9ced1" },
      { value: "Matte Black", label: "Matte black", description: "Strong modern contrast", swatch: "#232526" },
      { value: "Brushed Brass", label: "Brushed brass", description: "Warm gold-toned finish", swatch: "#c49a4c" },
      { value: "Gunmetal", label: "Gunmetal", description: "Deep grey metallic finish", swatch: "#5c6162" },
      { value: "Brushed Bronze", label: "Brushed bronze", description: "Warm, architectural brown metal", swatch: "#8a6849" },
      { value: "Brushed Nickel", label: "Brushed nickel", description: "Soft champagne-silver finish", swatch: "#aaa292" },
      { value: "Help me decide", label: "Help me decide", description: "Show compatible choices later", swatch: "linear-gradient(135deg,#c9ced1,#232526,#c49a4c,#8a6849)" }
    ]
  },
  {
    id: "budget",
    title: "What product budget should we design around?",
    help: "This is for products only and helps avoid showing options that are not relevant.",
    options: [
      { value: "Under £3,000", label: "Under £3,000", description: "Focused, practical selection", icon: "£" },
      { value: "£3,000–£5,000", label: "£3,000–£5,000", description: "More finish and furniture choice", icon: "££" },
      { value: "£5,000–£8,000", label: "£5,000–£8,000", description: "Premium features and finishes", icon: "£££" },
      { value: "£8,000+", label: "£8,000+", description: "Statement products and full flexibility", icon: "✦" },
      { value: "Help me decide", label: "Not sure yet", description: "Build the room first", icon: "?" }
    ]
  }
];
