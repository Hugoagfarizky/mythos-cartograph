import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  Calendar,
  CheckCircle2,
  Compass,
  Download,
  FileText,
  GitBranch,
  Layers,
  Loader2,
  Plus,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Upload,
  Wand2,
  X,
} from 'lucide-react';
import { STARTER_WORLD_PROJECT } from './data/starterWorld';
import {
  ChapterOutline,
  LoreAuditResult,
  LoreCategory,
  LoreEntity,
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
  PrdBlueprintView,
} from './components/ChapterOutlinerAndPrdView';

const STORAGE_KEY = 'mythos_cartograph_world_v1';

type ActiveModule = 'codex' | 'map' | 'timeline' | 'graph' | 'outliner' | 'prd';

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

  const [activeModule, setActiveModule] = useState<ActiveModule>('codex');
  const [activeCategory, setActiveCategory] = useState<LoreCategory | 'all'>('all');
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

  const handleSaveEntity = (entity: LoreEntity) => {
    setProject((prev) => {
      const exists = prev.entities.some((e) => e.id === entity.id);
      const nextEntities = exists
        ? prev.entities.map((e) => (e.id === entity.id ? entity : e))
        : [entity, ...prev.entities];
      return { ...prev, entities: nextEntities };
    });
    showToast(`Entri "${entity.title}" berhasil disimpan ke World Bible.`);
  };

  const handleDeleteEntity = (entityId: string) => {
    const target = project.entities.find((e) => e.id === entityId);
    setProject((prev) => {
      const remaining = prev.entities.filter((e) => e.id !== entityId);
      if (selectedEntityId === entityId && remaining.length > 0) {
        setSelectedEntityId(remaining[0].id);
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

  const handleNavigateToEntity = (entityId: string) => {
    setSelectedEntityId(entityId);
    setActiveModule('codex');
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
    setActiveModule('codex');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F1E6] text-[#231C14]">
      {/* Strict 3-Zone Top Navigation Bar Contract */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-6 py-4 bg-[#FBF8F1]/95 backdrop-blur-xs border-b border-[#D8CBB3]">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setActiveModule('codex');
          }}
          className="font-cartography text-xl font-bold tracking-tight text-[#231C14] whitespace-nowrap shrink-0"
        >
          MythosCartograph
        </a>

        {/* Zone 2: 5 concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#695A47]">
          <button
            type="button"
            onClick={() => setActiveModule('codex')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeModule === 'codex'
                ? 'text-[#9E2A2B] font-semibold underline decoration-[#9E2A2B] underline-offset-8'
                : 'hover:text-[#231C14]'
            }`}
          >
            World Bible
          </button>
          <button
            type="button"
            onClick={() => setActiveModule('map')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeModule === 'map'
                ? 'text-[#9E2A2B] font-semibold underline decoration-[#9E2A2B] underline-offset-8'
                : 'hover:text-[#231C14]'
            }`}
          >
            Peta Dunia
          </button>
          <button
            type="button"
            onClick={() => setActiveModule('timeline')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeModule === 'timeline'
                ? 'text-[#9E2A2B] font-semibold underline decoration-[#9E2A2B] underline-offset-8'
                : 'hover:text-[#231C14]'
            }`}
          >
            Timeline
          </button>
          <button
            type="button"
            onClick={() => setActiveModule('graph')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeModule === 'graph'
                ? 'text-[#9E2A2B] font-semibold underline decoration-[#9E2A2B] underline-offset-8'
                : 'hover:text-[#231C14]'
            }`}
          >
            Peta Relasi
          </button>
          <button
            type="button"
            onClick={() => setActiveModule('outliner')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeModule === 'outliner'
                ? 'text-[#9E2A2B] font-semibold underline decoration-[#9E2A2B] underline-offset-8'
                : 'hover:text-[#231C14]'
            }`}
          >
            Alur Bab
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
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
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Split-Screen World Overview Banner + Full-Width 4-Column Metric Row Below */}
        <section className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch bg-[#FBF8F1] border border-[#D8CBB3] rounded-2xl p-6">
            {/* Left Column: World Typography & Studio Controls */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="text-xs text-[#9E2A2B] font-semibold">
                  {project.genre} · {project.calendarSystem}
                </div>
                <h1 className="font-display text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#231C14] leading-[1.12]">
                  {project.worldName}
                </h1>
                <p className="text-sm sm:text-base text-[#695A47] max-w-2xl leading-relaxed">
                  {project.tagline}
                </p>
              </div>

              {/* Studio Mode & File Toolbar */}
              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModule('map')}
                  className="px-4 py-2 text-xs font-semibold bg-[#231C14] text-[#FBF8F1] rounded-lg hover:bg-[#3A2E21] flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5 text-[#B5832A]" />
                  Buka Kanvas Peta Abad Pertengahan
                </button>

                <button
                  type="button"
                  onClick={() => setActiveModule('prd')}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-lg border flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    activeModule === 'prd'
                      ? 'bg-[#9E2A2B] text-white border-[#9E2A2B]'
                      : 'bg-[#F6F1E6] text-[#231C14] border-[#D8CBB3] hover:bg-[#EFE7D6]'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Dokumen Konsep PRD & Pengaturan Dunia
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 text-xs font-medium bg-[#F6F1E6] text-[#231C14] border border-[#D8CBB3] rounded-lg hover:bg-[#EFE7D6] flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Impor JSON
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImportWorldJson}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={handleResetStarterWorld}
                  className="px-3 py-2 text-xs font-medium text-[#695A47] hover:text-[#231C14] flex items-center gap-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  title="Kembalikan data contoh dunia Aethelia"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Contoh Dunia
                </button>
              </div>
            </div>

            {/* Right Column: Matching Height Visual Container */}
            <div className="lg:col-span-5">
              <div className="relative h-56 lg:h-full min-h-[210px] rounded-xl overflow-hidden border border-[#D8CBB3] bg-[#EFE7D6]">
                <img
                  src={project.heroBannerUrl}
                  alt={project.worldName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent flex items-end p-4">
                  <div className="text-[#FBF8F1]">
                    <div className="text-[11px] text-[#E6D5B8]">
                      Arsiparis Utama: {project.authorName} · Penyimpanan Otomatis Aktif
                    </div>
                    <div className="font-cartography text-sm font-bold tracking-wide">
                      Atlas & Ensiklopedia Kanon Terpadu
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Full-Width 4-Column World Bible Metrics Strip Below Hero Split */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              type="button"
              onClick={() => setActiveModule('codex')}
              className="text-left bg-[#FBF8F1] border border-[#D8CBB3] hover:border-[#9E2A2B] rounded-xl p-4 transition-colors cursor-pointer"
            >
              <div className="text-xs text-[#695A47]">
                Entitas World Bible (9 Kategori)
              </div>
              <div className="font-mono-tabular text-2xl font-bold text-[#231C14] mt-1">
                {project.entities.length} Entri Kanon
              </div>
              <div className="text-[11px] text-[#9E2A2B] mt-1">
                Karakter · Ras · Negara · Power System · Skill
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveModule('map')}
              className="text-left bg-[#FBF8F1] border border-[#D8CBB3] hover:border-[#9E2A2B] rounded-xl p-4 transition-colors cursor-pointer"
            >
              <div className="text-xs text-[#695A47]">
                Titik Peta & Label Kartografi
              </div>
              <div className="font-mono-tabular text-2xl font-bold text-[#231C14] mt-1">
                {project.mapData.stamps.length} Pin Lokasi
              </div>
              <div className="text-[11px] text-[#695A47] mt-1">
                {project.mapData.regionLabels.length} Label Wilayah · {project.mapData.rivers.length} Aliran Sungai
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveModule('timeline')}
              className="text-left bg-[#FBF8F1] border border-[#D8CBB3] hover:border-[#9E2A2B] rounded-xl p-4 transition-colors cursor-pointer"
            >
              <div className="text-xs text-[#695A47]">
                Kronik Sejarah & Jaringan Relasi
              </div>
              <div className="font-mono-tabular text-2xl font-bold text-[#231C14] mt-1">
                {project.timeline.length} Peristiwa Era
              </div>
              <div className="text-[11px] text-[#695A47] mt-1">
                {project.relationships.length} Ikatan Relasi Karakter & Faksi
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveModule('outliner')}
              className="text-left bg-[#FBF8F1] border border-[#D8CBB3] hover:border-[#9E2A2B] rounded-xl p-4 transition-colors cursor-pointer"
            >
              <div className="text-xs text-[#695A47]">
                Alur Cerita & Target Naskah
              </div>
              <div className="font-mono-tabular text-2xl font-bold text-[#231C14] mt-1">
                {project.chapters.length} Bab Aktif
              </div>
              <div className="text-[11px] text-[#695A47] mt-1">
                Terhubung langsung ke elemen World Bible
              </div>
            </button>
          </div>
        </section>

        {/* Mobile Module Switcher */}
        <div className="flex md:hidden overflow-x-auto gap-1.5 bg-[#EFE7D6] p-1.5 rounded-xl border border-[#D8CBB3]">
          {(
            [
              ['codex', 'World Bible'],
              ['map', 'Peta Dunia'],
              ['timeline', 'Timeline'],
              ['graph', 'Peta Relasi'],
              ['outliner', 'Alur Bab'],
              ['prd', 'PRD'],
            ] as const
          ).map(([mod, lbl]) => (
            <button
              key={mod}
              type="button"
              onClick={() => setActiveModule(mod)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 ${
                activeModule === mod
                  ? 'bg-[#9E2A2B] text-white'
                  : 'text-[#231C14]'
              }`}
            >
              {lbl}
            </button>
          ))}
        </div>

        {/* Active Workspace Module */}
        {activeModule === 'codex' && (
          <CodexWorkspace
            activeCategory={activeCategory}
            onChangeCategory={setActiveCategory}
            entities={project.entities}
            chapters={project.chapters}
            mapStamps={project.mapData.stamps}
            selectedEntityId={selectedEntityId}
            onSelectEntity={setSelectedEntityId}
            onSaveEntity={handleSaveEntity}
            onDeleteEntity={handleDeleteEntity}
            onOpenMapAtStamp={() => setActiveModule('map')}
            onOpenChapter={(chId) => {
              setSelectedChapterId(chId);
              setActiveModule('outliner');
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

        {activeModule === 'map' && (
          <MedievalMapSandbox
            mapData={project.mapData}
            entities={project.entities}
            onChangeMapData={(nextMap) =>
              setProject((prev) => ({ ...prev, mapData: nextMap }))
            }
            onSelectEntity={handleNavigateToEntity}
          />
        )}

        {activeModule === 'timeline' && (
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

        {activeModule === 'graph' && (
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

        {activeModule === 'outliner' && (
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

        {activeModule === 'prd' && (
          <PrdBlueprintView
            project={project}
            onUpdateProjectMeta={(patch) =>
              setProject((prev) => ({ ...prev, ...patch }))
            }
            onNavigateModule={setActiveModule}
          />
        )}
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="border-t border-[#D8CBB3] bg-[#EFE7D6]/60 px-6 py-4 mt-12">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-4 text-xs text-[#695A47]">
          <span>
            MythosCartograph — Studio World Bible, Peta Abad Pertengahan & Arsitektur Cerita
          </span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setActiveModule('prd')}
              className="hover:text-[#231C14] underline underline-offset-4 cursor-pointer"
            >
              Dokumentasi PRD
            </button>
            <button
              type="button"
              onClick={handleExportWorldJson}
              className="hover:text-[#231C14] underline underline-offset-4 cursor-pointer"
            >
              Cadangkan Data (.JSON)
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
                        + Tambahkan ke World Bible
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
