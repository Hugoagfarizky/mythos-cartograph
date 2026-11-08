import React, { useEffect, useRef, useState } from 'react';
import {
  Check,
  Compass,
  Download,
  Edit3,
  Eye,
  FilePlus2,
  Layers,
  MapPin,
  Navigation,
  Paintbrush,
  Plus,
  RotateCcw,
  Route,
  Ruler,
  Trash2,
  Type as TypeIcon,
  Waves,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { STARTER_WORLD_PROJECT } from '../data/starterWorld';
import {
  LoreCategory,
  LoreEntity,
  MapRegionLabel,
  MapRiverPath,
  MapRoutePath,
  MapRouteStyle,
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
  onCreateEntityFromStamp?: (
    stamp: MapStamp,
    category: LoreCategory
  ) => void;
}

type MapToolMode =
  | 'inspect'
  | 'terrain'
  | 'stamp'
  | 'label'
  | 'river_route'
  | 'measure';

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
  { type: 'capital', label: 'Ibu Kota Mahkota', defaultColor: '#9E2A2B' },
  { type: 'castle', label: 'Benteng / Kastil', defaultColor: '#3B2818' },
  { type: 'tower', label: 'Menara Penyihir', defaultColor: '#264653' },
  { type: 'port', label: 'Pelabuhan & Dermaga', defaultColor: '#1F485B' },
  { type: 'shrine', label: 'Pohon Suci / Kuil', defaultColor: '#2D5A43' },
  { type: 'ruins', label: 'Reruntuhan Kuno', defaultColor: '#695A47' },
  { type: 'village', label: 'Kota Kecil / Desa', defaultColor: '#B5832A' },
  { type: 'battlefield', label: 'Medan Perang', defaultColor: '#8B1E1E' },
];

const BANNER_COLORS: Array<{ hex: string; label: string }> = [
  { hex: '#9E2A2B', label: 'Merah Mahkota' },
  { hex: '#B5832A', label: 'Emas Surya' },
  { hex: '#2D5A43', label: 'Hijau Sylvan' },
  { hex: '#264653', label: 'Biru Astral' },
  { hex: '#5A3E6B', label: 'Ungu Arkana' },
  { hex: '#3B2818', label: 'Besi Sepia' },
];

const TRAVEL_MODES: Array<{
  id: string;
  label: string;
  leaguesPerDay: number;
  note: string;
}> = [
  {
    id: 'foot',
    label: 'Jalan Kaki / Infanteri',
    leaguesPerDay: 5,
    note: '~24 km/hari',
  },
  {
    id: 'cart',
    label: 'Karavan / Kereta Dagang',
    leaguesPerDay: 8,
    note: '~38 km/hari',
  },
  {
    id: 'cavalry',
    label: 'Kuda Perang Cepat',
    leaguesPerDay: 13,
    note: '~62 km/hari',
  },
  {
    id: 'ship',
    label: 'Kapal Layar Kerajaan',
    leaguesPerDay: 25,
    note: '~120 km/hari',
  },
  {
    id: 'dragon',
    label: 'Naga / Tunggangan Udara',
    leaguesPerDay: 50,
    note: '~240 km/hari',
  },
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
        isSelected
          ? 'scale-125 drop-shadow-[0_2px_6px_rgba(158,42,43,0.45)]'
          : 'group-hover:scale-110'
      }`}
    >
      <ellipse
        cx="24"
        cy="28"
        rx="18"
        ry="12"
        fill="rgba(246, 238, 220, 0.78)"
      />

      {type === 'capital' && (
        <g stroke={strokeColor} strokeWidth="1.8" strokeLinejoin="round">
          <path d="M8 36 L40 36 L38 26 L10 26 Z" fill="#EFE2C8" />
          <rect x="11" y="17" width="6" height="19" fill="#E5D4B3" />
          <rect x="31" y="17" width="6" height="19" fill="#E5D4B3" />
          <rect x="19" y="12" width="10" height="24" fill="#F6EEDC" />
          <polygon points="10,17 14,9 18,17" fill={fillAccent} />
          <polygon points="30,17 34,9 38,17" fill={fillAccent} />
          <polygon points="17,12 24,2 31,12" fill={fillAccent} />
          <path d="M24 2 L24 -4 L32 -1 L24 2 Z" fill={fillAccent} />
          <path d="M21 36 L21 29 A3 3 0 0 1 27 29 L27 36 Z" fill="#261A10" />
        </g>
      )}

      {type === 'castle' && (
        <g stroke={strokeColor} strokeWidth="1.8" strokeLinejoin="round">
          <rect x="12" y="20" width="24" height="16" fill="#E5D4B3" />
          <rect x="9" y="14" width="8" height="22" fill="#D8C39E" />
          <rect x="31" y="14" width="8" height="22" fill="#D8C39E" />
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
          <circle cx="24" cy="1" r="2" fill="#B5832A" />
        </g>
      )}

      {type === 'port' && (
        <g stroke={strokeColor} strokeWidth="1.7" strokeLinejoin="round">
          <path d="M10 29 Q24 38 38 29 L34 36 H14 Z" fill="#8C6239" />
          <line x1="24" y1="9" x2="24" y2="30" />
          <path d="M24 10 Q35 17 24 26 Q16 20 24 10 Z" fill="#FBF8F1" />
          <path d="M24 9 L31 11 L24 13 Z" fill={fillAccent} />
          <path d="M8 38 Q16 35 24 38 T40 38" fill="none" />
        </g>
      )}

      {type === 'shrine' && (
        <g stroke={strokeColor} strokeWidth="1.7" strokeLinejoin="round">
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
          <line x1="11" y1="35" x2="37" y2="11" />
          <line x1="37" y1="35" x2="11" y2="11" />
          <path
            d="M17 18 L24 14 L31 18 L29 30 L24 35 L19 30 Z"
            fill={fillAccent}
          />
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
  onCreateEntityFromStamp,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [toolMode, setToolMode] = useState<MapToolMode>('inspect');
  const [selectedTerrain, setSelectedTerrain] = useState<TerrainType>('plains');
  const [brushSize, setBrushSize] = useState<1 | 2 | 3>(1);

  // Stamp creation state
  const [selectedStampType, setSelectedStampType] =
    useState<StampType>('castle');
  const [selectedBannerColor, setSelectedBannerColor] =
    useState<string>('#9E2A2B');
  const [newStampLabel, setNewStampLabel] = useState<string>('');
  const [newStampEntityId, setNewStampEntityId] = useState<string>('');

  // Label creation state
  const [newRegionText, setNewRegionText] = useState<string>('');
  const [newRegionStyle, setNewRegionStyle] = useState<
    'empire' | 'region' | 'sea'
  >('region');
  const [newRegionRotation, setNewRegionRotation] = useState<number>(0);

  // River & Route drawing state
  const [pathDrawKind, setPathDrawKind] = useState<'river' | MapRouteStyle>(
    'river'
  );
  const [newPathName, setNewPathName] = useState<string>('');
  const [draftPoints, setDraftPoints] = useState<Array<{ x: number; y: number }>>(
    []
  );

  // Distance & Travel Time Ruler state (Click 2 points on map)
  const [measurePointA, setMeasurePointA] = useState<{
    x: number;
    y: number;
    label: string;
  } | null>(() => {
    const s0 = mapData.stamps[0];
    return s0 ? { x: s0.x, y: s0.y, label: s0.label } : null;
  });
  const [measurePointB, setMeasurePointB] = useState<{
    x: number;
    y: number;
    label: string;
  } | null>(() => {
    const s1 = mapData.stamps[3] || mapData.stamps[1];
    return s1 ? { x: s1.x, y: s1.y, label: s1.label } : null;
  });

  // Inspector selection: either a Stamp or a Region Calligraphy Label
  const [inspectorKind, setInspectorKind] = useState<'stamp' | 'label'>('stamp');
  const [activeStampId, setActiveStampId] = useState<string | null>(
    mapData.stamps[0]?.id ?? null
  );
  const [activeLabelId, setActiveLabelId] = useState<string | null>(
    mapData.regionLabels[0]?.id ?? null
  );
  const [promoteCategory, setPromoteCategory] =
    useState<LoreCategory>('region');

  // Dragging & Painting state
  const [draggingStampId, setDraggingStampId] = useState<string | null>(null);
  const [draggingLabelId, setDraggingLabelId] = useState<string | null>(null);
  const [isPainting, setIsPainting] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(1);

  // Layer visibility toggles
  const [showStampsLayer, setShowStampsLayer] = useState<boolean>(true);
  const [showLabelsLayer, setShowLabelsLayer] = useState<boolean>(true);
  const [showRiversLayer, setShowRiversLayer] = useState<boolean>(true);
  const [showRoutesLayer, setShowRoutesLayer] = useState<boolean>(true);
  const [showRhumbLines, setShowRhumbLines] = useState<boolean>(true);

  // Collapsible Map Title & Scale settings drawer
  const [isEditingMapMeta, setIsEditingMapMeta] = useState<boolean>(false);
  const leaguesPerCell =
    mapData.leaguesPerCell ?? STARTER_WORLD_PROJECT.mapData.leaguesPerCell ?? 45;
  const routes: MapRoutePath[] =
    mapData.routes ?? STARTER_WORLD_PROJECT.mapData.routes ?? [];

  const [draftMapMeta, setDraftMapMeta] = useState({
    mapTitle: mapData.mapTitle,
    subtitle: mapData.subtitle,
    leaguesPerCell,
  });

  const activeStamp =
    mapData.stamps.find((s) => s.id === activeStampId) || null;
  const activeLabel =
    mapData.regionLabels.find((l) => l.id === activeLabelId) || null;
  const linkedEntity = activeStamp?.linkedEntityId
    ? entities.find((e) => e.id === activeStamp.linkedEntityId) || null
    : null;

  // Calculate measured distance in Leagues and Kilometers
  const measuredDistance = React.useMemo(() => {
    if (!measurePointA || !measurePointB) return null;
    const dxCells =
      ((measurePointB.x - measurePointA.x) / 100) * mapData.gridCols;
    const dyCells =
      ((measurePointB.y - measurePointA.y) / 100) * mapData.gridRows;
    const gridDist = Math.hypot(dxCells, dyCells);
    const totalLeagues = Math.max(1, Math.round(gridDist * leaguesPerCell));
    const totalKm = Math.round(totalLeagues * 4.8);
    return {
      gridDist: Number(gridDist.toFixed(1)),
      totalLeagues,
      totalKm,
    };
  }, [
    measurePointA,
    measurePointB,
    mapData.gridCols,
    mapData.gridRows,
    leaguesPerCell,
  ]);

  // Render authentic Medieval Book Map on Canvas (Land, Coastlines, Rivers, Routes, Ruler, Compass, Frame)
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
        i % 3 === 0
          ? 'rgba(120, 88, 50, 0.05)'
          : 'rgba(255, 248, 231, 0.08)';
      ctx.beginPath();
      ctx.arc(rx, ry, rad, 0, Math.PI * 2);
      ctx.fill();
    }

    // Fine engraved horizontal sea wave groups in deep ocean
    ctx.strokeStyle = 'rgba(89, 69, 45, 0.22)';
    ctx.lineWidth = 1;
    for (let r = 1; r < gridRows - 1; r++) {
      for (let c = 1; c < gridCols - 1; c++) {
        if (
          !isLand(c, r) &&
          getCell(c, r) === 'sea' &&
          (c * 7 + r * 3) % 5 === 0
        ) {
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
    const drawOrganicLandMask = (expandPx: number) => {
      ctx.beginPath();
      for (let r = 0; r < gridRows; r++) {
        for (let c = 0; c < gridCols; c++) {
          if (!isLand(c, r)) continue;
          const cx = (c + 0.5) * cellW;
          const cy = (r + 0.5) * cellH;
          const baseRx = cellW * 0.66 + expandPx;
          const baseRy = cellH * 0.66 + expandPx;

          const jx1 = (pseudoRand(c * 19 + r * 37) - 0.5) * cellW * 0.24;
          const jy1 = (pseudoRand(c * 43 + r * 11) - 0.5) * cellH * 0.24;
          ctx.moveTo(cx + jx1 + baseRx, cy + jy1);
          ctx.ellipse(cx + jx1, cy + jy1, baseRx, baseRy, 0, 0, Math.PI * 2);

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

    ctx.clip();
    for (let r = 0; r < gridRows; r++) {
      for (let c = 0; c < gridCols; c++) {
        const t = getCell(c, r);
        if (t === 'plains' || t === 'sea' || t === 'shallows') continue;
        const cx = (c + 0.5) * cellW;
        const cy = (r + 0.5) * cellH;
        const washGrad = ctx.createRadialGradient(
          cx,
          cy,
          2,
          cx,
          cy,
          cellW * 1.15
        );
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

    // Hand-Inked Organic Coastline Contour
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

        if (!isLand(c, r - 1)) {
          ctx.beginPath();
          ctx.moveTo(x - 2, y + wob);
          ctx.quadraticCurveTo(
            x + cellW * 0.5,
            y - 4 - wob,
            x + cellW + 2,
            y - wob
          );
          ctx.stroke();
        }
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
        if (!isLand(c - 1, r)) {
          ctx.beginPath();
          ctx.moveTo(x + wob, y - 2);
          ctx.quadraticCurveTo(
            x - 4 - wob,
            y + cellH * 0.5,
            x - wob,
            y + cellH + 2
          );
          ctx.stroke();
        }
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
    // 3. WINDING CALLIGRAPHIC RIVERS LAYER
    // =========================================================================
    if (showRiversLayer) {
      for (const river of rivers) {
        if (river.points.length < 2) continue;
        ctx.save();
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
            const mx = ((prev.x + pt.x) / 200) * width + 5;
            const my = ((prev.y + pt.y) / 200) * height - 4;
            ctx.quadraticCurveTo(mx, my, px, py);
          }
        });
        ctx.stroke();

        ctx.strokeStyle = '#9BB0B5';
        ctx.lineWidth = 2.2;
        ctx.stroke();
        ctx.restore();
      }
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
          const drawPeak = (px: number, py: number, w: number, h: number) => {
            ctx.fillStyle = '#EFE3CA';
            ctx.beginPath();
            ctx.moveTo(px - w, py + h * 0.55);
            ctx.lineTo(px, py - h * 0.65);
            ctx.lineTo(px + w, py + h * 0.55);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = 'rgba(74, 52, 31, 0.34)';
            ctx.beginPath();
            ctx.moveTo(px, py - h * 0.65);
            ctx.lineTo(px + w, py + h * 0.55);
            ctx.lineTo(px + w * 0.08, py + h * 0.55);
            ctx.quadraticCurveTo(px - w * 0.08, py, px, py - h * 0.65);
            ctx.fill();

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

            ctx.strokeStyle = '#261A10';
            ctx.lineWidth = 1.75;
            ctx.beginPath();
            ctx.moveTo(px - w, py + h * 0.55);
            ctx.lineTo(px - w * 0.45, py - h * 0.05);
            ctx.lineTo(px, py - h * 0.65);
            ctx.lineTo(px + w * 0.5, py - h * 0.02);
            ctx.lineTo(px + w, py + h * 0.55);
            ctx.moveTo(px, py - h * 0.65);
            ctx.quadraticCurveTo(
              px - w * 0.1,
              py,
              px + w * 0.06,
              py + h * 0.45
            );
            ctx.stroke();
          };

          drawPeak(
            cx - 7 + ox * 0.5,
            cy + 3 + oy * 0.5,
            cellW * 0.42,
            cellH * 0.55
          );
          drawPeak(cx + 5 + ox, cy - 1 + oy, cellW * 0.56, cellH * 0.78);
        } else if (terrain === 'forest') {
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
            ctx.arc(
              cx + tr.dx + ox * 0.4,
              cy + tr.dy + oy * 0.4,
              tr.r,
              0,
              Math.PI * 2
            );
            ctx.fill();
            ctx.stroke();
          }
          ctx.strokeStyle = '#2B2116';
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(cx - 4 + ox * 0.4, cy + 8);
          ctx.lineTo(cx - 4 + ox * 0.4, cy + 12);
          ctx.moveTo(cx + 4 + ox * 0.4, cy + 8);
          ctx.lineTo(cx + 4 + ox * 0.4, cy + 12);
          ctx.stroke();
        } else if (terrain === 'desert') {
          ctx.strokeStyle = '#5C4322';
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          ctx.moveTo(cx - 11, cy + 3);
          ctx.quadraticCurveTo(cx - 3, cy - 5, cx + 6, cy + 2);
          ctx.quadraticCurveTo(cx + 10, cy + 4, cx + 14, cy + 1);
          ctx.stroke();
          ctx.fillStyle = '#5C4322';
          for (let d = 0; d < 6; d++) {
            ctx.fillRect(cx - 8 + d * 3, cy + 5 + (d % 2) * 2, 1.3, 1.3);
          }
        } else if (terrain === 'swamp') {
          ctx.strokeStyle = '#384234';
          ctx.lineWidth = 1.25;
          ctx.beginPath();
          ctx.moveTo(cx - 10, cy + 4);
          ctx.lineTo(cx + 10, cy + 4);
          ctx.moveTo(cx - 6, cy + 7);
          ctx.lineTo(cx + 6, cy + 7);
          ctx.moveTo(cx - 3, cy + 4);
          ctx.lineTo(cx - 5, cy - 5);
          ctx.moveTo(cx, cy + 4);
          ctx.lineTo(cx, cy - 7);
          ctx.moveTo(cx + 3, cy + 4);
          ctx.lineTo(cx + 5, cy - 5);
          ctx.stroke();
        } else if (terrain === 'tundra') {
          ctx.strokeStyle = '#5B676D';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(cx, cy + 6, 9, Math.PI * 1.15, Math.PI * 1.85);
          ctx.stroke();
        }
      }
    }

    // =========================================================================
    // 5. ROYAL ROADS, EXPEDITION TRAILS & SEA LANES LAYER
    // =========================================================================
    if (showRoutesLayer) {
      for (const route of routes) {
        if (route.points.length < 2) continue;
        ctx.save();
        if (route.style === 'road') {
          ctx.strokeStyle = '#4A3219';
          ctx.lineWidth = 2.4;
          ctx.setLineDash([7, 5]);
        } else if (route.style === 'expedition') {
          ctx.strokeStyle = '#9E2A2B';
          ctx.lineWidth = 2.6;
          ctx.setLineDash([3, 5]);
        } else {
          ctx.strokeStyle = '#264653';
          ctx.lineWidth = 2.0;
          ctx.setLineDash([9, 6]);
        }
        ctx.lineCap = 'round';
        ctx.beginPath();
        route.points.forEach((pt, idx) => {
          const px = (pt.x / 100) * width;
          const py = (pt.y / 100) * height;
          if (idx === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.stroke();
        ctx.restore();
      }
    }

    // Active Draft River/Route Preview while clicking on map
    if (toolMode === 'river_route' && draftPoints.length > 0) {
      ctx.save();
      ctx.strokeStyle = pathDrawKind === 'river' ? '#1F485B' : '#9E2A2B';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      draftPoints.forEach((pt, idx) => {
        const px = (pt.x / 100) * width;
        const py = (pt.y / 100) * height;
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
      ctx.setLineDash([]);
      for (const pt of draftPoints) {
        const px = (pt.x / 100) * width;
        const py = (pt.y / 100) * height;
        ctx.fillStyle = '#9E2A2B';
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // =========================================================================
    // 6. DISTANCE & TRAVEL TIME RULER OVERLAY (WHEN IN MEASURE MODE)
    // =========================================================================
    if (toolMode === 'measure' && measurePointA) {
      const ax = (measurePointA.x / 100) * width;
      const ay = (measurePointA.y / 100) * height;
      ctx.save();

      if (measurePointB) {
        const bx = (measurePointB.x / 100) * width;
        const by = (measurePointB.y / 100) * height;

        // Halo line
        ctx.strokeStyle = 'rgba(251, 248, 241, 0.85)';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();

        // Crimson divider ruler line
        ctx.strokeStyle = '#9E2A2B';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([8, 5]);
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();
        ctx.setLineDash([]);

        // Endpoint B marker
        ctx.fillStyle = '#9E2A2B';
        ctx.strokeStyle = '#FBF8F1';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(bx, by, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      // Endpoint A marker
      ctx.fillStyle = '#231C14';
      ctx.strokeStyle = '#FBF8F1';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(ax, ay, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // =========================================================================
    // 7. PORTOLAN COMPASS RHUMB LINES & SEA MONSTER ILLUSTRATION
    // =========================================================================
    const roseX = width * 0.12;
    const roseY = height * 0.78;

    if (showRhumbLines) {
      ctx.save();
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

    // Hand-drawn 16-Point Compass Rose
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
      ctx.fillStyle = i === 0 ? '#8B1E1E' : '#2B1E12';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(5, -6);
      ctx.lineTo(0, -len);
      ctx.closePath();
      ctx.fill();
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

    // Sea Serpent ("Hic Sunt Dracones")
    ctx.save();
    ctx.translate(width * 0.84, height * 0.84);
    ctx.strokeStyle = 'rgba(59, 43, 25, 0.65)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(-28, 4, 9, Math.PI, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-6, 4, 11, Math.PI, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(18, 4, 8, Math.PI, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-44, 5);
    ctx.lineTo(34, 5);
    ctx.stroke();
    ctx.font = 'italic 11px "Lora", Georgia, serif';
    ctx.fillStyle = 'rgba(59, 43, 25, 0.72)';
    ctx.fillText('Hic Sunt Dracones', -38, 19);
    ctx.restore();

    // =========================================================================
    // 8. CLASSICAL MEDIEVAL DEGREE-TICK BORDER FRAME
    // =========================================================================
    const borderM = 14;
    ctx.save();
    ctx.strokeStyle = '#261A10';
    ctx.lineWidth = 3;
    ctx.strokeRect(4, 4, width - 8, height - 8);
    ctx.lineWidth = 1.5;
    ctx.strokeRect(
      borderM,
      borderM,
      width - borderM * 2,
      height - borderM * 2
    );

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
  }, [
    mapData,
    routes,
    showRiversLayer,
    showRoutesLayer,
    showRhumbLines,
    toolMode,
    draftPoints,
    pathDrawKind,
    measurePointA,
    measurePointB,
  ]);

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
        if (
          c >= 1 &&
          c < mapData.gridCols - 1 &&
          r >= 1 &&
          r < mapData.gridRows - 1
        ) {
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
    const pctX = Math.max(
      4,
      Math.min(96, Math.round(((e.clientX - rect.left) / rect.width) * 100))
    );
    const pctY = Math.max(
      5,
      Math.min(95, Math.round(((e.clientY - rect.top) / rect.height) * 100))
    );

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
        nationColor: selectedBannerColor || meta?.defaultColor || '#9E2A2B',
      };

      onChangeMapData({
        ...mapData,
        stamps: [...mapData.stamps, created],
      });
      setActiveStampId(created.id);
      setInspectorKind('stamp');
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
        rotation: newRegionRotation,
      };
      onChangeMapData({
        ...mapData,
        regionLabels: [...mapData.regionLabels, createdLabel],
      });
      setActiveLabelId(createdLabel.id);
      setInspectorKind('label');
      setNewRegionText('');
      setToolMode('inspect');
    } else if (toolMode === 'river_route') {
      setDraftPoints((prev) => [...prev, { x: pctX, y: pctY }]);
    } else if (toolMode === 'measure') {
      // Snap to nearby stamp if within 4% radius
      const nearbyStamp = mapData.stamps.find(
        (s) => Math.hypot(s.x - pctX, s.y - pctY) <= 4.5
      );
      const picked = nearbyStamp
        ? { x: nearbyStamp.x, y: nearbyStamp.y, label: nearbyStamp.label }
        : { x: pctX, y: pctY, label: `Titik (${pctX}°B, ${pctY}°U)` };

      if (!measurePointA || (measurePointA && measurePointB)) {
        setMeasurePointA(picked);
        setMeasurePointB(null);
      } else {
        setMeasurePointB(picked);
      }
    }
  };

  const handleCanvasPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (toolMode === 'terrain' && isPainting) {
      paintCellAtPosition(e.clientX, e.clientY);
      return;
    }

    if (draggingStampId && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const pctX = Math.max(
        4,
        Math.min(96, Math.round(((e.clientX - rect.left) / rect.width) * 100))
      );
      const pctY = Math.max(
        5,
        Math.min(95, Math.round(((e.clientY - rect.top) / rect.height) * 100))
      );

      onChangeMapData({
        ...mapData,
        stamps: mapData.stamps.map((s) =>
          s.id === draggingStampId ? { ...s, x: pctX, y: pctY } : s
        ),
      });
    } else if (draggingLabelId && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const pctX = Math.max(
        4,
        Math.min(96, Math.round(((e.clientX - rect.left) / rect.width) * 100))
      );
      const pctY = Math.max(
        5,
        Math.min(95, Math.round(((e.clientY - rect.top) / rect.height) * 100))
      );

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

  const handleFinishRiverOrRoute = () => {
    if (draftPoints.length < 2) return;
    if (pathDrawKind === 'river') {
      const newRiver: MapRiverPath = {
        id: `riv-${Date.now()}`,
        name:
          newPathName.trim() || `Sungai Baru #${mapData.rivers.length + 1}`,
        points: draftPoints,
      };
      onChangeMapData({
        ...mapData,
        rivers: [...mapData.rivers, newRiver],
      });
    } else {
      const newRoute: MapRoutePath = {
        id: `rte-${Date.now()}`,
        name: newPathName.trim() || `Rute Perjalanan #${routes.length + 1}`,
        style: pathDrawKind,
        points: draftPoints,
      };
      onChangeMapData({
        ...mapData,
        routes: [...routes, newRoute],
      });
    }
    setDraftPoints([]);
    setNewPathName('');
  };

  const handleSaveMapMeta = (e: React.FormEvent) => {
    e.preventDefault();
    const validLeagues = Math.max(
      1,
      Number(draftMapMeta.leaguesPerCell) || 45
    );
    onChangeMapData({
      ...mapData,
      mapTitle: draftMapMeta.mapTitle.trim() || mapData.mapTitle,
      subtitle: draftMapMeta.subtitle.trim() || mapData.subtitle,
      leaguesPerCell: validLeagues,
      scaleLabel: `1 Grid = ${validLeagues} Liga Kerajaan`,
    });
    setIsEditingMapMeta(false);
  };

  const handleGenerateRandomArchipelago = () => {
    const { gridCols, gridRows } = mapData;
    const nextCells: TerrainType[] = new Array(gridCols * gridRows).fill('sea');

    const seeds = [
      { cx: 11 + Math.random() * 5, cy: 9 + Math.random() * 4, rx: 8.5, ry: 6 },
      {
        cx: 23 + Math.random() * 4,
        cy: 10 + Math.random() * 4,
        rx: 8,
        ry: 6.2,
      },
      {
        cx: 18 + Math.random() * 4,
        cy: 5 + Math.random() * 3,
        rx: 5.5,
        ry: 3.8,
      },
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
          nextCells[r * gridCols + c] =
            (c + r) % 2 === 0 ? 'forest' : 'plains';
        } else if (minD < 0.98) {
          nextCells[r * gridCols + c] = 'plains';
        } else if (minD < 1.12) {
          nextCells[r * gridCols + c] = 'shallows';
        }
      }
    }

    onChangeMapData({ ...mapData, cells: nextCells });
  };

  // Composite Full PNG Export (Terrain + Rivers + Routes + Cartouche + Calligraphy Labels + Stamps)
  const handleExportMapPng = () => {
    const baseCanvas = canvasRef.current;
    if (!baseCanvas) return;

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = baseCanvas.width;
    exportCanvas.height = baseCanvas.height;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    // 1. Copy base terrain, rivers, routes, compass, and border frame
    ctx.drawImage(baseCanvas, 0, 0);

    // 2. Draw Top-Left Liber Mundi Cartouche Box
    ctx.save();
    ctx.fillStyle = 'rgba(245, 236, 217, 0.96)';
    ctx.strokeStyle = '#2B1E12';
    ctx.lineWidth = 2.5;
    ctx.fillRect(28, 26, 290, 68);
    ctx.strokeRect(28, 26, 290, 68);
    ctx.font = 'bold 10px "Fraunces", Georgia, serif';
    ctx.fillStyle = '#8B1E1E';
    ctx.textAlign = 'center';
    ctx.fillText('LIBER MUNDI · CHRONICA', 173, 44);
    ctx.font = 'bold 16px "Fraunces", Georgia, serif';
    ctx.fillStyle = '#231C14';
    ctx.fillText(mapData.mapTitle.toUpperCase(), 173, 65);
    ctx.font = 'italic 11px "Lora", Georgia, serif';
    ctx.fillStyle = '#5A4632';
    ctx.fillText(mapData.scaleLabel, 173, 82);
    ctx.restore();

    // 3. Draw Calligraphy Region Labels
    if (showLabelsLayer) {
      for (const lbl of mapData.regionLabels) {
        const lx = (lbl.x / 100) * exportCanvas.width;
        const ly = (lbl.y / 100) * exportCanvas.height;
        ctx.save();
        ctx.translate(lx, ly);
        ctx.rotate(((lbl.rotation || 0) * Math.PI) / 180);
        ctx.textAlign = 'center';
        if (lbl.style === 'empire') {
          ctx.font = 'bold 17px "Fraunces", Georgia, serif';
          ctx.fillStyle = '#4A1818';
        } else if (lbl.style === 'sea') {
          ctx.font = 'italic 16px "Lora", Georgia, serif';
          ctx.fillStyle = '#3B2E1E';
        } else {
          ctx.font = 'bold 13px "Fraunces", Georgia, serif';
          ctx.fillStyle = '#2B1E12';
        }
        ctx.fillText(lbl.text, 0, 0);
        ctx.restore();
      }
    }

    // 4. Draw Stamp Markers & Scroll Ribbons
    if (showStampsLayer) {
      for (const st of mapData.stamps) {
        const sx = (st.x / 100) * exportCanvas.width;
        const sy = (st.y / 100) * exportCanvas.height;
        ctx.save();
        ctx.fillStyle = st.nationColor || '#8B1E1E';
        ctx.strokeStyle = '#261A10';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(sx, sy - 8, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 11px "Fraunces", Georgia, serif';
        const textW = ctx.measureText(st.label).width + 14;
        ctx.fillStyle = '#F5ECD9';
        ctx.fillRect(sx - textW / 2, sy + 4, textW, 18);
        ctx.strokeRect(sx - textW / 2, sy + 4, textW, 18);
        ctx.fillStyle = '#231C14';
        ctx.textAlign = 'center';
        ctx.fillText(st.label, sx, sy + 17);
        ctx.restore();
      }
    }

    const dataUrl = exportCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${mapData.mapTitle.toLowerCase().replace(/\s+/g, '-')}-atlas.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="space-y-4">
      {/* ===================================================================== */}
      {/* 1. TOP MAP STUDIO HEADER & MODE SELECTOR                              */}
      {/* ===================================================================== */}
      <div className="bg-[#FBF8F1] border border-[#D8CBB3] rounded-xl p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs text-[#695A47] font-medium">
              Atlas Ilustrasi Buku Abad Pertengahan · {mapData.scaleLabel}
            </div>
            <h2 className="font-cartography text-2xl font-bold text-[#231C14]">
              {mapData.mapTitle}
            </h2>
          </div>

          {/* 6 Cartography Tool Modes */}
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
              Jelajah & Geser
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
              Lukis Daratan
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
              Kastil & Kota
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
              Kaligrafi Wilayah
            </button>
            <button
              type="button"
              onClick={() => {
                setDraftPoints([]);
                setToolMode('river_route');
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                toolMode === 'river_route'
                  ? 'bg-[#9E2A2B] text-white'
                  : 'text-[#231C14] hover:bg-[#FBF8F1]'
              }`}
            >
              <Route className="w-3.5 h-3.5" />
              Sungai & Rute Jalan
            </button>
            <button
              type="button"
              onClick={() => setToolMode('measure')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                toolMode === 'measure'
                  ? 'bg-[#9E2A2B] text-white'
                  : 'text-[#231C14] hover:bg-[#FBF8F1]'
              }`}
            >
              <Ruler className="w-3.5 h-3.5" />
              Ukur Jarak & Hari Tempuh
            </button>
          </div>

          {/* Map Settings, Random Continent & Full PNG Download */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setDraftMapMeta({
                  mapTitle: mapData.mapTitle,
                  subtitle: mapData.subtitle,
                  leaguesPerCell,
                });
                setIsEditingMapMeta((prev) => !prev);
              }}
              className={`px-3 py-1.5 text-xs font-semibold border rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isEditingMapMeta
                  ? 'bg-[#9E2A2B] text-white border-[#9E2A2B]'
                  : 'bg-[#F6F1E6] text-[#231C14] border-[#D8CBB3] hover:bg-[#EFE7D6]'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              Atur Judul & Skala
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
              className="px-3 py-1.5 text-xs font-semibold bg-[#231C14] text-[#FBF8F1] rounded-lg hover:bg-[#3A2E21] flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Unduh Peta PNG
            </button>
          </div>
        </div>

        {/* Layer Visibility Toggles Bar */}
        <div className="pt-3 border-t border-[#D8CBB3] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-[#695A47] flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-[#9E2A2B]" />
              Tampilan Layer Peta:
            </span>
            <button
              type="button"
              onClick={() => setShowStampsLayer((v) => !v)}
              className={`px-2.5 py-1 rounded border text-[11px] font-medium cursor-pointer ${
                showStampsLayer
                  ? 'bg-[#231C14] text-[#FBF8F1] border-[#231C14]'
                  : 'bg-[#F6F1E6] text-[#695A47] border-[#D8CBB3]'
              }`}
            >
              Simbol Kota ({mapData.stamps.length})
            </button>
            <button
              type="button"
              onClick={() => setShowLabelsLayer((v) => !v)}
              className={`px-2.5 py-1 rounded border text-[11px] font-medium cursor-pointer ${
                showLabelsLayer
                  ? 'bg-[#231C14] text-[#FBF8F1] border-[#231C14]'
                  : 'bg-[#F6F1E6] text-[#695A47] border-[#D8CBB3]'
              }`}
            >
              Kaligrafi Wilayah ({mapData.regionLabels.length})
            </button>
            <button
              type="button"
              onClick={() => setShowRiversLayer((v) => !v)}
              className={`px-2.5 py-1 rounded border text-[11px] font-medium cursor-pointer ${
                showRiversLayer
                  ? 'bg-[#231C14] text-[#FBF8F1] border-[#231C14]'
                  : 'bg-[#F6F1E6] text-[#695A47] border-[#D8CBB3]'
              }`}
            >
              Sungai ({mapData.rivers.length})
            </button>
            <button
              type="button"
              onClick={() => setShowRoutesLayer((v) => !v)}
              className={`px-2.5 py-1 rounded border text-[11px] font-medium cursor-pointer ${
                showRoutesLayer
                  ? 'bg-[#231C14] text-[#FBF8F1] border-[#231C14]'
                  : 'bg-[#F6F1E6] text-[#695A47] border-[#D8CBB3]'
              }`}
            >
              Rute Jalan & Ekspedisi ({routes.length})
            </button>
            <button
              type="button"
              onClick={() => setShowRhumbLines((v) => !v)}
              className={`px-2.5 py-1 rounded border text-[11px] font-medium cursor-pointer ${
                showRhumbLines
                  ? 'bg-[#231C14] text-[#FBF8F1] border-[#231C14]'
                  : 'bg-[#F6F1E6] text-[#695A47] border-[#D8CBB3]'
              }`}
            >
              Garis Kompas Portolan
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() =>
                setZoom((z) => Math.max(0.85, Number((z - 0.15).toFixed(2))))
              }
              className="p-1.5 rounded bg-[#F6F1E6] border border-[#D8CBB3] text-[#231C14] cursor-pointer"
              title="Perkecil tampilan"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono-tabular text-xs font-semibold text-[#231C14] px-1">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() =>
                setZoom((z) => Math.min(1.45, Number((z + 0.15).toFixed(2))))
              }
              className="p-1.5 rounded bg-[#F6F1E6] border border-[#D8CBB3] text-[#231C14] cursor-pointer"
              title="Perbesar tampilan"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Collapsible Map Title & Scale Settings Form */}
        {isEditingMapMeta && (
          <form
            onSubmit={handleSaveMapMeta}
            className="pt-4 border-t border-[#D8CBB3] grid grid-cols-1 md:grid-cols-4 gap-3 items-end"
          >
            <div>
              <label className="block text-xs font-semibold text-[#695A47] mb-1">
                Judul Peta (Lencana Liber Mundi)
              </label>
              <input
                type="text"
                value={draftMapMeta.mapTitle}
                onChange={(e) =>
                  setDraftMapMeta({ ...draftMapMeta, mapTitle: e.target.value })
                }
                className="w-full px-3 py-1.5 text-xs font-semibold bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg text-[#231C14]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-[#695A47] mb-1">
                Subjudul / Deskripsi Geografi
              </label>
              <input
                type="text"
                value={draftMapMeta.subtitle}
                onChange={(e) =>
                  setDraftMapMeta({ ...draftMapMeta, subtitle: e.target.value })
                }
                className="w-full px-3 py-1.5 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg text-[#231C14]"
              />
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-[#695A47] mb-1">
                  Skala: 1 Grid Berapa Liga?
                </label>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={draftMapMeta.leaguesPerCell}
                  onChange={(e) =>
                    setDraftMapMeta({
                      ...draftMapMeta,
                      leaguesPerCell: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-1.5 text-xs font-mono-tabular bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg text-[#231C14]"
                />
              </div>
              <button
                type="submit"
                className="px-3.5 py-1.5 text-xs font-semibold bg-[#9E2A2B] text-white rounded-lg hover:bg-[#7E2021] flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Check className="w-3.5 h-3.5" />
                Simpan
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ===================================================================== */}
      {/* 2. CONTEXTUAL SUB-TOOLBAR FOR ACTIVE CARTOGRAPHY MODE                 */}
      {/* ===================================================================== */}
      <div className="bg-[#EFE7D6]/90 border border-[#D8CBB3] rounded-xl p-3.5">
        {toolMode === 'inspect' && (
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#695A47]">
            <span>
              <strong>Mode Jelajah & Geser:</strong> Klik simbol kastil/kota
              atau teks kaligrafi wilayah di peta untuk mengedit detail, warna
              bendera, atau kemiringan teks di panel kanan. Tahan & geser untuk
              memindahkan posisinya.
            </span>
          </div>
        )}

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
              <span className="text-xs font-semibold text-[#695A47]">
                Diameter Kuas:
              </span>
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
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-[#695A47]">
                1. Pilih Simbol:
              </span>
              {STAMP_PALETTE.map((st) => (
                <button
                  key={st.type}
                  type="button"
                  onClick={() => {
                    setSelectedStampType(st.type);
                    setSelectedBannerColor(st.defaultColor);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border cursor-pointer whitespace-nowrap shrink-0 ${
                    selectedStampType === st.type
                      ? 'bg-[#FBF8F1] border-[#9E2A2B] text-[#9E2A2B] font-semibold'
                      : 'bg-[#F6F1E6] border-[#D8CBB3] text-[#231C14]'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-[#695A47]">
                  2. Warna Panji Kerajaan:
                </span>
                {BANNER_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setSelectedBannerColor(c.hex)}
                    className={`px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1.5 border cursor-pointer ${
                      selectedBannerColor === c.hex
                        ? 'bg-[#FBF8F1] border-[#231C14] font-semibold'
                        : 'bg-[#F6F1E6] border-[#D8CBB3] text-[#695A47]'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: c.hex }}
                    />
                    {c.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={newStampLabel}
                  onChange={(e) => setNewStampLabel(e.target.value)}
                  placeholder="Nama Kota / Benteng..."
                  className="px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg text-[#231C14]"
                />
                <select
                  value={newStampEntityId}
                  onChange={(e) => setNewStampEntityId(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg text-[#231C14]"
                >
                  <option value="">-- Hubungkan ke Entitas (Opsional) --</option>
                  {entities.map((ent) => (
                    <option key={ent.id} value={ent.id}>
                      [{CATEGORY_META[ent.category].singular}] {ent.title}
                    </option>
                  ))}
                </select>
                <span className="text-xs text-[#9E2A2B] font-semibold">
                  → Klik pada peta untuk menaruh simbol
                </span>
              </div>
            </div>
          </div>
        )}

        {toolMode === 'label' && (
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold text-[#695A47]">
              Teks Kaligrafi Baru:
            </span>
            <input
              type="text"
              value={newRegionText}
              onChange={(e) => setNewRegionText(e.target.value)}
              placeholder="Contoh: KEKAISARAN GONDORIA atau Teluk Naga..."
              className="px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg text-[#231C14] w-60"
            />
            <select
              value={newRegionStyle}
              onChange={(e) =>
                setNewRegionStyle(e.target.value as 'empire' | 'region' | 'sea')
              }
              className="px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg text-[#231C14]"
            >
              <option value="empire">Kaligrafi Kerajaan / Negara Besar</option>
              <option value="region">
                Kaligrafi Wilayah / Rimba / Pegunungan
              </option>
              <option value="sea">Kaligrafi Miring Samudra / Teluk</option>
            </select>
            <div className="flex items-center gap-1.5 text-xs text-[#231C14]">
              <span className="text-[#695A47] font-semibold">Kemiringan:</span>
              <input
                type="range"
                min={-45}
                max={45}
                step={3}
                value={newRegionRotation}
                onChange={(e) => setNewRegionRotation(Number(e.target.value))}
                className="w-24 accent-[#9E2A2B]"
              />
              <span className="font-mono-tabular w-9">
                {newRegionRotation}°
              </span>
            </div>
            <span className="text-xs text-[#9E2A2B] font-semibold ml-auto">
              → Klik titik di peta untuk menempelkan teks
            </span>
          </div>
        )}

        {toolMode === 'river_route' && (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-[#695A47]">
                Jenis Jalur Kartografi:
              </span>
              <button
                type="button"
                onClick={() => setPathDrawKind('river')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border cursor-pointer ${
                  pathDrawKind === 'river'
                    ? 'bg-[#264653] text-white border-[#264653]'
                    : 'bg-[#FBF8F1] text-[#231C14] border-[#D8CBB3]'
                }`}
              >
                <Waves className="w-3.5 h-3.5" />
                Alur Sungai Berliku
              </button>
              <button
                type="button"
                onClick={() => setPathDrawKind('road')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border cursor-pointer ${
                  pathDrawKind === 'road'
                    ? 'bg-[#3B2818] text-white border-[#3B2818]'
                    : 'bg-[#FBF8F1] text-[#231C14] border-[#D8CBB3]'
                }`}
              >
                Jalan Raya Kerajaan
              </button>
              <button
                type="button"
                onClick={() => setPathDrawKind('expedition')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border cursor-pointer ${
                  pathDrawKind === 'expedition'
                    ? 'bg-[#9E2A2B] text-white border-[#9E2A2B]'
                    : 'bg-[#FBF8F1] text-[#231C14] border-[#D8CBB3]'
                }`}
              >
                Rute Ekspedisi Tokoh
              </button>
              <button
                type="button"
                onClick={() => setPathDrawKind('sea_lane')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border cursor-pointer ${
                  pathDrawKind === 'sea_lane'
                    ? 'bg-[#1F485B] text-white border-[#1F485B]'
                    : 'bg-[#FBF8F1] text-[#231C14] border-[#D8CBB3]'
                }`}
              >
                Jalur Pelayaran Laut
              </button>

              <input
                type="text"
                value={newPathName}
                onChange={(e) => setNewPathName(e.target.value)}
                placeholder={
                  pathDrawKind === 'river'
                    ? 'Nama Sungai (cth: Sungai Perak)...'
                    : 'Nama Rute (cth: Ekspedisi Bab 2)...'
                }
                className="px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg text-[#231C14] w-56"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[#695A47]">
                Klik minimal 2 titik berurutan di peta (
                <strong className="font-mono-tabular text-[#231C14]">
                  {draftPoints.length}
                </strong>{' '}
                titik dipilih)
              </span>
              {draftPoints.length > 0 && (
                <button
                  type="button"
                  onClick={() => setDraftPoints([])}
                  className="px-2.5 py-1.5 text-xs font-medium text-[#695A47] hover:text-[#231C14] border border-[#D8CBB3] bg-[#FBF8F1] rounded-lg cursor-pointer"
                >
                  Reset Titik
                </button>
              )}
              <button
                type="button"
                disabled={draftPoints.length < 2}
                onClick={handleFinishRiverOrRoute}
                className="px-3.5 py-1.5 text-xs font-semibold bg-[#9E2A2B] text-white rounded-lg hover:bg-[#7E2021] disabled:opacity-40 cursor-pointer flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                Simpan Jalur ({draftPoints.length} Titik)
              </button>
            </div>
          </div>
        )}

        {toolMode === 'measure' && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-[#231C14]">
                <strong className="text-[#9E2A2B]">
                  Pengukur Jarak & Kalkulator Waktu Tempuh:
                </strong>{' '}
                Klik dua lokasi atau titik mana saja di atas peta untuk mengukur
                jarak dan estimasi hari perjalanan.
              </div>
              {measuredDistance && (
                <div className="flex items-center gap-3 bg-[#FBF8F1] border border-[#D8CBB3] px-3.5 py-1.5 rounded-lg">
                  <span className="text-xs text-[#695A47]">
                    <strong>{measurePointA?.label}</strong> →{' '}
                    <strong>{measurePointB?.label}</strong>:
                  </span>
                  <span className="font-mono-tabular text-sm font-bold text-[#9E2A2B]">
                    {measuredDistance.totalLeagues} Liga (~
                    {measuredDistance.totalKm} km)
                  </span>
                </div>
              )}
            </div>

            {measuredDistance && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                {TRAVEL_MODES.map((tm) => {
                  const days = Math.max(
                    0.5,
                    Number(
                      (
                        measuredDistance.totalLeagues / tm.leaguesPerDay
                      ).toFixed(1)
                    )
                  );
                  return (
                    <div
                      key={tm.id}
                      className="p-2.5 rounded-lg bg-[#FBF8F1] border border-[#D8CBB3] space-y-0.5"
                    >
                      <div className="text-[11px] font-semibold text-[#695A47]">
                        {tm.label}
                      </div>
                      <div className="font-mono-tabular text-base font-bold text-[#231C14]">
                        {days} Hari
                      </div>
                      <div className="text-[10px] text-[#9E2A2B]">
                        Kecepatan {tm.leaguesPerDay} Liga/hari ({tm.note})
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* 3. MAIN MAP CANVAS & RIGHT INSPECTOR SPLIT                            */}
      {/* ===================================================================== */}
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
              toolMode === 'terrain' ||
              toolMode === 'river_route' ||
              toolMode === 'measure'
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

            {/* Floating Distance Badge on Map when measuring */}
            {toolMode === 'measure' &&
              measurePointA &&
              measurePointB &&
              measuredDistance && (
                <div
                  style={{
                    left: `${(measurePointA.x + measurePointB.x) / 2}%`,
                    top: `${(measurePointA.y + measurePointB.y) / 2}%`,
                    transform: 'translate(-50%, -120%)',
                  }}
                  className="pointer-events-none absolute z-20 px-3 py-1 rounded-lg bg-[#231C14] text-[#FBF8F1] border border-[#B5832A] shadow-md text-xs font-mono-tabular font-bold whitespace-nowrap"
                >
                  {measuredDistance.totalLeagues} Liga (~
                  {measuredDistance.totalKm} km)
                </div>
              )}

            {/* Region Calligraphy Labels Overlay (Clickable & Draggable in inspect mode) */}
            {showLabelsLayer &&
              mapData.regionLabels.map((lbl) => {
                const isLabelSelected =
                  inspectorKind === 'label' && activeLabelId === lbl.id;
                return (
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
                        setActiveLabelId(lbl.id);
                        setInspectorKind('label');
                        setDraggingLabelId(lbl.id);
                      }
                    }}
                    className={`absolute select-none text-center px-1.5 py-0.5 rounded transition-all ${
                      toolMode === 'inspect'
                        ? 'cursor-grab active:cursor-grabbing hover:bg-[#F5ECD9]/50'
                        : 'pointer-events-none'
                    } ${
                      isLabelSelected
                        ? 'ring-2 ring-[#9E2A2B] bg-[#F5ECD9]/75'
                        : ''
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
                );
              })}

            {/* Hand-Illustrated Medieval Stamps & Scroll Ribbon Labels Overlay */}
            {showStampsLayer &&
              mapData.stamps.map((stamp) => {
                const isSelected =
                  inspectorKind === 'stamp' && stamp.id === activeStampId;
                return (
                  <div
                    key={stamp.id}
                    style={{
                      left: `${stamp.x}%`,
                      top: `${stamp.y}%`,
                      transform: 'translate(-50%, -55%)',
                    }}
                    onPointerDown={(e) => {
                      if (toolMode === 'measure') {
                        // Let measure click pass through & snap to this stamp!
                        return;
                      }
                      e.stopPropagation();
                      setActiveStampId(stamp.id);
                      setInspectorKind('stamp');
                      if (toolMode === 'inspect') {
                        setDraggingStampId(stamp.id);
                      }
                    }}
                    className={`absolute z-10 group flex flex-col items-center ${
                      toolMode === 'measure'
                        ? 'pointer-events-none'
                        : 'cursor-pointer'
                    }`}
                  >
                    <MedievalStampArtwork
                      type={stamp.type}
                      color={stamp.nationColor || '#8B1E1E'}
                      isSelected={isSelected}
                    />
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

        {/* =================================================================== */}
        {/* 4. RIGHT CARTOGRAPHY INSPECTOR PANEL (STAMPS, LABELS, RIVERS/ROUTES)*/}
        {/* =================================================================== */}
        <div className="xl:col-span-3 bg-[#FBF8F1] border border-[#D8CBB3] rounded-xl p-4 space-y-4">
          {/* Switcher between Stamp Inspector and Label Inspector */}
          <div className="flex items-center gap-1.5 bg-[#EFE7D6] p-1 rounded-lg border border-[#D8CBB3]">
            <button
              type="button"
              onClick={() => setInspectorKind('stamp')}
              className={`flex-1 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
                inspectorKind === 'stamp'
                  ? 'bg-[#9E2A2B] text-white'
                  : 'text-[#231C14] hover:bg-[#FBF8F1]'
              }`}
            >
              Lokasi Pin ({mapData.stamps.length})
            </button>
            <button
              type="button"
              onClick={() => setInspectorKind('label')}
              className={`flex-1 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
                inspectorKind === 'label'
                  ? 'bg-[#9E2A2B] text-white'
                  : 'text-[#231C14] hover:bg-[#FBF8F1]'
              }`}
            >
              Kaligrafi ({mapData.regionLabels.length})
            </button>
          </div>

          {/* PANEL A: STAMP LOCATION INSPECTOR */}
          {inspectorKind === 'stamp' && (
            <>
              {activeStamp ? (
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-[#695A47] mb-1">
                      Nama Tempat di Peta
                    </label>
                    <input
                      type="text"
                      value={activeStamp.label}
                      onChange={(e) =>
                        onChangeMapData({
                          ...mapData,
                          stamps: mapData.stamps.map((s) =>
                            s.id === activeStamp.id
                              ? { ...s, label: e.target.value }
                              : s
                          ),
                        })
                      }
                      className="w-full px-3 py-1.5 text-sm bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg text-[#231C14] font-semibold"
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

                  {/* Kingdom Flag / Banner Color Picker */}
                  <div>
                    <label className="block text-xs font-medium text-[#695A47] mb-1">
                      Warna Panji Kerajaan / Faksi
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {BANNER_COLORS.map((c) => (
                        <button
                          key={c.hex}
                          type="button"
                          onClick={() =>
                            onChangeMapData({
                              ...mapData,
                              stamps: mapData.stamps.map((s) =>
                                s.id === activeStamp.id
                                  ? { ...s, nationColor: c.hex }
                                  : s
                              ),
                            })
                          }
                          className={`px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1.5 border cursor-pointer ${
                            (activeStamp.nationColor || '#9E2A2B') === c.hex
                              ? 'bg-[#EFE7D6] border-[#231C14] font-semibold text-[#231C14]'
                              : 'bg-[#F6F1E6] border-[#D8CBB3] text-[#695A47]'
                          }`}
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: c.hex }}
                          />
                          <span className="truncate">{c.label}</span>
                        </button>
                      ))}
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
                              ? {
                                  ...s,
                                  linkedEntityId: e.target.value || undefined,
                                }
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
                        {CATEGORY_META[linkedEntity.category].singular}{' '}
                        Terhubung
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
                        className="w-full mt-1 px-3 py-2 text-xs font-semibold bg-[#9E2A2B] text-white rounded-lg hover:bg-[#7E2021] transition-colors cursor-pointer"
                      >
                        Buka Lembar Lore Lengkap →
                      </button>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-lg bg-[#F6F1E6] border border-[#D8CBB3] space-y-2.5">
                      <div className="text-xs text-[#695A47]">
                        Lokasi <strong>{activeStamp.label}</strong> belum
                        memiliki lembar entri di World Bible.
                      </div>
                      {onCreateEntityFromStamp && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-[#695A47]">
                              Jadikan Kategori:
                            </span>
                            <select
                              value={promoteCategory}
                              onChange={(e) =>
                                setPromoteCategory(
                                  e.target.value as LoreCategory
                                )
                              }
                              className="flex-1 px-2 py-1 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded text-[#231C14]"
                            >
                              <option value="region">Wilayah</option>
                              <option value="nation">Negara / Kerajaan</option>
                              <option value="faction">Kelompok / Markas</option>
                              <option value="history">Situs Sejarah</option>
                              <option value="encyclopedia">
                                Artefak & Biota
                              </option>
                            </select>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              onCreateEntityFromStamp(
                                activeStamp,
                                promoteCategory
                              )
                            }
                            className="w-full px-3 py-2 text-xs font-semibold bg-[#231C14] text-[#FBF8F1] rounded-lg hover:bg-[#3A2E21] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <FilePlus2 className="w-3.5 h-3.5 text-[#B5832A]" />
                            + Buat Entri World Bible dari Pin Ini
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      const remaining = mapData.stamps.filter(
                        (s) => s.id !== activeStamp.id
                      );
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
                <div className="text-xs text-[#695A47] py-4 text-center">
                  Klik salah satu simbol kastil atau kota di atas peta untuk
                  melihat detail lokasinya.
                </div>
              )}

              {/* List of all map stamps */}
              <div className="pt-3 border-t border-[#D8CBB3]">
                <div className="text-xs font-semibold text-[#695A47] mb-2">
                  Daftar Tempat di Peta ({mapData.stamps.length})
                </div>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {mapData.stamps.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setActiveStampId(s.id);
                        setInspectorKind('stamp');
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        s.id === activeStampId
                          ? 'bg-[#EFE7D6] text-[#231C14] font-semibold border border-[#D8CBB3]'
                          : 'text-[#695A47] hover:bg-[#F6F1E6]'
                      }`}
                    >
                      <span className="truncate flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{
                            backgroundColor: s.nationColor || '#9E2A2B',
                          }}
                        />
                        {s.label}
                      </span>
                      <span className="font-mono-tabular text-[11px] text-[#695A47] shrink-0 ml-2">
                        {s.x}°,{s.y}°
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* PANEL B: REGION CALLIGRAPHY LABEL INSPECTOR */}
          {inspectorKind === 'label' && (
            <>
              {activeLabel ? (
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-[#695A47] mb-1">
                      Teks Kaligrafi Wilayah
                    </label>
                    <input
                      type="text"
                      value={activeLabel.text}
                      onChange={(e) =>
                        onChangeMapData({
                          ...mapData,
                          regionLabels: mapData.regionLabels.map((l) =>
                            l.id === activeLabel.id
                              ? { ...l, text: e.target.value }
                              : l
                          ),
                        })
                      }
                      className="w-full px-3 py-1.5 text-sm bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg text-[#231C14] font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#695A47] mb-1">
                      Gaya Kaligrafi Peta
                    </label>
                    <select
                      value={activeLabel.style}
                      onChange={(e) =>
                        onChangeMapData({
                          ...mapData,
                          regionLabels: mapData.regionLabels.map((l) =>
                            l.id === activeLabel.id
                              ? {
                                  ...l,
                                  style: e.target.value as
                                    | 'empire'
                                    | 'region'
                                    | 'sea',
                                }
                              : l
                          ),
                        })
                      }
                      className="w-full px-3 py-1.5 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg text-[#231C14]"
                    >
                      <option value="empire">
                        Kaligrafi Kerajaan / Negara Besar
                      </option>
                      <option value="region">
                        Kaligrafi Wilayah / Rimba / Pegunungan
                      </option>
                      <option value="sea">
                        Kaligrafi Miring Samudra / Teluk
                      </option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-[#695A47]">
                        Rotasi / Kemiringan Teks
                      </span>
                      <span className="font-mono-tabular font-semibold text-[#231C14]">
                        {activeLabel.rotation || 0}°
                      </span>
                    </div>
                    <input
                      type="range"
                      min={-90}
                      max={90}
                      step={2}
                      value={activeLabel.rotation || 0}
                      onChange={(e) =>
                        onChangeMapData({
                          ...mapData,
                          regionLabels: mapData.regionLabels.map((l) =>
                            l.id === activeLabel.id
                              ? { ...l, rotation: Number(e.target.value) }
                              : l
                          ),
                        })
                      }
                      className="w-full accent-[#9E2A2B]"
                    />
                    <div className="flex justify-between text-[10px] text-[#695A47] mt-1">
                      <button
                        type="button"
                        onClick={() =>
                          onChangeMapData({
                            ...mapData,
                            regionLabels: mapData.regionLabels.map((l) =>
                              l.id === activeLabel.id
                                ? { ...l, rotation: -15 }
                                : l
                            ),
                          })
                        }
                        className="underline cursor-pointer"
                      >
                        -15°
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onChangeMapData({
                            ...mapData,
                            regionLabels: mapData.regionLabels.map((l) =>
                              l.id === activeLabel.id
                                ? { ...l, rotation: 0 }
                                : l
                            ),
                          })
                        }
                        className="underline cursor-pointer"
                      >
                        Reset 0°
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onChangeMapData({
                            ...mapData,
                            regionLabels: mapData.regionLabels.map((l) =>
                              l.id === activeLabel.id
                                ? { ...l, rotation: 15 }
                                : l
                            ),
                          })
                        }
                        className="underline cursor-pointer"
                      >
                        +15°
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const remaining = mapData.regionLabels.filter(
                        (l) => l.id !== activeLabel.id
                      );
                      onChangeMapData({ ...mapData, regionLabels: remaining });
                      setActiveLabelId(remaining[0]?.id ?? null);
                    }}
                    className="w-full px-3 py-1.5 text-xs font-medium text-[#9E2A2B] border border-[#9E2A2B]/40 rounded-lg hover:bg-[#9E2A2B]/10 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Hapus Teks Kaligrafi
                  </button>
                </div>
              ) : (
                <div className="text-xs text-[#695A47] py-4 text-center">
                  Pilih salah satu teks kaligrafi di peta atau dari daftar di
                  bawah.
                </div>
              )}

              <div className="pt-3 border-t border-[#D8CBB3]">
                <div className="text-xs font-semibold text-[#695A47] mb-2">
                  Daftar Kaligrafi Wilayah ({mapData.regionLabels.length})
                </div>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {mapData.regionLabels.map((lbl) => (
                    <button
                      key={lbl.id}
                      type="button"
                      onClick={() => {
                        setActiveLabelId(lbl.id);
                        setInspectorKind('label');
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        lbl.id === activeLabelId
                          ? 'bg-[#EFE7D6] text-[#231C14] font-semibold border border-[#D8CBB3]'
                          : 'text-[#695A47] hover:bg-[#F6F1E6]'
                      }`}
                    >
                      <span className="truncate">{lbl.text}</span>
                      <span className="font-mono-tabular text-[11px] text-[#695A47] shrink-0 ml-2">
                        {lbl.rotation || 0}°
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Rivers & Routes Management List at Bottom of Inspector */}
          <div className="pt-3 border-t border-[#D8CBB3] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#695A47]">
                Jaringan Sungai ({mapData.rivers.length}) & Rute (
                {routes.length})
              </span>
              <button
                type="button"
                onClick={() => {
                  setDraftPoints([]);
                  setToolMode('river_route');
                }}
                className="text-[11px] font-semibold text-[#9E2A2B] hover:underline cursor-pointer"
              >
                + Gambar Baru
              </button>
            </div>

            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {mapData.rivers.map((rv) => (
                <div
                  key={rv.id}
                  className="px-2.5 py-1.5 rounded-lg bg-[#F6F1E6] border border-[#D8CBB3] flex items-center justify-between text-xs"
                >
                  <span className="truncate text-[#264653] font-medium">
                    [Sungai] {rv.name}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      onChangeMapData({
                        ...mapData,
                        rivers: mapData.rivers.filter((r) => r.id !== rv.id),
                      })
                    }
                    className="text-[#695A47] hover:text-[#9E2A2B] cursor-pointer ml-2"
                    title="Hapus sungai"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {routes.map((rt) => (
                <div
                  key={rt.id}
                  className="px-2.5 py-1.5 rounded-lg bg-[#F6F1E6] border border-[#D8CBB3] flex items-center justify-between text-xs"
                >
                  <span className="truncate text-[#9E2A2B] font-medium">
                    [
                    {rt.style === 'road'
                      ? 'Jalan'
                      : rt.style === 'expedition'
                      ? 'Ekspedisi'
                      : 'Pelayaran'}
                    ] {rt.name}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      onChangeMapData({
                        ...mapData,
                        routes: routes.filter((r) => r.id !== rt.id),
                      })
                    }
                    className="text-[#695A47] hover:text-[#9E2A2B] cursor-pointer ml-2"
                    title="Hapus rute"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
