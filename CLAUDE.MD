# OmniSim v3: Rise of Civilizations

## Project Overview

OmniSim v3 is a browser-based god simulation game where players interact with a living world populated by autonomous agents. Players can shape terrain, spawn life, and watch civilizations develop organically through emergent behavior.

**Tech Stack:**
- Vanilla JavaScript (ES6+)
- HTML5 Canvas for rendering
- TailwindCSS for UI styling
- No external game frameworks or dependencies

**Game Type:** Real-time simulation sandbox with god-game mechanics

## Core Architecture

### File Structure
```
GodSim.html          # Single-file application containing all game logic
```

The entire game is contained in a single HTML file with embedded JavaScript and styles.

### Main Components

#### 1. Grid System (`grid`)
- 2D array representing the world (160x100 tiles)
- Each tile contains a terrain/object type (water, grass, forest, house, etc.)
- Tile size: 8 pixels
- Uses procedural generation for island creation

**Tile Types (`TILES` constant):**
- **Terrain:** DEEP_WATER, WATER, SAND, GRASS, FOREST, MOUNTAIN
- **Agriculture:** FARM_SEEDED, FARM_GROWING, FARM_RIPE
- **Buildings:** HOUSE, CASTLE
- **Effects:** FIRE, ASH, BERRY

#### 2. Agent System (`agents`)
Autonomous entities that move and interact with the world.

**Agent Types:**
- **Human:** Primary civilization unit with complex AI
- **Demon:** Hostile enemy unit that hunts humans

**Base Agent Class:**
- Position tracking (x, y with sub-pixel precision)
- Velocity (dx, dy)
- Collision detection with terrain
- Movement physics (friction, wandering)

#### 3. Simulation Loop
```javascript
requestAnimationFrame(gameLoop) → {
  updateSimulation() // Physics & AI (runs speed × per frame)
  draw()             // Render
  updateUI()         // Update HUD
}
```

## Game Systems

### Human AI Behavior (Priority Order)

1. **Flee** - Run from demons within 10 tile radius
2. **Eat** - Search for food when hunger < 50
   - Seeks BERRY or FARM_RIPE within 30 tiles
   - Consumes on contact
3. **Work** (Adults only)
   - **Gather wood** from forests (up to 20 wood)
   - **Build farms** near houses (costs 5 wood)
   - **Build houses** on grass (costs 20 wood, max 3 per 15 tile radius)
   - **Migrate** outward when area too crowded
4. **Reproduce** - If hunger > 80, near house, 0.5% chance/tick

### Life Cycle System

**Human Stages:**
- **Baby** (age 0-500): Slower movement, lower hunger rate, stays near houses
- **Adult** (age 500-maxAge-500): Full capabilities, can work and reproduce
- **Elder** (maxAge-500 to maxAge): Reduced activity, different appearance
- **Death:** Old age (3000-4000 ticks) or starvation (hunger ≤ 0)

### Resource Economy

**Hunger System:**
- Decreases by 0.05/tick (adults) or 0.02/tick (babies)
- Death at hunger ≤ 0
- Restored to 100 when eating

**Wood Economy:**
- Gathered from forests (+10 per harvest)
- Used for farms (-5) and houses (-20)
- Encourages sustainable forest management

### Environmental Systems

**Farming:**
- Progression: SEEDED → GROWING → RIPE
- Each stage transitions with 1% probability on random tick
- Humans can create and harvest farms

**Fire Mechanics:**
- Spreads to adjacent FOREST and HOUSE tiles (20% chance)
- Burns down to ASH
- Demons can ignite tiles while walking

**Nature Regrowth:**
- ASH → GRASS (1% chance)
- GRASS → FOREST (0.1% chance)
- GRASS → BERRY (0.1% chance)

## Player Tools

### Nature Tools
- **Forest (🌲):** Plant trees
- **Water (💧):** Create water bodies
- **Land (🏜️):** Place grass/sand
- **Mountain (⛰️):** Build impassable walls

### Life Tools
- **Human (🧑):** Spawn human agent
- **Berry (🍒):** Place food sources
- **Bless (✨):** Heal/feed humans in radius, regrow plants

### Chaos Tools
- **Demon (👹):** Spawn hostile demon
- **Fire (🔥):** Start fires
- **Meteor (☄️):** Devastate 5x5 area

## Code Patterns & Conventions

### Finding & Pathfinding
```javascript
findNearest(agent, type, range)      // Find closest agent of type
findNearestTile(agent, types, range) // Find closest tile matching type
countTilesNear(agent, types, range)  // Count matching tiles in radius
```

### Agent Movement
```javascript
walkTo(targetX, targetY)  // Accelerate toward target
move(speedFactor)         // Apply velocity with collision detection
```

### Spatial Utilities
```javascript
dist(a, b)           // Euclidean distance between two entities
getNeighbors(x, y)   // Get random adjacent tile
```

## Performance Considerations

1. **Random Tile Updates:** Only 200 random tiles updated per tick (instead of all 16,000)
2. **Speed Multiplier:** Game runs 1x, 5x, or 20x (MAX) speed
3. **Agent Filtering:** Dead agents removed from array each tick
4. **Canvas Optimization:** No alpha channel, pixelated rendering

## UI & Controls

### HUD Elements
- Population count (living humans)
- Food availability (berries + ripe farms)
- Houses built
- Year counter (tick/60)

### Simulation Controls
- **Pause/Resume:** Freeze simulation
- **Speed:** 1x, 5x, MAX (20x)
- **Reset:** Regenerate map, spawn 20 humans at center

## Development Guidelines

### When Adding Features

1. **Agent Behavior:** Add to priority hierarchy in `update()` method
2. **New Tile Types:**
   - Add to `TILES` constant
   - Define color in `COLORS`
   - Update `PASSABLE` if walkable
3. **New Tools:** Add button in sidebar + handler in `useTool()`
4. **UI Stats:** Update `updateUI()` function

### Testing Scenarios

- **Survival:** Can civilization sustain itself without intervention?
- **Migration:** Do humans expand outward naturally?
- **Recovery:** Can civilization recover from disasters (fire, meteors, demons)?
- **Resource Management:** Is wood/food economy balanced?

### Common Pitfalls

- **Array Bounds:** Always check `x >= 0 && x < W && y >= 0 && y < H`
- **Agent Cleanup:** Ensure dead agents are marked `alive = false`
- **Rate Limiting:** Use `tick % N === 0` for expensive operations
- **Collision:** Check tile passability before movement

## Future Enhancement Ideas

- Technology progression (stone → bronze → iron age)
- Multiple civilizations with diplomacy/war
- Trade routes between settlements
- Disease and health systems
- Weather and seasons
- More building types (farms, walls, markets)
- Save/load functionality
- Procedural world generation options

## Performance Metrics

- **Grid Size:** 160×100 = 16,000 tiles
- **Target FPS:** 60 (requestAnimationFrame)
- **Simulation Speed:** 1-20 ticks per frame
- **Typical Agent Count:** 10-200 humans

## Key Files Reference

- **Main File:** `GodSim.html` - Contains entire application

## Notes for AI Development

- This is a single-file application - all changes go to `GodSim.html`
- The game uses immediate mode rendering (full redraw each frame)
- Agent AI uses spatial queries for decision-making
- The simulation is designed to be emergent - simple rules create complex behavior
- Balance is key: too easy → population explosion, too hard → extinction
- Visual feedback (floating text) helps players understand what's happening
