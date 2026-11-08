import React, { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  BookOpen,
  Check,
  Clock,
  Compass,
  Crown,
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
  TimelineEvent,
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
  timeline?: TimelineEvent[];
  relationships?: RelationshipEdge[];
  selectedEntityId: string;
  onSelectEntity: (id: string) => void;
  onNavigateToEntity?: (id: string) => void;
  onSaveEntity: (entity: LoreEntity) => void;
  onDeleteEntity: (id: string) => void;
  onUpdateTimeline?: (next: TimelineEvent[]) => void;
  onOpenTimeline?: () => void;
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

const POWER_SYSTEM_TYPOLOGY_FILTERS = [
  'Semua',
  'Hard Magic / Terukur',
  'Kultivasi & Meridian',
  'Runik & Kriya Artefak',
  'Ilahi & Pakta Kosmik',
  'Bela Diri & Aura Fisik',
];

const SKILL_EXCLUSIVITY_OPTIONS = [
  'Warisan Rasial Eksklusif',
  'Bakat Garis Darah Kuno & Takhta Mahkota',
  'Teknik Agung Skala Strategis',
  'Mukjizat / Bencana Kosmik',
  'Teknik Khusus Terbatas',
];

const SKILL_IMPACT_SCALE_OPTIONS = [
  'Skala Individu / Duel Taktis',
  'Skala Pasukan / Benteng (Radius 300 Meter)',
  'Skala Kota / Lembah (Jangkauan 1-2 Kilometer)',
  'Skala Regional / Negara (Seluruh Lembah / Provinsi)',
  'Skala Kontinental / Bencana Dunia',
];

const NATION_GOVERNMENT_FILTERS = [
  'Semua',
  'Kekaisaran / Monarki',
  'Dewan Serikat / Republik',
  'Persemakmuran / Otonom',
  'Teokrasi / Magokrasi',
];

const REGION_TYPOLOGY_FILTERS = [
  'Semua',
  'Ibu Kota / Metropolis',
  'Benteng & Kota Perbatasan',
  'Alam Liar & Hutan Magis',
  'Zona Terkutuk / Reruntuhan',
];

const REGION_DANGER_PRESETS = [
  'Rendah (Zona Aman / Kota Dalam)',
  'Menengah (Patroli Rutin / Perbatasan)',
  'Tinggi (Kabut Ilusi / Predator Liar)',
  'Sangat Tinggi (Sarang Monster & Badai Eter)',
  'Ekstrem (Zona Terkutuk / Anomali Mematikan)',
];

const HISTORY_EVENT_TYPE_FILTERS = [
  'Semua',
  'Bencana Kosmik / Arcane',
  'Perang Besar & Pengepungan',
  'Berdirinya / Runtuhnya Dinasti',
  'Traktat, Pakta & Penemuan Agung',
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
  timeline = [],
  relationships = [],
  selectedEntityId,
  onSelectEntity,
  onNavigateToEntity,
  onSaveEntity,
  onDeleteEntity,
  onUpdateTimeline,
  onOpenTimeline,
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
  const [powerTypologyFilter, setPowerTypologyFilter] =
    useState<string>('Semua');
  const [nationGovFilter, setNationGovFilter] = useState<string>('Semua');
  const [regionTypeFilter, setRegionTypeFilter] = useState<string>('Semua');
  const [historyTypeFilter, setHistoryTypeFilter] = useState<string>('Semua');

  const [isEditing, setIsEditing] = useState(false);
  const [draftEntity, setDraftEntity] = useState<LoreEntity | null>(null);
  const [tagInput, setTagInput] = useState('');

  // Custom array item inputs in editor (Character, Race, Faction, Power System, Skill, Nation, Region & History)
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [customArtifactInput, setCustomArtifactInput] = useState('');
  const [customSubRaceInput, setCustomSubRaceInput] = useState('');
  const [customRaceSkillInput, setCustomRaceSkillInput] = useState('');
  const [customRankInput, setCustomRankInput] = useState('');
  const [customFactionArtifactInput, setCustomFactionArtifactInput] =
    useState('');
  const [customPowerTierInput, setCustomPowerTierInput] = useState('');
  const [customElementBranchInput, setCustomElementBranchInput] = useState('');
  const [customExclusiveRaceInput, setCustomExclusiveRaceInput] = useState('');
  const [customDominantRaceInput, setCustomDominantRaceInput] = useState('');
  const [customLandmarkInput, setCustomLandmarkInput] = useState('');
  const [customEndemicInput, setCustomEndemicInput] = useState('');
  const [customBelligerentInput, setCustomBelligerentInput] = useState('');
  const [customKeyFigureInput, setCustomKeyFigureInput] = useState('');
  const [timelineSyncMessage, setTimelineSyncMessage] = useState('');

  // Quick-link state on Skill view mode
  const [selectedQuickRaceId, setSelectedQuickRaceId] = useState('');
  const [selectedQuickCharId, setSelectedQuickCharId] = useState('');

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
    setPowerTypologyFilter('Semua');
    setNationGovFilter('Semua');
    setRegionTypeFilter('Semua');
    setHistoryTypeFilter('Semua');
    setTimelineSyncMessage('');
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

    if (category === 'power_system') {
      if (
        powerTypologyFilter !== 'Semua' &&
        !(attrs.systemTypology || '')
          .toLowerCase()
          .includes(
            powerTypologyFilter
              .split('/')[0]
              .split('&')[0]
              .trim()
              .toLowerCase()
          )
      ) {
        return false;
      }
    }

    if (category === 'nation') {
      if (nationGovFilter !== 'Semua') {
        const govStr = `${attrs.governmentType || ''} ${
          attrs.government || ''
        }`.toLowerCase();
        const filterKeywords = nationGovFilter
          .split('/')
          .map((s) => s.trim().toLowerCase());
        if (!filterKeywords.some((kw) => govStr.includes(kw))) {
          return false;
        }
      }
    }

    if (category === 'region') {
      if (regionTypeFilter !== 'Semua') {
        const regStr = `${attrs.regionType || ''} ${e.subtitle || ''} ${e.tags.join(
          ' '
        )}`.toLowerCase();
        const filterKeywords = regionTypeFilter
          .split('/')
          .flatMap((s) => s.split('&'))
          .map((s) => s.trim().toLowerCase());
        if (!filterKeywords.some((kw) => regStr.includes(kw))) {
          return false;
        }
      }
    }

    if (category === 'history') {
      if (historyTypeFilter !== 'Semua') {
        const histStr = `${attrs.historyEventType || ''} ${e.subtitle || ''} ${e.tags.join(
          ' '
        )}`.toLowerCase();
        const filterKeywords = historyTypeFilter
          .split('/')
          .flatMap((s) => s.split('&'))
          .flatMap((s) => s.split(','))
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean);
        if (!filterKeywords.some((kw) => histStr.includes(kw))) {
          return false;
        }
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
      (attrs.leader || '').toLowerCase().includes(q) ||
      (attrs.systemTypology || '').toLowerCase().includes(q) ||
      (attrs.energySource || '').toLowerCase().includes(q) ||
      (attrs.parentPowerSystem || '').toLowerCase().includes(q) ||
      (attrs.skillExclusivity || '').toLowerCase().includes(q) ||
      (attrs.impactScale || '').toLowerCase().includes(q) ||
      (attrs.exclusiveRaces || []).some((r) => r.toLowerCase().includes(q)) ||
      (attrs.governmentType || '').toLowerCase().includes(q) ||
      (attrs.government || '').toLowerCase().includes(q) ||
      (attrs.capitalCity || '').toLowerCase().includes(q) ||
      (attrs.ruler || '').toLowerCase().includes(q) ||
      (attrs.dominantRaces || []).some((r) => r.toLowerCase().includes(q)) ||
      (attrs.regionType || '').toLowerCase().includes(q) ||
      (attrs.parentNation || '').toLowerCase().includes(q) ||
      (attrs.climate || '').toLowerCase().includes(q) ||
      (attrs.dangerLevel || '').toLowerCase().includes(q) ||
      (attrs.landmarksList || []).some((l) => l.toLowerCase().includes(q)) ||
      (attrs.endemicFloraFauna || []).some((f) =>
        f.toLowerCase().includes(q)
      ) ||
      (attrs.historyEventType || '').toLowerCase().includes(q) ||
      (attrs.displayDate || '').toLowerCase().includes(q) ||
      (attrs.era || '').toLowerCase().includes(q) ||
      (attrs.eventLocation || '').toLowerCase().includes(q) ||
      (attrs.belligerents || '').toLowerCase().includes(q) ||
      (attrs.belligerentsList || []).some((b) => b.toLowerCase().includes(q)) ||
      (attrs.keyHistoricalFigures || []).some((kf) =>
        kf.toLowerCase().includes(q)
      )
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

  // Lists of existing entities by category for hybrid pickers
  const characterEntities = entities.filter((e) => e.category === 'character');
  const raceEntities = entities.filter((e) => e.category === 'race');
  const factionEntities = entities.filter((e) => e.category === 'faction');
  const nationEntities = entities.filter((e) => e.category === 'nation');
  const regionEntities = entities.filter((e) => e.category === 'region');
  const nationAndRegionEntities = entities.filter(
    (e) => e.category === 'nation' || e.category === 'region'
  );
  const historyEntities = entities.filter((e) => e.category === 'history');
  const powerSystemEntities = entities.filter(
    (e) => e.category === 'power_system'
  );
  const skillEntities = entities.filter((e) => e.category === 'skill');
  const artifactEntities = entities.filter(
    (e) => e.category === 'encyclopedia'
  );

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
        powerTiersList: [...(enriched.powerTiersList || [])],
        elementBranches: [...(enriched.elementBranches || [])],
        exclusiveRaces: [...(enriched.exclusiveRaces || [])],
        dominantRaces: [...(enriched.dominantRaces || [])],
        landmarksList: [...(enriched.landmarksList || [])],
        endemicFloraFauna: [...(enriched.endemicFloraFauna || [])],
        belligerentsList: [...(enriched.belligerentsList || [])],
        keyHistoricalFigures: [...(enriched.keyHistoricalFigures || [])],
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
    setCustomPowerTierInput('');
    setCustomElementBranchInput('');
    setCustomExclusiveRaceInput('');
    setCustomDominantRaceInput('');
    setCustomLandmarkInput('');
    setCustomEndemicInput('');
    setCustomBelligerentInput('');
    setCustomKeyFigureInput('');
    setIsEditing(true);
  };

  const startCreatingNew = () => {
    const defaultPs = powerSystemEntities[0];
    const defaultPsAttrs = defaultPs ? getEnrichedAttributes(defaultPs) : {};
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
          : category === 'power_system'
          ? 'Arsitektur Sihir, Kultivasi, atau Hukum Kekuatan'
          : category === 'skill'
          ? 'Warisan Rasial Eksklusif / Teknik Skala Besar'
          : category === 'nation'
          ? 'Kedaulatan Kerajaan, Republik, atau Persemakmuran'
          : category === 'region'
          ? 'Kawasan Geografis, Provinsi, atau Benteng'
          : category === 'history'
          ? 'Peristiwa Bersejarah, Perang Besar, atau Bencana Kosmik'
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
          : category === 'power_system'
          ? {
              systemTypology: 'Hard Magic / Terukur',
              energySource: 'Eter Kosmik & Meridian Jiwa',
              powerTiersList: [
                'Tingkat 1: Inisiat (Dasar)',
                'Tingkat 2: Adept (Menengah)',
                'Tingkat 3: Magister (Tinggi)',
                'Tingkat 4: Sovereign (Puncak)',
              ],
              elementBranches: ['Cabang Cahaya', 'Cabang Bayangan'],
            }
          : category === 'skill'
          ? {
              parentPowerSystem: defaultPs
                ? defaultPs.title
                : 'Resonansi Eteris Astral',
              skillRank:
                defaultPsAttrs.powerTiersList &&
                defaultPsAttrs.powerTiersList.length > 0
                  ? defaultPsAttrs.powerTiersList[0]
                  : 'Tingkat Tinggi',
              elementAffinity:
                defaultPsAttrs.elementBranches &&
                defaultPsAttrs.elementBranches.length > 0
                  ? defaultPsAttrs.elementBranches[0]
                  : 'Elemen Utama',
              skillExclusivity: 'Warisan Rasial Eksklusif',
              exclusiveRaces: [],
              impactScale: 'Skala Pasukan / Benteng (Radius 300 Meter)',
            }
          : category === 'nation'
          ? {
              governmentType: 'Kekaisaran / Monarki',
              government: 'Monarki Kerajaan',
              dominantRaces: [],
            }
          : category === 'region'
          ? {
              regionType: 'Benteng & Kota Perbatasan',
              parentNation: nationEntities[0]?.title || '',
              dangerLevel: 'Menengah (Patroli Rutin / Perbatasan)',
              landmarksList: [],
              endemicFloraFauna: [],
            }
          : category === 'history'
          ? {
              historyEventType: 'Perang Besar & Pengepungan',
              era: 'Era Abu (Post-Gerhana)',
              year: 200,
              displayDate: 'Tahun 200 PG',
              eventLocation: regionEntities[0]?.title || '',
              belligerentsList: [],
              keyHistoricalFigures: [],
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
    setCustomPowerTierInput('');
    setCustomElementBranchInput('');
    setCustomExclusiveRaceInput('');
    setCustomDominantRaceInput('');
    setCustomLandmarkInput('');
    setCustomEndemicInput('');
    setCustomBelligerentInput('');
    setCustomKeyFigureInput('');
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
      | 'factionArtifacts'
      | 'powerTiersList'
      | 'elementBranches'
      | 'exclusiveRaces'
      | 'dominantRaces',
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

  // 1-Click Create Skill from active Power System
  const handleCreateSkillFromPowerSystem = (psEntity: LoreEntity) => {
    const psAttrs = getEnrichedAttributes(psEntity);
    const firstBranch =
      psAttrs.elementBranches && psAttrs.elementBranches.length > 0
        ? psAttrs.elementBranches[0]
        : psAttrs.energySource || 'Elemen Utama';
    const firstTier =
      psAttrs.powerTiersList && psAttrs.powerTiersList.length > 0
        ? psAttrs.powerTiersList[0]
        : 'Tingkat Menengah';
    const newSkill: LoreEntity = {
      id: `ent-${Date.now()}`,
      category: 'skill',
      title: `Teknik ${psEntity.title} Baru`,
      subtitle: `Jurus Turunan ${firstBranch.split('(')[0].trim()}`,
      summary: `Teknik khusus atau jurus berskala besar yang bersumber dari sistem [[${psEntity.title}]].`,
      content: `### Mekanisme & Cara Kerja Teknik\nMerupakan salah satu jurus turunan dari [[${psEntity.title}]] yang mematuhi hukum dasar sistem tersebut.\n\nTambahkan detail visual, syarat penggunaan, dan ras/tokoh penggunanya di sini.`,
      tags: ['Skill', psEntity.title],
      attributes: {
        parentPowerSystem: psEntity.title,
        skillRank: firstTier,
        elementAffinity: firstBranch,
        skillExclusivity: 'Teknik Agung Skala Strategis',
        exclusiveRaces: [],
        impactScale: 'Skala Pasukan / Benteng (Radius 300 Meter)',
        activationCost: `Membutuhkan penyaluran energi ${
          psAttrs.catalystMedium || psEntity.title
        }`,
        cooldownOrLimit:
          psAttrs.corruptionCost ||
          'Batas penggunaan sesuai kapasitas tubuh praktisi.',
      },
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    onSaveEntity(newSkill);
    jumpToEntity(newSkill.id);
  };

  // 1-Click Create Region from active Nation
  const handleCreateRegionFromNation = (nationEntity: LoreEntity) => {
    const newRegion: LoreEntity = {
      id: `ent-${Date.now()}`,
      category: 'region',
      title: `Provinsi ${nationEntity.title} Baru`,
      subtitle: `Wilayah Kedaulatan ${nationEntity.title}`,
      summary: `Wilayah strategis yang berada di bawah kedaulatan [[${nationEntity.title}]].`,
      content: `### Geografi & Peran Strategis\nMerupakan salah satu provinsi atau kawasan penting di dalam wilayah [[${nationEntity.title}]].\n\nTambahkan kondisi geografis, benteng, atau sumber daya wilayah ini di sini.`,
      tags: ['Wilayah', nationEntity.title],
      attributes: {
        regionType: 'Benteng & Kota Perbatasan',
        parentNation: nationEntity.title,
        climate: 'Sedang, dipengaruhi angin pesisir dan musim setempat',
        landmarks: 'Benteng Perbatasan & Pos Dagang Utama',
        landmarksList: ['Benteng Perbatasan Utama', 'Pasar Karavan Provinsi'],
        resources: 'Hasil Bumi, Bijih Logam & Jalur Karavan',
        endemicFloraFauna: [],
        dangerLevel: 'Menengah (Patroli Rutin / Perbatasan)',
      },
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    onSaveEntity(newRegion);
    jumpToEntity(newRegion.id);
  };

  // 1-Click Create Character from active Region
  const handleCreateCharacterFromRegion = (regionEntity: LoreEntity) => {
    const regAttrs = getEnrichedAttributes(regionEntity);
    const newChar: LoreEntity = {
      id: `ent-${Date.now()}`,
      category: 'character',
      title: `Tokoh ${regionEntity.title} Baru`,
      subtitle: `Penjaga / Penduduk dari ${regionEntity.title}`,
      summary: `Tokoh yang berasal dari atau beroperasi di wilayah [[${regionEntity.title}]]${
        regAttrs.parentNation ? ` ([[${regAttrs.parentNation}]])` : ''
      }.`,
      content: `### Latar Belakang di ${regionEntity.title}\nMerupakan tokoh lokal yang mengenal seluk-beluk medan [[${regionEntity.title}]].\n\nTambahkan peran dan tujuannya di wilayah ini.`,
      tags: ['Character', regionEntity.title],
      attributes: {
        role: 'Pendukung',
        status: 'Hidup',
        originNation: regionEntity.title,
        knownSkills: [],
        ownedArtifacts: [],
      },
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    onSaveEntity(newChar);
    jumpToEntity(newChar.id);
  };

  // 1-Click Link active Skill to a Race
  const handleLinkSkillToRace = (skillEntity: LoreEntity, raceId: string) => {
    const targetRace = entities.find((e) => e.id === raceId);
    if (!targetRace) return;
    const rAttrs = getEnrichedAttributes(targetRace);
    const nextRaceSkills = Array.from(
      new Set([...(rAttrs.signatureSkills || []), skillEntity.title])
    );
    onSaveEntity({
      ...targetRace,
      attributes: {
        ...rAttrs,
        signatureSkills: nextRaceSkills,
      },
      updatedAt: new Date().toISOString().slice(0, 10),
    });

    const sAttrs = getEnrichedAttributes(skillEntity);
    const nextExclusiveRaces = Array.from(
      new Set([...(sAttrs.exclusiveRaces || []), targetRace.title])
    );
    onSaveEntity({
      ...skillEntity,
      attributes: {
        ...sAttrs,
        exclusiveRaces: nextExclusiveRaces,
      },
      updatedAt: new Date().toISOString().slice(0, 10),
    });
    setSelectedQuickRaceId('');
  };

  // 1-Click Link active Skill to a Character
  const handleLinkSkillToCharacter = (
    skillEntity: LoreEntity,
    charId: string
  ) => {
    const targetChar = entities.find((e) => e.id === charId);
    if (!targetChar) return;
    const cAttrs = getEnrichedAttributes(targetChar);
    const nextCharSkills = Array.from(
      new Set([...(cAttrs.knownSkills || []), skillEntity.title])
    );
    onSaveEntity({
      ...targetChar,
      attributes: {
        ...cAttrs,
        knownSkills: nextCharSkills,
      },
      updatedAt: new Date().toISOString().slice(0, 10),
    });
    setSelectedQuickCharId('');
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

  // Automatic Roster of Skills belonging to the active Power System
  const skillsOfActivePowerSystem =
    category === 'power_system' && activeEntity
      ? entities.filter((e) => {
          if (e.category !== 'skill') return false;
          const sAttrs = getEnrichedAttributes(e);
          const parentSys = (sAttrs.parentPowerSystem || '').toLowerCase();
          const psTitle = activeEntity.title.toLowerCase();
          return (
            parentSys.includes(psTitle) ||
            psTitle.includes(
              parentSys && parentSys.length > 3 ? parentSys : '___'
            ) ||
            e.content.toLowerCase().includes(`[[${psTitle}]]`)
          );
        })
      : [];

  // Automatic Roster of Practitioners (Characters) of the active Power System
  const practitionersOfActivePowerSystem =
    category === 'power_system' && activeEntity
      ? entities.filter((e) => {
          if (e.category !== 'character') return false;
          const cAttrs = getEnrichedAttributes(e);
          const psTitle = activeEntity.title.toLowerCase();
          const derivedSkillNames = skillsOfActivePowerSystem.map((s) =>
            s.title.toLowerCase()
          );
          const charSkills = (cAttrs.knownSkills || []).map((k) =>
            k.toLowerCase()
          );
          return (
            e.content.toLowerCase().includes(`[[${psTitle}]]`) ||
            charSkills.some((cs) =>
              derivedSkillNames.some(
                (ds) => cs.includes(ds) || ds.includes(cs)
              )
            )
          );
        })
      : [];

  // Automatic Roster of Races possessing the active Skill
  const racesOfActiveSkill =
    category === 'skill' && activeEntity
      ? entities.filter((e) => {
          if (e.category !== 'race') return false;
          const rAttrs = getEnrichedAttributes(e);
          const skTitle = activeEntity.title.toLowerCase();
          const exclRaces = (activeAttrs.exclusiveRaces || []).map((x) =>
            x.toLowerCase()
          );
          const rTitle = e.title.toLowerCase();
          const rSigs = (rAttrs.signatureSkills || []).map((s) =>
            s.toLowerCase()
          );
          return (
            exclRaces.some(
              (er) => er.includes(rTitle) || rTitle.includes(er)
            ) ||
            rSigs.some(
              (rs) => rs.includes(skTitle) || skTitle.includes(rs)
            ) ||
            activeEntity.content.toLowerCase().includes(`[[${rTitle}]]`) ||
            e.content.toLowerCase().includes(`[[${skTitle}]]`)
          );
        })
      : [];

  // Automatic Roster of Characters mastering the active Skill
  const practitionersOfActiveSkill =
    category === 'skill' && activeEntity
      ? entities.filter((e) => {
          if (e.category !== 'character') return false;
          const cAttrs = getEnrichedAttributes(e);
          const skTitle = activeEntity.title.toLowerCase();
          const charSkills = (cAttrs.knownSkills || []).map((k) =>
            k.toLowerCase()
          );
          return (
            charSkills.some(
              (cs) => cs.includes(skTitle) || skTitle.includes(cs)
            ) ||
            activeEntity.content
              .toLowerCase()
              .includes(`[[${e.title.toLowerCase()}]]`) ||
            e.content.toLowerCase().includes(`[[${skTitle}]]`)
          );
        })
      : [];

  // Automatic Roster of Regions under the active Nation
  const regionsOfActiveNation =
    category === 'nation' && activeEntity
      ? entities.filter((e) => {
          if (e.category !== 'region') return false;
          const regAttrs = getEnrichedAttributes(e);
          const nTitle = activeEntity.title.toLowerCase();
          const pNation = (regAttrs.parentNation || '').toLowerCase();
          const capCity = (activeAttrs.capitalCity || '').toLowerCase();
          const regTitle = e.title.toLowerCase();
          return (
            pNation.includes(nTitle) ||
            nTitle.includes(pNation && pNation.length > 3 ? pNation : '___') ||
            (capCity &&
              (regTitle.includes(capCity) || capCity.includes(regTitle))) ||
            e.content.toLowerCase().includes(`[[${nTitle}]]`)
          );
        })
      : [];

  // Automatic Roster of Factions operating in the active Nation
  const factionsOfActiveNation =
    category === 'nation' && activeEntity
      ? entities.filter((e) => {
          if (e.category !== 'faction') return false;
          const fAttrs = getEnrichedAttributes(e);
          const nTitle = activeEntity.title.toLowerCase();
          const hq = (fAttrs.headquarters || '').toLowerCase();
          const capCity = (activeAttrs.capitalCity || '').toLowerCase();
          return (
            hq.includes(nTitle) ||
            (capCity && hq.includes(capCity)) ||
            e.content.toLowerCase().includes(`[[${nTitle}]]`) ||
            activeEntity.content
              .toLowerCase()
              .includes(`[[${e.title.toLowerCase()}]]`)
          );
        })
      : [];

  // Automatic Roster of Citizens / Leaders of the active Nation
  const citizensOfActiveNation =
    category === 'nation' && activeEntity
      ? entities.filter((e) => {
          if (e.category !== 'character') return false;
          const cAttrs = getEnrichedAttributes(e);
          const nTitle = activeEntity.title.toLowerCase();
          const orig = (cAttrs.originNation || '').toLowerCase();
          const rulerName = (activeAttrs.ruler || '').toLowerCase();
          const capCity = (activeAttrs.capitalCity || '').toLowerCase();
          return (
            orig.includes(nTitle) ||
            (capCity && orig.includes(capCity)) ||
            (rulerName && e.title.toLowerCase() === rulerName) ||
            e.content.toLowerCase().includes(`[[${nTitle}]]`) ||
            activeEntity.content
              .toLowerCase()
              .includes(`[[${e.title.toLowerCase()}]]`)
          );
        })
      : [];

  // Automatic Roster of Map Stamps linked to the active Region
  const mapStampsOfActiveRegion =
    category === 'region' && activeEntity
      ? mapStamps.filter((s) => {
          const rTitle = activeEntity.title.toLowerCase();
          const linkedLabel = (
            activeAttrs.linkedMapStampLabel || ''
          ).toLowerCase();
          const sLabel = s.label.toLowerCase();
          return (
            s.linkedEntityId === activeEntity.id ||
            (linkedLabel && sLabel === linkedLabel) ||
            sLabel.includes(rTitle) ||
            rTitle.includes(sLabel.split('(')[0].trim())
          );
        })
      : [];

  // Automatic Roster of Factions headquartered or operating in the active Region
  const factionsOfActiveRegion =
    category === 'region' && activeEntity
      ? entities.filter((e) => {
          if (e.category !== 'faction') return false;
          const fAttrs = getEnrichedAttributes(e);
          const rTitle = activeEntity.title.toLowerCase();
          const hq = (fAttrs.headquarters || '').toLowerCase();
          return (
            hq.includes(rTitle) ||
            rTitle.includes(hq && hq.length > 3 ? hq : '___') ||
            e.content.toLowerCase().includes(`[[${rTitle}]]`) ||
            activeEntity.content
              .toLowerCase()
              .includes(`[[${e.title.toLowerCase()}]]`)
          );
        })
      : [];

  // Automatic Roster of Characters originating from or active in the active Region
  const charactersOfActiveRegion =
    category === 'region' && activeEntity
      ? entities.filter((e) => {
          if (e.category !== 'character') return false;
          const cAttrs = getEnrichedAttributes(e);
          const rTitle = activeEntity.title.toLowerCase();
          const orig = (cAttrs.originNation || '').toLowerCase();
          return (
            orig.includes(rTitle) ||
            rTitle.includes(orig && orig.length > 3 ? orig : '___') ||
            e.content.toLowerCase().includes(`[[${rTitle}]]`) ||
            activeEntity.content
              .toLowerCase()
              .includes(`[[${e.title.toLowerCase()}]]`)
          );
        })
      : [];

  // Automatic Roster of TimelineEvents linked to the active History entity
  const timelineEventsOfActiveHistory =
    category === 'history' && activeEntity
      ? timeline.filter((t) => {
          const hTitle = activeEntity.title.toLowerCase();
          const tTitle = t.title.toLowerCase();
          return (
            t.linkedEntityIds.includes(activeEntity.id) ||
            tTitle === hTitle ||
            tTitle.includes(hTitle) ||
            hTitle.includes(tTitle)
          );
        })
      : [];

  // 1-Click Sync or Create TimelineEvent in Kronologi tab from active History entity
  const handleSyncHistoryToTimeline = (historyEntity: LoreEntity) => {
    if (!onUpdateTimeline) return;
    const hAttrs = getEnrichedAttributes(historyEntity);
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

    // Collect linked entity IDs from belligerents, key figures, location & self
    const relatedIds = new Set<string>([historyEntity.id]);
    [
      ...(hAttrs.belligerentsList || []),
      ...(hAttrs.keyHistoricalFigures || []),
      hAttrs.eventLocation || '',
    ].forEach((name) => {
      const m = findMatchingEntityByName(name);
      if (m) relatedIds.add(m.id);
    });

    const existingEvent = timeline.find(
      (t) =>
        t.linkedEntityIds.includes(historyEntity.id) ||
        t.title.toLowerCase() === historyEntity.title.toLowerCase()
    );

    const yearVal =
      typeof hAttrs.year === 'number' && !Number.isNaN(hAttrs.year)
        ? hAttrs.year
        : existingEvent?.year ?? 0;

    const syncedEvent: TimelineEvent = {
      id: existingEvent ? existingEvent.id : `tl-${Date.now()}`,
      era: hAttrs.era || existingEvent?.era || 'Era Abu (Post-Gerhana)',
      year: yearVal,
      displayDate:
        hAttrs.displayDate ||
        existingEvent?.displayDate ||
        `Tahun ${yearVal} PG`,
      title: historyEntity.title,
      summary:
        hAttrs.outcome ||
        historyEntity.summary ||
        'Peristiwa bersejarah tercatat dari arsip Sejarah Dunia.',
      category: mappedCategory,
      linkedEntityIds: Array.from(
        new Set([...(existingEvent?.linkedEntityIds || []), ...relatedIds])
      ),
    };

    const nextTimeline = existingEvent
      ? timeline
          .map((t) => (t.id === existingEvent.id ? syncedEvent : t))
          .sort((a, b) => a.year - b.year)
      : [...timeline, syncedEvent].sort((a, b) => a.year - b.year);

    onUpdateTimeline(nextTimeline);
    setTimelineSyncMessage(
      existingEvent
        ? 'Berhasil memperbarui catatan peristiwa di Pita Kronologi Dunia!'
        : 'Berhasil menambahkan peristiwa ini ke Pita Kronologi Dunia!'
    );
  };

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

          {/* Power System-Specific Typology Filters */}
          {category === 'power_system' && (
            <div className="space-y-1.5 pt-1">
              <div className="text-[11px] font-semibold text-[#695A47]">
                Filter Tipologi Sistem Kekuatan:
              </div>
              <div className="flex flex-wrap items-center gap-1">
                {POWER_SYSTEM_TYPOLOGY_FILTERS.map((pt) => (
                  <button
                    key={pt}
                    type="button"
                    onClick={() => setPowerTypologyFilter(pt)}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                      powerTypologyFilter === pt
                        ? 'bg-[#5A3E7A] text-white'
                        : 'bg-[#F6F1E6] text-[#695A47] hover:text-[#231C14] border border-[#D8CBB3]'
                    }`}
                  >
                    {pt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Nation-Specific Government Type Filters */}
          {category === 'nation' && (
            <div className="space-y-1.5 pt-1">
              <div className="text-[11px] font-semibold text-[#695A47]">
                Filter Bentuk Pemerintahan:
              </div>
              <div className="flex flex-wrap items-center gap-1">
                {NATION_GOVERNMENT_FILTERS.map((gf) => (
                  <button
                    key={gf}
                    type="button"
                    onClick={() => setNationGovFilter(gf)}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                      nationGovFilter === gf
                        ? 'bg-[#9E2A2B] text-white'
                        : 'bg-[#F6F1E6] text-[#695A47] hover:text-[#231C14] border border-[#D8CBB3]'
                    }`}
                  >
                    {gf}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Region-Specific Typology Filters */}
          {category === 'region' && (
            <div className="space-y-1.5 pt-1">
              <div className="text-[11px] font-semibold text-[#695A47]">
                Filter Tipologi Wilayah:
              </div>
              <div className="flex flex-wrap items-center gap-1">
                {REGION_TYPOLOGY_FILTERS.map((rt) => (
                  <button
                    key={rt}
                    type="button"
                    onClick={() => setRegionTypeFilter(rt)}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                      regionTypeFilter === rt
                        ? 'bg-[#264653] text-white'
                        : 'bg-[#F6F1E6] text-[#695A47] hover:text-[#231C14] border border-[#D8CBB3]'
                    }`}
                  >
                    {rt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* History-Specific Event Scale / Type Filters */}
          {category === 'history' && (
            <div className="space-y-1.5 pt-1">
              <div className="text-[11px] font-semibold text-[#695A47]">
                Filter Jenis & Skala Peristiwa Sejarah:
              </div>
              <div className="flex flex-wrap items-center gap-1">
                {HISTORY_EVENT_TYPE_FILTERS.map((ht) => (
                  <button
                    key={ht}
                    type="button"
                    onClick={() => setHistoryTypeFilter(ht)}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                      historyTypeFilter === ht
                        ? 'bg-[#7A3E1D] text-white'
                        : 'bg-[#F6F1E6] text-[#695A47] hover:text-[#231C14] border border-[#D8CBB3]'
                    }`}
                  >
                    {ht}
                  </button>
                ))}
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
                              : category === 'power_system'
                              ? `${
                                  itemAttrs.systemTypology || 'Sistem Sihir'
                                } · ${
                                  itemAttrs.elementBranches
                                    ? `${itemAttrs.elementBranches.length} Aliran`
                                    : 'Arsitektur Kekuatan'
                                }`
                              : category === 'skill'
                              ? `${
                                  itemAttrs.parentPowerSystem || 'Sistem Sihir'
                                } · ${
                                  itemAttrs.skillExclusivity ||
                                  itemAttrs.skillRank ||
                                  'Teknik Khusus'
                                }`
                              : category === 'nation'
                              ? `${
                                  itemAttrs.governmentType ||
                                  itemAttrs.government ||
                                  'Kedaulatan'
                                } · ${itemAttrs.capitalCity || 'Ibu Kota'}`
                              : category === 'region'
                              ? `${
                                  itemAttrs.regionType || 'Zona Geografis'
                                } · ${
                                  itemAttrs.parentNation || 'Wilayah Otonom'
                                }`
                              : category === 'history'
                              ? `${
                                  itemAttrs.historyEventType ||
                                  'Peristiwa Sejarah'
                                } · ${
                                  itemAttrs.displayDate ||
                                  itemAttrs.era ||
                                  'Era Kanon'
                                }`
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

                        {category === 'power_system' && (
                          <div className="text-[11px] text-[#695A47] truncate mt-0.5">
                            Energi: {itemAttrs.energySource || 'Belum ditentukan'}
                          </div>
                        )}

                        {category === 'skill' && (
                          <div className="text-[11px] text-[#695A47] truncate mt-0.5">
                            {itemAttrs.impactScale ||
                              itemAttrs.skillRank ||
                              'Skala Khusus'}
                            {itemAttrs.exclusiveRaces &&
                            itemAttrs.exclusiveRaces.length > 0
                              ? ` · Ras: ${itemAttrs.exclusiveRaces.join(', ')}`
                              : ''}
                          </div>
                        )}

                        {category === 'nation' && (
                          <div className="text-[11px] text-[#695A47] truncate mt-0.5">
                            Penguasa: {itemAttrs.ruler || 'Majelis / Kolektif'}
                            {itemAttrs.dominantRaces &&
                            itemAttrs.dominantRaces.length > 0
                              ? ` · ${itemAttrs.dominantRaces.length} Ras Mayoritas`
                              : ''}
                          </div>
                        )}

                        {category === 'region' && (
                          <div className="text-[11px] text-[#695A47] truncate mt-0.5">
                            Bahaya: {itemAttrs.dangerLevel || 'Menengah'}
                            {itemAttrs.landmarksList &&
                            itemAttrs.landmarksList.length > 0
                              ? ` · ${itemAttrs.landmarksList.length} Landmark`
                              : ''}
                          </div>
                        )}

                        {category === 'history' && (
                          <div className="text-[11px] text-[#695A47] truncate mt-0.5">
                            Lokasi: {itemAttrs.eventLocation || 'Lintas Benua'}
                            {itemAttrs.belligerentsList &&
                            itemAttrs.belligerentsList.length > 0
                              ? ` · ${itemAttrs.belligerentsList.length} Pihak Terlibat`
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

              {/* =========================================================== */}
              {/* POWER SYSTEM-SPECIFIC RICH EDITOR (Magic & Combat Bible)    */}
              {/* =========================================================== */}
              {category === 'power_system' && (
                <div className="space-y-4">
                  {/* 1. Typology, Energy Source, Hybrid Origin & Catalyst Pickers */}
                  <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-3">
                    <div className="text-xs font-semibold text-[#5A3E7A]">
                      1. Tipologi Sistem, Sumber Energi, Asal-Usul & Medium Penyalur
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                          Tipologi Sistem Kekuatan
                        </label>
                        <input
                          type="text"
                          list="power-typology-list"
                          value={draftEntity.attributes.systemTypology || ''}
                          onChange={(e) =>
                            setDraftEntity({
                              ...draftEntity,
                              attributes: {
                                ...draftEntity.attributes,
                                systemTypology: e.target.value,
                              },
                            })
                          }
                          placeholder="Hard Magic / Kultivasi / Runik & Kriya..."
                          className="w-full px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                        />
                        <datalist id="power-typology-list">
                          {POWER_SYSTEM_TYPOLOGY_FILTERS.filter(
                            (p) => p !== 'Semua'
                          ).map((pt) => (
                            <option key={pt} value={pt} />
                          ))}
                        </datalist>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                          Sumber Energi Utama (Energy Source)
                        </label>
                        <input
                          type="text"
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
                          placeholder="Contoh: Cahaya Matahari, Bulan & Gugus Bintang"
                          className="w-full px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                        />
                      </div>

                      {/* Hybrid Origin Picker (Race / Region / History) */}
                      <div>
                        <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                          Asal-Usul / Pencipta (Pilih dari Ras/Wilayah/Sejarah atau Ketik)
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
                                  originSource: e.target.value,
                                },
                              });
                            }}
                            className="w-full px-2.5 py-1 text-[11px] bg-[#EFE7D6] border border-[#D8CBB3] rounded text-[#231C14]"
                          >
                            <option value="">
                              -- Pilih Entitas Asal-Usul --
                            </option>
                            {[
                              ...raceEntities,
                              ...nationAndRegionEntities,
                              ...historyEntities,
                            ].map((ent) => (
                              <option key={ent.id} value={ent.title}>
                                [{CATEGORY_META[ent.category].singular}]{' '}
                                {ent.title}
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={draftEntity.attributes.originSource || ''}
                            onChange={(e) =>
                              setDraftEntity({
                                ...draftEntity,
                                attributes: {
                                  ...draftEntity.attributes,
                                  originSource: e.target.value,
                                },
                              })
                            }
                            placeholder="Atau ketik asal-usul kekuatan..."
                            className="w-full px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                          />
                        </div>
                      </div>

                      {/* Hybrid Catalyst / Focus Medium Picker */}
                      <div>
                        <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                          Medium Fokus / Alat Penyalur (Pilih dari Artefak atau Ketik)
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
                                  catalystMedium: e.target.value,
                                },
                              });
                            }}
                            className="w-full px-2.5 py-1 text-[11px] bg-[#EFE7D6] border border-[#D8CBB3] rounded text-[#231C14]"
                          >
                            <option value="">
                              -- Pilih dari Tab Artefak (
                              {artifactEntities.length}) --
                            </option>
                            {artifactEntities.map((art) => (
                              <option key={art.id} value={art.title}>
                                {art.title}
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={draftEntity.attributes.catalystMedium || ''}
                            onChange={(e) =>
                              setDraftEntity({
                                ...draftEntity,
                                attributes: {
                                  ...draftEntity.attributes,
                                  catalystMedium: e.target.value,
                                },
                              })
                            }
                            placeholder="Contoh: Astrolabe Kuningan, Segel Runik, Tongkat..."
                            className="w-full px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                        Syarat Bangkit (Awakening) & Cara Mempelajari Sistem Ini
                      </label>
                      <textarea
                        rows={2}
                        value={draftEntity.attributes.awakeningCondition || ''}
                        onChange={(e) =>
                          setDraftEntity({
                            ...draftEntity,
                            attributes: {
                              ...draftEntity.attributes,
                              awakeningCondition: e.target.value,
                            },
                          })
                        }
                        placeholder="Siapa yang bisa menggunakan kekuatan ini? Apakah butuh garis darah khusus, pembukaan meridian, atau ujian ritual?"
                        className="w-full p-2.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                      />
                    </div>
                  </div>

                  {/* 2. Power Tiers Ladder & Element Branches / Schools Pickers */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Power Tiers List Manager */}
                    <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-2.5">
                      <div className="text-xs font-semibold text-[#5A3E7A]">
                        2A. Tangga Tingkatan Kekuatan (Power Tiers / Ranks)
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(draftEntity.attributes.powerTiersList || []).map(
                          (tier) => (
                            <span
                              key={tier}
                              className="px-2.5 py-1 rounded bg-[#231C14] text-[#FBF8F1] text-xs font-medium flex items-center gap-1.5"
                            >
                              {tier}
                              <button
                                type="button"
                                onClick={() =>
                                  toggleDraftArrayItem('powerTiersList', tier)
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
                          value={customPowerTierInput}
                          onChange={(e) =>
                            setCustomPowerTierInput(e.target.value)
                          }
                          placeholder="Contoh: Lingkar 1: Inisiat..."
                          className="flex-1 px-2.5 py-1 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!customPowerTierInput.trim()) return;
                            toggleDraftArrayItem(
                              'powerTiersList',
                              customPowerTierInput
                            );
                            setCustomPowerTierInput('');
                          }}
                          className="px-3 py-1 text-xs font-semibold bg-[#EFE7D6] border border-[#D8CBB3] rounded-lg text-[#231C14] cursor-pointer"
                        >
                          + Tambah Tier
                        </button>
                      </div>
                    </div>

                    {/* Element Branches / Schools Manager */}
                    <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-2.5">
                      <div className="text-xs font-semibold text-[#9E2A2B]">
                        2B. Cabang Aliran, Disiplin, atau Elemen Turunan
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(draftEntity.attributes.elementBranches || []).map(
                          (br) => (
                            <span
                              key={br}
                              className="px-2.5 py-1 rounded bg-[#5A3E7A] text-[#FBF8F1] text-xs font-medium flex items-center gap-1.5"
                            >
                              {br}
                              <button
                                type="button"
                                onClick={() =>
                                  toggleDraftArrayItem('elementBranches', br)
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
                          value={customElementBranchInput}
                          onChange={(e) =>
                            setCustomElementBranchInput(e.target.value)
                          }
                          placeholder="Contoh: Jalur Solar (Api Surya)..."
                          className="flex-1 px-2.5 py-1 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!customElementBranchInput.trim()) return;
                            toggleDraftArrayItem(
                              'elementBranches',
                              customElementBranchInput
                            );
                            setCustomElementBranchInput('');
                          }}
                          className="px-3 py-1 text-xs font-semibold bg-[#EFE7D6] border border-[#D8CBB3] rounded-lg text-[#231C14] cursor-pointer"
                        >
                          + Tambah Aliran
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 3. Hard Magic Rules, Counter-Weakness & Corruption / Backlash Cost */}
                  <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-3">
                    <div className="text-xs font-semibold text-[#9E2A2B]">
                      3. Hukum Mutlak (Hard Rules), Kelemahan Sistem & Risiko Efek Samping
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#2D5A43] mb-1">
                        Hukum Besi & Batasan Mutlak (Hard Magic Rules — Apa yang TIDAK BISA Dilakukan)
                      </label>
                      <textarea
                        rows={3}
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
                        placeholder="Tuliskan hukum mutlak agar sistem kekuatan konsisten dan bebas plot hole..."
                        className="w-full p-2.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#9E2A2B] mb-1">
                          Risiko Over-Resonansi & Harga Kekuatan (Corruption / Backlash Cost)
                        </label>
                        <textarea
                          rows={2}
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
                          placeholder="Efek samping fisik, mental, atau kutukan bila dipaksakan melampaui batas..."
                          className="w-full p-2.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                          Kelemahan Lingkungan & Material Penangkal (Anti-Magic / Counter)
                        </label>
                        <textarea
                          rows={2}
                          value={draftEntity.attributes.systemWeakness || ''}
                          onChange={(e) =>
                            setDraftEntity({
                              ...draftEntity,
                              attributes: {
                                ...draftEntity.attributes,
                                systemWeakness: e.target.value,
                              },
                            })
                          }
                          placeholder="Kondisi cuaca, tempat, atau material logam yang melemahkan kekuatan ini..."
                          className="w-full p-2.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* =========================================================== */}
              {/* SKILL-SPECIFIC RICH EDITOR (Racial & Grand-Scale Skills)    */}
              {/* =========================================================== */}
              {category === 'skill' &&
                (() => {
                  const matchedParentPs = findMatchingEntityByName(
                    draftEntity.attributes.parentPowerSystem,
                    'power_system'
                  );
                  const parentPsAttrs = matchedParentPs
                    ? getEnrichedAttributes(matchedParentPs)
                    : {};
                  const availableTiers = parentPsAttrs.powerTiersList || [];
                  const availableBranches = parentPsAttrs.elementBranches || [];

                  return (
                    <div className="space-y-4">
                      {/* 1. Dynamic Parent Power System, Tier & Branch Picker */}
                      <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-3">
                        <div className="text-xs font-semibold text-[#5A3E7A]">
                          1. Sistem Kekuatan Induk, Peringkat Tier & Cabang Aliran (Otomatis dari Power System)
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {/* Parent Power System Picker */}
                          <div>
                            <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                              Sistem Kekuatan Induk (Power System)
                            </label>
                            <div className="space-y-1">
                              <select
                                value=""
                                onChange={(e) => {
                                  const selectedPsTitle = e.target.value;
                                  if (!selectedPsTitle) return;
                                  const psEnt = powerSystemEntities.find(
                                    (p) => p.title === selectedPsTitle
                                  );
                                  const psA = psEnt
                                    ? getEnrichedAttributes(psEnt)
                                    : {};
                                  setDraftEntity({
                                    ...draftEntity,
                                    attributes: {
                                      ...draftEntity.attributes,
                                      parentPowerSystem: selectedPsTitle,
                                      skillRank:
                                        psA.powerTiersList &&
                                        psA.powerTiersList.length > 0
                                          ? psA.powerTiersList[0]
                                          : draftEntity.attributes.skillRank,
                                      elementAffinity:
                                        psA.elementBranches &&
                                        psA.elementBranches.length > 0
                                          ? psA.elementBranches[0]
                                          : draftEntity.attributes
                                              .elementAffinity,
                                    },
                                  });
                                }}
                                className="w-full px-2.5 py-1 text-[11px] bg-[#EFE7D6] border border-[#D8CBB3] rounded text-[#231C14]"
                              >
                                <option value="">
                                  -- Pilih Power System Induk (
                                  {powerSystemEntities.length}) --
                                </option>
                                {powerSystemEntities.map((ps) => (
                                  <option key={ps.id} value={ps.title}>
                                    {ps.title}
                                  </option>
                                ))}
                              </select>
                              <input
                                type="text"
                                value={
                                  draftEntity.attributes.parentPowerSystem || ''
                                }
                                onChange={(e) =>
                                  setDraftEntity({
                                    ...draftEntity,
                                    attributes: {
                                      ...draftEntity.attributes,
                                      parentPowerSystem: e.target.value,
                                    },
                                  })
                                }
                                placeholder="Atau ketik sistem kekuatan..."
                                className="w-full px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                              />
                            </div>
                          </div>

                          {/* Dynamic Tier / Rank Picker from Parent Power System */}
                          <div>
                            <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                              Peringkat / Tier (Tarik dari{' '}
                              {matchedParentPs
                                ? matchedParentPs.title.split(' ')[0]
                                : 'Power System'}
                              )
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
                                      skillRank: e.target.value,
                                    },
                                  });
                                }}
                                className="w-full px-2.5 py-1 text-[11px] bg-[#EFE7D6] border border-[#D8CBB3] rounded text-[#231C14]"
                              >
                                <option value="">
                                  {availableTiers.length > 0
                                    ? `-- Pilih Tier dari ${matchedParentPs?.title} (${availableTiers.length}) --`
                                    : '-- Pilih Power System dahulu --'}
                                </option>
                                {availableTiers.map((tier) => (
                                  <option key={tier} value={tier}>
                                    {tier}
                                  </option>
                                ))}
                              </select>
                              <input
                                type="text"
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
                                placeholder="Atau ketik tingkatan tier..."
                                className="w-full px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                              />
                            </div>
                          </div>

                          {/* Dynamic Branch / Element Picker from Parent Power System */}
                          <div>
                            <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                              Cabang Aliran / Elemen (Tarik dari{' '}
                              {matchedParentPs
                                ? matchedParentPs.title.split(' ')[0]
                                : 'Power System'}
                              )
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
                                      elementAffinity: e.target.value,
                                    },
                                  });
                                }}
                                className="w-full px-2.5 py-1 text-[11px] bg-[#EFE7D6] border border-[#D8CBB3] rounded text-[#231C14]"
                              >
                                <option value="">
                                  {availableBranches.length > 0
                                    ? `-- Pilih Cabang dari ${matchedParentPs?.title} (${availableBranches.length}) --`
                                    : '-- Pilih Power System dahulu --'}
                                </option>
                                {availableBranches.map((br) => (
                                  <option key={br} value={br}>
                                    {br}
                                  </option>
                                ))}
                              </select>
                              <input
                                type="text"
                                value={
                                  draftEntity.attributes.elementAffinity || ''
                                }
                                onChange={(e) =>
                                  setDraftEntity({
                                    ...draftEntity,
                                    attributes: {
                                      ...draftEntity.attributes,
                                      elementAffinity: e.target.value,
                                    },
                                  })
                                }
                                placeholder="Atau ketik cabang aliran..."
                                className="w-full px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 2. Skill Exclusivity, Exclusive Races & Impact Scale */}
                      <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-3">
                        <div className="text-xs font-semibold text-[#9E2A2B]">
                          2. Sifat Eksklusivitas Rasial & Skala Cakupan Dampak
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                              Sifat Kepemilikan / Eksklusivitas Skill
                            </label>
                            <input
                              type="text"
                              list="skill-exclusivity-list"
                              value={
                                draftEntity.attributes.skillExclusivity || ''
                              }
                              onChange={(e) =>
                                setDraftEntity({
                                  ...draftEntity,
                                  attributes: {
                                    ...draftEntity.attributes,
                                    skillExclusivity: e.target.value,
                                  },
                                })
                              }
                              placeholder="Warisan Rasial Eksklusif / Teknik Skala Strategis..."
                              className="w-full px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                            />
                            <datalist id="skill-exclusivity-list">
                              {SKILL_EXCLUSIVITY_OPTIONS.map((opt) => (
                                <option key={opt} value={opt} />
                              ))}
                            </datalist>
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                              Skala & Radius Cakupan Dampak (Impact Scale)
                            </label>
                            <input
                              type="text"
                              list="skill-scale-list"
                              value={draftEntity.attributes.impactScale || ''}
                              onChange={(e) =>
                                setDraftEntity({
                                  ...draftEntity,
                                  attributes: {
                                    ...draftEntity.attributes,
                                    impactScale: e.target.value,
                                  },
                                })
                              }
                              placeholder="Skala Pasukan / Benteng / Kota / Regional..."
                              className="w-full px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                            />
                            <datalist id="skill-scale-list">
                              {SKILL_IMPACT_SCALE_OPTIONS.map((sc) => (
                                <option key={sc} value={sc} />
                              ))}
                            </datalist>
                          </div>
                        </div>

                        {/* Exclusive Races / Bloodline Picker */}
                        <div className="space-y-2 pt-1">
                          <label className="block text-[11px] font-semibold text-[#2D5A43]">
                            Ras atau Garis Darah Pemilik Eksklusif Skill Ini
                          </label>
                          <div className="flex flex-wrap gap-1.5">
                            {(draftEntity.attributes.exclusiveRaces || []).map(
                              (rc) => (
                                <span
                                  key={rc}
                                  className="px-2.5 py-1 rounded bg-[#2D5A43] text-[#FBF8F1] text-xs font-medium flex items-center gap-1.5"
                                >
                                  {rc}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      toggleDraftArrayItem('exclusiveRaces', rc)
                                    }
                                    className="text-[#E6D5B8] hover:text-white cursor-pointer"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              )
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[11px] text-[#695A47]">
                              Pilih dari Tab Ras:
                            </span>
                            {raceEntities.map((rEnt) => {
                              const active = (
                                draftEntity.attributes.exclusiveRaces || []
                              ).includes(rEnt.title);
                              return (
                                <button
                                  key={rEnt.id}
                                  type="button"
                                  onClick={() =>
                                    toggleDraftArrayItem(
                                      'exclusiveRaces',
                                      rEnt.title
                                    )
                                  }
                                  className={`px-2 py-0.5 rounded text-[11px] border cursor-pointer ${
                                    active
                                      ? 'bg-[#2D5A43] text-white border-[#2D5A43]'
                                      : 'bg-[#FBF8F1] text-[#231C14] border-[#D8CBB3]'
                                  }`}
                                >
                                  {active ? '✓ ' : '+ '}
                                  {rEnt.title}
                                </button>
                              );
                            })}
                          </div>
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              value={customExclusiveRaceInput}
                              onChange={(e) =>
                                setCustomExclusiveRaceInput(e.target.value)
                              }
                              placeholder="Ketik sub-ras atau klan garis darah khusus..."
                              className="flex-1 px-2.5 py-1 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (!customExclusiveRaceInput.trim()) return;
                                toggleDraftArrayItem(
                                  'exclusiveRaces',
                                  customExclusiveRaceInput
                                );
                                setCustomExclusiveRaceInput('');
                              }}
                              className="px-3 py-1 text-xs font-semibold bg-[#EFE7D6] border border-[#D8CBB3] rounded-lg text-[#231C14] cursor-pointer"
                            >
                              + Tambah Garis Darah
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* 3. Large-Scale Strategic Impact, Visual Manifestation & Activation Cost */}
                      <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-3">
                        <div className="text-xs font-semibold text-[#9E2A2B]">
                          3. Dampak Skala Besar / Strategis, Manifestasi Visual & Syarat Aktivasi
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-[#9E2A2B] mb-1">
                            Dampak Skala Besar & Efek Strategis terhadap Medan / Wilayah (Gunakan [[Nama Entitas]] untuk Tautan)
                          </label>
                          <textarea
                            rows={2}
                            value={
                              draftEntity.attributes.strategicImpact || ''
                            }
                            onChange={(e) =>
                              setDraftEntity({
                                ...draftEntity,
                                attributes: {
                                  ...draftEntity.attributes,
                                  strategicImpact: e.target.value,
                                },
                              })
                            }
                            placeholder="Apa yang terjadi pada benteng, pasukan, atau lanskap alam ketika skill berskala besar ini dilepaskan..."
                            className="w-full p-2.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-[#5A3E7A] mb-1">
                            Manifestasi Visual, Suara & Fenomena Alam Saat Diaktifkan (Panduan Adegan Novel)
                          </label>
                          <textarea
                            rows={2}
                            value={
                              draftEntity.attributes.visualManifestation || ''
                            }
                            onChange={(e) =>
                              setDraftEntity({
                                ...draftEntity,
                                attributes: {
                                  ...draftEntity.attributes,
                                  visualManifestation: e.target.value,
                                },
                              })
                            }
                            placeholder="Bagaimana wujud visual segel, warna cahaya, perubahan langit, atau getaran tanah saat teknik ini dirapal..."
                            className="w-full p-2.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                              Syarat Pemicu & Biaya Aktivasi (Activation Cost)
                            </label>
                            <input
                              type="text"
                              value={
                                draftEntity.attributes.activationCost || ''
                              }
                              onChange={(e) =>
                                setDraftEntity({
                                  ...draftEntity,
                                  attributes: {
                                    ...draftEntity.attributes,
                                    activationCost: e.target.value,
                                  },
                                })
                              }
                              placeholder="Contoh: Membutuhkan darah murni Aelfir atau kompas logam..."
                              className="w-full px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                              Batas Cooldown, Frekuensi & Efek Balik Pengguna
                            </label>
                            <input
                              type="text"
                              value={
                                draftEntity.attributes.cooldownOrLimit || ''
                              }
                              onChange={(e) =>
                                setDraftEntity({
                                  ...draftEntity,
                                  attributes: {
                                    ...draftEntity.attributes,
                                    cooldownOrLimit: e.target.value,
                                  },
                                })
                              }
                              placeholder="Contoh: Maksimal 90 detik sebelum memicu pendarahan retina..."
                              className="w-full px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

              {/* ============================================================= */}
              {/* NATION-SPECIFIC RICH EDITOR (GEOPOLITICAL & SOVEREIGN ATLAS)  */}
              {/* ============================================================= */}
              {category === 'nation' && (
                <div className="space-y-5">
                  {/* Section 1: Bentuk Pemerintahan, Penguasa, Ibu Kota & Simbol Kedaulatan */}
                  <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-3.5">
                    <div className="text-xs font-semibold text-[#B5832A] flex items-center gap-1.5">
                      <Crown className="w-3.5 h-3.5" />
                      <span>
                        1. Kedaulatan Politik, Penguasa, Ibu Kota & Lambang Negara
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                          Klasifikasi Bentuk Pemerintahan (Filter Direktori)
                        </label>
                        <select
                          value={
                            draftEntity.attributes.governmentType ||
                            'Kekaisaran / Monarki'
                          }
                          onChange={(e) =>
                            setDraftEntity({
                              ...draftEntity,
                              attributes: {
                                ...draftEntity.attributes,
                                governmentType: e.target.value,
                              },
                            })
                          }
                          className="w-full px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                        >
                          {NATION_GOVERNMENT_FILTERS.filter(
                            (f) => f !== 'Semua'
                          ).map((gov) => (
                            <option key={gov} value={gov}>
                              {gov}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                          Detail Struktur Pemerintahan & Parlemen/Tahta
                        </label>
                        <input
                          type="text"
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
                          placeholder="Contoh: Monarki Teokratis Absolut / Serikat Klan Bawah Tanah..."
                          className="w-full px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                        />
                      </div>

                      {/* Hybrid Ruler Picker (From Character Codex or Custom) */}
                      <div>
                        <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                          Penguasa / Kepala Negara Saat Ini (Pilih dari Character atau Ketik)
                        </label>
                        <div className="space-y-1.5">
                          <select
                            value={
                              characterEntities.some(
                                (c) => c.title === draftEntity.attributes.ruler
                              )
                                ? draftEntity.attributes.ruler
                                : '__CUSTOM__'
                            }
                            onChange={(e) => {
                              if (e.target.value !== '__CUSTOM__') {
                                setDraftEntity({
                                  ...draftEntity,
                                  attributes: {
                                    ...draftEntity.attributes,
                                    ruler: e.target.value,
                                  },
                                });
                              }
                            }}
                            className="w-full px-2.5 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                          >
                            <option value="__CUSTOM__">
                              -- Pilih dari Daftar Tokoh atau Ketik Manual --
                            </option>
                            {characterEntities.map((c) => (
                              <option key={c.id} value={c.title}>
                                {c.title} ({c.subtitle})
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
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
                            placeholder="Nama Raja / Kaisar / Kanselir / Dewan Penguasa..."
                            className="w-full px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                          />
                        </div>
                      </div>

                      {/* Hybrid Capital City Picker (From Region Codex / Map Stamps or Custom) */}
                      <div>
                        <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                          Ibu Kota & Pusat Pemerintahan (Pilih dari Wilayah/Peta atau Ketik)
                        </label>
                        <div className="space-y-1.5">
                          <select
                            value={
                              regionEntities.some(
                                (r) =>
                                  r.title === draftEntity.attributes.capitalCity
                              )
                                ? draftEntity.attributes.capitalCity
                                : '__CUSTOM__'
                            }
                            onChange={(e) => {
                              if (e.target.value !== '__CUSTOM__') {
                                setDraftEntity({
                                  ...draftEntity,
                                  attributes: {
                                    ...draftEntity.attributes,
                                    capitalCity: e.target.value,
                                  },
                                });
                              }
                            }}
                            className="w-full px-2.5 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                          >
                            <option value="__CUSTOM__">
                              -- Pilih dari Daftar Wilayah / Pin Peta atau Ketik Manual --
                            </option>
                            {regionEntities.map((r) => (
                              <option key={r.id} value={r.title}>
                                [Wilayah] {r.title}
                              </option>
                            ))}
                            {(mapStamps || []).map((st) => (
                              <option key={st.id} value={st.label}>
                                [Pin Peta] {st.label}
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
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
                            placeholder="Nama Ibu Kota atau Benteng Takhta..."
                            className="w-full px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                          Agama Negara / Kepercayaan Resmi
                        </label>
                        <input
                          type="text"
                          value={draftEntity.attributes.stateReligion || ''}
                          onChange={(e) =>
                            setDraftEntity({
                              ...draftEntity,
                              attributes: {
                                ...draftEntity.attributes,
                                stateReligion: e.target.value,
                              },
                            })
                          }
                          placeholder="Contoh: Gereja Cahaya Sol-Aurea / Kultus Leluhur..."
                          className="w-full px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                          Mata Uang Resmi & Standar Nilai Tukar
                        </label>
                        <input
                          type="text"
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
                          placeholder="Contoh: Dinar Emas Surya, Keping Perak..."
                          className="w-full px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#B5832A] mb-1">
                        Lambang Kebesaran Negara, Panji Bendera & Semboyan Kedaulatan
                      </label>
                      <input
                        type="text"
                        value={draftEntity.attributes.nationalEmblem || ''}
                        onChange={(e) =>
                          setDraftEntity({
                            ...draftEntity,
                            attributes: {
                              ...draftEntity.attributes,
                              nationalEmblem: e.target.value,
                            },
                          })
                        }
                        placeholder="Contoh: Elang Kembar Bermahkota Matahari — 'Di Bawah Terang Surya, Tak Ada Bayangan yang Abadi'"
                        className="w-full px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Section 2: Demografi Ras Mayoritas, Komoditas Ekonomi & Kekuatan Militer */}
                  <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-3.5">
                    <div className="text-xs font-semibold text-[#2D5A43] flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      <span>
                        2. Demografi Ras Mayoritas, Komoditas Ekonomi & Kekuatan Militer
                      </span>
                    </div>

                    {/* Hybrid Dominant Races Multi-Picker */}
                    <div className="p-3 rounded-lg bg-[#FBF8F1] border border-[#D8CBB3] space-y-2.5">
                      <label className="block text-[11px] font-semibold text-[#2D5A43]">
                        Demografi Ras Penduduk Negara Ini (Pilih dari Tab Ras atau Ketik Manual)
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {(draftEntity.attributes.dominantRaces || []).map(
                          (rName) => (
                            <span
                              key={rName}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#EFE7D6] border border-[#2D5A43]/40 text-xs font-medium text-[#231C14]"
                            >
                              {rName}
                              <button
                                type="button"
                                onClick={() =>
                                  setDraftEntity({
                                    ...draftEntity,
                                    attributes: {
                                      ...draftEntity.attributes,
                                      dominantRaces: (
                                        draftEntity.attributes.dominantRaces ||
                                        []
                                      ).filter((item) => item !== rName),
                                    },
                                  })
                                }
                                className="text-[#9E2A2B] hover:text-[#231C14] cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          )
                        )}
                      </div>

                      {raceEntities.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[11px] text-[#695A47]">
                            Pilih Cepat dari Tab Ras:
                          </span>
                          {raceEntities.map((rEnt) => {
                            const already = (
                              draftEntity.attributes.dominantRaces || []
                            ).includes(rEnt.title);
                            return (
                              <button
                                key={rEnt.id}
                                type="button"
                                onClick={() => {
                                  const current =
                                    draftEntity.attributes.dominantRaces || [];
                                  const next = already
                                    ? current.filter((x) => x !== rEnt.title)
                                    : [...current, rEnt.title];
                                  setDraftEntity({
                                    ...draftEntity,
                                    attributes: {
                                      ...draftEntity.attributes,
                                      dominantRaces: next,
                                    },
                                  });
                                }}
                                className={`px-2 py-0.5 text-[11px] rounded border cursor-pointer transition-colors ${
                                  already
                                    ? 'bg-[#2D5A43] text-white border-[#2D5A43]'
                                    : 'bg-[#F6F1E6] text-[#231C14] border-[#D8CBB3] hover:bg-[#EFE7D6]'
                                }`}
                              >
                                {already ? '✓ ' : '+ '}
                                {rEnt.title}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      <div className="flex gap-1.5 pt-1">
                        <input
                          type="text"
                          value={customDominantRaceInput}
                          onChange={(e) =>
                            setCustomDominantRaceInput(e.target.value)
                          }
                          placeholder="Ketik ras/etnis demografi lain (misal: Manusia Dataran Aurelia 70%)..."
                          className="flex-1 px-2.5 py-1 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const val = customDominantRaceInput.trim();
                            if (!val) return;
                            const current =
                              draftEntity.attributes.dominantRaces || [];
                            if (!current.includes(val)) {
                              setDraftEntity({
                                ...draftEntity,
                                attributes: {
                                  ...draftEntity.attributes,
                                  dominantRaces: [...current, val],
                                },
                              });
                            }
                            setCustomDominantRaceInput('');
                          }}
                          className="px-3 py-1 text-xs font-semibold bg-[#2D5A43] text-white rounded cursor-pointer whitespace-nowrap shrink-0"
                        >
                          + Tambah Demografi
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#8F5B14] mb-1">
                          Komoditas Ekonomi Utama, Perdagangan & Sumber Daya Strategis
                        </label>
                        <textarea
                          rows={3}
                          value={
                            draftEntity.attributes.economicCommodities || ''
                          }
                          onChange={(e) =>
                            setDraftEntity({
                              ...draftEntity,
                              attributes: {
                                ...draftEntity.attributes,
                                economicCommodities: e.target.value,
                              },
                            })
                          }
                          placeholder="Apa komoditas ekspor utama, monopoli tambang/pertanian, dan jalur niaga yang menghidupi negara ini..."
                          className="w-full p-2.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#9E2A2B] mb-1">
                          Kekuatan Militer, Pasukan Elit & Pertahanan Strategis
                        </label>
                        <textarea
                          rows={3}
                          value={draftEntity.attributes.militaryStrength || ''}
                          onChange={(e) =>
                            setDraftEntity({
                              ...draftEntity,
                              attributes: {
                                ...draftEntity.attributes,
                                militaryStrength: e.target.value,
                              },
                            })
                          }
                          placeholder="Jumlah legiun/armada, unit ksatria atau penyihir elit, serta benteng pertahanan utama negara..."
                          className="w-full p-2.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Hukum Utama, Budaya Masyarakat & Peta Diplomasi / Konflik Perbatasan */}
                  <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-3.5">
                    <div className="text-xs font-semibold text-[#9E2A2B] flex items-center gap-1.5">
                      <Swords className="w-3.5 h-3.5" />
                      <span>
                        3. Hukum Utama, Budaya Masyarakat & Peta Diplomasi / Konflik Perbatasan
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#231C14] mb-1">
                        Hukum Utama, Larangan Negara & Adat Budaya Masyarakat
                      </label>
                      <textarea
                        rows={2}
                        value={draftEntity.attributes.lawsAndCulture || ''}
                        onChange={(e) =>
                          setDraftEntity({
                            ...draftEntity,
                            attributes: {
                              ...draftEntity.attributes,
                              lawsAndCulture: e.target.value,
                            },
                          })
                        }
                        placeholder="Undang-undang mutlak (misal: larangan sihir tanpa lisensi), sistem kasta warga, dan tradisi masyarakat..."
                        className="w-full p-2.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#2D5A43] mb-1">
                          Aliansi Diplomatik & Perjanjian Dagang (Gunakan [[Nama]] untuk tautan)
                        </label>
                        <textarea
                          rows={2}
                          value={draftEntity.attributes.diplomaticAllies || ''}
                          onChange={(e) =>
                            setDraftEntity({
                              ...draftEntity,
                              attributes: {
                                ...draftEntity.attributes,
                                diplomaticAllies: e.target.value,
                              },
                            })
                          }
                          placeholder="Negara sahabat, pakta pertahanan, atau kelompok sekutu..."
                          className="w-full p-2.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#9E2A2B] mb-1">
                          Rival Geopolitik, Musuh & Konflik Perbatasan Aktif
                        </label>
                        <textarea
                          rows={2}
                          value={draftEntity.attributes.borderConflicts || ''}
                          onChange={(e) =>
                            setDraftEntity({
                              ...draftEntity,
                              attributes: {
                                ...draftEntity.attributes,
                                borderConflicts: e.target.value,
                              },
                            })
                          }
                          placeholder="Sengketa wilayah perbatasan, perang dingin, embargo, atau ancaman invasi..."
                          className="w-full p-2.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================= */}
              {/* REGION-SPECIFIC RICH EDITOR (ATLAS LOKASI & PANDUAN ADEGAN)   */}
              {/* ============================================================= */}
              {category === 'region' && (
                <div className="space-y-5">
                  {/* Section 1: Klasifikasi Tipologi, Negara Induk, Pin Peta & Iklim/Bahaya */}
                  <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-3.5">
                    <div className="text-xs font-semibold text-[#264653] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>
                        1. Klasifikasi Geografis, Kedaulatan Negara Induk & Pin Peta Dunia
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                          Tipologi Wilayah (Filter Direktori Kiri)
                        </label>
                        <select
                          value={
                            draftEntity.attributes.regionType ||
                            'Benteng & Kota Perbatasan'
                          }
                          onChange={(e) =>
                            setDraftEntity({
                              ...draftEntity,
                              attributes: {
                                ...draftEntity.attributes,
                                regionType: e.target.value,
                              },
                            })
                          }
                          className="w-full px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                        >
                          {REGION_TYPOLOGY_FILTERS.filter(
                            (f) => f !== 'Semua'
                          ).map((rt) => (
                            <option key={rt} value={rt}>
                              {rt}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                          Tingkat Bahaya Wilayah (Pilih Preset atau Ketik Manual)
                        </label>
                        <div className="space-y-1.5">
                          <select
                            value={
                              REGION_DANGER_PRESETS.includes(
                                draftEntity.attributes.dangerLevel || ''
                              )
                                ? draftEntity.attributes.dangerLevel
                                : '__CUSTOM__'
                            }
                            onChange={(e) => {
                              if (e.target.value !== '__CUSTOM__') {
                                setDraftEntity({
                                  ...draftEntity,
                                  attributes: {
                                    ...draftEntity.attributes,
                                    dangerLevel: e.target.value,
                                  },
                                });
                              }
                            }}
                            className="w-full px-2.5 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                          >
                            <option value="__CUSTOM__">
                              -- Pilih Preset Bahaya atau Ketik Manual --
                            </option>
                            {REGION_DANGER_PRESETS.map((dp) => (
                              <option key={dp} value={dp}>
                                {dp}
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
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
                            placeholder="Contoh: Sangat Tinggi (Predator Wyvern & Badai Eter)..."
                            className="w-full px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                          />
                        </div>
                      </div>

                      {/* Hybrid Parent Nation Picker */}
                      <div>
                        <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                          Negara / Kedaulatan Induk (Pilih dari Tab Negara atau Ketik)
                        </label>
                        <div className="space-y-1.5">
                          <select
                            value={
                              nationEntities.some(
                                (n) =>
                                  n.title ===
                                  draftEntity.attributes.parentNation
                              )
                                ? draftEntity.attributes.parentNation
                                : '__CUSTOM__'
                            }
                            onChange={(e) => {
                              if (e.target.value !== '__CUSTOM__') {
                                setDraftEntity({
                                  ...draftEntity,
                                  attributes: {
                                    ...draftEntity.attributes,
                                    parentNation: e.target.value,
                                  },
                                });
                              }
                            }}
                            className="w-full px-2.5 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                          >
                            <option value="__CUSTOM__">
                              -- Pilih dari Daftar Negara atau Ketik Wilayah Bebas --
                            </option>
                            {nationEntities.map((n) => (
                              <option key={n.id} value={n.title}>
                                {n.title}
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
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
                            placeholder="Contoh: Kekaisaran Gondoria / Zona Bebas Perbatasan Utara..."
                            className="w-full px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                          />
                        </div>
                      </div>

                      {/* Hybrid Map Stamp Picker */}
                      <div>
                        <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                          Tautan Pin Lokasi di Map Dunia (Pilih dari Pin Peta atau Ketik)
                        </label>
                        <div className="space-y-1.5">
                          <select
                            value={
                              (mapStamps || []).some(
                                (st) =>
                                  st.label ===
                                  draftEntity.attributes.linkedMapStampLabel
                              )
                                ? draftEntity.attributes.linkedMapStampLabel
                                : '__CUSTOM__'
                            }
                            onChange={(e) => {
                              if (e.target.value !== '__CUSTOM__') {
                                setDraftEntity({
                                  ...draftEntity,
                                  attributes: {
                                    ...draftEntity.attributes,
                                    linkedMapStampLabel: e.target.value,
                                  },
                                });
                              }
                            }}
                            className="w-full px-2.5 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                          >
                            <option value="__CUSTOM__">
                              -- Pilih dari Daftar Pin Peta Dunia atau Ketik Manual --
                            </option>
                            {(mapStamps || []).map((st) => (
                              <option key={st.id} value={st.label}>
                                {st.label} (X:{Math.round(st.x)}%, Y:
                                {Math.round(st.y)}%)
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={
                              draftEntity.attributes.linkedMapStampLabel || ''
                            }
                            onChange={(e) =>
                              setDraftEntity({
                                ...draftEntity,
                                attributes: {
                                  ...draftEntity.attributes,
                                  linkedMapStampLabel: e.target.value,
                                },
                              })
                            }
                            placeholder="Nama Pin di Map Dunia (opsional)..."
                            className="w-full px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                          Iklim, Cuaca & Siklus Musim Wilayah
                        </label>
                        <input
                          type="text"
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
                          placeholder="Contoh: Lembap berkabut abadi dengan bioluminesensi malam..."
                          className="w-full px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                          Sumber Daya Alam, Magis & Komoditas Lokal
                        </label>
                        <input
                          type="text"
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
                          placeholder="Contoh: Bijih Bintang Jatuh, Getah Eter, Bunga Lentera Malam..."
                          className="w-full px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Atmosfer Sensorik Latar Adegan Novel & Daftar Landmark Lokal */}
                  <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-3.5">
                    <div className="text-xs font-semibold text-[#8F5B14] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>
                        2. Atmosfer Sensorik Latar Adegan Novel & Daftar Titik Penting (Landmark)
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#8F5B14] mb-1">
                        Atmosfer Sensorik, Pencahayaan, Aroma & Suara Latar (Panduan Deskripsi Adegan Novel)
                      </label>
                      <textarea
                        rows={3}
                        value={draftEntity.attributes.sensoryAtmosphere || ''}
                        onChange={(e) =>
                          setDraftEntity({
                            ...draftEntity,
                            attributes: {
                              ...draftEntity.attributes,
                              sensoryAtmosphere: e.target.value,
                            },
                          })
                        }
                        placeholder="Bagaimana warna langit, aroma udara, suara langkah kaki/alam, dan suasana arsitektur saat tokoh melangkah masuk ke wilayah ini..."
                        className="w-full p-2.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                      />
                    </div>

                    {/* Landmarks List Chip Builder */}
                    <div className="p-3 rounded-lg bg-[#FBF8F1] border border-[#D8CBB3] space-y-2.5">
                      <label className="block text-[11px] font-semibold text-[#264653]">
                        Daftar Titik Penting (Landmark), Distrik & Reruntuhan Lokal di Wilayah Ini
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {(draftEntity.attributes.landmarksList || []).map(
                          (lm, idx) => (
                            <span
                              key={lm}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#EFE7D6] border border-[#264653]/40 text-xs font-medium text-[#231C14]"
                            >
                              <span className="text-[#264653] font-bold">
                                #{idx + 1}
                              </span>{' '}
                              {lm}
                              <button
                                type="button"
                                onClick={() =>
                                  setDraftEntity({
                                    ...draftEntity,
                                    attributes: {
                                      ...draftEntity.attributes,
                                      landmarksList: (
                                        draftEntity.attributes.landmarksList ||
                                        []
                                      ).filter((item) => item !== lm),
                                    },
                                  })
                                }
                                className="text-[#9E2A2B] hover:text-[#231C14] cursor-pointer"
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
                          value={customLandmarkInput}
                          onChange={(e) =>
                            setCustomLandmarkInput(e.target.value)
                          }
                          placeholder="Ketik nama tempat/bangunan penting (misal: Observatorium Cakrawala Perak)..."
                          className="flex-1 px-2.5 py-1 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const val = customLandmarkInput.trim();
                            if (!val) return;
                            const current =
                              draftEntity.attributes.landmarksList || [];
                            if (!current.includes(val)) {
                              const next = [...current, val];
                              setDraftEntity({
                                ...draftEntity,
                                attributes: {
                                  ...draftEntity.attributes,
                                  landmarksList: next,
                                  landmarks: next.join(', '),
                                },
                              });
                            }
                            setCustomLandmarkInput('');
                          }}
                          className="px-3 py-1 text-xs font-semibold bg-[#264653] text-white rounded cursor-pointer whitespace-nowrap shrink-0"
                        >
                          + Tambah Landmark
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Ekologi Monster, Flora/Fauna Endemik & Anomali Bahaya */}
                  <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-3.5">
                    <div className="text-xs font-semibold text-[#9E2A2B] flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>
                        3. Ekologi Monster, Flora/Fauna Endemik & Anomali Bahaya Lingkungan
                      </span>
                    </div>

                    {/* Hybrid Endemic Flora/Fauna/Artifacts Multi-Picker */}
                    <div className="p-3 rounded-lg bg-[#FBF8F1] border border-[#D8CBB3] space-y-2.5">
                      <label className="block text-[11px] font-semibold text-[#2D5A43]">
                        Flora, Fauna, Monster & Pusaka Endemik Wilayah Ini (Pilih dari Artefak & Flora atau Ketik)
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {(draftEntity.attributes.endemicFloraFauna || []).map(
                          (ef) => (
                            <span
                              key={ef}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#EFE7D6] border border-[#2D5A43]/40 text-xs font-medium text-[#231C14]"
                            >
                              {ef}
                              <button
                                type="button"
                                onClick={() =>
                                  setDraftEntity({
                                    ...draftEntity,
                                    attributes: {
                                      ...draftEntity.attributes,
                                      endemicFloraFauna: (
                                        draftEntity.attributes
                                          .endemicFloraFauna || []
                                      ).filter((item) => item !== ef),
                                    },
                                  })
                                }
                                className="text-[#9E2A2B] hover:text-[#231C14] cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          )
                        )}
                      </div>

                      {artifactEntities.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[11px] text-[#695A47]">
                            Pilih Cepat dari Artefak & Flora:
                          </span>
                          {artifactEntities.map((artEnt) => {
                            const already = (
                              draftEntity.attributes.endemicFloraFauna || []
                            ).includes(artEnt.title);
                            return (
                              <button
                                key={artEnt.id}
                                type="button"
                                onClick={() => {
                                  const current =
                                    draftEntity.attributes.endemicFloraFauna ||
                                    [];
                                  const next = already
                                    ? current.filter((x) => x !== artEnt.title)
                                    : [...current, artEnt.title];
                                  setDraftEntity({
                                    ...draftEntity,
                                    attributes: {
                                      ...draftEntity.attributes,
                                      endemicFloraFauna: next,
                                    },
                                  });
                                }}
                                className={`px-2 py-0.5 text-[11px] rounded border cursor-pointer transition-colors ${
                                  already
                                    ? 'bg-[#2D5A43] text-white border-[#2D5A43]'
                                    : 'bg-[#F6F1E6] text-[#231C14] border-[#D8CBB3] hover:bg-[#EFE7D6]'
                                }`}
                              >
                                {already ? '✓ ' : '+ '}
                                {artEnt.title}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      <div className="flex gap-1.5 pt-1">
                        <input
                          type="text"
                          value={customEndemicInput}
                          onChange={(e) =>
                            setCustomEndemicInput(e.target.value)
                          }
                          placeholder="Ketik makhluk/tanaman/anomali endemik lain (misal: Wyvern Sayap-Es Utara)..."
                          className="flex-1 px-2.5 py-1 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const val = customEndemicInput.trim();
                            if (!val) return;
                            const current =
                              draftEntity.attributes.endemicFloraFauna || [];
                            if (!current.includes(val)) {
                              setDraftEntity({
                                ...draftEntity,
                                attributes: {
                                  ...draftEntity.attributes,
                                  endemicFloraFauna: [...current, val],
                                },
                              });
                            }
                            setCustomEndemicInput('');
                          }}
                          className="px-3 py-1 text-xs font-semibold bg-[#2D5A43] text-white rounded cursor-pointer whitespace-nowrap shrink-0"
                        >
                          + Tambah Entri
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#9E2A2B] mb-1">
                        Detail Anomali Bahaya, Monster Penguasa Medan & Pantangan Penjelajah
                      </label>
                      <textarea
                        rows={3}
                        value={
                          draftEntity.attributes.localEcologyAndHazards || ''
                        }
                        onChange={(e) =>
                          setDraftEntity({
                            ...draftEntity,
                            attributes: {
                              ...draftEntity.attributes,
                              localEcologyAndHazards: e.target.value,
                            },
                          })
                        }
                        placeholder="Ancaman spesifik saat tokoh melintasi wilayah ini (misal: kabut penghilang ingatan, badai kaca eter, atau patroli predator)..."
                        className="w-full p-2.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================= */}
              {/* HISTORY-SPECIFIC RICH EDITOR (ARSIP SEJARAH & KONFLIK KANON)  */}
              {/* ============================================================= */}
              {category === 'history' && (
                <div className="space-y-5">
                  {/* Section 1: Klasifikasi Skala Peristiwa, Era Penanggalan & Lokasi Kejadian */}
                  <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-3.5">
                    <div className="text-xs font-semibold text-[#7A3E1D] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        1. Klasifikasi Skala Peristiwa, Era Penanggalan & Lokasi Kejadian
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                          Jenis / Skala Peristiwa (Filter Direktori Kiri)
                        </label>
                        <select
                          value={
                            draftEntity.attributes.historyEventType ||
                            'Perang Besar & Pengepungan'
                          }
                          onChange={(e) =>
                            setDraftEntity({
                              ...draftEntity,
                              attributes: {
                                ...draftEntity.attributes,
                                historyEventType: e.target.value,
                              },
                            })
                          }
                          className="w-full px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                        >
                          {HISTORY_EVENT_TYPE_FILTERS.filter(
                            (f) => f !== 'Semua'
                          ).map((ht) => (
                            <option key={ht} value={ht}>
                              {ht}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                          Era Penanggalan Sejarah
                        </label>
                        <input
                          type="text"
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
                          placeholder="Contoh: Era Surya Emas / Era Abu (Post-Gerhana)..."
                          className="w-full px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                          Tahun Numerik (Untuk Urutan Otomatis di Tab Kronologi)
                        </label>
                        <input
                          type="number"
                          value={
                            typeof draftEntity.attributes.year === 'number'
                              ? draftEntity.attributes.year
                              : 0
                          }
                          onChange={(e) =>
                            setDraftEntity({
                              ...draftEntity,
                              attributes: {
                                ...draftEntity.attributes,
                                year: Number(e.target.value),
                              },
                            })
                          }
                          placeholder="Contoh: -340 atau 298"
                          className="w-full px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg font-mono-tabular"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#695A47] mb-1">
                          Penanggalan Kanon Lengkap (Label Tanggal)
                        </label>
                        <input
                          type="text"
                          value={draftEntity.attributes.displayDate || ''}
                          onChange={(e) =>
                            setDraftEntity({
                              ...draftEntity,
                              attributes: {
                                ...draftEntity.attributes,
                                displayDate: e.target.value,
                              },
                            })
                          }
                          placeholder="Contoh: Tahun 0 PG — Malam Tanpa Bayangan / Musim Gugur 214 PG"
                          className="w-full px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                        />
                      </div>
                    </div>

                    {/* Hybrid Event Location Picker */}
                    <div>
                      <label className="block text-[11px] font-semibold text-[#264653] mb-1">
                        Lokasi Utama Kejadian / Medan Peristiwa (Pilih dari Wilayah/Negara/Peta atau Ketik Manual)
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <select
                          value={
                            nationAndRegionEntities.some(
                              (nr) =>
                                nr.title ===
                                draftEntity.attributes.eventLocation
                            )
                              ? draftEntity.attributes.eventLocation
                              : '__CUSTOM__'
                          }
                          onChange={(e) => {
                            if (e.target.value !== '__CUSTOM__') {
                              setDraftEntity({
                                ...draftEntity,
                                attributes: {
                                  ...draftEntity.attributes,
                                  eventLocation: e.target.value,
                                },
                              });
                            }
                          }}
                          className="w-full px-2.5 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                        >
                          <option value="__CUSTOM__">
                            -- Pilih dari Daftar Wilayah / Negara / Pin Peta atau Ketik --
                          </option>
                          {regionEntities.map((r) => (
                            <option key={r.id} value={r.title}>
                              [Wilayah] {r.title}
                            </option>
                          ))}
                          {nationEntities.map((n) => (
                            <option key={n.id} value={n.title}>
                              [Negara] {n.title}
                            </option>
                          ))}
                          {(mapStamps || []).map((st) => (
                            <option key={st.id} value={st.label}>
                              [Pin Peta] {st.label}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={draftEntity.attributes.eventLocation || ''}
                          onChange={(e) =>
                            setDraftEntity({
                              ...draftEntity,
                              attributes: {
                                ...draftEntity.attributes,
                                eventLocation: e.target.value,
                              },
                            })
                          }
                          placeholder="Ketik lokasi peristiwa (misal: Kawah Gerhana Merah / Lembah Aethelgard)..."
                          className="w-full px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Pemilih Hibrida Pihak Terlibat (Negara/Kelompok/Ras) & Tokoh Kunci */}
                  <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-3.5">
                    <div className="text-xs font-semibold text-[#9E2A2B] flex items-center gap-1.5">
                      <Swords className="w-3.5 h-3.5" />
                      <span>
                        2. Pihak yang Terlibat (Negara / Kelompok / Ras) & Tokoh Kunci Sejarah
                      </span>
                    </div>

                    {/* Hybrid Belligerents Multi-Picker */}
                    <div className="p-3 rounded-lg bg-[#FBF8F1] border border-[#D8CBB3] space-y-2.5">
                      <label className="block text-[11px] font-semibold text-[#9E2A2B]">
                        Pihak / Fraksi / Negara / Bangsa yang Terlibat (Pilih dari Codex atau Ketik Manual)
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {(draftEntity.attributes.belligerentsList || []).map(
                          (bName) => (
                            <span
                              key={bName}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#EFE7D6] border border-[#9E2A2B]/40 text-xs font-medium text-[#231C14]"
                            >
                              {bName}
                              <button
                                type="button"
                                onClick={() => {
                                  const next = (
                                    draftEntity.attributes.belligerentsList ||
                                    []
                                  ).filter((item) => item !== bName);
                                  setDraftEntity({
                                    ...draftEntity,
                                    attributes: {
                                      ...draftEntity.attributes,
                                      belligerentsList: next,
                                      belligerents: next.join(' vs '),
                                    },
                                  });
                                }}
                                className="text-[#9E2A2B] hover:text-[#231C14] cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          )
                        )}
                      </div>

                      {(nationEntities.length > 0 ||
                        factionEntities.length > 0 ||
                        raceEntities.length > 0) && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[11px] text-[#695A47]">
                            Pilih Cepat Negara / Kelompok / Ras:
                          </span>
                          {[
                            ...nationEntities,
                            ...factionEntities,
                            ...raceEntities,
                          ].map((ent) => {
                            const already = (
                              draftEntity.attributes.belligerentsList || []
                            ).includes(ent.title);
                            return (
                              <button
                                key={ent.id}
                                type="button"
                                onClick={() => {
                                  const current =
                                    draftEntity.attributes.belligerentsList ||
                                    [];
                                  const next = already
                                    ? current.filter((x) => x !== ent.title)
                                    : [...current, ent.title];
                                  setDraftEntity({
                                    ...draftEntity,
                                    attributes: {
                                      ...draftEntity.attributes,
                                      belligerentsList: next,
                                      belligerents: next.join(' vs '),
                                    },
                                  });
                                }}
                                className={`px-2 py-0.5 text-[11px] rounded border cursor-pointer transition-colors ${
                                  already
                                    ? 'bg-[#9E2A2B] text-white border-[#9E2A2B]'
                                    : 'bg-[#F6F1E6] text-[#231C14] border-[#D8CBB3] hover:bg-[#EFE7D6]'
                                }`}
                              >
                                {already ? '✓ ' : '+ '}
                                {ent.title}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      <div className="flex gap-1.5 pt-1">
                        <input
                          type="text"
                          value={customBelligerentInput}
                          onChange={(e) =>
                            setCustomBelligerentInput(e.target.value)
                          }
                          placeholder="Ketik pihak terlibat lain (misal: Armada Bajak Laut Lautan Abu)..."
                          className="flex-1 px-2.5 py-1 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const val = customBelligerentInput.trim();
                            if (!val) return;
                            const current =
                              draftEntity.attributes.belligerentsList || [];
                            if (!current.includes(val)) {
                              const next = [...current, val];
                              setDraftEntity({
                                ...draftEntity,
                                attributes: {
                                  ...draftEntity.attributes,
                                  belligerentsList: next,
                                  belligerents: next.join(' vs '),
                                },
                              });
                            }
                            setCustomBelligerentInput('');
                          }}
                          className="px-3 py-1 text-xs font-semibold bg-[#9E2A2B] text-white rounded cursor-pointer whitespace-nowrap shrink-0"
                        >
                          + Tambah Pihak
                        </button>
                      </div>
                    </div>

                    {/* Hybrid Key Historical Figures Multi-Picker */}
                    <div className="p-3 rounded-lg bg-[#FBF8F1] border border-[#D8CBB3] space-y-2.5">
                      <label className="block text-[11px] font-semibold text-[#8F5B14]">
                        Tokoh Kunci, Panglima, atau Saksi Sejarah (Pilih dari Tab Character atau Ketik Manual)
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {(
                          draftEntity.attributes.keyHistoricalFigures || []
                        ).map((kf) => (
                          <span
                            key={kf}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#EFE7D6] border border-[#8F5B14]/40 text-xs font-medium text-[#231C14]"
                          >
                            {kf}
                            <button
                              type="button"
                              onClick={() =>
                                setDraftEntity({
                                  ...draftEntity,
                                  attributes: {
                                    ...draftEntity.attributes,
                                    keyHistoricalFigures: (
                                      draftEntity.attributes
                                        .keyHistoricalFigures || []
                                    ).filter((item) => item !== kf),
                                  },
                                })
                              }
                              className="text-[#9E2A2B] hover:text-[#231C14] cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>

                      {characterEntities.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[11px] text-[#695A47]">
                            Pilih Cepat dari Tab Character:
                          </span>
                          {characterEntities.map((cEnt) => {
                            const already = (
                              draftEntity.attributes.keyHistoricalFigures || []
                            ).includes(cEnt.title);
                            return (
                              <button
                                key={cEnt.id}
                                type="button"
                                onClick={() => {
                                  const current =
                                    draftEntity.attributes
                                      .keyHistoricalFigures || [];
                                  const next = already
                                    ? current.filter((x) => x !== cEnt.title)
                                    : [...current, cEnt.title];
                                  setDraftEntity({
                                    ...draftEntity,
                                    attributes: {
                                      ...draftEntity.attributes,
                                      keyHistoricalFigures: next,
                                    },
                                  });
                                }}
                                className={`px-2 py-0.5 text-[11px] rounded border cursor-pointer transition-colors ${
                                  already
                                    ? 'bg-[#8F5B14] text-white border-[#8F5B14]'
                                    : 'bg-[#F6F1E6] text-[#231C14] border-[#D8CBB3] hover:bg-[#EFE7D6]'
                                }`}
                              >
                                {already ? '✓ ' : '+ '}
                                {cEnt.title}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      <div className="flex gap-1.5 pt-1">
                        <input
                          type="text"
                          value={customKeyFigureInput}
                          onChange={(e) =>
                            setCustomKeyFigureInput(e.target.value)
                          }
                          placeholder="Ketik tokoh sejarah lain (misal: Kaisar Aurelius I / Kanselir Cassian)..."
                          className="flex-1 px-2.5 py-1 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const val = customKeyFigureInput.trim();
                            if (!val) return;
                            const current =
                              draftEntity.attributes.keyHistoricalFigures || [];
                            if (!current.includes(val)) {
                              setDraftEntity({
                                ...draftEntity,
                                attributes: {
                                  ...draftEntity.attributes,
                                  keyHistoricalFigures: [...current, val],
                                },
                              });
                            }
                            setCustomKeyFigureInput('');
                          }}
                          className="px-3 py-1 text-xs font-semibold bg-[#8F5B14] text-white rounded cursor-pointer whitespace-nowrap shrink-0"
                        >
                          + Tambah Tokoh
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Pemicu Konflik, Dampak Dunia & Sejarah Resmi vs Kebenaran Rahasia */}
                  <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-3.5">
                    <div className="text-xs font-semibold text-[#231C14] flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-[#9E2A2B]" />
                      <span>
                        3. Anatomi Historiografi: Pemicu, Dampak Dunia & Propaganda vs Kebenaran Rahasia
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#7A3E1D] mb-1">
                          Pemicu Awal Peristiwa (Casus Belli / Akar Masalah)
                        </label>
                        <textarea
                          rows={2}
                          value={draftEntity.attributes.historicalTrigger || ''}
                          onChange={(e) =>
                            setDraftEntity({
                              ...draftEntity,
                              attributes: {
                                ...draftEntity.attributes,
                                historicalTrigger: e.target.value,
                              },
                            })
                          }
                          placeholder="Insiden, krisis politik, atau ritual gagal yang menyulut meletusnya peristiwa ini..."
                          className="w-full p-2.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#9E2A2B] mb-1">
                          Korban Jiwa, Kehancuran & Kerugian Besar
                        </label>
                        <textarea
                          rows={2}
                          value={
                            draftEntity.attributes.casualtiesAndLosses || ''
                          }
                          onChange={(e) =>
                            setDraftEntity({
                              ...draftEntity,
                              attributes: {
                                ...draftEntity.attributes,
                                casualtiesAndLosses: e.target.value,
                              },
                            })
                          }
                          placeholder="Kota yang hancur, jumlah legiun gugur, atau pusaka kuno yang hilang..."
                          className="w-full p-2.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#231C14] mb-1">
                          Hasil Akhir Langsung (Outcome)
                        </label>
                        <textarea
                          rows={2}
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
                          placeholder="Siapa yang menang, traktat apa yang ditandatangani, atau perubahan batas negara..."
                          className="w-full p-2.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#264653] mb-1">
                          Dampak Jangka Panjang terhadap Dunia Saat Ini (Legacy)
                        </label>
                        <textarea
                          rows={2}
                          value={draftEntity.attributes.worldImpactLegacy || ''}
                          onChange={(e) =>
                            setDraftEntity({
                              ...draftEntity,
                              attributes: {
                                ...draftEntity.attributes,
                                worldImpactLegacy: e.target.value,
                              },
                            })
                          }
                          placeholder="Bagaimana peristiwa ini masih memengaruhi hukum, trauma bangsa, atau politik di era cerita utama..."
                          className="w-full p-2.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                        />
                      </div>
                    </div>

                    {/* Official Winner History vs Hidden Historical Truth */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#2D5A43] mb-1">
                          Sejarah Resmi Pemenang (Propaganda Publik / Buku Sejarah Istana)
                        </label>
                        <textarea
                          rows={3}
                          value={
                            draftEntity.attributes.officialHistoryVersion || ''
                          }
                          onChange={(e) =>
                            setDraftEntity({
                              ...draftEntity,
                              attributes: {
                                ...draftEntity.attributes,
                                officialHistoryVersion: e.target.value,
                              },
                            })
                          }
                          placeholder="Versi sejarah yang diajarkan kepada rakyat umum atau diklaim oleh penguasa..."
                          className="w-full p-2.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#9E2A2B] mb-1">
                          Kebenaran Rahasia Tersembunyi (Fakta Kanon di Balik Layar)
                        </label>
                        <textarea
                          rows={3}
                          value={
                            draftEntity.attributes.hiddenHistoricalTruth || ''
                          }
                          onChange={(e) =>
                            setDraftEntity({
                              ...draftEntity,
                              attributes: {
                                ...draftEntity.attributes,
                                hiddenHistoricalTruth: e.target.value,
                              },
                            })
                          }
                          placeholder="Apa yang sebenarnya terjadi di balik layar yang disembunyikan dari publik..."
                          className="w-full p-2.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Other Categories Structured Fields */}
              {category === 'encyclopedia' && (
                <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-3">
                  <div className="text-xs font-semibold text-[#9E2A2B]">
                    Parameter Khusus {sectionMeta.label}
                  </div>
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

              {/* Power System Awakening Condition Banner */}
              {category === 'power_system' && activeAttrs.awakeningCondition && (
                <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#5A3E7A]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>
                      Syarat Bangkit (Awakening) & Pembukaan Meridian / Bakat
                    </span>
                  </div>
                  <div className="text-xs text-[#231C14] leading-relaxed">
                    <WikiTextRenderer
                      text={activeAttrs.awakeningCondition}
                      entities={entities}
                      onSelectEntity={jumpToEntity}
                    />
                  </div>
                </div>
              )}

              {/* Skill Visual Manifestation Banner */}
              {category === 'skill' && activeAttrs.visualManifestation && (
                <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#5A3E7A]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>
                      Manifestasi Visual & Fenomena Saat Teknik Diaktifkan
                    </span>
                  </div>
                  <div className="text-xs text-[#231C14] leading-relaxed">
                    <WikiTextRenderer
                      text={activeAttrs.visualManifestation}
                      entities={entities}
                      onSelectEntity={jumpToEntity}
                    />
                  </div>
                </div>
              )}

              {/* Nation National Emblem & Royal Motto Banner */}
              {category === 'nation' && activeAttrs.nationalEmblem && (
                <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#B5832A]">
                    <Crown className="w-3.5 h-3.5" />
                    <span>
                      Lambang Kebesaran Negara & Semboyan Kedaulatan
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-[#231C14] leading-relaxed">
                    {activeAttrs.nationalEmblem}
                  </p>
                </div>
              )}

              {/* Region Sensory Atmosphere & Scene-Setting Banner */}
              {category === 'region' && activeAttrs.sensoryAtmosphere && (
                <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#264653]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>
                      Atmosfer Sensorik, Suasana & Panduan Latar Adegan Novel
                    </span>
                  </div>
                  <div className="text-xs text-[#231C14] leading-relaxed">
                    <WikiTextRenderer
                      text={activeAttrs.sensoryAtmosphere}
                      entities={entities}
                      onSelectEntity={jumpToEntity}
                    />
                  </div>
                </div>
              )}

              {/* History Trigger & Casus Belli Banner */}
              {category === 'history' && activeAttrs.historicalTrigger && (
                <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#7A3E1D]">
                    <Flame className="w-3.5 h-3.5 text-[#9E2A2B]" />
                    <span>
                      Pemicu Awal Peristiwa (Casus Belli) ·{' '}
                      {activeAttrs.displayDate || activeAttrs.era || 'Arsip Sejarah'}
                    </span>
                  </div>
                  <div className="text-xs text-[#231C14] leading-relaxed">
                    <WikiTextRenderer
                      text={activeAttrs.historicalTrigger}
                      entities={entities}
                      onSelectEntity={jumpToEntity}
                    />
                  </div>
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
                            'awakeningCondition',
                            'powerTiersList',
                            'elementBranches',
                            'hardRules',
                            'systemWeakness',
                            'corruptionCost',
                            'exclusiveRaces',
                            'strategicImpact',
                            'visualManifestation',
                            'nationalEmblem',
                            'dominantRaces',
                            'economicCommodities',
                            'militaryStrength',
                            'lawsAndCulture',
                            'diplomaticAllies',
                            'borderConflicts',
                            'sensoryAtmosphere',
                            'landmarksList',
                            'endemicFloraFauna',
                            'localEcologyAndHazards',
                            'belligerentsList',
                            'keyHistoricalFigures',
                            'historicalTrigger',
                            'casualtiesAndLosses',
                            'worldImpactLegacy',
                            'officialHistoryVersion',
                            'hiddenHistoricalTruth',
                          ].includes(key)
                        ) {
                          return false;
                        }
                        if (
                          category === 'history' &&
                          key === 'belligerents' &&
                          activeAttrs.belligerentsList &&
                          activeAttrs.belligerentsList.length > 0
                        ) {
                          return false;
                        }
                        return Array.isArray(val)
                          ? val.length > 0
                          : val !== undefined && val !== null && val !== '';
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
                          governmentType: 'Klasifikasi Pemerintahan',
                          government: 'Struktur Pemerintahan',
                          capitalCity: 'Ibu Kota',
                          ruler: 'Penguasa Saat Ini',
                          stateReligion: 'Kepercayaan Resmi',
                          currency: 'Mata Uang',
                          regionType: 'Tipologi Wilayah',
                          parentNation: 'Kedaulatan Negara Induk',
                          climate: 'Iklim & Cuaca',
                          landmarks: 'Ringkasan Titik Penting',
                          resources: 'Sumber Daya Utama',
                          dangerLevel: 'Tingkat Bahaya Wilayah',
                          linkedMapStampLabel: 'Pin Lokasi di Map Dunia',
                          historyEventType: 'Klasifikasi Skala Peristiwa',
                          era: 'Era Penanggalan',
                          year: 'Urutan Tahun Kronologi',
                          displayDate: 'Penanggalan Kanon',
                          eventLocation: 'Lokasi Kejadian Utama',
                          belligerents: 'Pihak Terlibat',
                          outcome: 'Hasil Akhir Langsung',
                          systemTypology: 'Tipologi Sistem Kekuatan',
                          energySource: 'Sumber Energi Utama',
                          originSource: 'Asal-Usul / Pencipta',
                          catalystMedium: 'Medium Fokus / Penyalur',
                          tierHierarchy: 'Ringkasan Urutan Tingkatan',
                          parentPowerSystem: 'Sistem Kekuatan Induk',
                          skillRank: 'Peringkat / Tier Teknik',
                          elementAffinity: 'Cabang Aliran / Elemen',
                          skillExclusivity: 'Sifat Eksklusivitas',
                          impactScale: 'Skala Cakupan Dampak',
                          activationCost: 'Syarat & Biaya Aktivasi',
                          cooldownOrLimit: 'Batas Penggunaan / Efek Balik',
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
                            : key === 'parentNation'
                            ? 'nation'
                            : key === 'originNation' ||
                              key === 'homeland' ||
                              key === 'headquarters' ||
                              key === 'capitalCity' ||
                              key === 'eventLocation'
                            ? 'region'
                            : key === 'catalystMedium'
                            ? 'encyclopedia'
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

                  {/* Power System Tiers Ladder & Element Branches Interactive Cards */}
                  {category === 'power_system' &&
                    ((activeAttrs.powerTiersList &&
                      activeAttrs.powerTiersList.length > 0) ||
                      (activeAttrs.elementBranches &&
                        activeAttrs.elementBranches.length > 0)) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div className="p-3.5 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-2">
                          <div className="text-xs font-semibold text-[#5A3E7A] flex items-center gap-1.5">
                            <Flame className="w-3.5 h-3.5" />
                            <span>Tangga Tingkatan Kekuatan (Power Tiers)</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {(activeAttrs.powerTiersList || []).map((tier) => (
                              <span
                                key={tier}
                                className="px-2.5 py-1 rounded bg-[#EFE7D6] border border-[#5A3E7A]/40 text-xs font-semibold text-[#231C14]"
                              >
                                {tier}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-2">
                          <div className="text-xs font-semibold text-[#9E2A2B] flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Cabang Aliran & Disiplin Elemen</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {(activeAttrs.elementBranches || []).map((br) => (
                              <span
                                key={br}
                                className="px-2.5 py-1 rounded bg-[#EFE7D6] border border-[#9E2A2B]/40 text-xs font-semibold text-[#231C14]"
                              >
                                {br}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Skill Exclusive Races Interactive Cards */}
                  {category === 'skill' &&
                    activeAttrs.exclusiveRaces &&
                    activeAttrs.exclusiveRaces.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-2">
                        <div className="text-xs font-semibold text-[#2D5A43] flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" />
                          <span>
                            Ras & Garis Darah Pemilik Eksklusif Skill Ini
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {(activeAttrs.exclusiveRaces || []).map((rName) => {
                            const matchedRace = findMatchingEntityByName(
                              rName,
                              'race'
                            );
                            return matchedRace ? (
                              <button
                                key={rName}
                                type="button"
                                onClick={() => jumpToEntity(matchedRace.id)}
                                className="px-2.5 py-1 rounded bg-[#EFE7D6] hover:bg-[#D8CBB3] border border-[#2D5A43]/50 text-xs font-semibold text-[#2D5A43] flex items-center gap-1 cursor-pointer"
                              >
                                <span>{rName}</span>
                                <ArrowUpRight className="w-3 h-3" />
                              </button>
                            ) : (
                              <span
                                key={rName}
                                className="px-2.5 py-1 rounded bg-[#EFE7D6] border border-[#D8CBB3] text-xs font-medium text-[#231C14]"
                              >
                                {rName}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  {/* Nation Dominant Races Interactive Cards */}
                  {category === 'nation' &&
                    activeAttrs.dominantRaces &&
                    activeAttrs.dominantRaces.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-2">
                        <div className="text-xs font-semibold text-[#2D5A43] flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" />
                          <span>
                            Demografi Ras Mayoritas & Komposisi Penduduk
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {(activeAttrs.dominantRaces || []).map((rName) => {
                            const matchedRace = findMatchingEntityByName(
                              rName,
                              'race'
                            );
                            return matchedRace ? (
                              <button
                                key={rName}
                                type="button"
                                onClick={() => jumpToEntity(matchedRace.id)}
                                className="px-2.5 py-1 rounded bg-[#EFE7D6] hover:bg-[#D8CBB3] border border-[#2D5A43]/50 text-xs font-semibold text-[#2D5A43] flex items-center gap-1 cursor-pointer"
                              >
                                <span>{rName}</span>
                                <ArrowUpRight className="w-3 h-3" />
                              </button>
                            ) : (
                              <span
                                key={rName}
                                className="px-2.5 py-1 rounded bg-[#EFE7D6] border border-[#D8CBB3] text-xs font-medium text-[#231C14]"
                              >
                                {rName}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  {/* Region Landmarks List & Endemic Flora/Fauna Interactive Cards */}
                  {category === 'region' &&
                    ((activeAttrs.landmarksList &&
                      activeAttrs.landmarksList.length > 0) ||
                      (activeAttrs.endemicFloraFauna &&
                        activeAttrs.endemicFloraFauna.length > 0)) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div className="p-3.5 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-2">
                          <div className="text-xs font-semibold text-[#264653] flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>
                              Titik Penting (Landmark), Distrik & Reruntuhan
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {(activeAttrs.landmarksList || []).map((lm) => (
                              <span
                                key={lm}
                                className="px-2.5 py-1 rounded bg-[#EFE7D6] border border-[#264653]/40 text-xs font-semibold text-[#231C14]"
                              >
                                {lm}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-2">
                          <div className="text-xs font-semibold text-[#2D5A43] flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>
                              Flora, Fauna & Pusaka Endemik Wilayah Ini
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {(activeAttrs.endemicFloraFauna || []).map((ef) => {
                              const matchedEnc = findMatchingEntityByName(
                                ef,
                                'encyclopedia'
                              );
                              return matchedEnc ? (
                                <button
                                  key={ef}
                                  type="button"
                                  onClick={() => jumpToEntity(matchedEnc.id)}
                                  className="px-2.5 py-1 rounded bg-[#EFE7D6] hover:bg-[#D8CBB3] border border-[#2D5A43]/50 text-xs font-semibold text-[#2D5A43] flex items-center gap-1 cursor-pointer"
                                >
                                  <span>{ef}</span>
                                  <ArrowUpRight className="w-3 h-3" />
                                </button>
                              ) : (
                                <span
                                  key={ef}
                                  className="px-2.5 py-1 rounded bg-[#EFE7D6] border border-[#D8CBB3] text-xs font-medium text-[#231C14]"
                                >
                                  {ef}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                  {/* History Belligerents & Key Figures Interactive Cards */}
                  {category === 'history' &&
                    ((activeAttrs.belligerentsList &&
                      activeAttrs.belligerentsList.length > 0) ||
                      (activeAttrs.keyHistoricalFigures &&
                        activeAttrs.keyHistoricalFigures.length > 0)) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div className="p-3.5 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-2">
                          <div className="text-xs font-semibold text-[#9E2A2B] flex items-center gap-1.5">
                            <Swords className="w-3.5 h-3.5" />
                            <span>
                              Pihak, Negara & Kelompok yang Terlibat
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {(activeAttrs.belligerentsList || []).map((bel) => {
                              const matchedBel = findMatchingEntityByName(bel);
                              return matchedBel ? (
                                <button
                                  key={bel}
                                  type="button"
                                  onClick={() => jumpToEntity(matchedBel.id)}
                                  className="px-2.5 py-1 rounded bg-[#EFE7D6] hover:bg-[#D8CBB3] border border-[#9E2A2B]/50 text-xs font-semibold text-[#9E2A2B] flex items-center gap-1 cursor-pointer"
                                >
                                  <span>{bel}</span>
                                  <ArrowUpRight className="w-3 h-3" />
                                </button>
                              ) : (
                                <span
                                  key={bel}
                                  className="px-2.5 py-1 rounded bg-[#EFE7D6] border border-[#D8CBB3] text-xs font-medium text-[#231C14]"
                                >
                                  {bel}
                                </span>
                              );
                            })}
                          </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-2">
                          <div className="text-xs font-semibold text-[#8F5B14] flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5" />
                            <span>
                              Tokoh Kunci, Panglima & Saksi Sejarah
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {(activeAttrs.keyHistoricalFigures || []).map(
                              (kf) => {
                                const matchedChar = findMatchingEntityByName(
                                  kf,
                                  'character'
                                );
                                return matchedChar ? (
                                  <button
                                    key={kf}
                                    type="button"
                                    onClick={() => jumpToEntity(matchedChar.id)}
                                    className="px-2.5 py-1 rounded bg-[#EFE7D6] hover:bg-[#D8CBB3] border border-[#8F5B14]/50 text-xs font-semibold text-[#8F5B14] flex items-center gap-1 cursor-pointer"
                                  >
                                    <span>{kf}</span>
                                    <ArrowUpRight className="w-3 h-3" />
                                  </button>
                                ) : (
                                  <span
                                    key={kf}
                                    className="px-2.5 py-1 rounded bg-[#EFE7D6] border border-[#D8CBB3] text-xs font-medium text-[#231C14]"
                                  >
                                    {kf}
                                  </span>
                                );
                              }
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                </div>
              </div>

              {/* ============================================================= */}
              {/* SKILL STRATEGIC / LARGE-SCALE IMPACT                          */}
              {/* ============================================================= */}
              {category === 'skill' && activeAttrs.strategicImpact && (
                <div className="pt-4 border-t border-[#D8CBB3] space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#9E2A2B]">
                    <Flame className="w-4 h-4" />
                    <span>
                      Dampak Skala Besar & Efek Strategis Medan Tempur ({activeAttrs.impactScale || 'Skala Khusus'})
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] text-xs text-[#231C14] leading-relaxed">
                    <WikiTextRenderer
                      text={activeAttrs.strategicImpact}
                      entities={entities}
                      onSelectEntity={jumpToEntity}
                    />
                  </div>
                </div>
              )}

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

              {/* ============================================================= */}
              {/* POWER SYSTEM HARD RULES, COUNTER-WEAKNESS & CORRUPTION COST   */}
              {/* ============================================================= */}
              {category === 'power_system' &&
                (activeAttrs.hardRules ||
                  activeAttrs.corruptionCost ||
                  activeAttrs.systemWeakness) && (
                  <div className="pt-4 border-t border-[#D8CBB3] space-y-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#5A3E7A]">
                      <ShieldCheck className="w-4 h-4" />
                      <span>
                        Arsitektur Hukum Besi (Hard Magic Rules), Penangkal & Harga Kekuatan
                      </span>
                    </div>

                    {activeAttrs.hardRules && (
                      <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-1.5">
                        <div className="text-xs font-semibold text-[#2D5A43] flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>
                            Hukum Besi & Batasan Mutlak (Hard Magic Rules)
                          </span>
                        </div>
                        <div className="text-xs text-[#231C14] leading-relaxed">
                          <WikiTextRenderer
                            text={activeAttrs.hardRules}
                            entities={entities}
                            onSelectEntity={jumpToEntity}
                          />
                        </div>
                      </div>
                    )}

                    {(activeAttrs.corruptionCost ||
                      activeAttrs.systemWeakness) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-[#EFE7D6]/75 border border-[#D8CBB3] space-y-1.5">
                          <div className="text-xs font-semibold text-[#9E2A2B] flex items-center gap-1.5">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>
                              Risiko Over-Resonansi & Harga Kekuatan (Backlash)
                            </span>
                          </div>
                          <div className="text-xs text-[#231C14] leading-relaxed">
                            <WikiTextRenderer
                              text={
                                activeAttrs.corruptionCost || 'Belum diisi.'
                              }
                              entities={entities}
                              onSelectEntity={jumpToEntity}
                            />
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-[#EFE7D6]/75 border border-[#D8CBB3] space-y-1.5">
                          <div className="text-xs font-semibold text-[#231C14]">
                            Kelemahan Lingkungan & Material Penangkal (Counter)
                          </div>
                          <div className="text-xs text-[#695A47] leading-relaxed">
                            <WikiTextRenderer
                              text={
                                activeAttrs.systemWeakness || 'Belum diisi.'
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
              {/* NATION ECONOMY, MILITARY, LAWS & DIPLOMACY / BORDER CONFLICTS */}
              {/* ============================================================= */}
              {category === 'nation' &&
                (activeAttrs.economicCommodities ||
                  activeAttrs.militaryStrength ||
                  activeAttrs.lawsAndCulture ||
                  activeAttrs.diplomaticAllies ||
                  activeAttrs.borderConflicts) && (
                  <div className="pt-4 border-t border-[#D8CBB3] space-y-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#B5832A]">
                      <Crown className="w-4 h-4" />
                      <span>
                        Dossier Geopolitik: Ekonomi, Militer, Hukum & Peta Diplomasi Negara
                      </span>
                    </div>

                    {/* Economic Commodities vs Military Strength */}
                    {(activeAttrs.economicCommodities ||
                      activeAttrs.militaryStrength) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-1.5">
                          <div className="text-xs font-semibold text-[#8F5B14] flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>
                              Komoditas Ekonomi Utama & Jalur Perdagangan
                            </span>
                          </div>
                          <div className="text-xs text-[#231C14] leading-relaxed">
                            <WikiTextRenderer
                              text={
                                activeAttrs.economicCommodities ||
                                'Belum diisi.'
                              }
                              entities={entities}
                              onSelectEntity={jumpToEntity}
                            />
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-1.5">
                          <div className="text-xs font-semibold text-[#9E2A2B] flex items-center gap-1.5">
                            <Swords className="w-3.5 h-3.5" />
                            <span>
                              Kekuatan Militer, Legiun Elit & Pertahanan Negara
                            </span>
                          </div>
                          <div className="text-xs text-[#231C14] leading-relaxed">
                            <WikiTextRenderer
                              text={
                                activeAttrs.militaryStrength || 'Belum diisi.'
                              }
                              entities={entities}
                              onSelectEntity={jumpToEntity}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Laws & Culture */}
                    {activeAttrs.lawsAndCulture && (
                      <div className="p-4 rounded-xl bg-[#EFE7D6]/75 border border-[#D8CBB3] space-y-1.5">
                        <div className="text-xs font-semibold text-[#231C14] flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#B5832A]" />
                          <span>
                            Hukum Utama Kerajaan, Konstitusi & Adat Budaya Masyarakat
                          </span>
                        </div>
                        <div className="text-xs text-[#231C14] leading-relaxed">
                          <WikiTextRenderer
                            text={activeAttrs.lawsAndCulture}
                            entities={entities}
                            onSelectEntity={jumpToEntity}
                          />
                        </div>
                      </div>
                    )}

                    {/* Diplomatic Allies vs Border Conflicts */}
                    {(activeAttrs.diplomaticAllies ||
                      activeAttrs.borderConflicts) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-1.5">
                          <div className="text-xs font-semibold text-[#2D5A43]">
                            Aliansi Diplomatik & Perjanjian Dagang Internasional
                          </div>
                          <div className="text-xs text-[#695A47] leading-relaxed">
                            <WikiTextRenderer
                              text={
                                activeAttrs.diplomaticAllies || 'Belum diisi.'
                              }
                              entities={entities}
                              onSelectEntity={jumpToEntity}
                            />
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-1.5">
                          <div className="text-xs font-semibold text-[#9E2A2B] flex items-center gap-1.5">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>
                              Rival Geopolitik, Sengketa & Konflik Perbatasan
                            </span>
                          </div>
                          <div className="text-xs text-[#695A47] leading-relaxed">
                            <WikiTextRenderer
                              text={
                                activeAttrs.borderConflicts || 'Belum diisi.'
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
              {/* REGION ECOLOGY, MONSTERS & ENVIRONMENTAL HAZARDS DOSSIER      */}
              {/* ============================================================= */}
              {category === 'region' && activeAttrs.localEcologyAndHazards && (
                <div className="pt-4 border-t border-[#D8CBB3] space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#9E2A2B]">
                    <ShieldAlert className="w-4 h-4" />
                    <span>
                      Ekologi Monster, Anomali Magis & Bahaya Medan ({activeAttrs.dangerLevel || 'Bahaya Wilayah'})
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] text-xs text-[#231C14] leading-relaxed">
                    <WikiTextRenderer
                      text={activeAttrs.localEcologyAndHazards}
                      entities={entities}
                      onSelectEntity={jumpToEntity}
                    />
                  </div>
                </div>
              )}

              {/* ============================================================= */}
              {/* HISTORY OFFICIAL WINNER VERSION VS HIDDEN TRUTH & LEGACY      */}
              {/* ============================================================= */}
              {category === 'history' &&
                (activeAttrs.officialHistoryVersion ||
                  activeAttrs.hiddenHistoricalTruth ||
                  activeAttrs.casualtiesAndLosses ||
                  activeAttrs.worldImpactLegacy) && (
                  <div className="pt-4 border-t border-[#D8CBB3] space-y-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#7A3E1D]">
                      <BookOpen className="w-4 h-4 text-[#9E2A2B]" />
                      <span>
                        Dossier Historiografi: Sejarah Resmi Pemenang vs Kebenaran Rahasia & Dampak Dunia
                      </span>
                    </div>

                    {/* Official Winner History vs Hidden Canonical Truth */}
                    {(activeAttrs.officialHistoryVersion ||
                      activeAttrs.hiddenHistoricalTruth) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-1.5">
                          <div className="text-xs font-semibold text-[#2D5A43] flex items-center gap-1.5">
                            <Crown className="w-3.5 h-3.5" />
                            <span>
                              Sejarah Resmi Pemenang (Propaganda Publik / Kronik Istana)
                            </span>
                          </div>
                          <div className="text-xs text-[#231C14] leading-relaxed">
                            <WikiTextRenderer
                              text={
                                activeAttrs.officialHistoryVersion ||
                                'Belum diisi.'
                              }
                              entities={entities}
                              onSelectEntity={jumpToEntity}
                            />
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-1.5">
                          <div className="text-xs font-semibold text-[#9E2A2B] flex items-center gap-1.5">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>
                              Kebenaran Rahasia Tersembunyi (Fakta Kanon di Balik Layar)
                            </span>
                          </div>
                          <div className="text-xs text-[#231C14] leading-relaxed">
                            <WikiTextRenderer
                              text={
                                activeAttrs.hiddenHistoricalTruth ||
                                'Belum diisi.'
                              }
                              entities={entities}
                              onSelectEntity={jumpToEntity}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Casualties & Losses vs Long-Term World Impact Legacy */}
                    {(activeAttrs.casualtiesAndLosses ||
                      activeAttrs.worldImpactLegacy) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-[#EFE7D6]/75 border border-[#D8CBB3] space-y-1.5">
                          <div className="text-xs font-semibold text-[#9E2A2B] flex items-center gap-1.5">
                            <Swords className="w-3.5 h-3.5" />
                            <span>
                              Korban Jiwa, Kehancuran & Kerugian Besar
                            </span>
                          </div>
                          <div className="text-xs text-[#231C14] leading-relaxed">
                            <WikiTextRenderer
                              text={
                                activeAttrs.casualtiesAndLosses ||
                                'Belum diisi.'
                              }
                              entities={entities}
                              onSelectEntity={jumpToEntity}
                            />
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-[#EFE7D6]/75 border border-[#D8CBB3] space-y-1.5">
                          <div className="text-xs font-semibold text-[#264653] flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5" />
                            <span>
                              Dampak Jangka Panjang terhadap Dunia Saat Ini (Legacy)
                            </span>
                          </div>
                          <div className="text-xs text-[#231C14] leading-relaxed">
                            <WikiTextRenderer
                              text={
                                activeAttrs.worldImpactLegacy || 'Belum diisi.'
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
              {/* AUTOMATIC ROSTER OF DERIVED SKILLS & PRACTITIONERS (POWER)    */}
              {/* ============================================================= */}
              {category === 'power_system' && (
                <div className="pt-4 border-t border-[#D8CBB3] space-y-5">
                  {/* Derived Skills Section */}
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#231C14]">
                        <Swords className="w-4 h-4 text-[#5A3E7A]" />
                        <span>
                          Daftar Teknik & Skill Turunan {activeEntity.title} (
                          {skillsOfActivePowerSystem.length})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleCreateSkillFromPowerSystem(activeEntity)
                        }
                        className="px-3.5 py-1.5 text-xs font-semibold bg-[#231C14] text-[#FBF8F1] rounded-lg hover:bg-[#3A2E21] flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#B5832A]" />
                        + Buat Skill dari Sistem Ini
                      </button>
                    </div>

                    {skillsOfActivePowerSystem.length === 0 ? (
                      <div className="p-3.5 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] text-xs text-[#695A47]">
                        Belum ada teknik di tab <strong>Skill</strong> yang
                        tercatat di bawah sistem kekuatan ini. Klik{' '}
                        <strong>+ Buat Skill dari Sistem Ini</strong> untuk
                        merancang jurus baru secara instan.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {skillsOfActivePowerSystem.map((sk) => {
                          const sAttrs = getEnrichedAttributes(sk);
                          return (
                            <button
                              key={sk.id}
                              type="button"
                              onClick={() => jumpToEntity(sk.id)}
                              className="text-left p-3.5 rounded-xl bg-[#F6F1E6] hover:bg-[#EFE7D6] border border-[#D8CBB3] transition-colors space-y-1 cursor-pointer"
                            >
                              <div className="flex items-center justify-between text-[11px] font-semibold text-[#5A3E7A]">
                                <span>
                                  {sAttrs.skillRank || 'Teknik Kanon'}
                                </span>
                                <span>
                                  {sAttrs.elementAffinity || 'Aliran Umum'}
                                </span>
                              </div>
                              <div className="font-display text-base font-bold text-[#231C14] flex items-center justify-between gap-2">
                                <span className="truncate">{sk.title}</span>
                                <ArrowUpRight className="w-3.5 h-3.5 text-[#9E2A2B] shrink-0" />
                              </div>
                              <p className="text-xs text-[#695A47] line-clamp-2">
                                {sk.summary}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Practitioners Section */}
                  {practitionersOfActivePowerSystem.length > 0 && (
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#231C14]">
                        <Users className="w-4 h-4 text-[#9E2A2B]" />
                        <span>
                          Praktisi & Pengguna Tercatat (
                          {practitionersOfActivePowerSystem.length})
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {practitionersOfActivePowerSystem.map((prac) => {
                          const pAttrs = getEnrichedAttributes(prac);
                          return (
                            <button
                              key={prac.id}
                              type="button"
                              onClick={() => jumpToEntity(prac.id)}
                              className="text-left p-3 rounded-xl bg-[#F6F1E6] hover:bg-[#EFE7D6] border border-[#D8CBB3] transition-colors flex items-center gap-3 cursor-pointer"
                            >
                              {prac.imageUrl ? (
                                <img
                                  src={prac.imageUrl}
                                  alt={prac.title}
                                  referrerPolicy="no-referrer"
                                  className="w-10 h-10 rounded-lg object-cover border border-[#D8CBB3] shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-[#EFE7D6] border border-[#D8CBB3] flex items-center justify-center shrink-0">
                                  <User className="w-4 h-4 text-[#9E2A2B]" />
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <div className="font-display text-sm font-bold text-[#231C14] truncate flex items-center gap-1">
                                  <span className="truncate">{prac.title}</span>
                                  <ArrowUpRight className="w-3 h-3 text-[#9E2A2B] shrink-0" />
                                </div>
                                <div className="text-[11px] text-[#695A47] truncate">
                                  {pAttrs.powerTier || prac.subtitle}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ============================================================= */}
              {/* AUTOMATIC ROSTER OF RACES & CHARACTER PRACTITIONERS (SKILL)   */}
              {/* ============================================================= */}
              {category === 'skill' && (
                <div className="pt-4 border-t border-[#D8CBB3] space-y-5">
                  {/* Races Possessing This Skill */}
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#231C14]">
                        <Globe className="w-4 h-4 text-[#2D5A43]" />
                        <span>
                          Ras & Garis Darah Penguasa Skill Ini (
                          {racesOfActiveSkill.length})
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <select
                          value={selectedQuickRaceId}
                          onChange={(e) =>
                            setSelectedQuickRaceId(e.target.value)
                          }
                          className="px-2.5 py-1 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg text-[#231C14]"
                        >
                          <option value="">-- Pilih Ras --</option>
                          {raceEntities.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.title}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          disabled={!selectedQuickRaceId}
                          onClick={() => {
                            if (!selectedQuickRaceId) return;
                            handleLinkSkillToRace(
                              activeEntity,
                              selectedQuickRaceId
                            );
                          }}
                          className="px-3 py-1 text-xs font-semibold bg-[#2D5A43] text-white rounded-lg disabled:opacity-40 cursor-pointer whitespace-nowrap shrink-0"
                        >
                          + Tautkan ke Ras
                        </button>
                      </div>
                    </div>

                    {racesOfActiveSkill.length === 0 ? (
                      <div className="p-3.5 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] text-xs text-[#695A47]">
                        Belum ada entitas <strong>Ras</strong> yang tercatat
                        mewarisi skill ini secara eksklusif. Pilih ras di atas
                        dan klik <strong>+ Tautkan ke Ras</strong> bila skill
                        ini adalah keahlian rasial.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {racesOfActiveSkill.map((rc) => {
                          const rAttrs = getEnrichedAttributes(rc);
                          return (
                            <button
                              key={rc.id}
                              type="button"
                              onClick={() => jumpToEntity(rc.id)}
                              className="text-left p-3.5 rounded-xl bg-[#F6F1E6] hover:bg-[#EFE7D6] border border-[#D8CBB3] transition-colors space-y-1 cursor-pointer"
                            >
                              <div className="text-[11px] font-semibold text-[#2D5A43]">
                                {rAttrs.raceOriginClass || 'Ras Kanon'} ·{' '}
                                {rAttrs.homeland || 'Habitat Asal'}
                              </div>
                              <div className="font-display text-base font-bold text-[#231C14] flex items-center justify-between gap-2">
                                <span className="truncate">{rc.title}</span>
                                <ArrowUpRight className="w-3.5 h-3.5 text-[#9E2A2B] shrink-0" />
                              </div>
                              <p className="text-xs text-[#695A47] line-clamp-1">
                                {rc.subtitle}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Character Practitioners Mastering This Skill */}
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#231C14]">
                        <Users className="w-4 h-4 text-[#9E2A2B]" />
                        <span>
                          Tokoh Praktisi yang Menguasai Skill Ini (
                          {practitionersOfActiveSkill.length})
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <select
                          value={selectedQuickCharId}
                          onChange={(e) =>
                            setSelectedQuickCharId(e.target.value)
                          }
                          className="px-2.5 py-1 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg text-[#231C14]"
                        >
                          <option value="">-- Pilih Tokoh --</option>
                          {characterEntities.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.title}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          disabled={!selectedQuickCharId}
                          onClick={() => {
                            if (!selectedQuickCharId) return;
                            handleLinkSkillToCharacter(
                              activeEntity,
                              selectedQuickCharId
                            );
                          }}
                          className="px-3 py-1 text-xs font-semibold bg-[#231C14] text-[#FBF8F1] rounded-lg disabled:opacity-40 cursor-pointer whitespace-nowrap shrink-0"
                        >
                          + Tautkan ke Tokoh
                        </button>
                      </div>
                    </div>

                    {practitionersOfActiveSkill.length === 0 ? (
                      <div className="p-3.5 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] text-xs text-[#695A47]">
                        Belum ada tokoh di tab <strong>Character</strong> yang
                        tercatat menguasai skill ini. Pilih tokoh di atas dan
                        klik <strong>+ Tautkan ke Tokoh</strong>.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {practitionersOfActiveSkill.map((prac) => {
                          const pAttrs = getEnrichedAttributes(prac);
                          return (
                            <button
                              key={prac.id}
                              type="button"
                              onClick={() => jumpToEntity(prac.id)}
                              className="text-left p-3 rounded-xl bg-[#F6F1E6] hover:bg-[#EFE7D6] border border-[#D8CBB3] transition-colors flex items-center gap-3 cursor-pointer"
                            >
                              {prac.imageUrl ? (
                                <img
                                  src={prac.imageUrl}
                                  alt={prac.title}
                                  referrerPolicy="no-referrer"
                                  className="w-10 h-10 rounded-lg object-cover border border-[#D8CBB3] shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-[#EFE7D6] border border-[#D8CBB3] flex items-center justify-center shrink-0">
                                  <User className="w-4 h-4 text-[#9E2A2B]" />
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <div className="font-display text-sm font-bold text-[#231C14] truncate flex items-center gap-1">
                                  <span className="truncate">{prac.title}</span>
                                  <ArrowUpRight className="w-3 h-3 text-[#9E2A2B] shrink-0" />
                                </div>
                                <div className="text-[11px] text-[#695A47] truncate">
                                  {pAttrs.raceName
                                    ? `${pAttrs.raceName} · `
                                    : ''}
                                  {pAttrs.powerTier || prac.subtitle}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ============================================================= */}
              {/* AUTOMATIC ROSTER OF REGIONS, FACTIONS & CITIZENS (NATION)     */}
              {/* ============================================================= */}
              {category === 'nation' && (
                <div className="pt-4 border-t border-[#D8CBB3] space-y-5">
                  {/* Regions / Provinces under this Nation */}
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#231C14]">
                        <MapPin className="w-4 h-4 text-[#264653]" />
                        <span>
                          Daftar Wilayah, Provinsi & Kota di Bawah Kedaulatan{' '}
                          {activeEntity.title} ({regionsOfActiveNation.length})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleCreateRegionFromNation(activeEntity)
                        }
                        className="px-3.5 py-1.5 text-xs font-semibold bg-[#231C14] text-[#FBF8F1] rounded-lg hover:bg-[#3A2E21] flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#B5832A]" />
                        + Buat Wilayah di Negara Ini
                      </button>
                    </div>

                    {regionsOfActiveNation.length === 0 ? (
                      <div className="p-3.5 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] text-xs text-[#695A47]">
                        Belum ada entri di tab <strong>Wilayah</strong> yang
                        tercatat berada di bawah kedaulatan negara ini. Klik{' '}
                        <strong>+ Buat Wilayah di Negara Ini</strong> untuk
                        menambahkan kota, provinsi, atau benteng baru secara
                        instan.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {regionsOfActiveNation.map((reg) => {
                          const regAttrs = getEnrichedAttributes(reg);
                          return (
                            <button
                              key={reg.id}
                              type="button"
                              onClick={() => jumpToEntity(reg.id)}
                              className="text-left p-3.5 rounded-xl bg-[#F6F1E6] hover:bg-[#EFE7D6] border border-[#D8CBB3] transition-colors space-y-1 cursor-pointer"
                            >
                              <div className="flex items-center justify-between text-[11px] font-semibold text-[#264653]">
                                <span>
                                  {regAttrs.climate || 'Zona Geografis'}
                                </span>
                                <span>
                                  {regAttrs.dangerLevel || 'Wilayah Kanon'}
                                </span>
                              </div>
                              <div className="font-display text-base font-bold text-[#231C14] flex items-center justify-between gap-2">
                                <span className="truncate">{reg.title}</span>
                                <ArrowUpRight className="w-3.5 h-3.5 text-[#9E2A2B] shrink-0" />
                              </div>
                              <p className="text-xs text-[#695A47] line-clamp-2">
                                {reg.summary}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Factions / Organizations operating in this Nation */}
                  {factionsOfActiveNation.length > 0 && (
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#231C14]">
                        <Compass className="w-4 h-4 text-[#8F5B14]" />
                        <span>
                          Kelompok, Ordo & Organisasi yang Beroperasi di Negara Ini (
                          {factionsOfActiveNation.length})
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {factionsOfActiveNation.map((fac) => {
                          const fAttrs = getEnrichedAttributes(fac);
                          return (
                            <button
                              key={fac.id}
                              type="button"
                              onClick={() => jumpToEntity(fac.id)}
                              className="text-left p-3.5 rounded-xl bg-[#F6F1E6] hover:bg-[#EFE7D6] border border-[#D8CBB3] transition-colors space-y-1 cursor-pointer"
                            >
                              <div className="text-[11px] font-semibold text-[#8F5B14] truncate">
                                {fAttrs.factionType || 'Organisasi'} · Markas:{' '}
                                {fAttrs.headquarters || 'Tersembunyi'}
                              </div>
                              <div className="font-display text-base font-bold text-[#231C14] flex items-center justify-between gap-2">
                                <span className="truncate">{fac.title}</span>
                                <ArrowUpRight className="w-3.5 h-3.5 text-[#9E2A2B] shrink-0" />
                              </div>
                              <p className="text-xs text-[#695A47] line-clamp-1">
                                {fac.subtitle}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Citizens / Characters from this Nation */}
                  {citizensOfActiveNation.length > 0 && (
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#231C14]">
                        <Users className="w-4 h-4 text-[#9E2A2B]" />
                        <span>
                          Penguasa, Bangsawan & Tokoh Asal {activeEntity.title}{' '}
                          ({citizensOfActiveNation.length})
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {citizensOfActiveNation.map((cit) => {
                          const cAttrs = getEnrichedAttributes(cit);
                          return (
                            <button
                              key={cit.id}
                              type="button"
                              onClick={() => jumpToEntity(cit.id)}
                              className="text-left p-3 rounded-xl bg-[#F6F1E6] hover:bg-[#EFE7D6] border border-[#D8CBB3] transition-colors flex items-center gap-3 cursor-pointer"
                            >
                              {cit.imageUrl ? (
                                <img
                                  src={cit.imageUrl}
                                  alt={cit.title}
                                  referrerPolicy="no-referrer"
                                  className="w-10 h-10 rounded-lg object-cover border border-[#D8CBB3] shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-[#EFE7D6] border border-[#D8CBB3] flex items-center justify-center shrink-0">
                                  <User className="w-4 h-4 text-[#9E2A2B]" />
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <div className="font-display text-sm font-bold text-[#231C14] truncate flex items-center gap-1">
                                  <span className="truncate">{cit.title}</span>
                                  <ArrowUpRight className="w-3 h-3 text-[#9E2A2B] shrink-0" />
                                </div>
                                <div className="text-[11px] text-[#695A47] truncate">
                                  {cAttrs.role || 'Tokoh'} ·{' '}
                                  {cAttrs.originNation || cit.subtitle}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ============================================================= */}
              {/* AUTOMATIC ROSTER OF MAP PINS, FACTIONS & CHARACTERS (REGION)  */}
              {/* ============================================================= */}
              {category === 'region' && (
                <div className="pt-4 border-t border-[#D8CBB3] space-y-5">
                  {/* Map Stamps / Coordinates linked to this Region */}
                  {mapStampsOfActiveRegion.length > 0 && (
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#231C14]">
                        <MapPin className="w-4 h-4 text-[#264653]" />
                        <span>
                          Titik Pin & Koordinat di Map Dunia (
                          {mapStampsOfActiveRegion.length})
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {mapStampsOfActiveRegion.map((st) => (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() => onOpenMapAtStamp(st.id)}
                            className="text-left p-3.5 rounded-xl bg-[#F6F1E6] hover:bg-[#EFE7D6] border border-[#D8CBB3] transition-colors flex items-center justify-between gap-3 cursor-pointer"
                          >
                            <div className="min-w-0">
                              <div className="text-[11px] font-semibold text-[#264653]">
                                Pin Peta Dunia · Koordinat X:{Math.round(st.x)}%
                                , Y:{Math.round(st.y)}%
                              </div>
                              <div className="font-display text-base font-bold text-[#231C14] truncate">
                                {st.label}
                              </div>
                            </div>
                            <span className="px-2.5 py-1 rounded bg-[#231C14] text-[#FBF8F1] text-[11px] font-semibold whitespace-nowrap shrink-0 flex items-center gap-1">
                              <span>Buka di Peta</span>
                              <ArrowUpRight className="w-3 h-3 text-[#B5832A]" />
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Factions / Organizations headquartered or operating in this Region */}
                  {factionsOfActiveRegion.length > 0 && (
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#231C14]">
                        <Compass className="w-4 h-4 text-[#8F5B14]" />
                        <span>
                          Kelompok & Organisasi yang Bermarkas / Beroperasi di{' '}
                          {activeEntity.title} ({factionsOfActiveRegion.length})
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {factionsOfActiveRegion.map((fac) => {
                          const fAttrs = getEnrichedAttributes(fac);
                          return (
                            <button
                              key={fac.id}
                              type="button"
                              onClick={() => jumpToEntity(fac.id)}
                              className="text-left p-3.5 rounded-xl bg-[#F6F1E6] hover:bg-[#EFE7D6] border border-[#D8CBB3] transition-colors space-y-1 cursor-pointer"
                            >
                              <div className="text-[11px] font-semibold text-[#8F5B14] truncate">
                                {fAttrs.factionType || 'Organisasi'} · Pemimpin:{' '}
                                {fAttrs.leader || 'Dewan'}
                              </div>
                              <div className="font-display text-base font-bold text-[#231C14] flex items-center justify-between gap-2">
                                <span className="truncate">{fac.title}</span>
                                <ArrowUpRight className="w-3.5 h-3.5 text-[#9E2A2B] shrink-0" />
                              </div>
                              <p className="text-xs text-[#695A47] line-clamp-1">
                                {fac.subtitle}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Characters originating from or active in this Region */}
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#231C14]">
                        <Users className="w-4 h-4 text-[#9E2A2B]" />
                        <span>
                          Tokoh & Karakter Terkait Wilayah {activeEntity.title}{' '}
                          ({charactersOfActiveRegion.length})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleCreateCharacterFromRegion(activeEntity)
                        }
                        className="px-3.5 py-1.5 text-xs font-semibold bg-[#231C14] text-[#FBF8F1] rounded-lg hover:bg-[#3A2E21] flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-[#B5832A]" />
                        + Buat Karakter di Wilayah Ini
                      </button>
                    </div>

                    {charactersOfActiveRegion.length === 0 ? (
                      <div className="p-3.5 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] text-xs text-[#695A47]">
                        Belum ada tokoh di tab <strong>Character</strong> yang
                        tercatat berasal dari atau berada di wilayah ini. Klik{' '}
                        <strong>+ Buat Karakter di Wilayah Ini</strong> untuk
                        menambahkan tokoh lokal baru secara instan.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {charactersOfActiveRegion.map((char) => {
                          const cAttrs = getEnrichedAttributes(char);
                          return (
                            <button
                              key={char.id}
                              type="button"
                              onClick={() => jumpToEntity(char.id)}
                              className="text-left p-3 rounded-xl bg-[#F6F1E6] hover:bg-[#EFE7D6] border border-[#D8CBB3] transition-colors flex items-center gap-3 cursor-pointer"
                            >
                              {char.imageUrl ? (
                                <img
                                  src={char.imageUrl}
                                  alt={char.title}
                                  referrerPolicy="no-referrer"
                                  className="w-10 h-10 rounded-lg object-cover border border-[#D8CBB3] shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-[#EFE7D6] border border-[#D8CBB3] flex items-center justify-center shrink-0">
                                  <User className="w-4 h-4 text-[#9E2A2B]" />
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <div className="font-display text-sm font-bold text-[#231C14] truncate flex items-center gap-1">
                                  <span className="truncate">{char.title}</span>
                                  <ArrowUpRight className="w-3 h-3 text-[#9E2A2B] shrink-0" />
                                </div>
                                <div className="text-[11px] text-[#695A47] truncate">
                                  {cAttrs.role || 'Tokoh'} ·{' '}
                                  {cAttrs.raceName || char.subtitle}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ============================================================= */}
              {/* HISTORY TIMELINE SYNCHRONIZATION & KRONOLOGI BRIDGE PANEL     */}
              {/* ============================================================= */}
              {category === 'history' && (
                <div className="pt-4 border-t border-[#D8CBB3] space-y-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#231C14]">
                      <Clock className="w-4 h-4 text-[#7A3E1D]" />
                      <span>
                        Sinkronisasi Pita Kronologi Dunia (
                        {timelineEventsOfActiveHistory.length} Catatan Kronologi)
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {onUpdateTimeline && (
                        <button
                          type="button"
                          onClick={() =>
                            handleSyncHistoryToTimeline(activeEntity)
                          }
                          className="px-3.5 py-1.5 text-xs font-semibold bg-[#7A3E1D] text-white rounded-lg hover:bg-[#5E2F15] flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          {timelineEventsOfActiveHistory.length > 0
                            ? 'Perbarui di Pita Kronologi'
                            : '+ Catat / Sinkronkan ke Pita Kronologi'}
                        </button>
                      )}
                      {onOpenTimeline && (
                        <button
                          type="button"
                          onClick={onOpenTimeline}
                          className="px-3 py-1.5 text-xs font-semibold bg-[#231C14] text-[#FBF8F1] rounded-lg hover:bg-[#3A2E21] flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                        >
                          <span>Buka Tab Kronologi</span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-[#B5832A]" />
                        </button>
                      )}
                    </div>
                  </div>

                  {timelineSyncMessage && (
                    <div className="p-3 rounded-lg bg-[#EFE7D6] border border-[#2D5A43]/40 text-xs font-semibold text-[#2D5A43] flex items-center justify-between">
                      <span>{timelineSyncMessage}</span>
                      <button
                        type="button"
                        onClick={() => setTimelineSyncMessage('')}
                        className="text-[#695A47] hover:text-[#231C14] cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {timelineEventsOfActiveHistory.length === 0 ? (
                    <div className="p-3.5 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] text-xs text-[#695A47]">
                      Peristiwa sejarah ini belum tercatat di <strong>Tab Kronologi</strong>. Klik{' '}
                      <strong>+ Catat / Sinkronkan ke Pita Kronologi</strong> di atas agar peristiwa ini otomatis masuk ke urutan tahun linier dunia beserta tautan pihak yang terlibat.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {timelineEventsOfActiveHistory.map((tlEv) => (
                        <div
                          key={tlEv.id}
                          className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] flex flex-wrap items-center justify-between gap-3"
                        >
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-[#7A3E1D]">
                              <span className="font-mono-tabular">
                                {tlEv.displayDate} (Tahun {tlEv.year})
                              </span>
                              <span aria-hidden="true">·</span>
                              <span>{tlEv.era}</span>
                            </div>
                            <div className="font-display text-base font-bold text-[#231C14]">
                              {tlEv.title}
                            </div>
                            <p className="text-xs text-[#695A47] leading-relaxed">
                              {tlEv.summary}
                            </p>
                          </div>
                          {onOpenTimeline && (
                            <button
                              type="button"
                              onClick={onOpenTimeline}
                              className="px-3 py-1.5 rounded-lg bg-[#EFE7D6] hover:bg-[#D8CBB3] border border-[#7A3E1D]/40 text-xs font-semibold text-[#7A3E1D] flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
                            >
                              <span>Lihat di Pita Waktu</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
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
