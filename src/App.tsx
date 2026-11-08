import React, { useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  Loader2,
  X,
} from 'lucide-react';
import { STARTER_WORLD_PROJECT } from './data/starterWorld';
import {
  LoreAuditResult,
  LoreCategory,
  LoreEntity,
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

const STORAGE_KEY = 'mythos_cartograph_world_v1';

export type WorkspaceTab =
  | 'overview'
  | 'map'
  | 'character'
  | 'race'
  | 'faction'
  | 'power_system'
  | 'skill'
  | 'nation'
  | 'region'
  | 'history'
  | 'timeline'
  | 'encyclopedia'
  | 'graph'
  | 'outliner';

const LORE_CATEGORY_TABS: LoreCategory[] = [
  'character',
  'race',
  'faction',
  'nation',
  'region',
  'power_system',
  'skill',
  'history',
  'encyclopedia',
];

function isLoreCategoryTab(tab: WorkspaceTab): tab is LoreCategory {
  return LORE_CATEGORY_TABS.includes(tab as LoreCategory);
}

const SECTION_TABS: Array<{
  id: WorkspaceTab;
  label: string;
}> = [
  { id: 'overview', label: 'Overview' },
  { id: 'map', label: 'Map Dunia' },
  { id: 'character', label: 'Character' },
  { id: 'race', label: 'Ras' },
  { id: 'faction', label: 'Kelompok' },
  { id: 'power_system', label: 'Power System' },
  { id: 'skill', label: 'Skill' },
  { id: 'nation', label: 'Negara' },
  { id: 'region', label: 'Wilayah' },
  { id: 'history', label: 'Sejarah' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'encyclopedia', label: 'Artefak & Biota' },
  { id: 'graph', label: 'Peta Relasi' },
  { id: 'outliner', label: 'Alur Bab' },
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
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load world from localStorage:', e);
    }
    return STARTER_WORLD_PROJECT;
  });

  const [activeTab, setActiveTab] = useState<WorkspaceTab>('overview');
  const [selectedEntityId, setSelectedEntityId] = useState<string>(
    project.entities[0]?.id || ''
  );
  const [selectedChapterId, setSelectedChapterId] = useState<string>(
    project.chapters[0]?.id || ''
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    } catch (e) {
      console.error('Failed to save world to localStorage:', e);
    }
  }, [project]);

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

  const handleExportWorldJson = () => {
    const blob = new Blob([JSON.stringify(project, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.worldName.toLowerCase().replace(/\s+/g, '-')}-world-bible.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Berkas JSON World Bible berhasil diunduh.');
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
          showToast(`Proyek "${parsed.worldName}" berhasil diimpor.`);
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
    showToast('Dunia contoh "Kronik Benua Aethelia" telah dipulihkan.');
  };

  const handleCreateBlankWorld = () => {
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

    const blankWorld: WorldProject = {
      id: `world-${Date.now()}`,
      worldName: 'Semesta Cerita Baru',
      tagline: 'Tuliskan premis utama dunia fantasi atau fiksi Anda di sini',
      genre: 'Fantasi / Fiksi',
      calendarSystem: 'Tahun ke-1 Era Baru',
      authorName: project.authorName || 'Penulis',
      heroBannerUrl: project.heroBannerUrl,
      epigraphQuote: 'Tuliskan kutipan epigrafi atau ramalan pembuka dunia Anda di sini.',
      epigraphSource: 'Kronik Kuno Bab I',
      centralConflict: 'Tuliskan konflik utama yang menggerakkan cerita di dunia ini. Gunakan [[Tokoh Utama Pertama]] untuk menautkan entitas.',
      storyThemes: 'Takdir, Kekuasaan, dan Pengorbanan',
      cosmologyCreationMyth: 'Tuliskan mitos penciptaan semesta atau sejarah awal mula terbentuknya dunia Anda.',
      cosmologyLaws: 'Tuliskan aturan fundamental alam semesta, batas sihir, atau hukum kosmik yang tidak dapat dilanggar.',
      scratchpadNotes: [],
      entities: [starterEntity],
      mapData: {
        mapTitle: 'Peta Dunia Baru',
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
          id: `chap-${Date.now()}`,
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

    setProject(blankWorld);
    setSelectedEntityId(starterEntity.id);
    setActiveTab('overview');
    showToast('Proyek World Bible kosong berhasil dibuat.');
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
    if (tabId === 'outliner') return project.chapters.length;
    return null;
  };

  const activeTabLabel =
    SECTION_TABS.find((t) => t.id === activeTab)?.label || 'Overview';

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F1E6] text-[#231C14]">
      {/* Top Bar: Brand & Active Breadcrumb on Left, Project Export on Right (NO duplicate tab buttons here) */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-6 py-3.5 bg-[#FBF8F1]/95 backdrop-blur-xs border-b border-[#D8CBB3]">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            handleSwitchTab('overview');
          }}
          className="font-cartography text-xl font-bold tracking-tight text-[#231C14] whitespace-nowrap shrink-0"
        >
          MythosCartograph
        </a>

        <div className="hidden md:flex items-center gap-2 text-xs text-[#695A47] truncate">
          <span className="font-semibold text-[#231C14] truncate">
            {project.worldName}
          </span>
          <span aria-hidden="true">/</span>
          <span className="text-[#9E2A2B] font-semibold">{activeTabLabel}</span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleExportWorldJson}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#9E2A2B] rounded-lg hover:bg-[#7E2021] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Ekspor World JSON
          </button>
        </div>
      </header>

      {/* Main Content Container (1440px baseline) */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-5 space-y-5">
        {/* SATU-SATUNYA Tempat Navigasi Tab Bagian World Bible */}
        <nav
          aria-label="Navigasi Bagian World Bible"
          className="bg-[#EFE7D6] border border-[#D8CBB3] rounded-xl p-2"
        >
          <div className="flex flex-wrap items-center gap-1.5">
            {SECTION_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const count = getTabCount(tab.id);
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleSwitchTab(tab.id)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#9E2A2B] text-white shadow-xs'
                      : 'bg-[#FBF8F1]/85 text-[#231C14] hover:bg-[#FBF8F1] border border-[#D8CBB3]/70'
                  }`}
                >
                  <span>{tab.label}</span>
                  {count !== null && (
                    <span
                      className={`font-mono-tabular text-[11px] px-1.5 py-0.2 rounded ${
                        isActive
                          ? 'bg-black/20 text-white'
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
            selectedEntityId={selectedEntityId}
            onSelectEntity={setSelectedEntityId}
            onSaveEntity={handleSaveEntity}
            onDeleteEntity={handleDeleteEntity}
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
          />
        )}

        {activeTab === 'timeline' && (
          <ChronicleTimelineView
            timeline={project.timeline}
            entities={project.entities}
            calendarSystem={project.calendarSystem}
            onUpdateTimeline={(nextTimeline) =>
              setProject((prev) => ({ ...prev, timeline: nextTimeline }))
            }
            onSelectEntity={handleNavigateToEntity}
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
            onRunAuditOnChapter={(ch) =>
              runLoreAudit(
                `Bab ${ch.chapterNumber}: ${ch.title}`,
                'Alur Bab & Naskah',
                `Sinopsis: ${ch.synopsis}\n\nCatatan Naskah:\n${ch.draftNotes}`
              )
            }
          />
        )}
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="border-t border-[#D8CBB3] bg-[#EFE7D6]/60 px-6 py-4 mt-12">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-4 text-xs text-[#695A47]">
          <span>
            MythosCartograph — Studio World Bible, Peta Abad Pertengahan & Arsitektur Cerita
          </span>
          <button
            type="button"
            onClick={handleExportWorldJson}
            className="hover:text-[#231C14] underline underline-offset-4 cursor-pointer"
          >
            Cadangkan World Bible (.JSON)
          </button>
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
    </div>
  );
}
