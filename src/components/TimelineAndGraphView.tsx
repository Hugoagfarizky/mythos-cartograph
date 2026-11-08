import React, { useMemo, useRef, useState } from 'react';
import {
  ArrowDownUp,
  ArrowUpRight,
  BookOpen,
  Calculator,
  Calendar,
  Check,
  Clock,
  Compass,
  Edit3,
  Flame,
  GitBranch,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import {
  ChapterOutline,
  GraphNodePosition,
  LoreEntity,
  MapStamp,
  RelationType,
  RelationshipEdge,
  TimelineEvent,
} from '../types/world';
import { CATEGORY_META, WikiTextRenderer } from './WikiTextRenderer';

interface TimelineViewProps {
  timeline: TimelineEvent[];
  entities: LoreEntity[];
  chapters?: ChapterOutline[];
  mapStamps?: MapStamp[];
  calendarSystem: string;
  onUpdateTimeline: (next: TimelineEvent[]) => void;
  onSaveEntity?: (entity: LoreEntity) => void;
  onSelectEntity: (id: string) => void;
  onOpenChapter?: (chapterId: string) => void;
}

const TIMELINE_CATEGORIES: Array<TimelineEvent['category']> = [
  'Peperangan',
  'Bencana Arcane',
  'Berdirinya Kerajaan',
  'Penemuan Pusaka',
  'Kelahiran Tokoh',
];

const CATEGORY_ACCENT: Record<
  TimelineEvent['category'],
  { bg: string; text: string; border: string; dot: string }
> = {
  Peperangan: {
    bg: 'bg-[#9E2A2B]/10',
    text: 'text-[#9E2A2B]',
    border: 'border-[#9E2A2B]/40',
    dot: 'bg-[#9E2A2B]',
  },
  'Bencana Arcane': {
    bg: 'bg-[#5A3E7A]/10',
    text: 'text-[#5A3E7A]',
    border: 'border-[#5A3E7A]/40',
    dot: 'bg-[#5A3E7A]',
  },
  'Berdirinya Kerajaan': {
    bg: 'bg-[#8F5B14]/10',
    text: 'text-[#8F5B14]',
    border: 'border-[#8F5B14]/40',
    dot: 'bg-[#8F5B14]',
  },
  'Penemuan Pusaka': {
    bg: 'bg-[#264653]/10',
    text: 'text-[#264653]',
    border: 'border-[#264653]/40',
    dot: 'bg-[#264653]',
  },
  'Kelahiran Tokoh': {
    bg: 'bg-[#2D5A43]/10',
    text: 'text-[#2D5A43]',
    border: 'border-[#2D5A43]/40',
    dot: 'bg-[#2D5A43]',
  },
};

const PRESET_ERAS = [
  'Era Surya Emas (Pra-Gerhana)',
  'Era Abu (Post-Gerhana)',
  'Era Kebangkitan Astral',
];

export const ChronicleTimelineView: React.FC<TimelineViewProps> = ({
  timeline,
  entities,
  chapters = [],
  mapStamps = [],
  calendarSystem,
  onUpdateTimeline,
  onSaveEntity,
  onSelectEntity,
  onOpenChapter,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterEra, setFilterEra] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortAscending, setSortAscending] = useState<boolean>(true);

  // Interactive Time-Span & Age Calculator State
  const [showCalculator, setShowCalculator] = useState<boolean>(false);
  const [calcEventAId, setCalcEventAId] = useState<string>(
    timeline[0]?.id || ''
  );
  const [calcEventBId, setCalcEventBId] = useState<string>(
    timeline[timeline.length - 1]?.id || ''
  );
  const [customPresentYear, setCustomPresentYear] = useState<number>(412);
  const [usePresentYearForB, setUsePresentYearForB] = useState<boolean>(false);

  // Create / Edit Form State
  const [showEditorForm, setShowEditorForm] = useState<boolean>(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [draftEra, setDraftEra] = useState<string>(
    'Era Abu (Post-Gerhana)'
  );
  const [draftYear, setDraftYear] = useState<number>(412);
  const [draftDisplayDate, setDraftDisplayDate] = useState<string>(
    'Tahun 412 PG · Musim Gugur'
  );
  const [draftSeasonOrPhase, setDraftSeasonOrPhase] = useState<string>('');
  const [draftTitle, setDraftTitle] = useState<string>('');
  const [draftCategory, setDraftCategory] =
    useState<TimelineEvent['category']>('Peperangan');
  const [draftRegion, setDraftRegion] = useState<string>('');
  const [draftSummary, setDraftSummary] = useState<string>('');
  const [draftConsequenceImpact, setDraftConsequenceImpact] =
    useState<string>('');
  const [draftSecretTruthNote, setDraftSecretTruthNote] = useState<string>('');
  const [draftLinkedEntityIds, setDraftLinkedEntityIds] = useState<string[]>(
    []
  );
  const [draftLinkedChapterId, setDraftLinkedChapterId] = useState<string>('');
  const [entityPickerFilter, setEntityPickerFilter] = useState<string>('ALL');

  const uniqueEras = useMemo(() => {
    const set = new Set<string>(PRESET_ERAS);
    timeline.forEach((t) => {
      if (t.era && t.era.trim()) set.add(t.era.trim());
    });
    return Array.from(set);
  }, [timeline]);

  const regionAndNationEntities = useMemo(
    () =>
      entities.filter(
        (e) => e.category === 'region' || e.category === 'nation'
      ),
    [entities]
  );

  const historyEntities = useMemo(
    () => entities.filter((e) => e.category === 'history'),
    [entities]
  );

  // Helper to match region name to an entity for clickable navigation
  const findMatchingLocationEntity = (name?: string): LoreEntity | undefined => {
    if (!name) return undefined;
    const clean = name.trim().toLowerCase();
    if (!clean) return undefined;
    return regionAndNationEntities.find(
      (e) =>
        e.title.toLowerCase() === clean ||
        e.title.toLowerCase().includes(clean) ||
        clean.includes(e.title.toLowerCase())
    );
  };

  // Filtered & sorted timeline
  const sortedTimeline = useMemo(() => {
    return [...timeline]
      .filter((ev) => {
        if (filterCategory !== 'ALL' && ev.category !== filterCategory) {
          return false;
        }
        if (filterEra !== 'ALL' && ev.era !== filterEra) {
          return false;
        }
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        const linkedNames = entities
          .filter((e) => ev.linkedEntityIds.includes(e.id))
          .map((e) => e.title.toLowerCase())
          .join(' ');
        return (
          ev.title.toLowerCase().includes(q) ||
          ev.displayDate.toLowerCase().includes(q) ||
          ev.era.toLowerCase().includes(q) ||
          ev.summary.toLowerCase().includes(q) ||
          (ev.regionName || '').toLowerCase().includes(q) ||
          (ev.consequenceImpact || '').toLowerCase().includes(q) ||
          (ev.secretTruthNote || '').toLowerCase().includes(q) ||
          linkedNames.includes(q)
        );
      })
      .sort((a, b) => (sortAscending ? a.year - b.year : b.year - a.year));
  }, [timeline, filterCategory, filterEra, searchQuery, sortAscending, entities]);

  // Chronological stats
  const minYear =
    timeline.length > 0 ? Math.min(...timeline.map((t) => t.year)) : 0;
  const maxYear =
    timeline.length > 0 ? Math.max(...timeline.map((t) => t.year)) : 0;
  const totalYearSpan = Math.max(0, maxYear - minYear);

  // Open form for creating a new timeline event
  const startCreatingNewEvent = () => {
    setEditingEventId(null);
    setDraftEra('Era Abu (Post-Gerhana)');
    setDraftYear(maxYear > 0 ? maxYear + 2 : 412);
    setDraftDisplayDate(
      `Tahun ${maxYear > 0 ? maxYear + 2 : 412} PG · Musim Gugur`
    );
    setDraftSeasonOrPhase('');
    setDraftTitle('');
    setDraftCategory('Peperangan');
    setDraftRegion('');
    setDraftSummary('');
    setDraftConsequenceImpact('');
    setDraftSecretTruthNote('');
    setDraftLinkedEntityIds([]);
    setDraftLinkedChapterId('');
    setShowEditorForm(true);
  };

  // Open form for editing an existing timeline event
  const startEditingEvent = (ev: TimelineEvent) => {
    setEditingEventId(ev.id);
    setDraftEra(ev.era || 'Era Abu (Post-Gerhana)');
    setDraftYear(ev.year);
    setDraftDisplayDate(ev.displayDate);
    setDraftSeasonOrPhase(ev.seasonOrPhase || '');
    setDraftTitle(ev.title);
    setDraftCategory(ev.category);
    setDraftRegion(ev.regionName || '');
    setDraftSummary(ev.summary);
    setDraftConsequenceImpact(ev.consequenceImpact || '');
    setDraftSecretTruthNote(ev.secretTruthNote || '');
    setDraftLinkedEntityIds([...(ev.linkedEntityIds || [])]);
    setDraftLinkedChapterId(ev.linkedChapterId || '');
    setShowEditorForm(true);
  };

  const toggleDraftLinkedEntity = (entityId: string) => {
    setDraftLinkedEntityIds((prev) =>
      prev.includes(entityId)
        ? prev.filter((id) => id !== entityId)
        : [...prev, entityId]
    );
  };

  const handleSaveTimelineEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftTitle.trim()) return;

    const payload: TimelineEvent = {
      id: editingEventId || `time-${Date.now()}`,
      era: draftEra.trim() || 'Era Abu (Post-Gerhana)',
      year: Number(draftYear) || 0,
      displayDate: draftDisplayDate.trim() || `Tahun ${draftYear} PG`,
      seasonOrPhase: draftSeasonOrPhase.trim() || undefined,
      title: draftTitle.trim(),
      category: draftCategory,
      summary:
        draftSummary.trim() || 'Peristiwa penting dalam kronik sejarah dunia.',
      consequenceImpact: draftConsequenceImpact.trim() || undefined,
      secretTruthNote: draftSecretTruthNote.trim() || undefined,
      linkedEntityIds: draftLinkedEntityIds,
      regionName: draftRegion.trim() || undefined,
      linkedChapterId: draftLinkedChapterId || undefined,
    };

    const nextList = editingEventId
      ? timeline.map((t) => (t.id === editingEventId ? payload : t))
      : [...timeline, payload];

    onUpdateTimeline(nextList.sort((a, b) => a.year - b.year));
    setShowEditorForm(false);
    setEditingEventId(null);
  };

  // 1-Click Pull / Sync all entries from the History tab into Timeline
  const handleSyncAllFromHistoryTab = () => {
    const nextList = [...timeline];

    historyEntities.forEach((hEnt) => {
      const hAttrs = hEnt.attributes || {};
      const evTypeStr = (hAttrs.historyEventType || '').toLowerCase();
      const mappedCategory: TimelineEvent['category'] = evTypeStr.includes(
        'bencana'
      )
        ? 'Bencana Arcane'
        : evTypeStr.includes('perang')
        ? 'Peperangan'
        : evTypeStr.includes('penemuan') || evTypeStr.includes('traktat')
        ? 'Penemuan Pusaka'
        : 'Berdirinya Kerajaan';

      // Match belligerents and key figures to entity IDs
      const relatedIds = new Set<string>([hEnt.id]);
      [
        ...(hAttrs.belligerentsList || []),
        ...(hAttrs.keyHistoricalFigures || []),
        hAttrs.eventLocation || '',
      ].forEach((name) => {
        const clean = name.trim().toLowerCase();
        if (!clean) return;
        const found = entities.find(
          (e) =>
            e.title.toLowerCase() === clean ||
            e.title.toLowerCase().includes(clean) ||
            clean.includes(e.title.toLowerCase())
        );
        if (found) relatedIds.add(found.id);
      });

      const existingIdx = nextList.findIndex(
        (t) =>
          t.linkedEntityIds.includes(hEnt.id) ||
          t.title.toLowerCase() === hEnt.title.toLowerCase()
      );

      if (existingIdx >= 0) {
        const cur = nextList[existingIdx];
        nextList[existingIdx] = {
          ...cur,
          era: hAttrs.era || cur.era,
          year:
            typeof hAttrs.year === 'number' && !Number.isNaN(hAttrs.year)
              ? hAttrs.year
              : cur.year,
          displayDate: hAttrs.displayDate || cur.displayDate,
          consequenceImpact:
            cur.consequenceImpact ||
            hAttrs.worldImpactLegacy ||
            hAttrs.outcome,
          secretTruthNote:
            cur.secretTruthNote || hAttrs.hiddenHistoricalTruth,
          regionName: cur.regionName || hAttrs.eventLocation,
          linkedEntityIds: Array.from(
            new Set([...cur.linkedEntityIds, ...relatedIds])
          ),
        };
      } else {
        const yVal =
          typeof hAttrs.year === 'number' && !Number.isNaN(hAttrs.year)
            ? hAttrs.year
            : 100;
        nextList.push({
          id: `tl-sync-${hEnt.id}`,
          era: hAttrs.era || 'Era Abu (Post-Gerhana)',
          year: yVal,
          displayDate: hAttrs.displayDate || `Tahun ${yVal} PG`,
          title: hEnt.title,
          category: mappedCategory,
          summary: hEnt.summary,
          consequenceImpact:
            hAttrs.worldImpactLegacy || hAttrs.outcome || undefined,
          secretTruthNote: hAttrs.hiddenHistoricalTruth || undefined,
          regionName: hAttrs.eventLocation || undefined,
          linkedEntityIds: Array.from(relatedIds),
        });
      }
    });

    onUpdateTimeline(nextList.sort((a, b) => a.year - b.year));
  };

  // 1-Click Promote a TimelineEvent into a full History LoreEntity in the Sejarah tab
  const handlePromoteToHistoryCodex = (ev: TimelineEvent) => {
    // Check if already linked to a history entity
    const existingHist = entities.find(
      (e) =>
        e.category === 'history' &&
        (ev.linkedEntityIds.includes(e.id) ||
          e.title.toLowerCase() === ev.title.toLowerCase())
    );
    if (existingHist) {
      onSelectEntity(existingHist.id);
      return;
    }

    if (!onSaveEntity) return;

    const linkedObjs = entities.filter((e) => ev.linkedEntityIds.includes(e.id));
    const belligerentsList = linkedObjs
      .filter(
        (e) =>
          e.category === 'nation' ||
          e.category === 'faction' ||
          e.category === 'race'
      )
      .map((e) => e.title);
    const keyFiguresList = linkedObjs
      .filter((e) => e.category === 'character')
      .map((e) => e.title);

    const newHistId = `hist-${Date.now()}`;
    const newHistEntity: LoreEntity = {
      id: newHistId,
      category: 'history',
      title: ev.title,
      subtitle: `${ev.category} · ${ev.displayDate}`,
      summary: ev.summary,
      content: `### Kronik Peristiwa (${ev.displayDate})\n${ev.summary}\n\n${
        ev.consequenceImpact
          ? `### Dampak & Konsekuensi Dunia\n${ev.consequenceImpact}\n\n`
          : ''
      }Tambahkan rincian jalannya peristiwa dan kutipan arsip sejarah di sini.`,
      tags: ['Sejarah', ev.category, ev.era],
      attributes: {
        historyEventType:
          ev.category === 'Bencana Arcane'
            ? 'Bencana Kosmik / Arcane'
            : ev.category === 'Peperangan'
            ? 'Perang Besar & Pengepungan'
            : ev.category === 'Penemuan Pusaka'
            ? 'Traktat, Pakta & Penemuan Agung'
            : 'Berdirinya / Runtuhnya Dinasti',
        era: ev.era,
        year: ev.year,
        displayDate: ev.displayDate,
        eventLocation: ev.regionName || '',
        belligerentsList,
        belligerents: belligerentsList.join(' vs '),
        keyHistoricalFigures: keyFiguresList,
        outcome: ev.consequenceImpact || ev.summary,
        worldImpactLegacy: ev.consequenceImpact || '',
        hiddenHistoricalTruth: ev.secretTruthNote || '',
      },
      updatedAt: new Date().toISOString().slice(0, 10),
    };

    onSaveEntity(newHistEntity);
    // Also link newHistId back to this timeline event
    onUpdateTimeline(
      timeline.map((t) =>
        t.id === ev.id
          ? {
              ...t,
              linkedEntityIds: Array.from(
                new Set([...t.linkedEntityIds, newHistId])
              ),
            }
          : t
      )
    );
    onSelectEntity(newHistId);
  };

  // Time-Span Calculator values
  const calcEventA =
    timeline.find((t) => t.id === calcEventAId) || timeline[0] || null;
  const calcEventB =
    timeline.find((t) => t.id === calcEventBId) ||
    timeline[timeline.length - 1] ||
    null;

  const yearA = calcEventA ? calcEventA.year : 0;
  const yearB = usePresentYearForB
    ? customPresentYear
    : calcEventB
    ? calcEventB.year
    : 0;
  const deltaYears = Math.abs(yearB - yearA);
  const humanGenerations = (deltaYears / 25).toFixed(1);
  const dvergrLifespans = (deltaYears / 350).toFixed(2);
  const aelfirLifespans = (deltaYears / 700).toFixed(2);

  return (
    <div className="space-y-6">
      {/* =================================================================== */}
      {/* TOP HEADER BAR & STATS                                              */}
      {/* =================================================================== */}
      <div className="bg-[#FBF8F1] border border-[#D8CBB3] rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#7A3E1D]">
            <Calendar className="w-3.5 h-3.5 text-[#9E2A2B]" />
            <span>Sistem Kalender Dunia: {calendarSystem}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-tabular">
              {timeline.length} Tonggak Peristiwa ({uniqueEras.length} Era · Rentang{' '}
              {totalYearSpan} Tahun)
            </span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#231C14]">
            Pita Kronologi Dunia, Kalkulator Zaman & Sinkronisasi Sejarah
          </h2>
          <p className="text-xs sm:text-sm text-[#695A47]">
            Susun urutan tahun linier lintas era, hitung selisih usia tokoh antar peristiwa, dan hubungkan tonggak waktu langsung ke lembar Sejarah serta Alur Bab.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowCalculator((prev) => !prev)}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              showCalculator
                ? 'bg-[#231C14] text-[#FBF8F1] border-[#231C14]'
                : 'bg-[#F6F1E6] text-[#231C14] border-[#B5832A] hover:bg-[#EFE7D6]'
            }`}
          >
            <Calculator className="w-3.5 h-3.5 text-[#B5832A]" />
            Kalkulator Jarak Tahun & Usia
          </button>

          {historyEntities.length > 0 && (
            <button
              type="button"
              onClick={handleSyncAllFromHistoryTab}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold border border-[#D8CBB3] bg-[#F6F1E6] text-[#231C14] hover:bg-[#EFE7D6] flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              title="Tarik otomatis seluruh peristiwa dari tab Sejarah ke Pita Kronologi"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#7A3E1D]" />
              Sinkronkan dari Tab Sejarah ({historyEntities.length})
            </button>
          )}

          <button
            type="button"
            onClick={startCreatingNewEvent}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#9E2A2B] text-white hover:bg-[#7E2021] flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            + Catat Peristiwa Kronologi
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* INTERACTIVE TIME-SPAN & GENERATION / LIFESPAN CALCULATOR            */}
      {/* =================================================================== */}
      {showCalculator && (
        <div className="bg-[#FBF8F1] border-2 border-[#B5832A] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#D8CBB3] pb-3">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-[#9E2A2B]" />
              <div>
                <h3 className="font-display text-lg font-bold text-[#231C14]">
                  Kalkulator Rentang Waktu, Generasi & Usia Karakter Antar Peristiwa
                </h3>
                <p className="text-xs text-[#695A47]">
                  Bandingkan dua tonggak peristiwa (atau tahun cerita saat ini) untuk memeriksa konsistensi usia tokoh, masa hidup ras, dan jarak sejarah.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowCalculator(false)}
              className="p-1 text-[#695A47] hover:text-[#231C14] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-5 space-y-1.5">
              <label className="block text-xs font-semibold text-[#695A47]">
                Titik Waktu A (Peristiwa Awal / Kelahiran)
              </label>
              <select
                value={calcEventA?.id || ''}
                onChange={(e) => setCalcEventAId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg text-[#231C14] font-semibold"
              >
                {[...timeline]
                  .sort((a, b) => a.year - b.year)
                  .map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      [Tahun {ev.year}] {ev.title}
                    </option>
                  ))}
              </select>
            </div>

            <div className="md:col-span-2 text-center">
              <div className="inline-flex flex-col items-center px-4 py-2 rounded-xl bg-[#EFE7D6] border border-[#B5832A]">
                <span className="text-[10px] font-semibold text-[#695A47]">
                  SELISIH WAKTU
                </span>
                <span className="font-display text-xl font-bold text-[#9E2A2B] font-mono-tabular">
                  {deltaYears} Tahun
                </span>
              </div>
            </div>

            <div className="md:col-span-5 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#695A47]">
                  Titik Waktu B (Peristiwa Pembanding / Masa Kini)
                </label>
                <button
                  type="button"
                  onClick={() => setUsePresentYearForB((p) => !p)}
                  className="text-[11px] font-semibold text-[#9E2A2B] hover:underline cursor-pointer"
                >
                  {usePresentYearForB
                    ? 'Pilih dari Daftar Peristiwa'
                    : 'Ketik Tahun Manual (Masa Kini)'}
                </button>
              </div>

              {usePresentYearForB ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={customPresentYear}
                    onChange={(e) =>
                      setCustomPresentYear(Number(e.target.value))
                    }
                    className="w-full px-3 py-2 text-xs font-mono-tabular bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg text-[#231C14] font-semibold"
                    placeholder="Masukkan angka tahun cerita saat ini (misal: 412)..."
                  />
                  <span className="text-xs text-[#695A47] whitespace-nowrap">
                    (Tahun Cerita)
                  </span>
                </div>
              ) : (
                <select
                  value={calcEventB?.id || ''}
                  onChange={(e) => setCalcEventBId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg text-[#231C14] font-semibold"
                >
                  {[...timeline]
                    .sort((a, b) => a.year - b.year)
                    .map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        [Tahun {ev.year}] {ev.title}
                      </option>
                    ))}
                </select>
              )}
            </div>
          </div>

          {/* Biological & Generational Context Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-3 rounded-lg bg-[#F6F1E6] border border-[#D8CBB3]">
              <div className="text-[11px] text-[#695A47]">
                Skala Generasi Manusia (~25 thn/generasi)
              </div>
              <div className="text-sm font-bold text-[#231C14] font-mono-tabular mt-0.5">
                ≈ {humanGenerations} Generasi Manusia
              </div>
            </div>
            <div className="p-3 rounded-lg bg-[#F6F1E6] border border-[#D8CBB3]">
              <div className="text-[11px] text-[#695A47]">
                Skala Usia Dvergr Besi-Bintang (~350 thn hidup)
              </div>
              <div className="text-sm font-bold text-[#8F5B14] font-mono-tabular mt-0.5">
                ≈ {dvergrLifespans}× Rentang Hidup Dvergr
              </div>
            </div>
            <div className="p-3 rounded-lg bg-[#F6F1E6] border border-[#D8CBB3]">
              <div className="text-[11px] text-[#695A47]">
                Skala Usia Sylvan Aelfir (~700 thn hidup)
              </div>
              <div className="text-sm font-bold text-[#2D5A43] font-mono-tabular mt-0.5">
                ≈ {aelfirLifespans}× Rentang Hidup Aelfir
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* CREATE / EDIT TIMELINE EVENT FORM                                   */}
      {/* =================================================================== */}
      {showEditorForm && (
        <form
          onSubmit={handleSaveTimelineEvent}
          className="bg-[#FBF8F1] border-2 border-[#9E2A2B] rounded-xl p-5 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-[#D8CBB3] pb-3">
            <div>
              <span className="text-xs font-semibold text-[#9E2A2B]">
                {editingEventId
                  ? 'Penyuntingan Tonggak Kronologi'
                  : 'Pencatatan Tonggak Kronologi Baru'}
              </span>
              <h3 className="font-display text-xl font-bold text-[#231C14]">
                {draftTitle || 'Peristiwa Bersejarah Baru'}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowEditorForm(false);
                  setEditingEventId(null);
                }}
                className="px-3 py-1.5 text-xs border border-[#D8CBB3] rounded-lg text-[#695A47] hover:text-[#231C14] flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold bg-[#9E2A2B] text-white rounded-lg hover:bg-[#7E2021] flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                {editingEventId ? 'Simpan Perubahan' : 'Simpan ke Kronik'}
              </button>
            </div>
          </div>

          {/* Row 1: Era, Year, Display Date, Season/Phase */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                Era Penanggalan Sejarah
              </label>
              <div className="space-y-1">
                <select
                  value={
                    uniqueEras.includes(draftEra) ? draftEra : '__CUSTOM__'
                  }
                  onChange={(e) => {
                    if (e.target.value !== '__CUSTOM__') {
                      setDraftEra(e.target.value);
                    }
                  }}
                  className="w-full px-2.5 py-1.5 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg"
                >
                  {uniqueEras.map((er) => (
                    <option key={er} value={er}>
                      {er}
                    </option>
                  ))}
                  <option value="__CUSTOM__">+ Ketik Era Baru...</option>
                </select>
                <input
                  type="text"
                  value={draftEra}
                  onChange={(e) => setDraftEra(e.target.value)}
                  placeholder="Nama Era Sejarah..."
                  className="w-full px-2.5 py-1 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                Angka Tahun (Urutan Linier, boleh negatif untuk Pra-Era)
              </label>
              <input
                type="number"
                value={draftYear}
                onChange={(e) => setDraftYear(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs font-mono-tabular bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg font-semibold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                Label Penanggalan Kanon
              </label>
              <input
                type="text"
                value={draftDisplayDate}
                onChange={(e) => setDraftDisplayDate(e.target.value)}
                placeholder="Contoh: Tahun 214 PG · Musim Gugur"
                className="w-full px-3 py-1.5 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                Musim / Fase Langit / Konjungsi
              </label>
              <input
                type="text"
                value={draftSeasonOrPhase}
                onChange={(e) => setDraftSeasonOrPhase(e.target.value)}
                placeholder="Contoh: Malam Gerhana Ganda / Musim Dingin"
                className="w-full px-3 py-1.5 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg"
              />
            </div>
          </div>

          {/* Row 2: Title, Category, Hybrid Location Picker, Chapter Link */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2">
              <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                Judul Peristiwa Kronologi
              </label>
              <input
                type="text"
                required
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                placeholder="Contoh: Perang Rantai Besi & Kemerdekaan Valdoria..."
                className="w-full px-3 py-2 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg font-semibold text-[#231C14]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                Klasifikasi Jenis Peristiwa
              </label>
              <select
                value={draftCategory}
                onChange={(e) =>
                  setDraftCategory(e.target.value as TimelineEvent['category'])
                }
                className="w-full px-3 py-2 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg"
              >
                {TIMELINE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                Tautkan ke Bab Cerita (Opsional)
              </label>
              <select
                value={draftLinkedChapterId}
                onChange={(e) => setDraftLinkedChapterId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg"
              >
                <option value="">-- Tidak Ditautkan ke Bab --</option>
                {chapters.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    Bab {ch.chapterNumber}: {ch.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Hybrid Location Picker */}
          <div className="p-3 rounded-lg bg-[#F6F1E6] border border-[#D8CBB3] space-y-2">
            <label className="block text-[11px] font-semibold text-[#264653]">
              Lokasi Wilayah / Negara Kejadian (Pilih dari Wilayah/Negara/Peta atau Ketik Manual)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <select
                value={
                  regionAndNationEntities.some((r) => r.title === draftRegion)
                    ? draftRegion
                    : '__CUSTOM__'
                }
                onChange={(e) => {
                  if (e.target.value !== '__CUSTOM__') {
                    setDraftRegion(e.target.value);
                  }
                }}
                className="w-full px-2.5 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
              >
                <option value="__CUSTOM__">
                  -- Pilih dari Daftar Wilayah / Negara / Pin Peta atau Ketik --
                </option>
                {regionAndNationEntities.map((rn) => (
                  <option key={rn.id} value={rn.title}>
                    [{CATEGORY_META[rn.category].singular}] {rn.title}
                  </option>
                ))}
                {mapStamps.map((st) => (
                  <option key={st.id} value={st.label}>
                    [Pin Peta] {st.label}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={draftRegion}
                onChange={(e) => setDraftRegion(e.target.value)}
                placeholder="Ketik nama lokasi kejadian (misal: Teluk Naga / Puncak Wyvern)..."
                className="w-full px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
              />
            </div>
          </div>

          {/* Row 3: Summary, Consequence Impact, Secret Truth Note */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#231C14] mb-1">
                Uraian Ringkas Jalannya Peristiwa
              </label>
              <textarea
                rows={3}
                value={draftSummary}
                onChange={(e) => setDraftSummary(e.target.value)}
                placeholder="Apa yang terjadi pada tanggal ini? (Mendukung [[Nama Entitas]])..."
                className="w-full p-2.5 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#264653] mb-1">
                Dampak Langsung & Perubahan Peta Kekuasaan
              </label>
              <textarea
                rows={3}
                value={draftConsequenceImpact}
                onChange={(e) => setDraftConsequenceImpact(e.target.value)}
                placeholder="Konsekuensi politik, kehancuran, atau lahirnya hukum/negara baru..."
                className="w-full p-2.5 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#9E2A2B] mb-1">
                Catatan Rahasia Penulis / Kebenaran Tersembunyi
              </label>
              <textarea
                rows={3}
                value={draftSecretTruthNote}
                onChange={(e) => setDraftSecretTruthNote(e.target.value)}
                placeholder="Plot twist atau rahasia di balik layar yang tidak diketahui publik dunia..."
                className="w-full p-2.5 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg"
              />
            </div>
          </div>

          {/* Row 4: Multi-Entity Picker */}
          <div className="p-3.5 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-semibold text-[#231C14]">
                Entitas World Bible yang Terlibat ({draftLinkedEntityIds.length}{' '}
                Terpilih)
              </label>
              <div className="flex flex-wrap items-center gap-1">
                {(
                  [
                    { id: 'ALL', label: 'Semua' },
                    { id: 'character', label: 'Character' },
                    { id: 'nation', label: 'Negara' },
                    { id: 'faction', label: 'Kelompok' },
                    { id: 'race', label: 'Ras' },
                    { id: 'history', label: 'Sejarah' },
                    { id: 'encyclopedia', label: 'Artefak' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setEntityPickerFilter(tab.id)}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold cursor-pointer ${
                      entityPickerFilter === tab.id
                        ? 'bg-[#231C14] text-[#FBF8F1]'
                        : 'bg-[#EFE7D6] text-[#695A47] hover:text-[#231C14]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
              {entities
                .filter(
                  (e) =>
                    entityPickerFilter === 'ALL' ||
                    e.category === entityPickerFilter
                )
                .map((ent) => {
                  const selected = draftLinkedEntityIds.includes(ent.id);
                  return (
                    <button
                      key={ent.id}
                      type="button"
                      onClick={() => toggleDraftLinkedEntity(ent.id)}
                      className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors cursor-pointer ${
                        selected
                          ? 'bg-[#9E2A2B] text-white border-[#9E2A2B]'
                          : 'bg-[#FBF8F1] text-[#231C14] border-[#D8CBB3] hover:bg-[#EFE7D6]'
                      }`}
                    >
                      {selected ? '✓ ' : '+ '}[
                      {CATEGORY_META[ent.category].singular}] {ent.title}
                    </button>
                  );
                })}
            </div>
          </div>
        </form>
      )}

      {/* =================================================================== */}
      {/* FILTER BAR: SEARCH, ERA FILTER, CATEGORY FILTER & SORT ORDER        */}
      {/* =================================================================== */}
      <div className="bg-[#FBF8F1] border border-[#D8CBB3] rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-[#695A47] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari peristiwa, tahun, lokasi, tokoh terlibat, atau rahasia sejarah..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg text-[#231C14] placeholder:text-[#695A47] focus:outline-none focus:border-[#9E2A2B]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-[#695A47]">
              Filter Era:
            </span>
            <button
              type="button"
              onClick={() => setFilterEra('ALL')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                filterEra === 'ALL'
                  ? 'bg-[#7A3E1D] text-white'
                  : 'bg-[#EFE7D6] text-[#695A47] hover:text-[#231C14]'
              }`}
            >
              Semua Era
            </button>
            {uniqueEras.map((er) => (
              <button
                key={er}
                type="button"
                onClick={() => setFilterEra(er)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  filterEra === er
                    ? 'bg-[#7A3E1D] text-white'
                    : 'bg-[#EFE7D6] text-[#695A47] hover:text-[#231C14]'
                }`}
              >
                {er}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setSortAscending((prev) => !prev)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#F6F1E6] border border-[#D8CBB3] text-[#231C14] hover:bg-[#EFE7D6] flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowDownUp className="w-3.5 h-3.5 text-[#9E2A2B]" />
              <span>
                {sortAscending
                  ? 'Urutan: Kuno → Kini'
                  : 'Urutan: Kini → Kuno'}
              </span>
            </button>
          </div>
        </div>

        {/* Category Filter Row */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[#D8CBB3]/70">
          <span className="text-[11px] font-semibold text-[#695A47] mr-1">
            Jenis Peristiwa:
          </span>
          {(['ALL', ...TIMELINE_CATEGORIES] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                filterCategory === cat
                  ? 'bg-[#231C14] text-[#FBF8F1]'
                  : 'bg-[#EFE7D6] text-[#695A47] hover:text-[#231C14]'
              }`}
            >
              {cat === 'ALL' ? 'Semua Kategori' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* =================================================================== */}
      {/* ERA-GROUPED CHRONOLOGICAL SPINE WITH YEAR-GAP MARKERS               */}
      {/* =================================================================== */}
      {sortedTimeline.length === 0 ? (
        <div className="bg-[#FBF8F1] border border-[#D8CBB3] rounded-xl p-10 text-center space-y-3">
          <p className="text-sm text-[#695A47]">
            Belum ada catatan peristiwa di Pita Kronologi yang cocok dengan filter pencarian.
          </p>
          <button
            type="button"
            onClick={startCreatingNewEvent}
            className="px-4 py-2 text-xs font-semibold bg-[#9E2A2B] text-white rounded-lg cursor-pointer"
          >
            + Catat Peristiwa Kronologi Baru
          </button>
        </div>
      ) : (
        <div className="relative pl-6 md:pl-10 border-l-2 border-[#B5832A] space-y-6 ml-3">
          {sortedTimeline.map((item, idx) => {
            const prevItem = idx > 0 ? sortedTimeline[idx - 1] : null;
            const isNewEra = !prevItem || prevItem.era !== item.era;
            const yearDiff = prevItem ? Math.abs(item.year - prevItem.year) : null;

            const linkedEntities = entities.filter((e) =>
              item.linkedEntityIds.includes(e.id)
            );
            const matchedHistoryEntity = entities.find(
              (e) =>
                e.category === 'history' &&
                (item.linkedEntityIds.includes(e.id) ||
                  e.title.toLowerCase() === item.title.toLowerCase())
            );
            const matchedLocationEntity = findMatchingLocationEntity(
              item.regionName
            );
            const linkedChapter = item.linkedChapterId
              ? chapters.find((c) => c.id === item.linkedChapterId)
              : undefined;
            const catStyle =
              CATEGORY_ACCENT[item.category] || CATEGORY_ACCENT.Peperangan;

            return (
              <React.Fragment key={item.id}>
                {/* Year-Gap Elapsed Marker between consecutive events */}
                {yearDiff !== null && yearDiff > 0 && (
                  <div className="relative flex items-center gap-2 py-0.5">
                    <div className="w-2 h-2 rounded-full bg-[#B5832A] absolute -left-[29px] md:-left-[45px]" />
                    <span className="px-2.5 py-0.5 rounded bg-[#EFE7D6] border border-[#D8CBB3] text-[11px] font-mono-tabular font-semibold text-[#695A47]">
                      {sortAscending
                        ? `+ ${yearDiff} tahun kemudian`
                        : `- ${yearDiff} tahun sebelumnya`}
                    </span>
                  </div>
                )}

                {/* Era Divider Banner */}
                {isNewEra && (
                  <div className="relative pt-1">
                    <div className="w-4 h-4 rounded-full bg-[#B5832A] border-2 border-[#FBF8F1] absolute -left-[33px] md:-left-[49px] top-3.5" />
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#231C14] text-[#FBF8F1] text-xs font-semibold">
                      <Compass className="w-3.5 h-3.5 text-[#B5832A]" />
                      <span>Babak Era: {item.era}</span>
                    </div>
                  </div>
                )}

                {/* Event Card */}
                <div className="relative bg-[#FBF8F1] border border-[#D8CBB3] rounded-xl p-5 hover:border-[#B5832A] transition-colors space-y-3">
                  {/* Brass timeline node marker */}
                  <div
                    className={`w-3.5 h-3.5 rounded-full ${catStyle.dot} border-2 border-[#FBF8F1] absolute -left-[32px] md:-left-[48px] top-6`}
                  />

                  {/* Card Header: Date, Season, Category, Location & Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#695A47]">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-1 rounded bg-[#EFE7D6] border border-[#D8CBB3] font-mono-tabular font-bold text-[#9E2A2B]">
                        {item.displayDate} (Tahun {item.year})
                      </span>

                      <span
                        className={`px-2.5 py-1 rounded border text-[11px] font-semibold ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                      >
                        {item.category}
                      </span>

                      {item.seasonOrPhase && (
                        <span className="text-[11px] text-[#695A47] italic flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#B5832A]" />
                          {item.seasonOrPhase}
                        </span>
                      )}

                      {item.regionName && (
                        <>
                          <span aria-hidden="true">·</span>
                          {matchedLocationEntity ? (
                            <button
                              type="button"
                              onClick={() =>
                                onSelectEntity(matchedLocationEntity.id)
                              }
                              className="text-xs font-semibold text-[#264653] hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <MapPin className="w-3.5 h-3.5" />
                              <span>{item.regionName}</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </button>
                          ) : (
                            <span className="flex items-center gap-1 text-[#264653] font-medium">
                              <MapPin className="w-3.5 h-3.5" />
                              {item.regionName}
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    {/* Right Action Buttons: Open/Promote to History, Edit, Delete */}
                    <div className="flex items-center gap-1.5">
                      {matchedHistoryEntity ? (
                        <button
                          type="button"
                          onClick={() => onSelectEntity(matchedHistoryEntity.id)}
                          className="px-2.5 py-1 rounded-lg bg-[#EFE7D6] hover:bg-[#D8CBB3] border border-[#7A3E1D]/40 text-[11px] font-semibold text-[#7A3E1D] flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
                        >
                          <BookOpen className="w-3 h-3" />
                          <span>Buka Arsip Sejarah</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      ) : (
                        onSaveEntity && (
                          <button
                            type="button"
                            onClick={() => handlePromoteToHistoryCodex(item)}
                            className="px-2.5 py-1 rounded-lg bg-[#F6F1E6] hover:bg-[#EFE7D6] border border-[#B5832A] text-[11px] font-semibold text-[#231C14] flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
                            title="Buat lembar dokumen Sejarah lengkap dari peristiwa kronologi ini"
                          >
                            <Sparkles className="w-3 h-3 text-[#B5832A]" />
                            <span>+ Jadikan Lembar Sejarah</span>
                          </button>
                        )
                      )}

                      <button
                        type="button"
                        onClick={() => startEditingEvent(item)}
                        className="px-2.5 py-1 rounded-lg bg-[#231C14] text-[#FBF8F1] hover:bg-[#3A2E21] text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Sunting</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onUpdateTimeline(
                            timeline.filter((t) => t.id !== item.id)
                          )
                        }
                        className="p-1.5 rounded-lg border border-[#D8CBB3] text-[#695A47] hover:text-[#9E2A2B] cursor-pointer"
                        title="Hapus peristiwa kronologi"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Summary */}
                  <div>
                    <h3 className="font-display text-xl font-bold text-[#231C14]">
                      {item.title}
                    </h3>
                    <div className="text-sm text-[#231C14]/90 mt-1 leading-relaxed">
                      <WikiTextRenderer
                        text={item.summary}
                        entities={entities}
                        onSelectEntity={onSelectEntity}
                      />
                    </div>
                  </div>

                  {/* Consequence Impact & Secret Truth Note Comparison Cards */}
                  {(item.consequenceImpact || item.secretTruthNote) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      {item.consequenceImpact && (
                        <div className="p-3.5 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-1">
                          <div className="text-[11px] font-semibold text-[#264653] flex items-center gap-1.5">
                            <Flame className="w-3.5 h-3.5 text-[#8F5B14]" />
                            <span>
                              Dampak Geopolitik & Konsekuensi Sejarah
                            </span>
                          </div>
                          <div className="text-xs text-[#231C14] leading-relaxed">
                            <WikiTextRenderer
                              text={item.consequenceImpact}
                              entities={entities}
                              onSelectEntity={onSelectEntity}
                            />
                          </div>
                        </div>
                      )}

                      {item.secretTruthNote && (
                        <div className="p-3.5 rounded-xl bg-[#EFE7D6]/75 border border-[#D8CBB3] space-y-1">
                          <div className="text-[11px] font-semibold text-[#9E2A2B] flex items-center gap-1.5">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>
                              Catatan Rahasia Penulis / Kebenaran di Balik Layar
                            </span>
                          </div>
                          <div className="text-xs text-[#231C14] leading-relaxed">
                            <WikiTextRenderer
                              text={item.secretTruthNote}
                              entities={entities}
                              onSelectEntity={onSelectEntity}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Footer: Linked Entities & Linked Chapter */}
                  {(linkedEntities.length > 0 || linkedChapter) && (
                    <div className="pt-3 border-t border-[#D8CBB3]/70 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs font-medium text-[#695A47]">
                          Entitas Terlibat:
                        </span>
                        {linkedEntities.map((le) => (
                          <button
                            key={le.id}
                            type="button"
                            onClick={() => onSelectEntity(le.id)}
                            className="px-2.5 py-1 rounded bg-[#F6F1E6] hover:bg-[#EFE7D6] border border-[#D8CBB3] text-xs font-semibold text-[#231C14] flex items-center gap-1 cursor-pointer"
                          >
                            <span
                              className="text-[10px]"
                              style={{
                                color: CATEGORY_META[le.category].accentColor,
                              }}
                            >
                              [{CATEGORY_META[le.category].singular}]
                            </span>
                            <span>{le.title}</span>
                            <ArrowUpRight className="w-3 h-3 text-[#9E2A2B]" />
                          </button>
                        ))}
                      </div>

                      {linkedChapter && onOpenChapter && (
                        <button
                          type="button"
                          onClick={() => onOpenChapter(linkedChapter.id)}
                          className="px-3 py-1 rounded-lg bg-[#231C14] text-[#FBF8F1] hover:bg-[#3A2E21] text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-[#B5832A]" />
                          <span>
                            Direferensikan di Bab {linkedChapter.chapterNumber}:{' '}
                            {linkedChapter.title}
                          </span>
                          <ArrowUpRight className="w-3 h-3 text-[#B5832A]" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
};

interface RelationshipGraphViewProps {
  entities: LoreEntity[];
  relationships: RelationshipEdge[];
  nodePositions: GraphNodePosition[];
  onUpdateRelationships: (next: RelationshipEdge[]) => void;
  onUpdateNodePositions: (next: GraphNodePosition[]) => void;
  onSelectEntity: (id: string) => void;
}

const RELATION_STYLE: Record<
  RelationType,
  { label: string; color: string; dash?: string }
> = {
  ally: { label: 'Sekutu / Pakta', color: '#2D5A43' },
  rival: { label: 'Rival / Konflik', color: '#9E2A2B', dash: '6 4' },
  family: { label: 'Ikatan Darah', color: '#B5832A' },
  mentor: { label: 'Guru & Murid', color: '#264653' },
  vassal: { label: 'Bawahan / Upeti', color: '#695A47' },
  member: { label: 'Anggota / Penguasa', color: '#3B2E1E' },
  betrayed: { label: 'Pengkhianatan', color: '#9E2A2B', dash: '3 3' },
};

export const RelationshipGraphView: React.FC<RelationshipGraphViewProps> = ({
  entities,
  relationships,
  nodePositions,
  onUpdateRelationships,
  onUpdateNodePositions,
  onSelectEntity,
}) => {
  const boardRef = useRef<HTMLDivElement | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(
    relationships[0]?.id ?? null
  );

  const [sourceId, setSourceId] = useState<string>(entities[0]?.id || '');
  const [targetId, setTargetId] = useState<string>(entities[1]?.id || '');
  const [relType, setRelType] = useState<RelationType>('ally');
  const [relLabel, setRelLabel] = useState<string>('');
  const [relNotes, setRelNotes] = useState<string>('');

  // Ensure every entity appearing in relationships (or core characters/factions/nations) has a coordinate
  const graphEntities = entities.filter(
    (e) =>
      e.category === 'character' ||
      e.category === 'faction' ||
      e.category === 'nation' ||
      e.category === 'race' ||
      relationships.some((r) => r.sourceId === e.id || r.targetId === e.id)
  );

  const getPosition = (entityId: string, index: number) => {
    const found = nodePositions.find((p) => p.entityId === entityId);
    if (found) return found;
    const angle = (index / Math.max(1, graphEntities.length)) * Math.PI * 2;
    return {
      entityId,
      x: Math.round(450 + Math.cos(angle) * 260),
      y: Math.round(270 + Math.sin(angle) * 180),
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingNodeId || !boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    const x = Math.max(70, Math.min(850, Math.round(e.clientX - rect.left)));
    const y = Math.max(50, Math.min(500, Math.round(e.clientY - rect.top)));

    const exists = nodePositions.some((p) => p.entityId === draggingNodeId);
    if (exists) {
      onUpdateNodePositions(
        nodePositions.map((p) =>
          p.entityId === draggingNodeId ? { ...p, x, y } : p
        )
      );
    } else {
      onUpdateNodePositions([...nodePositions, { entityId: draggingNodeId, x, y }]);
    }
  };

  const handleAddRelationship = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceId || !targetId || sourceId === targetId) return;
    const created: RelationshipEdge = {
      id: `rel-${Date.now()}`,
      sourceId,
      targetId,
      type: relType,
      label: relLabel.trim() || RELATION_STYLE[relType].label,
      notes:
        relNotes.trim() ||
        'Hubungan diplomatik atau personal yang tercatat di dalam World Bible.',
    };
    onUpdateRelationships([...relationships, created]);
    setSelectedEdgeId(created.id);
    setRelLabel('');
    setRelNotes('');
  };

  const selectedEdge =
    relationships.find((r) => r.id === selectedEdgeId) || relationships[0] || null;

  return (
    <div className="space-y-5">
      <div className="bg-[#FBF8F1] border border-[#D8CBB3] rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs text-[#695A47]">
            Jaringan Politik, Silsilah & Afiliasi Faksi (Geser node untuk menata peta relasi)
          </div>
          <h2 className="font-display text-2xl font-bold text-[#231C14]">
            Relationship Graph Karakter & Faksi
          </h2>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-[#695A47]">
          {Object.entries(RELATION_STYLE).map(([k, v]) => (
            <div key={k} className="flex items-center gap-1.5">
              <span
                className="w-4 h-0.5 inline-block"
                style={{ backgroundColor: v.color }}
              />
              <span>{v.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Interactive SVG + Draggable Node Canvas */}
        <div className="xl:col-span-8 bg-[#EFE7D6] border border-[#D8CBB3] rounded-xl p-3 overflow-x-auto">
          <div
            ref={boardRef}
            onPointerMove={handlePointerMove}
            onPointerUp={() => setDraggingNodeId(null)}
            onPointerLeave={() => setDraggingNodeId(null)}
            className="relative w-[920px] h-[550px] bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg select-none overflow-hidden"
          >
            {/* SVG Edges */}
            <svg className="w-full h-full absolute inset-0 pointer-events-none">
              {relationships.map((edge) => {
                const sIdx = graphEntities.findIndex((e) => e.id === edge.sourceId);
                const tIdx = graphEntities.findIndex((e) => e.id === edge.targetId);
                if (sIdx === -1 || tIdx === -1) return null;
                const sPos = getPosition(edge.sourceId, sIdx);
                const tPos = getPosition(edge.targetId, tIdx);
                const style = RELATION_STYLE[edge.type] || RELATION_STYLE.ally;
                const midX = (sPos.x + tPos.x) / 2;
                const midY = (sPos.y + tPos.y) / 2;
                const isSelected = selectedEdge?.id === edge.id;

                return (
                  <g key={edge.id}>
                    <line
                      x1={sPos.x}
                      y1={sPos.y}
                      x2={tPos.x}
                      y2={tPos.y}
                      stroke={style.color}
                      strokeWidth={isSelected ? 3.2 : 2}
                      strokeDasharray={style.dash}
                      opacity={isSelected ? 1 : 0.75}
                    />
                    <rect
                      x={midX - 68}
                      y={midY - 11}
                      width={136}
                      height={22}
                      rx={4}
                      fill="#FBF8F1"
                      stroke={style.color}
                      strokeWidth={1}
                    />
                    <text
                      x={midX}
                      y={midY + 4}
                      textAnchor="middle"
                      fill="#231C14"
                      fontSize="10"
                      fontWeight="600"
                    >
                      {edge.label.slice(0, 22)}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Draggable Entity Nodes */}
            {graphEntities.map((ent, idx) => {
              const pos = getPosition(ent.id, idx);
              const meta = CATEGORY_META[ent.category];
              return (
                <div
                  key={ent.id}
                  style={{
                    left: `${pos.x}px`,
                    top: `${pos.y}px`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    setDraggingNodeId(ent.id);
                  }}
                  className="absolute z-10 w-44 bg-[#FBF8F1] border-2 border-[#3B2E1E] rounded-xl p-2.5 shadow-xs cursor-grab active:cursor-grabbing hover:border-[#9E2A2B] transition-colors"
                >
                  <div className="flex items-center justify-between text-[10px] text-[#695A47]">
                    <span
                      className="font-semibold"
                      style={{ color: meta.accentColor }}
                    >
                      {meta.singular}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEntity(ent.id);
                      }}
                      className="text-[#9E2A2B] hover:underline font-semibold cursor-pointer"
                    >
                      Buka →
                    </button>
                  </div>
                  <div className="font-display text-sm font-bold text-[#231C14] truncate mt-0.5">
                    {ent.title}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Relationship Editor & Inspector */}
        <div className="xl:col-span-4 space-y-4">
          <form
            onSubmit={handleAddRelationship}
            className="bg-[#FBF8F1] border border-[#D8CBB3] rounded-xl p-4 space-y-3"
          >
            <div className="flex items-center gap-2 border-b border-[#D8CBB3] pb-2.5">
              <GitBranch className="w-4 h-4 text-[#9E2A2B]" />
              <h3 className="font-display text-lg font-bold text-[#231C14]">
                Tambah Ikatan Relasi Baru
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              <div>
                <label className="block text-xs text-[#695A47] mb-1">
                  Entitas Pertama
                </label>
                <select
                  value={sourceId}
                  onChange={(e) => setSourceId(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg"
                >
                  {graphEntities.map((e) => (
                    <option key={e.id} value={e.id}>
                      [{CATEGORY_META[e.category].singular}] {e.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-[#695A47] mb-1">
                  Entitas Kedua
                </label>
                <select
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg"
                >
                  {graphEntities.map((e) => (
                    <option key={e.id} value={e.id}>
                      [{CATEGORY_META[e.category].singular}] {e.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-[#695A47] mb-1">
                    Sifat Hubungan
                  </label>
                  <select
                    value={relType}
                    onChange={(e) => setRelType(e.target.value as RelationType)}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg"
                  >
                    {Object.entries(RELATION_STYLE).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#695A47] mb-1">
                    Label Singkat
                  </label>
                  <input
                    type="text"
                    value={relLabel}
                    onChange={(e) => setRelLabel(e.target.value)}
                    placeholder="Contoh: Sumpah Setia"
                    className="w-full px-2.5 py-1.5 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg"
                  />
                </div>
              </div>

              <input
                type="text"
                value={relNotes}
                onChange={(e) => setRelNotes(e.target.value)}
                placeholder="Catatan dinamika konflik atau sejarah hubungan..."
                className="w-full px-3 py-1.5 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg"
              />

              <button
                type="submit"
                className="w-full py-2 text-xs font-semibold bg-[#9E2A2B] text-white rounded-lg hover:bg-[#7E2021] transition-colors cursor-pointer"
              >
                Hubungkan Kedua Entitas
              </button>
            </div>
          </form>

          {/* List of active edges */}
          <div className="bg-[#FBF8F1] border border-[#D8CBB3] rounded-xl p-4 space-y-2.5">
            <div className="text-xs font-semibold text-[#695A47]">
              Daftar Hubungan Terdaftar ({relationships.length})
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {relationships.map((r) => {
                const sEnt = entities.find((e) => e.id === r.sourceId);
                const tEnt = entities.find((e) => e.id === r.targetId);
                if (!sEnt || !tEnt) return null;
                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedEdgeId(r.id)}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition-colors ${
                      selectedEdge?.id === r.id
                        ? 'bg-[#EFE7D6] border-[#9E2A2B]'
                        : 'bg-[#F6F1E6] border-[#D8CBB3]'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold text-[#231C14]">
                      <span>
                        {sEnt.title} ↔ {tEnt.title}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateRelationships(
                            relationships.filter((item) => item.id !== r.id)
                          );
                        }}
                        className="text-[#695A47] hover:text-[#9E2A2B] cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="text-[11px] text-[#9E2A2B] font-medium mt-0.5">
                      {RELATION_STYLE[r.type].label} · {r.label}
                    </div>
                    <p className="text-[11px] text-[#695A47] mt-1">{r.notes}</p>
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
