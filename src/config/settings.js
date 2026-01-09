// Configurable game settings

export const GAME_CONFIG = {
    // Grid dimensions
    GRID_WIDTH: 160,
    GRID_HEIGHT: 100,
    TILE_SIZE: 8,

    // Speed settings
    SPEEDS: [1, 5, 20],
    DEFAULT_SPEED: 1,

    // Initial setup
    INITIAL_HUMANS: 10,

    // Tile update settings
    RANDOM_TILE_UPDATES_PER_TICK: 200,

    // Human lifecycle
    HUMAN_BASE_MAX_AGE: 3000,
    HUMAN_AGE_VARIANCE: 1000,
    HUMAN_BABY_AGE: 500,
    HUMAN_ELDER_OFFSET: 500,

    // Hunger system
    ADULT_HUNGER_RATE: 0.05,
    BABY_HUNGER_RATE: 0.02,

    // Resource costs
    WOOD_PER_FARM: 5,
    WOOD_PER_HOUSE: 20,
    WOOD_PER_TEMPLE_BASE: 40,
    WOOD_PER_STATUE: 50,
    WOOD_PER_SHRINE: 15,

    // Faith system
    FAITH_PER_TEMPLE_TICK: 0.05,
    FAITH_PER_SHRINE_TICK: 0.02,
    FAITH_PRAYER_BONUS: 0.1,
    FAITH_DECAY_THRESHOLD: 50,
    FAITH_DECAY_RATE: 0.05,
    FAITH_MAX: 100,

    // Divine power costs
    MASS_BLESS_COST: 20,
    DIVINE_GROWTH_COST: 15,
    HOLY_PURGE_COST: 25,

    // Karma adjustments
    KARMA_BUILD_TEMPLE: 5,
    KARMA_BUILD_STATUE: 3,
    KARMA_BUILD_SHRINE: 2,
    KARMA_PLANT_FOREST: 0.1,
    KARMA_PLANT_BERRY: 0.5,
    KARMA_SPAWN_HUMAN: 1,
    KARMA_BLESS: 2,
    KARMA_FIRE: -2,
    KARMA_SPAWN_DEMON: -3,
    KARMA_METEOR: -5,
    KARMA_MASS_BLESS: 5,
    KARMA_DIVINE_GROWTH: 3,
    KARMA_HOLY_PURGE: 4
};
