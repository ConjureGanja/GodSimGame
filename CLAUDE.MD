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

### Current File Structure
```
GodSim.html          # Single-file application containing all game logic
```

**Current State:** The entire game is contained in a single HTML file with embedded JavaScript and styles.

**⚠️ Note:** While functional, this monolithic structure limits maintainability, testing, and collaboration. See "Project Scaffolding & Optimization" section below for recommended refactoring.

### Recommended File Structure (Scaffolded)

```
/
├── index.html                 # Main HTML entry point
├── package.json              # Dependencies and build scripts
├── README.md                 # Project documentation
├── CLAUDE.MD                 # AI development guide
│
├── src/
│   ├── main.js              # Application entry point & initialization
│   │
│   ├── config/
│   │   ├── constants.js     # TILES, COLORS, game constants
│   │   └── settings.js      # Configurable game settings (grid size, speeds, etc.)
│   │
│   ├── core/
│   │   ├── Grid.js          # Grid management and terrain generation
│   │   ├── GameLoop.js      # Main game loop and timing
│   │   └── Renderer.js      # Canvas rendering system
│   │
│   ├── agents/
│   │   ├── Agent.js         # Base Agent class
│   │   ├── Human.js         # Human agent with AI
│   │   └── Demon.js         # Demon agent
│   │
│   ├── systems/
│   │   ├── TileSystem.js    # Tile updates (farming, fire spread, regrowth)
│   │   ├── PathfindingSystem.js  # Spatial queries (findNearest, etc.)
│   │   └── ParticleSystem.js     # Floating text and effects
│   │
│   ├── ui/
│   │   ├── HUD.js           # Stats display and controls
│   │   ├── Toolbar.js       # Tool selection sidebar
│   │   └── InputHandler.js  # Mouse/keyboard input
│   │
│   └── utils/
│       ├── spatial.js       # Distance, bounds checking utilities
│       └── helpers.js       # General utility functions
│
├── styles/
│   └── main.css            # CSS (extracted from inline styles)
│
└── dist/                   # Built/bundled files (generated)
    ├── bundle.js
    └── bundle.css
```

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

## Project Scaffolding & Optimization

### Why Refactor from Single-File?

**Current Limitations:**
- ❌ No module separation makes code hard to navigate
- ❌ Cannot unit test individual components
- ❌ Difficult for multiple developers to collaborate
- ❌ No code reusability across projects
- ❌ Hard to debug specific systems
- ❌ No build optimization (minification, tree-shaking)
- ❌ TailwindCSS loaded via CDN (slower, larger)

**Benefits of Scaffolding:**
- ✅ Clear separation of concerns
- ✅ Unit testable modules
- ✅ Better Git collaboration (fewer merge conflicts)
- ✅ Easier to add features without breaking existing code
- ✅ Can use modern build tools (Vite, Webpack, etc.)
- ✅ Enable hot module replacement for faster development
- ✅ Smaller production bundle sizes
- ✅ TypeScript migration path

### Refactoring Strategy

#### Phase 1: Extract Configuration & Constants
**Priority: High | Effort: Low**

Move all constants to separate files:
```javascript
// src/config/constants.js
export const TILES = {
  DEEP_WATER: 0,
  WATER: 1,
  // ...
};

export const COLORS = {
  0: '#0f172a',
  // ...
};

export const PASSABLE = [2, 3, 4, 10, 11, 12, 20, 21, 91, 99];
export const SLOW_PASSABLE = [1];
```

```javascript
// src/config/settings.js
export const GAME_CONFIG = {
  GRID_WIDTH: 160,
  GRID_HEIGHT: 100,
  TILE_SIZE: 8,
  SPEEDS: [1, 5, 20],
  INITIAL_HUMANS: 10,
};
```

**Impact:** Makes configuration changes easier, enables A/B testing different values.

#### Phase 2: Extract Agent Classes
**Priority: High | Effort: Medium**

```javascript
// src/agents/Agent.js
export class Agent {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    // ...
  }

  move(speedFactor) { /* ... */ }
  canWalk(x, y) { /* ... */ }
}
```

```javascript
// src/agents/Human.js
import { Agent } from './Agent.js';

export class Human extends Agent {
  constructor(x, y) {
    super(x, y, 'human');
    this.hunger = 80;
    // ...
  }

  update() { /* AI logic */ }
  draw(ctx, tileSize) { /* rendering */ }
}
```

**Impact:** Easier to add new agent types, test AI behavior in isolation.

#### Phase 3: Extract Core Systems
**Priority: Medium | Effort: Medium**

```javascript
// src/core/Grid.js
export class Grid {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.tiles = [];
  }

  generate() { /* procedural generation */ }
  getTile(x, y) { /* safe access */ }
  setTile(x, y, type) { /* safe mutation */ }
}
```

```javascript
// src/core/Renderer.js
export class Renderer {
  constructor(canvas, config) {
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.config = config;
  }

  drawGrid(grid, colors) { /* ... */ }
  drawAgents(agents, tileSize) { /* ... */ }
  clear() { /* ... */ }
}
```

**Impact:** Separation of rendering from game logic, easier to optimize rendering.

#### Phase 4: Extract Game Systems
**Priority: Medium | Effort: Medium**

```javascript
// src/systems/TileSystem.js
export class TileSystem {
  static updateTiles(grid, updateCount = 200) {
    // Random tile updates (farming, fire, regrowth)
  }

  static spreadFire(grid, x, y) { /* ... */ }
  static growFarm(grid, x, y) { /* ... */ }
  static regrowNature(grid, x, y) { /* ... */ }
}
```

```javascript
// src/systems/PathfindingSystem.js
export class PathfindingSystem {
  static findNearest(agent, agents, type, range) { /* ... */ }
  static findNearestTile(agent, grid, types, range) { /* ... */ }
  static countTilesNear(agent, grid, types, range) { /* ... */ }
}
```

**Impact:** Game logic becomes testable, easier to optimize hot paths.

#### Phase 5: Extract UI Components
**Priority: Low | Effort: Low**

```javascript
// src/ui/HUD.js
export class HUD {
  constructor(elements) {
    this.popElement = elements.population;
    this.foodElement = elements.food;
    // ...
  }

  update(gameState) {
    this.popElement.textContent = gameState.population;
    // ...
  }
}
```

```javascript
// src/ui/Toolbar.js
export class Toolbar {
  constructor(container, onToolChange) {
    this.currentTool = 'forest';
    this.onToolChange = onToolChange;
    this.setupButtons(container);
  }

  setTool(toolName) { /* ... */ }
}
```

**Impact:** UI becomes reusable, easier to add new controls.

#### Phase 6: Setup Build System
**Priority: Medium | Effort: Medium**

**Option A: Vite (Recommended)**
```json
// package.json
{
  "name": "omnisim-v3",
  "version": "3.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "tailwindcss": "^3.4.0"
  }
}
```

**Option B: Native ES Modules (No Build Step)**
- Use `<script type="module">` in HTML
- Direct browser imports
- Slower initial load, but simpler setup

### Optimization Opportunities

#### 1. Spatial Partitioning
**Problem:** Finding nearest agents/tiles scans entire arrays
**Solution:** Implement spatial hash grid or quadtree

```javascript
// Divide world into buckets for O(1) spatial queries
class SpatialHash {
  constructor(cellSize) {
    this.cellSize = cellSize;
    this.buckets = new Map();
  }

  insert(agent) {
    const key = this.getKey(agent.x, agent.y);
    if (!this.buckets.has(key)) this.buckets.set(key, []);
    this.buckets.get(key).push(agent);
  }

  findNearby(x, y, range) {
    // Only check relevant buckets
  }
}
```

**Impact:** 10-100x faster spatial queries with many agents.

#### 2. Object Pooling
**Problem:** Creating/destroying agents causes garbage collection
**Solution:** Reuse agent objects

```javascript
class AgentPool {
  constructor(AgentClass, initialSize = 100) {
    this.pool = [];
    this.active = [];

    for (let i = 0; i < initialSize; i++) {
      this.pool.push(new AgentClass(0, 0));
    }
  }

  spawn(x, y) {
    const agent = this.pool.pop() || new this.AgentClass(x, y);
    agent.reset(x, y);
    this.active.push(agent);
    return agent;
  }

  despawn(agent) {
    agent.alive = false;
    this.pool.push(agent);
  }
}
```

**Impact:** Reduces GC pauses, smoother performance at high speeds.

#### 3. Dirty Rectangle Rendering
**Problem:** Redrawing entire canvas every frame
**Solution:** Only redraw changed regions

```javascript
class DirtyRenderer {
  constructor(canvas, tileSize) {
    this.dirtyRegions = [];
  }

  markDirty(x, y, width, height) {
    this.dirtyRegions.push({ x, y, width, height });
  }

  render() {
    // Only redraw dirty regions
    this.dirtyRegions.forEach(region => {
      this.ctx.clearRect(region.x, region.y, region.width, region.height);
      this.drawRegion(region);
    });
    this.dirtyRegions = [];
  }
}
```

**Impact:** 2-5x faster rendering, especially with large grids.

#### 4. Web Workers for Simulation
**Problem:** Game loop blocks UI thread
**Solution:** Run simulation in Web Worker

```javascript
// main.js
const simWorker = new Worker('simulation-worker.js');
simWorker.postMessage({ type: 'UPDATE', speed: 5 });
simWorker.onmessage = (e) => {
  // Receive updated game state
  renderer.draw(e.data.grid, e.data.agents);
};

// simulation-worker.js
self.onmessage = (e) => {
  if (e.data.type === 'UPDATE') {
    const state = updateSimulation(gameState);
    self.postMessage(state);
  }
};
```

**Impact:** Maintains 60 FPS even at MAX speed, responsive UI.

#### 5. Tile Update Optimization
**Current:** Random tile updates (inefficient for targeted changes)
**Better:** Priority queue for tiles that need updates

```javascript
class TileUpdateQueue {
  constructor() {
    this.queue = new Set(); // Tiles that need updates
  }

  schedule(x, y) {
    this.queue.add(`${x},${y}`);
  }

  process(grid, maxUpdates = 200) {
    let count = 0;
    for (const key of this.queue) {
      if (count++ >= maxUpdates) break;
      const [x, y] = key.split(',').map(Number);
      this.updateTile(grid, x, y);
      this.queue.delete(key);
    }
  }
}
```

**Impact:** Only updates tiles that actually change, more predictable behavior.

### Testing Strategy

Once scaffolded, add unit tests:

```javascript
// tests/agents/Human.test.js
import { describe, it, expect } from 'vitest';
import { Human } from '../src/agents/Human.js';

describe('Human Agent', () => {
  it('should lose hunger over time', () => {
    const human = new Human(10, 10);
    const initialHunger = human.hunger;
    human.update();
    expect(human.hunger).toBeLessThan(initialHunger);
  });

  it('should die when hunger reaches 0', () => {
    const human = new Human(10, 10);
    human.hunger = 0.01;
    human.update();
    expect(human.alive).toBe(false);
  });
});
```

### Migration Checklist

- [ ] Setup project structure (folders)
- [ ] Initialize npm/package.json
- [ ] Extract constants and configuration
- [ ] Extract Agent base class
- [ ] Extract Human class
- [ ] Extract Demon class
- [ ] Create Grid class
- [ ] Create Renderer class
- [ ] Create TileSystem
- [ ] Create PathfindingSystem
- [ ] Create HUD class
- [ ] Create Toolbar class
- [ ] Create InputHandler
- [ ] Extract utility functions
- [ ] Setup build tool (Vite)
- [ ] Configure TailwindCSS properly
- [ ] Add unit tests
- [ ] Add integration tests
- [ ] Performance profiling
- [ ] Optimize hot paths
- [ ] Documentation updates

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

### Current State
- **Single-file application:** All changes currently go to `GodSim.html`
- **Scaffolding recommended:** See "Project Scaffolding & Optimization" section for refactoring guidance
- When refactoring is requested, follow the phase-by-phase approach outlined above

### Design Principles
- The game uses **immediate mode rendering** (full redraw each frame)
- Agent AI uses **spatial queries** for decision-making
- The simulation is designed to be **emergent** - simple rules create complex behavior
- **Balance is key:** too easy → population explosion, too hard → extinction
- **Visual feedback** (floating text) helps players understand what's happening

### When Working on Features
1. **For single-file version:** Make all changes in `GodSim.html`
2. **For scaffolded version:** Follow the module structure and update appropriate files
3. **Always test:** Ensure civilization can survive without intervention
4. **Consider performance:** Profile changes at MAX speed with 200+ agents
5. **Maintain emergence:** Don't over-engineer AI, keep behaviors simple
