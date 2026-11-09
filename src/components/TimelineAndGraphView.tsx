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
  Eye,
  EyeOff,
  Flame,
  GitBranch,
  LayoutGrid,
  MapPin,
  Maximize2,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  Trash2,
  User,
  Users,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { STARTER_WORLD_PROJECT } from '../data/starterWorld';
import {
  ChapterOutline,
  GraphNodePosition,
  LoreAttributes,
  LoreCategory,
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

    // Also auto-sync linked History document in World Bible if one is connected
    if (onSaveEntity) {
      const matchedHist = entities.find(
        (ent) =>
          ent.category === 'history' &&
          (payload.linkedEntityIds.includes(ent.id) ||
            ent.title.toLowerCase() === payload.title.toLowerCase())
      );
      if (matchedHist) {
        onSaveEntity({
          ...matchedHist,
          title: payload.title,
          summary: payload.summary || matchedHist.summary,
          attributes: {
            ...matchedHist.attributes,
            era: payload.era,
            year: payload.year,
            displayDate: payload.displayDate,
            eventLocation:
              payload.regionName || matchedHist.attributes.eventLocation,
            worldImpactLegacy:
              payload.consequenceImpact ||
              matchedHist.attributes.worldImpactLegacy,
            hiddenHistoricalTruth:
              payload.secretTruthNote ||
              matchedHist.attributes.hiddenHistoricalTruth,
          },
          updatedAt: new Date().toISOString().slice(0, 10),
        });
      }
    }

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
  ally: { label: 'Sekutu / Pakta', color: 'var(--accent-forest)' },
  rival: { label: 'Rival / Konflik', color: 'var(--accent-wax)', dash: '6 4' },
  family: { label: 'Ikatan Darah', color: 'var(--accent-brass)' },
  mentor: { label: 'Guru & Murid', color: 'var(--accent-cartography)' },
  vassal: { label: 'Bawahan / Upeti', color: 'var(--accent-amber)' },
  member: { label: 'Anggota / Penguasa', color: 'var(--ink-secondary)' },
  betrayed: { label: 'Pengkhianatan', color: 'var(--accent-wax)', dash: '3 3' },
};

const VISIBILITY_PRESETS = [
  'Publik / Diketahui Umum',
  'Rahasia di Balik Layar (Konspirasi)',
  'Terselubung / Disamarkan',
  'Hanya Diketahui Satu Pihak',
];

const TENSION_LOYALTY_PRESETS = [
  'Sumpah Mati / Tak Terputuskan',
  'Aliansi Strategis Saling Percaya',
  'Aliansi Taktis / Penuh Curiga',
  'Otoritas Mutlak namun Ditekan Senat',
  'Ketegangan Dingin & Rasa Hormat Lama',
  'Ambang Perang Terbuka',
  'Dendam Mematikan',
];

function getEnrichedEntityAttributes(entity: LoreEntity): LoreAttributes {
  const starterMatch = STARTER_WORLD_PROJECT.entities.find(
    (s) => s.id === entity.id
  );
  if (!starterMatch) return entity.attributes;
  return {
    ...starterMatch.attributes,
    ...entity.attributes,
  };
}

interface DetectedSuggestion {
  key: string;
  sourceId: string;
  targetId: string;
  type: RelationType;
  label: string;
  notes: string;
  visibilityStatus: string;
  tensionOrLoyalty: string;
  directionality: 'bidirectional' | 'directed';
  originHistory: string;
}

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

  // Canvas Filter, Focus Mode (Ego-Network), Search & Zoom State
  const [nodeCategoryFilter, setNodeCategoryFilter] = useState<string>('ALL');
  const [edgeTypeFilter, setEdgeTypeFilter] = useState<string>('ALL');
  const [focusedEntityId, setFocusedEntityId] = useState<string>('');
  const [graphSearchQuery, setGraphSearchQuery] = useState<string>('');
  const [canvasZoom, setCanvasZoom] = useState<number>(1);
  const [showDetectorPanel, setShowDetectorPanel] = useState<boolean>(false);
  const [syncBannerMessage, setSyncBannerMessage] = useState<string>('');

  // Create / Edit Relationship Form State
  const [editingEdgeId, setEditingEdgeId] = useState<string | null>(null);
  const [sourceId, setSourceId] = useState<string>(entities[0]?.id || '');
  const [targetId, setTargetId] = useState<string>(entities[1]?.id || '');
  const [relType, setRelType] = useState<RelationType>('ally');
  const [relLabel, setRelLabel] = useState<string>('');
  const [relNotes, setRelNotes] = useState<string>('');
  const [relVisibility, setRelVisibility] = useState<string>(
    'Publik / Diketahui Umum'
  );
  const [relTension, setRelTension] = useState<string>(
    'Aliansi Strategis Saling Percaya'
  );
  const [relDirectionality, setRelDirectionality] = useState<
    'bidirectional' | 'directed'
  >('bidirectional');
  const [relOriginHistory, setRelOriginHistory] = useState<string>('');
  const [relStoryEvolution, setRelStoryEvolution] = useState<string>('');

  // Entities eligible for the Relationship Graph
  const allGraphCandidateEntities = useMemo(() => {
    return entities.filter(
      (e) =>
        e.category === 'character' ||
        e.category === 'faction' ||
        e.category === 'nation' ||
        e.category === 'race' ||
        relationships.some((r) => r.sourceId === e.id || r.targetId === e.id)
    );
  }, [entities, relationships]);

  // Helper to check if an edge is secret / covert
  const isSecretEdge = (edge: RelationshipEdge) => {
    const v = (edge.visibilityStatus || '').toLowerCase();
    return (
      v.includes('rahasia') ||
      v.includes('terselubung') ||
      v.includes('konspirasi') ||
      v.includes('satu pihak') ||
      edge.type === 'betrayed'
    );
  };

  // Filtered Edges based on edgeTypeFilter, focusedEntityId, and graphSearchQuery
  const visibleEdges = useMemo(() => {
    return relationships.filter((edge) => {
      if (edgeTypeFilter === 'SECRET_ONLY') {
        if (!isSecretEdge(edge)) return false;
      } else if (edgeTypeFilter !== 'ALL' && edge.type !== edgeTypeFilter) {
        return false;
      }

      const sEnt = entities.find((e) => e.id === edge.sourceId);
      const tEnt = entities.find((e) => e.id === edge.targetId);
      if (!sEnt || !tEnt) return false;

      if (nodeCategoryFilter !== 'ALL') {
        if (
          sEnt.category !== nodeCategoryFilter &&
          tEnt.category !== nodeCategoryFilter
        ) {
          return false;
        }
      }

      if (graphSearchQuery.trim()) {
        const q = graphSearchQuery.toLowerCase();
        const matchEdge =
          edge.label.toLowerCase().includes(q) ||
          edge.notes.toLowerCase().includes(q) ||
          (edge.originHistory || '').toLowerCase().includes(q) ||
          (edge.storyEvolution || '').toLowerCase().includes(q) ||
          (edge.visibilityStatus || '').toLowerCase().includes(q) ||
          (edge.tensionOrLoyalty || '').toLowerCase().includes(q) ||
          sEnt.title.toLowerCase().includes(q) ||
          tEnt.title.toLowerCase().includes(q);
        if (!matchEdge) return false;
      }

      return true;
    });
  }, [
    relationships,
    edgeTypeFilter,
    nodeCategoryFilter,
    graphSearchQuery,
    entities,
  ]);

  // Visible Nodes on Canvas
  const visibleNodes = useMemo(() => {
    return allGraphCandidateEntities.filter((ent) => {
      if (nodeCategoryFilter !== 'ALL') {
        const connectedToFilter = visibleEdges.some(
          (r) => r.sourceId === ent.id || r.targetId === ent.id
        );
        if (ent.category !== nodeCategoryFilter && !connectedToFilter) {
          return false;
        }
      }
      if (graphSearchQuery.trim()) {
        const q = graphSearchQuery.toLowerCase();
        const inVisibleEdge = visibleEdges.some(
          (r) => r.sourceId === ent.id || r.targetId === ent.id
        );
        if (
          !ent.title.toLowerCase().includes(q) &&
          !ent.subtitle.toLowerCase().includes(q) &&
          !inVisibleEdge
        ) {
          return false;
        }
      }
      return true;
    });
  }, [
    allGraphCandidateEntities,
    nodeCategoryFilter,
    graphSearchQuery,
    visibleEdges,
  ]);

  // Ego-Network Focus Set (Focused entity + 1st degree neighbors)
  const egoNeighborIds = useMemo(() => {
    if (!focusedEntityId) return null;
    const set = new Set<string>([focusedEntityId]);
    relationships.forEach((r) => {
      if (r.sourceId === focusedEntityId) set.add(r.targetId);
      if (r.targetId === focusedEntityId) set.add(r.sourceId);
    });
    return set;
  }, [focusedEntityId, relationships]);

  // Automatic Detector of Implicit Relationships from World Bible Attributes
  const detectedSuggestions = useMemo<DetectedSuggestion[]>(() => {
    const suggestions: DetectedSuggestion[] = [];

    const hasExistingPair = (idA: string, idB: string) =>
      relationships.some(
        (r) =>
          (r.sourceId === idA && r.targetId === idB) ||
          (r.sourceId === idB && r.targetId === idA)
      ) ||
      suggestions.some(
        (s) =>
          (s.sourceId === idA && s.targetId === idB) ||
          (s.sourceId === idB && s.targetId === idA)
      );

    const findByName = (
      rawName: string | undefined,
      preferredCat?: LoreCategory
    ) => {
      if (!rawName) return undefined;
      const clean = rawName.trim().toLowerCase();
      if (!clean || clean.length < 3) return undefined;
      if (preferredCat) {
        const exactCat = entities.find(
          (e) =>
            e.category === preferredCat &&
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

    entities.forEach((ent) => {
      const attrs = getEnrichedEntityAttributes(ent);

      // 1. Character -> Faction (factionName)
      if (ent.category === 'character' && attrs.factionName) {
        const fac = findByName(attrs.factionName, 'faction');
        if (fac && fac.id !== ent.id && !hasExistingPair(ent.id, fac.id)) {
          suggestions.push({
            key: `${ent.id}-${fac.id}-faction`,
            sourceId: ent.id,
            targetId: fac.id,
            type: 'member',
            label: `Anggota / Afiliasi ${fac.title}`,
            notes: `Tercatat dari atribut Afiliasi Kelompok pada lembar profil ${ent.title}.`,
            visibilityStatus: 'Publik / Diketahui Umum',
            tensionOrLoyalty: 'Sumpah Mati / Tak Terputuskan',
            directionality: 'directed',
            originHistory: `Bergabung dengan [[${fac.title}]] sebagaimana tercatat di World Bible.`,
          });
        }
      }

      // 2. Character -> Race (raceName)
      if (ent.category === 'character' && attrs.raceName) {
        const rc = findByName(attrs.raceName, 'race');
        if (rc && rc.id !== ent.id && !hasExistingPair(ent.id, rc.id)) {
          suggestions.push({
            key: `${ent.id}-${rc.id}-race`,
            sourceId: ent.id,
            targetId: rc.id,
            type: 'family',
            label: `Garis Darah ${rc.title}`,
            notes: `${ent.title} merupakan keturunan atau anggota ras ${rc.title}.`,
            visibilityStatus: 'Publik / Diketahui Umum',
            tensionOrLoyalty: 'Ikatan Kelahiran & Warisan Darah',
            directionality: 'directed',
            originHistory: `Mewarisi garis keturunan bangsa [[${rc.title}]].`,
          });
        }
      }

      // 3. Character -> Nation (originNation)
      if (ent.category === 'character' && attrs.originNation) {
        const nat = findByName(attrs.originNation, 'nation');
        if (nat && nat.id !== ent.id && !hasExistingPair(ent.id, nat.id)) {
          suggestions.push({
            key: `${ent.id}-${nat.id}-origin`,
            sourceId: ent.id,
            targetId: nat.id,
            type: 'vassal',
            label: `Warga / Asal ${nat.title}`,
            notes: `${ent.title} berasal dari atau memiliki ikatan kedaulatan dengan ${nat.title}.`,
            visibilityStatus: 'Publik / Diketahui Umum',
            tensionOrLoyalty: 'Ikatan Tanah Kelahiran',
            directionality: 'directed',
            originHistory: `Tercatat berasal dari wilayah kedaulatan [[${nat.title}]].`,
          });
        }
      }

      // 4. Faction -> Character (leader)
      if (ent.category === 'faction' && attrs.leader) {
        const leaderChar = findByName(attrs.leader, 'character');
        if (
          leaderChar &&
          leaderChar.id !== ent.id &&
          !hasExistingPair(leaderChar.id, ent.id)
        ) {
          suggestions.push({
            key: `${leaderChar.id}-${ent.id}-leader`,
            sourceId: leaderChar.id,
            targetId: ent.id,
            type: 'member',
            label: `Pucuk Pimpinan ${ent.title}`,
            notes: `${leaderChar.title} memimpin organisasi ${ent.title}.`,
            visibilityStatus: 'Publik / Diketahui Umum',
            tensionOrLoyalty: 'Otoritas Pimpinan Tertinggi',
            directionality: 'directed',
            originHistory: `Memegang pucuk pimpinan [[${ent.title}]].`,
          });
        }
      }

      // 5. Nation -> Character (ruler)
      if (ent.category === 'nation' && attrs.ruler) {
        const rulerChar = findByName(attrs.ruler, 'character');
        if (
          rulerChar &&
          rulerChar.id !== ent.id &&
          !hasExistingPair(rulerChar.id, ent.id)
        ) {
          suggestions.push({
            key: `${rulerChar.id}-${ent.id}-ruler`,
            sourceId: rulerChar.id,
            targetId: ent.id,
            type: 'member',
            label: `Penguasa Kedaulatan ${ent.title}`,
            notes: `${rulerChar.title} tercatat sebagai penguasa tertinggi ${ent.title}.`,
            visibilityStatus: 'Publik / Diketahui Umum',
            tensionOrLoyalty: 'Otoritas Mahkota / Negara',
            directionality: 'directed',
            originHistory: `Memerintah [[${ent.title}]] dari kursi kekuasaan.`,
          });
        }
      }

      // 6. Nation -> Dominant Races (dominantRaces)
      if (ent.category === 'nation' && attrs.dominantRaces) {
        attrs.dominantRaces.forEach((rName) => {
          const rc = findByName(rName, 'race');
          if (rc && rc.id !== ent.id && !hasExistingPair(rc.id, ent.id)) {
            suggestions.push({
              key: `${rc.id}-${ent.id}-domrace`,
              sourceId: rc.id,
              targetId: ent.id,
              type: 'ally',
              label: `Populasi Mayoritas di ${ent.title}`,
              notes: `Bangsa ${rc.title} tercatat sebagai demografi mayoritas di ${ent.title}.`,
              visibilityStatus: 'Publik / Diketahui Umum',
              tensionOrLoyalty: 'Pilar Demografi Negara',
              directionality: 'bidirectional',
              originHistory: `Menjadi salah satu bangsa utama pembentuk [[${ent.title}]].`,
            });
          }
        });
      }
    });

    return suggestions;
  }, [entities, relationships]);

  const getPosition = (entityId: string, index: number) => {
    const found = nodePositions.find((p) => p.entityId === entityId);
    if (found) return found;
    const total = Math.max(1, allGraphCandidateEntities.length);
    const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
    return {
      entityId,
      x: Math.round(460 + Math.cos(angle) * 280),
      y: Math.round(280 + Math.sin(angle) * 195),
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingNodeId || !boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    const rawX = (e.clientX - rect.left) / canvasZoom;
    const rawY = (e.clientY - rect.top) / canvasZoom;
    const x = Math.max(95, Math.min(865, Math.round(rawX)));
    const y = Math.max(55, Math.min(525, Math.round(rawY)));

    const exists = nodePositions.some((p) => p.entityId === draggingNodeId);
    if (exists) {
      onUpdateNodePositions(
        nodePositions.map((p) =>
          p.entityId === draggingNodeId ? { ...p, x, y } : p
        )
      );
    } else {
      onUpdateNodePositions([
        ...nodePositions,
        { entityId: draggingNodeId, x, y },
      ]);
    }
  };

  // Auto-Layout 1: Radial / Circular Layout
  const handleApplyCircularLayout = () => {
    const total = Math.max(1, allGraphCandidateEntities.length);
    const nextPositions: GraphNodePosition[] = allGraphCandidateEntities.map(
      (ent, idx) => {
        const angle = (idx / total) * Math.PI * 2 - Math.PI / 2;
        return {
          entityId: ent.id,
          x: Math.round(480 + Math.cos(angle) * 310),
          y: Math.round(290 + Math.sin(angle) * 210),
        };
      }
    );
    onUpdateNodePositions(nextPositions);
    setSyncBannerMessage(
      'Tata Letak Lingkaran Kosmik diterapkan pada seluruh node!'
    );
  };

  // Auto-Layout 2: Category Hierarchy Cluster Layout (Nations Top -> Factions/Races Mid -> Characters Bottom)
  const handleApplyHierarchyClusterLayout = () => {
    const topTier = allGraphCandidateEntities.filter(
      (e) => e.category === 'nation' || e.category === 'region'
    );
    const midTier = allGraphCandidateEntities.filter(
      (e) =>
        e.category === 'faction' ||
        e.category === 'race' ||
        (e.category !== 'nation' &&
          e.category !== 'region' &&
          e.category !== 'character')
    );
    const bottomTier = allGraphCandidateEntities.filter(
      (e) => e.category === 'character'
    );

    const spreadRow = (rowEntities: LoreEntity[], yCoord: number) => {
      const count = rowEntities.length;
      if (count === 0) return [];
      const minX = 160;
      const maxX = 800;
      return rowEntities.map((ent, i) => ({
        entityId: ent.id,
        x:
          count === 1
            ? 480
            : Math.round(minX + (i / (count - 1)) * (maxX - minX)),
        y: yCoord,
      }));
    };

    const nextPositions: GraphNodePosition[] = [
      ...spreadRow(topTier, 105),
      ...spreadRow(midTier, 290),
      ...spreadRow(bottomTier, 475),
    ];
    onUpdateNodePositions(nextPositions);
    setSyncBannerMessage(
      'Tata Letak Klaster Hierarki (Negara → Kelompok/Ras → Tokoh) diterapkan!'
    );
  };

  const resetForm = () => {
    setEditingEdgeId(null);
    setRelLabel('');
    setRelNotes('');
    setRelVisibility('Publik / Diketahui Umum');
    setRelTension('Aliansi Strategis Saling Percaya');
    setRelDirectionality('bidirectional');
    setRelOriginHistory('');
    setRelStoryEvolution('');
  };

  const startEditingEdge = (edge: RelationshipEdge) => {
    setEditingEdgeId(edge.id);
    setSelectedEdgeId(edge.id);
    setSourceId(edge.sourceId);
    setTargetId(edge.targetId);
    setRelType(edge.type);
    setRelLabel(edge.label);
    setRelNotes(edge.notes);
    setRelVisibility(edge.visibilityStatus || 'Publik / Diketahui Umum');
    setRelTension(edge.tensionOrLoyalty || 'Aliansi Strategis Saling Percaya');
    setRelDirectionality(edge.directionality || 'bidirectional');
    setRelOriginHistory(edge.originHistory || '');
    setRelStoryEvolution(edge.storyEvolution || '');
  };

  const handleSaveRelationship = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceId || !targetId || sourceId === targetId) return;

    if (editingEdgeId) {
      const updatedEdge: RelationshipEdge = {
        id: editingEdgeId,
        sourceId,
        targetId,
        type: relType,
        label: relLabel.trim() || RELATION_STYLE[relType].label,
        notes:
          relNotes.trim() ||
          'Hubungan diplomatik atau personal yang tercatat di dalam World Bible.',
        visibilityStatus: relVisibility.trim() || 'Publik / Diketahui Umum',
        tensionOrLoyalty: relTension.trim() || undefined,
        directionality: relDirectionality,
        originHistory: relOriginHistory.trim() || undefined,
        storyEvolution: relStoryEvolution.trim() || undefined,
      };
      onUpdateRelationships(
        relationships.map((r) => (r.id === editingEdgeId ? updatedEdge : r))
      );
      setSelectedEdgeId(updatedEdge.id);
      setSyncBannerMessage('Ikatan relasi berhasil diperbarui!');
      resetForm();
    } else {
      const created: RelationshipEdge = {
        id: `rel-${Date.now()}`,
        sourceId,
        targetId,
        type: relType,
        label: relLabel.trim() || RELATION_STYLE[relType].label,
        notes:
          relNotes.trim() ||
          'Hubungan diplomatik atau personal yang tercatat di dalam World Bible.',
        visibilityStatus: relVisibility.trim() || 'Publik / Diketahui Umum',
        tensionOrLoyalty: relTension.trim() || undefined,
        directionality: relDirectionality,
        originHistory: relOriginHistory.trim() || undefined,
        storyEvolution: relStoryEvolution.trim() || undefined,
      };
      onUpdateRelationships([created, ...relationships]);
      setSelectedEdgeId(created.id);
      setSyncBannerMessage('Ikatan relasi baru berhasil ditambahkan ke kanvas!');
      resetForm();
    }
  };

  const handleImportSingleSuggestion = (sug: DetectedSuggestion) => {
    const created: RelationshipEdge = {
      id: `rel-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      sourceId: sug.sourceId,
      targetId: sug.targetId,
      type: sug.type,
      label: sug.label,
      notes: sug.notes,
      visibilityStatus: sug.visibilityStatus,
      tensionOrLoyalty: sug.tensionOrLoyalty,
      directionality: sug.directionality,
      originHistory: sug.originHistory,
    };
    onUpdateRelationships([...relationships, created]);
    setSelectedEdgeId(created.id);
    setSyncBannerMessage(`Berhasil mengimpor ikatan "${sug.label}"!`);
  };

  const handleImportAllSuggestions = () => {
    if (detectedSuggestions.length === 0) return;
    const now = Date.now();
    const imported: RelationshipEdge[] = detectedSuggestions.map((sug, idx) => ({
      id: `rel-${now}-${idx}`,
      sourceId: sug.sourceId,
      targetId: sug.targetId,
      type: sug.type,
      label: sug.label,
      notes: sug.notes,
      visibilityStatus: sug.visibilityStatus,
      tensionOrLoyalty: sug.tensionOrLoyalty,
      directionality: sug.directionality,
      originHistory: sug.originHistory,
    }));
    onUpdateRelationships([...relationships, ...imported]);
    setSelectedEdgeId(imported[0].id);
    setSyncBannerMessage(
      `Berhasil menyinkronkan ${imported.length} ikatan otomatis dari atribut World Bible!`
    );
  };

  const selectedEdge =
    relationships.find((r) => r.id === selectedEdgeId) ||
    visibleEdges[0] ||
    relationships[0] ||
    null;

  const secretEdgeCount = relationships.filter(isSecretEdge).length;
  const conflictEdgeCount = relationships.filter(
    (r) => r.type === 'rival' || r.type === 'betrayed'
  ).length;

  return (
    <div className="space-y-5">
      {/* =================================================================== */}
      {/* HEADER BAR & NETWORK TELEMETRY METRICS                              */}
      {/* =================================================================== */}
      <div className="bg-[#FBF8F1] border border-[#D8CBB3] rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-[#9E2A2B]">
              Modul World Bible · {allGraphCandidateEntities.length} Node Entitas
              · {relationships.length} Ikatan Relasi Tercatat
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#231C14]">
              Peta Relasi Politik, Silsilah & Intrik Dunia
            </h2>
            <p className="text-xs sm:text-sm text-[#695A47] mt-0.5">
              Petakan aliansi terbuka, konspirasi di balik layar, silsilah
              darah, dan rantai komando antar karakter, kelompok, ras, maupun
              negara.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowDetectorPanel((p) => !p)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                showDetectorPanel || detectedSuggestions.length > 0
                  ? 'bg-[#F6F1E6] border-[#B5832A] text-[#231C14] hover:bg-[#EFE7D6]'
                  : 'bg-[#F6F1E6] border-[#D8CBB3] text-[#695A47] hover:text-[#231C14]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#B5832A]" />
              <span>
                Deteksi Otomatis World Bible ({detectedSuggestions.length})
              </span>
            </button>

            <button
              type="button"
              onClick={handleApplyCircularLayout}
              className="px-3 py-2 rounded-lg text-xs font-semibold bg-[#F6F1E6] border border-[#D8CBB3] text-[#231C14] hover:bg-[#EFE7D6] flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              title="Susun seluruh node secara melingkar"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#264653]" />
              <span>Tata Letak Lingkaran</span>
            </button>

            <button
              type="button"
              onClick={handleApplyHierarchyClusterLayout}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#231C14] text-[#FBF8F1] hover:bg-[#3A2E21] flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              title="Susun berdasarkan hierarki: Negara di atas, Kelompok/Ras di tengah, Tokoh di bawah"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-[#B5832A]" />
              <span>Klaster Hierarki</span>
            </button>
          </div>
        </div>

        {/* Summary Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3 rounded-lg bg-[#F6F1E6] border border-[#D8CBB3]">
            <div className="text-[11px] text-[#695A47]">
              Total Simpul (Node) Aktif
            </div>
            <div className="font-display text-xl font-bold text-[#231C14] font-mono-tabular">
              {visibleNodes.length} / {allGraphCandidateEntities.length} Entitas
            </div>
          </div>
          <div className="p-3 rounded-lg bg-[#F6F1E6] border border-[#D8CBB3]">
            <div className="text-[11px] text-[#695A47]">
              Total Garis Ikatan Terlihat
            </div>
            <div className="font-display text-xl font-bold text-[#2D5A43] font-mono-tabular">
              {visibleEdges.length} / {relationships.length} Relasi
            </div>
          </div>
          <div className="p-3 rounded-lg bg-[#F6F1E6] border border-[#D8CBB3]">
            <div className="text-[11px] text-[#695A47]">
              Konflik, Rivalitas & Pengkhianatan
            </div>
            <div className="font-display text-xl font-bold text-[#9E2A2B] font-mono-tabular">
              {conflictEdgeCount} Sengketa Aktif
            </div>
          </div>
          <div className="p-3 rounded-lg bg-[#F6F1E6] border border-[#D8CBB3]">
            <div className="text-[11px] text-[#695A47]">
              Ikatan Rahasia & Konspirasi
            </div>
            <div className="font-display text-xl font-bold text-[#8F5B14] font-mono-tabular">
              {secretEdgeCount} Ikatan Tertutup
            </div>
          </div>
        </div>

        {syncBannerMessage && (
          <div className="p-3 rounded-lg bg-[#EFE7D6] border border-[#2D5A43]/40 text-xs font-semibold text-[#2D5A43] flex items-center justify-between">
            <span>{syncBannerMessage}</span>
            <button
              type="button"
              onClick={() => setSyncBannerMessage('')}
              className="text-[#695A47] hover:text-[#231C14] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* AUTOMATIC WORLD BIBLE RELATIONSHIP DETECTOR & 1-CLICK IMPORTER      */}
      {/* =================================================================== */}
      {(showDetectorPanel || detectedSuggestions.length > 0) && (
        <div className="bg-[#FBF8F1] border-2 border-[#B5832A] rounded-xl p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D8CBB3] pb-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#B5832A]" />
              <div>
                <h3 className="font-display text-base font-bold text-[#231C14]">
                  Pendeteksi Ikatan Otomatis dari Atribut World Bible (
                  {detectedSuggestions.length} Ditemukan)
                </h3>
                <p className="text-xs text-[#695A47]">
                  Hubungan di bawah ini terdeteksi dari atribut Afiliasi
                  Kelompok, Penguasa Negara, Ras, dan Pimpinan yang sudah Anda
                  isi di tab lain namun belum memiliki garis di Peta Relasi.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {detectedSuggestions.length > 0 && (
                <button
                  type="button"
                  onClick={handleImportAllSuggestions}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#9E2A2B] text-white hover:bg-[#7E2021] flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>
                    + Sinkronkan Semua ({detectedSuggestions.length}) ke Peta
                    Relasi
                  </span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowDetectorPanel(false)}
                className="p-1 text-[#695A47] hover:text-[#231C14] cursor-pointer"
                title="Sembunyikan panel deteksi"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {detectedSuggestions.length === 0 ? (
            <div className="p-3 rounded-lg bg-[#F6F1E6] border border-[#D8CBB3] text-xs text-[#2D5A43] font-medium">
              Seluruh atribut afiliasi tokoh, pimpinan kelompok, dan penguasa
              negara di World Bible sudah tersinkronisasi di Peta Relasi!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {detectedSuggestions.map((sug) => {
                const sEnt = entities.find((e) => e.id === sug.sourceId);
                const tEnt = entities.find((e) => e.id === sug.targetId);
                if (!sEnt || !tEnt) return null;
                return (
                  <div
                    key={sug.key}
                    className="p-3 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] flex flex-col justify-between gap-2"
                  >
                    <div>
                      <div className="text-[11px] font-semibold text-[#8F5B14]">
                        {RELATION_STYLE[sug.type].label} · {sug.label}
                      </div>
                      <div className="text-xs font-bold text-[#231C14] mt-0.5">
                        {sEnt.title} → {tEnt.title}
                      </div>
                      <p className="text-[11px] text-[#695A47] mt-0.5 line-clamp-2">
                        {sug.notes}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleImportSingleSuggestion(sug)}
                      className="self-start px-3 py-1 rounded bg-[#231C14] text-[#FBF8F1] hover:bg-[#3A2E21] text-[11px] font-semibold flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <Plus className="w-3 h-3 text-[#B5832A]" />
                      <span>+ Impor Ikatan Ini</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* FILTER BAR: NODE CATEGORY, RELATION TYPE, EGO FOCUS & SEARCH        */}
      {/* =================================================================== */}
      <div className="bg-[#FBF8F1] border border-[#D8CBB3] rounded-xl p-4 space-y-3">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="lg:col-span-4 relative">
            <Search className="w-4 h-4 text-[#695A47] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={graphSearchQuery}
              onChange={(e) => setGraphSearchQuery(e.target.value)}
              placeholder="Cari nama tokoh, faksi, negara, atau label ikatan..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg text-[#231C14] placeholder:text-[#695A47] focus:outline-none focus:border-[#9E2A2B]"
            />
          </div>

          {/* Ego-Network Spotlight Selector */}
          <div className="lg:col-span-4 flex items-center gap-2">
            <span className="text-xs font-semibold text-[#695A47] whitespace-nowrap">
              Mode Fokus Tokoh/Entitas:
            </span>
            <select
              value={focusedEntityId}
              onChange={(e) => setFocusedEntityId(e.target.value)}
              className="flex-1 px-2.5 py-1.5 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg text-[#231C14] font-semibold"
            >
              <option value="">-- Tampilkan Seluruh Jaringan --</option>
              {allGraphCandidateEntities.map((ent) => (
                <option key={ent.id} value={ent.id}>
                  [{CATEGORY_META[ent.category].singular}] {ent.title}
                </option>
              ))}
            </select>
            {focusedEntityId && (
              <button
                type="button"
                onClick={() => setFocusedEntityId('')}
                className="px-2 py-1 text-[11px] font-semibold bg-[#9E2A2B] text-white rounded cursor-pointer whitespace-nowrap shrink-0"
              >
                Reset Fokus
              </button>
            )}
          </div>

          {/* Edge Type / Secret Filter */}
          <div className="lg:col-span-4 flex items-center gap-2">
            <span className="text-xs font-semibold text-[#695A47] whitespace-nowrap">
              Filter Ikatan:
            </span>
            <select
              value={edgeTypeFilter}
              onChange={(e) => setEdgeTypeFilter(e.target.value)}
              className="flex-1 px-2.5 py-1.5 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg text-[#231C14] font-semibold"
            >
              <option value="ALL">Semua Sifat Hubungan</option>
              <option value="SECRET_ONLY">
                Khusus Hubungan Rahasia / Konspirasi ({secretEdgeCount})
              </option>
              {Object.entries(RELATION_STYLE).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Filter Buttons + Legend */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-[#D8CBB3]/70">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-[#695A47] mr-1">
              Filter Kategori Node:
            </span>
            {(
              [
                { id: 'ALL', label: 'Semua Node' },
                { id: 'character', label: 'Character' },
                { id: 'faction', label: 'Kelompok' },
                { id: 'nation', label: 'Negara' },
                { id: 'race', label: 'Ras' },
              ] as const
            ).map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setNodeCategoryFilter(cat.id)}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                  nodeCategoryFilter === cat.id
                    ? 'bg-[#231C14] text-[#FBF8F1]'
                    : 'bg-[#F6F1E6] text-[#695A47] hover:text-[#231C14] border border-[#D8CBB3]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#695A47]">
            {Object.entries(RELATION_STYLE).map(([k, v]) => (
              <div key={k} className="flex items-center gap-1">
                <span
                  className="w-3.5 h-0.5 inline-block"
                  style={{
                    backgroundColor: v.color,
                    borderBottom: v.dash ? `2px dashed ${v.color}` : undefined,
                  }}
                />
                <span>{v.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* MAIN SPLIT: INTERACTIVE GRAPH CANVAS (8 COLS) + INSPECTOR (4 COLS)  */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Left 8 Cols: Interactive SVG + Draggable Node Canvas + Selected Edge Dossier */}
        <div className="xl:col-span-8 space-y-4">
          <div className="bg-[#EFE7D6] border border-[#D8CBB3] rounded-xl p-3 space-y-2.5">
            {/* Canvas Top Toolbar (Zoom & Active Focus Indicator) */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-1">
              <div className="text-xs text-[#695A47] flex items-center gap-2">
                <span className="font-semibold text-[#231C14]">
                  Kanvas Interaktif Peta Relasi
                </span>
                <span>·</span>
                <span>
                  Geser kartu untuk menata posisi, klik label garis untuk
                  membuka dossier hubungan
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    setCanvasZoom((z) =>
                      Math.max(0.75, Number((z - 0.1).toFixed(2)))
                    )
                  }
                  className="p-1.5 rounded bg-[#FBF8F1] border border-[#D8CBB3] text-[#231C14] hover:bg-[#F6F1E6] cursor-pointer"
                  title="Perkecil tampilan kanvas"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-mono-tabular font-semibold text-[#231C14] px-1.5">
                  {Math.round(canvasZoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setCanvasZoom((z) =>
                      Math.min(1.35, Number((z + 0.1).toFixed(2)))
                    )
                  }
                  className="p-1.5 rounded bg-[#FBF8F1] border border-[#D8CBB3] text-[#231C14] hover:bg-[#F6F1E6] cursor-pointer"
                  title="Perbesar tampilan kanvas"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setCanvasZoom(1)}
                  className="px-2 py-1 rounded bg-[#FBF8F1] border border-[#D8CBB3] text-[11px] font-semibold text-[#695A47] hover:text-[#231C14] flex items-center gap-1 cursor-pointer"
                  title="Reset skala zoom ke 100%"
                >
                  <Maximize2 className="w-3 h-3" />
                  <span>100%</span>
                </button>
              </div>
            </div>

            {/* Scrollable Canvas Viewport */}
            <div className="overflow-x-auto overflow-y-auto rounded-lg border border-[#D8CBB3] bg-[#F6F1E6]">
              <div
                ref={boardRef}
                onPointerMove={handlePointerMove}
                onPointerUp={() => setDraggingNodeId(null)}
                onPointerLeave={() => setDraggingNodeId(null)}
                style={{
                  width: '960px',
                  height: '580px',
                  transform: `scale(${canvasZoom})`,
                  transformOrigin: 'top left',
                }}
                className="relative bg-[#F6F1E6] select-none overflow-hidden"
              >
                {/* Subtle Hierarchy Tier Guides */}
                <div className="absolute inset-x-0 top-3 flex justify-between px-4 text-[10px] font-semibold text-[#695A47]/60 pointer-events-none">
                  <span>ZONA KEDAULATAN & NEGARA</span>
                  <span>KLIK GARIS UNTUK INSPEKSI DINAMIKA</span>
                </div>

                {/* SVG Edges & Arrow Markers */}
                <svg className="w-full h-full absolute inset-0">
                  <defs>
                    {Object.entries(RELATION_STYLE).map(([k, v]) => (
                      <marker
                        key={k}
                        id={`arrow-${k}`}
                        viewBox="0 0 10 10"
                        refX="9"
                        refY="5"
                        markerWidth="6"
                        markerHeight="6"
                        orient="auto-start-reverse"
                      >
                        <path d="M 0 1 L 10 5 L 0 9 z" fill={v.color} />
                      </marker>
                    ))}
                  </defs>

                  {visibleEdges.map((edge) => {
                    const sIdx = allGraphCandidateEntities.findIndex(
                      (e) => e.id === edge.sourceId
                    );
                    const tIdx = allGraphCandidateEntities.findIndex(
                      (e) => e.id === edge.targetId
                    );
                    if (sIdx === -1 || tIdx === -1) return null;
                    const sPos = getPosition(edge.sourceId, sIdx);
                    const tPos = getPosition(edge.targetId, tIdx);
                    const style =
                      RELATION_STYLE[edge.type] || RELATION_STYLE.ally;
                    const midX = (sPos.x + tPos.x) / 2;
                    const midY = (sPos.y + tPos.y) / 2;
                    const isSelected = selectedEdge?.id === edge.id;
                    const secret = isSecretEdge(edge);

                    // Dim edge if Ego-Network Focus is active and neither endpoint is the focused entity
                    const isDimmedByFocus =
                      Boolean(focusedEntityId) &&
                      edge.sourceId !== focusedEntityId &&
                      edge.targetId !== focusedEntityId;

                    // Shorten line end slightly toward target so arrow marker is visible outside the card
                    const dx = tPos.x - sPos.x;
                    const dy = tPos.y - sPos.y;
                    const dist = Math.max(1, Math.hypot(dx, dy));
                    const padEnd =
                      edge.directionality === 'directed' ? 78 : 0;
                    const endX =
                      dist > padEnd ? tPos.x - (dx / dist) * padEnd : tPos.x;
                    const endY =
                      dist > padEnd ? tPos.y - (dy / dist) * padEnd : tPos.y;

                    return (
                      <g
                        key={edge.id}
                        onClick={() => setSelectedEdgeId(edge.id)}
                        className="cursor-pointer"
                        style={{
                          opacity: isDimmedByFocus ? 0.18 : 1,
                        }}
                      >
                        <line
                          x1={sPos.x}
                          y1={sPos.y}
                          x2={endX}
                          y2={endY}
                          stroke={style.color}
                          strokeWidth={isSelected ? 3.5 : 2.2}
                          strokeDasharray={
                            secret ? '4 4' : style.dash || undefined
                          }
                          markerEnd={
                            edge.directionality === 'directed'
                              ? `url(#arrow-${edge.type})`
                              : undefined
                          }
                        />
                        <rect
                          x={midX - 78}
                          y={midY - 13}
                          width={156}
                          height={26}
                          rx={6}
                          fill={isSelected ? 'var(--bg-aged)' : 'var(--bg-vellum)'}
                          stroke={style.color}
                          strokeWidth={isSelected ? 2 : 1.2}
                        />
                        <text
                          x={midX}
                          y={midY + 3}
                          textAnchor="middle"
                          fill="var(--ink-primary)"
                          fontSize="10"
                          fontWeight="700"
                        >
                          {secret ? '🔒 ' : ''}
                          {edge.label.slice(0, 22)}
                          {edge.directionality === 'directed' ? ' →' : ' ↔'}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Draggable Entity Nodes with Portraits & Focus Button */}
                {visibleNodes.map((ent) => {
                  const fullIdx = allGraphCandidateEntities.findIndex(
                    (x) => x.id === ent.id
                  );
                  const pos = getPosition(ent.id, fullIdx);
                  const meta = CATEGORY_META[ent.category];
                  const connCount = relationships.filter(
                    (r) => r.sourceId === ent.id || r.targetId === ent.id
                  ).length;
                  const isFocused = focusedEntityId === ent.id;
                  const isDimmed =
                    egoNeighborIds !== null && !egoNeighborIds.has(ent.id);

                  return (
                    <div
                      key={ent.id}
                      style={{
                        left: `${pos.x}px`,
                        top: `${pos.y}px`,
                        transform: 'translate(-50%, -50%)',
                        opacity: isDimmed ? 0.25 : 1,
                      }}
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        setDraggingNodeId(ent.id);
                      }}
                      className={`absolute z-10 w-48 bg-[#FBF8F1] rounded-xl p-2.5 shadow-xs cursor-grab active:cursor-grabbing transition-all ${
                        isFocused
                          ? 'border-2 border-[#9E2A2B] ring-4 ring-[#9E2A2B]/15'
                          : 'border-2 border-[#3B2E1E] hover:border-[#9E2A2B]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-[#695A47] mb-1">
                        <span
                          className="font-semibold truncate"
                          style={{ color: meta.accentColor }}
                        >
                          {meta.singular} · {connCount} Ikatan
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFocusedEntityId((prev) =>
                                prev === ent.id ? '' : ent.id
                              );
                            }}
                            className={`px-1.5 py-0.5 rounded text-[9px] font-semibold cursor-pointer ${
                              isFocused
                                ? 'bg-[#9E2A2B] text-white'
                                : 'bg-[#EFE7D6] text-[#231C14] hover:bg-[#D8CBB3]'
                            }`}
                            title="Sorot hanya jaringan entitas ini (Ego-Network)"
                          >
                            {isFocused ? 'Fokus Aktif' : 'Fokus'}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectEntity(ent.id);
                            }}
                            className="text-[#9E2A2B] hover:underline font-semibold cursor-pointer"
                            title="Buka lembar profil lengkap"
                          >
                            Buka →
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {ent.imageUrl ? (
                          <img
                            src={ent.imageUrl}
                            alt={ent.title}
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-lg object-cover border border-[#D8CBB3] shrink-0"
                          />
                        ) : (
                          <div
                            className="w-8 h-8 rounded-lg bg-[#EFE7D6] border border-[#D8CBB3] flex items-center justify-center shrink-0"
                            style={{ color: meta.accentColor }}
                          >
                            <User className="w-4 h-4" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="font-display text-xs font-bold text-[#231C14] truncate">
                            {ent.title}
                          </div>
                          <div className="text-[10px] text-[#695A47] truncate">
                            {ent.subtitle}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* =============================================================== */}
          {/* SELECTED RELATIONSHIP DOSSIER CARD (BELOW CANVAS)               */}
          {/* =============================================================== */}
          {selectedEdge && (
            <div className="bg-[#FBF8F1] border border-[#D8CBB3] rounded-xl p-5 space-y-4">
              {(() => {
                const sEnt = entities.find(
                  (e) => e.id === selectedEdge.sourceId
                );
                const tEnt = entities.find(
                  (e) => e.id === selectedEdge.targetId
                );
                const style =
                  RELATION_STYLE[selectedEdge.type] || RELATION_STYLE.ally;
                const secret = isSecretEdge(selectedEdge);

                return (
                  <>
                    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#D8CBB3] pb-3.5">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span
                            className="font-bold"
                            style={{ color: style.color }}
                          >
                            {style.label}
                          </span>
                          <span>·</span>
                          <span className="font-semibold text-[#231C14]">
                            {selectedEdge.directionality === 'directed'
                              ? 'Searah / Hierarkis (→)'
                              : 'Timbal Balik (↔)'}
                          </span>
                          <span>·</span>
                          <span
                            className={`inline-flex items-center gap-1 font-semibold ${
                              secret ? 'text-[#9E2A2B]' : 'text-[#2D5A43]'
                            }`}
                          >
                            {secret ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                            {selectedEdge.visibilityStatus ||
                              'Publik / Diketahui Umum'}
                          </span>
                        </div>

                        <h3 className="font-display text-xl font-bold text-[#231C14] flex flex-wrap items-center gap-2">
                          {sEnt ? (
                            <button
                              type="button"
                              onClick={() => onSelectEntity(sEnt.id)}
                              className="hover:text-[#9E2A2B] hover:underline cursor-pointer"
                            >
                              {sEnt.title}
                            </button>
                          ) : (
                            <span>Entitas A</span>
                          )}
                          <span className="text-[#9E2A2B]">
                            {selectedEdge.directionality === 'directed'
                              ? '→'
                              : '↔'}
                          </span>
                          {tEnt ? (
                            <button
                              type="button"
                              onClick={() => onSelectEntity(tEnt.id)}
                              className="hover:text-[#9E2A2B] hover:underline cursor-pointer"
                            >
                              {tEnt.title}
                            </button>
                          ) : (
                            <span>Entitas B</span>
                          )}
                          <span className="text-sm font-normal text-[#695A47]">
                            ({selectedEdge.label})
                          </span>
                        </h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => startEditingEdge(selectedEdge)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#231C14] text-[#FBF8F1] hover:bg-[#3A2E21] flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[#B5832A]" />
                          <span>Sunting Ikatan Ini</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateRelationships(
                              relationships.filter(
                                (item) => item.id !== selectedEdge.id
                              )
                            );
                            if (editingEdgeId === selectedEdge.id) resetForm();
                          }}
                          className="p-1.5 rounded-lg border border-[#9E2A2B]/30 text-[#9E2A2B] hover:bg-[#9E2A2B]/10 cursor-pointer"
                          title="Hapus ikatan relasi ini"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-1">
                        <div className="text-[11px] font-semibold text-[#695A47]">
                          Dinamika Hubungan & Catatan Intrik Saat Ini
                        </div>
                        <div className="text-xs text-[#231C14] leading-relaxed">
                          <WikiTextRenderer
                            text={selectedEdge.notes}
                            entities={entities}
                            onSelectEntity={onSelectEntity}
                          />
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-1">
                        <div className="text-[11px] font-semibold text-[#8F5B14]">
                          Tingkat Loyalitas / Ketegangan & Status Visibilitas
                        </div>
                        <div className="text-xs font-bold text-[#231C14]">
                          {selectedEdge.tensionOrLoyalty ||
                            'Stabil / Sesuai Kesepakatan Kanon'}
                        </div>
                        <div className="text-[11px] text-[#695A47] pt-0.5">
                          Visibilitas:{' '}
                          <strong className="text-[#231C14]">
                            {selectedEdge.visibilityStatus ||
                              'Publik / Diketahui Umum'}
                          </strong>
                        </div>
                      </div>
                    </div>

                    {(selectedEdge.originHistory ||
                      selectedEdge.storyEvolution) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selectedEdge.originHistory && (
                          <div className="p-3.5 rounded-xl bg-[#EFE7D6]/75 border border-[#D8CBB3] space-y-1">
                            <div className="text-[11px] font-semibold text-[#7A3E1D] flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              <span>
                                Asal Mula Ikatan & Peristiwa Sejarah Pemicu
                              </span>
                            </div>
                            <div className="text-xs text-[#231C14] leading-relaxed">
                              <WikiTextRenderer
                                text={selectedEdge.originHistory}
                                entities={entities}
                                onSelectEntity={onSelectEntity}
                              />
                            </div>
                          </div>
                        )}

                        {selectedEdge.storyEvolution && (
                          <div className="p-3.5 rounded-xl bg-[#EFE7D6]/75 border border-[#D8CBB3] space-y-1">
                            <div className="text-[11px] font-semibold text-[#264653] flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5" />
                              <span>
                                Perubahan & Evolusi Seiring Alur Bab Novel
                              </span>
                            </div>
                            <div className="text-xs text-[#231C14] leading-relaxed">
                              <WikiTextRenderer
                                text={selectedEdge.storyEvolution}
                                entities={entities}
                                onSelectEntity={onSelectEntity}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </div>

        {/* ================================================================= */}
        {/* RIGHT 4 COLS: RELATIONSHIP CREATOR/EDITOR + DIRECTORY LIST        */}
        {/* ================================================================= */}
        <div className="xl:col-span-4 space-y-4">
          <form
            onSubmit={handleSaveRelationship}
            className={`bg-[#FBF8F1] border rounded-xl p-4 space-y-3 ${
              editingEdgeId
                ? 'border-2 border-[#9E2A2B]'
                : 'border-[#D8CBB3]'
            }`}
          >
            <div className="flex items-center justify-between border-b border-[#D8CBB3] pb-2.5">
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-[#9E2A2B]" />
                <h3 className="font-display text-lg font-bold text-[#231C14]">
                  {editingEdgeId
                    ? 'Sunting Ikatan Relasi'
                    : 'Tambah Ikatan Relasi Baru'}
                </h3>
              </div>
              {editingEdgeId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-2 py-0.5 text-[11px] font-semibold border border-[#D8CBB3] rounded text-[#695A47] hover:text-[#231C14] cursor-pointer"
                >
                  Batal Edit
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[#695A47]">
                    Entitas Pertama (Sumber)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const prevSource = sourceId;
                      setSourceId(targetId);
                      setTargetId(prevSource);
                    }}
                    className="text-[11px] font-semibold text-[#9E2A2B] hover:underline flex items-center gap-1 cursor-pointer"
                    title="Tukar posisi Entitas Pertama dan Entitas Kedua"
                  >
                    <ArrowDownUp className="w-3 h-3" />
                    <span>Tukar Pihak</span>
                  </button>
                </div>
                <select
                  value={sourceId}
                  onChange={(e) => setSourceId(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg"
                >
                  {entities.map((e) => (
                    <option key={e.id} value={e.id}>
                      [{CATEGORY_META[e.category].singular}] {e.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#695A47] mb-1">
                  Entitas Kedua (Tujuan)
                </label>
                <select
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg"
                >
                  {entities.map((e) => (
                    <option key={e.id} value={e.id}>
                      [{CATEGORY_META[e.category].singular}] {e.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-[#695A47] mb-1">
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
                  <label className="block text-xs font-semibold text-[#695A47] mb-1">
                    Arah Hubungan
                  </label>
                  <select
                    value={relDirectionality}
                    onChange={(e) =>
                      setRelDirectionality(
                        e.target.value as 'bidirectional' | 'directed'
                      )
                    }
                    className="w-full px-2.5 py-1.5 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg"
                  >
                    <option value="bidirectional">Timbal Balik (↔)</option>
                    <option value="directed">Searah / Hierarkis (→)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#695A47] mb-1">
                  Julukan / Label Singkat Ikatan
                </label>
                <input
                  type="text"
                  value={relLabel}
                  onChange={(e) => setRelLabel(e.target.value)}
                  placeholder="Contoh: Sumpah Setia, Sengketa Pusaka, Kontrak Rahasia..."
                  className="w-full px-2.5 py-1.5 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                    Status Publik vs Rahasia
                  </label>
                  <select
                    value={relVisibility}
                    onChange={(e) => setRelVisibility(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg"
                  >
                    {VISIBILITY_PRESETS.map((vp) => (
                      <option key={vp} value={vp}>
                        {vp}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                    Tingkat Loyalitas / Ketegangan
                  </label>
                  <input
                    type="text"
                    list="tension-presets-list"
                    value={relTension}
                    onChange={(e) => setRelTension(e.target.value)}
                    placeholder="Sumpah Mati / Rapuh..."
                    className="w-full px-2.5 py-1.5 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg"
                  />
                  <datalist id="tension-presets-list">
                    {TENSION_LOYALTY_PRESETS.map((tp) => (
                      <option key={tp} value={tp} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                  Catatan Dinamika & Intrik Hubungan
                </label>
                <textarea
                  rows={2}
                  value={relNotes}
                  onChange={(e) => setRelNotes(e.target.value)}
                  placeholder="Jelaskan dinamika politik, emosional, atau kepentingan di antara keduanya..."
                  className="w-full p-2.5 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#7A3E1D] mb-1">
                  Asal Mula Ikatan / Peristiwa Sejarah Pemicu (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={relOriginHistory}
                  onChange={(e) => setRelOriginHistory(e.target.value)}
                  placeholder="Kapan atau karena peristiwa apa ikatan ini terbentuk? (Mendukung [[Nama Entitas]])..."
                  className="w-full p-2 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#264653] mb-1">
                  Perubahan Seiring Bab Cerita (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={relStoryEvolution}
                  onChange={(e) => setRelStoryEvolution(e.target.value)}
                  placeholder="Bagaimana hubungan ini berubah dari Bab 1 menuju klimaks cerita..."
                  className="w-full p-2 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 text-xs font-semibold bg-[#9E2A2B] text-white rounded-lg hover:bg-[#7E2021] transition-colors cursor-pointer"
              >
                {editingEdgeId
                  ? 'Simpan Perubahan Ikatan'
                  : 'Hubungkan Kedua Entitas'}
              </button>
            </div>
          </form>

          {/* List of active edges */}
          <div className="bg-[#FBF8F1] border border-[#D8CBB3] rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold text-[#695A47]">
              <span>Daftar Ikatan Terfilter ({visibleEdges.length})</span>
              <span>Klik untuk inspeksi / edit</span>
            </div>
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {visibleEdges.map((r) => {
                const sEnt = entities.find((e) => e.id === r.sourceId);
                const tEnt = entities.find((e) => e.id === r.targetId);
                if (!sEnt || !tEnt) return null;
                const secret = isSecretEdge(r);
                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedEdgeId(r.id)}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition-colors ${
                      selectedEdge?.id === r.id
                        ? 'bg-[#EFE7D6] border-[#9E2A2B]'
                        : 'bg-[#F6F1E6] border-[#D8CBB3] hover:bg-[#EFE7D6]/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 font-semibold text-[#231C14]">
                      <span className="truncate">
                        {sEnt.title}{' '}
                        {r.directionality === 'directed' ? '→' : '↔'}{' '}
                        {tEnt.title}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditingEdge(r);
                          }}
                          className="p-1 text-[#695A47] hover:text-[#231C14] cursor-pointer"
                          title="Sunting ikatan ini"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateRelationships(
                              relationships.filter((item) => item.id !== r.id)
                            );
                            if (editingEdgeId === r.id) resetForm();
                          }}
                          className="p-1 text-[#695A47] hover:text-[#9E2A2B] cursor-pointer"
                          title="Hapus ikatan ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] mt-0.5">
                      <span
                        className="font-semibold"
                        style={{
                          color:
                            RELATION_STYLE[r.type]?.color ||
                            RELATION_STYLE.ally.color,
                        }}
                      >
                        {RELATION_STYLE[r.type]?.label || r.type}
                      </span>
                      <span>·</span>
                      <span className="font-semibold text-[#231C14]">
                        {r.label}
                      </span>
                      {secret && (
                        <>
                          <span>·</span>
                          <span className="text-[#9E2A2B] font-semibold">
                            [Rahasia]
                          </span>
                        </>
                      )}
                    </div>

                    {r.tensionOrLoyalty && (
                      <div className="text-[10px] text-[#8F5B14] font-medium mt-0.5">
                        Intensitas: {r.tensionOrLoyalty}
                      </div>
                    )}

                    <p className="text-[11px] text-[#695A47] mt-1 line-clamp-2">
                      {r.notes}
                    </p>
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
