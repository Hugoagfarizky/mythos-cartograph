import React, { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  BookOpen,
  Check,
  Compass,
  Edit3,
  Flame,
  GitBranch,
  Globe,
  Languages,
  Link2,
  MapPin,
  Plus,
  Quote,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Swords,
  Trash2,
  User,
  UserPlus,
  Users,
  Wand2,
  X,
} from 'lucide-react';
import { STARTER_WORLD_PROJECT } from '../data/starterWorld';
import {
  ChapterOutline,
  LoreAttributes,
  LoreCategory,
  LoreEntity,
  MapStamp,
  RelationType,
  RelationshipEdge,
} from '../types/world';
import {
  CATEGORY_META,
  findBacklinksForEntity,
  WikiTextRenderer,
} from './WikiTextRenderer';

interface CodexWorkspaceProps {
  category: LoreCategory;
  entities: LoreEntity[];
  chapters: ChapterOutline[];
  mapStamps: MapStamp[];
  relationships?: RelationshipEdge[];
  selectedEntityId: string;
  onSelectEntity: (id: string) => void;
  onNavigateToEntity?: (id: string) => void;
  onSaveEntity: (entity: LoreEntity) => void;
  onDeleteEntity: (id: string) => void;
  onUpdateRelationships?: (next: RelationshipEdge[]) => void;
  onOpenMapAtStamp: (stampId: string) => void;
  onOpenChapter: (chapterId: string) => void;
  onRunAuditOnEntity: (entity: LoreEntity) => void;
  onOpenBrainstormModal: (category: LoreCategory) => void;
}

const CHARACTER_ROLE_FILTERS = [
  'Semua',
  'Protagonis',
  'Deuteragonis',
  'Antagonis',
  'Mentor',
  'Pendukung',
];

const CHARACTER_STATUS_OPTIONS = [
  'Hidup',
  'Diasingkan',
  'Menghilang',
  'Gugur',
];

const RACE_ORIGIN_FILTERS = [
  'Semua',
  'Sylvan / Fae',
  'Subterranean / Kriya',
  'Manusia / Aethel-Born',
  'Astral / Kuno',
  'Drakonik / Buas',
];

const FACTION_TYPE_FILTERS = [
  'Semua',
  'Ordo Ksatria / Militer',
  'Majelis Sihir / Akademi',
  'Sindikat Rahasia / Intelijen',
  'Gilda Dagang / Kriya',
  'Sekte Keagamaan / Kultus',
];

const FACTION_SCALE_OPTIONS = [
  'Semua Skala',
  'Lintas Benua',
  'Regional / Kerajaan',
  'Bawah Tanah / Bayangan',
  'Lokal / Kota',
];

const PRESET_PORTRAITS = [
  {
    label: 'Potret Archmage',
    url: '/src/assets/images/avatar_archmage_vaelen_1794157187885.jpg',
  },
  {
    label: 'Potret Maharani',
    url: '/src/assets/images/avatar_empress_seraphina_1794157189411.jpg',
  },
  {
    label: 'Ilustrasi Pusaka',
    url: '/src/assets/images/artifact_sunfire_astrolabe_1794157188936.jpg',
  },
];

const RELATION_TYPE_LABELS: Record<RelationType, string> = {
  ally: 'Sekutu / Aliansi',
  rival: 'Rival / Musuh',
  mentor: 'Guru / Murid',
  family: 'Ikatan Darah / Keluarga',
  member: 'Anggota / Penguasa',
  vassal: 'Bawahan / Vasal',
  betrayed: 'Pengkhianatan',
};

// Merge starter attributes if user's localStorage has an older version of a starter entity
function getEnrichedAttributes(entity: LoreEntity): LoreAttributes {
  const starterMatch = STARTER_WORLD_PROJECT.entities.find(
    (s) => s.id === entity.id
  );
  if (!starterMatch) return entity.attributes;
  return {
    ...starterMatch.attributes,
    ...entity.attributes,
  };
}

export const CodexWorkspace: React.FC<CodexWorkspaceProps> = ({
  category,
  entities,
  chapters,
  mapStamps,
  relationships = [],
  selectedEntityId,
  onSelectEntity,
  onNavigateToEntity,
  onSaveEntity,
  onDeleteEntity,
  onUpdateRelationships,
  onOpenMapAtStamp,
  onOpenChapter,
  onRunAuditOnEntity,
  onOpenBrainstormModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('Semua');
  const [statusFilter, setStatusFilter] = useState<string>('Semua');
  const [raceClassFilter, setRaceClassFilter] = useState<string>('Semua');
  const [factionTypeFilter, setFactionTypeFilter] = useState<string>('Semua');
  const [factionScaleFilter, setFactionScaleFilter] =
    useState<string>('Semua Skala');

  const [isEditing, setIsEditing] = useState(false);
  const [draftEntity, setDraftEntity] = useState<LoreEntity | null>(null);
  const [tagInput, setTagInput] = useState('');

  // Custom array item inputs in editor (Character, Race & Faction)
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [customArtifactInput, setCustomArtifactInput] = useState('');
  const [customSubRaceInput, setCustomSubRaceInput] = useState('');
  const [customRaceSkillInput, setCustomRaceSkillInput] = useState('');
  const [customRankInput, setCustomRankInput] = useState('');
  const [customFactionArtifactInput, setCustomFactionArtifactInput] =
    useState('');

  // Inline Relationship Creator state for Character Sheet
  const [showAddRelation, setShowAddRelation] = useState(false);
  const [relTargetId, setRelTargetId] = useState('');
  const [relType, setRelType] = useState<RelationType>('ally');
  const [relLabel, setRelLabel] = useState('');
  const [relNotes, setRelNotes] = useState('');

  const sectionMeta = CATEGORY_META[category];
  const jumpToEntity = onNavigateToEntity || onSelectEntity;

  // Reset editing and filter states when switching section tabs
  useEffect(() => {
    setIsEditing(false);
    setDraftEntity(null);
    setSearchQuery('');
    setRoleFilter('Semua');
    setStatusFilter('Semua');
    setRaceClassFilter('Semua');
    setFactionTypeFilter('Semua');
    setFactionScaleFilter('Semua Skala');
    setShowAddRelation(false);
  }, [category]);

  const sectionEntities = entities.filter((e) => e.category === category);

  const filteredEntities = sectionEntities.filter((e) => {
    const attrs = getEnrichedAttributes(e);
    if (category === 'character') {
      if (
        roleFilter !== 'Semua' &&
        !(attrs.role || '').toLowerCase().includes(roleFilter.toLowerCase())
      ) {
        return false;
      }
      if (
        statusFilter !== 'Semua' &&
        !(attrs.status || '').toLowerCase().includes(statusFilter.toLowerCase())
      ) {
        return false;
      }
    }

    if (category === 'race') {
      if (
        raceClassFilter !== 'Semua' &&
        !(attrs.raceOriginClass || '')
          .toLowerCase()
          .includes(raceClassFilter.split('/')[0].trim().toLowerCase())
      ) {
        return false;
      }
    }

    if (category === 'faction') {
      if (
        factionTypeFilter !== 'Semua' &&
        !(attrs.factionType || '')
          .toLowerCase()
          .includes(factionTypeFilter.split('/')[0].trim().toLowerCase())
      ) {
        return false;
      }
      if (
        factionScaleFilter !== 'Semua Skala' &&
        !(attrs.influenceScale || '')
          .toLowerCase()
          .includes(factionScaleFilter.split('/')[0].trim().toLowerCase())
      ) {
        return false;
      }
    }

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      e.title.toLowerCase().includes(q) ||
      e.subtitle.toLowerCase().includes(q) ||
      e.summary.toLowerCase().includes(q) ||
      e.tags.some((t) => t.toLowerCase().includes(q)) ||
      (attrs.raceName || '').toLowerCase().includes(q) ||
      (attrs.factionName || '').toLowerCase().includes(q) ||
      (attrs.homeland || '').toLowerCase().includes(q) ||
      (attrs.raceOriginClass || '').toLowerCase().includes(q) ||
      (attrs.factionType || '').toLowerCase().includes(q) ||
      (attrs.headquarters || '').toLowerCase().includes(q) ||
      (attrs.leader || '').toLowerCase().includes(q)
    );
  });

  const activeEntity =
    sectionEntities.find((e) => e.id === selectedEntityId) ||
    filteredEntities[0] ||
    sectionEntities[0] ||
    null;

  const activeAttrs = activeEntity ? getEnrichedAttributes(activeEntity) : {};

  // Helper to find an entity by exact or partial title match for clickable attributes
  const findMatchingEntityByName = (
    name: string | undefined,
    preferredCategory?: LoreCategory
  ): LoreEntity | undefined => {
    if (!name) return undefined;
    const clean = name.trim().toLowerCase();
    if (!clean) return undefined;
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

  const startEditing = (entity: LoreEntity) => {
    const enriched = getEnrichedAttributes(entity);
    setDraftEntity({
      ...entity,
      attributes: {
        ...enriched,
        knownSkills: [...(enriched.knownSkills || [])],
        ownedArtifacts: [...(enriched.ownedArtifacts || [])],
        subRaces: [...(enriched.subRaces || [])],
        signatureSkills: [...(enriched.signatureSkills || [])],
        rankHierarchy: [...(enriched.rankHierarchy || [])],
        factionArtifacts: [...(enriched.factionArtifacts || [])],
      },
      tags: [...entity.tags],
    });
    setTagInput(entity.tags.join(', '));
    setCustomSkillInput('');
    setCustomArtifactInput('');
    setCustomSubRaceInput('');
    setCustomRaceSkillInput('');
    setCustomRankInput('');
    setCustomFactionArtifactInput('');
    setIsEditing(true);
  };

  const startCreatingNew = () => {
    const newEnt: LoreEntity = {
      id: `ent-${Date.now()}`,
      category,
      title: `${sectionMeta.singular} Baru`,
      subtitle:
        category === 'character'
          ? 'Gelar atau Julukan Tokoh'
          : category === 'race'
          ? 'Julukan Bangsa & Spesies'
          : category === 'faction'
          ? 'Gelar Ordo, Serikat, atau Sindikat'
          : `Julukan atau Klasifikasi ${sectionMeta.singular}`,
      summary: `Ringkasan singkat mengenai peran ${sectionMeta.singular.toLowerCase()} ini di dalam dunia cerita.`,
      content: `Tuliskan sejarah, deskripsi mendalam, dan hubungannya dengan entitas lain menggunakan tanda kurung ganda seperti [[Archmage Vaelen Thorne]] atau [[Kekaisaran Gondoria]].`,
      tags: [sectionMeta.singular],
      attributes:
        category === 'character'
          ? {
              role: 'Protagonis',
              status: 'Hidup',
              knownSkills: [],
              ownedArtifacts: [],
            }
          : category === 'race'
          ? {
              raceOriginClass: 'Sylvan / Fae',
              lifespan: '100 - 300 Tahun',
              subRaces: [],
              signatureSkills: [],
            }
          : category === 'faction'
          ? {
              factionType: 'Ordo Ksatria / Militer',
              influenceScale: 'Regional / Kerajaan',
              rankHierarchy: [
                '1. Inisiat / Anggota Muda',
                '2. Perwira / Penjaga Inti',
                '3. Dewan Tinggi / Pemimpin Utama',
              ],
              factionArtifacts: [],
            }
          : {},
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    setDraftEntity(newEnt);
    setTagInput(newEnt.tags.join(', '));
    setCustomSkillInput('');
    setCustomArtifactInput('');
    setCustomSubRaceInput('');
    setCustomRaceSkillInput('');
    setCustomRankInput('');
    setCustomFactionArtifactInput('');
    setIsEditing(true);
  };

  const handleSaveDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftEntity) return;
    const parsedTags = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const updated: LoreEntity = {
      ...draftEntity,
      category,
      tags: parsedTags.length > 0 ? parsedTags : [sectionMeta.singular],
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    onSaveEntity(updated);
    onSelectEntity(updated.id);
    setIsEditing(false);
    setDraftEntity(null);
  };

  const insertWikiLink = (title: string) => {
    if (!draftEntity) return;
    setDraftEntity({
      ...draftEntity,
      content: `${draftEntity.content} [[${title}]]`,
    });
  };

  const toggleDraftArrayItem = (
    field:
      | 'knownSkills'
      | 'ownedArtifacts'
      | 'subRaces'
      | 'signatureSkills'
      | 'rankHierarchy'
      | 'factionArtifacts',
    itemValue: string
  ) => {
    if (!draftEntity) return;
    const trimmed = itemValue.trim();
    if (!trimmed) return;
    const currentList = draftEntity.attributes[field] || [];
    const exists = currentList.includes(trimmed);
    const nextList = exists
      ? currentList.filter((x) => x !== trimmed)
      : [...currentList, trimmed];
    setDraftEntity({
      ...draftEntity,
      attributes: {
        ...draftEntity.attributes,
        [field]: nextList,
      },
    });
  };

  const handleCreateInlineRelationship = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEntity || !relTargetId || !onUpdateRelationships) return;
    const newRel: RelationshipEdge = {
      id: `rel-${Date.now()}`,
      sourceId: activeEntity.id,
      targetId: relTargetId,
      type: relType,
      label: relLabel.trim() || RELATION_TYPE_LABELS[relType],
      notes:
        relNotes.trim() ||
        'Hubungan kanon tercatat dari lembar profil karakter.',
    };
    onUpdateRelationships([newRel, ...relationships]);
    setRelLabel('');
    setRelNotes('');
    setShowAddRelation(false);
  };

  // 1-Click Create Character from active Race
  const handleCreateCharacterFromRace = (raceEntity: LoreEntity) => {
    const rAttrs = getEnrichedAttributes(raceEntity);
    const newChar: LoreEntity = {
      id: `ent-${Date.now()}`,
      category: 'character',
      title: `Tokoh ${raceEntity.title} Baru`,
      subtitle: `Utusan dari ${rAttrs.homeland || raceEntity.title}`,
      summary: `Tokoh keturunan [[${raceEntity.title}]] yang berasal dari [[${
        rAttrs.homeland || raceEntity.title
      }]].`,
      content: `### Latar Belakang & Asal-Usul\nMerupakan anggota bangsa [[${
        raceEntity.title
      }]] yang mewarisi bakat alami mereka.\n\nTambahkan sejarah dan hubungannya dengan entitas lain di sini.`,
      tags: ['Character', raceEntity.title],
      attributes: {
        role: 'Pendukung',
        status: 'Hidup',
        raceName: raceEntity.title,
        originNation: rAttrs.homeland || '',
        knownSkills: [...(rAttrs.signatureSkills || [])],
        ownedArtifacts: [],
        appearance: rAttrs.traits || '',
      },
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    onSaveEntity(newChar);
    jumpToEntity(newChar.id);
  };

  // 1-Click Create Character from active Faction
  const handleCreateCharacterFromFaction = (factionEntity: LoreEntity) => {
    const fAttrs = getEnrichedAttributes(factionEntity);
    const topRank =
      fAttrs.rankHierarchy && fAttrs.rankHierarchy.length > 0
        ? fAttrs.rankHierarchy[0]
        : 'Anggota Inti';
    const newChar: LoreEntity = {
      id: `ent-${Date.now()}`,
      category: 'character',
      title: `Anggota ${factionEntity.title} Baru`,
      subtitle: `${topRank} di ${factionEntity.title}`,
      summary: `Anggota aktif dari [[${factionEntity.title}]] yang beroperasi di [[${
        fAttrs.headquarters || factionEntity.title
      }]].`,
      content: `### Peran di Dalam ${factionEntity.title}\nMerupakan anggota [[${factionEntity.title}]] yang telah mengucapkan sumpah setia organisasi.\n\nTambahkan misi rahasia dan hubungannya dengan [[${
        fAttrs.leader || factionEntity.title
      }]] di sini.`,
      tags: ['Character', factionEntity.title],
      attributes: {
        role: 'Pendukung',
        status: 'Hidup',
        factionName: factionEntity.title,
        originNation: fAttrs.headquarters || '',
        knownSkills: [],
        ownedArtifacts: [...(fAttrs.factionArtifacts || [])],
      },
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    onSaveEntity(newChar);
    jumpToEntity(newChar.id);
  };

  const backlinks = activeEntity
    ? findBacklinksForEntity(activeEntity, entities, chapters)
    : { linkedEntities: [], linkedChapters: [] };

  const linkedPins = activeEntity
    ? mapStamps.filter((s) => s.linkedEntityId === activeEntity.id)
    : [];

  const entityRelationships = activeEntity
    ? relationships.filter(
        (r) =>
          r.sourceId === activeEntity.id || r.targetId === activeEntity.id
      )
    : [];

  // Lists of existing entities by category for hybrid pickers
  const characterEntities = entities.filter((e) => e.category === 'character');
  const raceEntities = entities.filter((e) => e.category === 'race');
  const factionEntities = entities.filter((e) => e.category === 'faction');
  const nationAndRegionEntities = entities.filter(
    (e) => e.category === 'nation' || e.category === 'region'
  );
  const skillEntities = entities.filter((e) => e.category === 'skill');
  const artifactEntities = entities.filter(
    (e) => e.category === 'encyclopedia'
  );

  // Automatic Roster of Characters belonging to the active Race
  const charactersOfActiveRace =
    category === 'race' && activeEntity
      ? entities.filter((e) => {
          if (e.category !== 'character') return false;
          const cAttrs = getEnrichedAttributes(e);
          const rName = (cAttrs.raceName || '').toLowerCase();
          const raceTitle = activeEntity.title.toLowerCase();
          const raceFirstWord = raceTitle.split(' ')[0];
          return (
            rName.includes(raceTitle) ||
            raceTitle.includes(rName && rName.length > 3 ? rName : '___') ||
            (raceFirstWord.length > 3 && rName.includes(raceFirstWord)) ||
            e.content.toLowerCase().includes(`[[${raceTitle}]]`)
          );
        })
      : [];

  // Automatic Roster of Characters belonging to the active Faction
  const membersOfActiveFaction =
    category === 'faction' && activeEntity
      ? entities.filter((e) => {
          if (e.category !== 'character') return false;
          const cAttrs = getEnrichedAttributes(e);
          const fName = (cAttrs.factionName || '').toLowerCase();
          const facTitle = activeEntity.title.toLowerCase();
          const facLeader = (activeAttrs.leader || '').toLowerCase();
          return (
            fName.includes(facTitle) ||
            facTitle.includes(fName && fName.length > 3 ? fName : '___') ||
            (facLeader && e.title.toLowerCase() === facLeader) ||
            e.content.toLowerCase().includes(`[[${facTitle}]]`)
          );
        })
      : [];

  return (
    <div className="space-y-5">
      {/* Dedicated Section Header Bar */}
      <div className="bg-[#FBF8F1] border border-[#D8CBB3] rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div
            className="text-xs font-semibold"
            style={{ color: sectionMeta.accentColor }}
          >
            Modul World Bible · {sectionEntities.length} {sectionMeta.singular}{' '}
            Tercatat
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#231C14]">
            {sectionMeta.label}
          </h2>
          <p className="text-xs sm:text-sm text-[#695A47] mt-0.5">
            {sectionMeta.description}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onOpenBrainstormModal(category)}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold border border-[#B5832A] bg-[#F6F1E6] text-[#231C14] hover:bg-[#EFE7D6] flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Wand2 className="w-3.5 h-3.5 text-[#B5832A]" />
            Ide {sectionMeta.singular} (AI)
          </button>
          <button
            type="button"
            onClick={startCreatingNew}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#9E2A2B] text-white hover:bg-[#7E2021] flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah {sectionMeta.singular} Baru
          </button>
        </div>
      </div>

      {/* Main Split: Section Entity List (Left 4 cols) + Full Sheet (Right 8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================================================================= */}
        {/* LEFT DIRECTORY COLUMN                                             */}
        {/* ================================================================= */}
        <div className="lg:col-span-4 bg-[#FBF8F1] border border-[#D8CBB3] rounded-xl p-4 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[#695A47] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Cari ${sectionMeta.singular.toLowerCase()}...`}
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg text-[#231C14] placeholder:text-[#695A47] focus:outline-none focus:border-[#9E2A2B]"
            />
          </div>

          {/* Character-Specific Role & Status Filters */}
          {category === 'character' && (
            <div className="space-y-2 pt-1">
              <div className="flex flex-wrap items-center gap-1">
                {CHARACTER_ROLE_FILTERS.map((rf) => (
                  <button
                    key={rf}
                    type="button"
                    onClick={() => setRoleFilter(rf)}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                      roleFilter === rf
                        ? 'bg-[#9E2A2B] text-white'
                        : 'bg-[#F6F1E6] text-[#695A47] hover:text-[#231C14] border border-[#D8CBB3]'
                    }`}
                  >
                    {rf}
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="text-[11px] text-[#695A47] font-medium">
                  Filter Status:
                </span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="flex-1 px-2.5 py-1 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg text-[#231C14]"
                >
                  <option value="Semua">Semua Status</option>
                  {CHARACTER_STATUS_OPTIONS.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Race-Specific Origin Classification Filters */}
          {category === 'race' && (
            <div className="space-y-1.5 pt-1">
              <div className="text-[11px] font-semibold text-[#695A47]">
                Filter Klasifikasi Asal-Usul Ras:
              </div>
              <div className="flex flex-wrap items-center gap-1">
                {RACE_ORIGIN_FILTERS.map((rc) => (
                  <button
                    key={rc}
                    type="button"
                    onClick={() => setRaceClassFilter(rc)}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                      raceClassFilter === rc
                        ? 'bg-[#2D5A43] text-white'
                        : 'bg-[#F6F1E6] text-[#695A47] hover:text-[#231C14] border border-[#D8CBB3]'
                    }`}
                  >
                    {rc}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Faction-Specific Organization Type & Influence Scale Filters */}
          {category === 'faction' && (
            <div className="space-y-2 pt-1">
              <div className="text-[11px] font-semibold text-[#695A47]">
                Filter Jenis Organisasi:
              </div>
              <div className="flex flex-wrap items-center gap-1">
                {FACTION_TYPE_FILTERS.map((ft) => (
                  <button
                    key={ft}
                    type="button"
                    onClick={() => setFactionTypeFilter(ft)}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                      factionTypeFilter === ft
                        ? 'bg-[#8F5B14] text-white'
                        : 'bg-[#F6F1E6] text-[#695A47] hover:text-[#231C14] border border-[#D8CBB3]'
                    }`}
                  >
                    {ft}
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="text-[11px] text-[#695A47] font-medium">
                  Skala Pengaruh:
                </span>
                <select
                  value={factionScaleFilter}
                  onChange={(e) => setFactionScaleFilter(e.target.value)}
                  className="flex-1 px-2.5 py-1 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg text-[#231C14]"
                >
                  {FACTION_SCALE_OPTIONS.map((sc) => (
                    <option key={sc} value={sc}>
                      {sc}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="text-xs text-[#695A47] flex items-center justify-between px-1 pt-1">
            <span>
              Daftar {sectionMeta.singular} ({filteredEntities.length})
            </span>
            <span className="font-mono-tabular">Klik untuk detail</span>
          </div>

          <div className="space-y-2 max-h-[680px] overflow-y-auto pr-1">
            {filteredEntities.length === 0 ? (
              <div className="py-10 text-center space-y-3">
                <p className="text-xs text-[#695A47]">
                  Belum ada data {sectionMeta.singular.toLowerCase()} yang
                  cocok dengan filter.
                </p>
                <button
                  type="button"
                  onClick={startCreatingNew}
                  className="px-3.5 py-1.5 text-xs font-semibold bg-[#9E2A2B] text-white rounded-lg cursor-pointer"
                >
                  + Buat {sectionMeta.singular} Baru
                </button>
              </div>
            ) : (
              filteredEntities.map((item) => {
                const isSelected = activeEntity?.id === item.id && !isEditing;
                const itemAttrs = getEnrichedAttributes(item);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      onSelectEntity(item.id);
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#EFE7D6] border-[#9E2A2B] shadow-2xs'
                        : 'bg-[#F6F1E6]/75 border-[#D8CBB3] hover:bg-[#EFE7D6]/60'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {category === 'character' && (
                        <>
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              referrerPolicy="no-referrer"
                              className="w-12 h-12 rounded-lg object-cover border border-[#D8CBB3] shrink-0 mt-0.5"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-[#EFE7D6] border border-[#D8CBB3] flex items-center justify-center shrink-0 mt-0.5">
                              <User className="w-5 h-5 text-[#9E2A2B]" />
                            </div>
                          )}
                        </>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between text-[11px] text-[#695A47] mb-0.5">
                          <span
                            className="font-semibold truncate"
                            style={{ color: sectionMeta.accentColor }}
                          >
                            {category === 'character'
                              ? `${itemAttrs.role || 'Tokoh'} · ${
                                  itemAttrs.status || 'Hidup'
                                }`
                              : category === 'race'
                              ? `${
                                  itemAttrs.raceOriginClass || 'Ras Kanon'
                                } · ${itemAttrs.lifespan || 'Usia Bervariasi'}`
                              : category === 'faction'
                              ? `${
                                  itemAttrs.factionType || 'Organisasi'
                                } · ${itemAttrs.influenceScale || 'Regional'}`
                              : item.subtitle || sectionMeta.singular}
                          </span>
                          <span className="font-mono-tabular shrink-0 ml-2 text-[10px]">
                            {item.updatedAt}
                          </span>
                        </div>

                        <div className="font-display text-lg font-bold text-[#231C14] leading-snug truncate">
                          {item.title}
                        </div>

                        {category === 'character' && (
                          <div className="text-[11px] text-[#695A47] truncate mt-0.5">
                            {itemAttrs.raceName || item.subtitle}
                            {itemAttrs.powerTier
                              ? ` · ${itemAttrs.powerTier}`
                              : ''}
                          </div>
                        )}

                        {category === 'race' && (
                          <div className="text-[11px] text-[#695A47] truncate mt-0.5">
                            Habitat: {itemAttrs.homeland || 'Belum ditentukan'}
                            {itemAttrs.subRaces && itemAttrs.subRaces.length > 0
                              ? ` · ${itemAttrs.subRaces.length} Sub-Ras`
                              : ''}
                          </div>
                        )}

                        {category === 'faction' && (
                          <div className="text-[11px] text-[#695A47] truncate mt-0.5">
                            Markas: {itemAttrs.headquarters || 'Belum ditentukan'}
                            {itemAttrs.leader
                              ? ` · Pemimpin: ${itemAttrs.leader}`
                              : ''}
                          </div>
                        )}

                        <div className="text-xs text-[#695A47] line-clamp-2 mt-1">
                          {item.summary}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ================================================================= */}
        {/* RIGHT DETAIL / EDITOR COLUMN                                      */}
        {/* ================================================================= */}
        <div className="lg:col-span-8 bg-[#FBF8F1] border border-[#D8CBB3] rounded-xl p-6">
          {isEditing && draftEntity ? (
            <form onSubmit={handleSaveDraft} className="space-y-5">
              <div className="flex items-center justify-between border-b border-[#D8CBB3] pb-4">
                <div>
                  <span className="text-xs font-semibold text-[#9E2A2B]">
                    Penyuntingan {sectionMeta.label}
                  </span>
                  <h3 className="font-display text-2xl font-bold text-[#231C14]">
                    {draftEntity.title || `${sectionMeta.singular} Baru`}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setDraftEntity(null);
                    }}
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
                    Simpan {sectionMeta.singular}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#695A47] mb-1">
                    Nama {sectionMeta.singular}
                  </label>
                  <input
                    type="text"
                    required
                    value={draftEntity.title}
                    onChange={(e) =>
                      setDraftEntity({ ...draftEntity, title: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg text-[#231C14] font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#695A47] mb-1">
                    Gelar / Julukan / Sub-Klasifikasi
                  </label>
                  <input
                    type="text"
                    value={draftEntity.subtitle}
                    onChange={(e) =>
                      setDraftEntity({
                        ...draftEntity,
                        subtitle: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-sm bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg text-[#231C14]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#695A47] mb-1">
                    Ringkasan Singkat (1-2 Kalimat)
                  </label>
                  <input
                    type="text"
                    value={draftEntity.summary}
                    onChange={(e) =>
                      setDraftEntity({
                        ...draftEntity,
                        summary: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-sm bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg text-[#231C14]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#695A47] mb-1">
                    Tag (pisahkan dengan koma)
                  </label>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Contoh: Ras Kuno, Penjaga Hutan, Sensitif Eter"
                    className="w-full px-3 py-2 text-sm bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg text-[#231C14]"
                  />
                </div>
              </div>

              {/* Portrait / Image URL Selector */}
              {(category === 'character' ||
                category === 'race' ||
                category === 'encyclopedia') && (
                <div className="p-3.5 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="text-xs font-semibold text-[#695A47]">
                      URL Potret / Ilustrasi (Opsional)
                    </label>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] text-[#695A47]">
                        Preset Ilustrasi:
                      </span>
                      {PRESET_PORTRAITS.map((p) => (
                        <button
                          key={p.url}
                          type="button"
                          onClick={() =>
                            setDraftEntity({
                              ...draftEntity,
                              imageUrl: p.url,
                            })
                          }
                          className="px-2 py-0.5 text-[11px] bg-[#EFE7D6] hover:bg-[#D8CBB3] text-[#231C14] rounded cursor-pointer"
                        >
                          {p.label}
                        </button>
                      ))}
                      {draftEntity.imageUrl && (
                        <button
                          type="button"
                          onClick={() =>
                            setDraftEntity({
                              ...draftEntity,
                              imageUrl: undefined,
                            })
                          }
                          className="px-2 py-0.5 text-[11px] text-[#9E2A2B] hover:underline cursor-pointer"
                        >
                          Hapus Gambar
                        </button>
                      )}
                    </div>
                  </div>
                  <input
                    type="text"
                    value={draftEntity.imageUrl || ''}
                    onChange={(e) =>
                      setDraftEntity({
                        ...draftEntity,
                        imageUrl: e.target.value || undefined,
                      })
                    }
                    placeholder="Tempel URL gambar potret atau pilih preset di atas..."
                    className="w-full px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg text-[#231C14]"
                  />
                </div>
              )}

              {/* =========================================================== */}
              {/* CHARACTER-SPECIFIC RICH EDITOR                              */}
              {/* =========================================================== */}
              {category === 'character' && (
                <div className="space-y-4">
                  {/* 1. Identity & Relational Pickers */}
                  <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-3">
                    <div className="text-xs font-semibold text-[#9E2A2B]">
                      1. Identitas Kanon & Afiliasi (Pilih dari Entitas atau Ketik Baru)
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                          Peran Cerita
                        </label>
                        <input
                          type="text"
                          list="char-roles-list"
                          value={draftEntity.attributes.role || ''}
                          onChange={(e) =>
                            setDraftEntity({
                              ...draftEntity,
                              attributes: {
                                ...draftEntity.attributes,
                                role: e.target.value,
                              },
                            })
                          }
                          placeholder="Protagonis / Antagonis..."
                          className="w-full px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                        />
                        <datalist id="char-roles-list">
                          <option value="Protagonis" />
                          <option value="Deuteragonis" />
                          <option value="Antagonis" />
                          <option value="Mentor" />
                          <option value="Pendukung" />
                        </datalist>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                          Status Kanon
                        </label>
                        <input
                          type="text"
                          list="char-status-list"
                          value={draftEntity.attributes.status || ''}
                          onChange={(e) =>
                            setDraftEntity({
                              ...draftEntity,
                              attributes: {
                                ...draftEntity.attributes,
                                status: e.target.value,
                              },
                            })
                          }
                          placeholder="Hidup / Diasingkan / Gugur..."
                          className="w-full px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                        />
                        <datalist id="char-status-list">
                          {CHARACTER_STATUS_OPTIONS.map((st) => (
                            <option key={st} value={st} />
                          ))}
                        </datalist>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                          Usia Tokoh
                        </label>
                        <input
                          type="text"
                          value={draftEntity.attributes.age || ''}
                          onChange={(e) =>
                            setDraftEntity({
                              ...draftEntity,
                              attributes: {
                                ...draftEntity.attributes,
                                age: e.target.value,
                              },
                            })
                          }
                          placeholder="Contoh: 39 Tahun"
                          className="w-full px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                        />
                      </div>

                      {/* Hybrid Race Picker */}
                      <div>
                        <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                          Ras / Bangsa (Terhubung ke Tab Ras)
                        </label>
                        <div className="space-y-1">
                          <select
                            value=""
                            onChange={(e) => {
                              if (!e.target.value) return;
                              setDraftEntity({
                                ...draftEntity,
                                attributes: {
                                  ...draftEntity.attributes,
                                  raceName: e.target.value,
                                },
                              });
                            }}
                            className="w-full px-2.5 py-1 text-[11px] bg-[#EFE7D6] border border-[#D8CBB3] rounded text-[#231C14]"
                          >
                            <option value="">
                              -- Pilih dari Tab Ras ({raceEntities.length}) --
                            </option>
                            {raceEntities.map((r) => (
                              <option key={r.id} value={r.title}>
                                {r.title}
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={draftEntity.attributes.raceName || ''}
                            onChange={(e) =>
                              setDraftEntity({
                                ...draftEntity,
                                attributes: {
                                  ...draftEntity.attributes,
                                  raceName: e.target.value,
                                },
                              })
                            }
                            placeholder="Atau ketik nama ras..."
                            className="w-full px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                          />
                        </div>
                      </div>

                      {/* Hybrid Faction Picker */}
                      <div>
                        <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                          Kelompok / Faksi (Terhubung ke Tab Kelompok)
                        </label>
                        <div className="space-y-1">
                          <select
                            value=""
                            onChange={(e) => {
                              if (!e.target.value) return;
                              setDraftEntity({
                                ...draftEntity,
                                attributes: {
                                  ...draftEntity.attributes,
                                  factionName: e.target.value,
                                },
                              });
                            }}
                            className="w-full px-2.5 py-1 text-[11px] bg-[#EFE7D6] border border-[#D8CBB3] rounded text-[#231C14]"
                          >
                            <option value="">
                              -- Pilih dari Tab Kelompok (
                              {factionEntities.length}) --
                            </option>
                            {factionEntities.map((f) => (
                              <option key={f.id} value={f.title}>
                                {f.title}
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={draftEntity.attributes.factionName || ''}
                            onChange={(e) =>
                              setDraftEntity({
                                ...draftEntity,
                                attributes: {
                                  ...draftEntity.attributes,
                                  factionName: e.target.value,
                                },
                              })
                            }
                            placeholder="Atau ketik nama kelompok..."
                            className="w-full px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                          />
                        </div>
                      </div>

                      {/* Hybrid Nation/Region Picker */}
                      <div>
                        <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                          Negara / Tanah Asal
                        </label>
                        <div className="space-y-1">
                          <select
                            value=""
                            onChange={(e) => {
                              if (!e.target.value) return;
                              setDraftEntity({
                                ...draftEntity,
                                attributes: {
                                  ...draftEntity.attributes,
                                  originNation: e.target.value,
                                },
                              });
                            }}
                            className="w-full px-2.5 py-1 text-[11px] bg-[#EFE7D6] border border-[#D8CBB3] rounded text-[#231C14]"
                          >
                            <option value="">
                              -- Pilih Negara / Wilayah (
                              {nationAndRegionEntities.length}) --
                            </option>
                            {nationAndRegionEntities.map((n) => (
                              <option key={n.id} value={n.title}>
                                {n.title}
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={draftEntity.attributes.originNation || ''}
                            onChange={(e) =>
                              setDraftEntity({
                                ...draftEntity,
                                attributes: {
                                  ...draftEntity.attributes,
                                  originNation: e.target.value,
                                },
                              })
                            }
                            placeholder="Atau ketik negara asal..."
                            className="w-full px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                        Tingkatan Kekuatan / Power Tier
                      </label>
                      <input
                        type="text"
                        value={draftEntity.attributes.powerTier || ''}
                        onChange={(e) =>
                          setDraftEntity({
                            ...draftEntity,
                            attributes: {
                              ...draftEntity.attributes,
                              powerTier: e.target.value,
                            },
                          })
                        }
                        placeholder="Contoh: Lingkar ke-6 (Sovereign Scholar)"
                        className="w-full px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                      />
                    </div>
                  </div>

                  {/* 2. Interactive Skill & Artifact / Relic Pickers */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-2.5">
                      <div className="text-xs font-semibold text-[#9E2A2B]">
                        2A. Keahlian & Skill yang Dikuasai
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {(draftEntity.attributes.knownSkills || []).map(
                          (sk) => (
                            <span
                              key={sk}
                              className="px-2.5 py-1 rounded bg-[#231C14] text-[#FBF8F1] text-xs font-medium flex items-center gap-1.5"
                            >
                              {sk}
                              <button
                                type="button"
                                onClick={() =>
                                  toggleDraftArrayItem('knownSkills', sk)
                                }
                                className="text-[#E6D5B8] hover:text-white cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          )
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[11px] text-[#695A47]">
                          Pilih dari Tab Skill:
                        </span>
                        {skillEntities.map((skEnt) => {
                          const active = (
                            draftEntity.attributes.knownSkills || []
                          ).includes(skEnt.title);
                          return (
                            <button
                              key={skEnt.id}
                              type="button"
                              onClick={() =>
                                toggleDraftArrayItem(
                                  'knownSkills',
                                  skEnt.title
                                )
                              }
                              className={`px-2 py-0.5 rounded text-[11px] border cursor-pointer ${
                                active
                                  ? 'bg-[#9E2A2B] text-white border-[#9E2A2B]'
                                  : 'bg-[#FBF8F1] text-[#231C14] border-[#D8CBB3]'
                              }`}
                            >
                              {active ? '✓ ' : '+ '}
                              {skEnt.title}
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={customSkillInput}
                          onChange={(e) => setCustomSkillInput(e.target.value)}
                          placeholder="Ketik skill lain..."
                          className="flex-1 px-2.5 py-1 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!customSkillInput.trim()) return;
                            toggleDraftArrayItem(
                              'knownSkills',
                              customSkillInput
                            );
                            setCustomSkillInput('');
                          }}
                          className="px-3 py-1 text-xs font-semibold bg-[#EFE7D6] border border-[#D8CBB3] rounded-lg text-[#231C14] cursor-pointer"
                        >
                          + Tambah
                        </button>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-2.5">
                      <div className="text-xs font-semibold text-[#B5832A]">
                        2B. Senjata, Artefak & Pusaka Milik Tokoh
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {(draftEntity.attributes.ownedArtifacts || []).map(
                          (art) => (
                            <span
                              key={art}
                              className="px-2.5 py-1 rounded bg-[#3B2818] text-[#FBF8F1] text-xs font-medium flex items-center gap-1.5"
                            >
                              {art}
                              <button
                                type="button"
                                onClick={() =>
                                  toggleDraftArrayItem('ownedArtifacts', art)
                                }
                                className="text-[#E6D5B8] hover:text-white cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          )
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[11px] text-[#695A47]">
                          Pilih dari Tab Artefak:
                        </span>
                        {artifactEntities.map((artEnt) => {
                          const active = (
                            draftEntity.attributes.ownedArtifacts || []
                          ).includes(artEnt.title);
                          return (
                            <button
                              key={artEnt.id}
                              type="button"
                              onClick={() =>
                                toggleDraftArrayItem(
                                  'ownedArtifacts',
                                  artEnt.title
                                )
                              }
                              className={`px-2 py-0.5 rounded text-[11px] border cursor-pointer ${
                                active
                                  ? 'bg-[#9E2A2B] text-white border-[#9E2A2B]'
                                  : 'bg-[#FBF8F1] text-[#231C14] border-[#D8CBB3]'
                              }`}
                            >
                              {active ? '✓ ' : '+ '}
                              {artEnt.title}
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={customArtifactInput}
                          onChange={(e) =>
                            setCustomArtifactInput(e.target.value)
                          }
                          placeholder="Ketik senjata/pusaka lain..."
                          className="flex-1 px-2.5 py-1 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!customArtifactInput.trim()) return;
                            toggleDraftArrayItem(
                              'ownedArtifacts',
                              customArtifactInput
                            );
                            setCustomArtifactInput('');
                          }}
                          className="px-3 py-1 text-xs font-semibold bg-[#EFE7D6] border border-[#D8CBB3] rounded-lg text-[#231C14] cursor-pointer"
                        >
                          + Tambah
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 3. Signature Quote, Voice Style & Physical Appearance */}
                  <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-3">
                    <div className="text-xs font-semibold text-[#9E2A2B]">
                      3. Kutipan Khas, Gaya Bicara & Ciri Fisik Penampilan
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                          Kutipan Khas / Dialog Ikonik Tokoh
                        </label>
                        <textarea
                          rows={2}
                          value={draftEntity.attributes.signatureQuote || ''}
                          onChange={(e) =>
                            setDraftEntity({
                              ...draftEntity,
                              attributes: {
                                ...draftEntity.attributes,
                                signatureQuote: e.target.value,
                              },
                            })
                          }
                          placeholder="Dialog atau kalimat ikonik yang mencerminkan prinsip hidup tokoh ini..."
                          className="w-full p-2.5 text-xs italic bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                          Gaya Bicara & Bahasa Tubuh (Voice & Mannerism)
                        </label>
                        <textarea
                          rows={2}
                          value={draftEntity.attributes.voiceStyle || ''}
                          onChange={(e) =>
                            setDraftEntity({
                              ...draftEntity,
                              attributes: {
                                ...draftEntity.attributes,
                                voiceStyle: e.target.value,
                              },
                            })
                          }
                          placeholder="Nada bicara, kebiasaan unik, atau diksi khas..."
                          className="w-full p-2.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                        Ciri Fisik, Busana & Penampilan (Appearance)
                      </label>
                      <textarea
                        rows={2}
                        value={draftEntity.attributes.appearance || ''}
                        onChange={(e) =>
                          setDraftEntity({
                            ...draftEntity,
                            attributes: {
                              ...draftEntity.attributes,
                              appearance: e.target.value,
                            },
                          })
                        }
                        placeholder="Perawakan, warna mata/rambut, pakaian khas, atau bekas luka sihir..."
                        className="w-full p-2.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                      />
                    </div>
                  </div>

                  {/* 4. Psychology (Motivation/Goal vs Fatal Flaw) & 3-Act Character Arc */}
                  <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-3">
                    <div className="text-xs font-semibold text-[#264653]">
                      4. Psikologi (Motivasi vs Kelemahan Fatal) & Busur Perkembangan (Character Arc)
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#2D5A43] mb-1">
                          Motivasi / Tujuan Utama (Goal & Desire)
                        </label>
                        <textarea
                          rows={2}
                          value={draftEntity.attributes.motivationGoal || ''}
                          onChange={(e) =>
                            setDraftEntity({
                              ...draftEntity,
                              attributes: {
                                ...draftEntity.attributes,
                                motivationGoal: e.target.value,
                              },
                            })
                          }
                          placeholder="Apa yang paling ingin dicapai atau dilindungi tokoh ini?"
                          className="w-full p-2.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#9E2A2B] mb-1">
                          Ketakutan / Kelemahan Fatal (Fatal Flaw)
                        </label>
                        <textarea
                          rows={2}
                          value={draftEntity.attributes.fatalFlaw || ''}
                          onChange={(e) =>
                            setDraftEntity({
                              ...draftEntity,
                              attributes: {
                                ...draftEntity.attributes,
                                fatalFlaw: e.target.value,
                              },
                            })
                          }
                          placeholder="Kelemahan batin, trauma, atau kebohongan yang ia percayai..."
                          className="w-full p-2.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                          Arc I: Kondisi Awal (Babak I)
                        </label>
                        <textarea
                          rows={2}
                          value={draftEntity.attributes.arcStart || ''}
                          onChange={(e) =>
                            setDraftEntity({
                              ...draftEntity,
                              attributes: {
                                ...draftEntity.attributes,
                                arcStart: e.target.value,
                              },
                            })
                          }
                          placeholder="Sikap tokoh di awal cerita..."
                          className="w-full p-2.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                          Arc II: Titik Balik / Krisis
                        </label>
                        <textarea
                          rows={2}
                          value={draftEntity.attributes.arcCrisis || ''}
                          onChange={(e) =>
                            setDraftEntity({
                              ...draftEntity,
                              attributes: {
                                ...draftEntity.attributes,
                                arcCrisis: e.target.value,
                              },
                            })
                          }
                          placeholder="Ujian terberat yang mengguncang prinsipnya..."
                          className="w-full p-2.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                          Arc III: Perubahan Akhir
                        </label>
                        <textarea
                          rows={2}
                          value={draftEntity.attributes.arcEndgame || ''}
                          onChange={(e) =>
                            setDraftEntity({
                              ...draftEntity,
                              attributes: {
                                ...draftEntity.attributes,
                                arcEndgame: e.target.value,
                              },
                            })
                          }
                          placeholder="Transformasi tokoh di akhir cerita..."
                          className="w-full p-2.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* =========================================================== */}
              {/* RACE-SPECIFIC RICH EDITOR (Ancestry & Species Codex)        */}
              {/* =========================================================== */}
              {category === 'race' && (
                <div className="space-y-4">
                  {/* 1. Origin Classification, Lifespan & Hybrid Homeland Picker */}
                  <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-3">
                    <div className="text-xs font-semibold text-[#2D5A43]">
                      1. Klasifikasi Spesies, Rentang Usia & Tanah Kelahiran
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                          Klasifikasi Asal-Usul Ras
                        </label>
                        <input
                          type="text"
                          list="race-origin-list"
                          value={draftEntity.attributes.raceOriginClass || ''}
                          onChange={(e) =>
                            setDraftEntity({
                              ...draftEntity,
                              attributes: {
                                ...draftEntity.attributes,
                                raceOriginClass: e.target.value,
                              },
                            })
                          }
                          placeholder="Sylvan / Subterranean / Manusia..."
                          className="w-full px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                        />
                        <datalist id="race-origin-list">
                          {RACE_ORIGIN_FILTERS.filter((f) => f !== 'Semua').map(
                            (rc) => (
                              <option key={rc} value={rc} />
                            )
                          )}
                        </datalist>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                          Rentang Usia (Lifespan)
                        </label>
                        <input
                          type="text"
                          value={draftEntity.attributes.lifespan || ''}
                          onChange={(e) =>
                            setDraftEntity({
                              ...draftEntity,
                              attributes: {
                                ...draftEntity.attributes,
                                lifespan: e.target.value,
                              },
                            })
                          }
                          placeholder="Contoh: 450 - 700 Tahun"
                          className="w-full px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                          Tanah Kelahiran / Habitat Utama
                        </label>
                        <div className="space-y-1">
                          <select
                            value=""
                            onChange={(e) => {
                              if (!e.target.value) return;
                              setDraftEntity({
                                ...draftEntity,
                                attributes: {
                                  ...draftEntity.attributes,
                                  homeland: e.target.value,
                                },
                              });
                            }}
                            className="w-full px-2.5 py-1 text-[11px] bg-[#EFE7D6] border border-[#D8CBB3] rounded text-[#231C14]"
                          >
                            <option value="">
                              -- Pilih Wilayah / Negara (
                              {nationAndRegionEntities.length}) --
                            </option>
                            {nationAndRegionEntities.map((nr) => (
                              <option key={nr.id} value={nr.title}>
                                [{CATEGORY_META[nr.category].singular}]{' '}
                                {nr.title}
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={draftEntity.attributes.homeland || ''}
                            onChange={(e) =>
                              setDraftEntity({
                                ...draftEntity,
                                attributes: {
                                  ...draftEntity.attributes,
                                  homeland: e.target.value,
                                },
                              })
                            }
                            placeholder="Atau ketik nama wilayah..."
                            className="w-full px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. Sub-Races / Bloodlines & Signature Skills Pickers */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Sub-Races Picker */}
                    <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-2.5">
                      <div className="text-xs font-semibold text-[#2D5A43]">
                        2A. Cabang Sub-Ras / Garis Keturunan Darah
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(draftEntity.attributes.subRaces || []).map((sr) => (
                          <span
                            key={sr}
                            className="px-2.5 py-1 rounded bg-[#2D5A43] text-[#FBF8F1] text-xs font-medium flex items-center gap-1.5"
                          >
                            {sr}
                            <button
                              type="button"
                              onClick={() =>
                                toggleDraftArrayItem('subRaces', sr)
                              }
                              className="text-[#E6D5B8] hover:text-white cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={customSubRaceInput}
                          onChange={(e) =>
                            setCustomSubRaceInput(e.target.value)
                          }
                          placeholder="Contoh: Aelfir Kanopi Perak..."
                          className="flex-1 px-2.5 py-1 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!customSubRaceInput.trim()) return;
                            toggleDraftArrayItem(
                              'subRaces',
                              customSubRaceInput
                            );
                            setCustomSubRaceInput('');
                          }}
                          className="px-3 py-1 text-xs font-semibold bg-[#EFE7D6] border border-[#D8CBB3] rounded-lg text-[#231C14] cursor-pointer"
                        >
                          + Tambah Sub-Ras
                        </button>
                      </div>
                    </div>

                    {/* Signature Skills Picker */}
                    <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-2.5">
                      <div className="text-xs font-semibold text-[#9E2A2B]">
                        2B. Teknik / Skill Khas Warisan Ras
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(draftEntity.attributes.signatureSkills || []).map(
                          (sk) => (
                            <span
                              key={sk}
                              className="px-2.5 py-1 rounded bg-[#231C14] text-[#FBF8F1] text-xs font-medium flex items-center gap-1.5"
                            >
                              {sk}
                              <button
                                type="button"
                                onClick={() =>
                                  toggleDraftArrayItem('signatureSkills', sk)
                                }
                                className="text-[#E6D5B8] hover:text-white cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          )
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[11px] text-[#695A47]">
                          Pilih dari Tab Skill:
                        </span>
                        {skillEntities.map((skEnt) => {
                          const active = (
                            draftEntity.attributes.signatureSkills || []
                          ).includes(skEnt.title);
                          return (
                            <button
                              key={skEnt.id}
                              type="button"
                              onClick={() =>
                                toggleDraftArrayItem(
                                  'signatureSkills',
                                  skEnt.title
                                )
                              }
                              className={`px-2 py-0.5 rounded text-[11px] border cursor-pointer ${
                                active
                                  ? 'bg-[#9E2A2B] text-white border-[#9E2A2B]'
                                  : 'bg-[#FBF8F1] text-[#231C14] border-[#D8CBB3]'
                              }`}
                            >
                              {active ? '✓ ' : '+ '}
                              {skEnt.title}
                            </button>
                          );
                        })}
                      </div>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={customRaceSkillInput}
                          onChange={(e) =>
                            setCustomRaceSkillInput(e.target.value)
                          }
                          placeholder="Ketik teknik khas lain..."
                          className="flex-1 px-2.5 py-1 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!customRaceSkillInput.trim()) return;
                            toggleDraftArrayItem(
                              'signatureSkills',
                              customRaceSkillInput
                            );
                            setCustomRaceSkillInput('');
                          }}
                          className="px-3 py-1 text-xs font-semibold bg-[#EFE7D6] border border-[#D8CBB3] rounded-lg text-[#231C14] cursor-pointer"
                        >
                          + Tambah
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 3. Biology, Physical Traits, Innate Abilities & Racial Weakness */}
                  <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-3">
                    <div className="text-xs font-semibold text-[#2D5A43]">
                      3. Anatomi Fisik, Bakat Bawaan & Kelemahan Biologis Ras
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                        Ciri Anatomi & Fisik Khas (Traits)
                      </label>
                      <textarea
                        rows={2}
                        value={draftEntity.attributes.traits || ''}
                        onChange={(e) =>
                          setDraftEntity({
                            ...draftEntity,
                            attributes: {
                              ...draftEntity.attributes,
                              traits: e.target.value,
                            },
                          })
                        }
                        placeholder="Ciri mata, telinga, perawakan, atau penanda biologis..."
                        className="w-full p-2.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#2D5A43] mb-1">
                          Bakat Magis & Kemampuan Bawaan (Innate Abilities)
                        </label>
                        <textarea
                          rows={2}
                          value={draftEntity.attributes.innateAbilities || ''}
                          onChange={(e) =>
                            setDraftEntity({
                              ...draftEntity,
                              attributes: {
                                ...draftEntity.attributes,
                                innateAbilities: e.target.value,
                              },
                            })
                          }
                          placeholder="Keunggulan alami, pancaindra khusus, atau afinitas elemen..."
                          className="w-full p-2.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#9E2A2B] mb-1">
                          Kelemahan Biologis / Pantangan Rasial (Racial Weakness)
                        </label>
                        <textarea
                          rows={2}
                          value={draftEntity.attributes.racialWeakness || ''}
                          onChange={(e) =>
                            setDraftEntity({
                              ...draftEntity,
                              attributes: {
                                ...draftEntity.attributes,
                                racialWeakness: e.target.value,
                              },
                            })
                          }
                          placeholder="Kerentanan terhadap elemen tertentu, kutukan darah, atau batasan fisik..."
                          className="w-full p-2.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 4. Language & Naming Conventions, Culture/Traditions & Inter-Race Relations */}
                  <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-3">
                    <div className="text-xs font-semibold text-[#B5832A]">
                      4. Bahasa, Pola Nama Khas (Naming Conventions), Budaya & Diplomasi
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                        Bahasa, Aksara & Pola Penamaan Tokoh (Naming Conventions)
                      </label>
                      <textarea
                        rows={2}
                        value={draftEntity.attributes.languageAndNaming || ''}
                        onChange={(e) =>
                          setDraftEntity({
                            ...draftEntity,
                            attributes: {
                              ...draftEntity.attributes,
                              languageAndNaming: e.target.value,
                            },
                          })
                        }
                        placeholder="Nama bahasa, bentuk aksara, dan contoh format nama depan/marga khas ras ini..."
                        className="w-full p-2.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                          Struktur Sosial, Tradisi & Tabu Budaya
                        </label>
                        <textarea
                          rows={2}
                          value={
                            draftEntity.attributes.cultureAndTraditions || ''
                          }
                          onChange={(e) =>
                            setDraftEntity({
                              ...draftEntity,
                              attributes: {
                                ...draftEntity.attributes,
                                cultureAndTraditions: e.target.value,
                              },
                            })
                          }
                          placeholder="Adat istiadat, ritual sakral, dan pantangan sosial..."
                          className="w-full p-2.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                          Pandangan & Hubungan dengan Ras Lain
                        </label>
                        <textarea
                          rows={2}
                          value={
                            draftEntity.attributes.interRaceRelations || ''
                          }
                          onChange={(e) =>
                            setDraftEntity({
                              ...draftEntity,
                              attributes: {
                                ...draftEntity.attributes,
                                interRaceRelations: e.target.value,
                              },
                            })
                          }
                          placeholder="Bangsa mana yang menjadi sekutu atau rival sejarah mereka..."
                          className="w-full p-2.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* =========================================================== */}
              {/* FACTION-SPECIFIC RICH EDITOR (Faction & Order Bible)        */}
              {/* =========================================================== */}
              {category === 'faction' && (
                <div className="space-y-4">
                  {/* 1. Organization Classification, Scale, Hybrid Leader & Headquarters Pickers */}
                  <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-3">
                    <div className="text-xs font-semibold text-[#8F5B14]">
                      1. Klasifikasi Organisasi, Pucuk Pimpinan & Markas Besar
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                          Jenis Organisasi / Faksi
                        </label>
                        <input
                          type="text"
                          list="faction-type-list"
                          value={draftEntity.attributes.factionType || ''}
                          onChange={(e) =>
                            setDraftEntity({
                              ...draftEntity,
                              attributes: {
                                ...draftEntity.attributes,
                                factionType: e.target.value,
                              },
                            })
                          }
                          placeholder="Ordo Ksatria / Majelis Sihir / Gilda Dagang..."
                          className="w-full px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                        />
                        <datalist id="faction-type-list">
                          {FACTION_TYPE_FILTERS.filter(
                            (f) => f !== 'Semua'
                          ).map((ft) => (
                            <option key={ft} value={ft} />
                          ))}
                        </datalist>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                          Skala Pengaruh & Jangkauan Operasi
                        </label>
                        <input
                          type="text"
                          list="faction-scale-list"
                          value={draftEntity.attributes.influenceScale || ''}
                          onChange={(e) =>
                            setDraftEntity({
                              ...draftEntity,
                              attributes: {
                                ...draftEntity.attributes,
                                influenceScale: e.target.value,
                              },
                            })
                          }
                          placeholder="Lintas Benua / Regional / Bawah Tanah..."
                          className="w-full px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                        />
                        <datalist id="faction-scale-list">
                          {FACTION_SCALE_OPTIONS.filter(
                            (s) => s !== 'Semua Skala'
                          ).map((sc) => (
                            <option key={sc} value={sc} />
                          ))}
                        </datalist>
                      </div>

                      {/* Hybrid Leader Picker */}
                      <div>
                        <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                          Pemimpin Tertinggi (Pilih dari Tokoh atau Ketik Baru)
                        </label>
                        <div className="space-y-1">
                          <select
                            value=""
                            onChange={(e) => {
                              if (!e.target.value) return;
                              setDraftEntity({
                                ...draftEntity,
                                attributes: {
                                  ...draftEntity.attributes,
                                  leader: e.target.value,
                                },
                              });
                            }}
                            className="w-full px-2.5 py-1 text-[11px] bg-[#EFE7D6] border border-[#D8CBB3] rounded text-[#231C14]"
                          >
                            <option value="">
                              -- Pilih dari Tab Character (
                              {characterEntities.length}) --
                            </option>
                            {characterEntities.map((c) => (
                              <option key={c.id} value={c.title}>
                                {c.title}
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={draftEntity.attributes.leader || ''}
                            onChange={(e) =>
                              setDraftEntity({
                                ...draftEntity,
                                attributes: {
                                  ...draftEntity.attributes,
                                  leader: e.target.value,
                                },
                              })
                            }
                            placeholder="Atau ketik nama/gelar pemimpin..."
                            className="w-full px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                          />
                        </div>
                      </div>

                      {/* Hybrid Headquarters Picker */}
                      <div>
                        <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                          Markas Besar Utama (Pilih dari Wilayah/Negara atau Ketik)
                        </label>
                        <div className="space-y-1">
                          <select
                            value=""
                            onChange={(e) => {
                              if (!e.target.value) return;
                              setDraftEntity({
                                ...draftEntity,
                                attributes: {
                                  ...draftEntity.attributes,
                                  headquarters: e.target.value,
                                },
                              });
                            }}
                            className="w-full px-2.5 py-1 text-[11px] bg-[#EFE7D6] border border-[#D8CBB3] rounded text-[#231C14]"
                          >
                            <option value="">
                              -- Pilih Wilayah / Negara (
                              {nationAndRegionEntities.length}) --
                            </option>
                            {nationAndRegionEntities.map((nr) => (
                              <option key={nr.id} value={nr.title}>
                                [{CATEGORY_META[nr.category].singular}]{' '}
                                {nr.title}
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={draftEntity.attributes.headquarters || ''}
                            onChange={(e) =>
                              setDraftEntity({
                                ...draftEntity,
                                attributes: {
                                  ...draftEntity.attributes,
                                  headquarters: e.target.value,
                                },
                              })
                            }
                            placeholder="Atau ketik lokasi markas..."
                            className="w-full px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                        Lambang Panji, Warna Seragam & Semboyan Organisasi
                      </label>
                      <input
                        type="text"
                        value={draftEntity.attributes.emblemSymbol || ''}
                        onChange={(e) =>
                          setDraftEntity({
                            ...draftEntity,
                            attributes: {
                              ...draftEntity.attributes,
                              emblemSymbol: e.target.value,
                            },
                          })
                        }
                        placeholder='Contoh: Kompas Perak di atas Beludru Biru · Semboyan: "Mengukur Langit, Menjaga Bumi"'
                        className="w-full px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                      />
                    </div>
                  </div>

                  {/* 2. Rank Hierarchy Ladder & Faction Artifacts Pickers */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Rank Hierarchy Manager */}
                    <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-2.5">
                      <div className="text-xs font-semibold text-[#8F5B14]">
                        2A. Struktur Tangga Hierarki Pangkat (Bawah ke Atas)
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(draftEntity.attributes.rankHierarchy || []).map(
                          (rk) => (
                            <span
                              key={rk}
                              className="px-2.5 py-1 rounded bg-[#231C14] text-[#FBF8F1] text-xs font-medium flex items-center gap-1.5"
                            >
                              {rk}
                              <button
                                type="button"
                                onClick={() =>
                                  toggleDraftArrayItem('rankHierarchy', rk)
                                }
                                className="text-[#E6D5B8] hover:text-white cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          )
                        )}
                      </div>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={customRankInput}
                          onChange={(e) => setCustomRankInput(e.target.value)}
                          placeholder="Contoh: 1. Akolit Lentera..."
                          className="flex-1 px-2.5 py-1 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!customRankInput.trim()) return;
                            toggleDraftArrayItem(
                              'rankHierarchy',
                              customRankInput
                            );
                            setCustomRankInput('');
                          }}
                          className="px-3 py-1 text-xs font-semibold bg-[#EFE7D6] border border-[#D8CBB3] rounded-lg text-[#231C14] cursor-pointer"
                        >
                          + Tambah Pangkat
                        </button>
                      </div>
                    </div>

                    {/* Faction Artifacts / Strategic Assets Picker */}
                    <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-2.5">
                      <div className="text-xs font-semibold text-[#9E2A2B]">
                        2B. Pusaka, Relik & Aset Strategis Milik Kelompok
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(draftEntity.attributes.factionArtifacts || []).map(
                          (art) => (
                            <span
                              key={art}
                              className="px-2.5 py-1 rounded bg-[#3B2818] text-[#FBF8F1] text-xs font-medium flex items-center gap-1.5"
                            >
                              {art}
                              <button
                                type="button"
                                onClick={() =>
                                  toggleDraftArrayItem('factionArtifacts', art)
                                }
                                className="text-[#E6D5B8] hover:text-white cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          )
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[11px] text-[#695A47]">
                          Pilih dari Tab Artefak:
                        </span>
                        {artifactEntities.map((artEnt) => {
                          const active = (
                            draftEntity.attributes.factionArtifacts || []
                          ).includes(artEnt.title);
                          return (
                            <button
                              key={artEnt.id}
                              type="button"
                              onClick={() =>
                                toggleDraftArrayItem(
                                  'factionArtifacts',
                                  artEnt.title
                                )
                              }
                              className={`px-2 py-0.5 rounded text-[11px] border cursor-pointer ${
                                active
                                  ? 'bg-[#9E2A2B] text-white border-[#9E2A2B]'
                                  : 'bg-[#FBF8F1] text-[#231C14] border-[#D8CBB3]'
                              }`}
                            >
                              {active ? '✓ ' : '+ '}
                              {artEnt.title}
                            </button>
                          );
                        })}
                      </div>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={customFactionArtifactInput}
                          onChange={(e) =>
                            setCustomFactionArtifactInput(e.target.value)
                          }
                          placeholder="Ketik relik/aset lain..."
                          className="flex-1 px-2.5 py-1 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!customFactionArtifactInput.trim()) return;
                            toggleDraftArrayItem(
                              'factionArtifacts',
                              customFactionArtifactInput
                            );
                            setCustomFactionArtifactInput('');
                          }}
                          className="px-3 py-1 text-xs font-semibold bg-[#EFE7D6] border border-[#D8CBB3] rounded-lg text-[#231C14] cursor-pointer"
                        >
                          + Tambah
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 3. Recruitment Oath, Public Ideology vs Secret Agenda & Resources */}
                  <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-3">
                    <div className="text-xs font-semibold text-[#8F5B14]">
                      3. Sumpah Setia, Doktrin Publik vs Agenda Rahasia & Sumber Daya
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                        Syarat Perekrutan, Ujian Inisiasi & Sumpah Setia Anggota
                      </label>
                      <textarea
                        rows={2}
                        value={draftEntity.attributes.recruitmentOath || ''}
                        onChange={(e) =>
                          setDraftEntity({
                            ...draftEntity,
                            attributes: {
                              ...draftEntity.attributes,
                              recruitmentOath: e.target.value,
                            },
                          })
                        }
                        placeholder="Bagaimana seseorang direkrut, apa ujian masuknya, dan apa konsekuensi mengkhianati kelompok..."
                        className="w-full p-2.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#2D5A43] mb-1">
                          Doktrin & Ideologi Publik (Tujuan Resmi)
                        </label>
                        <textarea
                          rows={2}
                          value={draftEntity.attributes.ideology || ''}
                          onChange={(e) =>
                            setDraftEntity({
                              ...draftEntity,
                              attributes: {
                                ...draftEntity.attributes,
                                ideology: e.target.value,
                              },
                            })
                          }
                          placeholder="Tujuan mulia atau filosofi resmi yang diumumkan kepada publik..."
                          className="w-full p-2.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#9E2A2B] mb-1">
                          Agenda Rahasia & Konspirasi Internal (Di Balik Layar)
                        </label>
                        <textarea
                          rows={2}
                          value={draftEntity.attributes.secretAgenda || ''}
                          onChange={(e) =>
                            setDraftEntity({
                              ...draftEntity,
                              attributes: {
                                ...draftEntity.attributes,
                                secretAgenda: e.target.value,
                              },
                            })
                          }
                          placeholder="Rencana tersembunyi, operasi bayangan, atau rahasia yang hanya diketahui petinggi..."
                          className="w-full p-2.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                        Sumber Pendanaan, Pasukan Khusus & Wilayah Pengaruh
                      </label>
                      <textarea
                        rows={2}
                        value={draftEntity.attributes.resourcesAndAssets || ''}
                        onChange={(e) =>
                          setDraftEntity({
                            ...draftEntity,
                            attributes: {
                              ...draftEntity.attributes,
                              resourcesAndAssets: e.target.value,
                            },
                          })
                        }
                        placeholder="Dari mana kelompok ini mendapat emas, senjata, intelijen, atau dukungan militer..."
                        className="w-full p-2.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                      />
                    </div>
                  </div>

                  {/* 4. Diplomacy: Allied Factions vs Rival Factions */}
                  <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-3">
                    <div className="text-xs font-semibold text-[#264653]">
                      4. Peta Politik & Diplomasi Antar-Kelompok (Gunakan [[Nama Entitas]] untuk Tautan)
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#2D5A43] mb-1">
                          Sekutu, Patron & Mitra Dagang (Allied Factions)
                        </label>
                        <textarea
                          rows={2}
                          value={draftEntity.attributes.alliedFactions || ''}
                          onChange={(e) =>
                            setDraftEntity({
                              ...draftEntity,
                              attributes: {
                                ...draftEntity.attributes,
                                alliedFactions: e.target.value,
                              },
                            })
                          }
                          placeholder="Kelompok, ras, atau kerajaan mana yang bersekutu dengan organisasi ini..."
                          className="w-full p-2.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#9E2A2B] mb-1">
                          Rival Politik & Musuh Bebuyutan (Rival Factions)
                        </label>
                        <textarea
                          rows={2}
                          value={draftEntity.attributes.rivalFactions || ''}
                          onChange={(e) =>
                            setDraftEntity({
                              ...draftEntity,
                              attributes: {
                                ...draftEntity.attributes,
                                rivalFactions: e.target.value,
                              },
                            })
                          }
                          placeholder="Kelompok atau penguasa mana yang berusaha menghancurkan atau menyaingi mereka..."
                          className="w-full p-2.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Other Categories Structured Fields */}
              {category !== 'character' &&
                category !== 'race' &&
                category !== 'faction' && (
                  <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-3">
                    <div className="text-xs font-semibold text-[#9E2A2B]">
                      Parameter Khusus {sectionMeta.label}
                    </div>

                  {category === 'nation' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Bentuk Pemerintahan"
                        value={draftEntity.attributes.government || ''}
                        onChange={(e) =>
                          setDraftEntity({
                            ...draftEntity,
                            attributes: {
                              ...draftEntity.attributes,
                              government: e.target.value,
                            },
                          })
                        }
                        className="px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="Ibu Kota Kerajaan"
                        value={draftEntity.attributes.capitalCity || ''}
                        onChange={(e) =>
                          setDraftEntity({
                            ...draftEntity,
                            attributes: {
                              ...draftEntity.attributes,
                              capitalCity: e.target.value,
                            },
                          })
                        }
                        className="px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="Raja / Penguasa Saat Ini"
                        value={draftEntity.attributes.ruler || ''}
                        onChange={(e) =>
                          setDraftEntity({
                            ...draftEntity,
                            attributes: {
                              ...draftEntity.attributes,
                              ruler: e.target.value,
                            },
                          })
                        }
                        className="px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="Mata Uang & Ekonomi"
                        value={draftEntity.attributes.currency || ''}
                        onChange={(e) =>
                          setDraftEntity({
                            ...draftEntity,
                            attributes: {
                              ...draftEntity.attributes,
                              currency: e.target.value,
                            },
                          })
                        }
                        className="px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                      />
                    </div>
                  )}

                  {category === 'region' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Negara / Kedaulatan Induk"
                        value={draftEntity.attributes.parentNation || ''}
                        onChange={(e) =>
                          setDraftEntity({
                            ...draftEntity,
                            attributes: {
                              ...draftEntity.attributes,
                              parentNation: e.target.value,
                            },
                          })
                        }
                        className="px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="Iklim & Cuaca"
                        value={draftEntity.attributes.climate || ''}
                        onChange={(e) =>
                          setDraftEntity({
                            ...draftEntity,
                            attributes: {
                              ...draftEntity.attributes,
                              climate: e.target.value,
                            },
                          })
                        }
                        className="px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="Sumber Daya Alam / Magis"
                        value={draftEntity.attributes.resources || ''}
                        onChange={(e) =>
                          setDraftEntity({
                            ...draftEntity,
                            attributes: {
                              ...draftEntity.attributes,
                              resources: e.target.value,
                            },
                          })
                        }
                        className="px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="Tingkat Bahaya Wilayah"
                        value={draftEntity.attributes.dangerLevel || ''}
                        onChange={(e) =>
                          setDraftEntity({
                            ...draftEntity,
                            attributes: {
                              ...draftEntity.attributes,
                              dangerLevel: e.target.value,
                            },
                          })
                        }
                        className="px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                      />
                    </div>
                  )}

                  {category === 'power_system' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Sumber Energi / Asal Kekuatan"
                        value={draftEntity.attributes.energySource || ''}
                        onChange={(e) =>
                          setDraftEntity({
                            ...draftEntity,
                            attributes: {
                              ...draftEntity.attributes,
                              energySource: e.target.value,
                            },
                          })
                        }
                        className="px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="Urutan Tingkatan / Tier"
                        value={draftEntity.attributes.tierHierarchy || ''}
                        onChange={(e) =>
                          setDraftEntity({
                            ...draftEntity,
                            attributes: {
                              ...draftEntity.attributes,
                              tierHierarchy: e.target.value,
                            },
                          })
                        }
                        className="px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="Hukum & Batasan Mutlak (Hard Rules)"
                        value={draftEntity.attributes.hardRules || ''}
                        onChange={(e) =>
                          setDraftEntity({
                            ...draftEntity,
                            attributes: {
                              ...draftEntity.attributes,
                              hardRules: e.target.value,
                            },
                          })
                        }
                        className="px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="Risiko / Efek Samping Berlebih"
                        value={draftEntity.attributes.corruptionCost || ''}
                        onChange={(e) =>
                          setDraftEntity({
                            ...draftEntity,
                            attributes: {
                              ...draftEntity.attributes,
                              corruptionCost: e.target.value,
                            },
                          })
                        }
                        className="px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                      />
                    </div>
                  )}

                  {category === 'skill' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Power System Induk"
                        value={draftEntity.attributes.parentPowerSystem || ''}
                        onChange={(e) =>
                          setDraftEntity({
                            ...draftEntity,
                            attributes: {
                              ...draftEntity.attributes,
                              parentPowerSystem: e.target.value,
                            },
                          })
                        }
                        className="px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="Tingkatan / Rank Skill"
                        value={draftEntity.attributes.skillRank || ''}
                        onChange={(e) =>
                          setDraftEntity({
                            ...draftEntity,
                            attributes: {
                              ...draftEntity.attributes,
                              skillRank: e.target.value,
                            },
                          })
                        }
                        className="px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="Syarat / Biaya Aktivasi"
                        value={draftEntity.attributes.activationCost || ''}
                        onChange={(e) =>
                          setDraftEntity({
                            ...draftEntity,
                            attributes: {
                              ...draftEntity.attributes,
                              activationCost: e.target.value,
                            },
                          })
                        }
                        className="px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="Batas Waktu / Cooldown / Kelemahan"
                        value={draftEntity.attributes.cooldownOrLimit || ''}
                        onChange={(e) =>
                          setDraftEntity({
                            ...draftEntity,
                            attributes: {
                              ...draftEntity.attributes,
                              cooldownOrLimit: e.target.value,
                            },
                          })
                        }
                        className="px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                      />
                    </div>
                  )}

                  {category === 'history' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="Era Penanggalan"
                        value={draftEntity.attributes.era || ''}
                        onChange={(e) =>
                          setDraftEntity({
                            ...draftEntity,
                            attributes: {
                              ...draftEntity.attributes,
                              era: e.target.value,
                            },
                          })
                        }
                        className="px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="Pihak yang Terlibat"
                        value={draftEntity.attributes.belligerents || ''}
                        onChange={(e) =>
                          setDraftEntity({
                            ...draftEntity,
                            attributes: {
                              ...draftEntity.attributes,
                              belligerents: e.target.value,
                            },
                          })
                        }
                        className="px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="Dampak Sejarah Utama"
                        value={draftEntity.attributes.outcome || ''}
                        onChange={(e) =>
                          setDraftEntity({
                            ...draftEntity,
                            attributes: {
                              ...draftEntity.attributes,
                              outcome: e.target.value,
                            },
                          })
                        }
                        className="px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                      />
                    </div>
                  )}

                  {category === 'encyclopedia' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="Tingkat Kelangkaan"
                        value={draftEntity.attributes.rarity || ''}
                        onChange={(e) =>
                          setDraftEntity({
                            ...draftEntity,
                            attributes: {
                              ...draftEntity.attributes,
                              rarity: e.target.value,
                            },
                          })
                        }
                        className="px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="Asal-Usul / Habitat"
                        value={draftEntity.attributes.habitatOrOrigin || ''}
                        onChange={(e) =>
                          setDraftEntity({
                            ...draftEntity,
                            attributes: {
                              ...draftEntity.attributes,
                              habitatOrOrigin: e.target.value,
                            },
                          })
                        }
                        className="px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="Khasiat / Efek Khusus"
                        value={draftEntity.attributes.magicalProperties || ''}
                        onChange={(e) =>
                          setDraftEntity({
                            ...draftEntity,
                            attributes: {
                              ...draftEntity.attributes,
                              magicalProperties: e.target.value,
                            },
                          })
                        }
                        className="px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Wiki Cross-link Helper Bar + Main Markdown/Lore Textarea */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <label className="text-xs font-semibold text-[#695A47]">
                    Catatan Sejarah & Lore Lengkap (Gunakan [[Nama Entitas]] untuk Cross-Link otomatis)
                  </label>
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-[11px] text-[#695A47]">
                      Sisipkan Tautan Cepat:
                    </span>
                    {entities.slice(0, 4).map((ent) => (
                      <button
                        key={ent.id}
                        type="button"
                        onClick={() => insertWikiLink(ent.title)}
                        className="px-2 py-0.5 text-[11px] bg-[#EFE7D6] hover:bg-[#D8CBB3] text-[#231C14] rounded cursor-pointer"
                      >
                        +[[{ent.title.split(' ')[0]}]]
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  rows={8}
                  value={draftEntity.content}
                  onChange={(e) =>
                    setDraftEntity({ ...draftEntity, content: e.target.value })
                  }
                  className="w-full p-3.5 text-sm bg-[#F6F1E6] border border-[#D8CBB3] rounded-xl text-[#231C14] leading-relaxed focus:outline-none focus:border-[#9E2A2B]"
                />
              </div>
            </form>
          ) : activeEntity ? (
            <div className="space-y-6">
              {/* Header & Metadata Row */}
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#D8CBB3] pb-5">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#695A47]">
                    <span
                      className="font-semibold"
                      style={{
                        color: CATEGORY_META[activeEntity.category].accentColor,
                      }}
                    >
                      {CATEGORY_META[activeEntity.category].label}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>Diperbarui {activeEntity.updatedAt}</span>
                    {activeEntity.tags.length > 0 && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{activeEntity.tags.join(' / ')}</span>
                      </>
                    )}
                  </div>
                  <h2 className="font-display text-3xl font-bold text-[#231C14]">
                    {activeEntity.title}
                  </h2>
                  <p className="text-sm font-medium text-[#695A47] italic">
                    {activeEntity.subtitle}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onRunAuditOnEntity(activeEntity)}
                    className="px-3 py-1.5 text-xs font-semibold border border-[#B5832A] bg-[#F6F1E6] text-[#231C14] hover:bg-[#EFE7D6] rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#9E2A2B]" />
                    Cek Konsistensi Lore (AI)
                  </button>
                  <button
                    type="button"
                    onClick={() => startEditing(activeEntity)}
                    className="px-3 py-1.5 text-xs font-semibold bg-[#231C14] text-[#FBF8F1] hover:bg-[#3A2E21] rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Sunting
                  </button>
                  {entities.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onDeleteEntity(activeEntity.id)}
                      className="p-1.5 text-[#9E2A2B] border border-[#9E2A2B]/30 rounded-lg hover:bg-[#9E2A2B]/10 transition-colors cursor-pointer"
                      title="Hapus entri ini"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Character Signature Quote Banner (All-around border, no border-l-4) */}
              {category === 'character' && activeAttrs.signatureQuote && (
                <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#9E2A2B]">
                    <Quote className="w-3.5 h-3.5" />
                    <span>Kutipan Khas & Suara Karakter</span>
                  </div>
                  <p className="text-sm italic text-[#231C14] leading-relaxed">
                    “{activeAttrs.signatureQuote}”
                  </p>
                  {activeAttrs.voiceStyle && (
                    <div className="text-xs text-[#695A47] pt-0.5">
                      <strong className="text-[#231C14]">Gaya Bicara:</strong>{' '}
                      {activeAttrs.voiceStyle}
                    </div>
                  )}
                </div>
              )}

              {/* Faction Banner Emblem & Motto */}
              {category === 'faction' && activeAttrs.emblemSymbol && (
                <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#8F5B14]">
                    <Compass className="w-3.5 h-3.5" />
                    <span>Lambang Panji & Semboyan Organisasi</span>
                  </div>
                  <p className="text-sm font-semibold text-[#231C14] leading-relaxed">
                    {activeAttrs.emblemSymbol}
                  </p>
                </div>
              )}

              {/* Portrait + Summary + Structured Attributes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                {activeEntity.imageUrl && (
                  <div className="md:col-span-4 space-y-2">
                    <div className="rounded-xl overflow-hidden border border-[#D8CBB3] bg-[#EFE7D6]">
                      <img
                        src={activeEntity.imageUrl}
                        alt={activeEntity.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-60 object-cover"
                      />
                    </div>
                    {category === 'character' && activeAttrs.appearance && (
                      <div className="p-3 rounded-lg bg-[#F6F1E6] border border-[#D8CBB3] text-xs text-[#695A47] leading-relaxed">
                        <strong className="text-[#231C14] block mb-0.5">
                          Ciri Fisik & Busana:
                        </strong>
                        {activeAttrs.appearance}
                      </div>
                    )}
                  </div>
                )}

                <div
                  className={
                    activeEntity.imageUrl
                      ? 'md:col-span-8 space-y-3'
                      : 'md:col-span-12 space-y-3'
                  }
                >
                  <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3]">
                    <div className="text-xs font-semibold text-[#695A47] mb-1">
                      Ikhtisar Kanon
                    </div>
                    <div className="text-sm text-[#231C14] font-medium leading-relaxed">
                      <WikiTextRenderer
                        text={activeEntity.summary}
                        entities={entities}
                        onSelectEntity={jumpToEntity}
                      />
                    </div>
                  </div>

                  {category === 'character' &&
                    !activeEntity.imageUrl &&
                    activeAttrs.appearance && (
                      <div className="p-3.5 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] text-xs text-[#695A47] leading-relaxed">
                        <strong className="text-[#231C14] block mb-0.5">
                          Ciri Fisik & Penampilan:
                        </strong>
                        {activeAttrs.appearance}
                      </div>
                    )}

                  {/* Structured Attribute Key-Values (With Clickable Relational Links!) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {Object.entries(activeAttrs)
                      .filter(([key, val]) => {
                        if (
                          [
                            'signatureQuote',
                            'voiceStyle',
                            'appearance',
                            'motivationGoal',
                            'fatalFlaw',
                            'arcStart',
                            'arcCrisis',
                            'arcEndgame',
                            'knownSkills',
                            'ownedArtifacts',
                            'innateAbilities',
                            'racialWeakness',
                            'languageAndNaming',
                            'cultureAndTraditions',
                            'interRaceRelations',
                            'subRaces',
                            'signatureSkills',
                            'emblemSymbol',
                            'rankHierarchy',
                            'recruitmentOath',
                            'ideology',
                            'secretAgenda',
                            'resourcesAndAssets',
                            'factionArtifacts',
                            'alliedFactions',
                            'rivalFactions',
                          ].includes(key)
                        ) {
                          return false;
                        }
                        return Array.isArray(val)
                          ? val.length > 0
                          : Boolean(val);
                      })
                      .map(([key, val]) => {
                        const labelMap: Record<string, string> = {
                          role: 'Peran Cerita',
                          raceName: 'Ras / Bangsa',
                          factionName: 'Afiliasi Kelompok',
                          originNation: 'Negara / Wilayah Asal',
                          age: 'Usia',
                          status: 'Status Kanon',
                          powerTier: 'Tingkat Kekuatan',
                          raceOriginClass: 'Klasifikasi Spesies',
                          lifespan: 'Rentang Usia',
                          traits: 'Anatomi & Ciri Fisik',
                          homeland: 'Tanah Kelahiran / Habitat',
                          factionType: 'Jenis Organisasi',
                          influenceScale: 'Skala Pengaruh',
                          leader: 'Pucuk Pimpinan',
                          headquarters: 'Markas Besar Utama',
                          government: 'Pemerintahan',
                          capitalCity: 'Ibu Kota',
                          ruler: 'Penguasa Saat Ini',
                          stateReligion: 'Kepercayaan Resmi',
                          currency: 'Mata Uang',
                          parentNation: 'Kedaulatan Induk',
                          climate: 'Iklim & Cuaca',
                          landmarks: 'Titik Penting',
                          resources: 'Sumber Daya',
                          dangerLevel: 'Tingkat Bahaya',
                          era: 'Era Penanggalan',
                          year: 'Tahun Kejadian',
                          belligerents: 'Pihak Terlibat',
                          outcome: 'Dampak Sejarah',
                          energySource: 'Sumber Energi',
                          hardRules: 'Hukum Mutlak',
                          tierHierarchy: 'Urutan Tingkatan',
                          corruptionCost: 'Risiko / Harga Kekuatan',
                          parentPowerSystem: 'Sistem Kekuatan',
                          skillRank: 'Tingkat Teknik',
                          elementAffinity: 'Elemen / Afiliasi',
                          activationCost: 'Syarat Aktivasi',
                          cooldownOrLimit: 'Batas Penggunaan',
                          subCategory: 'Klasifikasi Ensiklopedia',
                          rarity: 'Tingkat Kelangkaan',
                          habitatOrOrigin: 'Asal / Habitat',
                          magicalProperties: 'Khasiat / Efek Arcane',
                        };

                        const preferredCat: LoreCategory | undefined =
                          key === 'raceName'
                            ? 'race'
                            : key === 'factionName'
                            ? 'faction'
                            : key === 'leader' || key === 'ruler'
                            ? 'character'
                            : key === 'originNation' ||
                              key === 'parentNation' ||
                              key === 'homeland' ||
                              key === 'headquarters'
                            ? 'region'
                            : key === 'parentPowerSystem'
                            ? 'power_system'
                            : undefined;

                        const matchedEnt = findMatchingEntityByName(
                          String(val),
                          preferredCat
                        );

                        return (
                          <div
                            key={key}
                            className={`px-3.5 py-2.5 rounded-lg bg-[#F6F1E6]/75 border border-[#D8CBB3]/85 ${
                              key === 'traits' ? 'sm:col-span-2' : ''
                            }`}
                          >
                            <div className="text-[11px] text-[#695A47]">
                              {labelMap[key] || key}
                            </div>
                            {matchedEnt && matchedEnt.id !== activeEntity.id ? (
                              <button
                                type="button"
                                onClick={() => jumpToEntity(matchedEnt.id)}
                                className="text-xs font-bold text-[#9E2A2B] hover:underline flex items-center gap-1 mt-0.5 cursor-pointer text-left"
                              >
                                <span>{String(val)}</span>
                                <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                              </button>
                            ) : (
                              <div className="text-xs font-semibold text-[#231C14] mt-0.5 leading-relaxed">
                                {Array.isArray(val)
                                  ? val.join(' · ')
                                  : String(val)}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>

                  {/* Character Known Skills & Owned Artifacts Interactive Cards */}
                  {category === 'character' &&
                    ((activeAttrs.knownSkills &&
                      activeAttrs.knownSkills.length > 0) ||
                      (activeAttrs.ownedArtifacts &&
                        activeAttrs.ownedArtifacts.length > 0)) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div className="p-3.5 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-2">
                          <div className="text-xs font-semibold text-[#9E2A2B] flex items-center gap-1.5">
                            <Swords className="w-3.5 h-3.5" />
                            <span>Keahlian & Skill Dikuasai</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {(activeAttrs.knownSkills || []).map((sk) => {
                              const matchedSkill = findMatchingEntityByName(
                                sk,
                                'skill'
                              );
                              return matchedSkill ? (
                                <button
                                  key={sk}
                                  type="button"
                                  onClick={() => jumpToEntity(matchedSkill.id)}
                                  className="px-2.5 py-1 rounded bg-[#EFE7D6] hover:bg-[#D8CBB3] border border-[#9E2A2B]/40 text-xs font-semibold text-[#9E2A2B] flex items-center gap-1 cursor-pointer"
                                >
                                  <span>{sk}</span>
                                  <ArrowUpRight className="w-3 h-3" />
                                </button>
                              ) : (
                                <span
                                  key={sk}
                                  className="px-2.5 py-1 rounded bg-[#EFE7D6] border border-[#D8CBB3] text-xs font-medium text-[#231C14]"
                                >
                                  {sk}
                                </span>
                              );
                            })}
                          </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-2">
                          <div className="text-xs font-semibold text-[#B5832A] flex items-center gap-1.5">
                            <Compass className="w-3.5 h-3.5" />
                            <span>Senjata, Pusaka & Artefak</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {(activeAttrs.ownedArtifacts || []).map((art) => {
                              const matchedArt = findMatchingEntityByName(
                                art,
                                'encyclopedia'
                              );
                              return matchedArt ? (
                                <button
                                  key={art}
                                  type="button"
                                  onClick={() => jumpToEntity(matchedArt.id)}
                                  className="px-2.5 py-1 rounded bg-[#EFE7D6] hover:bg-[#D8CBB3] border border-[#B5832A]/60 text-xs font-semibold text-[#231C14] flex items-center gap-1 cursor-pointer"
                                >
                                  <span>{art}</span>
                                  <ArrowUpRight className="w-3 h-3 text-[#9E2A2B]" />
                                </button>
                              ) : (
                                <span
                                  key={art}
                                  className="px-2.5 py-1 rounded bg-[#EFE7D6] border border-[#D8CBB3] text-xs font-medium text-[#231C14]"
                                >
                                  {art}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Race Sub-Races & Signature Skills Interactive Cards */}
                  {category === 'race' &&
                    ((activeAttrs.subRaces &&
                      activeAttrs.subRaces.length > 0) ||
                      (activeAttrs.signatureSkills &&
                        activeAttrs.signatureSkills.length > 0)) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div className="p-3.5 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-2">
                          <div className="text-xs font-semibold text-[#2D5A43] flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5" />
                            <span>Cabang Sub-Ras & Garis Keturunan</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {(activeAttrs.subRaces || []).map((sr) => (
                              <span
                                key={sr}
                                className="px-2.5 py-1 rounded bg-[#EFE7D6] border border-[#2D5A43]/35 text-xs font-semibold text-[#231C14]"
                              >
                                {sr}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-2">
                          <div className="text-xs font-semibold text-[#9E2A2B] flex items-center gap-1.5">
                            <Swords className="w-3.5 h-3.5" />
                            <span>Teknik & Skill Khas Ras</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {(activeAttrs.signatureSkills || []).map((sk) => {
                              const matchedSkill = findMatchingEntityByName(
                                sk,
                                'skill'
                              );
                              return matchedSkill ? (
                                <button
                                  key={sk}
                                  type="button"
                                  onClick={() => jumpToEntity(matchedSkill.id)}
                                  className="px-2.5 py-1 rounded bg-[#EFE7D6] hover:bg-[#D8CBB3] border border-[#9E2A2B]/40 text-xs font-semibold text-[#9E2A2B] flex items-center gap-1 cursor-pointer"
                                >
                                  <span>{sk}</span>
                                  <ArrowUpRight className="w-3 h-3" />
                                </button>
                              ) : (
                                <span
                                  key={sk}
                                  className="px-2.5 py-1 rounded bg-[#EFE7D6] border border-[#D8CBB3] text-xs font-medium text-[#231C14]"
                                >
                                  {sk}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Faction Rank Hierarchy & Strategic Artifacts Interactive Cards */}
                  {category === 'faction' &&
                    ((activeAttrs.rankHierarchy &&
                      activeAttrs.rankHierarchy.length > 0) ||
                      (activeAttrs.factionArtifacts &&
                        activeAttrs.factionArtifacts.length > 0)) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div className="p-3.5 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-2">
                          <div className="text-xs font-semibold text-[#8F5B14] flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5" />
                            <span>Tangga Hierarki Pangkat Organisasi</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {(activeAttrs.rankHierarchy || []).map((rk) => (
                              <span
                                key={rk}
                                className="px-2.5 py-1 rounded bg-[#EFE7D6] border border-[#8F5B14]/40 text-xs font-semibold text-[#231C14]"
                              >
                                {rk}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-2">
                          <div className="text-xs font-semibold text-[#9E2A2B] flex items-center gap-1.5">
                            <Compass className="w-3.5 h-3.5" />
                            <span>Pusaka & Aset Strategis Kelompok</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {(activeAttrs.factionArtifacts || []).map((art) => {
                              const matchedArt = findMatchingEntityByName(
                                art,
                                'encyclopedia'
                              );
                              return matchedArt ? (
                                <button
                                  key={art}
                                  type="button"
                                  onClick={() => jumpToEntity(matchedArt.id)}
                                  className="px-2.5 py-1 rounded bg-[#EFE7D6] hover:bg-[#D8CBB3] border border-[#9E2A2B]/40 text-xs font-semibold text-[#9E2A2B] flex items-center gap-1 cursor-pointer"
                                >
                                  <span>{art}</span>
                                  <ArrowUpRight className="w-3 h-3" />
                                </button>
                              ) : (
                                <span
                                  key={art}
                                  className="px-2.5 py-1 rounded bg-[#EFE7D6] border border-[#D8CBB3] text-xs font-medium text-[#231C14]"
                                >
                                  {art}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                </div>
              </div>

              {/* ============================================================= */}
              {/* CHARACTER PSYCHOLOGY (MOTIVATION VS FLAW) & 3-ACT ARC         */}
              {/* ============================================================= */}
              {category === 'character' &&
                (activeAttrs.motivationGoal ||
                  activeAttrs.fatalFlaw ||
                  activeAttrs.arcStart ||
                  activeAttrs.arcCrisis ||
                  activeAttrs.arcEndgame) && (
                  <div className="pt-4 border-t border-[#D8CBB3] space-y-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#9E2A2B]">
                      <Flame className="w-4 h-4" />
                      <span>
                        Anatomi Psikologi & Busur Perkembangan Karakter (Character Arc)
                      </span>
                    </div>

                    {(activeAttrs.motivationGoal || activeAttrs.fatalFlaw) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-1">
                          <div className="text-xs font-semibold text-[#2D5A43]">
                            Motivasi & Tujuan Utama (Goal / Desire)
                          </div>
                          <p className="text-xs text-[#231C14] leading-relaxed">
                            {activeAttrs.motivationGoal || 'Belum diisi.'}
                          </p>
                        </div>

                        <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-1">
                          <div className="text-xs font-semibold text-[#9E2A2B]">
                            Ketakutan & Kelemahan Fatal (Fatal Flaw)
                          </div>
                          <p className="text-xs text-[#231C14] leading-relaxed">
                            {activeAttrs.fatalFlaw || 'Belum diisi.'}
                          </p>
                        </div>
                      </div>
                    )}

                    {(activeAttrs.arcStart ||
                      activeAttrs.arcCrisis ||
                      activeAttrs.arcEndgame) && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="p-3.5 rounded-xl bg-[#EFE7D6]/70 border border-[#D8CBB3] space-y-1">
                          <div className="text-[11px] font-semibold text-[#695A47]">
                            I. Fase Awal (Babak I)
                          </div>
                          <p className="text-xs text-[#231C14] leading-relaxed">
                            {activeAttrs.arcStart || '—'}
                          </p>
                        </div>
                        <div className="p-3.5 rounded-xl bg-[#EFE7D6]/70 border border-[#D8CBB3] space-y-1">
                          <div className="text-[11px] font-semibold text-[#9E2A2B]">
                            II. Titik Balik & Krisis
                          </div>
                          <p className="text-xs text-[#231C14] leading-relaxed">
                            {activeAttrs.arcCrisis || '—'}
                          </p>
                        </div>
                        <div className="p-3.5 rounded-xl bg-[#EFE7D6]/70 border border-[#D8CBB3] space-y-1">
                          <div className="text-[11px] font-semibold text-[#264653]">
                            III. Transformasi Akhir
                          </div>
                          <p className="text-xs text-[#231C14] leading-relaxed">
                            {activeAttrs.arcEndgame || '—'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

              {/* ============================================================= */}
              {/* RACE BIOLOGY (INNATE ABILITIES VS WEAKNESS) & CULTURE/NAMING  */}
              {/* ============================================================= */}
              {category === 'race' &&
                (activeAttrs.innateAbilities ||
                  activeAttrs.racialWeakness ||
                  activeAttrs.languageAndNaming ||
                  activeAttrs.cultureAndTraditions ||
                  activeAttrs.interRaceRelations) && (
                  <div className="pt-4 border-t border-[#D8CBB3] space-y-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#2D5A43]">
                      <Globe className="w-4 h-4" />
                      <span>
                        Biologi Spesies, Bahasa & Antropologi Budaya Ras
                      </span>
                    </div>

                    {/* Innate Abilities vs Racial Weakness */}
                    {(activeAttrs.innateAbilities ||
                      activeAttrs.racialWeakness) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-1.5">
                          <div className="text-xs font-semibold text-[#2D5A43] flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>
                              Bakat Magis & Kemampuan Bawaan (Innate Abilities)
                            </span>
                          </div>
                          <p className="text-xs text-[#231C14] leading-relaxed">
                            {activeAttrs.innateAbilities || 'Belum diisi.'}
                          </p>
                        </div>

                        <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-1.5">
                          <div className="text-xs font-semibold text-[#9E2A2B] flex items-center gap-1.5">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>
                              Kelemahan Biologis & Pantangan Rasial (Weakness)
                            </span>
                          </div>
                          <p className="text-xs text-[#231C14] leading-relaxed">
                            {activeAttrs.racialWeakness || 'Belum diisi.'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Language & Naming Conventions */}
                    {activeAttrs.languageAndNaming && (
                      <div className="p-4 rounded-xl bg-[#EFE7D6]/75 border border-[#D8CBB3] space-y-1.5">
                        <div className="text-xs font-semibold text-[#B5832A] flex items-center gap-1.5">
                          <Languages className="w-3.5 h-3.5" />
                          <span>
                            Bahasa, Aksara & Pola Penamaan Tokoh (Naming Conventions)
                          </span>
                        </div>
                        <div className="text-xs text-[#231C14] leading-relaxed">
                          <WikiTextRenderer
                            text={activeAttrs.languageAndNaming}
                            entities={entities}
                            onSelectEntity={jumpToEntity}
                          />
                        </div>
                      </div>
                    )}

                    {/* Culture & Inter-Race Relations */}
                    {(activeAttrs.cultureAndTraditions ||
                      activeAttrs.interRaceRelations) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-1.5">
                          <div className="text-xs font-semibold text-[#231C14]">
                            Struktur Sosial, Kepercayaan & Tradisi Adat
                          </div>
                          <div className="text-xs text-[#695A47] leading-relaxed">
                            <WikiTextRenderer
                              text={
                                activeAttrs.cultureAndTraditions ||
                                'Belum diisi.'
                              }
                              entities={entities}
                              onSelectEntity={jumpToEntity}
                            />
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-1.5">
                          <div className="text-xs font-semibold text-[#264653]">
                            Hubungan Diplomatik dengan Bangsa / Ras Lain
                          </div>
                          <div className="text-xs text-[#695A47] leading-relaxed">
                            <WikiTextRenderer
                              text={
                                activeAttrs.interRaceRelations || 'Belum diisi.'
                              }
                              entities={entities}
                              onSelectEntity={jumpToEntity}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

              {/* ============================================================= */}
              {/* FACTION DOCTRINE VS SECRET AGENDA, OATH & DIPLOMACY           */}
              {/* ============================================================= */}
              {category === 'faction' &&
                (activeAttrs.ideology ||
                  activeAttrs.secretAgenda ||
                  activeAttrs.recruitmentOath ||
                  activeAttrs.resourcesAndAssets ||
                  activeAttrs.alliedFactions ||
                  activeAttrs.rivalFactions) && (
                  <div className="pt-4 border-t border-[#D8CBB3] space-y-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#8F5B14]">
                      <Swords className="w-4 h-4" />
                      <span>
                        Doktrin Organisasi, Agenda Rahasia, Aset & Peta Diplomasi
                      </span>
                    </div>

                    {/* Public Ideology vs Secret Agenda */}
                    {(activeAttrs.ideology || activeAttrs.secretAgenda) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-1.5">
                          <div className="text-xs font-semibold text-[#2D5A43] flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>
                              Doktrin & Ideologi Publik (Wajah Resmi)
                            </span>
                          </div>
                          <div className="text-xs text-[#231C14] leading-relaxed">
                            <WikiTextRenderer
                              text={activeAttrs.ideology || 'Belum diisi.'}
                              entities={entities}
                              onSelectEntity={jumpToEntity}
                            />
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-1.5">
                          <div className="text-xs font-semibold text-[#9E2A2B] flex items-center gap-1.5">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>
                              Agenda Rahasia & Konspirasi Internal
                            </span>
                          </div>
                          <div className="text-xs text-[#231C14] leading-relaxed">
                            <WikiTextRenderer
                              text={activeAttrs.secretAgenda || 'Belum diisi.'}
                              entities={entities}
                              onSelectEntity={jumpToEntity}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Recruitment Oath & Strategic Resources */}
                    {(activeAttrs.recruitmentOath ||
                      activeAttrs.resourcesAndAssets) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-[#EFE7D6]/75 border border-[#D8CBB3] space-y-1.5">
                          <div className="text-xs font-semibold text-[#8F5B14]">
                            Syarat Perekrutan & Sumpah Setia Anggota
                          </div>
                          <div className="text-xs text-[#231C14] leading-relaxed">
                            <WikiTextRenderer
                              text={
                                activeAttrs.recruitmentOath || 'Belum diisi.'
                              }
                              entities={entities}
                              onSelectEntity={jumpToEntity}
                            />
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-[#EFE7D6]/75 border border-[#D8CBB3] space-y-1.5">
                          <div className="text-xs font-semibold text-[#231C14]">
                            Sumber Pendanaan, Pasukan & Wilayah Pengaruh
                          </div>
                          <div className="text-xs text-[#231C14] leading-relaxed">
                            <WikiTextRenderer
                              text={
                                activeAttrs.resourcesAndAssets || 'Belum diisi.'
                              }
                              entities={entities}
                              onSelectEntity={jumpToEntity}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Allied Factions vs Rival Factions */}
                    {(activeAttrs.alliedFactions ||
                      activeAttrs.rivalFactions) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-1.5">
                          <div className="text-xs font-semibold text-[#2D5A43]">
                            Jaringan Sekutu & Patron Politik
                          </div>
                          <div className="text-xs text-[#695A47] leading-relaxed">
                            <WikiTextRenderer
                              text={
                                activeAttrs.alliedFactions || 'Belum diisi.'
                              }
                              entities={entities}
                              onSelectEntity={jumpToEntity}
                            />
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-1.5">
                          <div className="text-xs font-semibold text-[#9E2A2B]">
                            Rival Politik & Musuh Organisasi
                          </div>
                          <div className="text-xs text-[#695A47] leading-relaxed">
                            <WikiTextRenderer
                              text={activeAttrs.rivalFactions || 'Belum diisi.'}
                              entities={entities}
                              onSelectEntity={jumpToEntity}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

              {/* Full Lore Manuscript Prose with Interactive [[Cross-Links]] */}
              <div className="pt-4 border-t border-[#D8CBB3]">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#695A47] mb-3">
                  <BookOpen className="w-4 h-4 text-[#9E2A2B]" />
                  <span>Arsip Sejarah & Catatan Manuskrip Dunia</span>
                </div>
                <div className="p-5 rounded-xl bg-[#F6F1E6]/60 border border-[#D8CBB3]">
                  <WikiTextRenderer
                    text={activeEntity.content}
                    entities={entities}
                    onSelectEntity={jumpToEntity}
                  />
                </div>
              </div>

              {/* ============================================================= */}
              {/* AUTOMATIC ROSTER OF CHARACTERS BELONGING TO THIS RACE         */}
              {/* ============================================================= */}
              {category === 'race' && (
                <div className="pt-4 border-t border-[#D8CBB3] space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#231C14]">
                      <Users className="w-4 h-4 text-[#2D5A43]" />
                      <span>
                        Tokoh Tercatat dari Ras {activeEntity.title} (
                        {charactersOfActiveRace.length})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCreateCharacterFromRace(activeEntity)}
                      className="px-3.5 py-1.5 text-xs font-semibold bg-[#231C14] text-[#FBF8F1] rounded-lg hover:bg-[#3A2E21] flex items-center gap-1.5 cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-[#B5832A]" />
                      + Buat Karakter dari Ras Ini
                    </button>
                  </div>

                  {charactersOfActiveRace.length === 0 ? (
                    <div className="p-3.5 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] text-xs text-[#695A47]">
                      Belum ada tokoh di tab <strong>Character</strong> yang
                      tercatat berasal dari ras ini. Klik{' '}
                      <strong>+ Buat Karakter dari Ras Ini</strong> untuk
                      membuat tokoh baru secara instan.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {charactersOfActiveRace.map((char) => {
                        const cAttrs = getEnrichedAttributes(char);
                        return (
                          <button
                            key={char.id}
                            type="button"
                            onClick={() => jumpToEntity(char.id)}
                            className="text-left p-3.5 rounded-xl bg-[#F6F1E6] hover:bg-[#EFE7D6] border border-[#D8CBB3] transition-colors flex items-start gap-3 cursor-pointer"
                          >
                            {char.imageUrl ? (
                              <img
                                src={char.imageUrl}
                                alt={char.title}
                                referrerPolicy="no-referrer"
                                className="w-12 h-12 rounded-lg object-cover border border-[#D8CBB3] shrink-0"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-[#EFE7D6] border border-[#D8CBB3] flex items-center justify-center shrink-0">
                                <User className="w-5 h-5 text-[#9E2A2B]" />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="text-[11px] font-semibold text-[#9E2A2B] truncate">
                                {cAttrs.role || 'Tokoh'} ·{' '}
                                {cAttrs.status || 'Hidup'}
                              </div>
                              <div className="font-display text-base font-bold text-[#231C14] truncate flex items-center gap-1">
                                <span className="truncate">{char.title}</span>
                                <ArrowUpRight className="w-3.5 h-3.5 text-[#9E2A2B] shrink-0" />
                              </div>
                              <div className="text-[11px] text-[#695A47] truncate">
                                {cAttrs.powerTier || char.subtitle}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ============================================================= */}
              {/* AUTOMATIC ROSTER OF MEMBERS BELONGING TO THIS FACTION         */}
              {/* ============================================================= */}
              {category === 'faction' && (
                <div className="pt-4 border-t border-[#D8CBB3] space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#231C14]">
                      <Users className="w-4 h-4 text-[#8F5B14]" />
                      <span>
                        Daftar Anggota & Tokoh Terkait {activeEntity.title} (
                        {membersOfActiveFaction.length})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleCreateCharacterFromFaction(activeEntity)
                      }
                      className="px-3.5 py-1.5 text-xs font-semibold bg-[#231C14] text-[#FBF8F1] rounded-lg hover:bg-[#3A2E21] flex items-center gap-1.5 cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-[#B5832A]" />
                      + Rekrut / Buat Tokoh Anggota Baru
                    </button>
                  </div>

                  {membersOfActiveFaction.length === 0 ? (
                    <div className="p-3.5 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] text-xs text-[#695A47]">
                      Belum ada tokoh di tab <strong>Character</strong> yang
                      terdaftar sebagai anggota kelompok ini. Klik{' '}
                      <strong>+ Rekrut / Buat Tokoh Anggota Baru</strong> untuk
                      membuat tokoh anggota baru secara instan.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {membersOfActiveFaction.map((member) => {
                        const mAttrs = getEnrichedAttributes(member);
                        return (
                          <button
                            key={member.id}
                            type="button"
                            onClick={() => jumpToEntity(member.id)}
                            className="text-left p-3.5 rounded-xl bg-[#F6F1E6] hover:bg-[#EFE7D6] border border-[#D8CBB3] transition-colors flex items-start gap-3 cursor-pointer"
                          >
                            {member.imageUrl ? (
                              <img
                                src={member.imageUrl}
                                alt={member.title}
                                referrerPolicy="no-referrer"
                                className="w-12 h-12 rounded-lg object-cover border border-[#D8CBB3] shrink-0"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-[#EFE7D6] border border-[#D8CBB3] flex items-center justify-center shrink-0">
                                <User className="w-5 h-5 text-[#9E2A2B]" />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="text-[11px] font-semibold text-[#8F5B14] truncate">
                                {mAttrs.role || 'Anggota'} ·{' '}
                                {mAttrs.status || 'Hidup'}
                              </div>
                              <div className="font-display text-base font-bold text-[#231C14] truncate flex items-center gap-1">
                                <span className="truncate">{member.title}</span>
                                <ArrowUpRight className="w-3.5 h-3.5 text-[#9E2A2B] shrink-0" />
                              </div>
                              <div className="text-[11px] text-[#695A47] truncate">
                                {mAttrs.powerTier || member.subtitle}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ============================================================= */}
              {/* INLINE CHARACTER / ENTITY RELATIONSHIPS MATRIX                */}
              {/* ============================================================= */}
              {category === 'character' && (
                <div className="pt-4 border-t border-[#D8CBB3] space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#231C14]">
                      <GitBranch className="w-4 h-4 text-[#9E2A2B]" />
                      <span>
                        Jaringan Relasi & Dinamika Tokoh (
                        {entityRelationships.length})
                      </span>
                    </div>
                    {onUpdateRelationships && (
                      <button
                        type="button"
                        onClick={() => {
                          const other = entities.find(
                            (e) => e.id !== activeEntity.id
                          );
                          if (other && !relTargetId) setRelTargetId(other.id);
                          setShowAddRelation((prev) => !prev);
                        }}
                        className="px-3 py-1.5 text-xs font-semibold bg-[#231C14] text-[#FBF8F1] rounded-lg hover:bg-[#3A2E21] flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        {showAddRelation
                          ? 'Tutup Form Relasi'
                          : 'Tambah Relasi Tokoh'}
                      </button>
                    )}
                  </div>

                  {showAddRelation && onUpdateRelationships && (
                    <form
                      onSubmit={handleCreateInlineRelationship}
                      className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-3"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                            Tokoh / Entitas Tujuan
                          </label>
                          <select
                            value={relTargetId}
                            onChange={(e) => setRelTargetId(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                          >
                            {entities
                              .filter((e) => e.id !== activeEntity.id)
                              .map((e) => (
                                <option key={e.id} value={e.id}>
                                  [{CATEGORY_META[e.category].singular}]{' '}
                                  {e.title}
                                </option>
                              ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                            Jenis Hubungan
                          </label>
                          <select
                            value={relType}
                            onChange={(e) =>
                              setRelType(e.target.value as RelationType)
                            }
                            className="w-full px-2.5 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                          >
                            {Object.entries(RELATION_TYPE_LABELS).map(
                              ([k, v]) => (
                                <option key={k} value={k}>
                                  {v}
                                </option>
                              )
                            )}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                            Julukan Relasi (Contoh: Mantan Guru)
                          </label>
                          <input
                            type="text"
                            value={relLabel}
                            onChange={(e) => setRelLabel(e.target.value)}
                            placeholder="Mantan Guru & Rival..."
                            className="w-full px-2.5 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={relNotes}
                          onChange={(e) => setRelNotes(e.target.value)}
                          placeholder="Catatan singkat dinamika hubungan mereka..."
                          className="flex-1 px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                        />
                        <button
                          type="submit"
                          className="px-4 py-1.5 text-xs font-semibold bg-[#9E2A2B] text-white rounded-lg hover:bg-[#7E2021] cursor-pointer shrink-0"
                        >
                          Simpan Relasi
                        </button>
                      </div>
                    </form>
                  )}

                  {entityRelationships.length === 0 ? (
                    <div className="p-3.5 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] text-xs text-[#695A47]">
                      Belum ada ikatan relasi tercatat untuk tokoh ini. Klik{' '}
                      <strong>+ Tambah Relasi Tokoh</strong> di atas untuk
                      menghubungkannya dengan tokoh atau kelompok lain.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {entityRelationships.map((rel) => {
                        const partnerId =
                          rel.sourceId === activeEntity.id
                            ? rel.targetId
                            : rel.sourceId;
                        const partner = entities.find(
                          (e) => e.id === partnerId
                        );
                        if (!partner) return null;
                        return (
                          <div
                            key={rel.id}
                            className="p-3.5 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] flex items-start justify-between gap-3"
                          >
                            <div className="space-y-1 min-w-0">
                              <div className="text-[11px] font-semibold text-[#9E2A2B]">
                                {RELATION_TYPE_LABELS[rel.type]} · {rel.label}
                              </div>
                              <button
                                type="button"
                                onClick={() => jumpToEntity(partner.id)}
                                className="font-display text-base font-bold text-[#231C14] hover:text-[#9E2A2B] flex items-center gap-1 cursor-pointer text-left"
                              >
                                <span>{partner.title}</span>
                                <ArrowUpRight className="w-3.5 h-3.5 text-[#9E2A2B]" />
                              </button>
                              <p className="text-xs text-[#695A47] leading-relaxed">
                                {rel.notes}
                              </p>
                            </div>
                            {onUpdateRelationships && (
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateRelationships(
                                    relationships.filter((r) => r.id !== rel.id)
                                  )
                                }
                                className="text-[#695A47] hover:text-[#9E2A2B] p-1 cursor-pointer shrink-0"
                                title="Hapus relasi"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Bidirectional Backlinks & Map Connections */}
              <div className="pt-4 border-t border-[#D8CBB3] grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3.5 rounded-xl bg-[#EFE7D6]/60 border border-[#D8CBB3]">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#231C14] mb-2">
                    <Link2 className="w-3.5 h-3.5 text-[#9E2A2B]" />
                    <span>
                      Entitas Terkait ({backlinks.linkedEntities.length})
                    </span>
                  </div>
                  {backlinks.linkedEntities.length === 0 ? (
                    <p className="text-xs text-[#695A47]">
                      Belum ada entitas lain yang merujuk ke halaman ini.
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {backlinks.linkedEntities.map((le) => (
                        <button
                          key={le.id}
                          type="button"
                          onClick={() => jumpToEntity(le.id)}
                          className="w-full text-left px-2.5 py-1.5 rounded bg-[#FBF8F1] hover:bg-[#F6F1E6] border border-[#D8CBB3] text-xs font-medium text-[#231C14] flex items-center justify-between cursor-pointer"
                        >
                          <span className="truncate">{le.title}</span>
                          <span className="text-[10px] text-[#695A47] shrink-0 ml-2">
                            {CATEGORY_META[le.category].singular}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-[#EFE7D6]/60 border border-[#D8CBB3]">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#231C14] mb-2">
                    <MapPin className="w-3.5 h-3.5 text-[#9E2A2B]" />
                    <span>Pin di Peta Dunia ({linkedPins.length})</span>
                  </div>
                  {linkedPins.length === 0 ? (
                    <p className="text-xs text-[#695A47]">
                      Belum ada pin peta yang ditautkan ke entri ini.
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {linkedPins.map((pin) => (
                        <button
                          key={pin.id}
                          type="button"
                          onClick={() => onOpenMapAtStamp(pin.id)}
                          className="w-full text-left px-2.5 py-1.5 rounded bg-[#FBF8F1] hover:bg-[#F6F1E6] border border-[#D8CBB3] text-xs font-medium text-[#9E2A2B] flex items-center justify-between cursor-pointer"
                        >
                          <span className="truncate">{pin.label}</span>
                          <span className="font-mono-tabular text-[11px] text-[#695A47]">
                            {pin.x}°,{pin.y}° →
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-[#EFE7D6]/60 border border-[#D8CBB3]">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#231C14] mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#B5832A]" />
                    <span>
                      Kemunculan di Bab ({backlinks.linkedChapters.length})
                    </span>
                  </div>
                  {backlinks.linkedChapters.length === 0 ? (
                    <p className="text-xs text-[#695A47]">
                      Belum muncul di dalam draf bab cerita.
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {backlinks.linkedChapters.map((ch) => (
                        <button
                          key={ch.id}
                          type="button"
                          onClick={() => onOpenChapter(ch.id)}
                          className="w-full text-left px-2.5 py-1.5 rounded bg-[#FBF8F1] hover:bg-[#F6F1E6] border border-[#D8CBB3] text-xs font-medium text-[#231C14] flex items-center justify-between cursor-pointer"
                        >
                          <span className="truncate">
                            Bab {ch.chapterNumber}: {ch.title}
                          </span>
                          <span className="text-[10px] text-[#695A47] shrink-0 ml-1">
                            {ch.status}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
