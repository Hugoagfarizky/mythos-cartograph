import React, { useEffect, useRef, useState } from 'react';
import {
  BookOpen,
  Castle,
  CheckCircle2,
  Compass,
  Crown,
  Eye,
  Feather,
  FileDown,
  Flame,
  FolderKanban,
  Gem,
  GitBranch,
  Hourglass,
  Loader2,
  Map,
  Moon,
  Mountain,
  Network,
  PenTool,
  ScrollText,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  Sun,
  Swords,
  Users,
  Wand2,
  X,
} from 'lucide-react';
import { STARTER_WORLD_PROJECT } from './data/starterWorld';
import {
  FreeCanvasCard,
  LoreAuditResult,
  LoreCategory,
  LoreEntity,
  MapStamp,
  ScratchpadNote,
  TerrainType,
  WorldProject,
} from './types/world';
import { CATEGORY_META } from './components/WikiTextRenderer';
import { CodexWorkspace } from './components/CodexWorkspace';
import { MedievalMapSandbox } from './components/MedievalMapSandbox';
import {
  ChronicleTimelineView,
  RelationshipGraphView,
} from './components/TimelineAndGraphView';
import {
  ChapterOutlinerView,
} from './components/ChapterOutlinerAndPrdView';
import { WorldOverviewTab } from './components/WorldOverviewTab';
import {
  DEFAULT_STARTER_FREE_CANVAS,
  FreeformCanvasView,
} from './components/FreeformCanvasView';
import {
  DynastyTreeStudioView,
  ProphecyAndMysteryTrackerView,
} from './components/DynastyAndProphecyView';
import {
  GlobalOmniSearchModal,
  LoreHealthInspectorModal,
  MultiWorldProjectManagerModal,
  StoryArchitectGuideModal,
  WorldExportStudioModal,
  WorldSnapshot,
  computeWorldHealthMetrics,
} from './components/GlobalProductivityModals';

const STORAGE_KEY = 'mythos_cartograph_world_v1';
const WORLDS_LIBRARY_KEY = 'mythos_cartograph_worlds_library_v1';
const SNAPSHOTS_KEY = 'mythos_cartograph_snapshots_v1';
const THEME_STORAGE_KEY = 'mythos_cartograph_theme_v1';

export type WorkspaceTab =
  | 'overview'
  | 'cosmic_entity'
  | 'deity'
  | 'map'
  | 'character'
  | 'race'
  | 'bestiary'
  | 'faction'
  | 'power_system'
  | 'skill'
  | 'nation'
  | 'culture_religion'
  | 'region'
  | 'history'
  | 'timeline'
  | 'encyclopedia'
  | 'graph'
  | 'family_tree'
  | 'prophecy_tracker'
  | 'outliner'
  | 'free_canvas';

const LORE_CATEGORY_TABS: LoreCategory[] = [
  'cosmic_entity',
  'deity',
  'character',
  'race',
  'bestiary',
  'faction',
  'nation',
  'culture_religion',
  'region',
  'power_system',
  'skill',
  'history',
  'encyclopedia',
];

function isLoreCategoryTab(tab: WorkspaceTab): tab is LoreCategory {
  return LORE_CATEGORY_TABS.includes(tab as LoreCategory);
}

interface SectionTabMeta {
  id: WorkspaceTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SECTION_TABS: SectionTabMeta[] = [
  { id: 'overview', label: 'Overview', icon: Compass },
  { id: 'cosmic_entity', label: 'Entitas Kosmik', icon: Sparkles },
  { id: 'deity', label: 'Dewa-Dewi', icon: Sun },
  { id: 'map', label: 'Map Dunia', icon: Map },
  { id: 'character', label: 'Character', icon: Crown },
  { id: 'race', label: 'Ras', icon: Users },
  { id: 'bestiary', label: 'Bestiary Monster', icon: Swords },
  { id: 'faction', label: 'Kelompok', icon: Shield },
  { id: 'power_system', label: 'Power System', icon: Flame },
  { id: 'skill', label: 'Skill', icon: Wand2 },
  { id: 'nation', label: 'Negara', icon: Castle },
  { id: 'culture_religion', label: 'Agama & Budaya', icon: BookOpen },
  { id: 'region', label: 'Wilayah', icon: Mountain },
  { id: 'history', label: 'Sejarah', icon: ScrollText },
  { id: 'timeline', label: 'Timeline', icon: Hourglass },
  { id: 'encyclopedia', label: 'Artefak & Biota', icon: Gem },
  { id: 'graph', label: 'Peta Relasi', icon: Network },
  { id: 'family_tree', label: 'Silsilah Dinasti', icon: GitBranch },
  { id: 'prophecy_tracker', label: 'Tracker Nubuat', icon: Eye },
  { id: 'outliner', label: 'Alur Bab', icon: Feather },
  { id: 'free_canvas', label: 'Kanvas Bebas', icon: PenTool },
];

const FANTASY_PILLARS: Array<{
  roman: string;
  title: string;
  tabs: SectionTabMeta[];
}> = [
  {
    roman: 'I',
    title: 'Kosmos & Atlas',
    tabs: SECTION_TABS.filter((t) =>
      ['overview', 'cosmic_entity', 'deity', 'map'].includes(t.id)
    ),
  },
  {
    roman: 'II',
    title: 'Penghuni & Arcana',
    tabs: SECTION_TABS.filter((t) =>
      [
        'character',
        'race',
        'bestiary',
        'faction',
        'power_system',
        'skill',
      ].includes(t.id)
    ),
  },
  {
    roman: 'III',
    title: 'Geopolitik & Kronik',
    tabs: SECTION_TABS.filter((t) =>
      [
        'nation',
        'culture_religion',
        'region',
        'history',
        'timeline',
        'encyclopedia',
      ].includes(t.id)
    ),
  },
  {
    roman: 'IV',
    title: 'Takdir, Naskah & Kanvas',
    tabs: SECTION_TABS.filter((t) =>
      [
        'graph',
        'family_tree',
        'prophecy_tracker',
        'outliner',
        'free_canvas',
      ].includes(t.id)
    ),
  },
];

interface BrainstormIdea {
  title: string;
  subtitle: string;
  summary: string;
  content: string;
  plotHook: string;
}

export default function App() {
  const [project, setProject] = useState<WorldProject>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as WorldProject;
        if (parsed && Array.isArray(parsed.entities) && parsed.mapData) {
          if (parsed.id === STARTER_WORLD_PROJECT.id) {
            const existingIds = new Set(parsed.entities.map((e) => e.id));
            const missingStarterEntities = STARTER_WORLD_PROJECT.entities.filter(
              (e) => !existingIds.has(e.id)
            );
            const existingTimelineIds = new Set(
              (parsed.timeline || []).map((t) => t.id)
            );
            const missingStarterTimeline =
              STARTER_WORLD_PROJECT.timeline.filter(
                (t) => !existingTimelineIds.has(t.id)
              );
            const enrichedTimeline = [
              ...(parsed.timeline || []).map((t) => {
                const starterMatch = STARTER_WORLD_PROJECT.timeline.find(
                  (st) => st.id === t.id
                );
                return starterMatch ? { ...starterMatch, ...t } : t;
              }),
              ...missingStarterTimeline,
            ];
            const existingRelIds = new Set(
              (parsed.relationships || []).map((r) => r.id)
            );
            const missingStarterRels =
              STARTER_WORLD_PROJECT.relationships.filter(
                (r) => !existingRelIds.has(r.id)
              );
            const enrichedRelationships = [
              ...(parsed.relationships || []).map((r) => {
                const starterMatch = STARTER_WORLD_PROJECT.relationships.find(
                  (sr) => sr.id === r.id
                );
                return starterMatch ? { ...starterMatch, ...r } : r;
              }),
              ...missingStarterRels,
            ];
            const existingPosIds = new Set(
              (parsed.nodePositions || []).map((p) => p.entityId)
            );
            const missingStarterPos =
              STARTER_WORLD_PROJECT.nodePositions.filter(
                (p) => !existingPosIds.has(p.entityId)
              );
            const existingChapterIds = new Set(
              (parsed.chapters || []).map((c) => c.id)
            );
            const missingStarterChapters =
              STARTER_WORLD_PROJECT.chapters.filter(
                (c) => !existingChapterIds.has(c.id)
              );
            const enrichedChapters = [
              ...(parsed.chapters || []).map((c) => {
                const starterCh = STARTER_WORLD_PROJECT.chapters.find(
                  (sc) => sc.id === c.id
                );
                if (!starterCh) return c;
                return {
                  ...starterCh,
                  ...c,
                  scenes: (c.scenes || []).map((scItem) => {
                    const starterScene = starterCh.scenes.find(
                      (ss) => ss.id === scItem.id
                    );
                    return starterScene
                      ? { ...starterScene, ...scItem }
                      : scItem;
                  }),
                };
              }),
              ...missingStarterChapters,
            ];
            return {
              ...parsed,
              entities:
                missingStarterEntities.length > 0
                  ? [...parsed.entities, ...missingStarterEntities]
                  : parsed.entities,
              timeline: enrichedTimeline,
              relationships: enrichedRelationships,
              nodePositions: [
                ...(parsed.nodePositions || []),
                ...missingStarterPos,
              ],
              chapters: enrichedChapters,
              dynastyTrees:
                parsed.dynastyTrees && parsed.dynastyTrees.length > 0
                  ? parsed.dynastyTrees
                  : STARTER_WORLD_PROJECT.dynastyTrees,
              mysteryPlots:
                parsed.mysteryPlots && parsed.mysteryPlots.length > 0
                  ? parsed.mysteryPlots
                  : STARTER_WORLD_PROJECT.mysteryPlots,
            };
          }
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load world from localStorage:', e);
    }
    return STARTER_WORLD_PROJECT;
  });

  const [savedWorlds, setSavedWorlds] = useState<WorldProject[]>(() => {
    try {
      const raw = localStorage.getItem(WORLDS_LIBRARY_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as WorldProject[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load worlds library:', e);
    }
    return [STARTER_WORLD_PROJECT];
  });

  const [snapshots, setSnapshots] = useState<WorldSnapshot[]>(() => {
    try {
      const raw = localStorage.getItem(SNAPSHOTS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as WorldSnapshot[];
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to load snapshots:', e);
    }
    return [];
  });

  const [activeTab, setActiveTab] = useState<WorkspaceTab>('overview');
  const [selectedEntityId, setSelectedEntityId] = useState<string>(
    project.entities[0]?.id || ''
  );
  const [selectedChapterId, setSelectedChapterId] = useState<string>(
    project.chapters[0]?.id || ''
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Global Productivity Modals State
  const [omniSearchOpen, setOmniSearchOpen] = useState<boolean>(false);
  const [projectManagerOpen, setProjectManagerOpen] = useState<boolean>(false);
  const [exportStudioOpen, setExportStudioOpen] = useState<boolean>(false);
  const [loreHealthOpen, setLoreHealthOpen] = useState<boolean>(false);
  const [storyGuideOpen, setStoryGuideOpen] = useState<boolean>(false);
  const [themeMode, setThemeMode] = useState<'parchment' | 'grimoire-dark'>(
    () => {
      try {
        const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme === 'grimoire-dark') return 'grimoire-dark';
      } catch {
        // ignore
      }
      return 'parchment';
    }
  );

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, themeMode);
      if (themeMode === 'grimoire-dark') {
        document.documentElement.setAttribute('data-theme', 'grimoire-dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
    } catch {
      // ignore
    }
  }, [themeMode]);

  // AI Lore Audit Modal State
  const [auditModalOpen, setAuditModalOpen] = useState<boolean>(false);
  const [auditLoading, setAuditLoading] = useState<boolean>(false);
  const [auditTargetTitle, setAuditTargetTitle] = useState<string>('');
  const [auditError, setAuditError] = useState<string | null>(null);
  const [auditResult, setAuditResult] = useState<LoreAuditResult | null>(null);

  // AI Brainstorm Modal State
  const [brainstormOpen, setBrainstormOpen] = useState<boolean>(false);
  const [brainstormCategory, setBrainstormCategory] =
    useState<LoreCategory>('character');
  const [brainstormFocus, setBrainstormFocus] = useState<string>('');
  const [brainstormLoading, setBrainstormLoading] = useState<boolean>(false);
  const [brainstormError, setBrainstormError] = useState<string | null>(null);
  const [brainstormIdeas, setBrainstormIdeas] = useState<BrainstormIdea[]>([]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync active project to localStorage and into savedWorlds library
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
      setSavedWorlds((prev) => {
        const exists = prev.some((w) => w.id === project.id);
        const next = exists
          ? prev.map((w) => (w.id === project.id ? project : w))
          : [project, ...prev];
        localStorage.setItem(WORLDS_LIBRARY_KEY, JSON.stringify(next));
        return next;
      });
    } catch (e) {
      console.error('Failed to save world to localStorage:', e);
    }
  }, [project]);

  useEffect(() => {
    try {
      localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(snapshots));
    } catch (e) {
      console.error('Failed to save snapshots:', e);
    }
  }, [snapshots]);

  // Global Keyboard Shortcut: Ctrl+K / Cmd+K for Omni-Search
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOmniSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  const handleSwitchTab = (tab: WorkspaceTab) => {
    setActiveTab(tab);
    if (isLoreCategoryTab(tab)) {
      const firstInCat = project.entities.find((e) => e.category === tab);
      if (firstInCat) {
        setSelectedEntityId(firstInCat.id);
      }
    }
  };

  // Navigate to any entity and automatically switch to that entity's dedicated section tab
  const handleNavigateToEntity = (entityId: string) => {
    const target = project.entities.find((e) => e.id === entityId);
    setSelectedEntityId(entityId);
    if (target) {
      setActiveTab(target.category);
    }
  };

  const handleSaveEntity = (entity: LoreEntity) => {
    setProject((prev) => {
      const exists = prev.entities.some((e) => e.id === entity.id);
      const nextEntities = exists
        ? prev.entities.map((e) => (e.id === entity.id ? entity : e))
        : [entity, ...prev.entities];
      return { ...prev, entities: nextEntities };
    });
    setActiveTab(entity.category);
    showToast(
      `Entri "${entity.title}" berhasil disimpan ke tab ${CATEGORY_META[entity.category].singular}.`
    );
  };

  const handleDeleteEntity = (entityId: string) => {
    const target = project.entities.find((e) => e.id === entityId);
    setProject((prev) => {
      const remaining = prev.entities.filter((e) => e.id !== entityId);
      if (selectedEntityId === entityId && remaining.length > 0) {
        const sameCat = remaining.find((e) => e.category === target?.category);
        setSelectedEntityId(sameCat?.id || remaining[0].id);
      }
      return {
        ...prev,
        entities: remaining,
        relationships: prev.relationships.filter(
          (r) => r.sourceId !== entityId && r.targetId !== entityId
        ),
      };
    });
    if (target) {
      showToast(`Entri "${target.title}" telah dihapus.`);
    }
  };

  const handleExportSpecificWorldJson = (targetWorld: WorldProject) => {
    const blob = new Blob([JSON.stringify(targetWorld, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${targetWorld.worldName.toLowerCase().replace(/\s+/g, '-')}-world-bible.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast(`Berkas JSON "${targetWorld.worldName}" berhasil diunduh.`);
  };

  const handleExportWorldJson = () => {
    handleExportSpecificWorldJson(project);
  };

  const handleImportWorldJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as WorldProject;
        if (parsed && Array.isArray(parsed.entities) && parsed.mapData) {
          setProject(parsed);
          setSelectedEntityId(parsed.entities[0]?.id || '');
          setSelectedChapterId(parsed.chapters?.[0]?.id || '');
          showToast(
            `Proyek "${parsed.worldName}" berhasil diimpor dan disimpan di Perpustakaan Dunia.`
          );
        } else {
          showToast('Format berkas JSON tidak sesuai dengan skema World Bible.');
        }
      } catch {
        showToast('Gagal membaca berkas JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetStarterWorld = () => {
    setProject(STARTER_WORLD_PROJECT);
    setSelectedEntityId(STARTER_WORLD_PROJECT.entities[0].id);
    setSelectedChapterId(STARTER_WORLD_PROJECT.chapters[0].id);
    showToast('Dunia contoh "Kronik Benua Aethelia" telah dipulihkan.');
  };

  const createNewWorldObject = (meta?: {
    worldName?: string;
    genre?: string;
    tagline?: string;
    calendarSystem?: string;
  }): WorldProject => {
    const cols = 36;
    const rows = 22;
    const blankCells: TerrainType[] = new Array(cols * rows).fill('sea');
    const starterEntity: LoreEntity = {
      id: `ent-${Date.now()}`,
      category: 'character',
      title: 'Tokoh Utama Pertama',
      subtitle: 'Pengembara Dunia Baru',
      summary: 'Tokoh sentral yang memulai perjalanan di semesta baru Anda.',
      content:
        'Mulai tuliskan latar belakang karakter, sejarah dunia, atau aturan kekuatan di sini.',
      tags: ['Protagonis'],
      attributes: {
        role: 'Protagonis',
        status: 'Hidup',
      },
      updatedAt: new Date().toISOString().slice(0, 10),
    };

    const firstChapId = `chap-${Date.now()}`;
    return {
      id: `world-${Date.now()}`,
      worldName: meta?.worldName || 'Semesta Cerita Baru',
      tagline:
        meta?.tagline ||
        'Tuliskan premis utama dunia fantasi atau fiksi Anda di sini',
      genre: meta?.genre || 'Fantasi / Fiksi',
      calendarSystem: meta?.calendarSystem || 'Tahun ke-1 Era Baru',
      authorName: project.authorName || 'Penulis',
      heroBannerUrl: project.heroBannerUrl,
      epigraphQuote:
        'Tuliskan kutipan epigrafi atau ramalan pembuka dunia Anda di sini.',
      epigraphSource: 'Kronik Kuno Bab I',
      centralConflict:
        'Tuliskan konflik utama yang menggerakkan cerita di dunia ini. Gunakan [[Tokoh Utama Pertama]] untuk menautkan entitas.',
      storyThemes: 'Takdir, Kekuasaan, dan Pengorbanan',
      cosmologyCreationMyth:
        'Tuliskan mitos penciptaan semesta atau sejarah awal mula terbentuknya dunia Anda.',
      cosmologyLaws:
        'Tuliskan aturan fundamental alam semesta, batas sihir, atau hukum kosmik yang tidak dapat dilanggar.',
      scratchpadNotes: [],
      entities: [starterEntity],
      mapData: {
        mapTitle: `Peta ${meta?.worldName || 'Dunia Baru'}`,
        subtitle: 'Kanvas Kartografi Semesta',
        scaleLabel: '1 Grid = 50 Liga',
        gridCols: cols,
        gridRows: rows,
        cells: blankCells,
        stamps: [],
        regionLabels: [],
        rivers: [],
      },
      relationships: [],
      nodePositions: [{ entityId: starterEntity.id, x: 450, y: 260 }],
      timeline: [],
      chapters: [
        {
          id: firstChapId,
          chapterNumber: 1,
          act: 'Babak I',
          title: 'Awal Mula Perjalanan',
          status: 'Rencana',
          synopsis: 'Bab pembuka yang memperkenalkan dunia dan tokoh utama.',
          draftNotes: 'Catatan adegan untuk [[Tokoh Utama Pertama]].',
          featuredEntityIds: [starterEntity.id],
          wordCountTarget: 3000,
          currentWordCount: 0,
          scenes: [],
        },
      ],
    };
  };

  const handleCreateBlankWorld = () => {
    const blankWorld = createNewWorldObject();
    setProject(blankWorld);
    setSelectedEntityId(blankWorld.entities[0].id);
    setSelectedChapterId(blankWorld.chapters[0].id);
    setActiveTab('overview');
    showToast(
      'Proyek World Bible baru berhasil dibuat (proyek lama tetap tersimpan di Manajer Proyek).'
    );
  };

  const handleCreateCustomNewWorld = (meta: {
    worldName: string;
    genre: string;
    tagline: string;
    calendarSystem: string;
  }) => {
    const newWorld = createNewWorldObject(meta);
    setProject(newWorld);
    setSelectedEntityId(newWorld.entities[0].id);
    setSelectedChapterId(newWorld.chapters[0].id);
    setActiveTab('overview');
    showToast(`Proyek dunia "${newWorld.worldName}" berhasil dibuat dan dibuka.`);
  };

  const handleSwitchWorld = (worldId: string) => {
    const found = savedWorlds.find((w) => w.id === worldId);
    if (!found) return;
    setProject(found);
    setSelectedEntityId(found.entities[0]?.id || '');
    setSelectedChapterId(found.chapters[0]?.id || '');
    showToast(`Beralih ke proyek "${found.worldName}".`);
  };

  const handleDuplicateWorld = (sourceWorld: WorldProject) => {
    const cloned: WorldProject = {
      ...JSON.parse(JSON.stringify(sourceWorld)),
      id: `world-${Date.now()}`,
      worldName: `${sourceWorld.worldName} (Salinan)`,
    };
    setSavedWorlds((prev) => {
      const next = [cloned, ...prev];
      localStorage.setItem(WORLDS_LIBRARY_KEY, JSON.stringify(next));
      return next;
    });
    showToast(`Salinan proyek "${cloned.worldName}" berhasil ditambahkan.`);
  };

  const handleDeleteWorld = (worldId: string) => {
    if (savedWorlds.length <= 1) return;
    const target = savedWorlds.find((w) => w.id === worldId);
    const remaining = savedWorlds.filter((w) => w.id !== worldId);
    setSavedWorlds(remaining);
    localStorage.setItem(WORLDS_LIBRARY_KEY, JSON.stringify(remaining));
    if (project.id === worldId && remaining[0]) {
      setProject(remaining[0]);
      setSelectedEntityId(remaining[0].entities[0]?.id || '');
      setSelectedChapterId(remaining[0].chapters[0]?.id || '');
    }
    if (target) {
      showToast(`Proyek "${target.worldName}" telah dihapus dari daftar.`);
    }
  };

  const handleCreateSnapshot = (label: string) => {
    const snap: WorldSnapshot = {
      id: `snap-${Date.now()}`,
      worldId: project.id,
      worldName: project.worldName,
      label,
      createdAt: `${new Date().toLocaleDateString('id-ID')} ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`,
      entityCount: project.entities.length,
      chapterCount: project.chapters.length,
      projectData: JSON.parse(JSON.stringify(project)),
    };
    setSnapshots((prev) => [snap, ...prev]);
    showToast(`Snapshot "${label}" berhasil disimpan.`);
  };

  const handleRestoreSnapshot = (snap: WorldSnapshot) => {
    const restored: WorldProject = JSON.parse(JSON.stringify(snap.projectData));
    setProject(restored);
    setSelectedEntityId(restored.entities[0]?.id || '');
    setSelectedChapterId(restored.chapters[0]?.id || '');
    showToast(
      `Proyek berhasil dipulihkan ke snapshot "${snap.label}" (${snap.createdAt}).`
    );
  };

  const handleDeleteSnapshot = (snapshotId: string) => {
    setSnapshots((prev) => prev.filter((s) => s.id !== snapshotId));
    showToast('Snapshot versi telah dihapus.');
  };

  const handlePromoteNoteToEntity = (note: ScratchpadNote) => {
    const colonIdx = note.text.indexOf(':');
    const derivedTitle =
      colonIdx > 2 && colonIdx < 45
        ? note.text.slice(0, colonIdx).trim()
        : note.text.split(' ').slice(0, 5).join(' ').trim() ||
          `Konsep ${CATEGORY_META[note.targetCategory].singular} Baru`;

    const newEntity: LoreEntity = {
      id: `ent-${Date.now()}`,
      category: note.targetCategory,
      title: derivedTitle,
      subtitle: `Diangkat dari Catatan Ide Kilat (${note.createdAt})`,
      summary: note.text,
      content: `### Pengembangan Ide Awal\n${note.text}\n\nTambahkan rincian kanon dan hubungkan dengan entitas lain menggunakan sintaks \`[[Nama Entitas]]\`.`,
      tags: [CATEGORY_META[note.targetCategory].singular, 'Dari Scratchpad'],
      attributes: {},
      updatedAt: new Date().toISOString().slice(0, 10),
    };

    setProject((prev) => ({
      ...prev,
      entities: [newEntity, ...prev.entities],
      scratchpadNotes: (prev.scratchpadNotes ?? []).filter(
        (n) => n.id !== note.id
      ),
    }));
    setSelectedEntityId(newEntity.id);
    setActiveTab(note.targetCategory);
    showToast(
      `Ide berhasil dijadikan entri "${newEntity.title}" di tab ${CATEGORY_META[note.targetCategory].singular}.`
    );
  };

  const handleCreateEntityFromStamp = (
    stamp: MapStamp,
    category: LoreCategory
  ) => {
    const newEntity: LoreEntity = {
      id: `ent-${Date.now()}`,
      category,
      title: stamp.label,
      subtitle: `Lokasi di ${project.mapData.mapTitle} (${stamp.x}°B, ${stamp.y}°U)`,
      summary: `${stamp.label} adalah lokasi penting yang tercatat pada peta ${project.mapData.mapTitle}.`,
      content: `### Geografi & Sejarah Lokasi\n**${stamp.label}** terletak pada koordinat atlas ${stamp.x}°B · ${stamp.y}°U.\n\nTuliskan sejarah tempat ini, penguasa wilayahnya, atau hubungannya dengan entitas lain menggunakan sintaks \`[[Nama Entitas]]\`.`,
      tags: [CATEGORY_META[category].singular, 'Lokasi Peta'],
      attributes:
        category === 'region'
          ? {
              climate: 'Sedang',
              landmarks: stamp.label,
              dangerLevel: 'Menengah',
            }
          : category === 'nation'
          ? {
              capitalCity: stamp.label,
              government: 'Kerajaan / Persemakmuran',
            }
          : {},
      updatedAt: new Date().toISOString().slice(0, 10),
    };

    setProject((prev) => ({
      ...prev,
      entities: [newEntity, ...prev.entities],
      mapData: {
        ...prev.mapData,
        stamps: prev.mapData.stamps.map((s) =>
          s.id === stamp.id ? { ...s, linkedEntityId: newEntity.id } : s
        ),
      },
    }));
    showToast(
      `Entri "${newEntity.title}" berhasil dibuat di tab ${CATEGORY_META[category].singular} dan ditautkan ke pin peta.`
    );
  };

  const handleQuickCreateEntity = (
    title: string,
    category: LoreCategory,
    openAfterCreate?: boolean
  ) => {
    const cleanTitle = title.trim();
    if (!cleanTitle) return;

    const existing = project.entities.find(
      (e) => e.title.toLowerCase() === cleanTitle.toLowerCase()
    );
    if (existing) {
      if (openAfterCreate) {
        handleNavigateToEntity(existing.id);
      }
      showToast(`Entri "${existing.title}" sudah terdaftar di World Bible.`);
      return;
    }

    const newEntity: LoreEntity = {
      id: `ent-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      category,
      title: cleanTitle,
      subtitle: `${CATEGORY_META[category].singular} di ${project.worldName}`,
      summary: `${cleanTitle} adalah ${CATEGORY_META[
        category
      ].singular.toLowerCase()} yang tercatat dalam kronik ${project.worldName}.`,
      content: `### Catatan Kanon & Latar Belakang\n**${cleanTitle}** merupakan bagian dari semesta **${project.worldName}**.\n\nTuliskan rincian sejarah, kemampuan, atau hubungannya dengan tokoh dan wilayah lain menggunakan sintaks \`[[Nama Entitas]]\`.`,
      tags: [CATEGORY_META[category].singular, 'Tautan Cepat'],
      attributes:
        category === 'character'
          ? { role: 'Tokoh Pendukung', status: 'Hidup' }
          : category === 'region'
          ? { climate: 'Sedang', dangerLevel: 'Menengah' }
          : category === 'nation'
          ? { government: 'Kerajaan / Kedaulatan' }
          : {},
      updatedAt: new Date().toISOString().slice(0, 10),
    };

    setProject((prev) => ({
      ...prev,
      entities: [newEntity, ...prev.entities],
      nodePositions: [
        ...prev.nodePositions,
        {
          entityId: newEntity.id,
          x: 240 + ((prev.entities.length * 97) % 460),
          y: 160 + ((prev.entities.length * 73) % 300),
        },
      ],
    }));

    if (openAfterCreate) {
      setSelectedEntityId(newEntity.id);
      setActiveTab(category);
    }

    showToast(
      `Entri "${newEntity.title}" berhasil dibuat otomatis di tab ${CATEGORY_META[category].singular}.`
    );
  };

  const handleAutoPinLocationOnMap = (entity: LoreEntity) => {
    const existingPin = project.mapData.stamps.find(
      (s) =>
        s.linkedEntityId === entity.id ||
        s.label.toLowerCase() === entity.title.toLowerCase()
    );
    if (existingPin) {
      showToast(`"${entity.title}" sudah memiliki pin di Peta Dunia.`);
      return;
    }

    const count = project.mapData.stamps.length;
    const newStamp: MapStamp = {
      id: `stamp-${Date.now()}`,
      label: entity.title,
      type: entity.category === 'nation' ? 'capital' : 'castle',
      x: 22 + ((count * 17) % 58),
      y: 24 + ((count * 13) % 54),
      linkedEntityId: entity.id,
    };

    setProject((prev) => ({
      ...prev,
      mapData: {
        ...prev.mapData,
        stamps: [...prev.mapData.stamps, newStamp],
      },
    }));

    showToast(
      `Pin lokasi "${entity.title}" (${newStamp.x}°B, ${newStamp.y}°U) berhasil ditambahkan ke Peta Dunia.`
    );
  };

  const handlePromoteCanvasCardToEntity = (
    card: FreeCanvasCard,
    category: LoreCategory
  ) => {
    const newEntity: LoreEntity = {
      id: `ent-${Date.now()}`,
      category,
      title: card.title.trim() || `Entitas ${CATEGORY_META[category].singular}`,
      subtitle: card.tagLabel || `Diangkat dari Kanvas Bebas`,
      summary: card.content.slice(0, 180),
      content: `### Catatan Kanon dari Kanvas Bebas\n${card.content}\n\nTambahkan rincian atribut dan hubungkan dengan entitas lain menggunakan sintaks \`[[Nama Entitas]]\`.`,
      tags: [CATEGORY_META[category].singular, 'Kanvas Bebas'],
      attributes:
        category === 'character'
          ? { role: 'Tokoh Kunci', status: 'Hidup' }
          : {},
      updatedAt: new Date().toISOString().slice(0, 10),
    };

    setProject((prev) => {
      const currentCanvas = prev.freeCanvas || DEFAULT_STARTER_FREE_CANVAS;
      return {
        ...prev,
        entities: [newEntity, ...prev.entities],
        nodePositions: [
          ...prev.nodePositions,
          {
            entityId: newEntity.id,
            x: 260 + ((prev.entities.length * 89) % 440),
            y: 180 + ((prev.entities.length * 67) % 280),
          },
        ],
        freeCanvas: {
          ...currentCanvas,
          cards: currentCanvas.cards.map((c) =>
            c.id === card.id ? { ...c, linkedEntityId: newEntity.id } : c
          ),
        },
      };
    });

    setSelectedEntityId(newEntity.id);
    setActiveTab(category);
    showToast(
      `Kartu "${newEntity.title}" berhasil dijadikan entri di tab ${CATEGORY_META[category].singular}.`
    );
  };

  // Build world summary string for AI context
  const buildWorldContextSummary = () => {
    const entityLines = project.entities
      .map(
        (e) =>
          `- [${CATEGORY_META[e.category].singular}] ${e.title}: ${e.summary} | Atribut: ${JSON.stringify(
            e.attributes
          )}`
      )
      .join('\n');
    const timelineLines = project.timeline
      .map((t) => `- ${t.displayDate}: ${t.title} (${t.summary})`)
      .join('\n');
    return `Nama Dunia: ${project.worldName}\nGenre: ${project.genre}\nKalender: ${project.calendarSystem}\n\nDAFTAR ENTITAS WORLD BIBLE:\n${entityLines}\n\nLINIMASA SEJARAH:\n${timelineLines}`;
  };

  const runLoreAudit = async (
    title: string,
    categoryLabel: string,
    content: string
  ) => {
    setAuditTargetTitle(title);
    setAuditModalOpen(true);
    setAuditLoading(true);
    setAuditError(null);
    setAuditResult(null);

    try {
      const response = await fetch('/api/lore/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetTitle: title,
          targetCategory: categoryLabel,
          targetContent: content,
          worldContext: buildWorldContextSummary(),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Gagal menghubungi server audit AI.');
      }
      setAuditResult(data as LoreAuditResult);
    } catch (err: unknown) {
      setAuditError(
        err instanceof Error
          ? err.message
          : 'Terjadi kesalahan saat memeriksa konsistensi lore.'
      );
    } finally {
      setAuditLoading(false);
    }
  };

  const handleRunBrainstorm = async (e: React.FormEvent) => {
    e.preventDefault();
    setBrainstormLoading(true);
    setBrainstormError(null);
    setBrainstormIdeas([]);

    try {
      const response = await fetch('/api/lore/brainstorm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: CATEGORY_META[brainstormCategory].label,
          promptFocus:
            brainstormFocus.trim() ||
            `Buat 3 ide ${CATEGORY_META[brainstormCategory].singular} yang memperkaya konflik di ${project.worldName}`,
          worldSummary: buildWorldContextSummary(),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Gagal menjalankan generator ide lore.');
      }
      setBrainstormIdeas(Array.isArray(data.ideas) ? data.ideas : []);
    } catch (err: unknown) {
      setBrainstormError(
        err instanceof Error
          ? err.message
          : 'Gagal menghasilkan ide worldbuilding.'
      );
    } finally {
      setBrainstormLoading(false);
    }
  };

  const handleAdoptBrainstormIdea = (idea: BrainstormIdea) => {
    const newEnt: LoreEntity = {
      id: `ent-${Date.now()}`,
      category: brainstormCategory,
      title: idea.title,
      subtitle: idea.subtitle,
      summary: idea.summary,
      content: `${idea.content}\n\n### Pemicu Plot (Plot Hook)\n${idea.plotHook}`,
      tags: [CATEGORY_META[brainstormCategory].singular, 'AI Brainstorm'],
      attributes: {},
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    handleSaveEntity(newEnt);
    setSelectedEntityId(newEnt.id);
    setBrainstormOpen(false);
    setActiveTab(brainstormCategory);
  };

  const getTabCount = (tabId: WorkspaceTab): number | null => {
    if (isLoreCategoryTab(tabId)) {
      return project.entities.filter((e) => e.category === tabId).length;
    }
    if (tabId === 'map') return project.mapData.stamps.length;
    if (tabId === 'timeline') return project.timeline.length;
    if (tabId === 'graph') return project.relationships.length;
    if (tabId === 'family_tree') {
      return (
        project.dynastyTrees ||
        STARTER_WORLD_PROJECT.dynastyTrees ||
        []
      ).length;
    }
    if (tabId === 'prophecy_tracker') {
      return (
        project.mysteryPlots ||
        STARTER_WORLD_PROJECT.mysteryPlots ||
        []
      ).length;
    }
    if (tabId === 'outliner') return project.chapters.length;
    if (tabId === 'free_canvas') {
      return (
        project.freeCanvas?.pages ||
        DEFAULT_STARTER_FREE_CANVAS.pages ||
        []
      ).length;
    }
    return null;
  };

  const activeTabLabel =
    SECTION_TABS.find((t) => t.id === activeTab)?.label || 'Overview';
  const healthMetrics = computeWorldHealthMetrics(project);

  return (
    <div
      data-theme={themeMode === 'grimoire-dark' ? 'grimoire-dark' : undefined}
      className="min-h-screen flex flex-col bg-[#F6F1E6] text-[#231C14] transition-colors duration-200"
    >
      {/* Top Bar: Brand & Active Breadcrumb on Left, Global Productivity Actions on Right */}
      <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-4 px-6 py-3 bg-[#FBF8F1]/95 backdrop-blur-xs border-b-2 border-[#B5832A]/45 print:hidden">
        <div className="flex items-center gap-3.5 min-w-0">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              handleSwitchTab('overview');
            }}
            className="flex items-center gap-2 font-cartography text-xl font-bold tracking-wider text-[#231C14] whitespace-nowrap shrink-0"
          >
            <span className="text-[#B5832A] text-base" aria-hidden="true">
              ❖
            </span>
            <span>MythosCartograph</span>
          </a>

          <div className="hidden lg:flex items-center gap-2 text-xs text-[#695A47] truncate">
            <span className="text-[#B5832A]/60" aria-hidden="true">
              ✦
            </span>
            <span className="font-epic font-semibold text-[#231C14] truncate">
              {project.worldName}
            </span>
            <span aria-hidden="true">/</span>
            <span className="font-epic text-[#9E2A2B] font-bold">
              {activeTabLabel}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* 0. Dual Theme Switcher: Perkamen Siang vs Grimoire Malam Lilin */}
          <button
            type="button"
            onClick={() =>
              setThemeMode((prev) =>
                prev === 'parchment' ? 'grimoire-dark' : 'parchment'
              )
            }
            className="px-3 py-1.5 text-xs font-semibold bg-[#F6F1E6] hover:bg-[#EFE7D6] text-[#231C14] border border-[#B5832A]/60 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            title="Ubah Suasana Meja Penulis: Perkamen Siang atau Grimoire Malam Lilin"
          >
            {themeMode === 'parchment' ? (
              <>
                <Moon className="w-3.5 h-3.5 text-[#9E2A2B]" />
                <span>Grimoire Malam</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-[#B5832A]" />
                <span>Perkamen Siang</span>
              </>
            )}
          </button>

          {/* 1. Omni-Search Ctrl+K Trigger */}
          <button
            type="button"
            onClick={() => setOmniSearchOpen(true)}
            className="px-3 py-1.5 text-xs bg-[#F6F1E6] hover:bg-[#EFE7D6] text-[#231C14] border border-[#D8CBB3] rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            title="Pencarian Global Lintas Entitas, Bab, Timeline & Pin Peta (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-[#9E2A2B]" />
            <span>Cari di Dunia...</span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono-tabular bg-[#EFE7D6] border border-[#D8CBB3] rounded text-[#695A47]">
              Ctrl+K
            </kbd>
          </button>

          {/* 1b. Tombol Panduan Cerita & Checklist Interaktif */}
          <button
            type="button"
            onClick={() => setStoryGuideOpen(true)}
            className="px-3 py-1.5 text-xs font-semibold bg-[#F6F1E6] hover:bg-[#EFE7D6] text-[#231C14] border border-[#B5832A]/60 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            title="Panduan Cara Menyusun Cerita, Kamus 21 Section & Checklist Progres"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#9E2A2B]" />
            <span>Panduan Cerita</span>
          </button>

          {/* 2. Inspektur Kesehatan & Kelengkapan Lore Trigger */}
          <button
            type="button"
            onClick={() => setLoreHealthOpen(true)}
            className="px-3 py-1.5 text-xs font-semibold bg-[#F6F1E6] hover:bg-[#EFE7D6] text-[#231C14] border border-[#D8CBB3] rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            title="Inspektur Kesehatan & Kelengkapan Lore (Deteksi Tautan Kosong, Entitas Yatim & Lokasi Tanpa Pin)"
          >
            <ShieldCheck
              className={`w-3.5 h-3.5 ${
                healthMetrics.uncreatedMentions.length > 0
                  ? 'text-[#9E2A2B]'
                  : 'text-[#2D5A43]'
              }`}
            />
            <span>Kesehatan Lore ({healthMetrics.healthScore}%)</span>
          </button>

          {/* 3. Multi-World Project & Snapshot Manager Trigger */}
          <button
            type="button"
            onClick={() => setProjectManagerOpen(true)}
            className="px-3 py-1.5 text-xs font-semibold bg-[#F6F1E6] hover:bg-[#EFE7D6] text-[#231C14] border border-[#D8CBB3] rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            title="Kelola Multi-Proyek Dunia & Slot Snapshot Versi"
          >
            <FolderKanban className="w-3.5 h-3.5 text-[#B5832A]" />
            <span>Proyek & Snapshot ({savedWorlds.length})</span>
          </button>

          {/* 4. Studio Ekspor Markdown, Cetak PDF & JSON */}
          <button
            type="button"
            onClick={() => setExportStudioOpen(true)}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#9E2A2B] rounded-lg hover:bg-[#7E2021] flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Ekspor & Cetak Buku</span>
          </button>
        </div>
      </header>

      {/* Main Content Container (1440px baseline) */}
      <main
        className={`flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-5 space-y-5 ${
          exportStudioOpen ? 'print:hidden' : ''
        }`}
      >
        {/* SATU-SATUNYA Tempat Navigasi Tab Bagian World Bible — Dikelompokkan dalam 4 Pilar Semesta Fantasi */}
        <nav
          aria-label="Navigasi Bagian World Bible"
          className="bg-[#EFE7D6] border-2 border-[#B5832A]/45 rounded-2xl p-3 shadow-xs"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-3">
            {FANTASY_PILLARS.map((pillar) => {
              const colSpan = 'xl:col-span-3';
              return (
                <div
                  key={pillar.roman}
                  className={`${colSpan} bg-[#FBF8F1]/60 border border-[#D8CBB3] rounded-xl px-3 py-2 flex flex-col justify-start gap-2`}
                >
                  <div className="flex items-center justify-between gap-1 border-b border-[#D8CBB3]/70 pb-1">
                    <span className="font-epic text-[10px] font-bold uppercase tracking-[0.14em] text-[#B5832A]">
                      Pilar {pillar.roman} · {pillar.title}
                    </span>
                    <span className="text-[10px] text-[#9E2A2B]" aria-hidden="true">
                      ❖
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {pillar.tabs.map((tab) => {
                      const isActive = activeTab === tab.id;
                      const count = getTabCount(tab.id);
                      const IconComponent = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => handleSwitchTab(tab.id)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                            isActive
                              ? 'bg-[#9E2A2B] text-white shadow-xs ring-1 ring-[#B5832A]'
                              : 'bg-[#FBF8F1] text-[#231C14] hover:border-[#B5832A] border border-[#D8CBB3]/80'
                          }`}
                        >
                          <IconComponent
                            className={`w-3.5 h-3.5 shrink-0 ${
                              isActive ? 'text-[#FBF8F1]' : 'text-[#B5832A]'
                            }`}
                          />
                          <span>{tab.label}</span>
                          {count !== null && (
                            <span
                              className={`font-mono-tabular text-[10px] px-1.5 py-0.2 rounded ${
                                isActive
                                  ? 'bg-black/25 text-white'
                                  : 'bg-[#EFE7D6] text-[#695A47]'
                              }`}
                            >
                              {count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </nav>

        {/* Hidden file input for JSON import */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImportWorldJson}
          className="hidden"
        />

        {/* TAB 1: OVERVIEW (BERANDA DUNIA) */}
        {activeTab === 'overview' && (
          <WorldOverviewTab
            project={project}
            onUpdateProjectMeta={(patch) => {
              setProject((prev) => ({ ...prev, ...patch }));
              showToast('Perubahan Overview & Kosmologi berhasil disimpan.');
            }}
            onSelectEntity={handleNavigateToEntity}
            onQuickCreateEntity={handleQuickCreateEntity}
            onOpenMapTab={() => handleSwitchTab('map')}
            onOpenTimelineTab={() => handleSwitchTab('timeline')}
            onOpenGraphTab={() => handleSwitchTab('graph')}
            onOpenChapter={(chId) => {
              setSelectedChapterId(chId);
              handleSwitchTab('outliner');
            }}
            onPromoteNoteToEntity={handlePromoteNoteToEntity}
            onCreateBlankWorld={handleCreateBlankWorld}
            onResetStarterWorld={handleResetStarterWorld}
            onTriggerImportJson={() => fileInputRef.current?.click()}
          />
        )}

        {/* Dedicated Lore Category Tabs (Character, Ras, Kelompok, Power System, Skill, Negara, Wilayah, Sejarah, Artefak & Biota) */}
        {isLoreCategoryTab(activeTab) && (
          <CodexWorkspace
            category={activeTab}
            entities={project.entities}
            chapters={project.chapters}
            mapStamps={project.mapData.stamps}
            relationships={project.relationships}
            timeline={project.timeline}
            selectedEntityId={selectedEntityId}
            onSelectEntity={setSelectedEntityId}
            onNavigateToEntity={handleNavigateToEntity}
            onQuickCreateEntity={handleQuickCreateEntity}
            onSaveEntity={handleSaveEntity}
            onDeleteEntity={handleDeleteEntity}
            onUpdateRelationships={(nextRels) => {
              setProject((prev) => ({ ...prev, relationships: nextRels }));
              showToast('Jaringan relasi tokoh berhasil diperbarui.');
            }}
            onUpdateTimeline={(nextTimeline) => {
              setProject((prev) => ({ ...prev, timeline: nextTimeline }));
              showToast(
                'Catatan sejarah berhasil disinkronkan ke Pita Kronologi Dunia.'
              );
            }}
            onOpenTimeline={() => handleSwitchTab('timeline')}
            onOpenMapAtStamp={() => handleSwitchTab('map')}
            onOpenChapter={(chId) => {
              setSelectedChapterId(chId);
              handleSwitchTab('outliner');
            }}
            onRunAuditOnEntity={(ent) =>
              runLoreAudit(
                ent.title,
                CATEGORY_META[ent.category].label,
                `${ent.summary}\n\nAtribut: ${JSON.stringify(ent.attributes)}\n\n${
                  ent.content
                }`
              )
            }
            onOpenBrainstormModal={(cat) => {
              setBrainstormCategory(cat);
              setBrainstormOpen(true);
            }}
          />
        )}

        {activeTab === 'map' && (
          <MedievalMapSandbox
            mapData={project.mapData}
            entities={project.entities}
            onChangeMapData={(nextMap) =>
              setProject((prev) => ({ ...prev, mapData: nextMap }))
            }
            onSelectEntity={handleNavigateToEntity}
            onCreateEntityFromStamp={handleCreateEntityFromStamp}
          />
        )}

        {activeTab === 'timeline' && (
          <ChronicleTimelineView
            timeline={project.timeline}
            entities={project.entities}
            chapters={project.chapters}
            mapStamps={project.mapData.stamps}
            calendarSystem={project.calendarSystem}
            onUpdateTimeline={(nextTimeline) => {
              setProject((prev) => ({ ...prev, timeline: nextTimeline }));
              showToast('Pita Kronologi Dunia berhasil diperbarui.');
            }}
            onSaveEntity={handleSaveEntity}
            onSelectEntity={handleNavigateToEntity}
            onOpenChapter={(chId) => {
              setSelectedChapterId(chId);
              handleSwitchTab('outliner');
            }}
          />
        )}

        {activeTab === 'graph' && (
          <RelationshipGraphView
            entities={project.entities}
            relationships={project.relationships}
            nodePositions={project.nodePositions}
            onUpdateRelationships={(nextRels) =>
              setProject((prev) => ({ ...prev, relationships: nextRels }))
            }
            onUpdateNodePositions={(nextPos) =>
              setProject((prev) => ({ ...prev, nodePositions: nextPos }))
            }
            onSelectEntity={handleNavigateToEntity}
          />
        )}

        {activeTab === 'family_tree' && (
          <DynastyTreeStudioView
            dynastyTrees={
              project.dynastyTrees || STARTER_WORLD_PROJECT.dynastyTrees || []
            }
            entities={project.entities}
            onUpdateDynastyTrees={(nextTrees) => {
              setProject((prev) => ({ ...prev, dynastyTrees: nextTrees }));
              showToast('Pohon Silsilah & Dinasti berhasil diperbarui.');
            }}
            onSelectEntity={handleNavigateToEntity}
            onQuickCreateEntity={handleQuickCreateEntity}
          />
        )}

        {activeTab === 'prophecy_tracker' && (
          <ProphecyAndMysteryTrackerView
            mysteryPlots={
              project.mysteryPlots || STARTER_WORLD_PROJECT.mysteryPlots || []
            }
            entities={project.entities}
            chapters={project.chapters}
            onUpdateMysteryPlots={(nextItems) => {
              setProject((prev) => ({ ...prev, mysteryPlots: nextItems }));
              showToast(
                'Tracker Misteri, Nubuat & Foreshadowing berhasil diperbarui.'
              );
            }}
            onSelectEntity={handleNavigateToEntity}
            onQuickCreateEntity={handleQuickCreateEntity}
            onOpenChapter={(chId) => {
              setSelectedChapterId(chId);
              handleSwitchTab('outliner');
            }}
          />
        )}

        {activeTab === 'outliner' && (
          <ChapterOutlinerView
            chapters={project.chapters}
            entities={project.entities}
            selectedChapterId={selectedChapterId}
            onSelectChapter={setSelectedChapterId}
            onUpdateChapters={(nextChapters) =>
              setProject((prev) => ({ ...prev, chapters: nextChapters }))
            }
            onSelectEntity={handleNavigateToEntity}
            onQuickCreateEntity={handleQuickCreateEntity}
            onRunAuditOnChapter={(ch) =>
              runLoreAudit(
                `Bab ${ch.chapterNumber}: ${ch.title}`,
                'Alur Bab & Naskah',
                `Sinopsis: ${ch.synopsis}\n\nCatatan Naskah:\n${ch.draftNotes}`
              )
            }
          />
        )}

        {activeTab === 'free_canvas' && (
          <FreeformCanvasView
            canvasData={project.freeCanvas}
            entities={project.entities}
            chapters={project.chapters}
            onChangeCanvasData={(nextCanvas) =>
              setProject((prev) => ({ ...prev, freeCanvas: nextCanvas }))
            }
            onSelectEntity={handleNavigateToEntity}
            onOpenChapter={(chId) => {
              setSelectedChapterId(chId);
              handleSwitchTab('outliner');
            }}
            onQuickCreateEntity={handleQuickCreateEntity}
            onPromoteCardToEntity={handlePromoteCanvasCardToEntity}
          />
        )}
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="border-t border-[#D8CBB3] bg-[#EFE7D6]/60 px-6 py-4 mt-12 print:hidden">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-4 text-xs text-[#695A47]">
          <span>
            MythosCartograph — Studio World Bible, Peta Abad Pertengahan & Arsitektur Cerita
          </span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setProjectManagerOpen(true)}
              className="hover:text-[#231C14] underline underline-offset-4 cursor-pointer"
            >
              Manajer Proyek & Snapshot ({savedWorlds.length} Dunia)
            </button>
            <button
              type="button"
              onClick={() => setExportStudioOpen(true)}
              className="hover:text-[#231C14] underline underline-offset-4 cursor-pointer"
            >
              Ekspor Buku (.MD / PDF / .JSON)
            </button>
          </div>
        </div>
      </footer>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#231C14] text-[#FBF8F1] px-4 py-2.5 rounded-xl shadow-lg border border-[#B5832A] text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#B5832A]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modal 1: AI Lore Consistency Auditor */}
      {auditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FBF8F1] border-2 border-[#3B2E1E] rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-4 shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-[#D8CBB3] pb-3">
              <div>
                <div className="text-xs font-semibold text-[#9E2A2B]">
                  Editor Konsistensi Semesta Cerita (AI Lore Auditor)
                </div>
                <h3 className="font-display text-2xl font-bold text-[#231C14]">
                  Hasil Audit: {auditTargetTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAuditModalOpen(false)}
                className="p-1.5 rounded-lg border border-[#D8CBB3] text-[#695A47] hover:text-[#231C14] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {auditLoading && (
              <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
                <Loader2 className="w-7 h-7 text-[#9E2A2B] animate-spin" />
                <div className="text-sm font-semibold text-[#231C14]">
                  Memeriksa silang dengan aturan Power System, Timeline, dan Karakter...
                </div>
              </div>
            )}

            {auditError && (
              <div className="p-4 rounded-xl bg-[#9E2A2B]/10 border border-[#9E2A2B] text-xs text-[#9E2A2B] space-y-1">
                <div className="font-bold">Gagal Menjalankan Audit</div>
                <p>{auditError}</p>
              </div>
            )}

            {auditResult && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-1.5">
                  <div className="text-xs font-semibold text-[#9E2A2B]">
                    Status Konsistensi: {auditResult.overallStatus}
                  </div>
                  <p className="text-sm text-[#231C14] leading-relaxed">
                    {auditResult.summary}
                  </p>
                </div>

                <div className="space-y-2.5">
                  <div className="text-xs font-semibold text-[#695A47]">
                    Temuan Potensi Kontradiksi / Catatan Lore (
                    {auditResult.issues?.length || 0})
                  </div>
                  {!auditResult.issues || auditResult.issues.length === 0 ? (
                    <div className="p-3.5 rounded-xl bg-[#EFE7D6] text-xs text-[#2D5A43] font-medium">
                      Tidak ditemukan kontradiksi langsung dengan entitas World Bible yang ada.
                    </div>
                  ) : (
                    auditResult.issues.map((iss, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs text-[#695A47]">
                          <span className="font-semibold text-[#9E2A2B]">
                            [{iss.severity}] {iss.category}
                          </span>
                        </div>
                        <div className="font-display text-lg font-bold text-[#231C14]">
                          {iss.title}
                        </div>
                        <p className="text-xs text-[#231C14]/90 leading-relaxed">
                          {iss.explanation}
                        </p>
                        <div className="pt-1 text-xs text-[#2D5A43] font-medium">
                          Saran Solusi: {iss.suggestedFix}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {auditResult.creativeSuggestions &&
                  auditResult.creativeSuggestions.length > 0 && (
                    <div className="p-4 rounded-xl bg-[#EFE7D6]/70 border border-[#D8CBB3] space-y-2">
                      <div className="text-xs font-semibold text-[#231C14]">
                        Saran Pengembangan Cerita Terkait:
                      </div>
                      <ul className="space-y-1.5 text-xs text-[#231C14] list-disc pl-4">
                        {auditResult.creativeSuggestions.map((s, idx) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal 2: AI Lore Brainstorming Generator */}
      {brainstormOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FBF8F1] border-2 border-[#3B2E1E] rounded-2xl max-w-3xl w-full max-h-[88vh] overflow-y-auto p-6 space-y-4 shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-[#D8CBB3] pb-3">
              <div>
                <div className="text-xs font-semibold text-[#B5832A]">
                  Asisten Perancang Semesta (AI Worldbuilding Architect)
                </div>
                <h3 className="font-display text-2xl font-bold text-[#231C14]">
                  Brainstorm Entitas Baru untuk {project.worldName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setBrainstormOpen(false)}
                className="p-1.5 rounded-lg border border-[#D8CBB3] text-[#695A47] hover:text-[#231C14] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRunBrainstorm} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#695A47] mb-1">
                    Kategori Entitas
                  </label>
                  <select
                    value={brainstormCategory}
                    onChange={(e) =>
                      setBrainstormCategory(e.target.value as LoreCategory)
                    }
                    className="w-full px-3 py-2 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg"
                  >
                    {Object.entries(CATEGORY_META).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-[#695A47] mb-1">
                    Arahan / Tema Khusus (Opsional)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={brainstormFocus}
                      onChange={(e) => setBrainstormFocus(e.target.value)}
                      placeholder="Contoh: Faksi mata-mata di Solis Prime atau skill terlarang jalur bulan..."
                      className="flex-1 px-3 py-2 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg"
                    />
                    <button
                      type="submit"
                      disabled={brainstormLoading}
                      className="px-4 py-2 text-xs font-semibold bg-[#9E2A2B] text-white rounded-lg hover:bg-[#7E2021] disabled:opacity-50 cursor-pointer whitespace-nowrap"
                    >
                      {brainstormLoading ? 'Merancang...' : 'Hasilkan 3 Konsep'}
                    </button>
                  </div>
                </div>
              </div>
            </form>

            {brainstormLoading && (
              <div className="py-10 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 text-[#9E2A2B] animate-spin" />
                <span className="text-xs text-[#695A47]">
                  Menyusun konsep yang terhubung dengan entitas di {project.worldName}...
                </span>
              </div>
            )}

            {brainstormError && (
              <div className="p-3.5 rounded-xl bg-[#9E2A2B]/10 border border-[#9E2A2B] text-xs text-[#9E2A2B]">
                {brainstormError}
              </div>
            )}

            {brainstormIdeas.length > 0 && (
              <div className="space-y-3 pt-2">
                {brainstormIdeas.map((idea, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-display text-xl font-bold text-[#231C14]">
                          {idea.title}
                        </div>
                        <div className="text-xs italic text-[#695A47]">
                          {idea.subtitle}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAdoptBrainstormIdea(idea)}
                        className="px-3 py-1.5 text-xs font-semibold bg-[#231C14] text-[#FBF8F1] rounded-lg hover:bg-[#3A2E21] cursor-pointer shrink-0"
                      >
                        + Tambahkan ke Tab {CATEGORY_META[brainstormCategory].singular}
                      </button>
                    </div>
                    <p className="text-xs font-medium text-[#231C14]">
                      {idea.summary}
                    </p>
                    <p className="text-xs text-[#695A47] whitespace-pre-line leading-relaxed">
                      {idea.content}
                    </p>
                    <div className="text-xs text-[#9E2A2B] font-medium pt-1">
                      Pemicu Plot: {idea.plotHook}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal 3: Pencarian Global Kilat (Ctrl+K Omni-Search) */}
      <GlobalOmniSearchModal
        isOpen={omniSearchOpen}
        onClose={() => setOmniSearchOpen(false)}
        project={project}
        onSelectEntity={handleNavigateToEntity}
        onSelectChapter={(chId) => {
          setSelectedChapterId(chId);
          handleSwitchTab('outliner');
        }}
        onOpenTimelineEvent={() => handleSwitchTab('timeline')}
        onOpenMapStamp={(stamp) => {
          if (stamp.linkedEntityId) {
            handleNavigateToEntity(stamp.linkedEntityId);
          } else {
            handleSwitchTab('map');
          }
        }}
      />

      {/* Modal 4: Manajer Multi-Proyek Dunia & Slot Snapshot Versi */}
      <MultiWorldProjectManagerModal
        isOpen={projectManagerOpen}
        onClose={() => setProjectManagerOpen(false)}
        activeProject={project}
        savedWorlds={savedWorlds}
        snapshots={snapshots}
        onSwitchWorld={handleSwitchWorld}
        onCreateNewWorld={handleCreateCustomNewWorld}
        onDuplicateWorld={handleDuplicateWorld}
        onDeleteWorld={handleDeleteWorld}
        onRestoreStarterWorld={handleResetStarterWorld}
        onTriggerImportJson={() => fileInputRef.current?.click()}
        onExportWorld={handleExportSpecificWorldJson}
        onCreateSnapshot={handleCreateSnapshot}
        onRestoreSnapshot={handleRestoreSnapshot}
        onDeleteSnapshot={handleDeleteSnapshot}
      />

      {/* Modal 5: Studio Ekspor Buku World Bible, Naskah Markdown & Cetak PDF */}
      <WorldExportStudioModal
        isOpen={exportStudioOpen}
        onClose={() => setExportStudioOpen(false)}
        project={project}
        onExportJson={handleExportWorldJson}
        onTriggerImportJson={() => fileInputRef.current?.click()}
        onShowToast={showToast}
      />

      {/* Modal 6: Inspektur Kesehatan & Kelengkapan Lore */}
      <LoreHealthInspectorModal
        isOpen={loreHealthOpen}
        onClose={() => setLoreHealthOpen(false)}
        project={project}
        onSelectEntity={handleNavigateToEntity}
        onQuickCreateEntity={handleQuickCreateEntity}
        onOpenGraphTab={() => handleSwitchTab('graph')}
        onOpenOutlinerTab={() => handleSwitchTab('outliner')}
        onAutoPinLocationOnMap={handleAutoPinLocationOnMap}
      />

      {/* Modal 7: Panduan Arsitektur Cerita & Checklist 4 Tahap */}
      <StoryArchitectGuideModal
        isOpen={storyGuideOpen}
        onClose={() => setStoryGuideOpen(false)}
        project={project}
        onNavigateToTab={(tabId) => handleSwitchTab(tabId as WorkspaceTab)}
        onShowToast={showToast}
      />
    </div>
  );
}
