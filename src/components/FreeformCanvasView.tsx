import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowUpRight,
  Bold,
  Brush,
  CheckSquare,
  Circle,
  Columns,
  Download,
  Edit3,
  Eraser,
  Eye,
  FilePlus2,
  FileText,
  Heading1,
  Heading2,
  Highlighter,
  Italic,
  List,
  Maximize2,
  Minimize2,
  Minus,
  MousePointer,
  MoveUpRight,
  Palette,
  PenTool,
  Plus,
  Redo2,
  RotateCcw,
  Sparkles,
  Square,
  Trash2,
  Type,
  Undo2,
} from 'lucide-react';
import {
  ChapterOutline,
  FreeCanvasCard,
  FreeCanvasCardColor,
  FreeCanvasData,
  LoreCategory,
  LoreEntity,
  NotebookPage,
  NotebookPaperStyle,
  PaintShape,
  PaintToolKind,
} from '../types/world';
import {
  CATEGORY_META,
  OrnateCornerFiligree,
  WikiTextRenderer,
} from './WikiTextRenderer';

const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 820;

export const DEFAULT_NOTEBOOK_PAGES: NotebookPage[] = [
  {
    id: 'page-1',
    title: '1. Catatan & Diagram Sistem Sihir',
    updatedAt: 'Hari ini',
    paperStyle: 'ruled',
    docContent: `### Catatan Riset: Hukum Resonansi & Gerhana Kedua
Tuliskan catatan bebas, draf adegan, rumus sihir, atau daftar tugas cerita Anda di sini seperti di Google Docs / OneNote. Anda juga dapat langsung **mencoret-coret di atas kertas ini** atau menggambar di kanvas menggunakan toolbar Paint di atas!

- Setiap rapalan [[Resonansi Eteris Astral]] membutuhkan pantulan cahaya langsung dari Matahari atau Bulan Kembar.
- **Peringatan Konflik Bab Berikutnya:** [[Archmage Vaelen Thorne]] menyadari bahwa [[Astrolabe Api Surya]] telah disabotase dari dalam [[Solis Prime]].
- Pertanyaan Plot yang Harus Dijawab:
  - Siapa informan [[Empress Seraphina Valorian]] di dalam [[Ordo Cakrawala Perak]]?
  - Bagaimana cara bangsa [[Dvergr Besi-Bintang]] menempa ulang cincin ketiga sebelum [[Konvergensi Gerhana Merah]] tiba?`,
    textBlocks: [
      {
        id: 'tb-1',
        title: 'Rumus Inti Astrolabe',
        tagLabel: 'Catatan Pinggir OneNote',
        content:
          'Lingkar Dalam = Cahaya Surya\nLingkar Tengah = Bulan Kembar\nInti Retak = Memicu Kristalisasi!',
        x: 680,
        y: 55,
        width: 260,
        color: 'amber',
      },
      {
        id: 'tb-2',
        title: 'Ide Twist Babak III',
        tagLabel: 'Kotak Teks Bebas',
        content:
          'Bagaimana jika [[Tombak Fajar Solis]] sebenarnya adalah kunci pembuka segel kota bawah laut?',
        x: 680,
        y: 350,
        width: 260,
        color: 'crimson',
      },
    ],
    drawings: [
      // Outer magic circle in brass gold
      {
        id: 'drw-1',
        tool: 'circle',
        color: '#D49B35',
        width: 3,
        opacity: 1,
        filled: false,
        start: { x: 220, y: 210 },
        end: { x: 460, y: 450 },
      },
      // Inner magic circle in crimson
      {
        id: 'drw-2',
        tool: 'circle',
        color: '#C83E3B',
        width: 2.5,
        opacity: 1,
        filled: false,
        start: { x: 265, y: 255 },
        end: { x: 415, y: 405 },
      },
      // Inscribed square in teal
      {
        id: 'drw-3',
        tool: 'rect',
        color: '#3B8EA5',
        width: 2,
        opacity: 1,
        filled: false,
        start: { x: 255, y: 245 },
        end: { x: 425, y: 415 },
      },
      // Arrow pointing from circle to the side note
      {
        id: 'drw-4',
        tool: 'arrow',
        color: '#C83E3B',
        width: 3,
        opacity: 1,
        start: { x: 465, y: 295 },
        end: { x: 665, y: 135 },
      },
      // Highlighter mark under center
      {
        id: 'drw-5',
        tool: 'highlighter',
        color: '#F2C94C',
        width: 22,
        opacity: 0.35,
        points: [
          { x: 250, y: 490 },
          { x: 435, y: 490 },
        ],
      },
    ],
  },
  {
    id: 'page-2',
    title: '2. Denah Pertempuran & Formasi',
    updatedAt: 'Hari ini',
    paperStyle: 'grid',
    docContent: `### Sketsa Taktis: Pengepungan Gerbang Nidavellir
Gunakan lembar berkotak (*Grid*) ini untuk merancang posisi pasukan, denah ruangan kastil, atau alur pergerakan karakter selama adegan aksi.

- **Sayap Utara:** Pasukan [[Kekaisaran Gondoria]] menahan jembatan gantung.
- **Jalur Bawah Tanah:** [[Kaelen Vance]] menyusup lewat terowongan tambang tua menuju ruang takhta [[Kerajaan Bawah Tanah Nidavellir]].`,
    textBlocks: [
      {
        id: 'tb-201',
        title: 'Benteng Gerbang Besi',
        tagLabel: 'Titik Pertahanan',
        content: 'Dijaga oleh 3 Golem Perunggu & Meriam Rune.',
        x: 420,
        y: 120,
        width: 240,
        color: 'teal',
      },
    ],
    drawings: [
      {
        id: 'drw-201',
        tool: 'rect',
        color: '#3B8EA5',
        width: 3,
        filled: false,
        start: { x: 120, y: 110 },
        end: { x: 350, y: 280 },
      },
      {
        id: 'drw-202',
        tool: 'arrow',
        color: '#C83E3B',
        width: 3.5,
        start: { x: 140, y: 390 },
        end: { x: 230, y: 290 },
      },
    ],
  },
];

export const DEFAULT_STARTER_FREE_CANVAS: FreeCanvasData = {
  boardTitle: 'Buku Catatan & Studio Oret-Oret (Docs · OneNote · Paint)',
  activePageId: 'page-1',
  pages: DEFAULT_NOTEBOOK_PAGES,
  cards: DEFAULT_NOTEBOOK_PAGES[0].textBlocks,
  links: [],
  strokes: [],
  zones: [],
};

const PAINT_COLORS = [
  { label: 'Merah Segel', hex: '#C83E3B' },
  { label: 'Emas Surya', hex: '#D49B35' },
  { label: 'Biru Sian Arcana', hex: '#3B8EA5' },
  { label: 'Hijau Zamrud', hex: '#3E8E63' },
  { label: 'Ungu Mistik', hex: '#8A5CF5' },
  { label: 'Oranye Bara', hex: '#E07A2E' },
  { label: 'Stabilo Kuning', hex: '#F2C94C' },
  { label: 'Tinta Sepia Tua', hex: '#4A3728' },
  { label: 'Putih Kapur', hex: '#FBF8F1' },
];

const TEXT_BOX_COLORS: Record<
  FreeCanvasCardColor,
  { label: string; border: string; accent: string }
> = {
  parchment: {
    label: 'Perkamen',
    border: '#B5832A',
    accent: 'var(--accent-brass)',
  },
  crimson: {
    label: 'Merah Segel',
    border: '#9E2A2B',
    accent: 'var(--accent-wax)',
  },
  teal: {
    label: 'Biru Sian',
    border: '#264653',
    accent: 'var(--accent-cartography)',
  },
  emerald: {
    label: 'Hijau Zamrud',
    border: '#2D5A43',
    accent: 'var(--accent-forest)',
  },
  amethyst: {
    label: 'Ungu Mistik',
    border: '#5A3E7A',
    accent: 'var(--accent-mystic)',
  },
  amber: {
    label: 'Emas Kuningan',
    border: '#8F5B14',
    accent: 'var(--accent-amber)',
  },
};

type ActiveInteractionTool =
  | 'cursor'
  | 'text_box'
  | PaintToolKind;

type WorkspaceLayoutMode =
  | 'split' // Left: Docs Editor & Reader | Right: Paint + OneNote Canvas
  | 'onenote_sheet' // Unified Sheet: Docs on top + Paint & Floating Text Boxes overlaid/below
  | 'paint_only'; // Full-width Paint & OneNote Canvas

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
  onChangeCanvasData,
  onSelectEntity,
  onQuickCreateEntity,
  onPromoteCardToEntity,
}) => {
  // Ensure pages array exists even if loaded from an older project state
  const pages: NotebookPage[] =
    canvasData?.pages && canvasData.pages.length > 0
      ? canvasData.pages
      : DEFAULT_NOTEBOOK_PAGES;

  const [activePageId, setActivePageId] = useState<string>(
    canvasData?.activePageId || pages[0].id
  );

  const activePage: NotebookPage =
    pages.find((p) => p.id === activePageId) || pages[0];

  // Layout & View State
  const [layoutMode, setLayoutMode] = useState<WorkspaceLayoutMode>('split');
  const [docPreviewMode, setDocPreviewMode] = useState<boolean>(false);
  const [isFullWidth, setIsFullWidth] = useState<boolean>(false);

  // Paint & OneNote Tool State
  const [activeTool, setActiveTool] = useState<ActiveInteractionTool>('pen');
  const [strokeColor, setStrokeColor] = useState<string>('#C83E3B');
  const [strokeWidth, setStrokeWidth] = useState<number>(3);
  const [fillShape, setFillShape] = useState<boolean>(false);
  const [redoStack, setRedoStack] = useState<PaintShape[]>([]);

  // Live drawing state
  const [draftShape, setDraftShape] = useState<PaintShape | null>(null);
  const isDrawingRef = useRef<boolean>(false);

  // Dragging floating OneNote text block state
  const [selectedTextBlockId, setSelectedTextBlockId] = useState<string | null>(
    null
  );
  const [draggingBlock, setDraggingBlock] = useState<{
    id: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  // Quick Entity Link Inserter & Promote Category
  const [insertEntityId, setInsertEntityId] = useState<string>('');
  const [promoteCategory, setPromoteCategory] =
    useState<LoreCategory>('encyclopedia');

  const paintCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasWrapperRef = useRef<HTMLDivElement | null>(null);
  const docTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  const syncPagesToProject = (
    nextPages: NotebookPage[],
    nextActiveId = activePage.id
  ) => {
    const current =
      nextPages.find((p) => p.id === nextActiveId) || nextPages[0];
    onChangeCanvasData({
      boardTitle:
        canvasData?.boardTitle ||
        'Buku Catatan & Studio Oret-Oret (Docs · OneNote · Paint)',
      activePageId: current.id,
      pages: nextPages,
      cards: current.textBlocks,
      links: canvasData?.links || [],
      strokes: canvasData?.strokes || [],
      zones: canvasData?.zones || [],
    });
  };

  const updateActivePage = (patch: Partial<NotebookPage>) => {
    const updated: NotebookPage = {
      ...activePage,
      ...patch,
      updatedAt: new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    const nextPages = pages.map((p) => (p.id === activePage.id ? updated : p));
    syncPagesToProject(nextPages, activePage.id);
  };

  const handleAddNewPage = () => {
    const newPage: NotebookPage = {
      id: `page-${Date.now()}`,
      title: `${pages.length + 1}. Halaman Catatan & Sketsa Baru`,
      updatedAt: 'Baru saja',
      paperStyle: 'ruled',
      docContent: `### Judul Catatan / Dokumen Baru\nMulai ketik catatan cerita, daftar ide, atau gunakan kanvas di samping untuk mencoret-coret sketsa bebas...`,
      textBlocks: [],
      drawings: [],
    };
    const nextPages = [...pages, newPage];
    setActivePageId(newPage.id);
    setRedoStack([]);
    syncPagesToProject(nextPages, newPage.id);
  };

  const handleDeleteActivePage = () => {
    if (pages.length <= 1) return;
    const remaining = pages.filter((p) => p.id !== activePage.id);
    setActivePageId(remaining[0].id);
    setRedoStack([]);
    syncPagesToProject(remaining, remaining[0].id);
  };

  // =========================================================================
  // RENDER PAINT SHAPES & FREEHAND STROKES ON HTML5 CANVAS
  // =========================================================================
  useEffect(() => {
    const canvas = paintCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const renderShape = (shape: PaintShape) => {
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (shape.tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
        ctx.lineWidth = shape.width * 4;
      } else if (shape.tool === 'highlighter') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = shape.color;
        ctx.globalAlpha = shape.opacity ?? 0.32;
        ctx.lineWidth = Math.max(14, shape.width * 5);
      } else if (shape.tool === 'brush') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = shape.color;
        ctx.globalAlpha = shape.opacity ?? 0.88;
        ctx.lineWidth = shape.width * 2.2;
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = shape.color;
        ctx.fillStyle = shape.color;
        ctx.globalAlpha = shape.opacity ?? 1;
        ctx.lineWidth = shape.width;
      }

      if (
        (shape.tool === 'pen' ||
          shape.tool === 'brush' ||
          shape.tool === 'highlighter' ||
          shape.tool === 'eraser') &&
        shape.points &&
        shape.points.length > 0
      ) {
        ctx.beginPath();
        ctx.moveTo(shape.points[0].x, shape.points[0].y);
        for (let i = 1; i < shape.points.length; i++) {
          ctx.lineTo(shape.points[i].x, shape.points[i].y);
        }
        if (shape.points.length === 1) {
          ctx.lineTo(shape.points[0].x + 0.5, shape.points[0].y + 0.5);
        }
        ctx.stroke();
      } else if (shape.tool === 'line' && shape.start && shape.end) {
        ctx.beginPath();
        ctx.moveTo(shape.start.x, shape.start.y);
        ctx.lineTo(shape.end.x, shape.end.y);
        ctx.stroke();
      } else if (shape.tool === 'arrow' && shape.start && shape.end) {
        const { start, end } = shape;
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();

        const angle = Math.atan2(end.y - start.y, end.x - start.x);
        const headLen = Math.max(12, shape.width * 4);
        ctx.beginPath();
        ctx.moveTo(end.x, end.y);
        ctx.lineTo(
          end.x - headLen * Math.cos(angle - Math.PI / 6),
          end.y - headLen * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          end.x - headLen * Math.cos(angle + Math.PI / 6),
          end.y - headLen * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fillStyle = shape.color;
        ctx.fill();
      } else if (shape.tool === 'rect' && shape.start && shape.end) {
        const x = Math.min(shape.start.x, shape.end.x);
        const y = Math.min(shape.start.y, shape.end.y);
        const w = Math.abs(shape.end.x - shape.start.x);
        const h = Math.abs(shape.end.y - shape.start.y);
        if (shape.filled) {
          ctx.save();
          ctx.globalAlpha = 0.2;
          ctx.fillRect(x, y, w, h);
          ctx.restore();
        }
        ctx.strokeRect(x, y, w, h);
      } else if (shape.tool === 'circle' && shape.start && shape.end) {
        const cx = (shape.start.x + shape.end.x) / 2;
        const cy = (shape.start.y + shape.end.y) / 2;
        const rx = Math.abs(shape.end.x - shape.start.x) / 2;
        const ry = Math.abs(shape.end.y - shape.start.y) / 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        if (shape.filled) {
          ctx.save();
          ctx.globalAlpha = 0.2;
          ctx.fill();
          ctx.restore();
        }
        ctx.stroke();
      }

      ctx.restore();
    };

    for (const item of activePage.drawings) {
      renderShape(item);
    }
    if (draftShape) {
      renderShape(draftShape);
    }
  }, [activePage.drawings, draftShape]);

  const getCanvasPoint = (
    e: React.PointerEvent<HTMLDivElement>
  ): { x: number; y: number } => {
    const canvas = paintCanvasRef.current;
    if (!canvas) return { x: 100, y: 100 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    return {
      x: Math.round((e.clientX - rect.left) * scaleX),
      y: Math.round((e.clientY - rect.top) * scaleY),
    };
  };

  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const pt = getCanvasPoint(e);

    // OneNote-style Click-to-Type Text Box creation
    if (activeTool === 'text_box') {
      const newBlock: FreeCanvasCard = {
        id: `tb-${Date.now()}`,
        title: 'Catatan Ketik Bebas',
        tagLabel: 'Kotak Teks OneNote',
        content: 'Ketik catatan atau ide Anda di sini...',
        x: Math.max(16, Math.min(CANVAS_WIDTH - 280, pt.x - 40)),
        y: Math.max(16, Math.min(CANVAS_HEIGHT - 140, pt.y - 20)),
        width: 260,
        color: 'parchment',
      };
      updateActivePage({
        textBlocks: [...activePage.textBlocks, newBlock],
      });
      setSelectedTextBlockId(newBlock.id);
      setActiveTool('cursor');
      return;
    }

    if (activeTool === 'cursor') {
      setSelectedTextBlockId(null);
      return;
    }

    // Paint Drawing Tools
    e.preventDefault();
    isDrawingRef.current = true;

    if (
      activeTool === 'pen' ||
      activeTool === 'brush' ||
      activeTool === 'highlighter' ||
      activeTool === 'eraser'
    ) {
      setDraftShape({
        id: `drw-${Date.now()}`,
        tool: activeTool,
        color: strokeColor,
        width: strokeWidth,
        opacity: activeTool === 'highlighter' ? 0.32 : 1,
        points: [pt],
      });
    } else {
      setDraftShape({
        id: `drw-${Date.now()}`,
        tool: activeTool,
        color: strokeColor,
        width: strokeWidth,
        filled: fillShape,
        start: pt,
        end: pt,
      });
    }
  };

  const handleCanvasPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const pt = getCanvasPoint(e);

    if (draggingBlock) {
      const nextX = Math.max(
        10,
        Math.min(CANVAS_WIDTH - 220, pt.x - draggingBlock.offsetX)
      );
      const nextY = Math.max(
        10,
        Math.min(CANVAS_HEIGHT - 100, pt.y - draggingBlock.offsetY)
      );
      updateActivePage({
        textBlocks: activePage.textBlocks.map((tb) =>
          tb.id === draggingBlock.id ? { ...tb, x: nextX, y: nextY } : tb
        ),
      });
      return;
    }

    if (!isDrawingRef.current || !draftShape) return;

    if (draftShape.points) {
      setDraftShape({
        ...draftShape,
        points: [...draftShape.points, pt],
      });
    } else {
      setDraftShape({
        ...draftShape,
        end: pt,
      });
    }
  };

  const handleCanvasPointerUp = () => {
    if (draggingBlock) {
      setDraggingBlock(null);
    }
    if (isDrawingRef.current && draftShape) {
      isDrawingRef.current = false;
      updateActivePage({
        drawings: [...activePage.drawings, draftShape],
      });
      setRedoStack([]);
      setDraftShape(null);
    }
  };

  const handleUndoDrawing = () => {
    if (activePage.drawings.length === 0) return;
    const last = activePage.drawings[activePage.drawings.length - 1];
    setRedoStack((prev) => [last, ...prev]);
    updateActivePage({
      drawings: activePage.drawings.slice(0, -1),
    });
  };

  const handleRedoDrawing = () => {
    if (redoStack.length === 0) return;
    const [next, ...rest] = redoStack;
    setRedoStack(rest);
    updateActivePage({
      drawings: [...activePage.drawings, next],
    });
  };

  const handleClearDrawings = () => {
    updateActivePage({ drawings: [] });
    setRedoStack([]);
  };

  const handleDownloadCanvasPng = () => {
    const srcCanvas = paintCanvasRef.current;
    if (!srcCanvas) return;

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = CANVAS_WIDTH;
    exportCanvas.height = CANVAS_HEIGHT;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    // Paint warm parchment background
    ctx.fillStyle = '#F6F1E6';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.drawImage(srcCanvas, 0, 0);

    const url = exportCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activePage.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')}-sketsa.png`;
    link.click();
  };

  // Docs Formatting Helpers
  const insertTextSnippetInDoc = (prefix: string, suffix = '') => {
    const el = docTextareaRef.current;
    if (!el) {
      updateActivePage({
        docContent: `${activePage.docContent}\n${prefix}${suffix}`,
      });
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = activePage.docContent.slice(start, end);
    const replacement = `${prefix}${selected || 'Teks'}${suffix}`;
    const nextText =
      activePage.docContent.slice(0, start) +
      replacement +
      activePage.docContent.slice(end);
    updateActivePage({ docContent: nextText });
  };

  const handleInsertWikiLinkToDoc = () => {
    const ent = entities.find((e) => e.id === insertEntityId);
    if (!ent) return;
    insertTextSnippetInDoc(`[[${ent.title}]]`);
    setInsertEntityId('');
  };

  const handlePromoteDocPageToEntity = () => {
    const pseudoCard: FreeCanvasCard = {
      id: activePage.id,
      title: activePage.title.replace(/^\d+\.\s*/, ''),
      tagLabel: 'Draf Buku Catatan',
      content: activePage.docContent,
      x: 100,
      y: 100,
      width: 300,
      color: 'parchment',
    };
    onPromoteCardToEntity(pseudoCard, promoteCategory);
  };

  const getPaperBackgroundStyle = (
    style: NotebookPaperStyle
  ): React.CSSProperties => {
    if (style === 'ruled') {
      return {
        backgroundImage:
          'repeating-linear-gradient(to bottom, transparent, transparent 31px, rgba(181, 131, 42, 0.22) 32px)',
      };
    }
    if (style === 'grid') {
      return {
        backgroundImage:
          'linear-gradient(to right, rgba(181, 131, 42, 0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(181, 131, 42, 0.18) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      };
    }
    if (style === 'dots') {
      return {
        backgroundImage:
          'radial-gradient(rgba(181, 131, 42, 0.35) 1.2px, transparent 1.2px)',
        backgroundSize: '24px 24px',
      };
    }
    return {};
  };

  return (
    <div className="space-y-4">
      {/* =================================================================== */}
      {/* 1. TOP HEADER & ONENOTE NOTEBOOK PAGE TABS                          */}
      {/* =================================================================== */}
      <div className="relative overflow-hidden bg-[#FBF8F1] border-2 border-[#B5832A]/50 rounded-2xl p-5 space-y-4 shadow-xs">
        <OrnateCornerFiligree />

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#695A47]">
              <span className="font-epic font-bold uppercase tracking-wider text-[#9E2A2B]">
                ❖ Studio Buku Catatan & Oret-Oret (Gabungan Docs · OneNote · Paint)
              </span>
              <span>·</span>
              <span>
                {pages.length} Halaman Catatan · {activePage.drawings.length}{' '}
                Coretan Gambar · {activePage.textBlocks.length} Kotak Teks
                OneNote
              </span>
            </div>
            <h2 className="font-cartography text-2xl sm:text-3xl font-bold text-[#231C14]">
              Lembar Catatan Bebas, Dokumen Cerita & Kanvas Gambar
            </h2>
            <p className="text-xs sm:text-sm text-[#695A47] max-w-3xl">
              Ketik draf catatan panjang seperti di <strong>Docs</strong>,
              taruh kotak teks bebas di titik mana pun seperti di{' '}
              <strong>OneNote</strong>, dan gambar sketsa/simbol/diagram secara
              bebas menggunakan pena, stabilo, kuas, serta bentuk geometri
              seperti di <strong>Paint</strong>.
            </p>
          </div>

          {/* Layout Switcher (Split Docs+Paint vs Unified OneNote Sheet vs Full Paint) */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setLayoutMode('split')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                layoutMode === 'split'
                  ? 'bg-[#9E2A2B] text-white'
                  : 'bg-[#F6F1E6] text-[#231C14] border border-[#D8CBB3] hover:bg-[#EFE7D6]'
              }`}
              title="Kiri: Lembar Catatan Docs · Kanan: Kanvas Oret-Oret Paint & OneNote"
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Belah Dua (Docs + Paint)</span>
            </button>

            <button
              type="button"
              onClick={() => setLayoutMode('onenote_sheet')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                layoutMode === 'onenote_sheet'
                  ? 'bg-[#9E2A2B] text-white'
                  : 'bg-[#F6F1E6] text-[#231C14] border border-[#D8CBB3] hover:bg-[#EFE7D6]'
              }`}
              title="Gabungkan dokumen dan kanvas oret-oret dalam satu lembar kertas OneNote utuh"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Lembar Terpadu OneNote</span>
            </button>

            <button
              type="button"
              onClick={() => setLayoutMode('paint_only')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                layoutMode === 'paint_only'
                  ? 'bg-[#9E2A2B] text-white'
                  : 'bg-[#F6F1E6] text-[#231C14] border border-[#D8CBB3] hover:bg-[#EFE7D6]'
              }`}
              title="Fokus penuh pada kanvas gambar Paint dan kotak teks bebas"
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Kanvas Paint Penuh</span>
            </button>

            <button
              type="button"
              onClick={() => setIsFullWidth((prev) => !prev)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#F6F1E6] text-[#231C14] border border-[#D8CBB3] hover:bg-[#EFE7D6] flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
              title="Perluas tinggi area kerja"
            >
              {isFullWidth ? (
                <Minimize2 className="w-3.5 h-3.5 text-[#B5832A]" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5 text-[#9E2A2B]" />
              )}
            </button>
          </div>
        </div>

        {/* OneNote Notebook Page Tabs Bar */}
        <div className="pt-3 border-t border-[#D8CBB3] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {pages.map((pg) => {
              const isAct = pg.id === activePage.id;
              return (
                <button
                  key={pg.id}
                  type="button"
                  onClick={() => {
                    setActivePageId(pg.id);
                    setRedoStack([]);
                    setSelectedTextBlockId(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    isAct
                      ? 'bg-[#231C14] text-[#FBF8F1] border border-[#B5832A] shadow-xs'
                      : 'bg-[#F6F1E6] text-[#231C14] border border-[#D8CBB3] hover:bg-[#EFE7D6]'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-[#B5832A]" />
                  <span>{pg.title}</span>
                </button>
              );
            })}

            <button
              type="button"
              onClick={handleAddNewPage}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#9E2A2B] text-white hover:bg-[#7E2021] flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Halaman Baru</span>
            </button>
          </div>

          {/* Page Title Edit, Paper Style & Promote to World Bible */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={activePage.title}
              onChange={(e) => updateActivePage({ title: e.target.value })}
              className="px-2.5 py-1 text-xs font-semibold bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg text-[#231C14] w-48"
              title="Ubah nama halaman buku catatan ini"
            />

            <select
              value={activePage.paperStyle}
              onChange={(e) =>
                updateActivePage({
                  paperStyle: e.target.value as NotebookPaperStyle,
                })
              }
              className="px-2.5 py-1 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg text-[#231C14]"
              title="Pilih motif kertas halaman"
            >
              <option value="ruled">Kertas Bergaris (Buku Tulis)</option>
              <option value="grid">Kertas Kotak-Kotak (Grid Denah)</option>
              <option value="dots">Kertas Titik-Titik (Dot Grid)</option>
              <option value="plain">Kertas Perkamen Polos</option>
            </select>

            {pages.length > 1 && (
              <button
                type="button"
                onClick={handleDeleteActivePage}
                className="px-2.5 py-1 rounded-lg border border-[#D8CBB3] text-xs font-semibold text-[#9E2A2B] hover:bg-[#EFE7D6] flex items-center gap-1 cursor-pointer"
                title="Hapus halaman catatan ini"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Halaman</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. UNIFIED PAINT & ONENOTE RIBBON TOOLBAR                           */}
      {/* =================================================================== */}
      <div className="bg-[#EFE7D6] border-2 border-[#B5832A]/45 rounded-2xl p-3.5 space-y-3 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Paint & OneNote Tools */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-epic font-bold uppercase tracking-wider text-[#9E2A2B] mr-1">
              Alat Kanvas:
            </span>

            <button
              type="button"
              onClick={() => setActiveTool('cursor')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                activeTool === 'cursor'
                  ? 'bg-[#231C14] text-[#FBF8F1] border border-[#B5832A]'
                  : 'bg-[#FBF8F1] text-[#231C14] border border-[#D8CBB3] hover:bg-[#F6F1E6]'
              }`}
              title="Pilih, ketik, atau geser kotak teks OneNote"
            >
              <MousePointer className="w-3.5 h-3.5 text-[#B5832A]" />
              <span>Kursor / Pilih</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTool('text_box')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                activeTool === 'text_box'
                  ? 'bg-[#9E2A2B] text-white'
                  : 'bg-[#FBF8F1] text-[#231C14] border border-[#D8CBB3] hover:bg-[#F6F1E6]'
              }`}
              title="Klik di mana saja pada kanvas untuk mengetik kotak teks baru (Gaya OneNote)"
            >
              <Type className="w-3.5 h-3.5 text-[#9E2A2B]" />
              <span>+ Kotak Teks (OneNote)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTool('pen')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                activeTool === 'pen'
                  ? 'bg-[#9E2A2B] text-white'
                  : 'bg-[#FBF8F1] text-[#231C14] border border-[#D8CBB3] hover:bg-[#F6F1E6]'
              }`}
              title="Pena Tinta Halus untuk oret-oret dan tulisan tangan"
            >
              <PenTool className="w-3.5 h-3.5 text-[#9E2A2B]" />
              <span>Pena</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTool('brush')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                activeTool === 'brush'
                  ? 'bg-[#9E2A2B] text-white'
                  : 'bg-[#FBF8F1] text-[#231C14] border border-[#D8CBB3] hover:bg-[#F6F1E6]'
              }`}
              title="Kuas Lukis Tebal"
            >
              <Brush className="w-3.5 h-3.5 text-[#2D5A43]" />
              <span>Kuas</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTool('highlighter')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                activeTool === 'highlighter'
                  ? 'bg-[#9E2A2B] text-white'
                  : 'bg-[#FBF8F1] text-[#231C14] border border-[#D8CBB3] hover:bg-[#F6F1E6]'
              }`}
              title="Stabilo Transparan untuk menandai tulisan atau sketsa"
            >
              <Highlighter className="w-3.5 h-3.5 text-[#B5832A]" />
              <span>Stabilo</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTool('eraser')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                activeTool === 'eraser'
                  ? 'bg-[#9E2A2B] text-white'
                  : 'bg-[#FBF8F1] text-[#231C14] border border-[#D8CBB3] hover:bg-[#F6F1E6]'
              }`}
              title="Penghapus Coretan Gambar"
            >
              <Eraser className="w-3.5 h-3.5 text-[#9E2A2B]" />
              <span>Penghapus</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTool('line')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                activeTool === 'line'
                  ? 'bg-[#9E2A2B] text-white'
                  : 'bg-[#FBF8F1] text-[#231C14] border border-[#D8CBB3] hover:bg-[#F6F1E6]'
              }`}
              title="Tarik Garis Lurus"
            >
              <Minus className="w-3.5 h-3.5" />
              <span>Garis</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTool('arrow')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                activeTool === 'arrow'
                  ? 'bg-[#9E2A2B] text-white'
                  : 'bg-[#FBF8F1] text-[#231C14] border border-[#D8CBB3] hover:bg-[#F6F1E6]'
              }`}
              title="Tarik Panah Penunjuk"
            >
              <MoveUpRight className="w-3.5 h-3.5" />
              <span>Panah</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTool('rect')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                activeTool === 'rect'
                  ? 'bg-[#9E2A2B] text-white'
                  : 'bg-[#FBF8F1] text-[#231C14] border border-[#D8CBB3] hover:bg-[#F6F1E6]'
              }`}
              title="Gambar Persegi / Kotak"
            >
              <Square className="w-3.5 h-3.5" />
              <span>Kotak</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTool('circle')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                activeTool === 'circle'
                  ? 'bg-[#9E2A2B] text-white'
                  : 'bg-[#FBF8F1] text-[#231C14] border border-[#D8CBB3] hover:bg-[#F6F1E6]'
              }`}
              title="Gambar Lingkaran / Elips"
            >
              <Circle className="w-3.5 h-3.5" />
              <span>Lingkaran</span>
            </button>
          </div>

          {/* Undo, Redo, Clear & Export PNG */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              disabled={activePage.drawings.length === 0}
              onClick={handleUndoDrawing}
              className="px-2.5 py-1.5 rounded-lg bg-[#FBF8F1] border border-[#D8CBB3] text-xs font-semibold text-[#231C14] hover:bg-[#F6F1E6] disabled:opacity-40 flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
              title="Urungkan goresan terakhir"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>Undo</span>
            </button>

            <button
              type="button"
              disabled={redoStack.length === 0}
              onClick={handleRedoDrawing}
              className="px-2.5 py-1.5 rounded-lg bg-[#FBF8F1] border border-[#D8CBB3] text-xs font-semibold text-[#231C14] hover:bg-[#F6F1E6] disabled:opacity-40 flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
              title="Ulangi goresan"
            >
              <Redo2 className="w-3.5 h-3.5" />
              <span>Redo</span>
            </button>

            <button
              type="button"
              disabled={activePage.drawings.length === 0}
              onClick={handleClearDrawings}
              className="px-2.5 py-1.5 rounded-lg bg-[#FBF8F1] border border-[#D8CBB3] text-xs font-semibold text-[#9E2A2B] hover:bg-[#F6F1E6] disabled:opacity-40 flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
              title="Bersihkan seluruh oret-oret di halaman ini"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Bersihkan Coretan</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadCanvasPng}
              className="px-3 py-1.5 rounded-lg bg-[#231C14] text-[#FBF8F1] text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              title="Unduh gambar coretan kanvas sebagai berkas PNG"
            >
              <Download className="w-3.5 h-3.5 text-[#B5832A]" />
              <span>Unduh .PNG</span>
            </button>
          </div>
        </div>

        {/* Second Ribbon Row: Paint Color Swatches, Custom Color Picker, Brush Thickness & Fill Toggle */}
        <div className="pt-2 border-t border-[#D8CBB3] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-semibold text-[#695A47] mr-1">
              Warna Tinta & Cat:
            </span>
            {PAINT_COLORS.map((c) => (
              <button
                key={c.hex}
                type="button"
                onClick={() => setStrokeColor(c.hex)}
                className={`px-2 py-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer ${
                  strokeColor.toLowerCase() === c.hex.toLowerCase()
                    ? 'bg-[#231C14] text-[#FBF8F1] border-[#B5832A]'
                    : 'bg-[#FBF8F1] text-[#231C14] border-[#D8CBB3]'
                }`}
              >
                <span
                  className="w-3 h-3 rounded-full border border-black/20 inline-block shrink-0"
                  style={{ backgroundColor: c.hex }}
                />
                <span className="hidden sm:inline">{c.label}</span>
              </button>
            ))}

            <label
              className="px-2 py-1 rounded-lg bg-[#FBF8F1] border border-[#D8CBB3] text-[11px] font-semibold text-[#231C14] flex items-center gap-1.5 cursor-pointer"
              title="Pilih warna bebas (Custom Color Picker)"
            >
              <input
                type="color"
                value={strokeColor}
                onChange={(e) => setStrokeColor(e.target.value)}
                className="w-4 h-4 border-0 p-0 bg-transparent cursor-pointer"
              />
              <span>Warna Bebas</span>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#695A47]">
                Ukuran Kuas ({strokeWidth}px):
              </span>
              <input
                type="range"
                min={1}
                max={16}
                step={0.5}
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(Number(e.target.value))}
                className="w-24 cursor-pointer"
              />
            </div>

            {(activeTool === 'rect' || activeTool === 'circle') && (
              <label className="inline-flex items-center gap-1.5 font-semibold text-[#231C14] cursor-pointer">
                <input
                  type="checkbox"
                  checked={fillShape}
                  onChange={(e) => setFillShape(e.target.checked)}
                />
                <span>Isi Warna Bentuk</span>
              </label>
            )}
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 3. MAIN WORKSPACE: DOCS NOTEBOOK SHEET + PAINT / ONENOTE CANVAS     */}
      {/* =================================================================== */}
      <div
        className={`grid grid-cols-1 ${
          layoutMode === 'split' ? 'xl:grid-cols-12' : 'xl:grid-cols-1'
        } gap-5 items-start`}
      >
        {/* ================================================================= */}
        {/* A. GOOGLE DOCS / ONENOTE RICH DOCUMENT SHEET                      */}
        {/* ================================================================= */}
        {(layoutMode === 'split' || layoutMode === 'onenote_sheet') && (
          <div
            className={`${
              layoutMode === 'split' ? 'xl:col-span-5' : 'w-full'
            } bg-[#FBF8F1] border-2 border-[#B5832A]/45 rounded-2xl p-5 space-y-4 shadow-xs`}
          >
            {/* Docs Formatting Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D8CBB3] pb-3">
              <div className="flex flex-wrap items-center gap-1">
                <button
                  type="button"
                  onClick={() => insertTextSnippetInDoc('\n### ')}
                  className="p-1.5 rounded bg-[#F6F1E6] hover:bg-[#EFE7D6] border border-[#D8CBB3] text-[#231C14] cursor-pointer"
                  title="Tambah Subjudul H1/H2"
                >
                  <Heading1 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertTextSnippetInDoc('\n#### ')}
                  className="p-1.5 rounded bg-[#F6F1E6] hover:bg-[#EFE7D6] border border-[#D8CBB3] text-[#231C14] cursor-pointer"
                  title="Tambah Subjudul Kecil"
                >
                  <Heading2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertTextSnippetInDoc('**', '**')}
                  className="p-1.5 rounded bg-[#F6F1E6] hover:bg-[#EFE7D6] border border-[#D8CBB3] text-[#231C14] cursor-pointer"
                  title="Teks Tebal (Bold)"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertTextSnippetInDoc('*', '*')}
                  className="p-1.5 rounded bg-[#F6F1E6] hover:bg-[#EFE7D6] border border-[#D8CBB3] text-[#231C14] cursor-pointer"
                  title="Teks Miring (Italic)"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertTextSnippetInDoc('\n- ')}
                  className="p-1.5 rounded bg-[#F6F1E6] hover:bg-[#EFE7D6] border border-[#D8CBB3] text-[#231C14] cursor-pointer"
                  title="Daftar Poin (Bullet List)"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => insertTextSnippetInDoc('\n- [ ] Tugas / Ide: ')}
                  className="p-1.5 rounded bg-[#F6F1E6] hover:bg-[#EFE7D6] border border-[#D8CBB3] text-[#231C14] cursor-pointer"
                  title="Daftar Checklist"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                </button>

                {/* Quick [[Entity]] Link Inserter into Document */}
                <div className="flex items-center gap-1 ml-1">
                  <select
                    value={insertEntityId}
                    onChange={(e) => setInsertEntityId(e.target.value)}
                    className="px-2 py-1 text-[11px] bg-[#F6F1E6] border border-[#D8CBB3] rounded text-[#231C14] max-w-[150px]"
                  >
                    <option value="">+ Sisipkan [[Entitas]]</option>
                    {entities.map((ent) => (
                      <option key={ent.id} value={ent.id}>
                        {ent.title}
                      </option>
                    ))}
                  </select>
                  {insertEntityId && (
                    <button
                      type="button"
                      onClick={handleInsertWikiLinkToDoc}
                      className="px-2 py-1 rounded bg-[#9E2A2B] text-white text-[11px] font-semibold cursor-pointer"
                    >
                      Sisipkan
                    </button>
                  )}
                </div>
              </div>

              {/* Switch between Typing Mode and Interactive [[Wiki]] Reader Mode */}
              <button
                type="button"
                onClick={() => setDocPreviewMode((prev) => !prev)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                  docPreviewMode
                    ? 'bg-[#9E2A2B] text-white'
                    : 'bg-[#F6F1E6] text-[#231C14] border border-[#D8CBB3] hover:bg-[#EFE7D6]'
                }`}
              >
                {docPreviewMode ? (
                  <>
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Kembali Mengetik</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5 text-[#9E2A2B]" />
                    <span>Mode Baca & Klik [[Tautan]]</span>
                  </>
                )}
              </button>
            </div>

            {/* Document Paper Sheet */}
            {docPreviewMode ? (
              <div
                style={getPaperBackgroundStyle(activePage.paperStyle)}
                className="p-5 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] min-h-[460px] space-y-3"
              >
                <WikiTextRenderer
                  text={activePage.docContent}
                  entities={entities}
                  onSelectEntity={onSelectEntity}
                  onQuickCreateEntity={onQuickCreateEntity}
                  dropCap={true}
                />
              </div>
            ) : (
              <textarea
                ref={docTextareaRef}
                value={activePage.docContent}
                onChange={(e) =>
                  updateActivePage({ docContent: e.target.value })
                }
                style={{
                  ...getPaperBackgroundStyle(activePage.paperStyle),
                  lineHeight: '32px',
                }}
                placeholder="Ketik catatan cerita, dialog, aturan dunia, atau ide bebas di sini... Gunakan [[Nama Entitas]] untuk menautkan ke World Bible."
                className={`w-full p-5 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] text-sm text-[#231C14] focus:outline-none focus:border-[#9E2A2B] resize-y ${
                  isFullWidth ? 'min-h-[680px]' : 'min-h-[500px]'
                }`}
              />
            )}

            {/* Footer: Word Count & Promote Document Page to World Bible Entity */}
            <div className="pt-2 border-t border-[#D8CBB3] flex flex-wrap items-center justify-between gap-2 text-xs text-[#695A47]">
              <span className="font-mono-tabular">
                {
                  activePage.docContent
                    .trim()
                    .split(/\s+/)
                    .filter(Boolean).length
                }{' '}
                kata · Terakhir disunting: {activePage.updatedAt}
              </span>

              <div className="flex items-center gap-1.5">
                <select
                  value={promoteCategory}
                  onChange={(e) =>
                    setPromoteCategory(e.target.value as LoreCategory)
                  }
                  className="px-2 py-1 text-[11px] bg-[#F6F1E6] border border-[#D8CBB3] rounded text-[#231C14]"
                >
                  {(Object.keys(CATEGORY_META) as LoreCategory[]).map((cat) => (
                    <option key={cat} value={cat}>
                      {CATEGORY_META[cat].singular}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handlePromoteDocPageToEntity}
                  className="px-2.5 py-1 rounded bg-[#231C14] text-[#FBF8F1] text-[11px] font-semibold flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
                  title="Jadikan isi dokumen halaman ini sebagai entri baru di World Bible"
                >
                  <FilePlus2 className="w-3 h-3 text-[#B5832A]" />
                  <span>Jadikan Entri World Bible →</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* B. MS PAINT + ONENOTE FREEHAND SKETCH & FLOATING TEXT CANVAS      */}
        {/* ================================================================= */}
        <div
          className={`${
            layoutMode === 'split' ? 'xl:col-span-7' : 'w-full'
          } bg-[#FBF8F1] border-2 border-[#B5832A]/45 rounded-2xl p-4 space-y-3 shadow-xs`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 px-1">
            <div className="text-xs text-[#695A47] flex flex-wrap items-center gap-2">
              <span className="font-bold text-[#231C14] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#9E2A2B]" />
                <span>
                  Kanvas Oret-Oret Paint & Kotak Teks Bebas OneNote
                </span>
              </span>
              <span>·</span>
              <span>
                {activeTool === 'text_box'
                  ? 'Klik di titik mana saja pada kertas untuk menaruh Kotak Teks baru!'
                  : activeTool === 'cursor'
                  ? 'Klik kotak teks untuk mengetik langsung atau geser posisinya.'
                  : `Mode Menggambar Aktif (${activeTool.toUpperCase()}) — Goreskan langsung di atas kertas!`}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                const newBlock: FreeCanvasCard = {
                  id: `tb-${Date.now()}`,
                  title: 'Catatan Kanvas Baru',
                  tagLabel: 'Kotak Teks OneNote',
                  content: 'Ketik catatan Anda di sini...',
                  x: 80 + ((activePage.textBlocks.length * 60) % 500),
                  y: 80 + ((activePage.textBlocks.length * 50) % 360),
                  width: 260,
                  color: 'parchment',
                };
                updateActivePage({
                  textBlocks: [...activePage.textBlocks, newBlock],
                });
                setSelectedTextBlockId(newBlock.id);
              }}
              className="px-3 py-1 rounded-lg bg-[#9E2A2B] text-white text-xs font-semibold flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Kotak Teks</span>
            </button>
          </div>

          {/* Interactive Paint + OneNote Paper Surface */}
          <div className="overflow-auto rounded-xl border-2 border-[#D8CBB3] bg-[#F6F1E6]">
            <div
              ref={canvasWrapperRef}
              onPointerDown={handleCanvasPointerDown}
              onPointerMove={handleCanvasPointerMove}
              onPointerUp={handleCanvasPointerUp}
              onPointerLeave={handleCanvasPointerUp}
              style={{
                width: '100%',
                minWidth: '780px',
                aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}`,
                ...getPaperBackgroundStyle(activePage.paperStyle),
              }}
              className={`relative bg-[#F6F1E6] select-none overflow-hidden ${
                activeTool === 'cursor'
                  ? 'cursor-default'
                  : activeTool === 'text_box'
                  ? 'cursor-text'
                  : 'cursor-crosshair'
              }`}
            >
              {/* HTML5 Paint Drawing Layer */}
              <canvas
                ref={paintCanvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                className="w-full h-full block pointer-events-none"
              />

              {/* OneNote-Style Floating Editable Text Boxes Layer */}
              {activePage.textBlocks.map((tb) => {
                const theme =
                  TEXT_BOX_COLORS[tb.color] || TEXT_BOX_COLORS.parchment;
                const isSelected = selectedTextBlockId === tb.id;
                const leftPct = (tb.x / CANVAS_WIDTH) * 100;
                const topPct = (tb.y / CANVAS_HEIGHT) * 100;

                return (
                  <div
                    key={tb.id}
                    style={{
                      left: `${leftPct}%`,
                      top: `${topPct}%`,
                      width: `${tb.width}px`,
                      borderColor: theme.border,
                    }}
                    onPointerDown={(e) => {
                      if (
                        activeTool !== 'cursor' &&
                        activeTool !== 'text_box'
                      ) {
                        // Let paint strokes pass right over text boxes when drawing!
                        return;
                      }
                      e.stopPropagation();
                      setSelectedTextBlockId(tb.id);
                    }}
                    className={`absolute z-10 bg-[#FBF8F1]/95 border-2 rounded-xl p-3 shadow-sm space-y-1.5 transition-shadow ${
                      activeTool !== 'cursor' && activeTool !== 'text_box'
                        ? 'pointer-events-none'
                        : ''
                    } ${isSelected ? 'ring-2 ring-[#B5832A] shadow-md' : ''}`}
                  >
                    {/* Drag Handle Header Bar */}
                    <div
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        setSelectedTextBlockId(tb.id);
                        const pt = getCanvasPoint(e);
                        setDraggingBlock({
                          id: tb.id,
                          offsetX: pt.x - tb.x,
                          offsetY: pt.y - tb.y,
                        });
                      }}
                      className="flex items-center justify-between gap-1 border-b border-[#D8CBB3]/80 pb-1 cursor-grab active:cursor-grabbing"
                    >
                      <input
                        type="text"
                        value={tb.title}
                        onPointerDown={(e) => e.stopPropagation()}
                        onChange={(e) =>
                          updateActivePage({
                            textBlocks: activePage.textBlocks.map((item) =>
                              item.id === tb.id
                                ? { ...item, title: e.target.value }
                                : item
                            ),
                          })
                        }
                        className="font-display text-xs font-bold text-[#231C14] bg-transparent border-0 p-0 focus:outline-none w-full"
                      />

                      <div className="flex items-center gap-1 shrink-0">
                        <select
                          value={tb.color}
                          onPointerDown={(e) => e.stopPropagation()}
                          onChange={(e) =>
                            updateActivePage({
                              textBlocks: activePage.textBlocks.map((item) =>
                                item.id === tb.id
                                  ? {
                                      ...item,
                                      color: e.target
                                        .value as FreeCanvasCardColor,
                                    }
                                  : item
                              ),
                            })
                          }
                          className="text-[10px] px-1 py-0.5 rounded bg-[#F6F1E6] border border-[#D8CBB3] text-[#231C14]"
                          title="Warna bingkai kotak teks"
                        >
                          {Object.entries(TEXT_BOX_COLORS).map(([k, v]) => (
                            <option key={k} value={k}>
                              {v.label}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={() =>
                            updateActivePage({
                              textBlocks: activePage.textBlocks.filter(
                                (item) => item.id !== tb.id
                              ),
                            })
                          }
                          className="p-0.5 text-[#695A47] hover:text-[#9E2A2B] cursor-pointer"
                          title="Hapus kotak teks ini"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Direct Inline Editable Textarea inside Floating OneNote Box */}
                    <textarea
                      rows={3}
                      value={tb.content}
                      onPointerDown={(e) => e.stopPropagation()}
                      onChange={(e) =>
                        updateActivePage({
                          textBlocks: activePage.textBlocks.map((item) =>
                            item.id === tb.id
                              ? { ...item, content: e.target.value }
                              : item
                          ),
                        })
                      }
                      placeholder="Ketik catatan di sini..."
                      className="w-full text-xs bg-transparent border-0 p-0.5 text-[#231C14] leading-relaxed focus:outline-none resize-y"
                    />

                    {/* If text contains [[Entity]], render clickable chip links below */}
                    {tb.content.includes('[[') && (
                      <div
                        onPointerDown={(e) => e.stopPropagation()}
                        className="pt-1 border-t border-dashed border-[#D8CBB3] text-[11px]"
                      >
                        <WikiTextRenderer
                          text={tb.content}
                          entities={entities}
                          onSelectEntity={onSelectEntity}
                          onQuickCreateEntity={onQuickCreateEntity}
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-[#695A47] pt-0.5">
                      <span>Geser header ✥</span>
                      <button
                        type="button"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={() => onPromoteCardToEntity(tb, 'encyclopedia')}
                        className="font-semibold text-[#9E2A2B] hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>Jadikan Entri</span>
                        <ArrowUpRight className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
