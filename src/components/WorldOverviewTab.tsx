import React, { useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Check,
  Compass,
  Edit3,
  FilePlus2,
  Flame,
  GitBranch,
  Globe,
  Lightbulb,
  MapPin,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Trash2,
  Upload,
  Users,
  X,
} from 'lucide-react';
import { STARTER_WORLD_PROJECT } from '../data/starterWorld';
import {
  LoreCategory,
  LoreEntity,
  ScratchpadNote,
  WorldProject,
} from '../types/world';
import {
  CATEGORY_META,
  FantasySectionDivider,
  OrnateCornerFiligree,
  WikiTextRenderer,
} from './WikiTextRenderer';

interface WorldOverviewTabProps {
  project: WorldProject;
  onUpdateProjectMeta: (patch: Partial<WorldProject>) => void;
  onSelectEntity: (entityId: string) => void;
  onOpenMapTab: () => void;
  onOpenTimelineTab: () => void;
  onOpenGraphTab: () => void;
  onOpenChapter: (chapterId: string) => void;
  onPromoteNoteToEntity: (note: ScratchpadNote) => void;
  onCreateBlankWorld: () => void;
  onResetStarterWorld: () => void;
  onTriggerImportJson: () => void;
}

const ALL_CATEGORIES: LoreCategory[] = [
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

export const WorldOverviewTab: React.FC<WorldOverviewTabProps> = ({
  project,
  onUpdateProjectMeta,
  onSelectEntity,
  onOpenMapTab,
  onOpenTimelineTab,
  onOpenGraphTab,
  onOpenChapter,
  onPromoteNoteToEntity,
  onCreateBlankWorld,
  onResetStarterWorld,
  onTriggerImportJson,
}) => {
  const [isEditingOverview, setIsEditingOverview] = useState<boolean>(false);
  const [globalQuery, setGlobalQuery] = useState<string>('');
  const [newNoteText, setNewNoteText] = useState<string>('');
  const [newNoteCategory, setNewNoteCategory] =
    useState<LoreCategory>('character');

  // Fallback values for backward compatibility with older saved projects
  const epigraphQuote =
    project.epigraphQuote ?? STARTER_WORLD_PROJECT.epigraphQuote ?? '';
  const epigraphSource =
    project.epigraphSource ?? STARTER_WORLD_PROJECT.epigraphSource ?? '';
  const centralConflict =
    project.centralConflict ?? STARTER_WORLD_PROJECT.centralConflict ?? '';
  const storyThemes =
    project.storyThemes ?? STARTER_WORLD_PROJECT.storyThemes ?? '';
  const cosmologyCreationMyth =
    project.cosmologyCreationMyth ??
    STARTER_WORLD_PROJECT.cosmologyCreationMyth ??
    '';
  const cosmologyLaws =
    project.cosmologyLaws ?? STARTER_WORLD_PROJECT.cosmologyLaws ?? '';
  const scratchpadNotes =
    project.scratchpadNotes ?? STARTER_WORLD_PROJECT.scratchpadNotes ?? [];

  // Draft state for Clean Book Mode -> Edit Mode
  const [draftMeta, setDraftMeta] = useState({
    worldName: project.worldName,
    tagline: project.tagline,
    genre: project.genre,
    calendarSystem: project.calendarSystem,
    authorName: project.authorName,
    epigraphQuote,
    epigraphSource,
    centralConflict,
    storyThemes,
    cosmologyCreationMyth,
    cosmologyLaws,
  });

  const handleOpenEditor = () => {
    setDraftMeta({
      worldName: project.worldName,
      tagline: project.tagline,
      genre: project.genre,
      calendarSystem: project.calendarSystem,
      authorName: project.authorName,
      epigraphQuote,
      epigraphSource,
      centralConflict,
      storyThemes,
      cosmologyCreationMyth,
      cosmologyLaws,
    });
    setIsEditingOverview(true);
  };

  const handleSaveOverview = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProjectMeta({
      worldName: draftMeta.worldName.trim() || project.worldName,
      tagline: draftMeta.tagline.trim() || project.tagline,
      genre: draftMeta.genre.trim() || project.genre,
      calendarSystem: draftMeta.calendarSystem.trim() || project.calendarSystem,
      authorName: draftMeta.authorName.trim() || project.authorName,
      epigraphQuote: draftMeta.epigraphQuote,
      epigraphSource: draftMeta.epigraphSource,
      centralConflict: draftMeta.centralConflict,
      storyThemes: draftMeta.storyThemes,
      cosmologyCreationMyth: draftMeta.cosmologyCreationMyth,
      cosmologyLaws: draftMeta.cosmologyLaws,
    });
    setIsEditingOverview(false);
  };

  const handleAddScratchpadNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    const created: ScratchpadNote = {
      id: `note-${Date.now()}`,
      text: newNoteText.trim(),
      targetCategory: newNoteCategory,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    onUpdateProjectMeta({
      scratchpadNotes: [created, ...scratchpadNotes],
    });
    setNewNoteText('');
  };

  const handleDeleteScratchpadNote = (noteId: string) => {
    onUpdateProjectMeta({
      scratchpadNotes: scratchpadNotes.filter((n) => n.id !== noteId),
    });
  };

  // Global Search Results across Entities, Map Stamps, Timeline, and Chapters
  const trimmedQ = globalQuery.trim().toLowerCase();
  const matchedEntities = trimmedQ
    ? project.entities.filter(
        (e) =>
          e.title.toLowerCase().includes(trimmedQ) ||
          e.subtitle.toLowerCase().includes(trimmedQ) ||
          e.summary.toLowerCase().includes(trimmedQ) ||
          e.content.toLowerCase().includes(trimmedQ) ||
          e.tags.some((t) => t.toLowerCase().includes(trimmedQ))
      )
    : [];

  const matchedStamps = trimmedQ
    ? project.mapData.stamps.filter((s) =>
        s.label.toLowerCase().includes(trimmedQ)
      )
    : [];

  const matchedTimeline = trimmedQ
    ? project.timeline.filter(
        (t) =>
          t.title.toLowerCase().includes(trimmedQ) ||
          t.summary.toLowerCase().includes(trimmedQ) ||
          t.displayDate.toLowerCase().includes(trimmedQ)
      )
    : [];

  const matchedChapters = trimmedQ
    ? project.chapters.filter(
        (c) =>
          c.title.toLowerCase().includes(trimmedQ) ||
          c.synopsis.toLowerCase().includes(trimmedQ) ||
          c.draftNotes.toLowerCase().includes(trimmedQ)
      )
    : [];

  const characters = project.entities.filter((e) => e.category === 'character');
  const factionsAndNations = project.entities.filter(
    (e) => e.category === 'faction' || e.category === 'nation'
  );

  return (
    <div className="space-y-6">
      {/* ===================================================================== */}
      {/* 1. HERO FRONTISPIECE & ANCIENT EPIGRAPH BANNER (Clean Book Mode)      */}
      {/* ===================================================================== */}
      <div className="relative overflow-hidden bg-[#FBF8F1] border-2 border-[#B5832A]/55 rounded-2xl p-6 sm:p-7 space-y-6 shadow-xs">
        <OrnateCornerFiligree />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Column: Literary Book Frontispiece */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#695A47]">
                <span className="font-epic font-bold uppercase tracking-wider text-[#9E2A2B]">
                  ❖ {project.genre}
                </span>
                <span aria-hidden="true">·</span>
                <span>{project.calendarSystem}</span>
                <span aria-hidden="true">·</span>
                <span>Arsiparis: {project.authorName}</span>
              </div>

              <h1 className="font-cartography text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#231C14] leading-[1.14]">
                {project.worldName}
              </h1>

              <p className="text-sm sm:text-base text-[#695A47] max-w-2xl leading-relaxed">
                {project.tagline}
              </p>

              {/* Epigraph / Ancient Prophecy Quote Block */}
              {epigraphQuote && (
                <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#B5832A]/45 space-y-1.5">
                  <p className="text-sm italic text-[#231C14] leading-relaxed">
                    “{epigraphQuote}”
                  </p>
                  {epigraphSource && (
                    <div className="font-epic text-xs font-semibold text-[#9E2A2B]">
                      — {epigraphSource}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Clean Studio Actions Toolbar */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() =>
                  isEditingOverview
                    ? setIsEditingOverview(false)
                    : handleOpenEditor()
                }
                className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isEditingOverview
                    ? 'bg-[#9E2A2B] text-white'
                    : 'bg-[#231C14] text-[#FBF8F1] hover:bg-[#3A2E21]'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                {isEditingOverview
                  ? 'Tutup Mode Sunting'
                  : 'Sunting Identitas & Kosmologi'}
              </button>

              <button
                type="button"
                onClick={onTriggerImportJson}
                className="px-3.5 py-2 text-xs font-medium bg-[#F6F1E6] text-[#231C14] border border-[#D8CBB3] rounded-lg hover:bg-[#EFE7D6] flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                Impor JSON
              </button>

              <button
                type="button"
                onClick={onCreateBlankWorld}
                className="px-3.5 py-2 text-xs font-medium bg-[#F6F1E6] text-[#9E2A2B] border border-[#D8CBB3] rounded-lg hover:bg-[#EFE7D6] flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <FilePlus2 className="w-3.5 h-3.5" />
                Buat Dunia Baru
              </button>

              <button
                type="button"
                onClick={onResetStarterWorld}
                className="px-3 py-2 text-xs font-medium text-[#695A47] hover:text-[#231C14] flex items-center gap-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                title="Kembalikan data contoh dunia Aethelia"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Contoh
              </button>
            </div>
          </div>

          {/* Right Column: Matching Height Visual Container */}
          <div className="lg:col-span-5">
            <div className="relative h-60 lg:h-full min-h-[240px] rounded-xl overflow-hidden border border-[#D8CBB3] bg-[#EFE7D6]">
              <img
                src={project.heroBannerUrl}
                alt={project.worldName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-5">
                <div className="text-[#FBF8F1] space-y-0.5">
                  <div className="text-[11px] text-[#E6D5B8]">
                    Ensiklopedia Kanon · Tersimpan Otomatis di Browser
                  </div>
                  <div className="font-cartography text-base font-bold tracking-wide">
                    {project.mapData.mapTitle} ({project.entities.length} Entitas Kanon)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Collapsible Edit Drawer (Only visible when user clicks "Sunting Identitas & Kosmologi") */}
        {isEditingOverview && (
          <form
            onSubmit={handleSaveOverview}
            className="pt-6 border-t border-[#D8CBB3] space-y-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-[#9E2A2B]">
                  Mode Penyuntingan Sampul & Kosmologi Dunia
                </div>
                <h3 className="font-display text-xl font-bold text-[#231C14]">
                  Atur Identitas, Epigrafi, Konflik Pusat & Hukum Semesta
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingOverview(false)}
                  className="px-3 py-1.5 text-xs font-medium border border-[#D8CBB3] rounded-lg text-[#695A47] hover:text-[#231C14] flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-[#9E2A2B] text-white rounded-lg hover:bg-[#7E2021] flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  Simpan Perubahan Overview
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#695A47] mb-1">
                  Nama Dunia / Judul Semesta
                </label>
                <input
                  type="text"
                  value={draftMeta.worldName}
                  onChange={(e) =>
                    setDraftMeta({ ...draftMeta, worldName: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs font-semibold bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg text-[#231C14]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#695A47] mb-1">
                  Genre & Sub-Genre
                </label>
                <input
                  type="text"
                  value={draftMeta.genre}
                  onChange={(e) =>
                    setDraftMeta({ ...draftMeta, genre: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg text-[#231C14]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#695A47] mb-1">
                  Sistem Penanggalan / Kalender
                </label>
                <input
                  type="text"
                  value={draftMeta.calendarSystem}
                  onChange={(e) =>
                    setDraftMeta({
                      ...draftMeta,
                      calendarSystem: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg text-[#231C14]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#695A47] mb-1">
                  Nama Penulis / Arsiparis
                </label>
                <input
                  type="text"
                  value={draftMeta.authorName}
                  onChange={(e) =>
                    setDraftMeta({ ...draftMeta, authorName: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg text-[#231C14]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#695A47] mb-1">
                  Premis Utama / Tagline Dunia
                </label>
                <input
                  type="text"
                  value={draftMeta.tagline}
                  onChange={(e) =>
                    setDraftMeta({ ...draftMeta, tagline: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg text-[#231C14]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#695A47] mb-1">
                  Tema Filosofis & Naratif Cerita
                </label>
                <input
                  type="text"
                  value={draftMeta.storyThemes}
                  onChange={(e) =>
                    setDraftMeta({ ...draftMeta, storyThemes: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg text-[#231C14]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[#695A47] mb-1">
                  Kutipan Epigrafi / Ramalan Kuno Pembuka Dunia
                </label>
                <input
                  type="text"
                  value={draftMeta.epigraphQuote}
                  onChange={(e) =>
                    setDraftMeta({
                      ...draftMeta,
                      epigraphQuote: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-xs italic bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg text-[#231C14]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#695A47] mb-1">
                  Sumber Kutipan / Naskah Kuno
                </label>
                <input
                  type="text"
                  value={draftMeta.epigraphSource}
                  onChange={(e) =>
                    setDraftMeta({
                      ...draftMeta,
                      epigraphSource: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg text-[#231C14]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#695A47] mb-1">
                  Sinopsis Utama & Konflik Pusat (Mendukung [[Nama Entitas]])
                </label>
                <textarea
                  rows={4}
                  value={draftMeta.centralConflict}
                  onChange={(e) =>
                    setDraftMeta({
                      ...draftMeta,
                      centralConflict: e.target.value,
                    })
                  }
                  className="w-full p-3 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg text-[#231C14] leading-relaxed"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#695A47] mb-1">
                  Pilar Kosmologi 1: Mitos Penciptaan & Asal-Usul
                </label>
                <textarea
                  rows={4}
                  value={draftMeta.cosmologyCreationMyth}
                  onChange={(e) =>
                    setDraftMeta({
                      ...draftMeta,
                      cosmologyCreationMyth: e.target.value,
                    })
                  }
                  className="w-full p-3 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg text-[#231C14] leading-relaxed"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#695A47] mb-1">
                  Pilar Kosmologi 2: Hukum Alam & Energi Sihir
                </label>
                <textarea
                  rows={4}
                  value={draftMeta.cosmologyLaws}
                  onChange={(e) =>
                    setDraftMeta({
                      ...draftMeta,
                      cosmologyLaws: e.target.value,
                    })
                  }
                  className="w-full p-3 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg text-[#231C14] leading-relaxed"
                />
              </div>
            </div>
          </form>
        )}
      </div>

      {/* ===================================================================== */}
      {/* 2. GLOBAL SEARCH OMNIBAR & 3. QUICK IDEA SCRATCHPAD                   */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Global Omnibar Search */}
        <div className="lg:col-span-6 bg-[#FBF8F1] border border-[#D8CBB3] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#D8CBB3] pb-3">
            <div>
              <div className="text-xs font-semibold text-[#9E2A2B]">
                Pencarian Lintas Semesta
              </div>
              <h2 className="font-display text-xl font-bold text-[#231C14]">
                Global Search World Bible
              </h2>
            </div>
            <Search className="w-5 h-5 text-[#695A47]" />
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-[#695A47] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={globalQuery}
              onChange={(e) => setGlobalQuery(e.target.value)}
              placeholder="Ketik nama karakter, ras, skill, kota di peta, peristiwa sejarah, atau bab..."
              className="w-full pl-10 pr-8 py-2.5 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg text-[#231C14] placeholder:text-[#695A47] focus:outline-none focus:border-[#9E2A2B]"
            />
            {globalQuery && (
              <button
                type="button"
                onClick={() => setGlobalQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#695A47] hover:text-[#231C14] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {trimmedQ ? (
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {matchedEntities.length === 0 &&
              matchedStamps.length === 0 &&
              matchedTimeline.length === 0 &&
              matchedChapters.length === 0 ? (
                <div className="text-xs text-[#695A47] py-4 text-center">
                  Tidak ditemukan hasil untuk “{globalQuery}”.
                </div>
              ) : (
                <>
                  {matchedEntities.map((ent) => (
                    <button
                      key={ent.id}
                      type="button"
                      onClick={() => onSelectEntity(ent.id)}
                      className="w-full text-left p-3 rounded-lg bg-[#F6F1E6] hover:bg-[#EFE7D6] border border-[#D8CBB3] transition-colors flex items-center justify-between gap-3 cursor-pointer"
                    >
                      <div className="min-w-0">
                        <div className="text-[11px] font-semibold text-[#9E2A2B]">
                          Tab {CATEGORY_META[ent.category].singular} · {ent.subtitle}
                        </div>
                        <div className="font-display text-base font-bold text-[#231C14] truncate">
                          {ent.title}
                        </div>
                        <p className="text-xs text-[#695A47] truncate">
                          {ent.summary}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#9E2A2B] shrink-0" />
                    </button>
                  ))}

                  {matchedStamps.map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={onOpenMapTab}
                      className="w-full text-left p-2.5 rounded-lg bg-[#F6F1E6] hover:bg-[#EFE7D6] border border-[#D8CBB3] flex items-center justify-between text-xs cursor-pointer"
                    >
                      <span>
                        <strong className="text-[#264653]">[Lokasi Peta]</strong>{' '}
                        {st.label}
                      </span>
                      <span className="font-mono-tabular text-[#695A47]">
                        {st.x}°,{st.y}° →
                      </span>
                    </button>
                  ))}

                  {matchedTimeline.map((tm) => (
                    <button
                      key={tm.id}
                      type="button"
                      onClick={onOpenTimelineTab}
                      className="w-full text-left p-2.5 rounded-lg bg-[#F6F1E6] hover:bg-[#EFE7D6] border border-[#D8CBB3] flex items-center justify-between text-xs cursor-pointer"
                    >
                      <span>
                        <strong className="text-[#B5832A]">[Timeline]</strong>{' '}
                        {tm.displayDate} — {tm.title}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#695A47]" />
                    </button>
                  ))}

                  {matchedChapters.map((ch) => (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => onOpenChapter(ch.id)}
                      className="w-full text-left p-2.5 rounded-lg bg-[#F6F1E6] hover:bg-[#EFE7D6] border border-[#D8CBB3] flex items-center justify-between text-xs cursor-pointer"
                    >
                      <span>
                        <strong className="text-[#2D5A43]">[Alur Bab]</strong>{' '}
                        Bab {ch.chapterNumber}: {ch.title}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#695A47]" />
                    </button>
                  ))}
                </>
              )}
            </div>
          ) : (
            <div className="p-3.5 rounded-lg bg-[#F6F1E6]/80 border border-[#D8CBB3]/80 flex flex-wrap items-center justify-between gap-2 text-xs text-[#695A47]">
              <span>
                Indeks aktif mencakup{' '}
                <strong className="font-mono-tabular text-[#231C14]">
                  {project.entities.length}
                </strong>{' '}
                entri lore,{' '}
                <strong className="font-mono-tabular text-[#231C14]">
                  {project.mapData.stamps.length}
                </strong>{' '}
                titik peta,{' '}
                <strong className="font-mono-tabular text-[#231C14]">
                  {project.timeline.length}
                </strong>{' '}
                peristiwa sejarah, dan{' '}
                <strong className="font-mono-tabular text-[#231C14]">
                  {project.chapters.length}
                </strong>{' '}
                bab.
              </span>
            </div>
          )}
        </div>

        {/* Quick Idea Scratchpad (Catatan Ide Kilat) */}
        <div className="lg:col-span-6 bg-[#FBF8F1] border border-[#D8CBB3] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#D8CBB3] pb-3">
            <div>
              <div className="text-xs font-semibold text-[#B5832A]">
                Tangkap Inspirasi Mendadak Sebelum Lupa
              </div>
              <h2 className="font-display text-xl font-bold text-[#231C14]">
                Catatan Ide Kilat (Scratchpad)
              </h2>
            </div>
            <Lightbulb className="w-5 h-5 text-[#B5832A]" />
          </div>

          <form onSubmit={handleAddScratchpadNote} className="flex flex-wrap gap-2">
            <input
              type="text"
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="Tulis ide karakter, skill, plot twist, atau misteri kuno..."
              className="flex-1 min-w-[200px] px-3 py-2 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg text-[#231C14] focus:outline-none focus:border-[#9E2A2B]"
            />
            <select
              value={newNoteCategory}
              onChange={(e) =>
                setNewNoteCategory(e.target.value as LoreCategory)
              }
              className="px-2.5 py-2 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg text-[#231C14]"
            >
              {ALL_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_META[c].singular}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="px-3.5 py-2 text-xs font-semibold bg-[#231C14] text-[#FBF8F1] rounded-lg hover:bg-[#3A2E21] flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              Simpan Ide
            </button>
          </form>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {scratchpadNotes.length === 0 ? (
              <div className="text-xs text-[#695A47] py-3 text-center">
                Belum ada catatan ide kilat. Tambahkan ide baru di atas!
              </div>
            ) : (
              scratchpadNotes.map((note) => (
                <div
                  key={note.id}
                  className="p-3 rounded-lg bg-[#F6F1E6] border border-[#D8CBB3] flex items-start justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="text-[11px] text-[#695A47]">
                      Calon{' '}
                      <span className="font-semibold text-[#9E2A2B]">
                        {CATEGORY_META[note.targetCategory].singular}
                      </span>{' '}
                      · {note.createdAt}
                    </div>
                    <p className="text-xs text-[#231C14] leading-relaxed">
                      {note.text}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onPromoteNoteToEntity(note)}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-[#9E2A2B] text-white rounded hover:bg-[#7E2021] transition-colors whitespace-nowrap cursor-pointer"
                      title="Ubah catatan ini menjadi entri World Bible"
                    >
                      Jadikan Entri →
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteScratchpadNote(note.id)}
                      className="p-1 text-[#695A47] hover:text-[#9E2A2B] cursor-pointer"
                      title="Hapus catatan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <FantasySectionDivider title="Kronik Konflik & Kosmologi Semesta" />

      {/* ===================================================================== */}
      {/* 4. SINOPSIS & KONFLIK PUSAT + 5. PILAR KOSMOLOGI & HUKUM DUNIA        */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Sinopsis Utama, Konflik Pusat & Tema Cerita */}
        <div className="relative overflow-hidden lg:col-span-6 bg-[#FBF8F1] border border-[#B5832A]/45 rounded-xl p-6 flex flex-col justify-between space-y-4">
          <OrnateCornerFiligree className="text-[#B5832A]/45" />
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#D8CBB3] pb-3">
              <div>
                <div className="font-epic text-xs font-semibold text-[#9E2A2B]">
                  Jantung Narasi & Ketegangan Utama
                </div>
                <h2 className="font-display text-2xl font-bold text-[#231C14]">
                  Sinopsis & Konflik Pusat Semesta
                </h2>
              </div>
              <Flame className="w-5 h-5 text-[#9E2A2B]" />
            </div>

            <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3]">
              <WikiTextRenderer
                text={centralConflict}
                entities={project.entities}
                onSelectEntity={onSelectEntity}
                dropCap={true}
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#EFE7D6]/70 border border-[#D8CBB3] space-y-1">
            <div className="text-[11px] font-semibold text-[#695A47]">
              Tema Filosofis & Naratif Cerita
            </div>
            <div className="text-xs font-semibold text-[#231C14]">
              {storyThemes}
            </div>
          </div>
        </div>

        {/* Pilar Kosmologi: Mitos Penciptaan & Hukum Dunia */}
        <div className="relative overflow-hidden lg:col-span-6 bg-[#FBF8F1] border border-[#B5832A]/45 rounded-xl p-6 space-y-4">
          <OrnateCornerFiligree className="text-[#B5832A]/45" />
          <div className="flex items-center justify-between border-b border-[#D8CBB3] pb-3">
            <div>
              <div className="font-epic text-xs font-semibold text-[#264653]">
                Asal-Usul Semesta & Aturan Fundamental
              </div>
              <h2 className="font-display text-2xl font-bold text-[#231C14]">
                Pilar Kosmologi & Hukum Dunia
              </h2>
            </div>
            <Globe className="w-5 h-5 text-[#264653]" />
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-1.5">
              <div className="font-epic text-xs font-semibold text-[#9E2A2B]">
                I. Mitos Penciptaan & Sejarah Awal Kosmos
              </div>
              <WikiTextRenderer
                text={cosmologyCreationMyth}
                entities={project.entities}
                onSelectEntity={onSelectEntity}
                dropCap={true}
              />
            </div>

            <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-1.5">
              <div className="font-epic text-xs font-semibold text-[#264653]">
                II. Hukum Alam, Benda Langit & Batas Sihir
              </div>
              <WikiTextRenderer
                text={cosmologyLaws}
                entities={project.entities}
                onSelectEntity={onSelectEntity}
              />
            </div>
          </div>
        </div>
      </div>

      <FantasySectionDivider title="Kartografi Wilayah & Dramatis Personae" />

      {/* ===================================================================== */}
      {/* 6. PRATINJAU MINI PETA DUNIA + 7. SOROTAN TOKOH & KONFLIK KELOMPOK    */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Pratinjau Mini Peta Dunia & Lokasi Kunci */}
        <div className="lg:col-span-6 bg-[#FBF8F1] border border-[#D8CBB3] rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#D8CBB3] pb-3">
            <div>
              <div className="text-xs font-semibold text-[#2D5A43]">
                Geografi Kerajaan & Titik Strategis
              </div>
              <h2 className="font-display text-2xl font-bold text-[#231C14]">
                Pratinjau Peta Dunia & Lokasi Kunci
              </h2>
            </div>
            <button
              type="button"
              onClick={onOpenMapTab}
              className="px-3.5 py-1.5 text-xs font-semibold bg-[#231C14] text-[#FBF8F1] rounded-lg hover:bg-[#3A2E21] flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Compass className="w-3.5 h-3.5 text-[#B5832A]" />
              Buka Kanvas Map Penuh →
            </button>
          </div>

          {/* Interactive Miniature Parchment Atlas Preview */}
          <div
            onClick={onOpenMapTab}
            className="relative h-48 rounded-xl overflow-hidden border-2 border-[#3B2818] bg-[#DFCDAE] cursor-pointer group"
          >
            {/* Stylized miniature continent silhouette */}
            <svg viewBox="0 0 400 180" className="w-full h-full block">
              <rect width="400" height="180" fill="#DAC8A6" />
              <path
                d="M70,40 Q120,18 190,32 T310,48 Q345,85 315,135 Q255,160 195,140 Q165,115 140,145 Q90,152 65,110 Z"
                fill="#F2E6CE"
                stroke="#3B2818"
                strokeWidth="2"
              />
              {/* Subtle rhumb lines */}
              <line
                x1="45"
                y1="145"
                x2="360"
                y2="25"
                stroke="rgba(59,40,24,0.16)"
                strokeWidth="1"
              />
              <line
                x1="45"
                y1="145"
                x2="380"
                y2="145"
                stroke="rgba(59,40,24,0.16)"
                strokeWidth="1"
              />
            </svg>

            {/* Plotted miniature pins */}
            {project.mapData.stamps.slice(0, 6).map((st) => (
              <div
                key={st.id}
                style={{ left: `${st.x}%`, top: `${st.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#9E2A2B] border border-[#FBF8F1] shadow-xs" />
                <span className="px-1.5 py-0.5 rounded bg-[#FBF8F1]/90 border border-[#3B2818]/40 text-[10px] font-bold text-[#231C14] whitespace-nowrap">
                  {st.label.split(' ')[0]}
                </span>
              </div>
            ))}

            <div className="absolute bottom-2.5 right-3 px-2.5 py-1 rounded bg-[#231C14]/85 text-[#FBF8F1] text-[11px] font-medium group-hover:bg-[#9E2A2B] transition-colors">
              {project.mapData.mapTitle} · Klik untuk melukis peta
            </div>
          </div>

          {/* Key Pinned Locations Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {project.mapData.stamps.map((stamp) => {
              const linked = stamp.linkedEntityId
                ? project.entities.find((e) => e.id === stamp.linkedEntityId)
                : null;
              return (
                <button
                  key={stamp.id}
                  type="button"
                  onClick={() =>
                    linked ? onSelectEntity(linked.id) : onOpenMapTab()
                  }
                  className="text-left p-3 rounded-lg bg-[#F6F1E6] hover:bg-[#EFE7D6] border border-[#D8CBB3] transition-colors flex items-center justify-between gap-2 cursor-pointer"
                >
                  <div className="min-w-0">
                    <div className="font-display text-sm font-bold text-[#231C14] truncate">
                      {stamp.label}
                    </div>
                    <div className="text-[11px] text-[#695A47] truncate">
                      {linked
                        ? `${CATEGORY_META[linked.category].singular}: ${linked.title}`
                        : 'Klik untuk lihat di Peta Dunia'}
                    </div>
                  </div>
                  <span className="font-mono-tabular text-[11px] text-[#9E2A2B] shrink-0">
                    {stamp.x}°,{stamp.y}°
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sorotan Tokoh Utama & Konflik Kelompok */}
        <div className="lg:col-span-6 bg-[#FBF8F1] border border-[#D8CBB3] rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#D8CBB3] pb-3">
            <div>
              <div className="text-xs font-semibold text-[#9E2A2B]">
                Figur Kunci & Dinamika Politik
              </div>
              <h2 className="font-display text-2xl font-bold text-[#231C14]">
                Sorotan Tokoh Utama & Konflik Kelompok
              </h2>
            </div>
            <button
              type="button"
              onClick={onOpenGraphTab}
              className="px-3.5 py-1.5 text-xs font-semibold bg-[#F6F1E6] border border-[#D8CBB3] text-[#231C14] rounded-lg hover:bg-[#EFE7D6] flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              <GitBranch className="w-3.5 h-3.5 text-[#9E2A2B]" />
              Buka Peta Relasi →
            </button>
          </div>

          {/* Featured Character Cards (Tarot / Arcana Folio Style) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {characters.slice(0, 4).map((char, idx) => (
              <button
                key={char.id}
                type="button"
                onClick={() => onSelectEntity(char.id)}
                className="arcana-card text-left p-3.5 rounded-xl bg-[#F6F1E6] hover:bg-[#EFE7D6] border border-[#B5832A]/45 transition-all flex items-start gap-3 cursor-pointer"
              >
                {char.imageUrl ? (
                  <img
                    src={char.imageUrl}
                    alt={char.title}
                    referrerPolicy="no-referrer"
                    className="w-14 h-16 rounded-lg object-cover border border-[#B5832A] shrink-0"
                  />
                ) : (
                  <div className="w-14 h-16 rounded-lg bg-[#EFE7D6] border border-[#B5832A]/60 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-[#9E2A2B]" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1 text-[10px] font-epic uppercase tracking-wider text-[#B5832A]">
                    <span className="truncate text-[#9E2A2B] font-bold">
                      {char.attributes.role || 'Tokoh Kunci'}
                    </span>
                    <span className="shrink-0">❖ 0{idx + 1}</span>
                  </div>
                  <div className="font-display text-base font-bold text-[#231C14] truncate mt-0.5">
                    {char.title}
                  </div>
                  <div className="text-[11px] italic text-[#695A47] truncate mt-0.5">
                    {char.attributes.powerTier || char.subtitle}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Active Faction & Kingdom Conflicts */}
          <div className="pt-2 space-y-2">
            <div className="text-xs font-semibold text-[#695A47]">
              Dinamika Konflik & Aliansi Utama ({project.relationships.length} Relasi)
            </div>
            <div className="space-y-2">
              {project.relationships.slice(0, 4).map((rel) => {
                const sEnt = project.entities.find((e) => e.id === rel.sourceId);
                const tEnt = project.entities.find((e) => e.id === rel.targetId);
                if (!sEnt || !tEnt) return null;
                return (
                  <div
                    key={rel.id}
                    className="p-3 rounded-lg bg-[#F6F1E6] border border-[#D8CBB3] flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#231C14] flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onSelectEntity(sEnt.id)}
                          className="hover:text-[#9E2A2B] underline decoration-[#D8CBB3] underline-offset-4 cursor-pointer"
                        >
                          {sEnt.title}
                        </button>
                        <span className="text-[#9E2A2B]">↔</span>
                        <button
                          type="button"
                          onClick={() => onSelectEntity(tEnt.id)}
                          className="hover:text-[#9E2A2B] underline decoration-[#D8CBB3] underline-offset-4 cursor-pointer"
                        >
                          {tEnt.title}
                        </button>
                      </div>
                      <p className="text-[11px] text-[#695A47] mt-0.5">
                        <strong className="text-[#9E2A2B]">{rel.label}:</strong>{' '}
                        {rel.notes}
                      </p>
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
