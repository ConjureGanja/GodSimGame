// Game constants and tile definitions

export const TILES = {
    DEEP_WATER: 0,
    WATER: 1,
    SAND: 2,
    GRASS: 3,
    FOREST: 4,
    MOUNTAIN: 5,
    FARM_SEEDED: 10,
    FARM_GROWING: 11,
    FARM_RIPE: 12,
    HOUSE: 20,
    CASTLE: 21,
    TEMPLE: 22,
    STATUE: 23,
    SHRINE: 24,
    FIRE: 90,
    ASH: 91,
    BERRY: 99
};

export const COLORS = {
    0: '#0f172a',   // Deep water
    1: '#3b82f6',   // Water
    2: '#fde68a',   // Sand
    3: '#22c55e',   // Grass
    4: '#14532d',   // Forest
    5: '#334155',   // Mountain
    10: '#713f12',  // Farm seeded
    11: '#84cc16',  // Farm growing
    12: '#facc15',  // Farm ripe
    20: '#78350f',  // House
    21: '#94a3b8',  // Castle
    22: '#fbbf24',  // Temple
    23: '#d1d5db',  // Statue
    24: '#c084fc',  // Shrine
    90: '#ef4444',  // Fire
    91: '#525252',  // Ash
    99: '#db2777'   // Berry
};

// Tiles that agents can walk through (land)
export const PASSABLE = [2, 3, 4, 10, 11, 12, 20, 21, 22, 23, 24, 91, 99];

// Tiles that slow down agents (shallow water)
export const SLOW_PASSABLE = [1];
