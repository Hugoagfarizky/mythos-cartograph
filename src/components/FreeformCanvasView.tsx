import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowUpRight,
  BookOpen,
  Eraser,
  Eye,
  EyeOff,
  FilePlus2,
  Frame,
  Link2,
  Maximize2,
  Minimize2,
  MousePointer,
  PenTool,
  RotateCcw,
  Sparkles,
  StickyNote,
  Trash2,
  Undo2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import {
  ChapterOutline,
  FreeCanvasCard,
  FreeCanvasCardColor,
  FreeCanvasData,
  FreeCanvasLink,
  FreeCanvasStroke,
  FreeCanvasZone,
  LoreCategory,
  LoreEntity,
} from '../types/world';
import {
  CATEGORY_META,
  OrnateCornerFiligree,
  WikiTextRenderer,
} from './WikiTextRenderer';

const BOARD_WIDTH = 1600;
const BOARD_HEIGHT = 960;

function createConstellationCirclePoints(
  cx: number,
  cy: number,
  r: number,
  steps = 36
): Array<{ x: number; y: number }> {
  const pts: Array<{ x: number; y: number }> = [];
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * Math.PI * 2;
    pts.push({
      x: Math.round(cx + Math.cos(angle) * r),
      y: Math.round(cy + Math.sin(angle) * r),
    });
  }
  return pts;
}

export const DEFAULT_STARTER_FREE_CANVAS: FreeCanvasData = {
  boardTitle: 'Papan Konspirasi, Sketsa Sihir & Brainstorm Bebas Aethelia',
  zones: [
    {
      id: 'zone-conspiracy',
      title: 'ZONA I · KONSPIRASI ISTANA & GERHANA MERAH',
      subtitle: 'Jaringan intrik politik antara Solis Prime dan Menara Sihir',
      x: 50,
      y: 60,
      width: 680,
      height: 520,
      color: 'crimson',
    },
    {
      id: 'zone-arcane',
      title: 'ZONA II · SKEMA ARSITEKTUR SIHIR & RELIK',
      subtitle: 'Diagram resonansi kristal, hukum kosmik, dan batasan kutukan',
      x: 780,
      y: 60,
      width: 760,
      height: 520,
      color: 'teal',
    },
    {
      id: 'zone-climax',
      title: 'ZONA III · RANCANGAN KLIMAKS & PLOT TWIST BABAK AKHIR',
      subtitle: 'Papan susunan adegan puncak dan rahasia yang belum terungkap',
      x: 50,
      y: 610,
      width: 1490,
      height: 300,
      color: 'amber',
    },
  ],
  cards: [
    {
      id: 'fcard-1',
      title: 'Motif Tersembunyi Empress Seraphina',
      tagLabel: 'Intrik Politik',
      content:
        '[[Empress Seraphina Valorian]] bukan sekadar ingin menaklukkan [[Kerajaan Bawah Tanah Nidavellir]], melainkan menyembunyikan fakta bahwa fondasi [[Solis Prime]] mulai runtuh akibat penambangan eter.',
      x: 85,
      y: 135,
      width: 280,
      color: 'crimson',
      linkedEntityId: 'char-seraphina',
    },
    {
      id: 'fcard-2',
      title: 'Peringatan Archmage Vaelen',
      tagLabel: 'Protagonis · Bab 1',
      content:
        '[[Archmage Vaelen Thorne]] menemukan bahwa retakan pada [[Astrolabe Api Surya]] sengaja dibuat dari dalam istana 12 tahun silam.',
      x: 415,
      y: 135,
      width: 280,
      color: 'parchment',
      linkedEntityId: 'char-vaelen',
      linkedChapterId: 'chap-1',
    },
    {
      id: 'fcard-3',
      title: 'Agen Ganda di Teluk Naga',
      tagLabel: 'Calon Entitas Baru',
      content:
        'Ide Tokoh Baru: **Kapten Veyra dari Kabut** yang menyelundupkan [[Bunga Lentera Malam]] untuk memalsukan tanda-tanda kutukan kristalisasi di kalangan bangsawan [[Kekaisaran Gondoria]].',
      x: 245,
      y: 365,
      width: 310,
      color: 'amethyst',
    },
    {
      id: 'fcard-4',
      title: 'Anomali Resonansi Gerhana Kedua',
      tagLabel: 'Hukum Sihir',
      content:
        'Ketika kedua bulan sejajar pada [[Konvergensi Gerhana Merah]], aturan [[Resonansi Eteris Astral]] berbalik: rapalan cahaya matahari justru menyerap energi hidup penggunanya.',
      x: 820,
      y: 135,
      width: 300,
      color: 'teal',
      linkedEntityId: 'ps-astral',
    },
    {
      id: 'fcard-5',
      title: 'Kunci Besi-Bintang Nidavellir',
      tagLabel: 'Relik & Bioma',
      content:
        'Bangsa [[Dvergr Besi-Bintang]] menyimpan cetakan asli cincin ketiga [[Astrolabe Api Surya]] di dasar kawah tempa mereka.',
      x: 1200,
      y: 135,
      width: 295,
      color: 'emerald',
      linkedEntityId: 'nat-nidavellir',
    },
    {
      id: 'fcard-6',
      title: 'Twist Puncak: Kota Tenggelam Bangkit',
      tagLabel: 'Ide Bab Puncak',
      content:
        'Saat [[Tombak Fajar Solis]] ditembakkan ke langit, permukaan laut barat surut dan menyingkap reruntuhan observatorium purba milik [[Sylvan Aelfir]].',
      x: 420,
      y: 680,
      width: 380,
      color: 'amber',
    },
  ],
  links: [
    {
      id: 'flink-1',
      fromCardId: 'fcard-1',
      toCardId: 'fcard-2',
      label: 'Sabotase Rahasia',
      color: 'crimson',
      dashed: true,
    },
    {
      id: 'flink-2',
      fromCardId: 'fcard-2',
      toCardId: 'fcard-4',
      label: 'Memicu Anomali',
      color: 'teal',
    },
    {
      id: 'flink-3',
      fromCardId: 'fcard-1',
      toCardId: 'fcard-3',
      label: 'Pendanaan Gelap',
      color: 'gold',
      dashed: true,
    },
    {
      id: 'flink-4',
      fromCardId: 'fcard-4',
      toCardId: 'fcard-5',
      label: 'Solusi Penstabil',
      color: 'emerald',
    },
    {
      id: 'flink-5',
      fromCardId: 'fcard-4',
      toCardId: 'fcard-6',
      label: 'Dampak Klimaks',
      color: 'gold',
    },
  ],
  strokes: [
    // Ornamental Arcane Seal / Astrolabe Diagram sketched in the Arcane Zone
    {
      id: 'stroke-circle-outer',
      color: '#B5832A',
      width: 2,
      points: createConstellationCirclePoints(1155, 435, 78, 40),
    },
    {
      id: 'stroke-circle-inner',
      color: '#9E2A2B',
      width: 2,
      points: createConstellationCirclePoints(1155, 435, 48, 32),
    },
    {
      id: 'stroke-diamond',
      color: '#264653',
      width: 2,
      points: [
        { x: 1155, y: 357 },
        { x: 1233, y: 435 },
        { x: 1155, y: 513 },
        { x: 1077, y: 435 },
        { x: 1155, y: 357 },
      ],
    },
  ],
};

const CARD_COLOR_THEMES: Record<
  FreeCanvasCardColor,
  {
    label: string;
    borderHex: string;
    accentCssVar: string;
    badgeBgClass: string;
    zoneBgStyle: string;
  }
> = {
  parchment: {
    label: 'Perkamen Klasik',
    borderHex: '#B5832A',
    accentCssVar: 'var(--accent-brass)',
    badgeBgClass: 'bg-[#EFE7D6]',
    zoneBgStyle: 'rgba(181, 131, 42, 0.06)',
  },
  crimson: {
    label: 'Segel Merah Kerajaan',
    borderHex: '#9E2A2B',
    accentCssVar: 'var(--accent-wax)',
    badgeBgClass: 'bg-[#9E2A2B]/10',
    zoneBgStyle: 'rgba(158, 42, 43, 0.06)',
  },
  teal: {
    label: 'Sian Arcana & Kosmos',
    borderHex: '#264653',
    accentCssVar: 'var(--accent-cartography)',
    badgeBgClass: 'bg-[#264653]/10',
    zoneBgStyle: 'rgba(38, 70, 83, 0.07)',
  },
  emerald: {
    label: 'Zamrud Rimba & Wilayah',
    borderHex: '#2D5A43',
    accentCssVar: 'var(--accent-forest)',
    badgeBgClass: 'bg-[#2D5A43]/10',
    zoneBgStyle: 'rgba(45, 90, 67, 0.06)',
  },
  amethyst: {
    label: 'Ungu Mistik & Rahasia',
    borderHex: '#5A3E7A',
    accentCssVar: 'var(--accent-mystic)',
    badgeBgClass: 'bg-[#5A3E7A]/10',
    zoneBgStyle: 'rgba(90, 62, 122, 0.07)',
  },
  amber: {
    label: 'Emas Surya & Kronik',
    borderHex: '#8F5B14',
    accentCssVar: 'var(--accent-amber)',
    badgeBgClass: 'bg-[#8F5B14]/10',
    zoneBgStyle: 'rgba(143, 91, 20, 0.07)',
  },
};

const LINK_COLOR_MAP: Record<
  FreeCanvasLink['color'],
  { label: string; stroke: string }
> = {
  crimson: { label: 'Benang Merah Konspirasi', stroke: 'var(--accent-wax)' },
  gold: { label: 'Garis Takdir Emas', stroke: 'var(--accent-brass)' },
  teal: { label: 'Aliran Resonansi Sihir', stroke: 'var(--accent-cartography)' },
  emerald: { label: 'Jalur Aliansi & Alam', stroke: 'var(--accent-forest)' },
};

const INK_PALETTE = [
  { label: 'Merah Segel', hex: '#C83E3B' },
  { label: 'Emas Kuningan', hex: '#D49B35' },
  { label: 'Sian Arcana', hex: '#3B8EA5' },
  { label: 'Hijau Zamrud', hex: '#3E8E63' },
  { label: 'Tinta Sepia', hex: '#7A6248' },
];

type CanvasToolMode =
  | 'select'
  | 'draw'
  | 'connect'
  | 'add_card'
  | 'add_zone';

interface FreeformCanvasViewProps {
  canvasData?: FreeCanvasData;
  entities: LoreEntity[];
  chapters: ChapterOutline[];
  onChangeCanvasData: (next: FreeCanvasData) => void;
  onSelectEntity: (entityId: string) => void;
  onOpenChapter: (chapterId: string) => void;
  onQuickCreateEntity: (
    title: string,
    category: LoreCategory,
    openAfterCreate?: boolean
  ) => void;
  onPromoteCardToEntity: (
    card: FreeCanvasCard,
    category: LoreCategory
  ) => void;
}

export const FreeformCanvasView: React.FC<FreeformCanvasViewProps> = ({
  canvasData,
  entities,
  chapters,
  onChangeCanvasData,
  onSelectEntity,
  onOpenChapter,
  onQuickCreateEntity,
  onPromoteCardToEntity,
}) => {
  const board: FreeCanvasData = canvasData || DEFAULT_STARTER_FREE_CANVAS;

  const [toolMode, setToolMode] = useState<CanvasToolMode>('select');
  const [zoom, setZoom] = useState<number>(0.95);
  const [isFullWidth, setIsFullWidth] = useState<boolean>(false);
  const [showInkLayer, setShowInkLayer] = useState<boolean>(true);
  const [showZonesLayer, setShowZonesLayer] = useState<boolean>(true);

  // Selection state
  const [selectedCardId, setSelectedCardId] = useState<string | null>(
    board.cards[0]?.id || null
  );
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);

  // Connect tool state
  const [connectSourceId, setConnectSourceId] = useState<string | null>(null);
  const [connectLabel, setConnectLabel] = useState<string>('Hubungan Konspirasi');
  const [connectColor, setConnectColor] =
    useState<FreeCanvasLink['color']>('crimson');
  const [connectDashed, setConnectDashed] = useState<boolean>(false);

  // Ink drawing state
  const [inkColor, setInkColor] = useState<string>(INK_PALETTE[0].hex);
  const [inkWidth, setInkWidth] = useState<number>(2.5);
  const [activeStrokePoints, setActiveStrokePoints] = useState<
    Array<{ x: number; y: number }>
  >([]);
  const isDrawingRef = useRef<boolean>(false);

  // Dragging card or zone state
  const [draggingItem, setDraggingItem] = useState<{
    kind: 'card' | 'zone';
    id: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  // Pin existing entity/chapter picker state
  const [pinEntityId, setPinEntityId] = useState<string>('');
  const [pinChapterId, setPinChapterId] = useState<string>('');
  const [promoteCategory, setPromoteCategory] =
    useState<LoreCategory>('character');

  const boardContainerRef = useRef<HTMLDivElement | null>(null);
  const inkCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const selectedCard =
    board.cards.find((c) => c.id === selectedCardId) || null;
  const selectedZone =
    board.zones.find((z) => z.id === selectedZoneId) || null;
  const selectedLink =
    board.links.find((l) => l.id === selectedLinkId) || null;

  const updateBoard = (patch: Partial<FreeCanvasData>) => {
    onChangeCanvasData({
      ...board,
      ...patch,
    });
  };

  // Render freehand ink strokes onto the HTML5 canvas layer
  useEffect(() => {
    const canvas = inkCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);
    if (!showInkLayer) return;

    const drawStroke = (
      pts: Array<{ x: number; y: number }>,
      color: string,
      width: number
    ) => {
      if (pts.length < 2) return;
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x, pts[i].y);
      }
      ctx.stroke();
      ctx.restore();
    };

    for (const st of board.strokes) {
      drawStroke(st.points, st.color, st.width);
    }
    if (activeStrokePoints.length > 1) {
      drawStroke(activeStrokePoints, inkColor, inkWidth);
    }
  }, [board.strokes, activeStrokePoints, inkColor, inkWidth, showInkLayer]);

  const getBoardCoords = (e: React.PointerEvent): { x: number; y: number } => {
    if (!boardContainerRef.current) return { x: 200, y: 200 };
    const rect = boardContainerRef.current.getBoundingClientRect();
    const rawX = (e.clientX - rect.left) / zoom;
    const rawY = (e.clientY - rect.top) / zoom;
    return {
      x: Math.max(20, Math.min(BOARD_WIDTH - 60, Math.round(rawX))),
      y: Math.max(20, Math.min(BOARD_HEIGHT - 60, Math.round(rawY))),
    };
  };

  const handleBoardPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const coords = getBoardCoords(e);

    if (toolMode === 'draw') {
      e.preventDefault();
      isDrawingRef.current = true;
      setActiveStrokePoints([coords]);
      return;
    }

    if (toolMode === 'add_card') {
      const newCard: FreeCanvasCard = {
        id: `fcard-${Date.now()}`,
        title: 'Catatan Ide Kanvas Baru',
        tagLabel: 'Brainstorm Bebas',
        content:
          'Tuliskan ide adegan, misteri dunia, atau hubungkan dengan entitas menggunakan `[[Nama Entitas]]`.',
        x: Math.max(30, Math.min(BOARD_WIDTH - 310, coords.x - 130)),
        y: Math.max(30, Math.min(BOARD_HEIGHT - 180, coords.y - 50)),
        width: 280,
        color: 'parchment',
      };
      updateBoard({ cards: [...board.cards, newCard] });
      setSelectedCardId(newCard.id);
      setSelectedZoneId(null);
      setSelectedLinkId(null);
      setToolMode('select');
      return;
    }

    if (toolMode === 'add_zone') {
      const newZone: FreeCanvasZone = {
        id: `zone-${Date.now()}`,
        title: `ZONA BARU · KELOMPOK IDE ${board.zones.length + 1}`,
        subtitle: 'Klik untuk mengubah judul dan ukuran bingkai zona ini',
        x: Math.max(20, Math.min(BOARD_WIDTH - 520, coords.x - 240)),
        y: Math.max(20, Math.min(BOARD_HEIGHT - 340, coords.y - 150)),
        width: 500,
        height: 320,
        color: 'amber',
      };
      updateBoard({ zones: [...board.zones, newZone] });
      setSelectedZoneId(newZone.id);
      setSelectedCardId(null);
      setSelectedLinkId(null);
      setToolMode('select');
    }
  };

  const handleBoardPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (toolMode === 'draw' && isDrawingRef.current) {
      const coords = getBoardCoords(e);
      setActiveStrokePoints((prev) => [...prev, coords]);
      return;
    }

    if (draggingItem) {
      const coords = getBoardCoords(e);
      if (draggingItem.kind === 'card') {
        const nextX = Math.max(
          16,
          Math.min(BOARD_WIDTH - 240, coords.x - draggingItem.offsetX)
        );
        const nextY = Math.max(
          16,
          Math.min(BOARD_HEIGHT - 120, coords.y - draggingItem.offsetY)
        );
        updateBoard({
          cards: board.cards.map((c) =>
            c.id === draggingItem.id ? { ...c, x: nextX, y: nextY } : c
          ),
        });
      } else if (draggingItem.kind === 'zone') {
        const nextX = Math.max(
          10,
          Math.min(BOARD_WIDTH - 240, coords.x - draggingItem.offsetX)
        );
        const nextY = Math.max(
          10,
          Math.min(BOARD_HEIGHT - 180, coords.y - draggingItem.offsetY)
        );
        updateBoard({
          zones: board.zones.map((z) =>
            z.id === draggingItem.id ? { ...z, x: nextX, y: nextY } : z
          ),
        });
      }
    }
  };

  const handleBoardPointerUp = () => {
    if (toolMode === 'draw' && isDrawingRef.current) {
      isDrawingRef.current = false;
      if (activeStrokePoints.length > 1) {
        const newStroke: FreeCanvasStroke = {
          id: `stroke-${Date.now()}`,
          color: inkColor,
          width: inkWidth,
          points: activeStrokePoints,
        };
        updateBoard({ strokes: [...board.strokes, newStroke] });
      }
      setActiveStrokePoints([]);
    }
    if (draggingItem) {
      setDraggingItem(null);
    }
  };

  const handleCardPointerDown = (
    e: React.PointerEvent,
    card: FreeCanvasCard
  ) => {
    if (toolMode === 'draw') return;
    e.stopPropagation();

    if (toolMode === 'connect') {
      if (!connectSourceId) {
        setConnectSourceId(card.id);
        setSelectedCardId(card.id);
      } else if (connectSourceId !== card.id) {
        const newLink: FreeCanvasLink = {
          id: `flink-${Date.now()}`,
          fromCardId: connectSourceId,
          toCardId: card.id,
          label: connectLabel.trim() || 'Terhubung',
          color: connectColor,
          dashed: connectDashed,
        };
        updateBoard({ links: [...board.links, newLink] });
        setConnectSourceId(null);
        setSelectedLinkId(newLink.id);
        setSelectedCardId(null);
        setSelectedZoneId(null);
        setToolMode('select');
      } else {
        setConnectSourceId(null);
      }
      return;
    }

    setSelectedCardId(card.id);
    setSelectedZoneId(null);
    setSelectedLinkId(null);

    const coords = getBoardCoords(e);
    setDraggingItem({
      kind: 'card',
      id: card.id,
      offsetX: coords.x - card.x,
      offsetY: coords.y - card.y,
    });
  };

  const handleZoneHeaderPointerDown = (
    e: React.PointerEvent,
    zone: FreeCanvasZone
  ) => {
    if (toolMode === 'draw') return;
    e.stopPropagation();
    setSelectedZoneId(zone.id);
    setSelectedCardId(null);
    setSelectedLinkId(null);

    const coords = getBoardCoords(e);
    setDraggingItem({
      kind: 'zone',
      id: zone.id,
      offsetX: coords.x - zone.x,
      offsetY: coords.y - zone.y,
    });
  };

  const handleUpdateSelectedCard = (patch: Partial<FreeCanvasCard>) => {
    if (!selectedCard) return;
    updateBoard({
      cards: board.cards.map((c) =>
        c.id === selectedCard.id ? { ...c, ...patch } : c
      ),
    });
  };

  const handleDeleteSelectedCard = () => {
    if (!selectedCard) return;
    updateBoard({
      cards: board.cards.filter((c) => c.id !== selectedCard.id),
      links: board.links.filter(
        (l) =>
          l.fromCardId !== selectedCard.id && l.toCardId !== selectedCard.id
      ),
    });
    setSelectedCardId(board.cards.find((c) => c.id !== selectedCard.id)?.id || null);
  };

  const handleUpdateSelectedZone = (patch: Partial<FreeCanvasZone>) => {
    if (!selectedZone) return;
    updateBoard({
      zones: board.zones.map((z) =>
        z.id === selectedZone.id ? { ...z, ...patch } : z
      ),
    });
  };

  const handleDeleteSelectedZone = () => {
    if (!selectedZone) return;
    updateBoard({
      zones: board.zones.filter((z) => z.id !== selectedZone.id),
    });
    setSelectedZoneId(null);
  };

  const handleUpdateSelectedLink = (patch: Partial<FreeCanvasLink>) => {
    if (!selectedLink) return;
    updateBoard({
      links: board.links.map((l) =>
        l.id === selectedLink.id ? { ...l, ...patch } : l
      ),
    });
  };

  const handleDeleteSelectedLink = () => {
    if (!selectedLink) return;
    updateBoard({
      links: board.links.filter((l) => l.id !== selectedLink.id),
    });
    setSelectedLinkId(null);
  };

  const handlePinEntityToCanvas = () => {
    const ent = entities.find((e) => e.id === pinEntityId);
    if (!ent) return;
    const colorMap: Record<LoreCategory, FreeCanvasCardColor> = {
      character: 'crimson',
      race: 'emerald',
      faction: 'amber',
      power_system: 'teal',
      skill: 'teal',
      nation: 'crimson',
      region: 'emerald',
      history: 'parchment',
      encyclopedia: 'amethyst',
    };
    const count = board.cards.length;
    const newCard: FreeCanvasCard = {
      id: `fcard-${Date.now()}`,
      title: ent.title,
      tagLabel: `${CATEGORY_META[ent.category].singular} · ${ent.subtitle}`,
      content: ent.summary,
      x: 140 + ((count * 85) % 900),
      y: 140 + ((count * 65) % 520),
      width: 285,
      color: colorMap[ent.category] || 'parchment',
      linkedEntityId: ent.id,
    };
    updateBoard({ cards: [...board.cards, newCard] });
    setSelectedCardId(newCard.id);
    setSelectedZoneId(null);
    setSelectedLinkId(null);
    setPinEntityId('');
  };

  const handlePinChapterToCanvas = () => {
    const ch = chapters.find((c) => c.id === pinChapterId);
    if (!ch) return;
    const count = board.cards.length;
    const newCard: FreeCanvasCard = {
      id: `fcard-${Date.now()}`,
      title: `Bab ${ch.chapterNumber}: ${ch.title}`,
      tagLabel: `${ch.act} · ${ch.status}`,
      content: ch.synopsis,
      x: 180 + ((count * 95) % 880),
      y: 180 + ((count * 75) % 500),
      width: 300,
      color: 'amber',
      linkedChapterId: ch.id,
    };
    updateBoard({ cards: [...board.cards, newCard] });
    setSelectedCardId(newCard.id);
    setSelectedZoneId(null);
    setSelectedLinkId(null);
    setPinChapterId('');
  };

  const handleUndoStroke = () => {
    if (board.strokes.length === 0) return;
    updateBoard({
      strokes: board.strokes.slice(0, -1),
    });
  };

  const handleClearStrokes = () => {
    updateBoard({ strokes: [] });
  };

  const handleClearAllCanvas = () => {
    updateBoard({
      cards: [],
      links: [],
      strokes: [],
      zones: [],
    });
    setSelectedCardId(null);
    setSelectedZoneId(null);
    setSelectedLinkId(null);
  };

  const handleRestoreStarterCanvas = () => {
    onChangeCanvasData(DEFAULT_STARTER_FREE_CANVAS);
    setSelectedCardId(DEFAULT_STARTER_FREE_CANVAS.cards[0]?.id || null);
    setSelectedZoneId(null);
    setSelectedLinkId(null);
  };

  return (
    <div className="space-y-5">
      {/* =================================================================== */}
      {/* 1. HEADER & MULTI-MODE FREEFORM SANDBOX TOOLBAR                     */}
      {/* =================================================================== */}
      <div className="relative overflow-hidden bg-[#FBF8F1] border-2 border-[#B5832A]/50 rounded-2xl p-5 space-y-4 shadow-xs">
        <OrnateCornerFiligree />
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#695A47]">
              <span className="font-epic font-bold uppercase tracking-wider text-[#9E2A2B]">
                ❖ Tabula Arcana · Papan Brainstorm & Sketsa Bebas
              </span>
              <span>·</span>
              <span>
                {board.cards.length} Kartu Ide · {board.links.length} Benang
                Hubungan · {board.zones.length} Zona · {board.strokes.length}{' '}
                Goresan Sketsa
              </span>
            </div>
            <h2 className="font-cartography text-2xl sm:text-3xl font-bold text-[#231C14]">
              {board.boardTitle}
            </h2>
            <p className="text-xs sm:text-sm text-[#695A47] max-w-3xl">
              Susun kartu catatan bebas di mana saja, tarik benang merah
              konspirasi antar ide, gambar sketsa simbol sihir/formasi dengan
              pena tinta, atau angkat kartu ide langsung menjadi entri{' '}
              <em>World Bible</em>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsFullWidth((prev) => !prev)}
              className={`px-3 py-2 text-xs font-semibold border rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isFullWidth
                  ? 'bg-[#231C14] text-[#FBF8F1] border-[#B5832A]'
                  : 'bg-[#F6F1E6] text-[#231C14] border-[#B5832A]/60 hover:bg-[#EFE7D6]'
              }`}
              title="Perluas kanvas bebas ke seluruh lebar layar"
            >
              {isFullWidth ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5 text-[#B5832A]" />
                  <span>Tampilkan Panel Inspektur</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-[#9E2A2B]" />
                  <span>Layar Penuh Kanvas</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleRestoreStarterCanvas}
              className="px-3 py-2 text-xs font-medium bg-[#F6F1E6] hover:bg-[#EFE7D6] text-[#231C14] border border-[#D8CBB3] rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              title="Pulihkan contoh papan konspirasi & sketsa Aethelia"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#B5832A]" />
              <span>Reset Contoh Kanvas</span>
            </button>

            <button
              type="button"
              onClick={handleClearAllCanvas}
              className="px-3 py-2 text-xs font-medium bg-[#F6F1E6] hover:bg-[#EFE7D6] text-[#9E2A2B] border border-[#D8CBB3] rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              title="Kosongkan seluruh isi kanvas untuk mulai dari nol"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Bersihkan Kanvas</span>
            </button>
          </div>
        </div>

        {/* Interactive Mode Switcher & Quick Pin Bar */}
        <div className="pt-2 border-t border-[#D8CBB3] flex flex-wrap items-center justify-between gap-3">
          {/* 5 Primary Canvas Tool Modes */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setToolMode('select');
                setConnectSourceId(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                toolMode === 'select'
                  ? 'bg-[#9E2A2B] text-white'
                  : 'bg-[#F6F1E6] text-[#231C14] border border-[#D8CBB3] hover:bg-[#EFE7D6]'
              }`}
            >
              <MousePointer className="w-3.5 h-3.5" />
              <span>1. Geser & Pilih</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setToolMode('add_card');
                setConnectSourceId(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                toolMode === 'add_card'
                  ? 'bg-[#9E2A2B] text-white'
                  : 'bg-[#F6F1E6] text-[#231C14] border border-[#D8CBB3] hover:bg-[#EFE7D6]'
              }`}
            >
              <StickyNote className="w-3.5 h-3.5 text-[#B5832A]" />
              <span>2. + Taruh Kartu Ide</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setToolMode('connect');
                setConnectSourceId(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                toolMode === 'connect'
                  ? 'bg-[#9E2A2B] text-white'
                  : 'bg-[#F6F1E6] text-[#231C14] border border-[#D8CBB3] hover:bg-[#EFE7D6]'
              }`}
            >
              <Link2 className="w-3.5 h-3.5 text-[#9E2A2B]" />
              <span>3. Tarik Benang Hubungan</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setToolMode('add_zone');
                setConnectSourceId(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                toolMode === 'add_zone'
                  ? 'bg-[#9E2A2B] text-white'
                  : 'bg-[#F6F1E6] text-[#231C14] border border-[#D8CBB3] hover:bg-[#EFE7D6]'
              }`}
            >
              <Frame className="w-3.5 h-3.5 text-[#264653]" />
              <span>4. + Bingkai Zona</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setToolMode('draw');
                setConnectSourceId(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                toolMode === 'draw'
                  ? 'bg-[#9E2A2B] text-white'
                  : 'bg-[#F6F1E6] text-[#231C14] border border-[#D8CBB3] hover:bg-[#EFE7D6]'
              }`}
            >
              <PenTool className="w-3.5 h-3.5 text-[#2D5A43]" />
              <span>5. Pena Sketsa Bebas</span>
            </button>
          </div>

          {/* Quick Pin from World Bible / Chapter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1">
              <select
                value={pinEntityId}
                onChange={(e) => setPinEntityId(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg text-[#231C14]"
              >
                <option value="">-- Pin Entitas World Bible --</option>
                {entities.map((ent) => (
                  <option key={ent.id} value={ent.id}>
                    [{CATEGORY_META[ent.category].singular}] {ent.title}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={!pinEntityId}
                onClick={handlePinEntityToCanvas}
                className="px-2.5 py-1.5 text-xs font-semibold bg-[#231C14] text-[#FBF8F1] rounded-lg disabled:opacity-40 cursor-pointer whitespace-nowrap shrink-0"
              >
                + Pin ke Kanvas
              </button>
            </div>

            <div className="flex items-center gap-1">
              <select
                value={pinChapterId}
                onChange={(e) => setPinChapterId(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg text-[#231C14]"
              >
                <option value="">-- Pin Kartu Bab --</option>
                {chapters.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    Bab {ch.chapterNumber}: {ch.title}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={!pinChapterId}
                onClick={handlePinChapterToCanvas}
                className="px-2.5 py-1.5 text-xs font-semibold bg-[#231C14] text-[#FBF8F1] rounded-lg disabled:opacity-40 cursor-pointer whitespace-nowrap shrink-0"
              >
                + Pin Bab
              </button>
            </div>
          </div>
        </div>

        {/* Context-Sensitive Sub-Bar when in Draw Mode or Connect Mode */}
        {toolMode === 'draw' && (
          <div className="p-3 rounded-xl bg-[#EFE7D6] border border-[#B5832A]/60 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold text-[#9E2A2B] flex items-center gap-1.5">
                <PenTool className="w-3.5 h-3.5" />
                <span>Mode Pena Sketsa Aktif:</span>
              </span>

              <div className="flex items-center gap-1.5">
                {INK_PALETTE.map((sw) => (
                  <button
                    key={sw.hex}
                    type="button"
                    onClick={() => setInkColor(sw.hex)}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold border flex items-center gap-1.5 cursor-pointer ${
                      inkColor === sw.hex
                        ? 'bg-[#231C14] text-[#FBF8F1] border-[#B5832A]'
                        : 'bg-[#FBF8F1] text-[#231C14] border-[#D8CBB3]'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ backgroundColor: sw.hex }}
                    />
                    <span>{sw.label}</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 text-xs">
                <span className="text-[#695A47] font-semibold">Tebal:</span>
                {[
                  { label: 'Halus', w: 2 },
                  { label: 'Sedang', w: 3.5 },
                  { label: 'Tebal', w: 6 },
                ].map((b) => (
                  <button
                    key={b.label}
                    type="button"
                    onClick={() => setInkWidth(b.w)}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${
                      inkWidth === b.w
                        ? 'bg-[#9E2A2B] text-white'
                        : 'bg-[#FBF8F1] text-[#231C14] border border-[#D8CBB3]'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={board.strokes.length === 0}
                onClick={handleUndoStroke}
                className="px-2.5 py-1 rounded-lg bg-[#FBF8F1] border border-[#D8CBB3] text-xs font-semibold text-[#231C14] hover:bg-[#F6F1E6] disabled:opacity-40 flex items-center gap-1 cursor-pointer"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span>Urungkan Goresan</span>
              </button>
              <button
                type="button"
                disabled={board.strokes.length === 0}
                onClick={handleClearStrokes}
                className="px-2.5 py-1 rounded-lg bg-[#FBF8F1] border border-[#D8CBB3] text-xs font-semibold text-[#9E2A2B] hover:bg-[#F6F1E6] disabled:opacity-40 flex items-center gap-1 cursor-pointer"
              >
                <Eraser className="w-3.5 h-3.5" />
                <span>Hapus Semua Sketsa</span>
              </button>
            </div>
          </div>
        )}

        {toolMode === 'connect' && (
          <div className="p-3 rounded-xl bg-[#EFE7D6] border border-[#B5832A]/60 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-[#9E2A2B]">
                {connectSourceId
                  ? 'Langkah 2: Klik Kartu Tujuan di Kanvas untuk Menarik Benang!'
                  : 'Langkah 1: Klik Kartu Asal di Kanvas'}
              </span>
              <span>·</span>
              <input
                type="text"
                value={connectLabel}
                onChange={(e) => setConnectLabel(e.target.value)}
                placeholder="Label benang hubungan..."
                className="px-2.5 py-1 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg text-[#231C14]"
              />
              <select
                value={connectColor}
                onChange={(e) =>
                  setConnectColor(e.target.value as FreeCanvasLink['color'])
                }
                className="px-2.5 py-1 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg text-[#231C14]"
              >
                {Object.entries(LINK_COLOR_MAP).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>
              <label className="inline-flex items-center gap-1 text-xs font-medium text-[#231C14] cursor-pointer">
                <input
                  type="checkbox"
                  checked={connectDashed}
                  onChange={(e) => setConnectDashed(e.target.checked)}
                />
                <span>Garis Putus-Putus (Rahasia/Spekulasi)</span>
              </label>
            </div>

            {connectSourceId && (
              <button
                type="button"
                onClick={() => setConnectSourceId(null)}
                className="px-2.5 py-1 rounded bg-[#FBF8F1] border border-[#D8CBB3] text-xs font-semibold text-[#695A47] cursor-pointer"
              >
                Batalkan Titik Awal
              </button>
            )}
          </div>
        )}

        {(toolMode === 'add_card' || toolMode === 'add_zone') && (
          <div className="p-2.5 rounded-xl bg-[#EFE7D6] border border-[#B5832A]/60 text-xs font-semibold text-[#9E2A2B] flex items-center justify-between">
            <span>
              {toolMode === 'add_card'
                ? 'Klik di titik mana saja pada kanvas di bawah untuk menaruh Kartu Ide baru.'
                : 'Klik di titik mana saja pada kanvas di bawah untuk menaruh Bingkai Zona Kelompok baru.'}
            </span>
            <button
              type="button"
              onClick={() => setToolMode('select')}
              className="px-2.5 py-0.5 rounded bg-[#FBF8F1] border border-[#D8CBB3] text-[#231C14] cursor-pointer"
            >
              Kembali ke Mode Geser
            </button>
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* 2. MAIN WORKSPACE: FREEFORM CANVAS BOARD + RIGHT INSPECTOR PANEL    */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Left/Center Freeform Canvas Board */}
        <div
          className={`${
            isFullWidth ? 'xl:col-span-12' : 'xl:col-span-8'
          } bg-[#EFE7D6] border-2 border-[#B5832A]/45 rounded-2xl p-3 space-y-2.5`}
        >
          {/* Canvas Viewport Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-1">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#695A47]">
              <span className="font-semibold text-[#231C14]">
                Kanvas Bebas Interaktif (1600×960)
              </span>
              <span>·</span>
              <button
                type="button"
                onClick={() => setShowZonesLayer((prev) => !prev)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#FBF8F1] border border-[#D8CBB3] text-[11px] font-semibold text-[#231C14] cursor-pointer"
              >
                {showZonesLayer ? (
                  <Eye className="w-3 h-3 text-[#B5832A]" />
                ) : (
                  <EyeOff className="w-3 h-3 text-[#695A47]" />
                )}
                <span>Zona ({board.zones.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setShowInkLayer((prev) => !prev)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#FBF8F1] border border-[#D8CBB3] text-[11px] font-semibold text-[#231C14] cursor-pointer"
              >
                {showInkLayer ? (
                  <Eye className="w-3 h-3 text-[#2D5A43]" />
                ) : (
                  <EyeOff className="w-3 h-3 text-[#695A47]" />
                )}
                <span>Goresan Pena ({board.strokes.length})</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() =>
                  setZoom((z) => Math.max(0.6, Number((z - 0.1).toFixed(2))))
                }
                className="p-1.5 rounded bg-[#FBF8F1] border border-[#D8CBB3] text-[#231C14] hover:bg-[#F6F1E6] cursor-pointer"
                title="Perkecil tampilan kanvas"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-mono-tabular font-bold text-[#231C14] px-1.5">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() =>
                  setZoom((z) => Math.min(1.3, Number((z + 0.1).toFixed(2))))
                }
                className="p-1.5 rounded bg-[#FBF8F1] border border-[#D8CBB3] text-[#231C14] hover:bg-[#F6F1E6] cursor-pointer"
                title="Perbesar tampilan kanvas"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoom(0.95)}
                className="px-2 py-1 rounded bg-[#FBF8F1] border border-[#D8CBB3] text-[11px] font-semibold text-[#695A47] hover:text-[#231C14] cursor-pointer"
              >
                Reset Zoom
              </button>
            </div>
          </div>

          {/* Scrollable & Zoomable Freeform Board Surface */}
          <div className="overflow-auto rounded-xl border border-[#D8CBB3] bg-[#F6F1E6] max-h-[720px]">
            <div
              ref={boardContainerRef}
              onPointerDown={handleBoardPointerDown}
              onPointerMove={handleBoardPointerMove}
              onPointerUp={handleBoardPointerUp}
              onPointerLeave={handleBoardPointerUp}
              style={{
                width: `${BOARD_WIDTH}px`,
                height: `${BOARD_HEIGHT}px`,
                transform: `scale(${zoom})`,
                transformOrigin: 'top left',
                backgroundImage:
                  'radial-gradient(rgba(181, 131, 42, 0.25) 1px, transparent 1px)',
                backgroundSize: '28px 28px',
              }}
              className={`relative bg-[#F6F1E6] select-none overflow-hidden ${
                toolMode === 'draw'
                  ? 'cursor-crosshair'
                  : toolMode === 'add_card' || toolMode === 'add_zone'
                  ? 'cursor-copy'
                  : 'cursor-default'
              }`}
            >
              {/* LAYER 1: BACKGROUND GROUP ZONES */}
              {showZonesLayer &&
                board.zones.map((zone) => {
                  const theme =
                    CARD_COLOR_THEMES[zone.color] || CARD_COLOR_THEMES.parchment;
                  const isZoneSelected = selectedZoneId === zone.id;
                  return (
                    <div
                      key={zone.id}
                      style={{
                        left: `${zone.x}px`,
                        top: `${zone.y}px`,
                        width: `${zone.width}px`,
                        height: `${zone.height}px`,
                        backgroundColor: theme.zoneBgStyle,
                        borderColor: theme.borderHex,
                      }}
                      className={`absolute rounded-2xl border-2 border-dashed transition-shadow ${
                        isZoneSelected ? 'ring-2 ring-[#B5832A]' : ''
                      }`}
                    >
                      <div
                        onPointerDown={(e) =>
                          handleZoneHeaderPointerDown(e, zone)
                        }
                        className="px-4 py-2 border-b border-dashed border-[#D8CBB3] flex items-center justify-between gap-2 cursor-grab active:cursor-grabbing bg-[#FBF8F1]/60 rounded-t-2xl"
                      >
                        <div>
                          <div
                            className="font-epic text-xs font-bold tracking-wider uppercase"
                            style={{ color: theme.accentCssVar }}
                          >
                            {zone.title}
                          </div>
                          {zone.subtitle && (
                            <div className="text-[11px] text-[#695A47]">
                              {zone.subtitle}
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] text-[#695A47] font-mono-tabular">
                          Geser Zona ✥
                        </span>
                      </div>
                    </div>
                  );
                })}

              {/* LAYER 2: SVG CONNECTION THREADS BETWEEN CARDS */}
              <svg className="w-full h-full absolute inset-0 pointer-events-none z-10">
                <defs>
                  {Object.entries(LINK_COLOR_MAP).map(([key, val]) => (
                    <marker
                      key={key}
                      id={`fcanvas-arrow-${key}`}
                      viewBox="0 0 10 10"
                      refX="8"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 1 L 10 5 L 0 9 z" fill={val.stroke} />
                    </marker>
                  ))}
                </defs>

                {board.links.map((lnk) => {
                  const fromCard = board.cards.find(
                    (c) => c.id === lnk.fromCardId
                  );
                  const toCard = board.cards.find((c) => c.id === lnk.toCardId);
                  if (!fromCard || !toCard) return null;

                  const x1 = fromCard.x + fromCard.width / 2;
                  const y1 = fromCard.y + 70;
                  const x2 = toCard.x + toCard.width / 2;
                  const y2 = toCard.y + 70;
                  const midX = (x1 + x2) / 2;
                  const midY = (y1 + y2) / 2;
                  const strokeMeta =
                    LINK_COLOR_MAP[lnk.color] || LINK_COLOR_MAP.crimson;
                  const isSelected = selectedLinkId === lnk.id;

                  return (
                    <g
                      key={lnk.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLinkId(lnk.id);
                        setSelectedCardId(null);
                        setSelectedZoneId(null);
                      }}
                      className="pointer-events-auto cursor-pointer"
                    >
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke={strokeMeta.stroke}
                        strokeWidth={isSelected ? 3.5 : 2.2}
                        strokeDasharray={lnk.dashed ? '6 5' : undefined}
                        markerEnd={`url(#fcanvas-arrow-${lnk.color})`}
                      />
                      <rect
                        x={midX - 75}
                        y={midY - 12}
                        width={150}
                        height={24}
                        rx={6}
                        fill="var(--bg-vellum)"
                        stroke={strokeMeta.stroke}
                        strokeWidth={isSelected ? 2 : 1.2}
                      />
                      <text
                        x={midX}
                        y={midY + 4}
                        textAnchor="middle"
                        fill="var(--ink-primary)"
                        fontSize="10"
                        fontWeight="700"
                      >
                        {lnk.label.slice(0, 22)}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* LAYER 3: HTML5 FREEHAND QUILL INK DRAWING CANVAS */}
              <canvas
                ref={inkCanvasRef}
                width={BOARD_WIDTH}
                height={BOARD_HEIGHT}
                className="absolute inset-0 pointer-events-none z-10"
              />

              {/* LAYER 4: DRAGGABLE FREEFORM LORE & STORYBOARD CARDS */}
              {board.cards.map((card) => {
                const theme =
                  CARD_COLOR_THEMES[card.color] || CARD_COLOR_THEMES.parchment;
                const isSelected = selectedCardId === card.id;
                const isConnectSource = connectSourceId === card.id;
                const linkedEnt = card.linkedEntityId
                  ? entities.find((e) => e.id === card.linkedEntityId)
                  : null;
                const linkedCh = card.linkedChapterId
                  ? chapters.find((c) => c.id === card.linkedChapterId)
                  : null;

                return (
                  <div
                    key={card.id}
                    style={{
                      left: `${card.x}px`,
                      top: `${card.y}px`,
                      width: `${card.width}px`,
                      borderColor: isSelected
                        ? 'var(--accent-wax)'
                        : theme.borderHex,
                    }}
                    onPointerDown={(e) => handleCardPointerDown(e, card)}
                    className={`arcana-card absolute z-20 bg-[#FBF8F1] border-2 rounded-xl p-3.5 shadow-sm space-y-2 transition-shadow ${
                      toolMode === 'draw'
                        ? 'pointer-events-none'
                        : 'cursor-grab active:cursor-grabbing'
                    } ${
                      isSelected || isConnectSource
                        ? 'ring-2 ring-[#B5832A] shadow-md'
                        : ''
                    }`}
                  >
                    {/* Card Top Kicker & Quick Pin Badge */}
                    <div className="flex items-center justify-between gap-2 text-[10px]">
                      <span
                        className="font-epic font-bold uppercase tracking-wider truncate"
                        style={{ color: theme.accentCssVar }}
                      >
                        ❖ {card.tagLabel || theme.label}
                      </span>
                      {isConnectSource && (
                        <span className="font-bold text-[#9E2A2B]">
                          [Titik Awal Benang]
                        </span>
                      )}
                    </div>

                    {/* Card Title */}
                    <div className="font-display text-base font-bold text-[#231C14] leading-snug">
                      {card.title}
                    </div>

                    {/* Card Rich Content with Interactive [[Wiki Links]] */}
                    <div
                      onPointerDown={(e) => e.stopPropagation()}
                      className="text-xs text-[#231C14] leading-relaxed cursor-auto"
                    >
                      <WikiTextRenderer
                        text={card.content}
                        entities={entities}
                        onSelectEntity={onSelectEntity}
                        onQuickCreateEntity={onQuickCreateEntity}
                      />
                    </div>

                    {/* Card Footer Links to World Bible Entity or Chapter */}
                    {(linkedEnt || linkedCh) && (
                      <div
                        onPointerDown={(e) => e.stopPropagation()}
                        className="pt-2 border-t border-[#D8CBB3]/70 flex flex-wrap items-center justify-between gap-1.5"
                      >
                        {linkedEnt && (
                          <button
                            type="button"
                            onClick={() => onSelectEntity(linkedEnt.id)}
                            className="text-[11px] font-semibold text-[#9E2A2B] hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <span>
                              Buka {CATEGORY_META[linkedEnt.category].singular}:{' '}
                              {linkedEnt.title}
                            </span>
                            <ArrowUpRight className="w-3 h-3" />
                          </button>
                        )}
                        {linkedCh && (
                          <button
                            type="button"
                            onClick={() => onOpenChapter(linkedCh.id)}
                            className="text-[11px] font-semibold text-[#2D5A43] hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <BookOpen className="w-3 h-3" />
                            <span>Buka Bab {linkedCh.chapterNumber} →</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 3. RIGHT INSPECTOR & CARD/ZONE/THREAD EDITOR PANEL                */}
        {/* ================================================================= */}
        {!isFullWidth && (
          <div className="xl:col-span-4 bg-[#FBF8F1] border-2 border-[#B5832A]/45 rounded-2xl p-5 space-y-5">
            {/* Board Title Editor */}
            <div className="space-y-1.5 border-b border-[#D8CBB3] pb-4">
              <label className="block text-[11px] font-semibold text-[#695A47]">
                Judul Papan Kanvas Bebas
              </label>
              <input
                type="text"
                value={board.boardTitle}
                onChange={(e) => updateBoard({ boardTitle: e.target.value })}
                className="w-full px-3 py-1.5 text-xs font-semibold bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg text-[#231C14]"
              />
            </div>

            {/* A. SELECTED CARD INSPECTOR */}
            {selectedCard ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-epic text-[11px] font-bold uppercase tracking-wider text-[#9E2A2B]">
                      ❖ Inspektur Kartu Kanvas
                    </div>
                    <h3 className="font-display text-lg font-bold text-[#231C14]">
                      Sunting Isi & Tautan Kartu
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleDeleteSelectedCard}
                    className="px-2.5 py-1 rounded-lg border border-[#9E2A2B]/40 text-xs font-semibold text-[#9E2A2B] hover:bg-[#9E2A2B] hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                      Judul Kartu Ide
                    </label>
                    <input
                      type="text"
                      value={selectedCard.title}
                      onChange={(e) =>
                        handleUpdateSelectedCard({ title: e.target.value })
                      }
                      className="w-full px-3 py-1.5 text-xs font-bold bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg text-[#231C14]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                        Label Kategori / Kicker
                      </label>
                      <input
                        type="text"
                        value={selectedCard.tagLabel || ''}
                        onChange={(e) =>
                          handleUpdateSelectedCard({ tagLabel: e.target.value })
                        }
                        placeholder="Intrik / Ide Tokoh / Plot..."
                        className="w-full px-2.5 py-1.5 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg text-[#231C14]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                        Warna Bingkai Kartu
                      </label>
                      <select
                        value={selectedCard.color}
                        onChange={(e) =>
                          handleUpdateSelectedCard({
                            color: e.target.value as FreeCanvasCardColor,
                          })
                        }
                        className="w-full px-2.5 py-1.5 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg text-[#231C14]"
                      >
                        {Object.entries(CARD_COLOR_THEMES).map(([k, v]) => (
                          <option key={k} value={k}>
                            {v.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                      Isi Catatan (Mendukung Tautan [[Nama Entitas]])
                    </label>
                    <textarea
                      rows={5}
                      value={selectedCard.content}
                      onChange={(e) =>
                        handleUpdateSelectedCard({ content: e.target.value })
                      }
                      className="w-full p-2.5 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg text-[#231C14] leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                      Lebar Kartu ({selectedCard.width}px)
                    </label>
                    <input
                      type="range"
                      min={220}
                      max={440}
                      step={10}
                      value={selectedCard.width}
                      onChange={(e) =>
                        handleUpdateSelectedCard({
                          width: Number(e.target.value),
                        })
                      }
                      className="w-full"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                        Tautkan ke Entitas Kanon
                      </label>
                      <select
                        value={selectedCard.linkedEntityId || ''}
                        onChange={(e) =>
                          handleUpdateSelectedCard({
                            linkedEntityId: e.target.value || undefined,
                          })
                        }
                        className="w-full px-2.5 py-1.5 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg text-[#231C14]"
                      >
                        <option value="">-- Tidak Ditautkan --</option>
                        {entities.map((ent) => (
                          <option key={ent.id} value={ent.id}>
                            [{CATEGORY_META[ent.category].singular}] {ent.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                        Tautkan ke Bab Cerita
                      </label>
                      <select
                        value={selectedCard.linkedChapterId || ''}
                        onChange={(e) =>
                          handleUpdateSelectedCard({
                            linkedChapterId: e.target.value || undefined,
                          })
                        }
                        className="w-full px-2.5 py-1.5 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg text-[#231C14]"
                      >
                        <option value="">-- Tidak Ditautkan --</option>
                        {chapters.map((ch) => (
                          <option key={ch.id} value={ch.id}>
                            Bab {ch.chapterNumber}: {ch.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Promote Freeform Card to Official World Bible Entity */}
                  <div className="p-3.5 rounded-xl bg-[#EFE7D6] border border-[#B5832A]/50 space-y-2">
                    <div className="text-xs font-bold text-[#231C14] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#9E2A2B]" />
                      <span>Angkat Kartu Ini Jadi Entri World Bible</span>
                    </div>
                    <p className="text-[11px] text-[#695A47]">
                      Ubah ide bebas pada kartu ini menjadi entitas kanon resmi
                      lengkap dengan tautan balik otomatis.
                    </p>
                    <div className="flex items-center gap-2">
                      <select
                        value={promoteCategory}
                        onChange={(e) =>
                          setPromoteCategory(e.target.value as LoreCategory)
                        }
                        className="flex-1 px-2.5 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg text-[#231C14]"
                      >
                        {(Object.keys(CATEGORY_META) as LoreCategory[]).map(
                          (cat) => (
                            <option key={cat} value={cat}>
                              {CATEGORY_META[cat].singular}
                            </option>
                          )
                        )}
                      </select>
                      <button
                        type="button"
                        onClick={() =>
                          onPromoteCardToEntity(selectedCard, promoteCategory)
                        }
                        className="px-3 py-1.5 rounded-lg bg-[#9E2A2B] text-white hover:bg-[#7E2021] text-xs font-semibold flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
                      >
                        <FilePlus2 className="w-3.5 h-3.5" />
                        <span>Jadikan Entri →</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : selectedZone ? (
              /* B. SELECTED ZONE INSPECTOR */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-epic text-[11px] font-bold uppercase tracking-wider text-[#264653]">
                      ❖ Inspektur Zona Kelompok
                    </div>
                    <h3 className="font-display text-lg font-bold text-[#231C14]">
                      Atur Bingkai Zona Kanvas
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleDeleteSelectedZone}
                    className="px-2.5 py-1 rounded-lg border border-[#9E2A2B]/40 text-xs font-semibold text-[#9E2A2B] hover:bg-[#9E2A2B] hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Zona</span>
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                      Judul Zona
                    </label>
                    <input
                      type="text"
                      value={selectedZone.title}
                      onChange={(e) =>
                        handleUpdateSelectedZone({ title: e.target.value })
                      }
                      className="w-full px-3 py-1.5 text-xs font-bold bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg text-[#231C14]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                      Subjudul / Deskripsi Zona
                    </label>
                    <input
                      type="text"
                      value={selectedZone.subtitle || ''}
                      onChange={(e) =>
                        handleUpdateSelectedZone({ subtitle: e.target.value })
                      }
                      className="w-full px-3 py-1.5 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg text-[#231C14]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                      Warna Tema Zona
                    </label>
                    <select
                      value={selectedZone.color}
                      onChange={(e) =>
                        handleUpdateSelectedZone({
                          color: e.target.value as FreeCanvasCardColor,
                        })
                      }
                      className="w-full px-2.5 py-1.5 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg text-[#231C14]"
                    >
                      {Object.entries(CARD_COLOR_THEMES).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                        Lebar ({selectedZone.width}px)
                      </label>
                      <input
                        type="range"
                        min={320}
                        max={1500}
                        step={20}
                        value={selectedZone.width}
                        onChange={(e) =>
                          handleUpdateSelectedZone({
                            width: Number(e.target.value),
                          })
                        }
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                        Tinggi ({selectedZone.height}px)
                      </label>
                      <input
                        type="range"
                        min={200}
                        max={800}
                        step={20}
                        value={selectedZone.height}
                        onChange={(e) =>
                          handleUpdateSelectedZone({
                            height: Number(e.target.value),
                          })
                        }
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : selectedLink ? (
              /* C. SELECTED THREAD LINK INSPECTOR */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-epic text-[11px] font-bold uppercase tracking-wider text-[#9E2A2B]">
                      ❖ Inspektur Benang Hubungan
                    </div>
                    <h3 className="font-display text-lg font-bold text-[#231C14]">
                      Sunting Label & Warna Garis
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleDeleteSelectedLink}
                    className="px-2.5 py-1 rounded-lg border border-[#9E2A2B]/40 text-xs font-semibold text-[#9E2A2B] hover:bg-[#9E2A2B] hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Putuskan</span>
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                      Label Hubungan
                    </label>
                    <input
                      type="text"
                      value={selectedLink.label}
                      onChange={(e) =>
                        handleUpdateSelectedLink({ label: e.target.value })
                      }
                      className="w-full px-3 py-1.5 text-xs font-bold bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg text-[#231C14]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                      Warna Benang
                    </label>
                    <select
                      value={selectedLink.color}
                      onChange={(e) =>
                        handleUpdateSelectedLink({
                          color: e.target.value as FreeCanvasLink['color'],
                        })
                      }
                      className="w-full px-2.5 py-1.5 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg text-[#231C14]"
                    >
                      {Object.entries(LINK_COLOR_MAP).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <label className="inline-flex items-center gap-2 text-xs font-semibold text-[#231C14] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(selectedLink.dashed)}
                      onChange={(e) =>
                        handleUpdateSelectedLink({ dashed: e.target.checked })
                      }
                    />
                    <span>Gunakan garis putus-putus (konspirasi/rahasia)</span>
                  </label>
                </div>
              </div>
            ) : (
              /* D. EMPTY SELECTION GUIDE */
              <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-2 text-xs text-[#695A47]">
                <div className="font-bold text-[#231C14]">
                  Panduan Cepat Kanvas Bebas:
                </div>
                <ul className="list-disc pl-4 space-y-1">
                  <li>
                    Klik kartu, bingkai zona, atau label garis di kanvas untuk
                    menyunting isinya di panel ini.
                  </li>
                  <li>
                    Gunakan <strong>+ Taruh Kartu Ide</strong> untuk menempelkan
                    catatan baru di titik mana pun.
                  </li>
                  <li>
                    Gunakan <strong>Pena Sketsa Bebas</strong> untuk menggambar
                    simbol sihir, denah pertarungan, atau panah bebas.
                  </li>
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
