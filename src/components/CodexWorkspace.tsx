import React, { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  BookOpen,
  Check,
  Compass,
  Edit3,
  Flame,
  GitBranch,
  Link2,
  MapPin,
  Plus,
  Quote,
  Search,
  ShieldCheck,
  Sparkles,
  Swords,
  Trash2,
  User,
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

// Merge starter character psychology/arc attributes if user's localStorage has an older version of a starter character
function getEnrichedAttributes(entity: LoreEntity): LoreAttributes {
  if (entity.category !== 'character') return entity.attributes;
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

  const [isEditing, setIsEditing] = useState(false);
  const [draftEntity, setDraftEntity] = useState<LoreEntity | null>(null);
  const [tagInput, setTagInput] = useState('');

  // Custom skill & artifact text inputs in Character editor
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [customArtifactInput, setCustomArtifactInput] = useState('');

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

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      e.title.toLowerCase().includes(q) ||
      e.subtitle.toLowerCase().includes(q) ||
      e.summary.toLowerCase().includes(q) ||
      e.tags.some((t) => t.toLowerCase().includes(q)) ||
      (attrs.raceName || '').toLowerCase().includes(q) ||
      (attrs.factionName || '').toLowerCase().includes(q)
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
      },
      tags: [...entity.tags],
    });
    setTagInput(entity.tags.join(', '));
    setCustomSkillInput('');
    setCustomArtifactInput('');
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
          : {},
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    setDraftEntity(newEnt);
    setTagInput(newEnt.tags.join(', '));
    setCustomSkillInput('');
    setCustomArtifactInput('');
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
    field: 'knownSkills' | 'ownedArtifacts',
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

  // Lists of existing entities by category for Character hybrid pickers
  const raceEntities = entities.filter((e) => e.category === 'race');
  const factionEntities = entities.filter((e) => e.category === 'faction');
  const nationEntities = entities.filter(
    (e) => e.category === 'nation' || e.category === 'region'
  );
  const skillEntities = entities.filter((e) => e.category === 'skill');
  const artifactEntities = entities.filter(
    (e) => e.category === 'encyclopedia'
  );

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
        {/* LEFT DIRECTORY COLUMN (With Role/Status Filters & Mini Portraits) */}
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
                    placeholder="Contoh: Protagonis, Kuno, Kerajaan Utara"
                    className="w-full px-3 py-2 text-sm bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg text-[#231C14]"
                  />
                </div>
              </div>

              {/* Portrait / Image URL Selector */}
              {(category === 'character' || category === 'encyclopedia') && (
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
                  {/* 1. Identity & Relational Pickers (Race, Faction, Nation, Role, Status, Tier) */}
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
                              -- Pilih Negara / Wilayah ({nationEntities.length}
                              ) --
                            </option>
                            {nationEntities.map((n) => (
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
                    {/* Skills Picker */}
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

                    {/* Owned Artifacts / Relics Picker */}
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

              {/* Other Categories Structured Fields */}
              {category !== 'character' && (
                <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-3">
                  <div className="text-xs font-semibold text-[#9E2A2B]">
                    Parameter Khusus {sectionMeta.label}
                  </div>

                  {category === 'race' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="Rentang Usia (Lifespan)"
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
                        className="px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="Tanah Kelahiran / Habitat"
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
                        className="px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="Ciri Fisik & Kemampuan Bawaan"
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
                        className="px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                      />
                    </div>
                  )}

                  {category === 'faction' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Jenis Kelompok (Ordo/Serikat/Klan)"
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
                        className="px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="Pemimpin Utama"
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
                        className="px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="Markas Besar"
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
                        className="px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="Ideologi / Tujuan Organisasi"
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
                        className="px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                      />
                    </div>
                  )}

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
                    Biografi & Catatan Lore Lengkap (Gunakan [[Nama Entitas]] untuk Cross-Link otomatis)
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

                  {/* If character has no portrait image, still display Appearance prominently */}
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
                        // Exclude fields that have their own dedicated visual sections
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
                          lifespan: 'Rentang Usia',
                          traits: 'Ciri Khas',
                          homeland: 'Tanah Kelahiran',
                          factionType: 'Bentuk Organisasi',
                          leader: 'Pemimpin',
                          headquarters: 'Markas Utama',
                          ideology: 'Ideologi / Semboyan',
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

                        // Check if this attribute value matches a World Bible entity for 1-click navigation
                        const preferredCat: LoreCategory | undefined =
                          key === 'raceName'
                            ? 'race'
                            : key === 'factionName'
                            ? 'faction'
                            : key === 'originNation' || key === 'parentNation'
                            ? 'nation'
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
                            className="px-3.5 py-2.5 rounded-lg bg-[#F6F1E6]/75 border border-[#D8CBB3]/85"
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
                              <div className="text-xs font-semibold text-[#231C14] mt-0.5">
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

              {/* Full Lore Manuscript Prose with Interactive [[Cross-Links]] */}
              <div className="pt-4 border-t border-[#D8CBB3]">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#695A47] mb-3">
                  <BookOpen className="w-4 h-4 text-[#9E2A2B]" />
                  <span>Biografi & Catatan Manuskrip Dunia</span>
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
