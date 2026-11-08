import React, { useEffect, useRef, useState } from 'react';
import {
  Castle,
  Compass,
  Download,
  Eye,
  Flame,
  Landmark,
  MapPin,
  Mountain,
  Navigation,
  Paintbrush,
  Plus,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Trash2,
  Trees,
  Type as TypeIcon,
  Waves,
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
  fill: string;
  stroke: string;
  desc: string;
}> = [
  {
    type: 'plains',
    label: 'Daratan Perkamen',
    fill: '#EDE0C4',
    stroke: '#8B7355',
    desc: 'Padang rumput & daratan kerajaan',
  },
  {
    type: 'mountain',
    label: 'Pegunungan Kuno',
    fill: '#DFCDAE',
    stroke: '#5C4934',
    desc: 'Puncak gunung sketsa kartografi',
  },
  {
    type: 'forest',
    label: 'Hutan Rimba',
    fill: '#DCE2C8',
    stroke: '#3A5A40',
    desc: 'Kanopi hutan belantara & rimba suci',
  },
  {
    type: 'desert',
    label: 'Gurun Surya',
    fill: '#F2DCAC',
    stroke: '#B5832A',
    desc: 'Bukit pasir & tanah tandus',
  },
  {
    type: 'swamp',
    label: 'Rawa Kabut',
    fill: '#D3D5C2',
    stroke: '#526056',
    desc: 'Lahan basah & rawa beracun',
  },
  {
    type: 'tundra',
    label: 'Salju Utara',
    fill: '#F4F1EA',
    stroke: '#7A8B99',
    desc: 'Daratan es & pegunungan beku',
  },
  {
    type: 'shallows',
    label: 'Pesisir Dangkal',
    fill: '#D8CFC0',
    stroke: '#8F8470',
    desc: 'Garis pantai & selat dangkal',
  },
  {
    type: 'sea',
    label: 'Samudra Kuno',
    fill: '#E2D8C5',
    stroke: '#A39681',
    desc: 'Lautan lepas bertekstur gelombang klasik',
  },
];

const STAMP_PALETTE: Array<{
  type: StampType;
  label: string;
  defaultColor: string;
}> = [
  { type: 'capital', label: 'Ibu Kota Kerajaan', defaultColor: '#9E2A2B' },
  { type: 'castle', label: 'Benteng / Kastil', defaultColor: '#8B5A2B' },
  { type: 'tower', label: 'Menara Sihir', defaultColor: '#264653' },
  { type: 'port', label: 'Pelabuhan Dagang', defaultColor: '#1D4E68' },
  { type: 'shrine', label: 'Kuil / Pohon Suci', defaultColor: '#2D5A43' },
  { type: 'ruins', label: 'Reruntuhan Kuno', defaultColor: '#695A47' },
  { type: 'village', label: 'Desa / Permukiman', defaultColor: '#7F5539' },
  { type: 'battlefield', label: 'Medan Pertempuran', defaultColor: '#9E2A2B' },
];

export const MedievalMapSandbox: React.FC<MedievalMapSandboxProps> = ({
  mapData,
  entities,
  onChangeMapData,
  onSelectEntity,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [toolMode, setToolMode] = useState<'inspect' | 'terrain' | 'stamp' | 'label'>('terrain');
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
  const [isPainting, setIsPainting] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [zoom, setZoom] = useState<number>(1);

  const activeStamp = mapData.stamps.find((s) => s.id === activeStampId) || null;
  const linkedEntity = activeStamp?.linkedEntityId
    ? entities.find((e) => e.id === activeStamp.linkedEntityId) || null
    : null;

  // Draw the medieval parchment terrain onto the HTML5 canvas
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

    // 1. Base aged ocean parchment background
    ctx.fillStyle = '#E3D9C6';
    ctx.fillRect(0, 0, width, height);

    // Subtle vintage horizontal wave hatching in deep sea
    ctx.strokeStyle = 'rgba(128, 112, 90, 0.22)';
    ctx.lineWidth = 1;
    for (let y = 12; y < height; y += 16) {
      ctx.beginPath();
      for (let x = 0; x < width; x += 24) {
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x + 6, y - 2.5, x + 12, y);
        ctx.quadraticCurveTo(x + 18, y + 2.5, x + 24, y);
      }
      ctx.stroke();
    }

    const isLand = (col: number, row: number) => {
      if (col < 0 || col >= gridCols || row < 0 || row >= gridRows) return false;
      const t = cells[row * gridCols + col];
      return t !== 'sea' && t !== 'shallows';
    };

    // 2. Render cells
    for (let r = 0; r < gridRows; r++) {
      for (let c = 0; c < gridCols; c++) {
        const terrain = cells[r * gridCols + c];
        const x = c * cellW;
        const y = r * cellH;

        if (terrain === 'shallows') {
          ctx.fillStyle = '#DCD1BE';
          ctx.fillRect(x, y, cellW + 0.8, cellH + 0.8);
          continue;
        }

        if (terrain === 'sea') continue;

        // Fill land biome color
        const paletteEntry = TERRAIN_PALETTE.find((p) => p.type === terrain);
        ctx.fillStyle = paletteEntry ? paletteEntry.fill : '#EDE0C4';
        ctx.fillRect(x, y, cellW + 0.8, cellH + 0.8);

        // Draw medieval coastline ripples & dark sepia ink border where land meets water
        const neighbors = [
          { dc: 0, dr: -1, x1: x, y1: y, x2: x + cellW, y2: y },
          { dc: 1, dr: 0, x1: x + cellW, y1: y, x2: x + cellW, y2: y + cellH },
          { dc: 0, dr: 1, x1: x, y1: y + cellH, x2: x + cellW, y2: y + cellH },
          { dc: -1, dr: 0, x1: x, y1: y, x2: x, y2: y + cellH },
        ];

        for (const n of neighbors) {
          if (!isLand(c + n.dc, r + n.dr)) {
            // Outer medieval coast hatching shadow
            ctx.strokeStyle = 'rgba(110, 90, 65, 0.35)';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(n.x1 + n.dc * 2, n.y1 + n.dr * 2);
            ctx.lineTo(n.x2 + n.dc * 2, n.y2 + n.dr * 2);
            ctx.stroke();

            // Crisp iron-gall ink coastline
            ctx.strokeStyle = '#3B2E1E';
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.moveTo(n.x1, n.y1);
            ctx.lineTo(n.x2, n.y2);
            ctx.stroke();
          }
        }

        // Draw hand-sketched cartography biome symbols inside cell
        const cx = x + cellW / 2;
        const cy = y + cellH / 2;

        if (terrain === 'mountain') {
          ctx.strokeStyle = '#4A3825';
          ctx.fillStyle = '#C9B596';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(cx - cellW * 0.38, cy + cellH * 0.28);
          ctx.lineTo(cx, cy - cellH * 0.32);
          ctx.lineTo(cx + cellW * 0.38, cy + cellH * 0.28);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Shaded east slope of mountain
          ctx.fillStyle = 'rgba(74, 56, 37, 0.28)';
          ctx.beginPath();
          ctx.moveTo(cx, cy - cellH * 0.32);
          ctx.lineTo(cx + cellW * 0.38, cy + cellH * 0.28);
          ctx.lineTo(cx, cy + cellH * 0.28);
          ctx.closePath();
          ctx.fill();
        } else if (terrain === 'forest') {
          ctx.fillStyle = '#4A6B4E';
          ctx.strokeStyle = '#2A402D';
          ctx.lineWidth = 1.2;
          // Three small tree crowns
          const offsets = [
            [-cellW * 0.18, cellH * 0.08],
            [cellW * 0.18, cellH * 0.08],
            [0, -cellH * 0.14],
          ];
          for (const [ox, oy] of offsets) {
            ctx.beginPath();
            ctx.arc(cx + ox, cy + oy, Math.min(cellW, cellH) * 0.19, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          }
        } else if (terrain === 'desert') {
          ctx.strokeStyle = '#9C7125';
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          ctx.moveTo(cx - cellW * 0.3, cy + 2);
          ctx.quadraticCurveTo(cx, cy - 6, cx + cellW * 0.3, cy + 2);
          ctx.stroke();
        } else if (terrain === 'swamp') {
          ctx.strokeStyle = '#4F5D53';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(cx - 8, cy + 3);
          ctx.lineTo(cx + 8, cy + 3);
          ctx.moveTo(cx - 3, cy + 3);
          ctx.lineTo(cx - 5, cy - 4);
          ctx.moveTo(cx, cy + 3);
          ctx.lineTo(cx, cy - 6);
          ctx.moveTo(cx + 3, cy + 3);
          ctx.lineTo(cx + 5, cy - 4);
          ctx.stroke();
        } else if (terrain === 'tundra') {
          ctx.strokeStyle = '#7E909A';
          ctx.lineWidth = 1.1;
          ctx.beginPath();
          ctx.moveTo(cx - 5, cy);
          ctx.lineTo(cx + 5, cy);
          ctx.moveTo(cx, cy - 5);
          ctx.lineTo(cx, cy + 5);
          ctx.stroke();
        }
      }
    }

    // 3. Draw Winding Rivers
    for (const river of rivers) {
      if (river.points.length < 2) continue;
      ctx.save();
      ctx.strokeStyle = '#4A6E7D';
      ctx.lineWidth = 3.2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      river.points.forEach((pt, idx) => {
        const px = (pt.x / 100) * width;
        const py = (pt.y / 100) * height;
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
      ctx.restore();
    }

    // 4. Optional Cartography Coordinate Grid & Rhumb Lines
    if (showGrid) {
      ctx.save();
      ctx.strokeStyle = 'rgba(92, 73, 52, 0.14)';
      ctx.lineWidth = 0.8;
      for (let c = 0; c <= gridCols; c++) {
        ctx.beginPath();
        ctx.moveTo(c * cellW, 0);
        ctx.lineTo(c * cellW, height);
        ctx.stroke();
      }
      for (let r = 0; r <= gridRows; r++) {
        ctx.beginPath();
        ctx.moveTo(0, r * cellH);
        ctx.lineTo(width, r * cellH);
        ctx.stroke();
      }

      // Faint decorative compass rhumb lines radiating from bottom-left compass rose
      const roseX = width * 0.11;
      const roseY = height * 0.82;
      ctx.strokeStyle = 'rgba(139, 115, 85, 0.16)';
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
        ctx.beginPath();
        ctx.moveTo(roseX, roseY);
        ctx.lineTo(roseX + Math.cos(angle) * width * 1.2, roseY + Math.sin(angle) * width * 1.2);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 5. Ornate Medieval Double Frame Border
    ctx.save();
    ctx.strokeStyle = '#3B2E1E';
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, width - 6, height - 6);
    ctx.strokeStyle = '#B5832A';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(10, 10, width - 20, height - 20);
    ctx.restore();
  }, [mapData, showGrid]);

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
        if (c >= 0 && c < mapData.gridCols && r >= 0 && r < mapData.gridRows) {
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
    const pctX = Math.max(3, Math.min(97, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
    const pctY = Math.max(4, Math.min(96, Math.round(((e.clientY - rect.top) / rect.height) * 100)));

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
        nationColor: meta?.defaultColor || '#9E2A2B',
      };

      onChangeMapData({
        ...mapData,
        stamps: [...mapData.stamps, created],
      });
      setActiveStampId(created.id);
      setNewStampLabel('');
      setToolMode('inspect');
    } else if (toolMode === 'label') {
      const text = newRegionText.trim() || 'WILAYAH BARU';
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
      const pctX = Math.max(3, Math.min(97, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
      const pctY = Math.max(4, Math.min(96, Math.round(((e.clientY - rect.top) / rect.height) * 100)));

      onChangeMapData({
        ...mapData,
        stamps: mapData.stamps.map((s) =>
          s.id === draggingStampId ? { ...s, x: pctX, y: pctY } : s
        ),
      });
    }
  };

  const handleCanvasPointerUp = () => {
    setIsPainting(false);
    setDraggingStampId(null);
  };

  const handleGenerateRandomArchipelago = () => {
    const { gridCols, gridRows } = mapData;
    const nextCells: TerrainType[] = new Array(gridCols * gridRows).fill('sea');

    // Generate 3 organic island masses
    const seeds = [
      { cx: 10 + Math.random() * 5, cy: 8 + Math.random() * 6, rx: 7, ry: 5.5 },
      { cx: 23 + Math.random() * 5, cy: 10 + Math.random() * 5, rx: 8, ry: 6 },
      { cx: 17 + Math.random() * 4, cy: 5 + Math.random() * 3, rx: 5, ry: 3.5 },
    ];

    for (let r = 2; r < gridRows - 2; r++) {
      for (let c = 3; c < gridCols - 3; c++) {
        let minD = 99;
        for (const s of seeds) {
          const d = Math.hypot((c - s.cx) / s.rx, (r - s.cy) / s.ry);
          if (d < minD) minD = d;
        }
        if (minD < 0.45) {
          nextCells[r * gridCols + c] = r < 5 ? 'tundra' : 'mountain';
        } else if (minD < 0.72) {
          nextCells[r * gridCols + c] = (c + r) % 3 === 0 ? 'forest' : 'plains';
        } else if (minD < 0.98) {
          nextCells[r * gridCols + c] = 'plains';
        } else if (minD < 1.14) {
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

  const renderStampIcon = (type: StampType) => {
    switch (type) {
      case 'capital':
        return <Landmark className="w-4 h-4" />;
      case 'castle':
        return <Castle className="w-4 h-4" />;
      case 'tower':
        return <Sparkles className="w-4 h-4" />;
      case 'port':
        return <Waves className="w-4 h-4" />;
      case 'shrine':
        return <Trees className="w-4 h-4" />;
      case 'ruins':
        return <Mountain className="w-4 h-4" />;
      case 'battlefield':
        return <Flame className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Map Studio Control Bar */}
      <div className="bg-[#FBF8F1] border border-[#D8CBB3] rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs text-[#695A47] font-medium">
            Studio Kartografi Abad Pertengahan · {mapData.scaleLabel}
          </div>
          <h2 className="font-cartography text-2xl font-bold text-[#231C14]">
            {mapData.mapTitle}
          </h2>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#EFE7D6] p-1.5 rounded-lg border border-[#D8CBB3]">
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
            Lukis Medan (Brush)
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
            Pasang Pin & Kastil
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
            Label Kaligrafi Wilayah
          </button>
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
            Inspeksi & Geser Pin
          </button>
        </div>

        {/* Utility Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowGrid((prev) => !prev)}
            className="px-3 py-1.5 text-xs font-medium border border-[#D8CBB3] rounded-lg bg-[#F6F1E6] hover:bg-[#EFE7D6] text-[#231C14] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {showGrid ? 'Sembunyikan Grid' : 'Tampilkan Grid'}
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
      <div className="bg-[#EFE7D6]/80 border border-[#D8CBB3] rounded-xl p-3.5">
        {toolMode === 'terrain' && (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-[#695A47] mr-1">
                Pilih Kuas Bioma:
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
                    className="w-3 h-3 rounded-xs border border-[#3B2E1E]/40 inline-block"
                    style={{ backgroundColor: item.fill }}
                  />
                  {item.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#695A47]">Ukuran Kuas:</span>
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
              1. Pilih Ikon Kartografi:
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
                  {renderStampIcon(st.type)}
                  {st.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2 ml-auto">
              <input
                type="text"
                value={newStampLabel}
                onChange={(e) => setNewStampLabel(e.target.value)}
                placeholder="Nama Lokasi (opsional)..."
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
                → Klik di mana saja pada peta untuk menaruh pin
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
              placeholder="Contoh: KEKAISARAN VALORIA atau Teluk Kabut..."
              className="px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg text-[#231C14] w-64 focus:outline-none focus:border-[#9E2A2B]"
            />
            <select
              value={newRegionStyle}
              onChange={(e) =>
                setNewRegionStyle(e.target.value as 'empire' | 'region' | 'sea')
              }
              className="px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg text-[#231C14]"
            >
              <option value="empire">Gaya Nama Kekaisaran / Negara Besar</option>
              <option value="region">Gaya Nama Wilayah / Hutan / Gunung</option>
              <option value="sea">Gaya Kaligrafi Miring Samudra / Teluk</option>
            </select>
            <span className="text-xs text-[#9E2A2B] font-medium">
              → Klik titik di peta untuk menempelkan label wilayah
            </span>
          </div>
        )}

        {toolMode === 'inspect' && (
          <div className="flex items-center justify-between text-xs text-[#695A47]">
            <span>
              Mode Inspeksi Aktif: Klik pin lokasi untuk membaca Lore World Bible terkait, atau tahan & geser pin untuk memindahkan posisinya di peta.
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
        {/* Interactive Map Viewport */}
        <div className="xl:col-span-9 bg-[#EFE7D6] border border-[#D8CBB3] rounded-xl p-3 overflow-auto">
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
            className={`relative w-full aspect-[16/10] select-none rounded-lg overflow-hidden shadow-sm transition-transform duration-150 ${
              toolMode === 'terrain'
                ? 'cursor-crosshair'
                : toolMode === 'stamp' || toolMode === 'label'
                ? 'cursor-copy'
                : 'cursor-default'
            }`}
          >
            <canvas
              ref={canvasRef}
              width={1080}
              height={660}
              className="w-full h-full block"
            />

            {/* Cartouche Title Box (Bottom Left Compass Rose & Legend Ornament) */}
            <div className="pointer-events-none absolute bottom-5 left-6 flex items-center gap-3 bg-[#FBF8F1]/90 border border-[#8B7355] px-3.5 py-2 rounded shadow-xs">
              <Compass className="w-8 h-8 text-[#9E2A2B] shrink-0" />
              <div>
                <div className="font-cartography text-xs font-bold tracking-wider text-[#231C14]">
                  {mapData.mapTitle.toUpperCase()}
                </div>
                <div className="text-[11px] text-[#695A47]">
                  {mapData.scaleLabel} · {mapData.stamps.length} Titik Lokasi
                </div>
              </div>
            </div>

            {/* Region Calligraphy Labels Overlay */}
            {mapData.regionLabels.map((lbl) => (
              <div
                key={lbl.id}
                style={{
                  left: `${lbl.x}%`,
                  top: `${lbl.y}%`,
                  transform: `translate(-50%, -50%) rotate(${lbl.rotation || 0}deg)`,
                }}
                className="absolute pointer-events-none select-none text-center"
              >
                <span
                  className={
                    lbl.style === 'empire'
                      ? 'font-cartography text-sm md:text-base font-bold tracking-[0.22em] text-[#3B2314]/85 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]'
                      : lbl.style === 'sea'
                      ? 'font-display italic text-sm md:text-base font-semibold tracking-wider text-[#3D5A6C]/85'
                      : 'font-cartography text-xs md:text-sm font-semibold tracking-[0.15em] text-[#2D4732]/90 drop-shadow-[0_1px_1px_rgba(255,255,255,0.75)]'
                  }
                >
                  {lbl.text}
                </span>
              </div>
            ))}

            {/* Interactive Stamps & Lore Pins Overlay */}
            {mapData.stamps.map((stamp) => {
              const isSelected = stamp.id === activeStampId;
              return (
                <div
                  key={stamp.id}
                  style={{
                    left: `${stamp.x}%`,
                    top: `${stamp.y}%`,
                    transform: 'translate(-50%, -50%)',
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
                  <div
                    style={{
                      backgroundColor: isSelected
                        ? stamp.nationColor || '#9E2A2B'
                        : '#FBF8F1',
                      color: isSelected
                        ? '#FFFFFF'
                        : stamp.nationColor || '#231C14',
                      borderColor: stamp.nationColor || '#3B2E1E',
                    }}
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shadow-sm transition-transform duration-150 group-hover:scale-110 ${
                      isSelected ? 'ring-4 ring-[#9E2A2B]/30 scale-110' : ''
                    }`}
                  >
                    {renderStampIcon(stamp.type)}
                  </div>
                  <span className="mt-1 px-2 py-0.5 rounded bg-[#FBF8F1]/95 border border-[#8B7355]/60 text-[11px] font-semibold text-[#231C14] whitespace-nowrap shadow-2xs">
                    {stamp.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Pin & Lore Inspector Panel */}
        <div className="xl:col-span-3 bg-[#FBF8F1] border border-[#D8CBB3] rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-[#D8CBB3] pb-3">
            <div>
              <span className="text-xs text-[#695A47]">Detail Pin Peta</span>
              <h3 className="font-display text-xl font-bold text-[#231C14]">
                Inspektor Kartografi
              </h3>
            </div>
            <Navigation className="w-5 h-5 text-[#9E2A2B]" />
          </div>

          {activeStamp ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#695A47] mb-1">
                  Nama Titik Lokasi di Peta
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

              <div className="flex items-center justify-between text-xs text-[#695A47] font-mono-tabular">
                <span>Koordinat Peta:</span>
                <span>
                  X: {activeStamp.x}% · Y: {activeStamp.y}%
                </span>
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
                  Pin ini belum dihubungkan ke entitas World Bible. Pilih salah satu entitas di atas agar terintegrasi.
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
                Hapus Pin Ini dari Peta
              </button>
            </div>
          ) : (
            <div className="text-xs text-[#695A47] py-6 text-center">
              Klik salah satu pin di atas kanvas peta untuk melihat detail lokasinya.
            </div>
          )}

          {/* List of all map stamps */}
          <div className="pt-3 border-t border-[#D8CBB3]">
            <div className="text-xs font-semibold text-[#695A47] mb-2">
              Daftar Lokasi di Peta ({mapData.stamps.length})
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
                    {s.x},{s.y}
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
