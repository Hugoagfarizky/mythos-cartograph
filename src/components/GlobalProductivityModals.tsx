import React, { useEffect, useMemo, useState } from 'react';
import {
  Archive,
  ArrowRight,
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  Compass,
  Copy,
  Download,
  Eye,
  FileDown,
  FileJson,
  FileText,
  FolderKanban,
  GitBranch,
  History,
  MapPin,
  Plus,
  Printer,
  RotateCcw,
  Search,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import {
  ChapterOutline,
  LoreCategory,
  LoreEntity,
  MapStamp,
  TimelineEvent,
  WorldProject,
} from '../types/world';
import { CATEGORY_META, WikiTextRenderer } from './WikiTextRenderer';

export interface WorldSnapshot {
  id: string;
  worldId: string;
  worldName: string;
  label: string;
  createdAt: string;
  entityCount: number;
  chapterCount: number;
  projectData: WorldProject;
}

type OmniSearchScope = 'all' | 'entity' | 'chapter' | 'timeline' | 'map';

interface OmniSearchResultItem {
  id: string;
  kind: 'entity' | 'chapter' | 'timeline' | 'map';
  title: string;
  subtitle: string;
  badgeText: string;
  matchSnippet: string;
  entity?: LoreEntity;
  chapter?: ChapterOutline;
  timelineEvent?: TimelineEvent;
  mapStamp?: MapStamp;
}

interface GlobalOmniSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: WorldProject;
  onSelectEntity: (entityId: string) => void;
  onSelectChapter: (chapterId: string) => void;
  onOpenTimelineEvent: () => void;
  onOpenMapStamp: (stamp: MapStamp) => void;
}

export const GlobalOmniSearchModal: React.FC<GlobalOmniSearchModalProps> = ({
  isOpen,
  onClose,
  project,
  onSelectEntity,
  onSelectChapter,
  onOpenTimelineEvent,
  onOpenMapStamp,
}) => {
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<OmniSearchScope>('all');
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setScope('all');
      setActiveIndex(0);
    }
  }, [isOpen]);

  const results = useMemo<OmniSearchResultItem[]>(() => {
    const q = query.trim().toLowerCase();
    const list: OmniSearchResultItem[] = [];

    // 1. Entities
    if (scope === 'all' || scope === 'entity') {
      project.entities.forEach((ent) => {
        const catMeta = CATEGORY_META[ent.category];
        const attrValues = Object.values(ent.attributes || {})
          .filter(Boolean)
          .join(' ');
        const haystack = `${ent.title} ${ent.subtitle} ${ent.summary} ${ent.content} ${(ent.tags || []).join(' ')} ${attrValues}`.toLowerCase();
        if (!q || haystack.includes(q)) {
          list.push({
            id: `ent-${ent.id}`,
            kind: 'entity',
            title: ent.title,
            subtitle: ent.subtitle || catMeta.singular,
            badgeText: catMeta.singular,
            matchSnippet: ent.summary,
            entity: ent,
          });
        }
      });
    }

    // 2. Chapters & Scenes
    if (scope === 'all' || scope === 'chapter') {
      project.chapters.forEach((ch) => {
        const sceneText = (ch.scenes || [])
          .map((s) => `${s.title} ${s.summary} ${s.povCharacter} ${s.settingRegion}`)
          .join(' ');
        const haystack = `bab ${ch.chapterNumber} ${ch.title} ${ch.act} ${ch.synopsis} ${ch.chapterGoal || ''} ${ch.centralConflict || ''} ${ch.primaryPov || ''} ${ch.primaryLocation || ''} ${sceneText}`.toLowerCase();
        if (!q || haystack.includes(q)) {
          list.push({
            id: `chap-${ch.id}`,
            kind: 'chapter',
            title: `Bab ${ch.chapterNumber}: ${ch.title}`,
            subtitle: `${ch.act} · Status: ${ch.status}${ch.primaryPov ? ` · POV: ${ch.primaryPov}` : ''}`,
            badgeText: 'Alur Bab',
            matchSnippet: ch.synopsis,
            chapter: ch,
          });
        }
      });
    }

    // 3. Timeline Events
    if (scope === 'all' || scope === 'timeline') {
      project.timeline.forEach((ev) => {
        const haystack = `${ev.title} ${ev.displayDate} ${ev.era} ${ev.regionName || ''} ${ev.summary} ${ev.consequenceImpact || ''}`.toLowerCase();
        if (!q || haystack.includes(q)) {
          list.push({
            id: `tl-${ev.id}`,
            kind: 'timeline',
            title: ev.title,
            subtitle: `${ev.displayDate} · ${ev.era}${ev.regionName ? ` · ${ev.regionName}` : ''}`,
            badgeText: 'Timeline',
            matchSnippet: ev.summary,
            timelineEvent: ev,
          });
        }
      });
    }

    // 4. Map Stamps
    if (scope === 'all' || scope === 'map') {
      project.mapData.stamps.forEach((st) => {
        const haystack = `${st.label} ${st.type} ${st.x} ${st.y}`.toLowerCase();
        if (!q || haystack.includes(q)) {
          list.push({
            id: `map-${st.id}`,
            kind: 'map',
            title: st.label,
            subtitle: `Koordinat Peta: ${st.x}°B, ${st.y}°U`,
            badgeText: 'Pin Peta',
            matchSnippet: st.linkedEntityId
              ? 'Tertaut ke entitas World Bible di kanvas Peta Dunia'
              : 'Titik lokasi kartografi di kanvas Peta Dunia',
            mapStamp: st,
          });
        }
      });
    }

    return list.slice(0, 40);
  }, [query, scope, project]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, scope]);

  const handleActivateItem = (item: OmniSearchResultItem) => {
    if (item.kind === 'entity' && item.entity) {
      onSelectEntity(item.entity.id);
    } else if (item.kind === 'chapter' && item.chapter) {
      onSelectChapter(item.chapter.id);
    } else if (item.kind === 'timeline') {
      onOpenTimelineEvent();
    } else if (item.kind === 'map' && item.mapStamp) {
      onOpenMapStamp(item.mapStamp);
    }
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (results.length > 0) {
        setActiveIndex((prev) => (prev + 1) % results.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (results.length > 0) {
        setActiveIndex((prev) => (prev - 1 + results.length) % results.length);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = results[activeIndex];
      if (target) {
        handleActivateItem(target);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-start justify-center pt-14 px-4 pb-6"
      onClick={onClose}
    >
      <div
        className="bg-[#FBF8F1] border-2 border-[#3B2E1E] rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[82vh]"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Top Search Bar */}
        <div className="p-4 border-b border-[#D8CBB3] bg-[#F6F1E6] space-y-3">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-[#9E2A2B] absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Cari tokoh, wilayah, skill, peristiwa sejarah, pin peta, atau bab di ${project.worldName}...`}
              className="w-full pl-10 pr-20 py-2.5 text-sm bg-[#FBF8F1] border border-[#D8CBB3] rounded-xl text-[#231C14] placeholder:text-[#695A47]/70 focus:outline-none focus:border-[#9E2A2B]"
            />
            <button
              type="button"
              onClick={onClose}
              className="absolute right-2.5 px-2 py-1 text-[11px] font-mono-tabular text-[#695A47] bg-[#EFE7D6] hover:text-[#231C14] rounded-md cursor-pointer"
            >
              ESC
            </button>
          </div>

          {/* Scope Filters */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  { id: 'all', label: 'Semua Cakupan' },
                  { id: 'entity', label: `Entitas Lore (${project.entities.length})` },
                  { id: 'chapter', label: `Alur Bab (${project.chapters.length})` },
                  { id: 'timeline', label: `Timeline (${project.timeline.length})` },
                  { id: 'map', label: `Pin Peta (${project.mapData.stamps.length})` },
                ] as Array<{ id: OmniSearchScope; label: string }>
              ).map((tab) => {
                const active = scope === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setScope(tab.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      active
                        ? 'bg-[#9E2A2B] text-white'
                        : 'bg-[#EFE7D6] text-[#695A47] hover:text-[#231C14]'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
            <span className="text-[11px] text-[#695A47] font-mono-tabular">
              ↑↓ Navigasi · Enter Buka
            </span>
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#D8CBB3]/60">
          {results.length === 0 ? (
            <div className="py-12 px-6 text-center space-y-1.5">
              <div className="font-display text-lg font-bold text-[#231C14]">
                Tidak Ada Hasil yang Cocok
              </div>
              <p className="text-xs text-[#695A47]">
                Coba gunakan kata kunci lain atau ubah filter cakupan di atas.
              </p>
            </div>
          ) : (
            results.map((item, idx) => {
              const isSelected = idx === activeIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() => handleActivateItem(item)}
                  className={`w-full text-left px-4 py-3 flex items-start justify-between gap-3 transition-colors cursor-pointer ${
                    isSelected ? 'bg-[#EFE7D6]' : 'hover:bg-[#F6F1E6]'
                  }`}
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-[#9E2A2B] uppercase tracking-wider">
                        {item.badgeText}
                      </span>
                      <span className="text-[#D8CBB3]">•</span>
                      <span className="text-xs text-[#695A47] truncate">
                        {item.subtitle}
                      </span>
                    </div>
                    <div className="font-display text-base font-bold text-[#231C14] truncate">
                      {item.title}
                    </div>
                    {item.matchSnippet && (
                      <p className="text-xs text-[#695A47] line-clamp-1">
                        {item.matchSnippet}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 self-center flex items-center gap-1 text-xs font-semibold text-[#9E2A2B]">
                    <span>Buka</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 2. MULTI-WORLD PROJECT MANAGER & SNAPSHOT SLOTS MODAL
// ============================================================================

interface MultiWorldProjectManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeProject: WorldProject;
  savedWorlds: WorldProject[];
  snapshots: WorldSnapshot[];
  onSwitchWorld: (worldId: string) => void;
  onCreateNewWorld: (meta: {
    worldName: string;
    genre: string;
    tagline: string;
    calendarSystem: string;
  }) => void;
  onDuplicateWorld: (world: WorldProject) => void;
  onDeleteWorld: (worldId: string) => void;
  onRestoreStarterWorld: () => void;
  onTriggerImportJson: () => void;
  onExportWorld: (world: WorldProject) => void;
  onCreateSnapshot: (label: string) => void;
  onRestoreSnapshot: (snapshot: WorldSnapshot) => void;
  onDeleteSnapshot: (snapshotId: string) => void;
}

export const MultiWorldProjectManagerModal: React.FC<
  MultiWorldProjectManagerModalProps
> = ({
  isOpen,
  onClose,
  activeProject,
  savedWorlds,
  snapshots,
  onSwitchWorld,
  onCreateNewWorld,
  onDuplicateWorld,
  onDeleteWorld,
  onRestoreStarterWorld,
  onTriggerImportJson,
  onExportWorld,
  onCreateSnapshot,
  onRestoreSnapshot,
  onDeleteSnapshot,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'worlds' | 'snapshots'>('worlds');
  const [showNewWorldForm, setShowNewWorldForm] = useState(false);
  const [newWorldName, setNewWorldName] = useState('');
  const [newWorldGenre, setNewWorldGenre] = useState('High Fantasy / Epik');
  const [newWorldTagline, setNewWorldTagline] = useState('');
  const [newWorldCalendar, setNewWorldCalendar] = useState('Tahun ke-1 Era Baru');
  const [snapshotLabel, setSnapshotLabel] = useState('');

  if (!isOpen) return null;

  const handleCreateWorldSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorldName.trim()) return;
    onCreateNewWorld({
      worldName: newWorldName.trim(),
      genre: newWorldGenre.trim() || 'Fantasi / Fiksi',
      tagline:
        newWorldTagline.trim() ||
        'Semesta cerita baru yang siap dijelajahi dan dipetakan.',
      calendarSystem: newWorldCalendar.trim() || 'Tahun ke-1 Era Baru',
    });
    setNewWorldName('');
    setNewWorldTagline('');
    setShowNewWorldForm(false);
  };

  const handleSaveSnapshotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const defaultLabel = `Titik Simpan — ${new Date().toLocaleDateString('id-ID')} ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
    onCreateSnapshot(snapshotLabel.trim() || defaultLabel);
    setSnapshotLabel('');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#FBF8F1] border-2 border-[#3B2E1E] rounded-2xl max-w-4xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#F6F1E6] border-b border-[#D8CBB3] flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-[#9E2A2B] flex items-center gap-1.5">
              <FolderKanban className="w-3.5 h-3.5" />
              <span>Manajer Multi-Proyek Semesta & Slot Snapshot</span>
            </div>
            <h3 className="font-display text-2xl font-bold text-[#231C14]">
              Perpustakaan Proyek Dunia & Titik Pemulihan Versi
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg border border-[#D8CBB3] text-[#695A47] hover:text-[#231C14] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sub-Navigation Bar */}
        <div className="px-6 py-3 bg-[#EFE7D6]/70 border-b border-[#D8CBB3] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveSubTab('worlds')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeSubTab === 'worlds'
                  ? 'bg-[#9E2A2B] text-white'
                  : 'bg-[#FBF8F1] text-[#231C14] border border-[#D8CBB3]'
              }`}
            >
              <FolderKanban className="w-3.5 h-3.5" />
              <span>Daftar Proyek Dunia ({savedWorlds.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('snapshots')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeSubTab === 'snapshots'
                  ? 'bg-[#9E2A2B] text-white'
                  : 'bg-[#FBF8F1] text-[#231C14] border border-[#D8CBB3]'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Slot Snapshot Versi ({snapshots.length})</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onTriggerImportJson}
              className="px-3 py-1.5 text-xs font-semibold bg-[#FBF8F1] border border-[#D8CBB3] text-[#231C14] rounded-lg hover:bg-[#EFE7D6] flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-[#9E2A2B]" />
              <span>Impor Dunia (.JSON)</span>
            </button>
            <button
              type="button"
              onClick={onRestoreStarterWorld}
              className="px-3 py-1.5 text-xs font-semibold bg-[#FBF8F1] border border-[#D8CBB3] text-[#231C14] rounded-lg hover:bg-[#EFE7D6] flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#B5832A]" />
              <span>Pulihkan Dunia Contoh Aethelia</span>
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {activeSubTab === 'worlds' && (
            <>
              {/* Top Action Bar for Worlds */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#F6F1E6] p-4 rounded-xl border border-[#D8CBB3]">
                <div>
                  <div className="text-xs font-semibold text-[#231C14]">
                    Kelola Banyak Semesta Cerita Sekaligus
                  </div>
                  <p className="text-xs text-[#695A47]">
                    Semua proyek dunia disimpan otomatis di browser Anda. Anda dapat membuat dunia baru tanpa menghapus dunia yang sedang aktif.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewWorldForm((prev) => !prev)}
                  className="px-4 py-2 text-xs font-semibold bg-[#9E2A2B] text-white rounded-lg hover:bg-[#7E2021] flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showNewWorldForm ? 'Tutup Formulir' : '+ Buat Proyek Dunia Baru'}</span>
                </button>
              </div>

              {/* New World Form */}
              {showNewWorldForm && (
                <form
                  onSubmit={handleCreateWorldSubmit}
                  className="p-5 rounded-xl bg-[#F6F1E6] border-2 border-[#9E2A2B]/40 space-y-4"
                >
                  <div className="font-display text-lg font-bold text-[#231C14]">
                    Inisialisasi Semesta Cerita Baru
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#695A47] mb-1">
                        Nama Dunia / Proyek Novel *
                      </label>
                      <input
                        type="text"
                        required
                        value={newWorldName}
                        onChange={(e) => setNewWorldName(e.target.value)}
                        placeholder="Contoh: Kekaisaran Langit Vermilion"
                        className="w-full px-3 py-2 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#695A47] mb-1">
                        Genre Cerita
                      </label>
                      <input
                        type="text"
                        value={newWorldGenre}
                        onChange={(e) => setNewWorldGenre(e.target.value)}
                        placeholder="Contoh: Dark Fantasy / Steampunk"
                        className="w-full px-3 py-2 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#695A47] mb-1">
                        Sistem Kalender
                      </label>
                      <input
                        type="text"
                        value={newWorldCalendar}
                        onChange={(e) => setNewWorldCalendar(e.target.value)}
                        placeholder="Contoh: Tahun Surya (TS)"
                        className="w-full px-3 py-2 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#695A47] mb-1">
                      Tagline / Premis Utama Dunia
                    </label>
                    <input
                      type="text"
                      value={newWorldTagline}
                      onChange={(e) => setNewWorldTagline(e.target.value)}
                      placeholder="Contoh: Benua terapung yang bertahan hidup di atas badai abu abadi..."
                      className="w-full px-3 py-2 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowNewWorldForm(false)}
                      className="px-3.5 py-2 text-xs font-semibold bg-[#EFE7D6] text-[#231C14] rounded-lg cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-semibold bg-[#9E2A2B] text-white rounded-lg hover:bg-[#7E2021] cursor-pointer"
                    >
                      Buat & Buka Dunia Baru
                    </button>
                  </div>
                </form>
              )}

              {/* Saved Worlds Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedWorlds.map((world) => {
                  const isCurrent = world.id === activeProject.id;
                  return (
                    <div
                      key={world.id}
                      className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-4 ${
                        isCurrent
                          ? 'bg-[#F6F1E6] border-2 border-[#9E2A2B] shadow-xs'
                          : 'bg-[#FBF8F1] border-[#D8CBB3]'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9E2A2B]">
                            {isCurrent ? '● Proyek Sedang Aktif' : world.genre || 'Proyek Tersimpan'}
                          </span>
                          <span className="text-[11px] font-mono-tabular text-[#695A47]">
                            {world.entities.length} Entitas · {world.chapters.length} Bab
                          </span>
                        </div>
                        <h4 className="font-display text-xl font-bold text-[#231C14]">
                          {world.worldName}
                        </h4>
                        <p className="text-xs text-[#695A47] line-clamp-2">
                          {world.tagline}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-[#D8CBB3]/70 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {!isCurrent ? (
                            <button
                              type="button"
                              onClick={() => {
                                onSwitchWorld(world.id);
                                onClose();
                              }}
                              className="px-3 py-1.5 text-xs font-semibold bg-[#9E2A2B] text-white rounded-lg hover:bg-[#7E2021] whitespace-nowrap shrink-0 cursor-pointer"
                            >
                              Buka Dunia Ini
                            </button>
                          ) : (
                            <span className="px-2.5 py-1 text-xs font-semibold bg-[#EFE7D6] text-[#231C14] rounded-lg whitespace-nowrap shrink-0">
                              Sedang Dibuka
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => onDuplicateWorld(world)}
                            className="px-2.5 py-1.5 text-xs font-semibold bg-[#EFE7D6] text-[#231C14] hover:bg-[#D8CBB3] rounded-lg flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
                            title="Gandakan proyek dunia ini"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Duplikasi</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onExportWorld(world)}
                            className="p-1.5 text-xs text-[#695A47] hover:text-[#231C14] border border-[#D8CBB3] rounded-lg cursor-pointer"
                            title="Unduh Berkas JSON"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          {savedWorlds.length > 1 && (
                            <button
                              type="button"
                              onClick={() => onDeleteWorld(world.id)}
                              className="p-1.5 text-xs text-[#9E2A2B] hover:bg-[#9E2A2B]/10 border border-[#D8CBB3] rounded-lg cursor-pointer"
                              title="Hapus proyek dunia ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {activeSubTab === 'snapshots' && (
            <div className="space-y-4">
              {/* Create Snapshot Form */}
              <form
                onSubmit={handleSaveSnapshotSubmit}
                className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-semibold text-[#231C14]">
                      Simpan Titik Versi Baru untuk "{activeProject.worldName}"
                    </div>
                    <p className="text-xs text-[#695A47]">
                      Buat cadangan instan sebelum melakukan perombakan besar pada plot, peta, atau entitas.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={snapshotLabel}
                    onChange={(e) => setSnapshotLabel(e.target.value)}
                    placeholder="Catatan versi (contoh: Sebelum merombak Babak II atau Draf Revisi Faksi)..."
                    className="flex-1 px-3 py-2 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold bg-[#9E2A2B] text-white rounded-lg hover:bg-[#7E2021] flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Archive className="w-3.5 h-3.5" />
                    <span>+ Simpan Snapshot Sekarang</span>
                  </button>
                </div>
              </form>

              {/* Snapshots List */}
              {snapshots.length === 0 ? (
                <div className="py-12 px-6 text-center rounded-xl border border-dashed border-[#D8CBB3] space-y-1.5">
                  <div className="font-display text-lg font-bold text-[#231C14]">
                    Belum Ada Snapshot Versi Tersimpan
                  </div>
                  <p className="text-xs text-[#695A47]">
                    Klik tombol "+ Simpan Snapshot Sekarang" di atas untuk merekam kondisi proyek saat ini sebagai titik pemulihan aman.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {snapshots.map((snap) => (
                    <div
                      key={snap.id}
                      className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] flex flex-wrap items-center justify-between gap-4"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 text-xs text-[#695A47]">
                          <span className="font-semibold text-[#9E2A2B]">
                            {snap.worldName}
                          </span>
                          <span>•</span>
                          <span className="font-mono-tabular">{snap.createdAt}</span>
                          <span>•</span>
                          <span className="font-mono-tabular">
                            {snap.entityCount} Entitas, {snap.chapterCount} Bab
                          </span>
                        </div>
                        <div className="font-display text-lg font-bold text-[#231C14]">
                          {snap.label}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            onRestoreSnapshot(snap);
                            onClose();
                          }}
                          className="px-3 py-1.5 text-xs font-semibold bg-[#231C14] text-[#FBF8F1] hover:bg-[#3B2E1E] rounded-lg flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-[#B5832A]" />
                          <span>Pulihkan Versi Ini</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onExportWorld(snap.projectData)}
                          className="px-2.5 py-1.5 text-xs font-semibold bg-[#FBF8F1] border border-[#D8CBB3] text-[#231C14] hover:bg-[#EFE7D6] rounded-lg flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>.JSON</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteSnapshot(snap.id)}
                          className="p-1.5 text-xs text-[#9E2A2B] hover:bg-[#9E2A2B]/10 border border-[#D8CBB3] rounded-lg cursor-pointer"
                          title="Hapus snapshot"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 3. STUDIO EKSPOR BUKU WORLD BIBLE, NASKAH MARKDOWN & CETAK / PDF
// ============================================================================

interface WorldExportStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: WorldProject;
  onExportJson: () => void;
  onTriggerImportJson: () => void;
  onShowToast: (msg: string) => void;
}

const ORDERED_CATEGORIES: LoreCategory[] = [
  'cosmic_entity',
  'deity',
  'character',
  'race',
  'bestiary',
  'faction',
  'power_system',
  'skill',
  'nation',
  'culture_religion',
  'region',
  'history',
  'encyclopedia',
];

const ATTRIBUTE_LABELS_ID: Record<string, string> = {
  // Character
  role: 'Peran Naratif',
  ageAndStatus: 'Usia & Status Hidup',
  race: 'Ras / Garis Darah',
  faction: 'Afiliasi / Kelompok',
  homeland: 'Tempat Asal',
  powerLevel: 'Tingkat Kekuatan & Skill Utama',
  coreMotivation: 'Motivasi Batin & Tujuan',
  secretOrFlaw: 'Rahasia Tersembunyi / Kelemahan',
  physicalAppearance: 'Ciri Fisik & Penampilan',
  // Cosmic Entity
  cosmicScaleAndExistence: 'Skala Kosmik & Eksistensi',
  primordialOrigin: 'Asal-Usul Primordial / Dimensi',
  cosmicLawsAndManifestation: 'Hukum Alam & Manifestasi Kosmos',
  realityInfluence: 'Pengaruh terhadap Realitas & Takdir',
  // Deity
  pantheonAndThrone: 'Jajaran Pantheon & Takhta Ilahi',
  divineDomains: 'Domain Ilahi',
  sacredSymbolsAndRelics: 'Simbol Suci & Relik Ilahi',
  majorTemplesAndCults: 'Kuil Utama & Ordo Pemujaan',
  blessingsAndCurses: 'Berkah & Kutukan Ilahi',
  // Bestiary
  dangerTier: 'Tingkat Bahaya (Tier)',
  creatureClass: 'Klasifikasi Makhluk',
  naturalHabitat: 'Habitat Alami & Wilayah Sebaran',
  attackPatternsAndAbilities: 'Pola Serangan & Kemampuan',
  anatomicalWeaknesses: 'Kelemahan Anatomi / Elemen',
  harvestableMaterialsAndLoot: 'Material Buruan & Alkimia (Loot/Drop)',
  // Culture & Religion
  practicingPeoples: 'Bangsa / Ras Penganut',
  coreTenetsAndPhilosophy: 'Ajaran Inti & Filosofi Hidup',
  sacredRitualsAndFestivals: 'Ritual Suci & Festival Tahunan',
  socialTaboos: 'Tabu & Pantangan Sosial',
  traditionalAttireAndCuisine: 'Busana Adat, Arsitektur & Kuliner',
  // Race
  lifespan: 'Rentang Usia Rata-Rata',
  traits: 'Ciri Fisik & Biologis',
  homelandRegion: 'Habitat Utama',
  innateAbilities: 'Bakat Bawaan / Kemampuan Alami',
  cultureAndTradition: 'Struktur Sosial & Tradisi',
  // Faction
  factionType: 'Jenis Kelompok / Ordo',
  leader: 'Pemimpin Tertinggi',
  headquarters: 'Markas Utama',
  ideology: 'Ideologi, Sumpah & Doktrin',
  influenceAndResources: 'Sumber Pengaruh & Kekuatan',
  // Nation
  government: 'Bentuk Pemerintahan',
  capital: 'Ibu Kota',
  ruler: 'Penguasa / Kepala Negara',
  economyAndExports: 'Ekonomi & Komoditas Utama',
  militaryStrength: 'Kekuatan Militer & Pertahanan',
  // Region
  parentNation: 'Negara Induk / Kedaulatan',
  climateAndGeography: 'Iklim & Bentang Alam',
  dangerLevel: 'Tingkat Bahaya Wilayah',
  landmarksAndRuins: 'Landmark & Reruntuhan Penting',
  naturalResources: 'Sumber Daya Alam & Magis',
  // Power System
  energySource: 'Sumber Energi',
  activationRequirement: 'Syarat Penguasaan & Penggunaan',
  costAndRisk: 'Harga, Risiko & Efek Samping',
  limitations: 'Batas Mutlak (Hard Limit)',
  // Skill
  parentPowerSystem: 'Induk Power System',
  skillTier: 'Tingkat Kesulitan / Tier',
  manaOrStaminaCost: 'Biaya Energi / Stamina',
  cooldownOrCastTime: 'Waktu Rapal / Jeda',
  primaryEffect: 'Efek Utama & Daya Hancur',
  // History
  eraDate: 'Tahun & Era Kejadian',
  belligerents: 'Pihak / Tokoh yang Terlibat',
  locationOfEvent: 'Lokasi Peristiwa',
  casualtiesAndOutcome: 'Dampak & Hasil Akhir',
  // Encyclopedia
  subCategory: 'Sub-Kategori Ensiklopedia',
  rarityAndOrigin: 'Kelangkaan & Asal-Usul',
  usageAndEffects: 'Kegunaan, Khasiat & Efek',
};

export function buildWorldBibleMarkdown(
  project: WorldProject,
  includeCanonicalSpoilers = true
): string {
  const lines: string[] = [];
  lines.push(`# ${project.worldName}`);
  lines.push(`> *${project.tagline}*`);
  lines.push('');
  lines.push(`- **Genre**: ${project.genre}`);
  lines.push(`- **Sistem Kalender**: ${project.calendarSystem}`);
  if (project.authorName) {
    lines.push(`- **Penulis / Arsitek Dunia**: ${project.authorName}`);
  }
  lines.push('');

  if (project.epigraphQuote) {
    lines.push(`## Epigrafi Semesta`);
    lines.push(`> "${project.epigraphQuote}"`);
    if (project.epigraphSource) {
      lines.push(`> — *${project.epigraphSource}*`);
    }
    lines.push('');
  }

  lines.push(`## I. Kosmologi & Premis Utama`);
  if (project.storyThemes) {
    lines.push(`**Tema Sentral**: ${project.storyThemes}`);
    lines.push('');
  }
  if (project.centralConflict) {
    lines.push(`### Konflik Utama Dunia`);
    lines.push(project.centralConflict);
    lines.push('');
  }
  if (project.cosmologyCreationMyth) {
    lines.push(`### Mitos Penciptaan & Asal-Usul`);
    lines.push(project.cosmologyCreationMyth);
    lines.push('');
  }
  if (project.cosmologyLaws) {
    lines.push(`### Hukum Kosmik & Batas Realitas`);
    lines.push(project.cosmologyLaws);
    lines.push('');
  }

  lines.push(`---`);
  lines.push(
    `## II. Ensiklopedia Entitas World Bible (${project.entities.length} Entri)`
  );
  lines.push('');

  ORDERED_CATEGORIES.forEach((cat) => {
    const catEntities = project.entities.filter((e) => e.category === cat);
    if (catEntities.length === 0) return;
    const meta = CATEGORY_META[cat];
    lines.push(`### Kategori: ${meta.label} (${catEntities.length})`);
    lines.push('');

    catEntities.forEach((ent) => {
      lines.push(`#### ${ent.title}`);
      if (ent.subtitle) {
        lines.push(`*${ent.subtitle}*`);
      }
      lines.push('');
      lines.push(`**Ringkasan Kanon**: ${ent.summary}`);
      lines.push('');

      const attrEntries = Object.entries(ent.attributes || {}).filter(
        ([, val]) => val !== undefined && String(val).trim() !== ''
      );
      if (attrEntries.length > 0) {
        lines.push(`**Atribut & Spesifikasi**:`);
        attrEntries.forEach(([k, v]) => {
          const readableLabel = ATTRIBUTE_LABELS_ID[k] || k;
          lines.push(`- **${readableLabel}**: ${v}`);
        });
        lines.push('');
      }

      if (ent.content) {
        lines.push(ent.content);
        lines.push('');
      }
      lines.push(`---`);
      lines.push('');
    });
  });

  // III. Pohon Silsilah & Dinasti Kerajaan
  const dynasties = project.dynastyTrees || [];
  if (dynasties.length > 0) {
    lines.push(
      `## III. Pohon Silsilah Keluarga & Dinasti Kerajaan (${dynasties.length} Wangsa/Klan)`
    );
    lines.push('');
    dynasties.forEach((tree) => {
      lines.push(`### ${tree.houseName}`);
      if (tree.motto || tree.coatOfArms) {
        lines.push(
          `> *Semboyan*: "${tree.motto}"${tree.coatOfArms ? ` · *Lambang*: ${tree.coatOfArms}` : ''}`
        );
      }
      lines.push(
        `- **Kursi Kekuasaan / Tanah Leluhur**: ${tree.ancestralSeat || '-'} | **Asal Bangsa/Faksi**: ${tree.originNation || '-'}`
      );
      if (tree.overview) {
        lines.push('');
        lines.push(tree.overview);
      }
      lines.push('');

      const generations = Array.from(
        new Set((tree.members || []).map((m) => m.generation))
      ).sort((a, b) => a - b);

      generations.forEach((gen) => {
        lines.push(`#### Generasi ${gen}`);
        const genMembers = (tree.members || []).filter(
          (m) => m.generation === gen
        );
        genMembers.forEach((member) => {
          const parentNames = (member.parentIds || [])
            .map(
              (pid) =>
                tree.members.find((m) => m.id === pid)?.name || pid
            )
            .join(', ');

          lines.push(
            `- **${member.name}** (*${member.titleOrRole}*) — [${member.successionStatus} · ${member.status} · ${member.birthDeathYears}]`
          );
          if (parentNames) {
            lines.push(`  - *Orang Tua*: ${parentNames}`);
          }
          if (member.spouseName) {
            lines.push(`  - *Pasangan*: ${member.spouseName}`);
          }
          if (member.bloodlineTrait) {
            lines.push(`  - *Ciri Garis Darah*: ${member.bloodlineTrait}`);
          }
          if (member.notes) {
            lines.push(`  - *Catatan*: ${member.notes}`);
          }
        });
        lines.push('');
      });
      lines.push(`---`);
      lines.push('');
    });
  }

  // IV. Tracker Misteri, Nubuat & Foreshadowing
  const mysteries = project.mysteryPlots || [];
  if (mysteries.length > 0) {
    lines.push(
      `## IV. Tracker Misteri, Nubuat & Foreshadowing (${mysteries.length} Entri)`
    );
    lines.push('');
    mysteries.forEach((item) => {
      lines.push(`### ${item.title}`);
      lines.push(
        `- **Kategori**: ${item.category} | **Status Pengungkapan**: ${item.status} | **Asal/Sumber**: ${item.originEntityName || '-'}`
      );
      lines.push('');
      if (item.prophecyVerseOrQuestion) {
        lines.push(`**Syair Nubuat / Teka-Teki**:`);
        lines.push(`> *${item.prophecyVerseOrQuestion}*`);
        lines.push('');
      }
      lines.push(`**Tafsir Umum Masyarakat di Dunia**:`);
      lines.push(item.publicInterpretation);
      lines.push('');

      if (includeCanonicalSpoilers && item.trueCanonicalAnswer) {
        lines.push(`**Kebenaran Kanonik Rahasia Penulis (Spoiler)**:`);
        lines.push(item.trueCanonicalAnswer);
        lines.push('');
      }

      if (item.payoffChapterId) {
        const payoffCh = project.chapters.find(
          (c) => c.id === item.payoffChapterId
        );
        if (payoffCh) {
          lines.push(
            `- **Bab Pengungkapan Utama (Payoff)**: Bab ${payoffCh.chapterNumber}: ${payoffCh.title}`
          );
          lines.push('');
        }
      }

      if (item.clues && item.clues.length > 0) {
        lines.push(`**Rantai Petunjuk (Clues) & Pengecoh (Red Herrings)**:`);
        item.clues.forEach((cl, idx) => {
          const chMatch = cl.linkedChapterId
            ? project.chapters.find((c) => c.id === cl.linkedChapterId)
            : undefined;
          const chLabel = chMatch
            ? `Bab ${chMatch.chapterNumber}: ${chMatch.title}`
            : 'Belum ditautkan ke bab';
          lines.push(
            `${idx + 1}. [${cl.revealedStatus}${cl.isRedHerring ? ' · RED HERRING / PENGECOH' : ''}] (${chLabel}) ${cl.clueText}`
          );
        });
        lines.push('');
      }
      lines.push(`---`);
      lines.push('');
    });
  }

  // V. Pita Kronologi Sejarah
  if (project.timeline.length > 0) {
    lines.push(
      `## V. Pita Kronologi Sejarah (${project.timeline.length} Peristiwa)`
    );
    lines.push('');
    const sortedTimeline = [...project.timeline].sort(
      (a, b) => a.year - b.year
    );
    sortedTimeline.forEach((ev) => {
      lines.push(`### [${ev.displayDate}] ${ev.title}`);
      lines.push(
        `- **Era**: ${ev.era} | **Kategori**: ${ev.category || 'Umum'} | **Lokasi**: ${ev.regionName || '-'}`
      );
      lines.push('');
      lines.push(ev.summary);
      if (ev.consequenceImpact) {
        lines.push('');
        lines.push(`**Dampak Jangka Panjang**: ${ev.consequenceImpact}`);
      }
      lines.push('');
    });
  }

  // VI. Jaringan Peta Relasi
  if (project.relationships.length > 0) {
    lines.push(
      `## VI. Jaringan Peta Relasi (${project.relationships.length} Ikatan)`
    );
    lines.push('');
    project.relationships.forEach((rel) => {
      const src =
        project.entities.find((e) => e.id === rel.sourceId)?.title ||
        rel.sourceId;
      const tgt =
        project.entities.find((e) => e.id === rel.targetId)?.title ||
        rel.targetId;
      lines.push(
        `- **${src}** → **${tgt}** (*${rel.label}* | ${rel.type}${rel.visibilityStatus ? ` · ${rel.visibilityStatus}` : ''}): ${rel.notes}`
      );
    });
    lines.push('');
  }

  // VII. Catatan Kanvas Bebas (bila ada)
  const canvasPages = project.freeCanvas?.pages || [];
  if (canvasPages.length > 0) {
    lines.push(
      `## VII. Catatan & Dokumen Kanvas Bebas (${canvasPages.length} Halaman)`
    );
    lines.push('');
    canvasPages.forEach((pg) => {
      lines.push(`### ${pg.title}`);
      if (pg.docContent && pg.docContent.trim()) {
        lines.push(pg.docContent.trim());
        lines.push('');
      }
      if (pg.textBlocks && pg.textBlocks.length > 0) {
        lines.push(`**Kartu Catatan di Halaman Ini**:`);
        pg.textBlocks.forEach((card) => {
          lines.push(`- **${card.title}**: ${card.content}`);
        });
        lines.push('');
      }
    });
  }

  return lines.join('\n');
}

export function buildChaptersManuscriptMarkdown(project: WorldProject): string {
  const lines: string[] = [];
  lines.push(`# Kompilasi Alur Bab & Draf Naskah — ${project.worldName}`);
  lines.push(`> *${project.tagline}*`);
  lines.push('');

  const sortedChapters = [...project.chapters].sort(
    (a, b) => a.chapterNumber - b.chapterNumber
  );

  const totalWords = sortedChapters.reduce(
    (acc, ch) => acc + (ch.currentWordCount || 0),
    0
  );
  const totalTarget = sortedChapters.reduce(
    (acc, ch) => acc + (ch.wordCountTarget || 0),
    0
  );

  lines.push(
    `**Total Bab**: ${sortedChapters.length} Bab | **Progres Kata**: ${totalWords.toLocaleString('id-ID')} / ${totalTarget.toLocaleString('id-ID')} kata`
  );
  lines.push('');
  lines.push(`---`);
  lines.push('');

  sortedChapters.forEach((ch) => {
    lines.push(`## Bab ${ch.chapterNumber}: ${ch.title}`);
    lines.push(
      `*${ch.act} · Status: ${ch.status} · Progres: ${ch.currentWordCount}/${ch.wordCountTarget} kata*`
    );
    lines.push('');

    if (ch.storyDateOrTime || ch.primaryPov || ch.primaryLocation) {
      lines.push(`- **Waktu Cerita**: ${ch.storyDateOrTime || '-'}`);
      lines.push(`- **Tokoh POV Utama**: ${ch.primaryPov || '-'}`);
      lines.push(`- **Lokasi Utama**: ${ch.primaryLocation || '-'}`);
      lines.push('');
    }

    lines.push(`### Sinopsis Bab`);
    lines.push(ch.synopsis);
    lines.push('');

    if (ch.chapterGoal || ch.centralConflict || ch.endingHookOrTwist) {
      lines.push(`### Struktur Dramaturgi Bab`);
      if (ch.chapterGoal) lines.push(`- **Tujuan Bab (Goal)**: ${ch.chapterGoal}`);
      if (ch.centralConflict)
        lines.push(`- **Konflik Utama (Stakes)**: ${ch.centralConflict}`);
      if (ch.endingHookOrTwist)
        lines.push(`- **Cliffhanger / Akhir Bab**: ${ch.endingHookOrTwist}`);
      if (ch.foreshadowingNotes)
        lines.push(`- **Catatan Foreshadowing & Revisi**: ${ch.foreshadowingNotes}`);
      lines.push('');
    }

    if (ch.scenes && ch.scenes.length > 0) {
      lines.push(`### Urutan Adegan (Scene Beats)`);
      ch.scenes.forEach((sc, idx) => {
        lines.push(
          `${idx + 1}. **${sc.title}** (*POV: ${sc.povCharacter} · Lokasi: ${sc.settingRegion}${sc.timeOfDay ? ` · Waktu: ${sc.timeOfDay}` : ''}*)`
        );
        lines.push(`   - Ringkasan: ${sc.summary}`);
        if (sc.sceneGoalOrConflict) {
          lines.push(`   - Tujuan & Konflik: ${sc.sceneGoalOrConflict}`);
        }
        if (sc.sceneOutcome) {
          lines.push(`   - Hasil Akhir: ${sc.sceneOutcome}`);
        }
      });
      lines.push('');
    }

    if (ch.draftNotes) {
      lines.push(`### Draf Naskah & Catatan Adegan`);
      lines.push(ch.draftNotes);
      lines.push('');
    }

    lines.push(`---`);
    lines.push('');
  });

  return lines.join('\n');
}

export const WorldExportStudioModal: React.FC<WorldExportStudioModalProps> = ({
  isOpen,
  onClose,
  project,
  onExportJson,
  onTriggerImportJson,
  onShowToast,
}) => {
  const [exportTab, setExportTab] = useState<
    'markdown_bible' | 'markdown_chapters' | 'print_book' | 'json_backup'
  >('markdown_bible');
  const [copied, setCopied] = useState(false);

  // Print customization options
  const [printIncludeCosmology, setPrintIncludeCosmology] = useState(true);
  const [printIncludeEntities, setPrintIncludeEntities] = useState(true);
  const [printIncludeDynasties, setPrintIncludeDynasties] = useState(true);
  const [printIncludeProphecies, setPrintIncludeProphecies] = useState(true);
  const [printIncludeTimeline, setPrintIncludeTimeline] = useState(true);
  const [printIncludeChapters, setPrintIncludeChapters] = useState(true);
  const [includeCanonicalSpoilers, setIncludeCanonicalSpoilers] =
    useState(true);

  const worldBibleMd = useMemo(
    () => buildWorldBibleMarkdown(project, includeCanonicalSpoilers),
    [project, includeCanonicalSpoilers]
  );
  const chaptersMd = useMemo(
    () => buildChaptersManuscriptMarkdown(project),
    [project]
  );

  if (!isOpen) return null;

  const activeMarkdown =
    exportTab === 'markdown_chapters' ? chaptersMd : worldBibleMd;

  const handleDownloadMarkdown = (content: string, suffix: string) => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const slug = project.worldName.toLowerCase().replace(/\s+/g, '-');
    link.download = `${slug}-${suffix}.md`;
    link.click();
    URL.revokeObjectURL(url);
    onShowToast(`Dokumen Markdown (${suffix}.md) berhasil diunduh.`);
  };

  const handleCopyMarkdown = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      onShowToast('Teks Markdown berhasil disalin ke clipboard.');
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      onShowToast('Gagal menyalin ke clipboard.');
    }
  };

  const handlePrintBook = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4 print:static print:bg-white print:p-0"
      onClick={onClose}
    >
      <div
        className="bg-[#FBF8F1] border-2 border-[#3B2E1E] rounded-2xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden print:max-w-none print:max-h-none print:border-0 print:shadow-none print:bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header (hidden when printing) */}
        <div className="px-6 py-4 bg-[#F6F1E6] border-b border-[#D8CBB3] flex items-start justify-between gap-4 print:hidden">
          <div>
            <div className="text-xs font-semibold text-[#9E2A2B] flex items-center gap-1.5">
              <FileDown className="w-3.5 h-3.5" />
              <span>Studio Ekspor, Dokumentasi & Pencetakan Naskah</span>
            </div>
            <h3 className="font-display text-2xl font-bold text-[#231C14]">
              Ekspor Buku World Bible & Naskah "{project.worldName}"
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg border border-[#D8CBB3] text-[#695A47] hover:text-[#231C14] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Selector Tabs (hidden when printing) */}
        <div className="px-6 py-3 bg-[#EFE7D6]/80 border-b border-[#D8CBB3] flex flex-wrap items-center gap-2 print:hidden">
          <button
            type="button"
            onClick={() => setExportTab('markdown_bible')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              exportTab === 'markdown_bible'
                ? 'bg-[#9E2A2B] text-white'
                : 'bg-[#FBF8F1] text-[#231C14] border border-[#D8CBB3]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Buku World Bible (.MD)</span>
          </button>
          <button
            type="button"
            onClick={() => setExportTab('markdown_chapters')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              exportTab === 'markdown_chapters'
                ? 'bg-[#9E2A2B] text-white'
                : 'bg-[#FBF8F1] text-[#231C14] border border-[#D8CBB3]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Naskah Alur Bab (.MD)</span>
          </button>
          <button
            type="button"
            onClick={() => setExportTab('print_book')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              exportTab === 'print_book'
                ? 'bg-[#9E2A2B] text-white'
                : 'bg-[#FBF8F1] text-[#231C14] border border-[#D8CBB3]'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Lembar Cetak / Simpan PDF</span>
          </button>
          <button
            type="button"
            onClick={() => setExportTab('json_backup')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              exportTab === 'json_backup'
                ? 'bg-[#9E2A2B] text-white'
                : 'bg-[#FBF8F1] text-[#231C14] border border-[#D8CBB3]'
            }`}
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>Cadangan Proyek (.JSON)</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 print:p-0 print:overflow-visible">
          {(exportTab === 'markdown_bible' ||
            exportTab === 'markdown_chapters') && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-[#231C14]">
                    {exportTab === 'markdown_bible'
                      ? 'Kompilasi Ensiklopedia World Bible Lengkap (13 Kategori Entitas + Silsilah Dinasti + Tracker Nubuat + Kanvas)'
                      : 'Kompilasi Kerangka Bab, Urutan Adegan & Draf Naskah (Format Markdown .md)'}
                  </div>
                  <p className="text-xs text-[#695A47]">
                    Siap dibuka langsung di Obsidian, Notion, Scrivener, Google Docs, atau editor teks favorit Anda.
                  </p>
                  {exportTab === 'markdown_bible' && (
                    <label className="inline-flex items-center gap-2 pt-1 text-xs font-medium text-[#231C14] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeCanonicalSpoilers}
                        onChange={(e) =>
                          setIncludeCanonicalSpoilers(e.target.checked)
                        }
                        className="accent-[#9E2A2B]"
                      />
                      <span>
                        Sertakan Kebenaran Kanonik Rahasia Penulis (Spoiler Tracker Nubuat)
                      </span>
                    </label>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyMarkdown(activeMarkdown)}
                    className="px-3.5 py-2 text-xs font-semibold bg-[#FBF8F1] border border-[#D8CBB3] text-[#231C14] rounded-lg hover:bg-[#EFE7D6] flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-[#2D5A43]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-[#9E2A2B]" />
                    )}
                    <span>{copied ? 'Tersalin!' : 'Salin Teks .MD'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleDownloadMarkdown(
                        activeMarkdown,
                        exportTab === 'markdown_bible'
                          ? 'world-bible-ensiklopedia'
                          : 'alur-bab-dan-naskah'
                      )
                    }
                    className="px-4 py-2 text-xs font-semibold bg-[#9E2A2B] text-white rounded-lg hover:bg-[#7E2021] flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh Berkas .MD</span>
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-[#D8CBB3] bg-[#231C14] text-[#FBF8F1] p-4 font-mono text-xs overflow-x-auto max-h-[52vh] whitespace-pre-wrap leading-relaxed">
                {activeMarkdown}
              </div>
            </div>
          )}

          {exportTab === 'print_book' && (
            <div className="space-y-5">
              {/* Print Controls (hidden when printing) */}
              <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-3 print:hidden">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-[#231C14]">
                      Konfigurasi Lembar Cetak / Simpan sebagai PDF
                    </div>
                    <p className="text-xs text-[#695A47]">
                      Pilih bagian buku yang ingin disertakan, lalu klik tombol Cetak / Simpan PDF untuk membuka dialog cetak browser.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handlePrintBook}
                    className="px-4 py-2 text-xs font-semibold bg-[#9E2A2B] text-white rounded-lg hover:bg-[#7E2021] flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak / Simpan PDF Sekarang</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-[#D8CBB3]/70 text-xs text-[#231C14]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={printIncludeCosmology}
                      onChange={(e) => setPrintIncludeCosmology(e.target.checked)}
                      className="accent-[#9E2A2B]"
                    />
                    <span>Sampul & Kosmologi Dunia</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={printIncludeEntities}
                      onChange={(e) => setPrintIncludeEntities(e.target.checked)}
                      className="accent-[#9E2A2B]"
                    />
                    <span>Ensiklopedia 13 Kategori ({project.entities.length})</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={printIncludeDynasties}
                      onChange={(e) => setPrintIncludeDynasties(e.target.checked)}
                      className="accent-[#9E2A2B]"
                    />
                    <span>
                      Silsilah Dinasti ({(project.dynastyTrees || []).length})
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={printIncludeProphecies}
                      onChange={(e) =>
                        setPrintIncludeProphecies(e.target.checked)
                      }
                      className="accent-[#9E2A2B]"
                    />
                    <span>
                      Tracker Nubuat & Misteri ({(project.mysteryPlots || []).length})
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={printIncludeTimeline}
                      onChange={(e) => setPrintIncludeTimeline(e.target.checked)}
                      className="accent-[#9E2A2B]"
                    />
                    <span>Kronologi Sejarah ({project.timeline.length})</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={printIncludeChapters}
                      onChange={(e) => setPrintIncludeChapters(e.target.checked)}
                      className="accent-[#9E2A2B]"
                    />
                    <span>Alur Bab & Naskah ({project.chapters.length})</span>
                  </label>
                </div>
              </div>

              {/* Printable Book Preview Sheet */}
              <div className="p-8 rounded-2xl bg-white border border-[#D8CBB3] text-[#231C14] space-y-8 shadow-xs print:border-0 print:shadow-none print:p-0">
                {/* Book Title Page */}
                <div className="text-center border-b-2 border-[#231C14] pb-6 space-y-2">
                  <div className="text-xs font-semibold uppercase tracking-widest text-[#9E2A2B]">
                    Kodeks Ensiklopedia & Arsitektur Cerita
                  </div>
                  <h1 className="font-cartography text-4xl font-bold text-[#231C14]">
                    {project.worldName}
                  </h1>
                  <p className="font-serif italic text-base text-[#695A47]">
                    {project.tagline}
                  </p>
                  <div className="pt-2 text-xs text-[#695A47] font-mono-tabular">
                    Genre: {project.genre} · Kalender: {project.calendarSystem}
                    {project.authorName ? ` · Karya: ${project.authorName}` : ''}
                  </div>
                </div>

                {/* Section 1: Cosmology */}
                {printIncludeCosmology && (
                  <section className="space-y-4">
                    <h2 className="font-display text-2xl font-bold text-[#231C14] border-b border-[#D8CBB3] pb-1.5">
                      I. Kosmologi, Epigrafi & Konflik Utama
                    </h2>
                    {project.epigraphQuote && (
                      <blockquote className="p-4 rounded-xl bg-[#F6F1E6] italic text-sm text-[#231C14]">
                        "{project.epigraphQuote}"
                        {project.epigraphSource && (
                          <footer className="not-italic font-semibold text-xs text-[#9E2A2B] mt-1">
                            — {project.epigraphSource}
                          </footer>
                        )}
                      </blockquote>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
                      {project.centralConflict && (
                        <div className="p-4 rounded-xl border border-[#D8CBB3] space-y-1">
                          <div className="font-bold text-[#9E2A2B]">Konflik Sentral Dunia</div>
                          <div>
                            <WikiTextRenderer
                              text={project.centralConflict}
                              entities={project.entities}
                              onSelectEntity={() => {}}
                            />
                          </div>
                        </div>
                      )}
                      {project.cosmologyCreationMyth && (
                        <div className="p-4 rounded-xl border border-[#D8CBB3] space-y-1">
                          <div className="font-bold text-[#9E2A2B]">Mitos Penciptaan</div>
                          <div>
                            <WikiTextRenderer
                              text={project.cosmologyCreationMyth}
                              entities={project.entities}
                              onSelectEntity={() => {}}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </section>
                )}

                {/* Section 2: Entities */}
                {printIncludeEntities && (
                  <section className="space-y-6">
                    <h2 className="font-display text-2xl font-bold text-[#231C14] border-b border-[#D8CBB3] pb-1.5">
                      II. Ensiklopedia Entitas World Bible ({project.entities.length})
                    </h2>
                    {ORDERED_CATEGORIES.map((cat) => {
                      const items = project.entities.filter(
                        (e) => e.category === cat
                      );
                      if (items.length === 0) return null;
                      return (
                        <div key={cat} className="space-y-3">
                          <h3 className="font-display text-lg font-bold text-[#9E2A2B]">
                            {CATEGORY_META[cat].label} ({items.length})
                          </h3>
                          <div className="grid grid-cols-1 gap-3">
                            {items.map((ent) => {
                              const attrEntries = Object.entries(
                                ent.attributes || {}
                              ).filter(
                                ([, val]) =>
                                  val !== undefined && String(val).trim() !== ''
                              );
                              return (
                                <div
                                  key={ent.id}
                                  className="p-4 rounded-xl border border-[#D8CBB3] space-y-2 break-inside-avoid"
                                >
                                  <div>
                                    <div className="font-display text-lg font-bold text-[#231C14]">
                                      {ent.title}
                                    </div>
                                    {ent.subtitle && (
                                      <div className="text-xs italic text-[#695A47]">
                                        {ent.subtitle}
                                      </div>
                                    )}
                                  </div>
                                  <p className="text-xs font-medium text-[#231C14]">
                                    {ent.summary}
                                  </p>
                                  {attrEntries.length > 0 && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 pb-1 text-[11px] bg-[#F6F1E6]/60 p-2.5 rounded-lg border border-[#D8CBB3]/70">
                                      {attrEntries.map(([k, v]) => (
                                        <div key={k}>
                                          <span className="font-bold text-[#695A47]">
                                            {ATTRIBUTE_LABELS_ID[k] || k}:{' '}
                                          </span>
                                          <span className="text-[#231C14]">
                                            {String(v)}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  <div className="text-xs text-[#231C14]/90 leading-relaxed">
                                    <WikiTextRenderer
                                      text={ent.content}
                                      entities={project.entities}
                                      onSelectEntity={() => {}}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </section>
                )}

                {/* Section 3: Dynasty Trees */}
                {printIncludeDynasties &&
                  (project.dynastyTrees || []).length > 0 && (
                    <section className="space-y-4">
                      <h2 className="font-display text-2xl font-bold text-[#231C14] border-b border-[#D8CBB3] pb-1.5">
                        III. Pohon Silsilah Keluarga & Dinasti Kerajaan (
                        {(project.dynastyTrees || []).length})
                      </h2>
                      <div className="space-y-4">
                        {(project.dynastyTrees || []).map((tree) => (
                          <div
                            key={tree.id}
                            className="p-4 rounded-xl border border-[#D8CBB3] space-y-2.5 break-inside-avoid"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <h3 className="font-display text-xl font-bold text-[#231C14]">
                                  {tree.houseName}
                                </h3>
                                <div className="text-xs italic text-[#9E2A2B]">
                                  {tree.motto}
                                  {tree.coatOfArms ? ` · ${tree.coatOfArms}` : ''}
                                </div>
                              </div>
                              <div className="text-xs text-[#695A47]">
                                Kursi Kekuasaan: {tree.ancestralSeat || '-'}
                              </div>
                            </div>
                            <p className="text-xs text-[#231C14]">
                              {tree.overview}
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                              {(tree.members || []).map((m) => (
                                <div
                                  key={m.id}
                                  className="p-2.5 rounded-lg bg-[#F6F1E6]/70 border border-[#D8CBB3] text-xs space-y-0.5"
                                >
                                  <div className="font-bold text-[#231C14]">
                                    Gen {m.generation} · {m.name}
                                  </div>
                                  <div className="text-[11px] text-[#9E2A2B] font-medium">
                                    {m.titleOrRole} ({m.successionStatus} ·{' '}
                                    {m.status})
                                  </div>
                                  <div className="text-[11px] text-[#695A47]">
                                    {m.notes}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                {/* Section 4: Prophecy & Mystery Tracker */}
                {printIncludeProphecies &&
                  (project.mysteryPlots || []).length > 0 && (
                    <section className="space-y-4">
                      <h2 className="font-display text-2xl font-bold text-[#231C14] border-b border-[#D8CBB3] pb-1.5">
                        IV. Tracker Misteri, Nubuat & Foreshadowing (
                        {(project.mysteryPlots || []).length})
                      </h2>
                      <div className="space-y-4">
                        {(project.mysteryPlots || []).map((item) => (
                          <div
                            key={item.id}
                            className="p-4 rounded-xl border border-[#D8CBB3] space-y-2 break-inside-avoid"
                          >
                            <div className="flex items-center justify-between text-xs text-[#695A47]">
                              <span className="font-bold text-[#9E2A2B]">
                                {item.category} · Status: {item.status}
                              </span>
                              <span>Sumber: {item.originEntityName || '-'}</span>
                            </div>
                            <h3 className="font-display text-lg font-bold text-[#231C14]">
                              {item.title}
                            </h3>
                            {item.prophecyVerseOrQuestion && (
                              <blockquote className="p-3 rounded-lg bg-[#F6F1E6] italic text-xs text-[#231C14]">
                                "{item.prophecyVerseOrQuestion}"
                              </blockquote>
                            )}
                            <div className="text-xs space-y-1">
                              <div>
                                <span className="font-bold text-[#695A47]">
                                  Tafsir Umum Masyarakat:{' '}
                                </span>
                                <span className="text-[#231C14]">
                                  {item.publicInterpretation}
                                </span>
                              </div>
                              {includeCanonicalSpoilers &&
                                item.trueCanonicalAnswer && (
                                  <div>
                                    <span className="font-bold text-[#9E2A2B]">
                                      Kebenaran Kanonik Rahasia:{' '}
                                    </span>
                                    <span className="text-[#231C14]">
                                      {item.trueCanonicalAnswer}
                                    </span>
                                  </div>
                                )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                {/* Section 5: Timeline */}
                {printIncludeTimeline && project.timeline.length > 0 && (
                  <section className="space-y-4">
                    <h2 className="font-display text-2xl font-bold text-[#231C14] border-b border-[#D8CBB3] pb-1.5">
                      V. Pita Kronologi Sejarah ({project.timeline.length})
                    </h2>
                    <div className="space-y-2.5">
                      {[...project.timeline]
                        .sort((a, b) => a.year - b.year)
                        .map((ev) => (
                          <div
                            key={ev.id}
                            className="p-3.5 rounded-xl border border-[#D8CBB3] space-y-1 break-inside-avoid"
                          >
                            <div className="flex items-center justify-between text-xs text-[#695A47]">
                              <span className="font-bold text-[#9E2A2B]">
                                {ev.displayDate} — {ev.title}
                              </span>
                              <span>{ev.era}</span>
                            </div>
                            <p className="text-xs text-[#231C14]">{ev.summary}</p>
                          </div>
                        ))}
                    </div>
                  </section>
                )}

                {/* Section 6: Chapters */}
                {printIncludeChapters && project.chapters.length > 0 && (
                  <section className="space-y-4">
                    <h2 className="font-display text-2xl font-bold text-[#231C14] border-b border-[#D8CBB3] pb-1.5">
                      VI. Alur Bab & Draf Naskah ({project.chapters.length} Bab)
                    </h2>
                    <div className="space-y-4">
                      {[...project.chapters]
                        .sort((a, b) => a.chapterNumber - b.chapterNumber)
                        .map((ch) => (
                          <div
                            key={ch.id}
                            className="p-4 rounded-xl border border-[#D8CBB3] space-y-2 break-inside-avoid"
                          >
                            <div className="flex items-center justify-between text-xs text-[#695A47]">
                              <span className="font-semibold text-[#9E2A2B]">
                                {ch.act} · Status: {ch.status}
                              </span>
                              <span className="font-mono-tabular">
                                {ch.currentWordCount}/{ch.wordCountTarget} kata
                              </span>
                            </div>
                            <h3 className="font-display text-xl font-bold text-[#231C14]">
                              Bab {ch.chapterNumber}: {ch.title}
                            </h3>
                            <p className="text-xs font-medium text-[#231C14]">
                              {ch.synopsis}
                            </p>
                            {ch.draftNotes && (
                              <div className="pt-2 border-t border-[#D8CBB3]/60 text-xs text-[#231C14]/90 leading-relaxed">
                                <WikiTextRenderer
                                  text={ch.draftNotes}
                                  entities={project.entities}
                                  onSelectEntity={() => {}}
                                />
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </section>
                )}
              </div>
            </div>
          )}

          {exportTab === 'json_backup' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-3 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-[#9E2A2B]">
                    Cadangan Data Mentah Utuh (.JSON)
                  </div>
                  <h4 className="font-display text-xl font-bold text-[#231C14]">
                    Unduh Berkas JSON World Bible
                  </h4>
                  <p className="text-xs text-[#695A47] leading-relaxed">
                    Menyimpan seluruh entitas, atribut, grid kanvas peta dunia, pin kartografi, koordinat grafik relasi, linimasa, dan adegan bab dalam satu berkas JSON yang dapat diimpor kembali kapan saja.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onExportJson}
                  className="px-4 py-2.5 text-xs font-semibold bg-[#9E2A2B] text-white rounded-lg hover:bg-[#7E2021] flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh {project.worldName}.json</span>
                </button>
              </div>

              <div className="p-5 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-3 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-[#2D5A43]">
                    Pemulihan & Impor Proyek (.JSON)
                  </div>
                  <h4 className="font-display text-xl font-bold text-[#231C14]">
                    Muat Berkas JSON dari Komputer
                  </h4>
                  <p className="text-xs text-[#695A47] leading-relaxed">
                    Impor berkas cadangan JSON World Bible dari perangkat Anda. Proyek yang diimpor akan otomatis ditambahkan ke Perpustakaan Multi-Proyek tanpa menghapus dunia Anda yang lain.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onTriggerImportJson}
                  className="px-4 py-2.5 text-xs font-semibold bg-[#231C14] text-[#FBF8F1] rounded-lg hover:bg-[#3B2E1E] flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-[#B5832A]" />
                  <span>Pilih Berkas .JSON untuk Diimpor</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 4. INSPEKTUR KESEHATAN & KELENGKAPAN LORE (Lore Health & Orphan Inspector)
// ============================================================================

export interface UncreatedMentionItem {
  name: string;
  sources: string[];
}

export interface WorldHealthMetrics {
  healthScore: number;
  uncreatedMentions: UncreatedMentionItem[];
  relationshipOrphans: LoreEntity[];
  unfeaturedEntities: LoreEntity[];
  unmappedLocations: LoreEntity[];
}

export function computeWorldHealthMetrics(
  project: WorldProject
): WorldHealthMetrics {
  const entities = project.entities || [];
  const relationships = project.relationships || [];
  const chapters = project.chapters || [];
  const stamps = project.mapData?.stamps || [];

  const doesEntityExist = (rawName: string): boolean => {
    const lower = rawName.trim().toLowerCase();
    if (!lower) return true;
    return entities.some(
      (e) =>
        e.title.toLowerCase() === lower ||
        e.title.toLowerCase().includes(lower) ||
        lower.includes(e.title.toLowerCase())
    );
  };

  // 1. Scan for [[...]] mentions that don't have a matching entity yet
  const mentionMap = new Map<string, { display: string; sources: Set<string> }>();
  const scanTextForBrackets = (text: string | undefined, sourceLabel: string) => {
    if (!text) return;
    const regex = /\[\[([^\]]+)\]\]/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      const refName = match[1].trim();
      if (!refName) continue;
      if (!doesEntityExist(refName)) {
        const key = refName.toLowerCase();
        const existing = mentionMap.get(key);
        if (existing) {
          existing.sources.add(sourceLabel);
        } else {
          mentionMap.set(key, {
            display: refName,
            sources: new Set([sourceLabel]),
          });
        }
      }
    }
  };

  scanTextForBrackets(project.centralConflict, 'Overview: Konflik Pusat');
  scanTextForBrackets(project.cosmologyCreationMyth, 'Overview: Mitos Penciptaan');
  scanTextForBrackets(project.cosmologyLaws, 'Overview: Hukum Kosmik');

  entities.forEach((ent) => {
    const label = `${CATEGORY_META[ent.category].singular}: ${ent.title}`;
    scanTextForBrackets(ent.summary, label);
    scanTextForBrackets(ent.content, label);
  });

  chapters.forEach((ch) => {
    const label = `Bab ${ch.chapterNumber}: ${ch.title}`;
    scanTextForBrackets(ch.synopsis, label);
    scanTextForBrackets(ch.draftNotes, label);
    scanTextForBrackets(ch.chapterGoal, label);
    scanTextForBrackets(ch.centralConflict, label);
    scanTextForBrackets(ch.endingHookOrTwist, label);
    scanTextForBrackets(ch.foreshadowingNotes, label);
    (ch.scenes || []).forEach((sc) => {
      scanTextForBrackets(sc.summary, `${label} (Adegan: ${sc.title})`);
      scanTextForBrackets(
        sc.sceneGoalOrConflict,
        `${label} (Adegan: ${sc.title})`
      );
      scanTextForBrackets(sc.sceneOutcome, `${label} (Adegan: ${sc.title})`);
    });
  });

  const uncreatedMentions: UncreatedMentionItem[] = Array.from(
    mentionMap.values()
  ).map((v) => ({
    name: v.display,
    sources: Array.from(v.sources),
  }));

  // 2. Relationship Orphans (Characters, Factions, Nations with 0 edges)
  const connectedIds = new Set<string>();
  relationships.forEach((r) => {
    connectedIds.add(r.sourceId);
    connectedIds.add(r.targetId);
  });
  const socialEntities = entities.filter((e) =>
    ['character', 'faction', 'nation'].includes(e.category)
  );
  const relationshipOrphans = socialEntities.filter(
    (e) => !connectedIds.has(e.id)
  );

  // 3. Unfeatured in Chapters (Entities never linked or mentioned in any chapter)
  const allChaptersCorpus = chapters
    .map(
      (c) =>
        `${c.synopsis} ${c.draftNotes} ${c.primaryPov || ''} ${
          c.primaryLocation || ''
        } ${c.chapterGoal || ''} ${c.centralConflict || ''} ${
          c.endingHookOrTwist || ''
        } ${(c.scenes || [])
          .map((s) => `${s.title} ${s.povCharacter} ${s.settingRegion} ${s.summary}`)
          .join(' ')}`
    )
    .join(' ')
    .toLowerCase();

  const featuredIdsSet = new Set<string>(
    chapters.flatMap((c) => c.featuredEntityIds || [])
  );

  const unfeaturedEntities = entities.filter((e) => {
    if (featuredIdsSet.has(e.id)) return false;
    if (allChaptersCorpus.includes(e.title.toLowerCase())) return false;
    return true;
  });

  // 4. Unmapped Locations (Regions & Nations without a map pin)
  const geoEntities = entities.filter(
    (e) => e.category === 'region' || e.category === 'nation'
  );
  const unmappedLocations = geoEntities.filter((loc) => {
    const locLower = loc.title.toLowerCase();
    return !stamps.some(
      (st) =>
        st.linkedEntityId === loc.id ||
        st.label.toLowerCase().includes(locLower) ||
        locLower.includes(st.label.toLowerCase())
    );
  });

  // Calculate overall World Health Score (0..100)
  const redlinkPenalty = Math.min(25, uncreatedMentions.length * 5);
  const orphanRatio =
    socialEntities.length > 0
      ? relationshipOrphans.length / socialEntities.length
      : 0;
  const unfeaturedRatio =
    entities.length > 0 ? unfeaturedEntities.length / entities.length : 0;
  const unmappedRatio =
    geoEntities.length > 0 ? unmappedLocations.length / geoEntities.length : 0;

  const rawScore =
    100 -
    redlinkPenalty -
    Math.round(orphanRatio * 25) -
    Math.round(unfeaturedRatio * 25) -
    Math.round(unmappedRatio * 25);

  const healthScore = Math.max(15, Math.min(100, rawScore));

  return {
    healthScore,
    uncreatedMentions,
    relationshipOrphans,
    unfeaturedEntities,
    unmappedLocations,
  };
}

interface LoreHealthInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: WorldProject;
  onSelectEntity: (entityId: string) => void;
  onOpenGraphTab: () => void;
  onOpenOutlinerTab: () => void;
  onQuickCreateEntity: (
    title: string,
    category: LoreCategory,
    openAfterCreate?: boolean
  ) => void;
  onAutoPinLocationOnMap: (entity: LoreEntity) => void;
}

export const LoreHealthInspectorModal: React.FC<
  LoreHealthInspectorModalProps
> = ({
  isOpen,
  onClose,
  project,
  onSelectEntity,
  onOpenGraphTab,
  onOpenOutlinerTab,
  onQuickCreateEntity,
  onAutoPinLocationOnMap,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'redlinks' | 'orphans' | 'unfeatured' | 'unmapped'
  >('redlinks');
  const [categorySelections, setCategorySelections] = useState<
    Record<string, LoreCategory>
  >({});

  const metrics = useMemo(() => computeWorldHealthMetrics(project), [project]);

  if (!isOpen) return null;

  const getSelectedCategory = (name: string): LoreCategory =>
    categorySelections[name] || 'character';

  return (
    <div
      className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#FBF8F1] border-2 border-[#3B2E1E] rounded-2xl max-w-4xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#F6F1E6] border-b border-[#D8CBB3] flex items-start justify-between gap-4">
          <div>
            <div className="font-epic text-xs font-bold uppercase tracking-wider text-[#9E2A2B] flex items-center gap-1.5">
              <span>❖ Diagnostik Ketersambungan World Bible</span>
            </div>
            <h3 className="font-cartography text-2xl font-bold text-[#231C14]">
              Inspektur Kesehatan & Kelengkapan Lore — {project.worldName}
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-[#EFE7D6] border border-[#B5832A]/60 text-right">
              <div className="text-[10px] font-epic uppercase tracking-wider text-[#695A47]">
                Skor Kohesi Dunia
              </div>
              <div className="font-mono-tabular text-base font-bold text-[#9E2A2B]">
                {metrics.healthScore}%
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg border border-[#D8CBB3] text-[#695A47] hover:text-[#231C14] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 Diagnostic Category Tabs */}
        <div className="px-6 py-3 bg-[#EFE7D6]/80 border-b border-[#D8CBB3] flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('redlinks')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeSubTab === 'redlinks'
                ? 'bg-[#9E2A2B] text-white'
                : 'bg-[#FBF8F1] text-[#231C14] border border-[#D8CBB3]'
            }`}
          >
            <span>Tautan [[...]] Kosong</span>
            <span className="font-mono-tabular px-1.5 py-0.2 rounded bg-black/15 text-[11px]">
              {metrics.uncreatedMentions.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('orphans')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeSubTab === 'orphans'
                ? 'bg-[#9E2A2B] text-white'
                : 'bg-[#FBF8F1] text-[#231C14] border border-[#D8CBB3]'
            }`}
          >
            <span>Entitas Yatim Relasi</span>
            <span className="font-mono-tabular px-1.5 py-0.2 rounded bg-black/15 text-[11px]">
              {metrics.relationshipOrphans.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('unfeatured')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeSubTab === 'unfeatured'
                ? 'bg-[#9E2A2B] text-white'
                : 'bg-[#FBF8F1] text-[#231C14] border border-[#D8CBB3]'
            }`}
          >
            <span>Belum Muncul di Alur Bab</span>
            <span className="font-mono-tabular px-1.5 py-0.2 rounded bg-black/15 text-[11px]">
              {metrics.unfeaturedEntities.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('unmapped')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeSubTab === 'unmapped'
                ? 'bg-[#9E2A2B] text-white'
                : 'bg-[#FBF8F1] text-[#231C14] border border-[#D8CBB3]'
            }`}
          >
            <span>Lokasi Tanpa Pin Peta</span>
            <span className="font-mono-tabular px-1.5 py-0.2 rounded bg-black/15 text-[11px]">
              {metrics.unmappedLocations.length}
            </span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeSubTab === 'redlinks' && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-[#231C14]">
                    Deteksi Tautan Kurung Ganda `[[Nama Entitas]]` yang Belum Dibuat
                  </div>
                  <p className="text-xs text-[#695A47]">
                    Daftar nama di bawah ini sudah Anda tulis di dalam naskah bab atau artikel lore dengan tanda `[[...]]`, namun belum memiliki halaman entitas di World Bible.
                  </p>
                </div>
              </div>

              {metrics.uncreatedMentions.length === 0 ? (
                <div className="py-10 px-6 text-center rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-1">
                  <div className="font-display text-lg font-bold text-[#2D5A43]">
                    ✓ Semua Tautan `[[...]]` Sudah Memiliki Halaman Kodeks!
                  </div>
                  <p className="text-xs text-[#695A47]">
                    Tidak ada tautan kurung ganda yang menggantung di naskah maupun artikel lore Anda.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {metrics.uncreatedMentions.map((item) => {
                    const cat = getSelectedCategory(item.name);
                    return (
                      <div
                        key={item.name}
                        className="p-4 rounded-xl bg-[#F6F1E6] border border-[#B5832A]/50 flex flex-wrap items-center justify-between gap-3"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="font-display text-lg font-bold text-[#9E2A2B]">
                            [[{item.name}]]
                          </div>
                          <div className="text-xs text-[#695A47]">
                            Disebut pada:{' '}
                            <span className="font-semibold text-[#231C14]">
                              {item.sources.join(' · ')}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <select
                            value={cat}
                            onChange={(e) =>
                              setCategorySelections((prev) => ({
                                ...prev,
                                [item.name]: e.target.value as LoreCategory,
                              }))
                            }
                            className="px-2.5 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg text-[#231C14] font-semibold"
                          >
                            {ORDERED_CATEGORIES.map((c) => (
                              <option key={c} value={c}>
                                {CATEGORY_META[c].singular}
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            onClick={() =>
                              onQuickCreateEntity(item.name, cat, false)
                            }
                            className="px-3 py-1.5 text-xs font-semibold bg-[#9E2A2B] text-white rounded-lg hover:bg-[#7E2021] whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            + Buat Entitas
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onQuickCreateEntity(item.name, cat, true);
                              onClose();
                            }}
                            className="px-3 py-1.5 text-xs font-semibold bg-[#231C14] text-[#FBF8F1] rounded-lg hover:bg-[#3A2E21] whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            Buat & Buka ↗
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeSubTab === 'orphans' && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-[#231C14]">
                    Karakter, Kelompok & Negara yang Belum Memiliki Ikatan di Peta Relasi
                  </div>
                  <p className="text-xs text-[#695A47]">
                    Menghubungkan tokoh dan faksi di Peta Relasi akan memperkaya dinamika konflik politik maupun personal dalam cerita.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onOpenGraphTab();
                    onClose();
                  }}
                  className="px-3.5 py-1.5 text-xs font-semibold bg-[#231C14] text-[#FBF8F1] rounded-lg hover:bg-[#3A2E21] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Buka Peta Relasi →
                </button>
              </div>

              {metrics.relationshipOrphans.length === 0 ? (
                <div className="py-10 px-6 text-center rounded-xl bg-[#F6F1E6] border border-[#D8CBB3]">
                  <div className="font-display text-lg font-bold text-[#2D5A43]">
                    ✓ Seluruh Tokoh, Kelompok & Negara Sudah Terhubung di Peta Relasi!
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {metrics.relationshipOrphans.map((ent) => (
                    <div
                      key={ent.id}
                      className="p-3.5 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="text-[11px] font-epic font-semibold text-[#9E2A2B]">
                          {CATEGORY_META[ent.category].singular}
                        </div>
                        <div className="font-display text-base font-bold text-[#231C14] truncate">
                          {ent.title}
                        </div>
                        <div className="text-xs text-[#695A47] truncate">
                          {ent.subtitle}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectEntity(ent.id);
                          onClose();
                        }}
                        className="px-3 py-1.5 text-xs font-semibold bg-[#EFE7D6] hover:bg-[#D8CBB3] text-[#231C14] rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        Buka Profil ↗
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSubTab === 'unfeatured' && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-[#231C14]">
                    Entitas World Bible yang Belum Pernah Muncul di Alur Bab
                  </div>
                  <p className="text-xs text-[#695A47]">
                    Entitas berikut sudah Anda rancang di World Bible tetapi belum disebut atau ditautkan pada bab cerita mana pun.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onOpenOutlinerTab();
                    onClose();
                  }}
                  className="px-3.5 py-1.5 text-xs font-semibold bg-[#231C14] text-[#FBF8F1] rounded-lg hover:bg-[#3A2E21] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Buka Alur Bab →
                </button>
              </div>

              {metrics.unfeaturedEntities.length === 0 ? (
                <div className="py-10 px-6 text-center rounded-xl bg-[#F6F1E6] border border-[#D8CBB3]">
                  <div className="font-display text-lg font-bold text-[#2D5A43]">
                    ✓ Seluruh Entitas World Bible Sudah Terintegrasi ke dalam Alur Bab!
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {metrics.unfeaturedEntities.map((ent) => (
                    <div
                      key={ent.id}
                      className="p-3.5 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="text-[11px] font-epic font-semibold text-[#B5832A]">
                          {CATEGORY_META[ent.category].singular}
                        </div>
                        <div className="font-display text-base font-bold text-[#231C14] truncate">
                          {ent.title}
                        </div>
                        <div className="text-xs text-[#695A47] truncate">
                          {ent.summary}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectEntity(ent.id);
                          onClose();
                        }}
                        className="px-3 py-1.5 text-xs font-semibold bg-[#EFE7D6] hover:bg-[#D8CBB3] text-[#231C14] rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        Lihat Entri ↗
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSubTab === 'unmapped' && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3]">
                <div className="text-xs font-semibold text-[#231C14]">
                  Entitas Wilayah & Negara yang Belum Memiliki Pin di Peta Dunia
                </div>
                <p className="text-xs text-[#695A47]">
                  Pasang pin lokasi dengan 1 klik agar Wilayah dan Negara ini langsung tampil di kanvas Map Dunia.
                </p>
              </div>

              {metrics.unmappedLocations.length === 0 ? (
                <div className="py-10 px-6 text-center rounded-xl bg-[#F6F1E6] border border-[#D8CBB3]">
                  <div className="font-display text-lg font-bold text-[#2D5A43]">
                    ✓ Seluruh Wilayah & Negara Sudah Memiliki Pin di Peta Dunia!
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {metrics.unmappedLocations.map((loc) => (
                    <div
                      key={loc.id}
                      className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] flex flex-wrap items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="text-[11px] font-epic font-semibold text-[#2D5A43]">
                          {CATEGORY_META[loc.category].singular}
                        </div>
                        <div className="font-display text-lg font-bold text-[#231C14]">
                          {loc.title}
                        </div>
                        <div className="text-xs text-[#695A47]">
                          {loc.summary}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => onAutoPinLocationOnMap(loc)}
                          className="px-3 py-1.5 text-xs font-semibold bg-[#9E2A2B] text-white rounded-lg hover:bg-[#7E2021] flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          <span>+ Pasang Pin Otomatis di Peta</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onSelectEntity(loc.id);
                            onClose();
                          }}
                          className="px-3 py-1.5 text-xs font-semibold bg-[#EFE7D6] text-[#231C14] rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          Buka Profil ↗
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 5. MODAL PANDUAN ARSITEKTUR CERITA & CHECKLIST 5 TAHAP (Story Architect Guide)
// ============================================================================

interface StoryArchitectGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: WorldProject;
  onNavigateToTab: (tabId: string) => void;
  onShowToast: (msg: string) => void;
}

export const StoryArchitectGuideModal: React.FC<
  StoryArchitectGuideModalProps
> = ({ isOpen, onClose, project, onNavigateToTab, onShowToast }) => {
  const [guideTab, setGuideTab] = useState<'checklist' | 'pillars' | 'tips'>(
    'checklist'
  );

  const stageChecklist = useMemo(() => {
    const countCat = (cat: LoreCategory) =>
      project.entities.filter((e) => e.category === cat).length;

    const hasPremise =
      Boolean(project.worldName && project.tagline) &&
      Boolean(project.centralConflict || project.cosmologyCreationMyth);
    const cosmicCount = countCat('cosmic_entity') + countCat('deity');
    const mapStampCount = project.mapData?.stamps?.length || 0;

    const powerCount = countCat('power_system') + countCat('skill');
    const nationCultureCount =
      countCat('nation') + countCat('culture_religion') + countCat('region');
    const creatureRaceCount =
      countCat('race') + countCat('bestiary') + countCat('faction');

    const charCount = countCat('character');
    const dynastyCount = (project.dynastyTrees || []).length;
    const relCount = (project.relationships || []).length;

    const mysteryCount = (project.mysteryPlots || []).length;
    const timelineCount =
      (project.timeline || []).length + countCat('history');
    const chapterCount = (project.chapters || []).length;

    return [
      {
        stageNumber: 'Tahap 1',
        title: 'Tetapkan Premis Dunia, Kosmologi & Peta Utama (Pilar I)',
        description:
          'Mulai dengan menetapkan konflik sentral semesta Anda di Overview, kekuatan primordial/dewa tertinggi, serta bentuk benua utama di Map Dunia.',
        steps: [
          {
            label: 'Isi Premis, Konflik Sentral & Mitos Penciptaan di Overview',
            done: hasPremise,
            metric: hasPremise ? 'Sudah terisi' : 'Belum lengkap',
            targetTab: 'overview',
            buttonLabel: 'Buka Overview',
          },
          {
            label: 'Rancang Entitas Kosmik & Pantheon Dewa-Dewi',
            done: cosmicCount > 0,
            metric: `${cosmicCount} entri`,
            targetTab: 'cosmic_entity',
            buttonLabel: 'Buka Entitas Kosmik',
          },
          {
            label: 'Lukis Daratan & Pasang Pin Lokasi di Map Dunia',
            done: mapStampCount > 0,
            metric: `${mapStampCount} pin lokasi`,
            targetTab: 'map',
            buttonLabel: 'Buka Map Dunia',
          },
        ],
      },
      {
        stageNumber: 'Tahap 2',
        title: 'Bangun Aturan Sihir, Penghuni & Peradaban (Pilar II & III)',
        description:
          'Tetapkan batas mutlak (hard limit) sistem kekuatan agar tidak terjadi plot hole, lalu bangun kerajaan, adat budaya, ras, dan bestiary monster.',
        steps: [
          {
            label: 'Tetapkan Aturan Power System & Daftar Skill/Mantra',
            done: powerCount > 0,
            metric: `${powerCount} entri`,
            targetTab: 'power_system',
            buttonLabel: 'Buka Power System',
          },
          {
            label: 'Bangun Negara, Wilayah & Agama/Adat Budaya Bangsa',
            done: nationCultureCount >= 2,
            metric: `${nationCultureCount} entri`,
            targetTab: 'nation',
            buttonLabel: 'Buka Negara',
          },
          {
            label: 'Tambahkan Ras Penghuni, Bestiary Monster & Kelompok/Faksi',
            done: creatureRaceCount >= 2,
            metric: `${creatureRaceCount} entri`,
            targetTab: 'bestiary',
            buttonLabel: 'Buka Bestiary',
          },
        ],
      },
      {
        stageNumber: 'Tahap 3',
        title: 'Ciptakan Tokoh, Silsilah Dinasti & Jaringan Relasi (Pilar II & IV)',
        description:
          'Hidupkan cerita dengan tokoh protagonis/antagonis yang memiliki motivasi kuat, susun garis darah wangsa kerajaan, dan petakan konflik antar tokoh.',
        steps: [
          {
            label: 'Buat Profil Karakter Utama & Pendukung',
            done: charCount >= 2,
            metric: `${charCount} tokoh`,
            targetTab: 'character',
            buttonLabel: 'Buka Character',
          },
          {
            label: 'Susun Pohon Silsilah Keluarga & Dinasti Kerajaan',
            done: dynastyCount > 0,
            metric: `${dynastyCount} wangsa/klan`,
            targetTab: 'family_tree',
            buttonLabel: 'Buka Silsilah Dinasti',
          },
          {
            label: 'Hubungkan Sekutu & Musuh di Peta Relasi',
            done: relCount >= 2,
            metric: `${relCount} ikatan relasi`,
            targetTab: 'graph',
            buttonLabel: 'Buka Peta Relasi',
          },
        ],
      },
      {
        stageNumber: 'Tahap 4',
        title: 'Rancang Sejarah, Nubuat & Kerangka Alur Bab (Pilar III & IV)',
        description:
          'Tanamkan misteri/nubuat kuno beserta petunjuk bab (foreshadowing), susun urutan sejarah di Timeline, lalu mulai menulis adegan demi adegan di Alur Bab.',
        steps: [
          {
            label: 'Catat Peristiwa Masa Lalu di Sejarah & Timeline',
            done: timelineCount > 0,
            metric: `${timelineCount} catatan waktu`,
            targetTab: 'timeline',
            buttonLabel: 'Buka Timeline',
          },
          {
            label: 'Rancang Nubuat, Misteri & Petunjuk Foreshadowing',
            done: mysteryCount > 0,
            metric: `${mysteryCount} misteri/nubuat`,
            targetTab: 'prophecy_tracker',
            buttonLabel: 'Buka Tracker Nubuat',
          },
          {
            label: 'Susun Adegan (Scene Beats) & Tulis Naskah di Alur Bab',
            done: chapterCount > 0,
            metric: `${chapterCount} bab`,
            targetTab: 'outliner',
            buttonLabel: 'Buka Alur Bab',
          },
        ],
      },
    ];
  }, [project]);

  const totalSteps = stageChecklist.reduce(
    (acc, st) => acc + st.steps.length,
    0
  );
  const completedSteps = stageChecklist.reduce(
    (acc, st) => acc + st.steps.filter((s) => s.done).length,
    0
  );
  const completionPct = Math.round((completedSteps / totalSteps) * 100);

  if (!isOpen) return null;

  const handleDownloadGuideMd = () => {
    const guideLines = [
      `# Panduan Menyusun Cerita Fantasi di MythosCartograph`,
      `> Proyek Aktif: **${project.worldName}** (${completedSteps}/${totalSteps} Tahap Pondasi Terpenuhi — ${completionPct}%)`,
      ``,
      `## Urutan 4 Pilar Semesta Fantasi (21 Tab)`,
      ``,
      `### Pilar I · Kosmos & Atlas`,
      `- **Overview**: Premis utama, konflik sentral, mitos penciptaan, kalender, dan catatan cepat.`,
      `- **Entitas Kosmik**: Makhluk primordial, penguasa kehampaan (void), dan manifestasi hukum alam semesta.`,
      `- **Dewa-Dewi**: Jajaran pantheon ilahi, domain, simbol suci, kuil pemujaan, berkah, dan kutukan.`,
      `- **Map Dunia**: Lukis daratan/bioma dan tancapkan pin lokasi interaktif.`,
      ``,
      `### Pilar II · Penghuni & Arcana`,
      `- **Character**: Profil tokoh, motivasi batin, rahasia, dan jaringan relasi.`,
      `- **Ras**: Spesies berakal, rentang usia, ciri fisik, dan bakat bawaan.`,
      `- **Bestiary Monster**: Monster & makhluk mitologi, tingkat bahaya (tier), pola serangan, kelemahan, dan material alkimia (loot/drop).`,
      `- **Kelompok**: Faksi, ordo ksatria, serikat penyihir, dan dewan rahasia.`,
      `- **Power System**: Sumber energi, syarat penggunaan, risiko, dan batas mutlak (hard limit).`,
      `- **Skill**: Jurus, mantra, dan teknik khusus turunan Power System.`,
      ``,
      `### Pilar III · Geopolitik & Kronik`,
      `- **Negara**: Kerajaan/kekaisaran, pemerintahan, ibu kota, militer, dan ekonomi.`,
      `- **Agama & Budaya**: Iman, adat istiadat, festival tahunan, tabu sosial, busana, dan kuliner.`,
      `- **Wilayah**: Bentang alam spesifik, tingkat bahaya, dan landmark.`,
      `- **Sejarah & Timeline**: Arsip peristiwa besar masa lalu dan pita kronologi tahun demi tahun.`,
      `- **Artefak & Biota**: Pusaka legendaris, senjata kutukan, flora, dan mineral magis.`,
      ``,
      `### Pilar IV · Takdir, Naskah & Kanvas`,
      `- **Peta Relasi**: Graf visual ikatan sekutu, musuh, keluarga, dan pengkhianatan.`,
      `- **Silsilah Dinasti**: Pohon keluarga kerajaan & klan per generasi (Gen 1, Gen 2, Gen 3) beserta status pewaris takhta.`,
      `- **Tracker Nubuat**: Pelacak nubuat kuno, tafsir umum vs kebenaran kanonik rahasia penulis, dan rantai petunjuk bab (foreshadowing & red herring).`,
      `- **Alur Bab**: Kerangka bab, adegan (Scene Beats), dan editor naskah dengan Mode Fokus Menulis.`,
      `- **Kanvas Bebas**: Buku catatan multi-halaman gabungan Docs, OneNote (sticky cards), dan Paint (lukis sketsa bebas).`,
      ``,
      `## Cara Memakai Tautan Kurung Ganda [[Nama Entitas]]`,
      `Ketik \`[[Nama Entitas]]\` di dalam teks lore atau naskah bab:`,
      `1. Bila entitas sudah ada, teks berubah menjadi tautan emas interaktif lengkap dengan kartu pratinjau.`,
      `2. Bila entitas belum ada, teks tampil sebagai tautan merah bergaris putus-putus. Klik tautan tersebut untuk memilih kategori dan langsung membuat entitasnya secara otomatis.`,
    ];
    const blob = new Blob([guideLines.join('\n')], {
      type: 'text/markdown;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `panduan-menyusun-cerita-mythoscartograph.md`;
    link.click();
    URL.revokeObjectURL(url);
    onShowToast('Buku Panduan Menyusun Cerita (.MD) berhasil diunduh.');
  };

  const PILLAR_DIRECTORY = [
    {
      pilar: 'Pilar I · Kosmos & Atlas',
      subtitle: 'Pondasi Makro Alam Semesta, Ketuhanan & Geografi',
      items: [
        {
          id: 'overview',
          name: 'Overview',
          desc: 'Tulis logline cerita, konflik utama, mitos penciptaan, kalender, dan catatan kilat (Scratchpad).',
        },
        {
          id: 'cosmic_entity',
          name: 'Entitas Kosmik',
          desc: 'Rancang makhluk primordial, penguasa void, dan entitas kosmik yang melampaui dewa biasa.',
        },
        {
          id: 'deity',
          name: 'Dewa-Dewi',
          desc: 'Susun pantheon dewa-dewi yang disembah makhluk fana, simbol suci, kuil, serta berkah/kutukan.',
        },
        {
          id: 'map',
          name: 'Map Dunia',
          desc: 'Lukis benua dan pasang pin lokasi yang langsung terhubung ke entitas Negara atau Wilayah.',
        },
      ],
    },
    {
      pilar: 'Pilar II · Penghuni & Arcana',
      subtitle: 'Tokoh Cerita, Makhluk Mitologi & Sistem Kekuatan',
      items: [
        {
          id: 'character',
          name: 'Character',
          desc: 'Bangun tokoh protagonis, antagonis, motivasi batin, rahasia, dan jaringan relasi langsung.',
        },
        {
          id: 'race',
          name: 'Ras',
          desc: 'Dokumentasikan spesies berakal, rentang usia, ciri fisik, dan bakat alami.',
        },
        {
          id: 'bestiary',
          name: 'Bestiary Monster',
          desc: 'Ensiklopedia monster & naga lengkap dengan tingkat bahaya, pola serangan, kelemahan, dan loot alkimia.',
        },
        {
          id: 'faction',
          name: 'Kelompok',
          desc: 'Ordo ksatria, serikat penyihir, sindikat bayangan, beserta markas dan ideologinya.',
        },
        {
          id: 'power_system',
          name: 'Power System',
          desc: 'Tetapkan sumber energi sihir, syarat penggunaan, risiko, dan batas mutlak (hard limit).',
        },
        {
          id: 'skill',
          name: 'Skill',
          desc: 'Daftar jurus, mantra, dan teknik bertarung spesifik yang menginduk pada Power System.',
        },
      ],
    },
    {
      pilar: 'Pilar III · Geopolitik & Kronik',
      subtitle: 'Kerajaan, Tradisi Budaya, Sejarah & Pusaka',
      items: [
        {
          id: 'nation',
          name: 'Negara',
          desc: 'Kerajaan atau kekaisaran, bentuk pemerintahan, ibu kota, komoditas ekonomi, dan militer.',
        },
        {
          id: 'culture_religion',
          name: 'Agama & Budaya',
          desc: 'Sistem kepercayaan masyarakat, festival tahunan, pantangan/tabu sosial, busana adat, dan kuliner.',
        },
        {
          id: 'region',
          name: 'Wilayah',
          desc: 'Lokasi geografis spesifik (lembah, hutan purba, reruntuhan) beserta iklim dan sumber dayanya.',
        },
        {
          id: 'history',
          name: 'Sejarah',
          desc: 'Artikel mendalam tentang perang kuno, bencana, atau perjanjian bersejarah.',
        },
        {
          id: 'timeline',
          name: 'Timeline',
          desc: 'Pita kronologi berurutan dari tahun paling kuno hingga era cerita saat ini.',
        },
        {
          id: 'encyclopedia',
          name: 'Artefak & Biota',
          desc: 'Senjata pusaka legendaris, relik kutukan, tanaman obat langka, dan bijih logam magis.',
        },
      ],
    },
    {
      pilar: 'Pilar IV · Takdir, Naskah & Kanvas',
      subtitle: 'Silsilah Keluarga, Nubuat Plot, Penulisan Bab & Kanvas Coretan',
      items: [
        {
          id: 'graph',
          name: 'Peta Relasi',
          desc: 'Kanvas graf visual untuk memetakan hubungan sekutu, musuh, keluarga, dan pengkhianatan.',
        },
        {
          id: 'family_tree',
          name: 'Silsilah Dinasti',
          desc: 'Pohon silsilah wangsa kerajaan per generasi (Gen 1, Gen 2, dst.) beserta urutan pewaris takhta.',
        },
        {
          id: 'prophecy_tracker',
          name: 'Tracker Nubuat',
          desc: 'Lacak nubuat kuno, tafsir umum vs kebenaran rahasia penulis, serta petunjuk foreshadowing per bab.',
        },
        {
          id: 'outliner',
          name: 'Alur Bab',
          desc: 'Susun kerangka adegan (Scene Beats) dan tulis draf naskah bab dengan Mode Fokus Menulis.',
        },
        {
          id: 'free_canvas',
          name: 'Kanvas Bebas',
          desc: 'Ruang kerja gabungan Docs, OneNote (kartu tempel), dan Paint (lukis sketsa bebas) di atas kanvas polos.',
        },
      ],
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#FBF8F1] border-2 border-[#3B2E1E] rounded-2xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#F6F1E6] border-b border-[#D8CBB3] flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="font-epic text-xs font-bold uppercase tracking-wider text-[#9E2A2B] flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              <span>Panduan Arsitek Semesta & Alur Penulisan Cerita</span>
            </div>
            <h3 className="font-cartography text-2xl font-bold text-[#231C14]">
              Cara Menyusun Dunia & Naskah Cerita di MythosCartograph
            </h3>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleDownloadGuideMd}
              className="px-3 py-1.5 text-xs font-semibold bg-[#EFE7D6] border border-[#B5832A]/60 text-[#231C14] rounded-lg hover:bg-[#D8CBB3] flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#9E2A2B]" />
              <span>Unduh Panduan (.MD)</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg border border-[#D8CBB3] text-[#695A47] hover:text-[#231C14] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sub-Tabs */}
        <div className="px-6 py-3 bg-[#EFE7D6]/80 border-b border-[#D8CBB3] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setGuideTab('checklist')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                guideTab === 'checklist'
                  ? 'bg-[#9E2A2B] text-white'
                  : 'bg-[#FBF8F1] text-[#231C14] border border-[#D8CBB3]'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>1. Checklist 4 Tahap Menyusun Cerita</span>
            </button>
            <button
              type="button"
              onClick={() => setGuideTab('pillars')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                guideTab === 'pillars'
                  ? 'bg-[#9E2A2B] text-white'
                  : 'bg-[#FBF8F1] text-[#231C14] border border-[#D8CBB3]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>2. Kamus 4 Pilar & 21 Section</span>
            </button>
            <button
              type="button"
              onClick={() => setGuideTab('tips')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                guideTab === 'tips'
                  ? 'bg-[#9E2A2B] text-white'
                  : 'bg-[#FBF8F1] text-[#231C14] border border-[#D8CBB3]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>3. Cara Pakai [[Tautan]] & Fitur Pintar</span>
            </button>
          </div>

          <div className="text-xs font-mono-tabular text-[#695A47]">
            Progres Pondasi "{project.worldName}":{' '}
            <span className="font-bold text-[#9E2A2B]">
              {completedSteps}/{totalSteps} ({completionPct}%)
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {guideTab === 'checklist' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-[#231C14]">
                    Peta Jalan Interaktif Membangun Semesta & Menulis Bab
                  </div>
                  <p className="text-xs text-[#695A47]">
                    Daftar di bawah ini memeriksa kelengkapan proyek{' '}
                    <span className="font-semibold text-[#231C14]">
                      {project.worldName}
                    </span>{' '}
                    secara otomatis. Klik tombol di sebelah kanan tiap langkah untuk langsung menuju ke ruang kerja terkait.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {stageChecklist.map((stage) => (
                  <div
                    key={stage.stageNumber}
                    className="p-5 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-3"
                  >
                    <div>
                      <div className="font-epic text-[11px] font-bold uppercase tracking-wider text-[#9E2A2B]">
                        {stage.stageNumber}
                      </div>
                      <h4 className="font-display text-xl font-bold text-[#231C14]">
                        {stage.title}
                      </h4>
                      <p className="text-xs text-[#695A47] mt-0.5">
                        {stage.description}
                      </p>
                    </div>

                    <div className="space-y-2 pt-1">
                      {stage.steps.map((st, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-[#FBF8F1] border border-[#D8CBB3] flex flex-wrap items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${
                                st.done
                                  ? 'bg-[#2D5A43] text-white'
                                  : 'bg-[#EFE7D6] text-[#695A47] border border-[#D8CBB3]'
                              }`}
                            >
                              {st.done ? '✓' : idx + 1}
                            </span>
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-[#231C14]">
                                {st.label}
                              </div>
                              <div className="text-[11px] font-mono-tabular text-[#695A47]">
                                Status saat ini: {st.metric}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              onNavigateToTab(st.targetTab);
                              onClose();
                            }}
                            className="px-3 py-1.5 text-xs font-semibold bg-[#231C14] text-[#FBF8F1] hover:bg-[#3B2E1E] rounded-lg flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            <span>{st.buttonLabel}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-[#B5832A]" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {guideTab === 'pillars' && (
            <div className="space-y-5">
              {PILLAR_DIRECTORY.map((group) => (
                <div
                  key={group.pilar}
                  className="p-5 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-3"
                >
                  <div className="border-b border-[#D8CBB3] pb-2">
                    <div className="font-epic text-xs font-bold uppercase tracking-wider text-[#9E2A2B]">
                      {group.pilar}
                    </div>
                    <div className="text-xs text-[#695A47]">
                      {group.subtitle}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {group.items.map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-xl bg-[#FBF8F1] border border-[#D8CBB3] flex flex-col justify-between gap-2.5"
                      >
                        <div className="space-y-1">
                          <div className="font-display text-base font-bold text-[#231C14]">
                            {item.name}
                          </div>
                          <p className="text-xs text-[#695A47] leading-relaxed">
                            {item.desc}
                          </p>
                        </div>
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              onNavigateToTab(item.id);
                              onClose();
                            }}
                            className="px-3 py-1 text-xs font-semibold bg-[#EFE7D6] hover:bg-[#D8CBB3] text-[#231C14] rounded-lg flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            <span>Buka Tab {item.name}</span>
                            <ArrowRight className="w-3 h-3 text-[#9E2A2B]" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {guideTab === 'tips' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-2">
                <div className="font-epic text-xs font-bold uppercase tracking-wider text-[#9E2A2B]">
                  1. Sistem Tautan Kurung Ganda [[Nama Entitas]]
                </div>
                <h4 className="font-display text-lg font-bold text-[#231C14]">
                  Hubungkan Lore & Bab Secara Otomatis
                </h4>
                <p className="text-xs text-[#695A47] leading-relaxed">
                  Ketik nama tokoh, kerajaan, dewa, monster, atau pusaka di dalam kurung siku ganda seperti{' '}
                  <code className="px-1.5 py-0.5 rounded bg-[#EFE7D6] text-[#9E2A2B] font-mono">
                    [[Kaelen Vance]]
                  </code>{' '}
                  di kolom ringkasan, isi lore, maupun catatan bab.
                </p>
                <p className="text-xs text-[#231C14] leading-relaxed">
                  • Jika entitas sudah ada: Teks menjadi tautan emas yang menampilkan kartu pratinjau saat disentuh kursor.
                  <br />• Jika entitas belum ada: Teks tampil merah bergaris putus-putus. Klik tautan tersebut untuk memilih kategori dan membuatnya otomatis!
                </p>
              </div>

              <div className="p-5 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-2">
                <div className="font-epic text-xs font-bold uppercase tracking-wider text-[#9E2A2B]">
                  2. Silsilah Dinasti & Tracker Nubuat
                </div>
                <h4 className="font-display text-lg font-bold text-[#231C14]">
                  Kelola Politik Kerajaan & Plot Twist
                </h4>
                <p className="text-xs text-[#695A47] leading-relaxed">
                  Di Pilar IV, gunakan <strong>Silsilah Dinasti</strong> untuk memetakan pohon keluarga bangsawan per generasi (Gen 1, Gen 2, dst.) yang terhubung langsung ke profil Character.
                </p>
                <p className="text-xs text-[#231C14] leading-relaxed">
                  Gunakan <strong>Tracker Nubuat</strong> untuk memisahkan <em>Tafsir Umum Masyarakat</em> vs <em>Kebenaran Kanonik Rahasia Penulis</em>, serta mencatat di bab mana petunjuk (Clue) dan pengecoh (Red Herring) disebar.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-2">
                <div className="font-epic text-xs font-bold uppercase tracking-wider text-[#9E2A2B]">
                  3. Kanvas Bebas (Docs + OneNote + Paint)
                </div>
                <h4 className="font-display text-lg font-bold text-[#231C14]">
                  Ruang Brainstorming & Sketsa Polos
                </h4>
                <p className="text-xs text-[#695A47] leading-relaxed">
                  Buka tab <strong>Kanvas Bebas</strong> saat Anda ingin mencatat ide liar tanpa format kaku. Anda bisa mengetik dokumen panjang, menempelkan kartu catatan di titik mana pun, dan menggambar sketsa dengan kuas.
                </p>
                <p className="text-xs text-[#231C14] leading-relaxed">
                  Setiap kartu catatan di Kanvas Bebas memiliki tombol <strong>Promosikan ke World Bible</strong> untuk mengubah ide kasar menjadi entitas resmi.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-2">
                <div className="font-epic text-xs font-bold uppercase tracking-wider text-[#9E2A2B]">
                  4. Inspektur Kesehatan Lore & Ekspor Buku
                </div>
                <h4 className="font-display text-lg font-bold text-[#231C14]">
                  Audit Kohesi Dunia & Cetak ke .MD / PDF
                </h4>
                <p className="text-xs text-[#695A47] leading-relaxed">
                  Klik <strong>Kesehatan Lore (%)</strong> di bilah atas untuk mendeteksi tautan <code>[[...]]</code> yang belum dibuat, tokoh yatim yang belum memiliki relasi, atau wilayah yang belum dipin di peta.
                </p>
                <p className="text-xs text-[#231C14] leading-relaxed">
                  Klik <strong>Ekspor & Cetak Buku</strong> untuk mengunduh seluruh 13 kategori entitas, silsilah dinasti, tracker nubuat, dan naskah bab ke file <strong>.MD (Markdown)</strong> atau <strong>PDF</strong>.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


