/**
 * Hand-drawn medieval map renderer.
 *
 * The map is stored as a coarse grid of terrain cells. To look drawn rather than
 * tiled, every layer is derived from smooth fields sampled between cell centres
 * and roughened with fractal noise:
 *   - land/sea is a bilinear field + noise, traced with marching squares into an
 *     inked coastline and concentric offshore ripple lines;
 *   - biome colours are soft watercolour washes blended across borders;
 *   - mountains, hills, trees, dunes, reeds and snow are scattered on a jittered
 *     grid (never aligned to cells) and drawn back-to-front.
 *
 * All randomness is deterministic, so the same cells always draw the same map.
 */
import type { TerrainType } from '../../types/world';

export interface TerrainGrid {
  gridCols: number;
  gridRows: number;
  cells: TerrainType[];
}

// ---------------------------------------------------------------------------
// Deterministic noise
// ---------------------------------------------------------------------------
export function hash2(x: number, y: number, seed: number): number {
  let h =
    (Math.imul(x | 0, 374761393) +
      Math.imul(y | 0, 668265263) +
      Math.imul(seed | 0, 1442695041)) |
    0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

function smooth(t: number): number {
  return t * t * (3 - 2 * t);
}

function valueNoise(x: number, y: number, seed: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const tx = smooth(x - xi);
  const ty = smooth(y - yi);
  const a = hash2(xi, yi, seed);
  const b = hash2(xi + 1, yi, seed);
  const c = hash2(xi, yi + 1, seed);
  const d = hash2(xi + 1, yi + 1, seed);
  return a + (b - a) * tx + (c - a) * ty + (a - b - c + d) * tx * ty;
}

/** Fractal value noise in [0, 1]. */
export function fbm(x: number, y: number, seed: number, octaves = 3): number {
  let sum = 0;
  let amp = 0.5;
  let freq = 1;
  let norm = 0;
  for (let o = 0; o < octaves; o++) {
    sum += valueNoise(x * freq, y * freq, seed + o * 101) * amp;
    norm += amp;
    amp *= 0.5;
    freq *= 2.03;
  }
  return sum / norm;
}

// ---------------------------------------------------------------------------
// Cell fields
// ---------------------------------------------------------------------------
const LAND_TYPES = ['plains', 'forest', 'mountain', 'desert', 'swamp', 'tundra'] as const;
type LandType = (typeof LAND_TYPES)[number];

const BIOME_RGB: Record<LandType, [number, number, number]> = {
  plains: [239, 227, 198],
  forest: [190, 198, 158],
  mountain: [217, 199, 165],
  desert: [236, 212, 162],
  swamp: [186, 191, 162],
  tundra: [245, 242, 234],
};

export function isLandTerrain(t: TerrainType): boolean {
  return t !== 'sea' && t !== 'shallows';
}

class CellField {
  readonly data: Float32Array;
  constructor(
    readonly cols: number,
    readonly rows: number
  ) {
    this.data = new Float32Array(cols * rows);
  }

  /** Bilinear sample with cell centres at (c + 0.5, r + 0.5), in cell units. */
  sample(gx: number, gy: number): number {
    const u = Math.min(Math.max(gx - 0.5, 0), this.cols - 1);
    const v = Math.min(Math.max(gy - 0.5, 0), this.rows - 1);
    const c0 = Math.floor(u);
    const r0 = Math.floor(v);
    const c1 = Math.min(c0 + 1, this.cols - 1);
    const r1 = Math.min(r0 + 1, this.rows - 1);
    const tx = u - c0;
    const ty = v - r0;
    const d = this.data;
    const a = d[r0 * this.cols + c0];
    const b = d[r0 * this.cols + c1];
    const c = d[r1 * this.cols + c0];
    const e = d[r1 * this.cols + c1];
    return a + (b - a) * tx + (c - a) * ty + (a - b - c + e) * tx * ty;
  }
}

/** Separable box blur, repeated `passes` times (edges clamp). */
function blurField(src: CellField, radius: number, passes: number): CellField {
  const { cols, rows } = src;
  let cur = Float32Array.from(src.data);
  const tmp = new Float32Array(cols * rows);
  for (let p = 0; p < passes; p++) {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let sum = 0;
        for (let k = -radius; k <= radius; k++) {
          const cc = Math.min(cols - 1, Math.max(0, c + k));
          sum += cur[r * cols + cc];
        }
        tmp[r * cols + c] = sum / (radius * 2 + 1);
      }
    }
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let sum = 0;
        for (let k = -radius; k <= radius; k++) {
          const rr = Math.min(rows - 1, Math.max(0, r + k));
          sum += tmp[rr * cols + c];
        }
        cur[r * cols + c] = sum / (radius * 2 + 1);
      }
    }
  }
  const out = new CellField(cols, rows);
  out.data.set(cur);
  return out;
}

interface Fields {
  land: CellField;
  /** lightly blurred land, mixed in to round off stair-stepped diagonals */
  landSoft: CellField;
  /** widely blurred land, a cheap distance-from-coast for ripple rings */
  landFar: CellField;
  shallows: CellField;
  biome: Record<LandType, CellField>;
}

function buildFields(grid: TerrainGrid): Fields {
  const { gridCols: cols, gridRows: rows, cells } = grid;
  const land = new CellField(cols, rows);
  const shallows = new CellField(cols, rows);
  const biome = {} as Record<LandType, CellField>;
  for (const t of LAND_TYPES) biome[t] = new CellField(cols, rows);
  for (let i = 0; i < cols * rows; i++) {
    const t = cells[i] || 'sea';
    if (isLandTerrain(t)) {
      land.data[i] = 1;
      biome[t as LandType].data[i] = 1;
    } else if (t === 'shallows') {
      shallows.data[i] = 1;
    }
  }
  return {
    land,
    landSoft: blurField(land, 1, 1),
    landFar: blurField(land, 2, 2),
    shallows,
    biome,
  };
}

// ---------------------------------------------------------------------------
// Sampled raster of the land field (shared by fills, coast and icons)
// ---------------------------------------------------------------------------
const STEP = 3; // logical px between samples

interface LandRaster {
  gw: number;
  gh: number;
  /** land value with fine coastal roughness, threshold 0.5 = coast */
  coast: Float32Array;
  /** smoother land value used for the offshore ripple rings */
  rings: Float32Array;
}

function buildLandRaster(fields: Fields, W: number, H: number, cellW: number, cellH: number): LandRaster {
  const gw = Math.ceil(W / STEP) + 1;
  const gh = Math.ceil(H / STEP) + 1;
  const coast = new Float32Array(gw * gh);
  const rings = new Float32Array(gw * gh);
  for (let j = 0; j < gh; j++) {
    const y = j * STEP;
    for (let i = 0; i < gw; i++) {
      const x = i * STEP;
      const gx = x / cellW;
      const gy = y / cellH;
      const base = 0.5 * fields.land.sample(gx, gy) + 0.5 * fields.landSoft.sample(gx, gy);
      const broad = (fbm(x / 34, y / 34, 7, 3) - 0.5) * 0.42;
      coast[j * gw + i] = base + broad + (fbm(x / 9, y / 9, 19, 2) - 0.5) * 0.14;
      rings[j * gw + i] = fields.landFar.sample(gx, gy) + broad * 0.35;
    }
  }
  return { gw, gh, coast, rings };
}

function rasterAt(r: LandRaster, arr: Float32Array, x: number, y: number): number {
  const i = Math.min(Math.max(Math.round(x / STEP), 0), r.gw - 1);
  const j = Math.min(Math.max(Math.round(y / STEP), 0), r.gh - 1);
  return arr[j * r.gw + i];
}

// ---------------------------------------------------------------------------
// Marching squares: add contour segments for `threshold` to the current path
// ---------------------------------------------------------------------------
function traceContour(
  ctx: CanvasRenderingContext2D,
  r: LandRaster,
  values: Float32Array,
  threshold: number
): void {
  const { gw, gh } = r;
  const lerp = (a: number, b: number) => {
    const d = b - a;
    return d === 0 ? 0.5 : (threshold - a) / d;
  };
  for (let j = 0; j < gh - 1; j++) {
    for (let i = 0; i < gw - 1; i++) {
      const tl = values[j * gw + i];
      const tr = values[j * gw + i + 1];
      const br = values[(j + 1) * gw + i + 1];
      const bl = values[(j + 1) * gw + i];
      const idx =
        (tl >= threshold ? 8 : 0) |
        (tr >= threshold ? 4 : 0) |
        (br >= threshold ? 2 : 0) |
        (bl >= threshold ? 1 : 0);
      if (idx === 0 || idx === 15) continue;
      const x0 = i * STEP;
      const y0 = j * STEP;
      // edge points: top, right, bottom, left
      const pt = (edge: number): [number, number] => {
        switch (edge) {
          case 0:
            return [x0 + lerp(tl, tr) * STEP, y0];
          case 1:
            return [x0 + STEP, y0 + lerp(tr, br) * STEP];
          case 2:
            return [x0 + lerp(bl, br) * STEP, y0 + STEP];
          default:
            return [x0, y0 + lerp(tl, bl) * STEP];
        }
      };
      const seg = (a: number, b: number) => {
        const p = pt(a);
        const q = pt(b);
        ctx.moveTo(p[0], p[1]);
        ctx.lineTo(q[0], q[1]);
      };
      switch (idx) {
        case 1: case 14: seg(3, 2); break;
        case 2: case 13: seg(2, 1); break;
        case 3: case 12: seg(3, 1); break;
        case 4: case 11: seg(0, 1); break;
        case 5: seg(3, 0); seg(2, 1); break;
        case 6: case 9: seg(0, 2); break;
        case 7: case 8: seg(3, 0); break;
        case 10: seg(0, 1); seg(3, 2); break;
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Public: base layer (sea, shallows, land washes, coastline, ripples)
// ---------------------------------------------------------------------------
export interface TerrainModel {
  fields: Fields;
  raster: LandRaster;
  cellW: number;
  cellH: number;
}

export function buildTerrainModel(grid: TerrainGrid, W: number, H: number): TerrainModel {
  const cellW = W / grid.gridCols;
  const cellH = H / grid.gridRows;
  const fields = buildFields(grid);
  const raster = buildLandRaster(fields, W, H, cellW, cellH);
  return { fields, raster, cellW, cellH };
}

export function hasAnyLand(grid: TerrainGrid): boolean {
  return grid.cells.some((t) => isLandTerrain(t));
}

export function drawTerrainBase(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  model: TerrainModel
): void {
  const { fields, raster, cellW, cellH } = model;

  // 1. Parchment sea with vignette
  const seaGrad = ctx.createRadialGradient(W * 0.5, H * 0.5, W * 0.1, W * 0.5, H * 0.5, W * 0.72);
  seaGrad.addColorStop(0, '#E2D3B3');
  seaGrad.addColorStop(0.7, '#D6C39E');
  seaGrad.addColorStop(1, '#BFA87E');
  ctx.fillStyle = seaGrad;
  ctx.fillRect(0, 0, W, H);

  for (let i = 0; i < 320; i++) {
    const rx = hash2(i, 1, 501) * W;
    const ry = hash2(i, 2, 501) * H;
    const rad = 1 + hash2(i, 3, 501) * 3.5;
    ctx.fillStyle = i % 3 === 0 ? 'rgba(120, 88, 50, 0.05)' : 'rgba(255, 248, 231, 0.08)';
    ctx.beginPath();
    ctx.arc(rx, ry, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  // 2. Offshore ripple rings (classic concentric coastal lines)
  const rings: Array<[number, number, number]> = [
    [0.3, 0.5, 1.15],
    [0.2, 0.36, 1.0],
    [0.12, 0.25, 0.9],
    [0.06, 0.16, 0.8],
  ];
  ctx.save();
  ctx.lineCap = 'round';
  for (const [threshold, alpha, lw] of rings) {
    ctx.strokeStyle = `rgba(74, 56, 34, ${alpha})`;
    ctx.lineWidth = lw;
    ctx.beginPath();
    traceContour(ctx, raster, raster.rings, threshold);
    ctx.stroke();
  }
  ctx.restore();

  // 3. Engraved wave strokes in open water
  ctx.save();
  ctx.strokeStyle = 'rgba(89, 69, 45, 0.28)';
  ctx.lineWidth = 0.9;
  ctx.lineCap = 'round';
  ctx.beginPath();
  const waveSpacingX = 46;
  const waveSpacingY = 30;
  for (let gy = 0; gy * waveSpacingY < H; gy++) {
    for (let gx = 0; gx * waveSpacingX < W; gx++) {
      if (hash2(gx, gy, 77) < 0.45) continue;
      const sx = (gx + 0.15 + hash2(gx, gy, 78) * 0.7) * waveSpacingX;
      const sy = (gy + 0.15 + hash2(gx, gy, 79) * 0.7) * waveSpacingY;
      if (sx < 40 || sx > W - 40 || sy < 40 || sy > H - 40) continue;
      if (rasterAt(raster, raster.rings, sx, sy) > 0.03) continue;
      const len = 6 + hash2(gx, gy, 80) * 6;
      ctx.moveTo(sx - len, sy);
      ctx.quadraticCurveTo(sx - len / 2, sy - 2.6, sx, sy);
      ctx.quadraticCurveTo(sx + len / 2, sy + 2.6, sx + len, sy);
      ctx.moveTo(sx - len * 0.55, sy + 4);
      ctx.quadraticCurveTo(sx, sy + 2.2, sx + len * 0.55, sy + 4);
    }
  }
  ctx.stroke();
  ctx.restore();

  // 4. Land and shallows as a soft watercolour raster
  const { gw, gh } = raster;
  const img = new ImageData(gw, gh);
  const px = img.data;
  for (let j = 0; j < gh; j++) {
    const y = j * STEP;
    const gy = y / cellH;
    for (let i = 0; i < gw; i++) {
      const x = i * STEP;
      const gx = x / cellW;
      const v = raster.coast[j * gw + i];
      const o = (j * gw + i) * 4;
      if (v >= 0.47) {
        let wsum = 0;
        let rr = 0;
        let gg = 0;
        let bb = 0;
        for (let k = 0; k < LAND_TYPES.length; k++) {
          const t = LAND_TYPES[k];
          let w = fields.biome[t].sample(gx, gy);
          if (w <= 0) continue;
          w += (fbm(x / 26 + k * 13.7, y / 26, 303, 2) - 0.5) * 0.55;
          if (w <= 0) continue;
          w = w * w;
          const c = BIOME_RGB[t];
          rr += c[0] * w;
          gg += c[1] * w;
          bb += c[2] * w;
          wsum += w;
        }
        if (wsum < 0.0001) {
          const c = BIOME_RGB.plains;
          rr = c[0];
          gg = c[1];
          bb = c[2];
        } else {
          rr /= wsum;
          gg /= wsum;
          bb /= wsum;
        }
        // paper mottling and a darker band along the coast
        let shade = 1 + (fbm(x / 70, y / 70, 404, 3) - 0.5) * 0.1;
        if (v < 0.64) shade -= (0.64 - v) * 0.32;
        const a = Math.min(1, (v - 0.47) / 0.06);
        px[o] = rr * shade;
        px[o + 1] = gg * shade;
        px[o + 2] = bb * shade;
        px[o + 3] = 255 * a;
      } else {
        const s = fields.shallows.sample(gx, gy);
        const ring = raster.rings[j * gw + i];
        const shallow = Math.max(s * 0.9, ring > 0.22 ? (ring - 0.22) * 1.3 : 0);
        if (shallow > 0.02) {
          px[o] = 233;
          px[o + 1] = 222;
          px[o + 2] = 197;
          px[o + 3] = Math.min(150, shallow * 170);
        }
      }
    }
  }
  const off = document.createElement('canvas');
  off.width = gw;
  off.height = gh;
  off.getContext('2d')?.putImageData(img, 0, 0);
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(off, -STEP / 2, -STEP / 2, gw * STEP, gh * STEP);
  ctx.restore();

  // 5. Inked coastline
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#2B1E12';
  ctx.lineWidth = 1.9;
  ctx.beginPath();
  traceContour(ctx, raster, raster.coast, 0.5);
  ctx.stroke();
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Public: icon layer (mountains, hills, forests, dunes, marsh, snow, grass)
// ---------------------------------------------------------------------------
type Icon = { y: number; draw: () => void };

const INK = '#2A1D11';

export function drawTerrainIcons(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  model: TerrainModel
): void {
  const { fields, raster, cellW, cellH } = model;
  const icons: Icon[] = [];

  const landAt = (x: number, y: number) => rasterAt(raster, raster.coast, x, y);
  const weight = (t: LandType, x: number, y: number, salt: number) =>
    fields.biome[t].sample(x / cellW, y / cellH) + (fbm(x / 26 + salt, y / 26, 303, 2) - 0.5) * 0.55;

  const scatter = (
    spacing: number,
    salt: number,
    visit: (x: number, y: number, rnd: (k: number) => number) => void
  ) => {
    const cols = Math.ceil(W / spacing);
    const rows = Math.ceil(H / spacing);
    for (let gy = 0; gy < rows; gy++) {
      for (let gx = 0; gx < cols; gx++) {
        const rnd = (k: number) => hash2(gx, gy, salt * 31 + k);
        const x = (gx + 0.1 + rnd(1) * 0.8) * spacing;
        const y = (gy + 0.1 + rnd(2) * 0.8) * spacing;
        if (x < 34 || x > W - 34 || y < 34 || y > H - 34) continue;
        visit(x, y, rnd);
      }
    }
  };

  // Mountains and foothills
  scatter(19, 1, (x, y, rnd) => {
    const w = weight('mountain', x, y, 2 * 13.7);
    if (w < 0.32 || landAt(x, y) < 0.62) return;
    if (w >= 0.6) {
      const strength = Math.min(1, (w - 0.6) / 0.4);
      const h = 10 + strength * 12 + rnd(3) * 5;
      const half = h * (0.72 + rnd(4) * 0.25);
      icons.push({ y, draw: () => drawMountain(ctx, x, y, half, h, rnd) });
    } else if (rnd(5) < 0.75) {
      const h = 4 + rnd(3) * 3;
      const half = 7 + rnd(4) * 4;
      icons.push({ y, draw: () => drawHill(ctx, x, y, half, h) });
    }
  });

  // Forest canopy
  scatter(9, 2, (x, y, rnd) => {
    const w = weight('forest', x, y, 1 * 13.7);
    if (w < 0.5 || landAt(x, y) < 0.6) return;
    if (weight('mountain', x, y, 2 * 13.7) > 0.58) return;
    const cold = weight('tundra', x, y, 5 * 13.7) > 0.15 || y < H * 0.22;
    const r = 3.4 + rnd(3) * 1.9;
    if (cold || rnd(4) < 0.12) {
      icons.push({ y, draw: () => drawConifer(ctx, x, y, r) });
    } else {
      icons.push({ y, draw: () => drawTree(ctx, x, y, r) });
    }
  });

  // Swamp reeds
  scatter(15, 3, (x, y, rnd) => {
    if (weight('swamp', x, y, 4 * 13.7) < 0.5 || landAt(x, y) < 0.6) return;
    if (rnd(3) < 0.25) return;
    icons.push({ y, draw: () => drawReeds(ctx, x, y, rnd) });
  });

  // Desert dunes
  scatter(24, 4, (x, y, rnd) => {
    if (weight('desert', x, y, 3 * 13.7) < 0.5 || landAt(x, y) < 0.62) return;
    icons.push({ y, draw: () => drawDune(ctx, x, y, rnd) });
  });

  // Tundra snow hummocks and a few icy peaks
  scatter(21, 5, (x, y, rnd) => {
    if (weight('tundra', x, y, 5 * 13.7) < 0.5 || landAt(x, y) < 0.6) return;
    if (rnd(3) < 0.18) {
      const h = 9 + rnd(4) * 5;
      icons.push({ y, draw: () => drawMountain(ctx, x, y, h * 0.8, h, rnd, true) });
    } else {
      icons.push({ y, draw: () => drawSnow(ctx, x, y, rnd) });
    }
  });

  // Sparse grass tufts on open plains
  scatter(28, 6, (x, y, rnd) => {
    if (weight('plains', x, y, 0) < 0.55 || landAt(x, y) < 0.62) return;
    if (rnd(3) < 0.55) return;
    icons.push({ y, draw: () => drawGrass(ctx, x, y, rnd) });
  });

  icons.sort((a, b) => a.y - b.y);
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const icon of icons) icon.draw();
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Symbol drawings
// ---------------------------------------------------------------------------
function drawMountain(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  half: number,
  h: number,
  rnd: (k: number) => number,
  icy = false
): void {
  const peakX = x + (rnd(6) - 0.5) * half * 0.35;
  const peakY = y - h;
  const lx = x - half;
  const rx = x + half;
  const lMidX = x - half * (0.45 + rnd(7) * 0.15);
  const lMidY = y - h * (0.42 + rnd(8) * 0.2);
  const rMidX = x + half * (0.4 + rnd(9) * 0.15);
  const rMidY = y - h * (0.45 + rnd(10) * 0.2);

  // ground shadow
  ctx.fillStyle = 'rgba(70, 50, 28, 0.16)';
  ctx.beginPath();
  ctx.ellipse(x + half * 0.25, y + 0.5, half * 1.05, 2.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // lit body
  ctx.fillStyle = icy ? '#F7F4EC' : '#F1E5C8';
  ctx.beginPath();
  ctx.moveTo(lx, y);
  ctx.lineTo(lMidX, lMidY);
  ctx.lineTo(peakX, peakY);
  ctx.lineTo(rMidX, rMidY);
  ctx.lineTo(rx, y);
  ctx.closePath();
  ctx.fill();

  // shaded east face
  ctx.fillStyle = icy ? 'rgba(96, 110, 120, 0.32)' : 'rgba(92, 64, 34, 0.38)';
  ctx.beginPath();
  ctx.moveTo(peakX, peakY);
  ctx.lineTo(rMidX, rMidY);
  ctx.lineTo(rx, y);
  ctx.lineTo(x + half * 0.12, y);
  ctx.quadraticCurveTo(peakX - half * 0.08, y - h * 0.45, peakX, peakY);
  ctx.fill();

  // hatching on the shaded face
  ctx.strokeStyle = 'rgba(42, 29, 17, 0.55)';
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  const lines = h > 16 ? 4 : 3;
  for (let k = 1; k <= lines; k++) {
    const t = k / (lines + 1);
    const sx = peakX + (rMidX - peakX) * t * 1.1;
    const sy = peakY + (y - peakY) * t;
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + half * 0.32, sy + h * 0.2);
  }
  ctx.stroke();

  // snow cap on tall peaks
  if (icy || h > 18) {
    ctx.fillStyle = '#FFFDF7';
    ctx.beginPath();
    ctx.moveTo(peakX, peakY);
    ctx.lineTo(peakX - half * 0.22, peakY + h * 0.26);
    ctx.lineTo(peakX - half * 0.06, peakY + h * 0.2);
    ctx.lineTo(peakX + half * 0.05, peakY + h * 0.3);
    ctx.lineTo(peakX + half * 0.2, peakY + h * 0.22);
    ctx.closePath();
    ctx.fill();
  }

  // ink ridgelines
  ctx.strokeStyle = INK;
  ctx.lineWidth = h > 16 ? 1.35 : 1.15;
  ctx.beginPath();
  ctx.moveTo(lx, y);
  ctx.lineTo(lMidX, lMidY);
  ctx.lineTo(peakX, peakY);
  ctx.lineTo(rMidX, rMidY);
  ctx.lineTo(rx, y);
  ctx.moveTo(peakX, peakY);
  ctx.quadraticCurveTo(peakX - half * 0.08, y - h * 0.45, x + half * 0.12, y - 0.5);
  ctx.stroke();
}

function drawHill(ctx: CanvasRenderingContext2D, x: number, y: number, half: number, h: number): void {
  ctx.fillStyle = 'rgba(241, 229, 200, 0.9)';
  ctx.beginPath();
  ctx.moveTo(x - half, y);
  ctx.quadraticCurveTo(x, y - h * 2, x + half, y);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(42, 29, 17, 0.45)';
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(x + half * 0.25, y - h * 0.7);
  ctx.lineTo(x + half * 0.55, y - h * 0.1);
  ctx.moveTo(x + half * 0.5, y - h * 0.55);
  ctx.lineTo(x + half * 0.75, y - h * 0.05);
  ctx.stroke();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.05;
  ctx.beginPath();
  ctx.moveTo(x - half, y);
  ctx.quadraticCurveTo(x, y - h * 2, x + half, y);
  ctx.stroke();
}

function drawTree(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
  const cy = y - r;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(x, cy + r * 0.6);
  ctx.lineTo(x, y + 1.5);
  ctx.stroke();

  ctx.fillStyle = '#A9B68A';
  ctx.beginPath();
  ctx.arc(x, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(60, 74, 44, 0.35)';
  ctx.beginPath();
  ctx.arc(x, cy, r, -Math.PI * 0.35, Math.PI * 0.65);
  ctx.quadraticCurveTo(x + r * 0.1, cy, x + r * Math.cos(-Math.PI * 0.35), cy + r * Math.sin(-Math.PI * 0.35));
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 0.95;
  ctx.beginPath();
  ctx.arc(x, cy, r, 0, Math.PI * 2);
  ctx.stroke();
}

function drawConifer(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
  const h = r * 2.6;
  ctx.fillStyle = '#93A27E';
  ctx.beginPath();
  ctx.moveTo(x, y - h);
  ctx.lineTo(x - r * 0.95, y - 1);
  ctx.lineTo(x + r * 0.95, y - 1);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(52, 66, 40, 0.38)';
  ctx.beginPath();
  ctx.moveTo(x, y - h);
  ctx.lineTo(x + r * 0.95, y - 1);
  ctx.lineTo(x + r * 0.1, y - 1);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 0.95;
  ctx.beginPath();
  ctx.moveTo(x, y - h);
  ctx.lineTo(x - r * 0.95, y - 1);
  ctx.lineTo(x + r * 0.95, y - 1);
  ctx.closePath();
  ctx.moveTo(x, y - 1);
  ctx.lineTo(x, y + 1.8);
  ctx.stroke();
}

function drawReeds(ctx: CanvasRenderingContext2D, x: number, y: number, rnd: (k: number) => number): void {
  ctx.strokeStyle = 'rgba(56, 66, 52, 0.85)';
  ctx.lineWidth = 0.85;
  ctx.beginPath();
  const n = 3 + Math.floor(rnd(4) * 2);
  for (let k = 0; k < n; k++) {
    const dx = (k - (n - 1) / 2) * 2.2;
    const lean = (k - (n - 1) / 2) * 0.9;
    ctx.moveTo(x + dx, y);
    ctx.lineTo(x + dx + lean, y - 5 - rnd(5 + k) * 3);
  }
  ctx.moveTo(x - 7, y + 0.5);
  ctx.lineTo(x + 7, y + 0.5);
  ctx.moveTo(x - 4, y + 3);
  ctx.lineTo(x + 4, y + 3);
  ctx.stroke();
}

function drawDune(ctx: CanvasRenderingContext2D, x: number, y: number, rnd: (k: number) => number): void {
  const w = 8 + rnd(4) * 6;
  ctx.strokeStyle = 'rgba(92, 67, 34, 0.8)';
  ctx.lineWidth = 0.95;
  ctx.beginPath();
  ctx.moveTo(x - w, y);
  ctx.quadraticCurveTo(x - w * 0.2, y - 5 - rnd(5) * 2, x + w * 0.5, y - 0.5);
  ctx.quadraticCurveTo(x + w * 0.8, y + 0.8, x + w, y);
  ctx.stroke();
  ctx.fillStyle = 'rgba(92, 67, 34, 0.6)';
  for (let d = 0; d < 5; d++) {
    ctx.fillRect(x - w * 0.6 + d * 2.6 + rnd(10 + d) * 1.5, y + 2.5 + rnd(20 + d) * 2.5, 0.9, 0.9);
  }
}

function drawSnow(ctx: CanvasRenderingContext2D, x: number, y: number, rnd: (k: number) => number): void {
  ctx.strokeStyle = 'rgba(80, 96, 104, 0.75)';
  ctx.lineWidth = 0.85;
  ctx.beginPath();
  const w = 5 + rnd(4) * 4;
  ctx.moveTo(x - w, y);
  ctx.quadraticCurveTo(x, y - 4, x + w, y);
  ctx.stroke();
  ctx.fillStyle = 'rgba(80, 96, 104, 0.55)';
  for (let d = 0; d < 3; d++) {
    ctx.fillRect(x - 4 + d * 4 + rnd(10 + d) * 2, y + 2.5, 0.9, 0.9);
  }
}

function drawGrass(ctx: CanvasRenderingContext2D, x: number, y: number, rnd: (k: number) => number): void {
  ctx.strokeStyle = 'rgba(96, 82, 52, 0.55)';
  ctx.lineWidth = 0.75;
  ctx.beginPath();
  ctx.moveTo(x - 2.2, y);
  ctx.lineTo(x - 3, y - 3 - rnd(4));
  ctx.moveTo(x, y);
  ctx.lineTo(x, y - 4 - rnd(5));
  ctx.moveTo(x + 2.2, y);
  ctx.lineTo(x + 3, y - 3 - rnd(6));
  ctx.stroke();
}
