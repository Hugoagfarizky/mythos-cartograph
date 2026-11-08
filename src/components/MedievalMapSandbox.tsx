import React, { useEffect, useRef, useState } from 'react';
import {
  Compass,
  Download,
  Eye,
  MapPin,
  Navigation,
  Paintbrush,
  RotateCcw,
  Sparkles,
  Trash2,
  Type as TypeIcon,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import {
  LoreEntity,
  MapRegionLabel,
  MapSandboxData,
  MapStamp,
  StampType,
  TerrainType,
} from '../types/world';
import { CATEGORY_META } from './WikiTextRenderer';

interface MedievalMapSandboxProps {
  mapData: MapSandboxData;
  entities: LoreEntity[];
  onChangeMapData: (updated: MapSandboxData) => void;
  onSelectEntity: (entityId: string) => void;
}

const TERRAIN_PALETTE: Array<{
  type: TerrainType;
  label: string;
  swatch: string;
  desc: string;
}> = [
  {
    type: 'plains',
    label: 'Daratan Perkamen',
    swatch: '#EFE4CE',
    desc: 'Daratan utama kerajaan bergaya kertas buku klasik',
  },
  {
    type: 'mountain',
    label: 'Pegunungan Berantai',
    swatch: '#C8B08E',
    desc: 'Punggung gunung bergaya ilustrasi tinta buku abad pertengahan',
  },
  {
    type: 'forest',
    label: 'Rimba & Hutan Kuno',
    swatch: '#8A9A78',
    desc: 'Gugusan kanopi pohon sketsa tangan & bayangan tinta',
  },
  {
    type: 'desert',
    label: 'Bukit Pasir & Gurun',
    swatch: '#E3C998',
    desc: 'Gundukan pasir gurun dengan titik-titik tinta sepia',
  },
  {
    type: 'swamp',
    label: 'Rawa & Lahan Basah',
    swatch: '#A7AD96',
    desc: 'Rumput rawa dan garis air dangkal',
  },
  {
    type: 'tundra',
    label: 'Dataran Tinggi Beku',
    swatch: '#F5F1E8',
    desc: 'Wilayah utara bersalju & puncak es',
  },
  {
    type: 'shallows',
    label: 'Perairan Pesisir',
    swatch: '#DFD2BA',
    desc: 'Selat dangkal & gugusan karang tepi pantai',
  },
  {
    type: 'sea',
    label: 'Samudra Dalam (Hapus Daratan)',
    swatch: '#D4C3A3',
    desc: 'Lautan lepas dengan arsiran gelombang & monster laut klasik',
  },
];

const STAMP_PALETTE: Array<{
  type: StampType;
  label: string;
  defaultColor: string;
}> = [
  { type: 'capital', label: 'Ibu Kota Mahkota', defaultColor: '#8B1E1E' },
  { type: 'castle', label: 'Benteng / Kastil', defaultColor: '#3B2818' },
  { type: 'tower', label: 'Menara Penyihir', defaultColor: '#1E3F4E' },
  { type: 'port', label: 'Pelabuhan & Dermaga', defaultColor: '#1F485B' },
  { type: 'shrine', label: 'Pohon Suci / Kuil', defaultColor: '#294C36' },
  { type: 'ruins', label: 'Reruntuhan Kuno', defaultColor: '#5A4632' },
  { type: 'village', label: 'Kota Kecil / Desa', defaultColor: '#4A3520' },
  { type: 'battlefield', label: 'Medan Perang', defaultColor: '#8B1E1E' },
];

// Deterministic pseudo-random helper for consistent hand-drawn ink texture
function pseudoRand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453123;
  return x - Math.floor(x);
}

// Hand-drawn SVG illustrations for Medieval Book Map Stamps
const MedievalStampArtwork: React.FC<{
  type: StampType;
  color: string;
  isSelected: boolean;
}> = ({ type, color, isSelected }) => {
  const strokeColor = isSelected ? '#9E2A2B' : '#261A10';
  const fillAccent = color || '#8B1E1E';

  return (
    <svg
      viewBox="0 0 48 48"
      className={`w-10 h-10 overflow-visible transition-transform duration-150 ${
        isSelected ? 'scale-125 drop-shadow-[0_2px_6px_rgba(158,42,43,0.45)]' : 'group-hover:scale-110'
      }`}
    >
      {/* Subtle parchment halo behind ink drawing for readability */}
      <ellipse
        cx="24"
        cy="28"
        rx="18"
        ry="12"
        fill="rgba(246, 238, 220, 0.78)"
      />

      {type === 'capital' && (
        <g stroke={strokeColor} strokeWidth="1.8" strokeLinejoin="round">
          {/* Base wall */}
          <path d="M8 36 L40 36 L38 26 L10 26 Z" fill="#EFE2C8" />
          {/* Three towers */}
          <rect x="11" y="17" width="6" height="19" fill="#E5D4B3" />
          <rect x="31" y="17" width="6" height="19" fill="#E5D4B3" />
          <rect x="19" y="12" width="10" height="24" fill="#F6EEDC" />
          {/* Steep medieval roofs */}
          <polygon points="10,17 14,9 18,17" fill={fillAccent} />
          <polygon points="30,17 34,9 38,17" fill={fillAccent} />
          <polygon points="17,12 24,2 31,12" fill={fillAccent} />
          {/* Royal banner flag */}
          <path d="M24 2 L24 -4 L32 -1 L24 2 Z" fill={fillAccent} />
          {/* Gate arch */}
          <path d="M21 36 L21 29 A3 3 0 0 1 27 29 L27 36 Z" fill="#261A10" />
        </g>
      )}

      {type === 'castle' && (
        <g stroke={strokeColor} strokeWidth="1.8" strokeLinejoin="round">
          <rect x="12" y="20" width="24" height="16" fill="#E5D4B3" />
          <rect x="9" y="14" width="8" height="22" fill="#D8C39E" />
          <rect x="31" y="14" width="8" height="22" fill="#D8C39E" />
          {/* Crenellations */}
          <path d="M8 14 H18 V11 H15 V14 H12 V11 H8 Z" fill="#3B2818" />
          <path d="M30 14 H40 V11 H37 V14 H34 V11 H30 Z" fill="#3B2818" />
          <path d="M21 36 V28 A3 3 0 0 1 27 28 V36 Z" fill="#261A10" />
          <path d="M24 20 V11 L30 14 L24 17" fill={fillAccent} />
        </g>
      )}

      {type === 'tower' && (
        <g stroke={strokeColor} strokeWidth="1.8" strokeLinejoin="round">
          <path d="M18 37 L20 13 L28 13 L30 37 Z" fill="#E5D4B3" />
          <polygon points="16,13 24,2 32,13" fill={fillAccent} />
          <circle cx="24" cy="20" r="2.2" fill="#FBF8F1" />
          {/* Arcane crescent atop spire */}
          <circle cx="24" cy="1" r="2" fill="#B5832A" />
        </g>
      )}

      {type === 'port' && (
        <g stroke={strokeColor} strokeWidth="1.7" strokeLinejoin="round">
          {/* Medieval sailing hull */}
          <path d="M10 29 Q24 38 38 29 L34 36 H14 Z" fill="#8C6239" />
          {/* Mast & Billowing Sail */}
          <line x1="24" y1="9" x2="24" y2="30" />
          <path d="M24 10 Q35 17 24 26 Q16 20 24 10 Z" fill="#FBF8F1" />
          <path d="M24 9 L31 11 L24 13 Z" fill={fillAccent} />
          {/* Waves under ship */}
          <path d="M8 38 Q16 35 24 38 T40 38" fill="none" />
        </g>
      )}

      {type === 'shrine' && (
        <g stroke={strokeColor} strokeWidth="1.7" strokeLinejoin="round">
          {/* Sacred Elder Tree & Stone Arch */}
          <path d="M21 36 L22 23 L26 23 L27 36 Z" fill="#6E4E32" />
          <circle cx="24" cy="17" r="9" fill="#527356" />
          <circle cx="18" cy="21" r="6" fill="#3E5C42" />
          <circle cx="30" cy="21" r="6" fill="#3E5C42" />
          <circle cx="24" cy="15" r="2.5" fill="#F2DCAC" />
        </g>
      )}

      {type === 'ruins' && (
        <g stroke={strokeColor} strokeWidth="1.7" strokeLinejoin="round">
          <line x1="8" y1="36" x2="40" y2="36" />
          <rect x="12" y="18" width="5" height="18" fill="#D5C4A6" />
          <polygon points="21,36 21,23 26,26 26,36" fill="#C4B293" />
          <polygon points="31,36 31,14 36,17 36,36" fill="#D5C4A6" />
          <path d="M11 18 Q24 9 37 16" fill="none" strokeDasharray="3 2" />
        </g>
      )}

      {type === 'village' && (
        <g stroke={strokeColor} strokeWidth="1.7" strokeLinejoin="round">
          <rect x="11" y="25" width="12" height="11" fill="#E8D8BC" />
          <polygon points="9,25 17,16 25,25" fill="#9E6B43" />
          <rect x="23" y="22" width="14" height="14" fill="#F3E7D0" />
          <polygon points="21,22 30,13 39,22" fill={fillAccent} />
          <rect x="28" y="29" width="4" height="7" fill="#261A10" />
        </g>
      )}

      {type === 'battlefield' && (
        <g stroke={strokeColor} strokeWidth="1.9" strokeLinecap="round">
          {/* Crossed Medieval Broadswords & Shield */}
          <line x1="11" y1="35" x2="37" y2="11" />
          <line x1="37" y1="35" x2="11" y2="11" />
          <path d="M17 18 L24 14 L31 18 L29 30 L24 35 L19 30 Z" fill={fillAccent} />
        </g>
      )}
    </svg>
  );
};

export const MedievalMapSandbox: React.FC<MedievalMapSandboxProps> = ({
  mapData,
  entities,
  onChangeMapData,
  onSelectEntity,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [toolMode, setToolMode] = useState<'inspect' | 'terrain' | 'stamp' | 'label'>('inspect');
  const [selectedTerrain, setSelectedTerrain] = useState<TerrainType>('plains');
  const [brushSize, setBrushSize] = useState<1 | 2 | 3>(1);
  const [selectedStampType, setSelectedStampType] = useState<StampType>('castle');
  const [newStampLabel, setNewStampLabel] = useState<string>('');
  const [newStampEntityId, setNewStampEntityId] = useState<string>('');
  const [newRegionText, setNewRegionText] = useState<string>('');
  const [newRegionStyle, setNewRegionStyle] = useState<'empire' | 'region' | 'sea'>('region');

  const [activeStampId, setActiveStampId] = useState<string | null>(
    mapData.stamps[0]?.id ?? null
  );
  const [draggingStampId, setDraggingStampId] = useState<string | null>(null);
  const [draggingLabelId, setDraggingLabelId] = useState<string | null>(null);
  const [isPainting, setIsPainting] = useState<boolean>(false);
  const [showRhumbLines, setShowRhumbLines] = useState<boolean>(true);
  const [zoom, setZoom] = useState<number>(1);

  const activeStamp = mapData.stamps.find((s) => s.id === activeStampId) || null;
  const linkedEntity = activeStamp?.linkedEntityId
    ? entities.find((e) => e.id === activeStamp.linkedEntityId) || null
    : null;

  // Render an authentic Medieval Book Map (Tolkien / Ortelius / Liber Mundi style)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const { gridCols, gridRows, cells, rivers } = mapData;
    const cellW = width / gridCols;
    const cellH = height / gridRows;

    const getCell = (c: number, r: number): TerrainType => {
      if (c < 0 || c >= gridCols || r < 0 || r >= gridRows) return 'sea';
      return cells[r * gridCols + c] || 'sea';
    };

    const isLand = (c: number, r: number): boolean => {
      const t = getCell(c, r);
      return t !== 'sea' && t !== 'shallows';
    };

    // =========================================================================
    // 1. AGED VELLUM PARCHMENT SEA BASE & VIGNETTE
    // =========================================================================
    const seaGrad = ctx.createRadialGradient(
      width * 0.5,
      height * 0.5,
      width * 0.1,
      width * 0.5,
      height * 0.5,
      width * 0.72
    );
    seaGrad.addColorStop(0, '#E4D6B8');
    seaGrad.addColorStop(0.7, '#D8C6A2');
    seaGrad.addColorStop(1, '#C2AC83');
    ctx.fillStyle = seaGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle aged paper fibers & foxing spots
    for (let i = 0; i < 240; i++) {
      const rx = pseudoRand(i * 13 + 1) * width;
      const ry = pseudoRand(i * 29 + 7) * height;
      const rad = 1 + pseudoRand(i * 41) * 3.5;
      ctx.fillStyle =
        i % 3 === 0 ? 'rgba(120, 88, 50, 0.05)' : 'rgba(255, 248, 231, 0.08)';
      ctx.beginPath();
      ctx.arc(rx, ry, rad, 0, Math.PI * 2);
      ctx.fill();
    }

    // Fine engraved horizontal sea wave groups in deep ocean
    ctx.strokeStyle = 'rgba(89, 69, 45, 0.22)';
    ctx.lineWidth = 1;
    for (let r = 1; r < gridRows - 1; r++) {
      for (let c = 1; c < gridCols - 1; c++) {
        if (!isLand(c, r) && getCell(c, r) === 'sea' && (c * 7 + r * 3) % 5 === 0) {
          const sx = (c + 0.2) * cellW;
          const sy = (r + 0.5) * cellH;
          ctx.beginPath();
          ctx.moveTo(sx - 10, sy);
          ctx.quadraticCurveTo(sx - 5, sy - 2.5, sx, sy);
          ctx.quadraticCurveTo(sx + 5, sy + 2.5, sx + 10, sy);
          ctx.moveTo(sx - 6, sy + 4);
          ctx.quadraticCurveTo(sx, sy + 2, sx + 6, sy + 4);
          ctx.stroke();
        }
      }
    }

    // =========================================================================
    // 2. SMOOTH ORGANIC LANDMASS & CONCENTRIC MEDIEVAL COASTAL RIPPLES
    // =========================================================================
    // Build an organic continuous path around land cells using rounded overlapping lobes
    const drawOrganicLandMask = (expandPx: number) => {
      ctx.beginPath();
      for (let r = 0; r < gridRows; r++) {
        for (let c = 0; c < gridCols; c++) {
          if (!isLand(c, r)) continue;
          const cx = (c + 0.5) * cellW;
          const cy = (r + 0.5) * cellH;
          const baseRx = cellW * 0.66 + expandPx;
          const baseRy = cellH * 0.66 + expandPx;

          // Add 3 overlapping organic sub-lobes per cell so no square corners ever appear
          const jx1 = (pseudoRand(c * 19 + r * 37) - 0.5) * cellW * 0.24;
          const jy1 = (pseudoRand(c * 43 + r * 11) - 0.5) * cellH * 0.24;
          ctx.moveTo(cx + jx1 + baseRx, cy + jy1);
          ctx.ellipse(cx + jx1, cy + jy1, baseRx, baseRy, 0, 0, Math.PI * 2);

          // Bridge lobes toward adjacent diagonal/orthogonal land cells
          if (isLand(c + 1, r)) {
            ctx.moveTo(cx + cellW * 0.5 + baseRx * 0.85, cy);
            ctx.ellipse(
              cx + cellW * 0.5,
              cy,
              baseRx * 0.85,
              baseRy * 0.85,
              0,
              0,
              Math.PI * 2
            );
          }
          if (isLand(c, r + 1)) {
            ctx.moveTo(cx + baseRx * 0.85, cy + cellH * 0.5);
            ctx.ellipse(
              cx,
              cy + cellH * 0.5,
              baseRx * 0.85,
              baseRy * 0.85,
              0,
              0,
              Math.PI * 2
            );
          }
        }
      }
    };

    // 3 Concentric Medieval Coastline Ripple Rings (Classic Cartography Hatching)
    const rippleRings = [
      { expand: 11, color: 'rgba(104, 82, 54, 0.14)', width: 1.2 },
      { expand: 6.5, color: 'rgba(82, 62, 38, 0.25)', width: 1.5 },
      { expand: 2.8, color: 'rgba(59, 43, 25, 0.42)', width: 2.0 },
    ];
    for (const ring of rippleRings) {
      ctx.save();
      drawOrganicLandMask(ring.expand);
      ctx.fillStyle = ring.color;
      ctx.fill();
      ctx.restore();
    }

    // Main Warm Parchment Interior Land Fill
    ctx.save();
    drawOrganicLandMask(0);
    const landGrad = ctx.createRadialGradient(
      width * 0.48,
      height * 0.48,
      40,
      width * 0.5,
      height * 0.5,
      width * 0.55
    );
    landGrad.addColorStop(0, '#F5ECD9');
    landGrad.addColorStop(0.75, '#EDE0C5');
    landGrad.addColorStop(1, '#E2D0AF');
    ctx.fillStyle = landGrad;
    ctx.fill();

    // Clip to land interior for subtle biome washes (tundra, desert, forest, swamp)
    ctx.clip();
    for (let r = 0; r < gridRows; r++) {
      for (let c = 0; c < gridCols; c++) {
        const t = getCell(c, r);
        if (t === 'plains' || t === 'sea' || t === 'shallows') continue;
        const cx = (c + 0.5) * cellW;
        const cy = (r + 0.5) * cellH;
        const washGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, cellW * 1.15);
        if (t === 'forest') {
          washGrad.addColorStop(0, 'rgba(116, 136, 98, 0.34)');
          washGrad.addColorStop(1, 'rgba(116, 136, 98, 0)');
        } else if (t === 'mountain') {
          washGrad.addColorStop(0, 'rgba(166, 135, 96, 0.32)');
          washGrad.addColorStop(1, 'rgba(166, 135, 96, 0)');
        } else if (t === 'desert') {
          washGrad.addColorStop(0, 'rgba(218, 174, 102, 0.38)');
          washGrad.addColorStop(1, 'rgba(218, 174, 102, 0)');
        } else if (t === 'swamp') {
          washGrad.addColorStop(0, 'rgba(118, 128, 104, 0.35)');
          washGrad.addColorStop(1, 'rgba(118, 128, 104, 0)');
        } else if (t === 'tundra') {
          washGrad.addColorStop(0, 'rgba(255, 252, 245, 0.65)');
          washGrad.addColorStop(1, 'rgba(255, 252, 245, 0)');
        }
        ctx.fillStyle = washGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, cellW * 1.15, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();

    // Draw Hand-Inked Organic Coastline Contour where Land meets Water
    ctx.save();
    ctx.strokeStyle = '#2B1E12';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (let r = 0; r < gridRows; r++) {
      for (let c = 0; c < gridCols; c++) {
        if (!isLand(c, r)) continue;
        const x = c * cellW;
        const y = r * cellH;
        const seed = c * 31 + r * 17;
        const wob = (pseudoRand(seed) - 0.5) * 4;

        // Top coast
        if (!isLand(c, r - 1)) {
          ctx.beginPath();
          ctx.moveTo(x - 2, y + wob);
          ctx.quadraticCurveTo(x + cellW * 0.5, y - 4 - wob, x + cellW + 2, y - wob);
          ctx.stroke();
        }
        // Bottom coast
        if (!isLand(c, r + 1)) {
          ctx.beginPath();
          ctx.moveTo(x - 2, y + cellH - wob);
          ctx.quadraticCurveTo(
            x + cellW * 0.5,
            y + cellH + 4 + wob,
            x + cellW + 2,
            y + cellH + wob
          );
          ctx.stroke();
        }
        // Left coast
        if (!isLand(c - 1, r)) {
          ctx.beginPath();
          ctx.moveTo(x + wob, y - 2);
          ctx.quadraticCurveTo(x - 4 - wob, y + cellH * 0.5, x - wob, y + cellH + 2);
          ctx.stroke();
        }
        // Right coast
        if (!isLand(c + 1, r)) {
          ctx.beginPath();
          ctx.moveTo(x + cellW - wob, y - 2);
          ctx.quadraticCurveTo(
            x + cellW + 4 + wob,
            y + cellH * 0.5,
            x + cellW + wob,
            y + cellH + 2
          );
          ctx.stroke();
        }
      }
    }
    ctx.restore();

    // =========================================================================
    // 3. WINDING CALLIGRAPHIC RIVERS (Tapered Estuary to Mountain Source)
    // =========================================================================
    for (const river of rivers) {
      if (river.points.length < 2) continue;
      ctx.save();
      // Outer sepia ink bank
      ctx.strokeStyle = '#2B1E12';
      ctx.lineWidth = 4.2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      river.points.forEach((pt, idx) => {
        const px = (pt.x / 100) * width;
        const py = (pt.y / 100) * height;
        if (idx === 0) ctx.moveTo(px, py);
        else {
          const prev = river.points[idx - 1];
          const mx = ((prev.x + pt.x) / 200) * width + 6;
          const my = ((prev.y + pt.y) / 200) * height - 4;
          ctx.quadraticCurveTo(mx, my, px, py);
        }
      });
      ctx.stroke();

      // Inner water channel
      ctx.strokeStyle = '#9BB0B5';
      ctx.lineWidth = 2.2;
      ctx.stroke();
      ctx.restore();
    }

    // =========================================================================
    // 4. TOLKIEN-STYLE HAND-DRAWN MOUNTAINS, WOODLANDS, DUNES & MARSHES
    // =========================================================================
    for (let r = 0; r < gridRows; r++) {
      for (let c = 0; c < gridCols; c++) {
        const terrain = getCell(c, r);
        const cx = (c + 0.5) * cellW;
        const cy = (r + 0.5) * cellH;
        const seed = c * 53 + r * 97;
        const ox = (pseudoRand(seed) - 0.5) * 6;
        const oy = (pseudoRand(seed + 1) - 0.5) * 5;

        if (terrain === 'mountain') {
          // Draw a primary craggy medieval mountain peak + smaller flanking ridge
          const drawPeak = (px: number, py: number, w: number, h: number) => {
            // West illuminated face
            ctx.fillStyle = '#EFE3CA';
            ctx.beginPath();
            ctx.moveTo(px - w, py + h * 0.55);
            ctx.lineTo(px, py - h * 0.65);
            ctx.lineTo(px + w, py + h * 0.55);
            ctx.closePath();
            ctx.fill();

            // East shaded slope (sepia ink wash)
            ctx.fillStyle = 'rgba(74, 52, 31, 0.34)';
            ctx.beginPath();
            ctx.moveTo(px, py - h * 0.65);
            ctx.lineTo(px + w, py + h * 0.55);
            ctx.lineTo(px + w * 0.08, py + h * 0.55);
            ctx. quadraticCurveTo(px - w * 0.08, py, px, py - h * 0.65);
            ctx.fill();

            // East slope ink hatching strokes
            ctx.strokeStyle = '#3B2818';
            ctx.lineWidth = 1.1;
            for (let k = 1; k <= 3; k++) {
              const t = k / 4;
              const hx = px + w * t * 0.5;
              const hy = py - h * 0.65 + h * 1.1 * t;
              ctx.beginPath();
              ctx.moveTo(px + t * 2, hy - 3);
              ctx.lineTo(hx + 4, hy + 2);
              ctx.stroke();
            }

            // Craggy outline & central ridge spine
            ctx.strokeStyle = '#261A10';
            ctx.lineWidth = 1.75;
            ctx.beginPath();
            ctx.moveTo(px - w, py + h * 0.55);
            ctx.lineTo(px - w * 0.45, py - h * 0.05);
            ctx.lineTo(px, py - h * 0.65);
            ctx.lineTo(px + w * 0.5, py - h * 0.02);
            ctx.lineTo(px + w, py + h * 0.55);
            // Central ridge line
            ctx.moveTo(px, py - h * 0.65);
            ctx.quadraticCurveTo(px - w * 0.1, py, px + w * 0.06, py + h * 0.45);
            ctx.stroke();
          };

          drawPeak(cx - 7 + ox * 0.5, cy + 3 + oy * 0.5, cellW * 0.42, cellH * 0.55);
          drawPeak(cx + 5 + ox, cy - 1 + oy, cellW * 0.56, cellH * 0.78);
        } else if (terrain === 'forest') {
          // Clumped medieval book woodland canopy
          const trees = [
            { dx: -7, dy: -2, r: 6.5 },
            { dx: 6, dy: -3, r: 6.5 },
            { dx: 0, dy: -7, r: 7.5 },
            { dx: -5, dy: 4, r: 6 },
            { dx: 6, dy: 4, r: 6.5 },
            { dx: 0, dy: 2, r: 7 },
          ];
          for (const tr of trees) {
            ctx.fillStyle = '#9AA882';
            ctx.strokeStyle = '#2B2116';
            ctx.lineWidth = 1.35;
            ctx.beginPath();
            ctx.arc(cx + tr.dx + ox * 0.4, cy + tr.dy + oy * 0.4, tr.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          }
          // Little tree trunks at bottom edge of clump
          ctx.strokeStyle = '#2B2116';
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(cx - 4 + ox * 0.4, cy + 8);
          ctx.lineTo(cx - 4 + ox * 0.4, cy + 12);
          ctx.moveTo(cx + 4 + ox * 0.4, cy + 8);
          ctx.lineTo(cx + 4 + ox * 0.4, cy + 12);
          ctx.stroke();
        } else if (terrain === 'desert') {
          // Hand-drawn crescent sand dunes & stippling
          ctx.strokeStyle = '#5C4322';
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          ctx.moveTo(cx - 11, cy + 3);
          ctx.quadraticCurveTo(cx - 3, cy - 5, cx + 6, cy + 2);
          ctx.quadraticCurveTo(cx + 10, cy + 4, cx + 14, cy + 1);
          ctx.stroke();
          // Sand stipples
          ctx.fillStyle = '#5C4322';
          for (let d = 0; d < 6; d++) {
            ctx.fillRect(cx - 8 + d * 3, cy + 5 + (d % 2) * 2, 1.3, 1.3);
          }
        } else if (terrain === 'swamp') {
          // Medieval marsh reeds & water ripples
          ctx.strokeStyle = '#384234';
          ctx.lineWidth = 1.25;
          ctx.beginPath();
          ctx.moveTo(cx - 10, cy + 4);
          ctx.lineTo(cx + 10, cy + 4);
          ctx.moveTo(cx - 6, cy + 7);
          ctx.lineTo(cx + 6, cy + 7);
          // Reed stalks
          ctx.moveTo(cx - 3, cy + 4);
          ctx.lineTo(cx - 5, cy - 5);
          ctx.moveTo(cx, cy + 4);
          ctx.lineTo(cx, cy - 7);
          ctx.moveTo(cx + 3, cy + 4);
          ctx.lineTo(cx + 5, cy - 5);
          ctx.stroke();
        } else if (terrain === 'tundra') {
          // Gently rolling frosty hills
          ctx.strokeStyle = '#5B676D';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(cx, cy + 6, 9, Math.PI * 1.15, Math.PI * 1.85);
          ctx.stroke();
        }
      }
    }

    // =========================================================================
    // 5. PORTOLAN COMPASS RHUMB LINES & SEA MONSTER / GALLEON ILLUSTRATIONS
    // =========================================================================
    const roseX = width * 0.12;
    const roseY = height * 0.78;

    if (showRhumbLines) {
      ctx.save();
      // Portolan radiating directional lines from the Compass Rose
      ctx.strokeStyle = 'rgba(92, 68, 40, 0.18)';
      ctx.lineWidth = 0.85;
      for (let i = 0; i < 16; i++) {
        const angle = (i * Math.PI) / 8;
        ctx.beginPath();
        ctx.moveTo(roseX, roseY);
        ctx.lineTo(
          roseX + Math.cos(angle) * width * 1.3,
          roseY + Math.sin(angle) * width * 1.3
        );
        ctx.stroke();
      }

      // Secondary wind-rose intersection in top-right sea
      const secX = width * 0.88;
      const secY = height * 0.18;
      ctx.strokeStyle = 'rgba(92, 68, 40, 0.11)';
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4;
        ctx.beginPath();
        ctx.moveTo(secX, secY);
        ctx.lineTo(
          secX + Math.cos(angle) * width * 0.9,
          secY + Math.sin(angle) * width * 0.9
        );
        ctx.stroke();
      }
      ctx.restore();
    }

    // Hand-drawn 16-Point Compass Rose on Canvas
    ctx.save();
    ctx.translate(roseX, roseY);
    ctx.strokeStyle = '#2B1E12';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(0, 0, 34, 0, Math.PI * 2);
    ctx.arc(0, 0, 30, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 8; i++) {
      ctx.save();
      ctx.rotate((i * Math.PI) / 4);
      const len = i % 2 === 0 ? 30 : 22;
      // Right half of point (dark ink)
      ctx.fillStyle = i === 0 ? '#8B1E1E' : '#2B1E12';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(5, -6);
      ctx.lineTo(0, -len);
      ctx.closePath();
      ctx.fill();
      // Left half of point (parchment)
      ctx.fillStyle = '#F5ECD9';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-5, -6);
      ctx.lineTo(0, -len);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();

    // Hand-sketched Medieval Sea Serpent ("Hic Sunt Dracones") in bottom-right ocean
    ctx.save();
    ctx.translate(width * 0.84, height * 0.84);
    ctx.strokeStyle = 'rgba(59, 43, 25, 0.65)';
    ctx.fillStyle = 'rgba(194, 172, 131, 0.7)';
    ctx.lineWidth = 1.6;
    // Coiling serpent humps emerging from waves
    ctx.beginPath();
    ctx.arc(-28, 4, 9, Math.PI, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-6, 4, 11, Math.PI, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(18, 4, 8, Math.PI, 0);
    ctx.stroke();
    // Water line under serpent
    ctx.beginPath();
    ctx.moveTo(-44, 5);
    ctx.lineTo(34, 5);
    ctx.stroke();
    ctx.font = 'italic 11px "Lora", Georgia, serif';
    ctx.fillStyle = 'rgba(59, 43, 25, 0.72)';
    ctx.fillText('Hic Sunt Dracones', -38, 19);
    ctx.restore();

    // =========================================================================
    // 6. CLASSICAL MEDIEVAL DEGREE-TICK BORDER FRAME (LATITUDE / LONGITUDE)
    // =========================================================================
    const borderM = 14;
    ctx.save();
    // Outer thick dark sepia frame
    ctx.strokeStyle = '#261A10';
    ctx.lineWidth = 3;
    ctx.strokeRect(4, 4, width - 8, height - 8);
    ctx.lineWidth = 1.5;
    ctx.strokeRect(borderM, borderM, width - borderM * 2, height - borderM * 2);

    // Alternating black and parchment degree blocks along all 4 edges
    const stepX = 36;
    for (let x = borderM, idx = 0; x < width - borderM; x += stepX, idx++) {
      const segW = Math.min(stepX, width - borderM - x);
      ctx.fillStyle = idx % 2 === 0 ? '#2B1E12' : '#F3E7CE';
      ctx.fillRect(x, 5.5, segW, borderM - 7);
      ctx.fillRect(x, height - borderM + 1.5, segW, borderM - 7);
    }
    const stepY = 36;
    for (let y = borderM, idx = 0; y < height - borderM; y += stepY, idx++) {
      const segH = Math.min(stepY, height - borderM - y);
      ctx.fillStyle = idx % 2 === 0 ? '#2B1E12' : '#F3E7CE';
      ctx.fillRect(5.5, y, borderM - 7, segH);
      ctx.fillRect(width - borderM + 1.5, y, borderM - 7, segH);
    }
    ctx.restore();
  }, [mapData, showRhumbLines]);

  const paintCellAtPosition = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const relX = (clientX - rect.left) / rect.width;
    const relY = (clientY - rect.top) / rect.height;

    if (relX < 0 || relX > 1 || relY < 0 || relY > 1) return;

    const centerCol = Math.floor(relX * mapData.gridCols);
    const centerRow = Math.floor(relY * mapData.gridRows);

    const nextCells = [...mapData.cells];
    const radius = brushSize - 1;
    let changed = false;

    for (let dr = -radius; dr <= radius; dr++) {
      for (let dc = -radius; dc <= radius; dc++) {
        const c = centerCol + dc;
        const r = centerRow + dr;
        if (c >= 1 && c < mapData.gridCols - 1 && r >= 1 && r < mapData.gridRows - 1) {
          const idx = r * mapData.gridCols + c;
          if (nextCells[idx] !== selectedTerrain) {
            nextCells[idx] = selectedTerrain;
            changed = true;
          }
        }
      }
    }

    if (changed) {
      onChangeMapData({ ...mapData, cells: nextCells });
    }
  };

  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const pctX = Math.max(4, Math.min(96, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
    const pctY = Math.max(5, Math.min(95, Math.round(((e.clientY - rect.top) / rect.height) * 100)));

    if (toolMode === 'terrain') {
      setIsPainting(true);
      paintCellAtPosition(e.clientX, e.clientY);
    } else if (toolMode === 'stamp') {
      const meta = STAMP_PALETTE.find((s) => s.type === selectedStampType);
      const linked = entities.find((ent) => ent.id === newStampEntityId);
      const labelText =
        newStampLabel.trim() ||
        linked?.title ||
        `${meta?.label || 'Lokasi'} #${mapData.stamps.length + 1}`;

      const created: MapStamp = {
        id: `stamp-${Date.now()}`,
        type: selectedStampType,
        x: pctX,
        y: pctY,
        label: labelText,
        linkedEntityId: newStampEntityId || undefined,
        nationColor: meta?.defaultColor || '#8B1E1E',
      };

      onChangeMapData({
        ...mapData,
        stamps: [...mapData.stamps, created],
      });
      setActiveStampId(created.id);
      setNewStampLabel('');
      setToolMode('inspect');
    } else if (toolMode === 'label') {
      const text = newRegionText.trim() || 'REGNUM NOVUM';
      const createdLabel: MapRegionLabel = {
        id: `lbl-${Date.now()}`,
        text: newRegionStyle === 'sea' ? text : text.toUpperCase(),
        x: pctX,
        y: pctY,
        style: newRegionStyle,
        rotation: 0,
      };
      onChangeMapData({
        ...mapData,
        regionLabels: [...mapData.regionLabels, createdLabel],
      });
      setNewRegionText('');
      setToolMode('inspect');
    }
  };

  const handleCanvasPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (toolMode === 'terrain' && isPainting) {
      paintCellAtPosition(e.clientX, e.clientY);
      return;
    }

    if (draggingStampId && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const pctX = Math.max(4, Math.min(96, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
      const pctY = Math.max(5, Math.min(95, Math.round(((e.clientY - rect.top) / rect.height) * 100)));

      onChangeMapData({
        ...mapData,
        stamps: mapData.stamps.map((s) =>
          s.id === draggingStampId ? { ...s, x: pctX, y: pctY } : s
        ),
      });
    } else if (draggingLabelId && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const pctX = Math.max(4, Math.min(96, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
      const pctY = Math.max(5, Math.min(95, Math.round(((e.clientY - rect.top) / rect.height) * 100)));

      onChangeMapData({
        ...mapData,
        regionLabels: mapData.regionLabels.map((l) =>
          l.id === draggingLabelId ? { ...l, x: pctX, y: pctY } : l
        ),
      });
    }
  };

  const handleCanvasPointerUp = () => {
    setIsPainting(false);
    setDraggingStampId(null);
    setDraggingLabelId(null);
  };

  const handleGenerateRandomArchipelago = () => {
    const { gridCols, gridRows } = mapData;
    const nextCells: TerrainType[] = new Array(gridCols * gridRows).fill('sea');

    const seeds = [
      { cx: 11 + Math.random() * 5, cy: 9 + Math.random() * 4, rx: 8.5, ry: 6 },
      { cx: 23 + Math.random() * 4, cy: 10 + Math.random() * 4, rx: 8, ry: 6.2 },
      { cx: 18 + Math.random() * 4, cy: 5 + Math.random() * 3, rx: 5.5, ry: 3.8 },
    ];

    for (let r = 2; r < gridRows - 2; r++) {
      for (let c = 3; c < gridCols - 3; c++) {
        let minD = 99;
        for (const s of seeds) {
          const d = Math.hypot((c - s.cx) / s.rx, (r - s.cy) / s.ry);
          if (d < minD) minD = d;
        }
        if (minD < 0.42) {
          nextCells[r * gridCols + c] = r < 5 ? 'tundra' : 'mountain';
        } else if (minD < 0.7) {
          nextCells[r * gridCols + c] = (c + r) % 2 === 0 ? 'forest' : 'plains';
        } else if (minD < 0.98) {
          nextCells[r * gridCols + c] = 'plains';
        } else if (minD < 1.12) {
          nextCells[r * gridCols + c] = 'shallows';
        }
      }
    }

    onChangeMapData({ ...mapData, cells: nextCells });
  };

  const handleExportMapPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${mapData.mapTitle.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="space-y-5">
      {/* Top Map Studio Control Bar */}
      <div className="bg-[#FBF8F1] border border-[#D8CBB3] rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs text-[#695A47] font-medium">
            Atlas Ilustrasi Buku Abad Pertengahan · {mapData.scaleLabel}
          </div>
          <h2 className="font-cartography text-2xl font-bold text-[#231C14]">
            {mapData.mapTitle}
          </h2>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#EFE7D6] p-1.5 rounded-lg border border-[#D8CBB3]">
          <button
            type="button"
            onClick={() => setToolMode('inspect')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              toolMode === 'inspect'
                ? 'bg-[#9E2A2B] text-white'
                : 'text-[#231C14] hover:bg-[#FBF8F1]'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Jelajah & Geser Pin
          </button>
          <button
            type="button"
            onClick={() => setToolMode('terrain')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              toolMode === 'terrain'
                ? 'bg-[#9E2A2B] text-white'
                : 'text-[#231C14] hover:bg-[#FBF8F1]'
            }`}
          >
            <Paintbrush className="w-3.5 h-3.5" />
            Lukis Peta (Gunung / Hutan / Pantai)
          </button>
          <button
            type="button"
            onClick={() => setToolMode('stamp')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              toolMode === 'stamp'
                ? 'bg-[#9E2A2B] text-white'
                : 'text-[#231C14] hover:bg-[#FBF8F1]'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            Tambah Kastil & Kota
          </button>
          <button
            type="button"
            onClick={() => setToolMode('label')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              toolMode === 'label'
                ? 'bg-[#9E2A2B] text-white'
                : 'text-[#231C14] hover:bg-[#FBF8F1]'
            }`}
          >
            <TypeIcon className="w-3.5 h-3.5" />
            Kaligrafi Nama Wilayah
          </button>
        </div>

        {/* Utility Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowRhumbLines((prev) => !prev)}
            className="px-3 py-1.5 text-xs font-medium border border-[#D8CBB3] rounded-lg bg-[#F6F1E6] hover:bg-[#EFE7D6] text-[#231C14] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {showRhumbLines ? 'Sembunyikan Garis Kompas' : 'Tampilkan Garis Kompas'}
          </button>
          <button
            type="button"
            onClick={handleGenerateRandomArchipelago}
            className="px-3 py-1.5 text-xs font-medium border border-[#D8CBB3] rounded-lg bg-[#F6F1E6] hover:bg-[#EFE7D6] text-[#231C14] flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            title="Buat bentuk benua baru secara prosedural"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Acak Benua
          </button>
          <button
            type="button"
            onClick={handleExportMapPng}
            className="px-3 py-1.5 text-xs font-medium bg-[#231C14] text-[#FBF8F1] rounded-lg hover:bg-[#3A2E21] flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Unduh Peta PNG
          </button>
        </div>
      </div>

      {/* Contextual Sub-Toolbar depending on active toolMode */}
      <div className="bg-[#EFE7D6]/85 border border-[#D8CBB3] rounded-xl p-3.5">
        {toolMode === 'terrain' && (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-[#695A47] mr-1">
                Kuas Ilustrasi Buku Kuno:
              </span>
              {TERRAIN_PALETTE.map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setSelectedTerrain(item.type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 border transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                    selectedTerrain === item.type
                      ? 'bg-[#FBF8F1] border-[#9E2A2B] text-[#231C14] shadow-xs ring-1 ring-[#9E2A2B]'
                      : 'bg-[#F6F1E6] border-[#D8CBB3] text-[#695A47] hover:text-[#231C14]'
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full border border-[#3B2E1E]/60 inline-block"
                    style={{ backgroundColor: item.swatch }}
                  />
                  {item.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#695A47]">Diameter Kuas:</span>
              {([1, 2, 3] as const).map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setBrushSize(sz)}
                  className={`px-2.5 py-1 rounded text-xs font-mono-tabular font-semibold border cursor-pointer ${
                    brushSize === sz
                      ? 'bg-[#231C14] text-[#FBF8F1] border-[#231C14]'
                      : 'bg-[#FBF8F1] text-[#231C14] border-[#D8CBB3]'
                  }`}
                >
                  {sz}x{sz}
                </button>
              ))}
            </div>
          </div>
        )}

        {toolMode === 'stamp' && (
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold text-[#695A47]">
              1. Pilih Simbol Ilustrasi Abad Pertengahan:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {STAMP_PALETTE.map((st) => (
                <button
                  key={st.type}
                  type="button"
                  onClick={() => setSelectedStampType(st.type)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border cursor-pointer whitespace-nowrap shrink-0 ${
                    selectedStampType === st.type
                      ? 'bg-[#FBF8F1] border-[#9E2A2B] text-[#9E2A2B] font-semibold'
                      : 'bg-[#F6F1E6] border-[#D8CBB3] text-[#231C14]'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2 ml-auto">
              <input
                type="text"
                value={newStampLabel}
                onChange={(e) => setNewStampLabel(e.target.value)}
                placeholder="Nama Kota / Benteng..."
                className="px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg text-[#231C14] focus:outline-none focus:border-[#9E2A2B]"
              />
              <select
                value={newStampEntityId}
                onChange={(e) => setNewStampEntityId(e.target.value)}
                className="px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg text-[#231C14] focus:outline-none focus:border-[#9E2A2B]"
              >
                <option value="">-- Hubungkan ke Entitas World Bible --</option>
                {entities.map((ent) => (
                  <option key={ent.id} value={ent.id}>
                    [{CATEGORY_META[ent.category].singular}] {ent.title}
                  </option>
                ))}
              </select>
              <span className="text-xs text-[#9E2A2B] font-medium">
                → Klik pada peta untuk menaruh simbol
              </span>
            </div>
          </div>
        )}

        {toolMode === 'label' && (
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold text-[#695A47]">
              Teks Kaligrafi Peta:
            </span>
            <input
              type="text"
              value={newRegionText}
              onChange={(e) => setNewRegionText(e.target.value)}
              placeholder="Contoh: KEKAISARAN GONDORIA atau Teluk Naga..."
              className="px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg text-[#231C14] w-64 focus:outline-none focus:border-[#9E2A2B]"
            />
            <select
              value={newRegionStyle}
              onChange={(e) =>
                setNewRegionStyle(e.target.value as 'empire' | 'region' | 'sea')
              }
              className="px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg text-[#231C14]"
            >
              <option value="empire">Kaligrafi Kerajaan / Negara Besar</option>
              <option value="region">Kaligrafi Wilayah / Rimba / Pegunungan</option>
              <option value="sea">Kaligrafi Miring Samudra / Teluk</option>
            </select>
            <span className="text-xs text-[#9E2A2B] font-medium">
              → Klik titik di peta untuk menempelkan teks
            </span>
          </div>
        )}

        {toolMode === 'inspect' && (
          <div className="flex items-center justify-between text-xs text-[#695A47]">
            <span>
              Mode Jelajah Peta Buku: Klik simbol kota/kastil untuk membuka lembar World Bible, atau tahan & geser simbol/nama wilayah untuk menata letaknya.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(0.85, Number((z - 0.15).toFixed(2))))}
                className="p-1.5 rounded bg-[#FBF8F1] border border-[#D8CBB3] text-[#231C14] cursor-pointer"
                title="Perkecil tampilan"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono-tabular font-medium text-[#231C14]">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(1.45, Number((z + 0.15).toFixed(2))))}
                className="p-1.5 rounded bg-[#FBF8F1] border border-[#D8CBB3] text-[#231C14] cursor-pointer"
                title="Perbesar tampilan"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Map Canvas & Pin Inspector Split */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Interactive Medieval Book Map Viewport */}
        <div className="xl:col-span-9 bg-[#3B2818] border-2 border-[#261A10] rounded-xl p-3 overflow-auto shadow-md">
          <div
            ref={containerRef}
            onPointerDown={handleCanvasPointerDown}
            onPointerMove={handleCanvasPointerMove}
            onPointerUp={handleCanvasPointerUp}
            onPointerLeave={handleCanvasPointerUp}
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top left',
            }}
            className={`relative w-full aspect-[16/10] select-none rounded overflow-hidden transition-transform duration-150 ${
              toolMode === 'terrain'
                ? 'cursor-crosshair'
                : toolMode === 'stamp' || toolMode === 'label'
                ? 'cursor-copy'
                : 'cursor-default'
            }`}
          >
            <canvas
              ref={canvasRef}
              width={1152}
              height={704}
              className="w-full h-full block"
            />

            {/* Ornate Medieval Book Cartouche Banner (Top-Left Crest Box) */}
            <div className="pointer-events-none absolute top-6 left-7 bg-[#F5ECD9]/95 border-2 border-[#2B1E12] px-4 py-2.5 shadow-sm">
              <div className="border border-[#8B7355] px-3 py-1.5 text-center">
                <div className="text-[10px] tracking-[0.25em] font-cartography text-[#8B1E1E] font-bold">
                  LIBER MUNDI · CHRONICA
                </div>
                <div className="font-cartography text-sm md:text-base font-bold tracking-wider text-[#231C14]">
                  {mapData.mapTitle.toUpperCase()}
                </div>
                <div className="font-display italic text-xs text-[#5A4632]">
                  {mapData.scaleLabel}
                </div>
              </div>
            </div>

            {/* Region Calligraphy Labels Overlay (Draggable in inspect mode!) */}
            {mapData.regionLabels.map((lbl) => (
              <div
                key={lbl.id}
                style={{
                  left: `${lbl.x}%`,
                  top: `${lbl.y}%`,
                  transform: `translate(-50%, -50%) rotate(${lbl.rotation || 0}deg)`,
                }}
                onPointerDown={(e) => {
                  if (toolMode === 'inspect') {
                    e.stopPropagation();
                    setDraggingLabelId(lbl.id);
                  }
                }}
                className={`absolute select-none text-center ${
                  toolMode === 'inspect' ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'
                }`}
              >
                <span
                  className={
                    lbl.style === 'empire'
                      ? 'font-cartography text-sm md:text-lg font-bold tracking-[0.28em] text-[#4A1818] drop-shadow-[0_1px_2px_rgba(245,236,217,0.95)]'
                      : lbl.style === 'sea'
                      ? 'font-display italic text-sm md:text-lg font-semibold tracking-[0.14em] text-[#3B2E1E]/80'
                      : 'font-cartography text-xs md:text-sm font-bold tracking-[0.18em] text-[#2B1E12]/90 drop-shadow-[0_1px_2px_rgba(245,236,217,0.9)]'
                  }
                >
                  {lbl.text}
                </span>
              </div>
            ))}

            {/* Hand-Illustrated Medieval Stamps & Scroll Ribbon Labels Overlay */}
            {mapData.stamps.map((stamp) => {
              const isSelected = stamp.id === activeStampId;
              return (
                <div
                  key={stamp.id}
                  style={{
                    left: `${stamp.x}%`,
                    top: `${stamp.y}%`,
                    transform: 'translate(-50%, -55%)',
                  }}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    setActiveStampId(stamp.id);
                    if (toolMode === 'inspect') {
                      setDraggingStampId(stamp.id);
                    }
                  }}
                  className="absolute z-10 group flex flex-col items-center cursor-pointer"
                >
                  <MedievalStampArtwork
                    type={stamp.type}
                    color={stamp.nationColor || '#8B1E1E'}
                    isSelected={isSelected}
                  />
                  {/* Authentic Medieval Parchment Scroll Banner Label */}
                  <div
                    className={`-mt-1 px-2.5 py-0.5 border text-[11px] font-display font-bold tracking-wide whitespace-nowrap transition-colors ${
                      isSelected
                        ? 'bg-[#8B1E1E] text-[#FBF8F1] border-[#261A10] shadow-xs'
                        : 'bg-[#F5ECD9]/95 text-[#231C14] border-[#2B1E12]'
                    }`}
                  >
                    {stamp.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Pin & Lore Inspector Panel */}
        <div className="xl:col-span-3 bg-[#FBF8F1] border border-[#D8CBB3] rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-[#D8CBB3] pb-3">
            <div>
              <span className="text-xs text-[#695A47]">Detail Lokasi Peta</span>
              <h3 className="font-display text-xl font-bold text-[#231C14]">
                Indeks Kartografi
              </h3>
            </div>
            <Navigation className="w-5 h-5 text-[#9E2A2B]" />
          </div>

          {activeStamp ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#695A47] mb-1">
                  Nama Tempat di Peta
                </label>
                <input
                  type="text"
                  value={activeStamp.label}
                  onChange={(e) =>
                    onChangeMapData({
                      ...mapData,
                      stamps: mapData.stamps.map((s) =>
                        s.id === activeStamp.id ? { ...s, label: e.target.value } : s
                      ),
                    })
                  }
                  className="w-full px-3 py-1.5 text-sm bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg text-[#231C14] font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-[#695A47] mb-1">
                    Simbol Ilustrasi
                  </label>
                  <select
                    value={activeStamp.type}
                    onChange={(e) =>
                      onChangeMapData({
                        ...mapData,
                        stamps: mapData.stamps.map((s) =>
                          s.id === activeStamp.id
                            ? { ...s, type: e.target.value as StampType }
                            : s
                        ),
                      })
                    }
                    className="w-full px-2.5 py-1.5 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg text-[#231C14]"
                  >
                    {STAMP_PALETTE.map((st) => (
                      <option key={st.type} value={st.type}>
                        {st.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#695A47] mb-1">
                    Koordinat Atlas
                  </label>
                  <div className="px-2.5 py-1.5 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg font-mono-tabular text-[#231C14]">
                    {activeStamp.x}°B · {activeStamp.y}°U
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#695A47] mb-1">
                  Tautkan ke Entri World Bible
                </label>
                <select
                  value={activeStamp.linkedEntityId || ''}
                  onChange={(e) =>
                    onChangeMapData({
                      ...mapData,
                      stamps: mapData.stamps.map((s) =>
                        s.id === activeStamp.id
                          ? { ...s, linkedEntityId: e.target.value || undefined }
                          : s
                      ),
                    })
                  }
                  className="w-full px-3 py-1.5 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg text-[#231C14]"
                >
                  <option value="">-- Tidak Ditautkan --</option>
                  {entities.map((ent) => (
                    <option key={ent.id} value={ent.id}>
                      [{CATEGORY_META[ent.category].singular}] {ent.title}
                    </option>
                  ))}
                </select>
              </div>

              {linkedEntity ? (
                <div className="p-3.5 rounded-lg bg-[#F6F1E6] border border-[#D8CBB3] space-y-2">
                  <div className="text-xs text-[#9E2A2B] font-semibold">
                    {CATEGORY_META[linkedEntity.category].singular} Terhubung
                  </div>
                  <div className="font-display text-lg font-bold text-[#231C14]">
                    {linkedEntity.title}
                  </div>
                  <p className="text-xs text-[#695A47] leading-relaxed">
                    {linkedEntity.summary}
                  </p>
                  <button
                    type="button"
                    onClick={() => onSelectEntity(linkedEntity.id)}
                    className="w-full mt-2 px-3 py-2 text-xs font-semibold bg-[#9E2A2B] text-white rounded-lg hover:bg-[#7E2021] transition-colors cursor-pointer"
                  >
                    Buka Lembar Lore Lengkap →
                  </button>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-[#F6F1E6] border border-[#D8CBB3] text-xs text-[#695A47]">
                  Lokasi ini belum dihubungkan ke entitas World Bible. Pilih salah satu entitas di atas untuk menautkannya.
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  const remaining = mapData.stamps.filter((s) => s.id !== activeStamp.id);
                  onChangeMapData({ ...mapData, stamps: remaining });
                  setActiveStampId(remaining[0]?.id ?? null);
                }}
                className="w-full px-3 py-1.5 text-xs font-medium text-[#9E2A2B] border border-[#9E2A2B]/40 rounded-lg hover:bg-[#9E2A2B]/10 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Hapus Simbol dari Peta
              </button>
            </div>
          ) : (
            <div className="text-xs text-[#695A47] py-6 text-center">
              Klik salah satu simbol kastil atau kota di atas peta untuk melihat detail lokasinya.
            </div>
          )}

          {/* List of all map stamps */}
          <div className="pt-3 border-t border-[#D8CBB3]">
            <div className="text-xs font-semibold text-[#695A47] mb-2">
              Daftar Tempat di Peta ({mapData.stamps.length})
            </div>
            <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
              {mapData.stamps.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiveStampId(s.id)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    s.id === activeStampId
                      ? 'bg-[#EFE7D6] text-[#231C14] font-semibold border border-[#D8CBB3]'
                      : 'text-[#695A47] hover:bg-[#F6F1E6]'
                  }`}
                >
                  <span className="truncate">{s.label}</span>
                  <span className="font-mono-tabular text-[11px] text-[#695A47] shrink-0 ml-2">
                    {s.x}°,{s.y}°
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
