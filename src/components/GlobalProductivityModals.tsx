import React, { useEffect, useMemo, useState } from 'react';
import {
  Archive,
  ArrowRight,
  BookOpen,
  Calendar,
  Check,
  Copy,
  Download,
  FileDown,
  FileJson,
  FileText,
  FolderKanban,
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
  'character',
  'race',
  'faction',
  'power_system',
  'skill',
  'nation',
  'region',
  'history',
  'encyclopedia',
];

export function buildWorldBibleMarkdown(project: WorldProject): string {
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

  lines.push(`## Kosmologi & Premis Utama`);
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
  lines.push(`## Ensiklopedia Entitas World Bible (${project.entities.length} Entri)`);
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
          lines.push(`- \`${k}\`: ${v}`);
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

  if (project.timeline.length > 0) {
    lines.push(`## Pita Kronologi Sejarah (${project.timeline.length} Peristiwa)`);
    lines.push('');
    const sortedTimeline = [...project.timeline].sort(
      (a, b) => a.year - b.year
    );
    sortedTimeline.forEach((ev) => {
      lines.push(`### [${ev.displayDate}] ${ev.title}`);
      lines.push(`- **Era**: ${ev.era} | **Kategori**: ${ev.category || 'Umum'} | **Lokasi**: ${ev.regionName || '-'}`);
      lines.push('');
      lines.push(ev.summary);
      if (ev.consequenceImpact) {
        lines.push('');
        lines.push(`**Dampak Jangka Panjang**: ${ev.consequenceImpact}`);
      }
      lines.push('');
    });
  }

  if (project.relationships.length > 0) {
    lines.push(`## Jaringan Peta Relasi (${project.relationships.length} Ikatan)`);
    lines.push('');
    project.relationships.forEach((rel) => {
      const src = project.entities.find((e) => e.id === rel.sourceId)?.title || rel.sourceId;
      const tgt = project.entities.find((e) => e.id === rel.targetId)?.title || rel.targetId;
      lines.push(
        `- **${src}** → **${tgt}** (*${rel.label}* | ${rel.type}${rel.visibilityStatus ? ` · ${rel.visibilityStatus}` : ''}): ${rel.notes}`
      );
    });
    lines.push('');
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
  const [printIncludeTimeline, setPrintIncludeTimeline] = useState(true);
  const [printIncludeChapters, setPrintIncludeChapters] = useState(true);

  const worldBibleMd = useMemo(() => buildWorldBibleMarkdown(project), [project]);
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
                <div>
                  <div className="text-xs font-semibold text-[#231C14]">
                    {exportTab === 'markdown_bible'
                      ? 'Kompilasi Ensiklopedia World Bible Lengkap (Format Markdown .md)'
                      : 'Kompilasi Kerangka Bab, Urutan Adegan & Draf Naskah (Format Markdown .md)'}
                  </div>
                  <p className="text-xs text-[#695A47]">
                    Siap dibuka langsung di Obsidian, Notion, Scrivener, Google Docs, atau editor teks favorit Anda.
                  </p>
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
                    <span>Ensiklopedia Entitas ({project.entities.length})</span>
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
                            {items.map((ent) => (
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
                                <div className="text-xs text-[#231C14]/90 leading-relaxed">
                                  <WikiTextRenderer
                                    text={ent.content}
                                    entities={project.entities}
                                    onSelectEntity={() => {}}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </section>
                )}

                {/* Section 3: Timeline */}
                {printIncludeTimeline && project.timeline.length > 0 && (
                  <section className="space-y-4">
                    <h2 className="font-display text-2xl font-bold text-[#231C14] border-b border-[#D8CBB3] pb-1.5">
                      III. Pita Kronologi Sejarah ({project.timeline.length})
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

                {/* Section 4: Chapters */}
                {printIncludeChapters && project.chapters.length > 0 && (
                  <section className="space-y-4">
                    <h2 className="font-display text-2xl font-bold text-[#231C14] border-b border-[#D8CBB3] pb-1.5">
                      IV. Alur Bab & Draf Naskah ({project.chapters.length} Bab)
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
