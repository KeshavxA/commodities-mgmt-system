export interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    stock: number;
    unit: string;
    supplier: string;
    lastUpdated: string;
}

/** Threshold below which a product is considered "low stock" */
export const LOW_STOCK_THRESHOLD = 50;

export const sampleProducts: Product[] = [
    {
        id: "COM-001",
        name: "Crude Oil (Brent)",
        category: "Energy",
        price: 82.45,
        stock: 12000,
        unit: "barrels",
        supplier: "PetroGlobal Inc.",
        lastUpdated: "2026-03-05",
    },
    {
        id: "COM-002",
        name: "Natural Gas",
        category: "Energy",
        price: 2.78,
        stock: 8500,
        unit: "MMBtu",
        supplier: "GasLink Corp.",
        lastUpdated: "2026-03-04",
    },
    {
        id: "COM-003",
        name: "Gold (24K)",
        category: "Metals",
        price: 2045.3,
        stock: 320,
        unit: "troy oz",
        supplier: "AurumVault Ltd.",
        lastUpdated: "2026-03-06",
    },
    {
        id: "COM-004",
        name: "Silver",
        category: "Metals",
        price: 24.12,
        stock: 15000,
        unit: "troy oz",
        supplier: "SilverEdge Mining",
        lastUpdated: "2026-03-05",
    },
    {
        id: "COM-005",
        name: "Copper",
        category: "Metals",
        price: 3.89,
        stock: 42,
        unit: "metric tons",
        supplier: "CopperWire Intl.",
        lastUpdated: "2026-03-03",
    },
    {
        id: "COM-006",
        name: "Wheat (HRW)",
        category: "Agriculture",
        price: 6.25,
        stock: 28,
        unit: "bushels (×1000)",
        supplier: "GrainHarvest Co.",
        lastUpdated: "2026-03-06",
    },
    {
        id: "COM-007",
        name: "Corn",
        category: "Agriculture",
        price: 4.52,
        stock: 9500,
        unit: "bushels",
        supplier: "MidWest Agri",
        lastUpdated: "2026-03-05",
    },
    {
        id: "COM-008",
        name: "Soybeans",
        category: "Agriculture",
        price: 12.87,
        stock: 6200,
        unit: "bushels",
        supplier: "SoyPrime Farms",
        lastUpdated: "2026-03-04",
    },
    {
        id: "COM-009",
        name: "Cotton",
        category: "Agriculture",
        price: 0.82,
        stock: 18,
        unit: "lbs (×1000)",
        supplier: "TextileSouth LLC",
        lastUpdated: "2026-03-02",
    },
    {
        id: "COM-010",
        name: "Coffee (Arabica)",
        category: "Soft Commodities",
        price: 1.95,
        stock: 4800,
        unit: "lbs",
        supplier: "BeanOrigin Trade",
        lastUpdated: "2026-03-06",
    },
    {
        id: "COM-011",
        name: "Sugar #11",
        category: "Soft Commodities",
        price: 0.27,
        stock: 35,
        unit: "lbs (×1000)",
        supplier: "SweetCane Global",
        lastUpdated: "2026-03-05",
    },
    {
        id: "COM-012",
        name: "Platinum",
        category: "Metals",
        price: 920.5,
        stock: 180,
        unit: "troy oz",
        supplier: "NobleMetal Corp.",
        lastUpdated: "2026-03-04",
    },
    {
        id: "COM-013",
        name: "Palladium",
        category: "Metals",
        price: 1035.0,
        stock: 12,
        unit: "troy oz",
        supplier: "NobleMetal Corp.",
        lastUpdated: "2026-03-03",
    },
    {
        id: "COM-014",
        name: "Lumber",
        category: "Industrial",
        price: 545.0,
        stock: 2200,
        unit: "board ft",
        supplier: "TimberNorth Inc.",
        lastUpdated: "2026-03-06",
    },
    {
        id: "COM-015",
        name: "Iron Ore",
        category: "Industrial",
        price: 128.75,
        stock: 45,
        unit: "metric tons",
        supplier: "SteelSource Mining",
        lastUpdated: "2026-03-05",
    },
    {
        id: "COM-016",
        name: "Lithium Carbonate",
        category: "Industrial",
        price: 15200.0,
        stock: 8,
        unit: "metric tons",
        supplier: "BatteryMineral Co.",
        lastUpdated: "2026-03-06",
    },
    {
        id: "COM-017",
        name: "Cocoa",
        category: "Soft Commodities",
        price: 3.45,
        stock: 3100,
        unit: "metric tons",
        supplier: "WestAfrican Cocoa",
        lastUpdated: "2026-03-04",
    },
    {
        id: "COM-018",
        name: "Rice (Rough)",
        category: "Agriculture",
        price: 17.35,
        stock: 7400,
        unit: "cwt",
        supplier: "AsiaGrain Exports",
        lastUpdated: "2026-03-05",
    },
    {
        id: "COM-019",
        name: "Aluminum",
        category: "Metals",
        price: 2.31,
        stock: 30,
        unit: "metric tons",
        supplier: "LightAlloy Smelters",
        lastUpdated: "2026-03-03",
    },
    {
        id: "COM-020",
        name: "Nickel",
        category: "Metals",
        price: 16.42,
        stock: 22,
        unit: "metric tons",
        supplier: "NickelPure Refinery",
        lastUpdated: "2026-03-06",
    },
];

// ─── Computed helpers ────────────────────────────────────
export function getTotalProducts(): number {
    return sampleProducts.length;
}

export function getLowStockProducts(): Product[] {
    return sampleProducts.filter((p) => p.stock < LOW_STOCK_THRESHOLD);
}

export function getTotalValue(): number {
    return sampleProducts.reduce((sum, p) => sum + p.price * p.stock, 0);
}

export function getCategories(): string[] {
    return [...new Set(sampleProducts.map((p) => p.category))];
}
