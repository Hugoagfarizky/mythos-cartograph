/**
 * Procedural world generation and grid resolution upgrades for the map sandbox.
 */
import type { MapRiverPath, MapSandboxData, TerrainType } from '../../types/world';
import { fbm, hash2 } from './terrainRenderer';

export const MAP_GRID_COLS = 72;
export const MAP_GRID_ROWS = 44;

export type WorldShape = 'continent' | 'archipelago';

export const AUTO_RIVER_PREFIX = 'river-auto-';

const RIVER_NAMES = [
  'Sungai Perak',
  'Sungai Kabut',
  'Sungai Naga Tidur',
  'Sungai Embun Senja',
  'Sungai Batu Hitam',
  'Sungai Raja Tua',
  'Sungai Bulan Pucat',
  'Sungai Serigala',
];

interface GeneratedWorld {
  cells: TerrainType[];
  rivers: MapRiverPath[];
}

/**
 * Build a continent or archipelago from layered noise:
 * elevation (noise + island falloff), moisture, and a north–south temperature
 * gradient decide each cell's terrain; rivers run downhill from the highlands.
 */
export function generateWorld(
  cols: number,
  rows: number,
  shape: WorldShape,
  seed = Math.floor(Math.random() * 1e9)
): GeneratedWorld {
  const rand = (k: number) => hash2(k, 7, seed);

  // Landmass centres
  const blobs: Array<{ x: number; y: number; rx: number; ry: number }> = [];
  const count = shape === 'continent' ? 1 + Math.floor(rand(1) * 2) : 5 + Math.floor(rand(1) * 4);
  for (let i = 0; i < count; i++) {
    if (shape === 'continent') {
      blobs.push({
        x: cols * (0.32 + rand(10 + i) * 0.36),
        y: rows * (0.36 + rand(20 + i) * 0.28),
        rx: cols * (0.26 + rand(30 + i) * 0.12),
        ry: rows * (0.28 + rand(40 + i) * 0.12),
      });
    } else {
      blobs.push({
        x: cols * (0.14 + rand(10 + i) * 0.72),
        y: rows * (0.16 + rand(20 + i) * 0.68),
        rx: cols * (0.06 + rand(30 + i) * 0.09),
        ry: rows * (0.08 + rand(40 + i) * 0.12),
      });
    }
  }

  const elevation = new Float32Array(cols * rows);
  const moisture = new Float32Array(cols * rows);
  const ridge = new Float32Array(cols * rows);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let falloff = 0;
      for (const b of blobs) {
        const d = Math.hypot((c - b.x) / b.rx, (r - b.y) / b.ry);
        falloff = Math.max(falloff, 1 - d);
      }
      const n = fbm(c / 9, r / 9, seed % 100000, 4);
      let e = falloff * 0.9 + (n - 0.5) * 0.85;
      // keep a sea margin inside the map frame
      const edge = Math.min(c, r, cols - 1 - c, rows - 1 - r);
      if (edge < 3) e -= (3 - edge) * 0.25;
      elevation[r * cols + c] = e;
      moisture[r * cols + c] = fbm(c / 7, r / 7, (seed + 911) % 100000, 3);
      // ridged noise: high along thin lines, so mountains form ranges
      ridge[r * cols + c] = 1 - Math.abs(2 * fbm(c / 8, r / 8, (seed + 4271) % 100000, 4) - 1);
    }
  }

  const cells: TerrainType[] = new Array(cols * rows).fill('sea');
  for (let r = 0; r < rows; r++) {
    const lat = r / (rows - 1); // 0 = north
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      const e = elevation[i];
      const m = moisture[i];
      if (e < 0.08) {
        cells[i] = e > -0.02 ? 'shallows' : 'sea';
      } else if ((e > 0.2 && ridge[i] > 0.87) || e > 0.78) {
        cells[i] = 'mountain';
        elevation[i] += 0.3 + ridge[i] * 0.2; // rivers start high in the ranges
      } else if (lat < 0.16 + (fbm(c / 6, 3, seed % 1000, 2) - 0.5) * 0.12) {
        cells[i] = 'tundra';
      } else if (m > 0.64 && e < 0.2) {
        cells[i] = 'swamp';
      } else if (m > 0.52) {
        cells[i] = 'forest';
      } else if (m < 0.36 && lat > 0.55) {
        cells[i] = 'desert';
      } else {
        cells[i] = 'plains';
      }
    }
  }

  return { cells, rivers: traceRivers(cols, rows, elevation, cells, seed) };
}

function traceRivers(
  cols: number,
  rows: number,
  elevation: Float32Array,
  cells: TerrainType[],
  seed: number
): MapRiverPath[] {
  const sources: number[] = [];
  for (let i = 0; i < cells.length; i++) {
    if (cells[i] === 'mountain' && hash2(i, 3, seed) < 0.08) sources.push(i);
  }
  sources.sort((a, b) => elevation[b] - elevation[a]);

  const used = new Uint8Array(cols * rows);
  const rivers: MapRiverPath[] = [];
  for (const start of sources) {
    if (rivers.length >= 6) break;
    if (used[start]) continue;
    const path: number[] = [start];
    let cur = start;
    let reachedSea = false;
    for (let step = 0; step < 120; step++) {
      const c = cur % cols;
      const r = Math.floor(cur / cols);
      let best = -1;
      let bestE = elevation[cur] + 0.04; // allow small rises so rivers cross flats
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (!dr && !dc) continue;
          const nc = c + dc;
          const nr = r + dr;
          if (nc < 0 || nr < 0 || nc >= cols || nr >= rows) continue;
          const ni = nr * cols + nc;
          if (path.includes(ni)) continue;
          const e = elevation[ni] + hash2(ni, 5, seed) * 0.02;
          if (e < bestE) {
            bestE = e;
            best = ni;
          }
        }
      }
      if (best < 0) break;
      path.push(best);
      cur = best;
      if (cells[best] === 'sea' || cells[best] === 'shallows') {
        reachedSea = true;
        break;
      }
      if (used[best]) {
        reachedSea = true; // joined another river
        break;
      }
    }
    if (!reachedSea || path.length < 8) continue;
    for (const i of path) used[i] = 1;
    const points = path
      .filter((_, idx) => idx % 2 === 0 || idx === path.length - 1)
      .map((i) => ({
        x: Number(((((i % cols) + 0.5) / cols) * 100).toFixed(2)),
        y: Number((((Math.floor(i / cols) + 0.5) / rows) * 100).toFixed(2)),
      }));
    rivers.push({
      id: `${AUTO_RIVER_PREFIX}${seed}-${rivers.length}`,
      name: RIVER_NAMES[(seed + rivers.length) % RIVER_NAMES.length],
      points,
    });
  }
  return rivers;
}

/**
 * Older maps used a 36×22 grid. Resample them onto the finer grid so painting
 * and rendering get more detail; everything else uses % coordinates already.
 */
export function upgradeMapResolution(map: MapSandboxData): MapSandboxData | null {
  if (map.gridCols >= MAP_GRID_COLS && map.gridRows >= MAP_GRID_ROWS) return null;
  const cols = MAP_GRID_COLS;
  const rows = MAP_GRID_ROWS;
  const cells: TerrainType[] = new Array(cols * rows);
  for (let r = 0; r < rows; r++) {
    const or = Math.min(map.gridRows - 1, Math.floor((r * map.gridRows) / rows));
    for (let c = 0; c < cols; c++) {
      const oc = Math.min(map.gridCols - 1, Math.floor((c * map.gridCols) / cols));
      cells[r * cols + c] = map.cells[or * map.gridCols + oc] || 'sea';
    }
  }
  const factor = cols / map.gridCols;
  const leagues = Math.max(1, Math.round((map.leaguesPerCell ?? 50) / factor));
  return {
    ...map,
    gridCols: cols,
    gridRows: rows,
    cells,
    leaguesPerCell: leagues,
    scaleLabel: `1 Grid = ${leagues} Liga`,
  };
}
