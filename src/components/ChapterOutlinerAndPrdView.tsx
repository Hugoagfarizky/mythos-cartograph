import React, { useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  BookOpen,
  Check,
  Clock,
  Compass,
  Edit3,
  EyeOff,
  FilePlus2,
  Flame,
  Globe,
  Link2,
  MapPin,
  Plus,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  User,
  X,
  Zap,
} from 'lucide-react';
import {
  ChapterOutline,
  ChapterScene,
  LoreCategory,
  LoreEntity,
  WorldProject,
} from '../types/world';
import {
  CATEGORY_META,
  FantasySectionDivider,
  OrnateCornerFiligree,
  WikiTextRenderer,
} from './WikiTextRenderer';

interface ChapterOutlinerViewProps {
  chapters: ChapterOutline[];
  entities: LoreEntity[];
  selectedChapterId: string;
  onSelectChapter: (id: string) => void;
  onUpdateChapters: (next: ChapterOutline[]) => void;
  onSelectEntity: (id: string) => void;
  onRunAuditOnChapter: (chapter: ChapterOutline) => void;
}

const CHAPTER_STATUS_OPTIONS: Array<ChapterOutline['status']> = [
  'Rencana',
  'Sedang Ditulis',
  'Revisi',
  'Selesai',
];

const ACT_PRESETS = [
  'Babak I: Bayang-Bayang di Atas Kertas Perkamen',
  'Babak II: Bara di Bawah Kubah Besi & Rimba Kabut',
  'Babak III: Konvergensi Takhta & Gerhana Kedua',
];

export const ChapterOutlinerView: React.FC<ChapterOutlinerViewProps> = ({
  chapters,
  entities,
  selectedChapterId,
  onSelectChapter,
  onUpdateChapters,
  onSelectEntity,
  onRunAuditOnChapter,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Left Directory Filter State
  const [chapterSearch, setChapterSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [actFilter, setActFilter] = useState<string>('ALL');

  // Quick Wiki-Link Inserter Filter in Manuscript Editor
  const [wikiInsertCategory, setWikiInsertCategory] = useState<string>('ALL');
  const [syncNotice, setSyncNotice] = useState<string>('');

  // Scene Creator / Editor State
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);
  const [showSceneForm, setShowSceneForm] = useState<boolean>(false);
  const [newSceneTitle, setNewSceneTitle] = useState<string>('');
  const [newScenePov, setNewScenePov] = useState<string>('');
  const [newSceneRegion, setNewSceneRegion] = useState<string>('');
  const [newSceneTimeOfDay, setNewSceneTimeOfDay] = useState<string>('');
  const [newSceneSummary, setNewSceneSummary] = useState<string>('');
  const [newSceneGoalConflict, setNewSceneGoalConflict] = useState<string>('');
  const [newSceneOutcome, setNewSceneOutcome] = useState<string>('');

  // Categorized entity lists for Hybrid Pickers
  const characterEntities = useMemo(
    () => entities.filter((e) => e.category === 'character'),
    [entities]
  );
  const locationEntities = useMemo(
    () =>
      entities.filter((e) => e.category === 'region' || e.category === 'nation'),
    [entities]
  );

  // Unique Acts across chapters + presets
  const availableActs = useMemo(() => {
    const set = new Set<string>(ACT_PRESETS);
    chapters.forEach((c) => {
      if (c.act && c.act.trim()) set.add(c.act.trim());
    });
    return Array.from(set);
  }, [chapters]);

  // Filtered Chapters for Left Directory
  const filteredChapters = useMemo(() => {
    return chapters.filter((ch) => {
      if (statusFilter !== 'ALL' && ch.status !== statusFilter) return false;
      if (actFilter !== 'ALL' && ch.act !== actFilter) return false;
      if (!chapterSearch.trim()) return true;
      const q = chapterSearch.toLowerCase();
      return (
        ch.title.toLowerCase().includes(q) ||
        ch.synopsis.toLowerCase().includes(q) ||
        ch.draftNotes.toLowerCase().includes(q) ||
        (ch.primaryPov || '').toLowerCase().includes(q) ||
        (ch.primaryLocation || '').toLowerCase().includes(q) ||
        (ch.storyDateOrTime || '').toLowerCase().includes(q) ||
        (ch.chapterGoal || '').toLowerCase().includes(q) ||
        (ch.centralConflict || '').toLowerCase().includes(q) ||
        (ch.endingHookOrTwist || '').toLowerCase().includes(q) ||
        ch.scenes.some(
          (sc) =>
            sc.title.toLowerCase().includes(q) ||
            sc.povCharacter.toLowerCase().includes(q) ||
            sc.settingRegion.toLowerCase().includes(q) ||
            sc.summary.toLowerCase().includes(q)
        )
      );
    });
  }, [chapters, statusFilter, actFilter, chapterSearch]);

  const activeChapter =
    chapters.find((c) => c.id === selectedChapterId) ||
    filteredChapters[0] ||
    chapters[0] ||
    null;

  // Helper to match an entity by title or partial title
  const findMatchingEntityByName = (
    rawName: string | undefined,
    preferredCategory?: LoreCategory
  ): LoreEntity | undefined => {
    if (!rawName) return undefined;
    const clean = rawName.trim().toLowerCase();
    if (!clean || clean.length < 3) return undefined;
    if (preferredCategory) {
      const exactCat = entities.find(
        (e) =>
          e.category === preferredCategory &&
          (e.title.toLowerCase() === clean ||
            clean.includes(e.title.toLowerCase()) ||
            e.title.toLowerCase().includes(clean))
      );
      if (exactCat) return exactCat;
    }
    return entities.find(
      (e) =>
        e.title.toLowerCase() === clean ||
        clean.includes(e.title.toLowerCase()) ||
        e.title.toLowerCase().includes(clean)
    );
  };

  // Automatic Detector of [[Entity]] mentions inside activeChapter's text fields, POV & Locations
  const autoDetectedEntities = useMemo(() => {
    if (!activeChapter) return [];
    const combinedText = [
      activeChapter.synopsis,
      activeChapter.draftNotes,
      activeChapter.chapterGoal || '',
      activeChapter.centralConflict || '',
      activeChapter.endingHookOrTwist || '',
      activeChapter.foreshadowingNotes || '',
      activeChapter.primaryPov ? `[[${activeChapter.primaryPov}]]` : '',
      activeChapter.primaryLocation
        ? `[[${activeChapter.primaryLocation}]]`
        : '',
      ...activeChapter.scenes.flatMap((sc) => [
        sc.summary,
        sc.sceneGoalOrConflict || '',
        sc.sceneOutcome || '',
        sc.povCharacter ? `[[${sc.povCharacter}]]` : '',
        sc.settingRegion ? `[[${sc.settingRegion}]]` : '',
      ]),
    ]
      .join(' ')
      .toLowerCase();

    return entities.filter((ent) => {
      const titleLower = ent.title.toLowerCase();
      return (
        combinedText.includes(`[[${titleLower}]]`) ||
        (activeChapter.primaryPov &&
          activeChapter.primaryPov.toLowerCase() === titleLower) ||
        (activeChapter.primaryLocation &&
          activeChapter.primaryLocation.toLowerCase() === titleLower)
      );
    });
  }, [activeChapter, entities]);

  const unlinkedDetectedEntities = useMemo(() => {
    if (!activeChapter) return [];
    return autoDetectedEntities.filter(
      (ent) => !activeChapter.featuredEntityIds.includes(ent.id)
    );
  }, [autoDetectedEntities, activeChapter]);

  const handleAddChapter = () => {
    const nextNum = chapters.length + 1;
    const defaultPov = characterEntities[0]?.title || 'Archmage Vaelen Thorne';
    const defaultLoc = locationEntities[0]?.title || 'Puncak Wyvern';
    const created: ChapterOutline = {
      id: `chap-${Date.now()}`,
      chapterNumber: nextNum,
      act:
        actFilter !== 'ALL'
          ? actFilter
          : 'Babak I: Bayang-Bayang di Atas Kertas Perkamen',
      title: `Bab Baru ${nextNum}`,
      status: 'Rencana',
      storyDateOrTime: 'Tahun 412 PG · Malam Bulan Kedua Belas',
      primaryPov: defaultPov,
      primaryLocation: defaultLoc,
      synopsis: 'Ringkasan konflik dan tujuan naratif pada bab ini.',
      chapterGoal: `Tujuan utama yang ingin dicapai [[${defaultPov}]] di [[${defaultLoc}]].`,
      centralConflict:
        'Rintangan, musuh, atau dilema moral yang menghalangi tercapainya tujuan bab.',
      endingHookOrTwist:
        'Kejutan akhir bab (cliffhanger) atau pengungkapan rahasia lore.',
      foreshadowingNotes:
        'Petunjuk halus (foreshadowing) yang ditanam di bab ini untuk klimaks cerita.',
      draftNotes: `Tuliskan draf adegan atau naskah bab di sini. Gunakan tanda kurung ganda seperti [[${defaultPov}]] atau [[${defaultLoc}]] untuk menautkan entitas World Bible secara otomatis.`,
      featuredEntityIds: [],
      wordCountTarget: 3500,
      currentWordCount: 450,
      scenes: [],
    };
    onUpdateChapters([...chapters, created]);
    onSelectChapter(created.id);
    setIsEditing(true);
  };

  const handleUpdateActiveChapter = (patch: Partial<ChapterOutline>) => {
    if (!activeChapter) return;
    onUpdateChapters(
      chapters.map((c) => (c.id === activeChapter.id ? { ...c, ...patch } : c))
    );
  };

  const handleMoveChapter = (chapterId: string, direction: -1 | 1) => {
    const index = chapters.findIndex((c) => c.id === chapterId);
    if (index === -1) return;
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= chapters.length) return;
    const copy = [...chapters];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);
    const renumbered = copy.map((ch, idx) => ({
      ...ch,
      chapterNumber: idx + 1,
    }));
    onUpdateChapters(renumbered);
  };

  const handleDeleteChapter = (chapterId: string) => {
    if (chapters.length <= 1) return;
    const remaining = chapters
      .filter((c) => c.id !== chapterId)
      .map((ch, idx) => ({
        ...ch,
        chapterNumber: idx + 1,
      }));
    onUpdateChapters(remaining);
    if (selectedChapterId === chapterId && remaining[0]) {
      onSelectChapter(remaining[0].id);
    }
  };

  const resetSceneForm = () => {
    setEditingSceneId(null);
    setNewSceneTitle('');
    setNewScenePov(
      activeChapter?.primaryPov || characterEntities[0]?.title || ''
    );
    setNewSceneRegion(
      activeChapter?.primaryLocation || locationEntities[0]?.title || ''
    );
    setNewSceneTimeOfDay('');
    setNewSceneSummary('');
    setNewSceneGoalConflict('');
    setNewSceneOutcome('');
    setShowSceneForm(false);
  };

  const startEditingScene = (sc: ChapterScene) => {
    setEditingSceneId(sc.id);
    setNewSceneTitle(sc.title);
    setNewScenePov(sc.povCharacter);
    setNewSceneRegion(sc.settingRegion);
    setNewSceneTimeOfDay(sc.timeOfDay || '');
    setNewSceneSummary(sc.summary);
    setNewSceneGoalConflict(sc.sceneGoalOrConflict || '');
    setNewSceneOutcome(sc.sceneOutcome || '');
    setShowSceneForm(true);
  };

  const handleSaveScene = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChapter || !newSceneTitle.trim()) return;

    if (editingSceneId) {
      const updatedScenes = activeChapter.scenes.map((sc) =>
        sc.id === editingSceneId
          ? {
              ...sc,
              title: newSceneTitle.trim(),
              povCharacter:
                newScenePov.trim() ||
                activeChapter.primaryPov ||
                'Sudut Pandang Utama',
              settingRegion:
                newSceneRegion.trim() ||
                activeChapter.primaryLocation ||
                'Lokasi Bab',
              timeOfDay: newSceneTimeOfDay.trim() || undefined,
              summary: newSceneSummary.trim() || 'Rincian jalannya adegan.',
              sceneGoalOrConflict: newSceneGoalConflict.trim() || undefined,
              sceneOutcome: newSceneOutcome.trim() || undefined,
            }
          : sc
      );
      handleUpdateActiveChapter({ scenes: updatedScenes });
      setSyncNotice('Rincian adegan berhasil diperbarui!');
      resetSceneForm();
    } else {
      const nextScene: ChapterScene = {
        id: `sc-${Date.now()}`,
        title: newSceneTitle.trim(),
        povCharacter:
          newScenePov.trim() ||
          activeChapter.primaryPov ||
          'Sudut Pandang Utama',
        settingRegion:
          newSceneRegion.trim() ||
          activeChapter.primaryLocation ||
          'Lokasi Bab',
        timeOfDay: newSceneTimeOfDay.trim() || undefined,
        summary: newSceneSummary.trim() || 'Rincian jalannya adegan.',
        sceneGoalOrConflict: newSceneGoalConflict.trim() || undefined,
        sceneOutcome: newSceneOutcome.trim() || undefined,
      };
      handleUpdateActiveChapter({
        scenes: [...activeChapter.scenes, nextScene],
      });
      setSyncNotice(`Adegan "${nextScene.title}" ditambahkan ke bab ini!`);
      resetSceneForm();
    }
  };

  const handleMoveScene = (sceneId: string, direction: -1 | 1) => {
    if (!activeChapter) return;
    const idx = activeChapter.scenes.findIndex((s) => s.id === sceneId);
    if (idx === -1) return;
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= activeChapter.scenes.length) return;
    const copy = [...activeChapter.scenes];
    const [moved] = copy.splice(idx, 1);
    copy.splice(targetIdx, 0, moved);
    handleUpdateActiveChapter({ scenes: copy });
  };

  const toggleFeaturedEntity = (entityId: string) => {
    if (!activeChapter) return;
    const exists = activeChapter.featuredEntityIds.includes(entityId);
    const nextIds = exists
      ? activeChapter.featuredEntityIds.filter((id) => id !== entityId)
      : [...activeChapter.featuredEntityIds, entityId];
    handleUpdateActiveChapter({ featuredEntityIds: nextIds });
  };

  const handleSyncAllDetectedEntities = () => {
    if (!activeChapter || unlinkedDetectedEntities.length === 0) return;
    const mergedIds = Array.from(
      new Set([
        ...activeChapter.featuredEntityIds,
        ...unlinkedDetectedEntities.map((e) => e.id),
      ])
    );
    handleUpdateActiveChapter({ featuredEntityIds: mergedIds });
    setSyncNotice(
      `Berhasil menautkan ${unlinkedDetectedEntities.length} entitas yang terdeteksi dari teks bab!`
    );
  };

  const insertWikiLinkIntoDraft = (entityTitle: string) => {
    if (!activeChapter) return;
    const nextDraft = `${activeChapter.draftNotes} [[${entityTitle}]]`;
    const nextFeatured = Array.from(
      new Set([
        ...activeChapter.featuredEntityIds,
        ...(entities.find((e) => e.title === entityTitle)
          ? [entities.find((e) => e.title === entityTitle)!.id]
          : []),
      ])
    );
    handleUpdateActiveChapter({
      draftNotes: nextDraft,
      featuredEntityIds: nextFeatured,
    });
  };

  const totalWords = chapters.reduce((acc, c) => acc + c.currentWordCount, 0);
  const totalTarget = Math.max(
    1,
    chapters.reduce((acc, c) => acc + c.wordCountTarget, 0)
  );
  const totalProgressPct = Math.min(
    100,
    Math.round((totalWords / totalTarget) * 100)
  );
  const completedCount = chapters.filter((c) => c.status === 'Selesai').length;
  const totalScenesCount = chapters.reduce(
    (acc, c) => acc + c.scenes.length,
    0
  );

  return (
    <div className="space-y-5">
      {/* =================================================================== */}
      {/* HEADER BAR & NOVEL MANUSCRIPT PROGRESS TELEMETRY                    */}
      {/* =================================================================== */}
      <div className="bg-[#FBF8F1] border border-[#D8CBB3] rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-[#9E2A2B]">
              Studio Manuskrip & Alur Novel · {chapters.length} Bab ·{' '}
              {totalScenesCount} Adegan Terjadwal
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#231C14]">
              Alur Bab, Struktur Dramaturgi & Manuskrip Cerita
            </h2>
            <p className="text-xs sm:text-sm text-[#695A47] mt-0.5">
              Rancang tujuan naratif tiap bab, susun urutan adegan (*scene
              beats*) dengan tokoh POV dan lokasi World Bible, serta pantau
              target kata novel Anda.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddChapter}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#9E2A2B] text-white hover:bg-[#7E2021] flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Bab Baru</span>
          </button>
        </div>

        {/* Summary Metrics & Overall Progress Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          <div className="p-3 rounded-lg bg-[#F6F1E6] border border-[#D8CBB3] space-y-1.5 sm:col-span-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#695A47] font-medium">
                Total Progres Kata Manuskrip
              </span>
              <span className="font-mono-tabular font-bold text-[#231C14]">
                {totalWords.toLocaleString('id-ID')} /{' '}
                {totalTarget.toLocaleString('id-ID')} kata ({totalProgressPct}%)
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-[#EFE7D6] border border-[#D8CBB3] overflow-hidden">
              <div
                className="h-full bg-[#9E2A2B] transition-all"
                style={{ width: `${totalProgressPct}%` }}
              />
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#F6F1E6] border border-[#D8CBB3]">
            <div className="text-[11px] text-[#695A47]">
              Status Penyelesaian Bab
            </div>
            <div className="font-display text-xl font-bold text-[#2D5A43] font-mono-tabular">
              {completedCount} / {chapters.length} Bab Selesai
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#F6F1E6] border border-[#D8CBB3]">
            <div className="text-[11px] text-[#695A47]">
              Total Rangkaian Adegan
            </div>
            <div className="font-display text-xl font-bold text-[#8F5B14] font-mono-tabular">
              {totalScenesCount} Adegan (Scene Beats)
            </div>
          </div>
        </div>

        {syncNotice && (
          <div className="p-3 rounded-lg bg-[#EFE7D6] border border-[#2D5A43]/40 text-xs font-semibold text-[#2D5A43] flex items-center justify-between">
            <span>{syncNotice}</span>
            <button
              type="button"
              onClick={() => setSyncNotice('')}
              className="text-[#695A47] hover:text-[#231C14] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* MAIN SPLIT: LEFT CHAPTER DIRECTORY (4 COLS) + RIGHT STUDIO (8 COLS) */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Chapter List with Search, Act Filter, Status Filter & Reorder */}
        <div className="lg:col-span-4 bg-[#FBF8F1] border border-[#D8CBB3] rounded-xl p-4 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#695A47] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={chapterSearch}
              onChange={(e) => setChapterSearch(e.target.value)}
              placeholder="Cari judul bab, tokoh POV, lokasi, atau isi..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg text-[#231C14] placeholder:text-[#695A47] focus:outline-none focus:border-[#9E2A2B]"
            />
          </div>

          {/* Status Filter Buttons */}
          <div className="space-y-1.5 pt-1">
            <div className="text-[11px] font-semibold text-[#695A47]">
              Filter Status Penulisan:
            </div>
            <div className="flex flex-wrap items-center gap-1">
              {(['ALL', ...CHAPTER_STATUS_OPTIONS] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                    statusFilter === st
                      ? 'bg-[#9E2A2B] text-white'
                      : 'bg-[#F6F1E6] text-[#695A47] hover:text-[#231C14] border border-[#D8CBB3]'
                  }`}
                >
                  {st === 'ALL' ? 'Semua' : st}
                </button>
              ))}
            </div>
          </div>

          {/* Act Filter Dropdown */}
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-[11px] text-[#695A47] font-semibold whitespace-nowrap">
              Filter Babak:
            </span>
            <select
              value={actFilter}
              onChange={(e) => setActFilter(e.target.value)}
              className="flex-1 px-2.5 py-1 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg text-[#231C14]"
            >
              <option value="ALL">Semua Babak (Act)</option>
              {availableActs.map((act) => (
                <option key={act} value={act}>
                  {act}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs font-semibold text-[#695A47] flex items-center justify-between px-1 pt-1">
            <span>Daftar Bab Cerita ({filteredChapters.length})</span>
            <span className="font-mono-tabular text-[11px]">
              Urutkan ↑↓ / Klik detail
            </span>
          </div>

          <div className="space-y-2.5 max-h-[680px] overflow-y-auto pr-1">
            {filteredChapters.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <p className="text-xs text-[#695A47]">
                  Tidak ada bab yang cocok dengan filter pencarian.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setChapterSearch('');
                    setStatusFilter('ALL');
                    setActFilter('ALL');
                  }}
                  className="px-3 py-1 text-xs font-semibold bg-[#231C14] text-[#FBF8F1] rounded cursor-pointer"
                >
                  Reset Filter
                </button>
              </div>
            ) : (
              filteredChapters.map((ch) => {
                const isSelected = activeChapter?.id === ch.id;
                const fullIdx = chapters.findIndex((x) => x.id === ch.id);
                const chPct = Math.min(
                  100,
                  Math.round(
                    (ch.currentWordCount / Math.max(1, ch.wordCountTarget)) *
                      100
                  )
                );
                return (
                  <div
                    key={ch.id}
                    onClick={() => {
                      onSelectChapter(ch.id);
                      setIsEditing(false);
                      setShowSceneForm(false);
                      setEditingSceneId(null);
                    }}
                    className={`arcana-card w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? 'bg-[#EFE7D6] border-2 border-[#9E2A2B] shadow-xs'
                        : 'bg-[#F6F1E6] border-[#B5832A]/45 hover:bg-[#EFE7D6]/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-[11px] text-[#695A47]">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-epic font-bold text-[#9E2A2B]">
                          ❖ Bab {ch.chapterNumber}
                        </span>
                        <span>·</span>
                        <span
                          className={`font-semibold ${
                            ch.status === 'Selesai'
                              ? 'text-[#2D5A43]'
                              : ch.status === 'Sedang Ditulis'
                              ? 'text-[#8F5B14]'
                              : 'text-[#695A47]'
                          }`}
                        >
                          {ch.status}
                        </span>
                      </div>

                      {/* Chapter Reorder Controls */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          disabled={fullIdx <= 0}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveChapter(ch.id, -1);
                          }}
                          className="p-0.5 rounded hover:bg-[#D8CBB3] disabled:opacity-30 cursor-pointer"
                          title="Geser urutan bab ke atas"
                        >
                          <ArrowUp className="w-3 h-3 text-[#231C14]" />
                        </button>
                        <button
                          type="button"
                          disabled={fullIdx >= chapters.length - 1}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveChapter(ch.id, 1);
                          }}
                          className="p-0.5 rounded hover:bg-[#D8CBB3] disabled:opacity-30 cursor-pointer"
                          title="Geser urutan bab ke bawah"
                        >
                          <ArrowDown className="w-3 h-3 text-[#231C14]" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="font-display text-lg font-bold text-[#231C14] leading-snug">
                        {ch.title}
                      </div>
                      {(ch.primaryPov || ch.primaryLocation) && (
                        <div className="text-[11px] text-[#695A47] truncate mt-0.5">
                          {ch.primaryPov ? `POV: ${ch.primaryPov}` : ''}
                          {ch.primaryPov && ch.primaryLocation ? ' · ' : ''}
                          {ch.primaryLocation
                            ? `Latar: ${ch.primaryLocation}`
                            : ''}
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-[#695A47] line-clamp-2">
                      {ch.synopsis}
                    </p>

                    {/* Mini Word Count Progress Bar */}
                    <div className="space-y-1 pt-0.5">
                      <div className="flex items-center justify-between text-[10px] text-[#695A47] font-mono-tabular">
                        <span>{ch.scenes.length} Adegan</span>
                        <span>
                          {ch.currentWordCount.toLocaleString('id-ID')} /{' '}
                          {ch.wordCountTarget.toLocaleString('id-ID')} kata (
                          {chPct}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-[#FBF8F1] border border-[#D8CBB3] overflow-hidden">
                        <div
                          className={`h-full ${
                            ch.status === 'Selesai'
                              ? 'bg-[#2D5A43]'
                              : 'bg-[#9E2A2B]'
                          }`}
                          style={{ width: `${chPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ================================================================= */}
        {/* RIGHT CHAPTER DETAIL, DRAMATURGY DOSSIER & SCENE STUDIO (8 COLS)  */}
        {/* ================================================================= */}
        <div className="relative overflow-hidden lg:col-span-8 bg-[#FBF8F1] border-2 border-[#B5832A]/45 rounded-xl p-6 shadow-xs">
          <OrnateCornerFiligree className="text-[#B5832A]/50" />
          {activeChapter ? (
            <div className="space-y-6">
              {/* Chapter Header & Action Toolbar */}
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#D8CBB3] pb-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#695A47] font-medium">
                    <span className="font-epic font-bold text-[#9E2A2B]">
                      ❖ {activeChapter.act}
                    </span>
                    <span>·</span>
                    <span className="font-semibold text-[#231C14]">
                      Status: {activeChapter.status}
                    </span>
                    {activeChapter.storyDateOrTime && (
                      <>
                        <span>·</span>
                        <span className="font-mono-tabular text-[#7A3E1D] font-semibold">
                          {activeChapter.storyDateOrTime}
                        </span>
                      </>
                    )}
                  </div>
                  <h3 className="font-cartography text-2xl sm:text-3xl font-bold text-[#231C14]">
                    Bab {activeChapter.chapterNumber}: {activeChapter.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onRunAuditOnChapter(activeChapter)}
                    className="px-3 py-1.5 text-xs font-semibold border border-[#B5832A] bg-[#F6F1E6] text-[#231C14] hover:bg-[#EFE7D6] rounded-lg flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#9E2A2B]" />
                    <span>Audit Konsistensi Bab (AI)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing((prev) => !prev)}
                    className="px-3.5 py-1.5 text-xs font-semibold bg-[#231C14] text-[#FBF8F1] hover:bg-[#3A2E21] rounded-lg flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#B5832A]" />
                    <span>{isEditing ? 'Selesai Sunting' : 'Sunting Bab'}</span>
                  </button>
                  {chapters.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteChapter(activeChapter.id)}
                      className="p-1.5 text-[#9E2A2B] border border-[#9E2A2B]/30 rounded-lg hover:bg-[#9E2A2B]/10 cursor-pointer"
                      title="Hapus bab ini"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* =========================================================== */}
              {/* CHAPTER EDITOR MODE                                         */}
              {/* =========================================================== */}
              {isEditing ? (
                <div className="space-y-5 bg-[#F6F1E6] p-5 rounded-xl border border-[#D8CBB3]">
                  {/* Section 1: Identitas Bab, Babak, Status, Waktu Cerita, POV & Lokasi Utama */}
                  <div className="space-y-3">
                    <div className="text-xs font-semibold text-[#9E2A2B] flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>
                        1. Identitas Bab, Penanggalan Cerita, Sudut Pandang
                        (POV) & Lokasi Utama
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="md:col-span-2">
                        <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                          Judul Bab
                        </label>
                        <input
                          type="text"
                          value={activeChapter.title}
                          onChange={(e) =>
                            handleUpdateActiveChapter({ title: e.target.value })
                          }
                          className="w-full px-3 py-1.5 text-sm bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg font-semibold text-[#231C14]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                          Status Penulisan
                        </label>
                        <select
                          value={activeChapter.status}
                          onChange={(e) =>
                            handleUpdateActiveChapter({
                              status: e.target
                                .value as ChapterOutline['status'],
                            })
                          }
                          className="w-full px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg font-semibold"
                        >
                          {CHAPTER_STATUS_OPTIONS.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                          Babak / Act Cerita (Pilih Preset atau Ketik)
                        </label>
                        <div className="space-y-1">
                          <select
                            value=""
                            onChange={(e) => {
                              if (!e.target.value) return;
                              handleUpdateActiveChapter({
                                act: e.target.value,
                              });
                            }}
                            className="w-full px-2.5 py-1 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                          >
                            <option value="">-- Pilih Preset Babak --</option>
                            {availableActs.map((act) => (
                              <option key={act} value={act}>
                                {act}
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={activeChapter.act}
                            onChange={(e) =>
                              handleUpdateActiveChapter({ act: e.target.value })
                            }
                            placeholder="Atau ketik nama babak..."
                            className="w-full px-2.5 py-1 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                          Penanggalan Waktu Cerita pada Bab Ini
                        </label>
                        <input
                          type="text"
                          value={activeChapter.storyDateOrTime || ''}
                          onChange={(e) =>
                            handleUpdateActiveChapter({
                              storyDateOrTime: e.target.value,
                            })
                          }
                          placeholder="Contoh: Tahun 412 PG · Malam Badai Salju Bulan Kesebelas"
                          className="w-full px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Hybrid Picker for Primary POV Character */}
                      <div>
                        <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                          Tokoh Sudut Pandang Utama / Primary POV (Pilih
                          Character / Ketik)
                        </label>
                        <div className="space-y-1">
                          {characterEntities.length > 0 && (
                            <select
                              value=""
                              onChange={(e) => {
                                if (!e.target.value) return;
                                handleUpdateActiveChapter({
                                  primaryPov: e.target.value,
                                });
                              }}
                              className="w-full px-2.5 py-1 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg text-[#231C14]"
                            >
                              <option value="">
                                -- Pilih dari Tab Character --
                              </option>
                              {characterEntities.map((c) => (
                                <option key={c.id} value={c.title}>
                                  {c.title} ({c.attributes.role || 'Tokoh'})
                                </option>
                              ))}
                            </select>
                          )}
                          <input
                            type="text"
                            value={activeChapter.primaryPov || ''}
                            onChange={(e) =>
                              handleUpdateActiveChapter({
                                primaryPov: e.target.value,
                              })
                            }
                            placeholder="Ketik nama tokoh POV..."
                            className="w-full px-2.5 py-1 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                          />
                        </div>
                      </div>

                      {/* Hybrid Picker for Primary Location */}
                      <div>
                        <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                          Lokasi Utama Bab (Pilih Wilayah / Negara / Ketik)
                        </label>
                        <div className="space-y-1">
                          {locationEntities.length > 0 && (
                            <select
                              value=""
                              onChange={(e) => {
                                if (!e.target.value) return;
                                handleUpdateActiveChapter({
                                  primaryLocation: e.target.value,
                                });
                              }}
                              className="w-full px-2.5 py-1 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg text-[#231C14]"
                            >
                              <option value="">
                                -- Pilih dari Tab Wilayah / Negara --
                              </option>
                              {locationEntities.map((loc) => (
                                <option key={loc.id} value={loc.title}>
                                  [{CATEGORY_META[loc.category].singular}]{' '}
                                  {loc.title}
                                </option>
                              ))}
                            </select>
                          )}
                          <input
                            type="text"
                            value={activeChapter.primaryLocation || ''}
                            onChange={(e) =>
                              handleUpdateActiveChapter({
                                primaryLocation: e.target.value,
                              })
                            }
                            placeholder="Ketik nama lokasi bab..."
                            className="w-full px-2.5 py-1 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Word Count Target & Current Word Count Controls */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-lg bg-[#FBF8F1] border border-[#D8CBB3]">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                          Jumlah Kata Saat Ini
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={activeChapter.currentWordCount}
                          onChange={(e) =>
                            handleUpdateActiveChapter({
                              currentWordCount: Math.max(
                                0,
                                Number(e.target.value)
                              ),
                            })
                          }
                          className="w-full px-2.5 py-1 text-xs font-mono-tabular font-semibold bg-[#F6F1E6] border border-[#D8CBB3] rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                          Target Kata Bab Ini
                        </label>
                        <input
                          type="number"
                          min={100}
                          step={100}
                          value={activeChapter.wordCountTarget}
                          onChange={(e) =>
                            handleUpdateActiveChapter({
                              wordCountTarget: Math.max(
                                100,
                                Number(e.target.value)
                              ),
                            })
                          }
                          className="w-full px-2.5 py-1 text-xs font-mono-tabular font-semibold bg-[#F6F1E6] border border-[#D8CBB3] rounded"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => {
                            const rawWords = activeChapter.draftNotes
                              .trim()
                              .split(/\s+/)
                              .filter(Boolean).length;
                            handleUpdateActiveChapter({
                              currentWordCount: rawWords,
                            });
                            setSyncNotice(
                              `Jumlah kata dihitung ulang dari panjang teks draf (${rawWords} kata murni).`
                            );
                          }}
                          className="w-full px-2.5 py-1.5 text-[11px] font-semibold bg-[#EFE7D6] hover:bg-[#D8CBB3] border border-[#D8CBB3] rounded text-[#231C14] cursor-pointer"
                        >
                          Hitung Kata Asli Draf
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                        Sinopsis Eksekutif Bab
                      </label>
                      <textarea
                        rows={2}
                        value={activeChapter.synopsis}
                        onChange={(e) =>
                          handleUpdateActiveChapter({
                            synopsis: e.target.value,
                          })
                        }
                        className="w-full p-2.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Section 2: Anatomi Dramaturgi Bab (Goal, Conflict, Cliffhanger, Foreshadowing) */}
                  <div className="space-y-3 pt-3 border-t border-[#D8CBB3]">
                    <div className="text-xs font-semibold text-[#8F5B14] flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-[#9E2A2B]" />
                      <span>
                        2. Dossier Dramaturgi Bab: Tujuan, Konflik Utama,
                        Cliffhanger & Foreshadowing
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#2D5A43] mb-1">
                          Tujuan Naratif Bab (Chapter Goal)
                        </label>
                        <textarea
                          rows={2}
                          value={activeChapter.chapterGoal || ''}
                          onChange={(e) =>
                            handleUpdateActiveChapter({
                              chapterGoal: e.target.value,
                            })
                          }
                          placeholder="Apa misi tokoh POV atau tujuan perkembangan plot yang harus dicapai di bab ini..."
                          className="w-full p-2.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#9E2A2B] mb-1">
                          Konflik & Rintangan Utama (Central Conflict)
                        </label>
                        <textarea
                          rows={2}
                          value={activeChapter.centralConflict || ''}
                          onChange={(e) =>
                            handleUpdateActiveChapter({
                              centralConflict: e.target.value,
                            })
                          }
                          placeholder="Ancaman, benturan kepentingan, atau batasan sihir yang menghalangi tokoh..."
                          className="w-full p-2.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#7A3E1D] mb-1">
                          Cliffhanger / Pengungkapan Lore Akhir Bab (Ending
                          Hook)
                        </label>
                        <textarea
                          rows={2}
                          value={activeChapter.endingHookOrTwist || ''}
                          onChange={(e) =>
                            handleUpdateActiveChapter({
                              endingHookOrTwist: e.target.value,
                            })
                          }
                          placeholder="Kejutan atau pengungkapan di kalimat terakhir yang membuat pembaca penasaran..."
                          className="w-full p-2.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#264653] mb-1">
                          Catatan Revisi & Foreshadowing Rahasia Penulis
                        </label>
                        <textarea
                          rows={2}
                          value={activeChapter.foreshadowingNotes || ''}
                          onChange={(e) =>
                            handleUpdateActiveChapter({
                              foreshadowingNotes: e.target.value,
                            })
                          }
                          placeholder="Petunjuk tersembunyi (foreshadowing) yang ditanam atau catatan revisi alur..."
                          className="w-full p-2.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Studio Manuskrip & Bilah Sisipkan Cepat [[Entitas]] */}
                  <div className="space-y-2.5 pt-3 border-t border-[#D8CBB3]">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className="text-xs font-semibold text-[#231C14]">
                        3. Naskah Bab & Draf Adegan (Gunakan [[Nama Entitas]]
                        untuk Cross-Link Otomatis)
                      </label>

                      <div className="flex items-center gap-1">
                        <span className="text-[11px] text-[#695A47]">
                          Filter Tautan Cepat:
                        </span>
                        {(
                          [
                            { id: 'ALL', label: 'Semua' },
                            { id: 'character', label: 'Tokoh' },
                            { id: 'region', label: 'Wilayah' },
                            { id: 'nation', label: 'Negara' },
                            { id: 'encyclopedia', label: 'Pusaka/Biota' },
                            { id: 'skill', label: 'Skill' },
                            { id: 'history', label: 'Sejarah' },
                          ] as const
                        ).map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setWikiInsertCategory(cat.id)}
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold cursor-pointer ${
                              wikiInsertCategory === cat.id
                                ? 'bg-[#231C14] text-[#FBF8F1]'
                                : 'bg-[#EFE7D6] text-[#695A47] hover:text-[#231C14]'
                            }`}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quick Insert [[Entity]] Buttons */}
                    <div className="flex flex-wrap gap-1.5 p-2.5 rounded-lg bg-[#FBF8F1] border border-[#D8CBB3] max-h-24 overflow-y-auto">
                      {entities
                        .filter(
                          (e) =>
                            wikiInsertCategory === 'ALL' ||
                            e.category === wikiInsertCategory
                        )
                        .map((ent) => (
                          <button
                            key={ent.id}
                            type="button"
                            onClick={() => insertWikiLinkIntoDraft(ent.title)}
                            className="px-2 py-0.5 text-[11px] bg-[#EFE7D6] hover:bg-[#D8CBB3] text-[#231C14] rounded border border-[#D8CBB3] font-medium cursor-pointer"
                            title={`Sisipkan [[${ent.title}]] ke dalam naskah`}
                          >
                            +[[{ent.title}]]
                          </button>
                        ))}
                    </div>

                    <textarea
                      rows={8}
                      value={activeChapter.draftNotes}
                      onChange={(e) =>
                        handleUpdateActiveChapter({
                          draftNotes: e.target.value,
                        })
                      }
                      className="w-full p-3.5 text-sm bg-[#FBF8F1] border border-[#D8CBB3] rounded-xl text-[#231C14] leading-relaxed focus:outline-none focus:border-[#9E2A2B]"
                    />
                  </div>

                  {/* Manual Multi-Select Featured Entities */}
                  <div className="space-y-2 pt-2">
                    <label className="block text-xs font-semibold text-[#695A47]">
                      Pilih Entitas World Bible yang Terlibat di Bab Ini (
                      {activeChapter.featuredEntityIds.length} Terpilih):
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {entities.map((ent) => {
                        const active = activeChapter.featuredEntityIds.includes(
                          ent.id
                        );
                        return (
                          <button
                            key={ent.id}
                            type="button"
                            onClick={() => toggleFeaturedEntity(ent.id)}
                            className={`px-2.5 py-1 rounded text-xs font-medium border cursor-pointer ${
                              active
                                ? 'bg-[#9E2A2B] text-white border-[#9E2A2B]'
                                : 'bg-[#FBF8F1] text-[#231C14] border-[#D8CBB3] hover:bg-[#EFE7D6]'
                            }`}
                          >
                            {active ? '✓ ' : '+ '}[
                            {CATEGORY_META[ent.category].singular}] {ent.title}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                /* ========================================================= */
                /* CHAPTER VIEW MODE                                         */
                /* ========================================================= */
                <div className="space-y-5">
                  {/* Context Strip: Primary POV, Primary Location & Word Count Progress */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3]">
                      <div className="text-[11px] text-[#695A47] flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-[#9E2A2B]" />
                        <span>Tokoh Sudut Pandang Utama (POV)</span>
                      </div>
                      {(() => {
                        const matchedPov = findMatchingEntityByName(
                          activeChapter.primaryPov,
                          'character'
                        );
                        return matchedPov ? (
                          <button
                            type="button"
                            onClick={() => onSelectEntity(matchedPov.id)}
                            className="text-xs font-bold text-[#9E2A2B] hover:underline flex items-center gap-1 mt-1 cursor-pointer text-left"
                          >
                            <span>{activeChapter.primaryPov}</span>
                            <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                          </button>
                        ) : (
                          <div className="text-xs font-semibold text-[#231C14] mt-1">
                            {activeChapter.primaryPov || 'Omniscient / Multi-POV'}
                          </div>
                        );
                      })()}
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3]">
                      <div className="text-[11px] text-[#695A47] flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#264653]" />
                        <span>Lokasi & Latar Utama Bab</span>
                      </div>
                      {(() => {
                        const matchedLoc =
                          findMatchingEntityByName(
                            activeChapter.primaryLocation,
                            'region'
                          ) ||
                          findMatchingEntityByName(
                            activeChapter.primaryLocation,
                            'nation'
                          );
                        return matchedLoc ? (
                          <button
                            type="button"
                            onClick={() => onSelectEntity(matchedLoc.id)}
                            className="text-xs font-bold text-[#264653] hover:underline flex items-center gap-1 mt-1 cursor-pointer text-left"
                          >
                            <span>{activeChapter.primaryLocation}</span>
                            <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                          </button>
                        ) : (
                          <div className="text-xs font-semibold text-[#231C14] mt-1">
                            {activeChapter.primaryLocation || 'Lintas Wilayah'}
                          </div>
                        );
                      })()}
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-[#695A47]">
                        <span>Progres Target Kata</span>
                        <span className="font-mono-tabular font-bold text-[#231C14]">
                          {activeChapter.currentWordCount.toLocaleString(
                            'id-ID'
                          )}{' '}
                          /{' '}
                          {activeChapter.wordCountTarget.toLocaleString(
                            'id-ID'
                          )}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#EFE7D6] border border-[#D8CBB3] overflow-hidden">
                        <div
                          className="h-full bg-[#9E2A2B]"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.round(
                                (activeChapter.currentWordCount /
                                  Math.max(1, activeChapter.wordCountTarget)) *
                                  100
                              )
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Executive Synopsis */}
                  <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3]">
                    <div className="text-xs font-semibold text-[#695A47] mb-1">
                      Sinopsis Eksekutif Bab
                    </div>
                    <div className="text-sm text-[#231C14] font-medium leading-relaxed">
                      <WikiTextRenderer
                        text={activeChapter.synopsis}
                        entities={entities}
                        onSelectEntity={onSelectEntity}
                      />
                    </div>
                  </div>

                  {/* Narrative Dramaturgy Dossier Cards (Goal, Conflict, Cliffhanger, Foreshadowing) */}
                  {(activeChapter.chapterGoal ||
                    activeChapter.centralConflict ||
                    activeChapter.endingHookOrTwist ||
                    activeChapter.foreshadowingNotes) && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#8F5B14]">
                        <Flame className="w-4 h-4 text-[#9E2A2B]" />
                        <span>
                          Dossier Struktur Naratif: Tujuan Bab, Konflik Utama,
                          Cliffhanger & Foreshadowing
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {activeChapter.chapterGoal && (
                          <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-1">
                            <div className="text-xs font-semibold text-[#2D5A43] flex items-center gap-1.5">
                              <Compass className="w-3.5 h-3.5" />
                              <span>Tujuan Naratif Bab (Chapter Goal)</span>
                            </div>
                            <div className="text-xs text-[#231C14] leading-relaxed">
                              <WikiTextRenderer
                                text={activeChapter.chapterGoal}
                                entities={entities}
                                onSelectEntity={onSelectEntity}
                              />
                            </div>
                          </div>
                        )}

                        {activeChapter.centralConflict && (
                          <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-1">
                            <div className="text-xs font-semibold text-[#9E2A2B] flex items-center gap-1.5">
                              <ShieldAlert className="w-3.5 h-3.5" />
                              <span>
                                Konflik & Rintangan Utama (Central Conflict)
                              </span>
                            </div>
                            <div className="text-xs text-[#231C14] leading-relaxed">
                              <WikiTextRenderer
                                text={activeChapter.centralConflict}
                                entities={entities}
                                onSelectEntity={onSelectEntity}
                              />
                            </div>
                          </div>
                        )}

                        {activeChapter.endingHookOrTwist && (
                          <div className="p-4 rounded-xl bg-[#EFE7D6]/75 border border-[#D8CBB3] space-y-1">
                            <div className="text-xs font-semibold text-[#7A3E1D] flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-[#9E2A2B]" />
                              <span>
                                Cliffhanger & Pengungkapan Lore Akhir Bab
                              </span>
                            </div>
                            <div className="text-xs text-[#231C14] leading-relaxed">
                              <WikiTextRenderer
                                text={activeChapter.endingHookOrTwist}
                                entities={entities}
                                onSelectEntity={onSelectEntity}
                              />
                            </div>
                          </div>
                        )}

                        {activeChapter.foreshadowingNotes && (
                          <div className="p-4 rounded-xl bg-[#EFE7D6]/75 border border-[#D8CBB3] space-y-1">
                            <div className="text-xs font-semibold text-[#264653] flex items-center gap-1.5">
                              <EyeOff className="w-3.5 h-3.5" />
                              <span>
                                Catatan Revisi & Foreshadowing Rahasia Penulis
                              </span>
                            </div>
                            <div className="text-xs text-[#231C14] leading-relaxed">
                              <WikiTextRenderer
                                text={activeChapter.foreshadowingNotes}
                                entities={entities}
                                onSelectEntity={onSelectEntity}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Full Chapter Manuscript Prose with Interactive [[Cross-Links]] & Illuminated Drop Cap */}
                  <div className="space-y-3 pt-2">
                    <FantasySectionDivider title="Kutipan Naskah Manuskrip & Catatan Lore Terhubung" />
                    <div className="p-5 sm:p-6 rounded-xl bg-[#F6F1E6]/75 border border-[#B5832A]/45">
                      <WikiTextRenderer
                        text={activeChapter.draftNotes}
                        entities={entities}
                        onSelectEntity={onSelectEntity}
                        dropCap={true}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* =========================================================== */}
              {/* FEATURED & AUTO-DETECTED WORLD BIBLE ENTITIES IN CHAPTER    */}
              {/* =========================================================== */}
              <div className="pt-4 border-t border-[#D8CBB3] space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#231C14]">
                    <Link2 className="w-4 h-4 text-[#9E2A2B]" />
                    <span>
                      Elemen World Bible yang Muncul di Bab Ini (
                      {
                        Array.from(
                          new Set([
                            ...activeChapter.featuredEntityIds,
                            ...autoDetectedEntities.map((e) => e.id),
                          ])
                        ).length
                      }{' '}
                      Entitas)
                    </span>
                  </div>

                  {unlinkedDetectedEntities.length > 0 && (
                    <button
                      type="button"
                      onClick={handleSyncAllDetectedEntities}
                      className="px-3 py-1 rounded-lg bg-[#9E2A2B] text-white hover:bg-[#7E2021] text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>
                        + Simpan {unlinkedDetectedEntities.length} Tautan
                        Terdeteksi dari [[Naskah]]
                      </span>
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {Array.from(
                    new Set([
                      ...activeChapter.featuredEntityIds,
                      ...autoDetectedEntities.map((e) => e.id),
                    ])
                  ).map((id) => {
                    const ent = entities.find((e) => e.id === id);
                    if (!ent) return null;
                    const isSaved =
                      activeChapter.featuredEntityIds.includes(id);
                    return (
                      <button
                        key={ent.id}
                        type="button"
                        onClick={() => onSelectEntity(ent.id)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                          isSaved
                            ? 'bg-[#EFE7D6] hover:bg-[#D8CBB3] border-[#D8CBB3] text-[#231C14]'
                            : 'bg-[#F6F1E6] hover:bg-[#EFE7D6] border-[#B5832A] text-[#8F5B14]'
                        }`}
                      >
                        <span
                          style={{
                            color: CATEGORY_META[ent.category].accentColor,
                          }}
                        >
                          [{CATEGORY_META[ent.category].singular}]
                        </span>
                        <span>{ent.title}</span>
                        {!isSaved && (
                          <span className="text-[10px] text-[#9E2A2B]">
                            (Terdeteksi [[...]])
                          </span>
                        )}
                        <ArrowUpRight className="w-3.5 h-3.5 text-[#9E2A2B]" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* =========================================================== */}
              {/* SCENE BREAKDOWN (SCENE BEATS) WITH EDIT, REORDER & LINKS    */}
              {/* =========================================================== */}
              <div className="pt-4 border-t border-[#D8CBB3] space-y-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#231C14]">
                    <Clock className="w-4 h-4 text-[#8F5B14]" />
                    <span>
                      Urutan Adegan (Scene Beats) —{' '}
                      {activeChapter.scenes.length} Adegan Terjadwal
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (showSceneForm && !editingSceneId) {
                        setShowSceneForm(false);
                      } else {
                        setEditingSceneId(null);
                        setNewSceneTitle('');
                        setNewScenePov(
                          activeChapter.primaryPov ||
                            characterEntities[0]?.title ||
                            ''
                        );
                        setNewSceneRegion(
                          activeChapter.primaryLocation ||
                            locationEntities[0]?.title ||
                            ''
                        );
                        setNewSceneTimeOfDay('');
                        setNewSceneSummary('');
                        setNewSceneGoalConflict('');
                        setNewSceneOutcome('');
                        setShowSceneForm(true);
                      }
                    }}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#231C14] text-[#FBF8F1] hover:bg-[#3A2E21] flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#B5832A]" />
                    <span>
                      {showSceneForm && !editingSceneId
                        ? 'Tutup Form Adegan'
                        : '+ Tambah Adegan Baru'}
                    </span>
                  </button>
                </div>

                {/* Add / Edit Scene Form */}
                {showSceneForm && (
                  <form
                    onSubmit={handleSaveScene}
                    className="p-4 rounded-xl bg-[#F6F1E6] border-2 border-[#B5832A] space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-[#D8CBB3] pb-2">
                      <span className="text-xs font-bold text-[#231C14]">
                        {editingSceneId
                          ? 'Sunting Rincian Adegan'
                          : 'Tambah Adegan (Scene Beat) Baru'}
                      </span>
                      <button
                        type="button"
                        onClick={resetSceneForm}
                        className="text-xs text-[#695A47] hover:text-[#231C14] flex items-center gap-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Batal</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="md:col-span-2">
                        <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                          Judul Adegan
                        </label>
                        <input
                          type="text"
                          required
                          value={newSceneTitle}
                          onChange={(e) => setNewSceneTitle(e.target.value)}
                          placeholder="Contoh: Anomali Tengah Malam di Observatorium..."
                          className="w-full px-3 py-1.5 text-xs font-semibold bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                          Waktu / Suasana Adegan
                        </label>
                        <input
                          type="text"
                          value={newSceneTimeOfDay}
                          onChange={(e) => setNewSceneTimeOfDay(e.target.value)}
                          placeholder="Contoh: Tengah Malam · Badai Salju"
                          className="w-full px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Hybrid POV Character Picker for Scene */}
                      <div>
                        <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                          Tokoh Sudut Pandang (POV) Adegan (Pilih Character /
                          Ketik)
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          <select
                            value=""
                            onChange={(e) => {
                              if (!e.target.value) return;
                              setNewScenePov(e.target.value);
                            }}
                            className="px-2.5 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                          >
                            <option value="">-- Pilih Tokoh --</option>
                            {characterEntities.map((c) => (
                              <option key={c.id} value={c.title}>
                                {c.title}
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={newScenePov}
                            onChange={(e) => setNewScenePov(e.target.value)}
                            placeholder="Atau ketik nama POV..."
                            className="px-2.5 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                          />
                        </div>
                      </div>

                      {/* Hybrid Setting Region Picker for Scene */}
                      <div>
                        <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                          Lokasi Wilayah / Negara Adegan (Pilih Wilayah / Ketik)
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          <select
                            value=""
                            onChange={(e) => {
                              if (!e.target.value) return;
                              setNewSceneRegion(e.target.value);
                            }}
                            className="px-2.5 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                          >
                            <option value="">-- Pilih Lokasi --</option>
                            {locationEntities.map((loc) => (
                              <option key={loc.id} value={loc.title}>
                                [{CATEGORY_META[loc.category].singular}]{' '}
                                {loc.title}
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={newSceneRegion}
                            onChange={(e) => setNewSceneRegion(e.target.value)}
                            placeholder="Atau ketik lokasi..."
                            className="px-2.5 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                        Ringkasan Jalannya Adegan
                      </label>
                      <textarea
                        rows={2}
                        value={newSceneSummary}
                        onChange={(e) => setNewSceneSummary(e.target.value)}
                        placeholder="Apa yang terjadi di dalam adegan ini? (Mendukung [[Nama Entitas]])..."
                        className="w-full p-2.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#9E2A2B] mb-1">
                          Tujuan & Konflik Adegan (Scene Goal / Conflict)
                        </label>
                        <textarea
                          rows={2}
                          value={newSceneGoalConflict}
                          onChange={(e) =>
                            setNewSceneGoalConflict(e.target.value)
                          }
                          placeholder="Ketegangan atau tujuan spesifik yang dipertaruhkan dalam adegan ini..."
                          className="w-full p-2 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#2D5A43] mb-1">
                          Hasil Akhir / Perubahan Situasi (Scene Outcome)
                        </label>
                        <textarea
                          rows={2}
                          value={newSceneOutcome}
                          onChange={(e) => setNewSceneOutcome(e.target.value)}
                          placeholder="Keputusan, petunjuk baru, atau konsekuensi di akhir adegan..."
                          className="w-full p-2 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-1.5 text-xs font-semibold bg-[#9E2A2B] text-white rounded-lg hover:bg-[#7E2021] flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>
                          {editingSceneId
                            ? 'Simpan Perubahan Adegan'
                            : 'Simpan Adegan ke Bab Ini'}
                        </span>
                      </button>
                    </div>
                  </form>
                )}

                {/* Scene Cards List */}
                <div className="space-y-3">
                  {activeChapter.scenes.map((sc, idx) => {
                    const matchedScenePov = findMatchingEntityByName(
                      sc.povCharacter,
                      'character'
                    );
                    const matchedSceneLoc =
                      findMatchingEntityByName(sc.settingRegion, 'region') ||
                      findMatchingEntityByName(sc.settingRegion, 'nation');

                    return (
                      <div
                        key={sc.id}
                        className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-2.5"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="space-y-0.5">
                            <div className="flex flex-wrap items-center gap-2 text-xs text-[#695A47]">
                              <span className="font-mono-tabular font-bold text-[#9E2A2B]">
                                Adegan {idx + 1}
                              </span>
                              {sc.timeOfDay && (
                                <>
                                  <span>·</span>
                                  <span className="font-semibold text-[#7A3E1D]">
                                    {sc.timeOfDay}
                                  </span>
                                </>
                              )}
                              <span>·</span>
                              <span className="inline-flex items-center gap-1">
                                <span>POV:</span>
                                {matchedScenePov ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      onSelectEntity(matchedScenePov.id)
                                    }
                                    className="font-bold text-[#9E2A2B] hover:underline cursor-pointer"
                                  >
                                    {sc.povCharacter} ↗
                                  </button>
                                ) : (
                                  <strong className="text-[#231C14]">
                                    {sc.povCharacter}
                                  </strong>
                                )}
                              </span>
                              <span>·</span>
                              <span className="inline-flex items-center gap-1">
                                <span>Latar:</span>
                                {matchedSceneLoc ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      onSelectEntity(matchedSceneLoc.id)
                                    }
                                    className="font-bold text-[#264653] hover:underline cursor-pointer"
                                  >
                                    {sc.settingRegion} ↗
                                  </button>
                                ) : (
                                  <strong className="text-[#231C14]">
                                    {sc.settingRegion}
                                  </strong>
                                )}
                              </span>
                            </div>

                            <div className="font-display text-lg font-bold text-[#231C14]">
                              {sc.title}
                            </div>
                          </div>

                          {/* Scene Action Controls (Move Up/Down, Edit, Delete) */}
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={idx <= 0}
                              onClick={() => handleMoveScene(sc.id, -1)}
                              className="p-1 rounded hover:bg-[#EFE7D6] disabled:opacity-30 text-[#695A47] hover:text-[#231C14] cursor-pointer"
                              title="Geser adegan ke atas"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={idx >= activeChapter.scenes.length - 1}
                              onClick={() => handleMoveScene(sc.id, 1)}
                              className="p-1 rounded hover:bg-[#EFE7D6] disabled:opacity-30 text-[#695A47] hover:text-[#231C14] cursor-pointer"
                              title="Geser adegan ke bawah"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => startEditingScene(sc)}
                              className="p-1 rounded hover:bg-[#EFE7D6] text-[#695A47] hover:text-[#231C14] cursor-pointer"
                              title="Sunting adegan ini"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateActiveChapter({
                                  scenes: activeChapter.scenes.filter(
                                    (item) => item.id !== sc.id
                                  ),
                                })
                              }
                              className="p-1 rounded hover:bg-[#EFE7D6] text-[#695A47] hover:text-[#9E2A2B] cursor-pointer"
                              title="Hapus adegan ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="text-xs text-[#231C14] leading-relaxed">
                          <WikiTextRenderer
                            text={sc.summary}
                            entities={entities}
                            onSelectEntity={onSelectEntity}
                          />
                        </div>

                        {(sc.sceneGoalOrConflict || sc.sceneOutcome) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                            {sc.sceneGoalOrConflict && (
                              <div className="p-2.5 rounded-lg bg-[#EFE7D6]/75 border border-[#D8CBB3] space-y-0.5">
                                <div className="text-[10px] font-semibold text-[#9E2A2B]">
                                  Tujuan & Konflik Adegan
                                </div>
                                <div className="text-xs text-[#231C14] leading-relaxed">
                                  <WikiTextRenderer
                                    text={sc.sceneGoalOrConflict}
                                    entities={entities}
                                    onSelectEntity={onSelectEntity}
                                  />
                                </div>
                              </div>
                            )}

                            {sc.sceneOutcome && (
                              <div className="p-2.5 rounded-lg bg-[#EFE7D6]/75 border border-[#D8CBB3] space-y-0.5">
                                <div className="text-[10px] font-semibold text-[#2D5A43]">
                                  Hasil Akhir & Perubahan Situasi
                                </div>
                                <div className="text-xs text-[#231C14] leading-relaxed">
                                  <WikiTextRenderer
                                    text={sc.sceneOutcome}
                                    entities={entities}
                                    onSelectEntity={onSelectEntity}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

interface WorldSettingsAndPowerViewProps {
  project: WorldProject;
  onUpdateProjectMeta: (patch: Partial<WorldProject>) => void;
  onCreateBlankWorld: () => void;
  onSelectEntity: (entityId: string) => void;
}

export const WorldSettingsAndPowerView: React.FC<
  WorldSettingsAndPowerViewProps
> = ({
  project,
  onUpdateProjectMeta,
  onCreateBlankWorld,
  onSelectEntity,
}) => {
  const powerSystems = project.entities.filter(
    (e) => e.category === 'power_system'
  );
  const skills = project.entities.filter((e) => e.category === 'skill');
  const nations = project.entities.filter((e) => e.category === 'nation');
  const races = project.entities.filter((e) => e.category === 'race');

  return (
    <div className="space-y-6">
      {/* World Identity & Cosmology Settings */}
      <div className="bg-[#FBF8F1] border border-[#D8CBB3] rounded-xl p-6 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#D8CBB3] pb-4">
          <div>
            <div className="text-xs font-semibold text-[#9E2A2B]">
              Identitas Semesta & Parameter Kanon
            </div>
            <h2 className="font-display text-3xl font-bold text-[#231C14]">
              Pengaturan Dunia & Kosmologi ({project.worldName})
            </h2>
            <p className="text-sm text-[#695A47] mt-1 max-w-3xl">
              Atur nama dunia, genre, sistem penanggalan kalender, serta tinjau ringkasan struktur kekuatan (*Power System*) dan geopolitik di semesta cerita Anda.
            </p>
          </div>

          <button
            type="button"
            onClick={onCreateBlankWorld}
            className="px-3.5 py-2 text-xs font-semibold border border-[#9E2A2B] text-[#9E2A2B] hover:bg-[#9E2A2B] hover:text-white rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FilePlus2 className="w-3.5 h-3.5" />
            Buat Dunia Kosong Baru
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#695A47] mb-1">
              Nama Dunia / Judul Semesta
            </label>
            <input
              type="text"
              value={project.worldName}
              onChange={(e) =>
                onUpdateProjectMeta({ worldName: e.target.value })
              }
              className="w-full px-3 py-2 text-sm font-semibold bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg text-[#231C14]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#695A47] mb-1">
              Genre & Sub-Genre Cerita
            </label>
            <input
              type="text"
              value={project.genre}
              onChange={(e) => onUpdateProjectMeta({ genre: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg text-[#231C14]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#695A47] mb-1">
              Sistem Penanggalan / Era Kalender
            </label>
            <input
              type="text"
              value={project.calendarSystem}
              onChange={(e) =>
                onUpdateProjectMeta({ calendarSystem: e.target.value })
              }
              className="w-full px-3 py-2 text-sm bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg text-[#231C14]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#695A47] mb-1">
              Nama Penulis / Kreator Dunia
            </label>
            <input
              type="text"
              value={project.authorName}
              onChange={(e) =>
                onUpdateProjectMeta({ authorName: e.target.value })
              }
              className="w-full px-3 py-2 text-sm bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg text-[#231C14]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#695A47] mb-1">
            Premis Utama / Tagline Dunia Cerita
          </label>
          <input
            type="text"
            value={project.tagline}
            onChange={(e) => onUpdateProjectMeta({ tagline: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg text-[#231C14]"
          />
        </div>
      </div>

      {/* Power System & Skill Matrix Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-[#FBF8F1] border border-[#D8CBB3] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#D8CBB3] pb-3">
            <div>
              <div className="text-xs font-semibold text-[#264653]">
                Hukum Kekuatan & Hirarki Sihir
              </div>
              <h3 className="font-display text-2xl font-bold text-[#231C14]">
                Matriks Power System & Skill
              </h3>
            </div>
            <Zap className="w-5 h-5 text-[#B5832A]" />
          </div>

          <div className="space-y-3">
            {powerSystems.map((ps) => (
              <div
                key={ps.id}
                className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="font-display text-xl font-bold text-[#231C14]">
                    {ps.title}
                  </div>
                  <button
                    type="button"
                    onClick={() => onSelectEntity(ps.id)}
                    className="text-xs font-semibold text-[#9E2A2B] hover:underline cursor-pointer"
                  >
                    Sunting Hukum →
                  </button>
                </div>
                <p className="text-xs text-[#695A47]">{ps.summary}</p>
                {ps.attributes.tierHierarchy && (
                  <div className="text-xs bg-[#EFE7D6] p-2.5 rounded-lg border border-[#D8CBB3]">
                    <span className="font-semibold text-[#231C14]">
                      Urutan Tingkatan (Tier):{' '}
                    </span>
                    <span className="text-[#695A47]">
                      {ps.attributes.tierHierarchy}
                    </span>
                  </div>
                )}
                {ps.attributes.hardRules && (
                  <div className="text-xs text-[#9E2A2B] font-medium">
                    Batasan Mutlak: {ps.attributes.hardRules}
                  </div>
                )}
              </div>
            ))}

            <div className="pt-2">
              <div className="text-xs font-semibold text-[#695A47] mb-2">
                Daftar Skill & Teknik Terdaftar ({skills.length})
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {skills.map((sk) => (
                  <button
                    key={sk.id}
                    type="button"
                    onClick={() => onSelectEntity(sk.id)}
                    className="text-left p-3 rounded-lg bg-[#F6F1E6] hover:bg-[#EFE7D6] border border-[#D8CBB3] transition-colors cursor-pointer"
                  >
                    <div className="text-[11px] font-semibold text-[#264653]">
                      {sk.attributes.skillRank || 'Teknik Khusus'}
                    </div>
                    <div className="font-display text-base font-bold text-[#231C14]">
                      {sk.title}
                    </div>
                    <div className="text-xs text-[#695A47] line-clamp-1 mt-0.5">
                      {sk.summary}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Geopolitics & Races Quick Atlas */}
        <div className="lg:col-span-6 bg-[#FBF8F1] border border-[#D8CBB3] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#D8CBB3] pb-3">
            <div>
              <div className="text-xs font-semibold text-[#2D5A43]">
                Geopolitik, Kerajaan & Bangsa
              </div>
              <h3 className="font-display text-2xl font-bold text-[#231C14]">
                Ikhtisar Negara & Ras Penghuni
              </h3>
            </div>
            <Globe className="w-5 h-5 text-[#9E2A2B]" />
          </div>

          <div className="space-y-3">
            <div className="text-xs font-semibold text-[#695A47]">
              Negara & Kedaulatan ({nations.length})
            </div>
            <div className="grid grid-cols-1 gap-2.5">
              {nations.map((nat) => (
                <button
                  key={nat.id}
                  type="button"
                  onClick={() => onSelectEntity(nat.id)}
                  className="text-left p-3.5 rounded-xl bg-[#F6F1E6] hover:bg-[#EFE7D6] border border-[#D8CBB3] transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs text-[#695A47]">
                    <span className="font-semibold text-[#9E2A2B]">
                      Ibu Kota: {nat.attributes.capitalCity || '-'}
                    </span>
                    <span>Penguasa: {nat.attributes.ruler || '-'}</span>
                  </div>
                  <div className="font-display text-lg font-bold text-[#231C14] mt-0.5">
                    {nat.title}
                  </div>
                  <p className="text-xs text-[#695A47] mt-1">{nat.summary}</p>
                </button>
              ))}
            </div>

            <div className="text-xs font-semibold text-[#695A47] pt-2">
              Ras & Bangsa ({races.length})
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {races.map((rc) => (
                <button
                  key={rc.id}
                  type="button"
                  onClick={() => onSelectEntity(rc.id)}
                  className="text-left p-3 rounded-lg bg-[#F6F1E6] hover:bg-[#EFE7D6] border border-[#D8CBB3] transition-colors cursor-pointer"
                >
                  <div className="text-[11px] font-semibold text-[#2D5A43]">
                    Usia: {rc.attributes.lifespan || 'Tidak diketahui'}
                  </div>
                  <div className="font-display text-base font-bold text-[#231C14]">
                    {rc.title}
                  </div>
                  <div className="text-xs text-[#695A47] line-clamp-1 mt-0.5">
                    Habitat: {rc.attributes.homeland || '-'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
