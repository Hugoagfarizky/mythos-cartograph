import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Check,
  Edit3,
  Link2,
  MapPin,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  Wand2,
  X,
} from 'lucide-react';
import {
  ChapterOutline,
  LoreCategory,
  LoreEntity,
  MapStamp,
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
  selectedEntityId: string;
  onSelectEntity: (id: string) => void;
  onSaveEntity: (entity: LoreEntity) => void;
  onDeleteEntity: (id: string) => void;
  onOpenMapAtStamp: (stampId: string) => void;
  onOpenChapter: (chapterId: string) => void;
  onRunAuditOnEntity: (entity: LoreEntity) => void;
  onOpenBrainstormModal: (category: LoreCategory) => void;
}

export const CodexWorkspace: React.FC<CodexWorkspaceProps> = ({
  category,
  entities,
  chapters,
  mapStamps,
  selectedEntityId,
  onSelectEntity,
  onSaveEntity,
  onDeleteEntity,
  onOpenMapAtStamp,
  onOpenChapter,
  onRunAuditOnEntity,
  onOpenBrainstormModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [draftEntity, setDraftEntity] = useState<LoreEntity | null>(null);
  const [tagInput, setTagInput] = useState('');

  const sectionMeta = CATEGORY_META[category];

  // Reset editing state when switching section tabs
  useEffect(() => {
    setIsEditing(false);
    setDraftEntity(null);
    setSearchQuery('');
  }, [category]);

  const sectionEntities = entities.filter((e) => e.category === category);

  const filteredEntities = sectionEntities.filter((e) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      e.title.toLowerCase().includes(q) ||
      e.subtitle.toLowerCase().includes(q) ||
      e.summary.toLowerCase().includes(q) ||
      e.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  const activeEntity =
    sectionEntities.find((e) => e.id === selectedEntityId) ||
    filteredEntities[0] ||
    sectionEntities[0] ||
    null;

  const startEditing = (entity: LoreEntity) => {
    setDraftEntity({
      ...entity,
      attributes: { ...entity.attributes },
      tags: [...entity.tags],
    });
    setTagInput(entity.tags.join(', '));
    setIsEditing(true);
  };

  const startCreatingNew = () => {
    const newEnt: LoreEntity = {
      id: `ent-${Date.now()}`,
      category,
      title: `${sectionMeta.singular} Baru`,
      subtitle: `Julukan atau Klasifikasi ${sectionMeta.singular}`,
      summary: `Ringkasan singkat mengenai peran ${sectionMeta.singular.toLowerCase()} ini di dalam dunia cerita.`,
      content: `Tuliskan sejarah, deskripsi mendalam, dan hubungannya dengan entitas lain menggunakan tanda kurung ganda seperti [[Archmage Vaelen Thorne]] atau [[Kekaisaran Gondoria]].`,
      tags: [sectionMeta.singular],
      attributes: {},
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    setDraftEntity(newEnt);
    setTagInput(newEnt.tags.join(', '));
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

  const backlinks = activeEntity
    ? findBacklinksForEntity(activeEntity, entities, chapters)
    : { linkedEntities: [], linkedChapters: [] };

  const linkedPins = activeEntity
    ? mapStamps.filter((s) => s.linkedEntityId === activeEntity.id)
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
            Modul World Bible · {sectionEntities.length} {sectionMeta.singular} Tercatat
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
        {/* Left Directory Column */}
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

          <div className="text-xs text-[#695A47] flex items-center justify-between px-1">
            <span>
              Daftar {sectionMeta.singular} ({filteredEntities.length})
            </span>
            <span className="font-mono-tabular">Klik untuk detail</span>
          </div>

          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
            {filteredEntities.length === 0 ? (
              <div className="py-10 text-center space-y-3">
                <p className="text-xs text-[#695A47]">
                  Belum ada data {sectionMeta.singular.toLowerCase()} yang cocok.
                </p>
                <button
                  type="button"
                  onClick={startCreatingNew}
                  className="px-3.5 py-1.5 text-xs font-semibold bg-[#9E2A2B] text-white rounded-lg cursor-pointer"
                >
                  + Buat {sectionMeta.singular} Pertama
                </button>
              </div>
            ) : (
              filteredEntities.map((item) => {
                const isSelected = activeEntity?.id === item.id && !isEditing;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      onSelectEntity(item.id);
                    }}
                    className={`w-full text-left p-3.5 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#EFE7D6] border-[#9E2A2B] shadow-2xs'
                        : 'bg-[#F6F1E6]/70 border-[#D8CBB3] hover:bg-[#EFE7D6]/60'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] text-[#695A47] mb-1">
                      <span
                        className="font-semibold"
                        style={{ color: sectionMeta.accentColor }}
                      >
                        {item.subtitle || sectionMeta.singular}
                      </span>
                      <span className="font-mono-tabular shrink-0 ml-2">
                        {item.updatedAt}
                      </span>
                    </div>
                    <div className="font-display text-lg font-bold text-[#231C14] leading-snug">
                      {item.title}
                    </div>
                    <div className="text-xs text-[#695A47] line-clamp-2 mt-1">
                      {item.summary}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Detail / Editor Column */}
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
                      setDraftEntity({ ...draftEntity, subtitle: e.target.value })
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
                      setDraftEntity({ ...draftEntity, summary: e.target.value })
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

              {/* Category-Specific Structured Fields */}
              <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-3">
                <div className="text-xs font-semibold text-[#9E2A2B]">
                  Parameter Khusus {sectionMeta.label}
                </div>

                {category === 'character' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Peran (Protagonis/Antagonis)"
                      value={draftEntity.attributes.role || ''}
                      onChange={(e) =>
                        setDraftEntity({
                          ...draftEntity,
                          attributes: { ...draftEntity.attributes, role: e.target.value },
                        })
                      }
                      className="px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Ras / Keturunan"
                      value={draftEntity.attributes.raceName || ''}
                      onChange={(e) =>
                        setDraftEntity({
                          ...draftEntity,
                          attributes: { ...draftEntity.attributes, raceName: e.target.value },
                        })
                      }
                      className="px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Kelompok / Faksi"
                      value={draftEntity.attributes.factionName || ''}
                      onChange={(e) =>
                        setDraftEntity({
                          ...draftEntity,
                          attributes: { ...draftEntity.attributes, factionName: e.target.value },
                        })
                      }
                      className="px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Negara Asal"
                      value={draftEntity.attributes.originNation || ''}
                      onChange={(e) =>
                        setDraftEntity({
                          ...draftEntity,
                          attributes: { ...draftEntity.attributes, originNation: e.target.value },
                        })
                      }
                      className="px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Usia & Status"
                      value={draftEntity.attributes.age || ''}
                      onChange={(e) =>
                        setDraftEntity({
                          ...draftEntity,
                          attributes: { ...draftEntity.attributes, age: e.target.value },
                        })
                      }
                      className="px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Tingkatan Power / Tier"
                      value={draftEntity.attributes.powerTier || ''}
                      onChange={(e) =>
                        setDraftEntity({
                          ...draftEntity,
                          attributes: { ...draftEntity.attributes, powerTier: e.target.value },
                        })
                      }
                      className="px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                    />
                  </div>
                )}

                {category === 'race' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Rentang Usia (Lifespan)"
                      value={draftEntity.attributes.lifespan || ''}
                      onChange={(e) =>
                        setDraftEntity({
                          ...draftEntity,
                          attributes: { ...draftEntity.attributes, lifespan: e.target.value },
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
                          attributes: { ...draftEntity.attributes, homeland: e.target.value },
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
                          attributes: { ...draftEntity.attributes, traits: e.target.value },
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
                          attributes: { ...draftEntity.attributes, factionType: e.target.value },
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
                          attributes: { ...draftEntity.attributes, leader: e.target.value },
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
                          attributes: { ...draftEntity.attributes, headquarters: e.target.value },
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
                          attributes: { ...draftEntity.attributes, ideology: e.target.value },
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
                          attributes: { ...draftEntity.attributes, government: e.target.value },
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
                          attributes: { ...draftEntity.attributes, capitalCity: e.target.value },
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
                          attributes: { ...draftEntity.attributes, ruler: e.target.value },
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
                          attributes: { ...draftEntity.attributes, currency: e.target.value },
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
                          attributes: { ...draftEntity.attributes, parentNation: e.target.value },
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
                          attributes: { ...draftEntity.attributes, climate: e.target.value },
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
                          attributes: { ...draftEntity.attributes, resources: e.target.value },
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
                          attributes: { ...draftEntity.attributes, dangerLevel: e.target.value },
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
                          attributes: { ...draftEntity.attributes, hardRules: e.target.value },
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
                          attributes: { ...draftEntity.attributes, skillRank: e.target.value },
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
                          attributes: { ...draftEntity.attributes, era: e.target.value },
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
                          attributes: { ...draftEntity.attributes, belligerents: e.target.value },
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
                          attributes: { ...draftEntity.attributes, outcome: e.target.value },
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
                          attributes: { ...draftEntity.attributes, rarity: e.target.value },
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

              {/* Wiki Cross-link Helper Bar + Main Markdown/Lore Textarea */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <label className="text-xs font-semibold text-[#695A47]">
                    Catatan Lore Lengkap (Gunakan [[Nama Entitas]] untuk Cross-Link otomatis)
                  </label>
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-[11px] text-[#695A47]">Sisipkan Tautan Cepat:</span>
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
                  rows={9}
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
                      style={{ color: CATEGORY_META[activeEntity.category].accentColor }}
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

              {/* Optional Portrait / Artifact Illustration + Attribute Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                {activeEntity.imageUrl && (
                  <div className="md:col-span-4">
                    <div className="rounded-xl overflow-hidden border border-[#D8CBB3] bg-[#EFE7D6]">
                      <img
                        src={activeEntity.imageUrl}
                        alt={activeEntity.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-56 object-cover"
                      />
                    </div>
                  </div>
                )}

                <div
                  className={
                    activeEntity.imageUrl ? 'md:col-span-8 space-y-3' : 'md:col-span-12 space-y-3'
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
                        onSelectEntity={onSelectEntity}
                      />
                    </div>
                  </div>

                  {/* Structured Attribute Key-Values */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {Object.entries(activeEntity.attributes)
                      .filter(([, val]) =>
                        Array.isArray(val) ? val.length > 0 : Boolean(val)
                      )
                      .map(([key, val]) => {
                        const labelMap: Record<string, string> = {
                          role: 'Peran Cerita',
                          raceName: 'Ras / Bangsa',
                          factionName: 'Afiliasi Kelompok',
                          originNation: 'Negara Asal',
                          age: 'Usia',
                          status: 'Status Kanon',
                          powerTier: 'Tingkat Kekuatan',
                          knownSkills: 'Keahlian Dikuasai',
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
                        return (
                          <div
                            key={key}
                            className="px-3.5 py-2.5 rounded-lg bg-[#F6F1E6]/70 border border-[#D8CBB3]/80"
                          >
                            <div className="text-[11px] text-[#695A47]">
                              {labelMap[key] || key}
                            </div>
                            <div className="text-xs font-semibold text-[#231C14] mt-0.5">
                              {Array.isArray(val) ? val.join(' · ') : String(val)}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>

              {/* Full Lore Manuscript Prose with Interactive [[Cross-Links]] */}
              <div className="pt-2 border-t border-[#D8CBB3]">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#695A47] mb-3">
                  <BookOpen className="w-4 h-4 text-[#9E2A2B]" />
                  <span>Arsip Manuskrip & Catatan Dunia</span>
                </div>
                <div className="p-5 rounded-xl bg-[#F6F1E6]/60 border border-[#D8CBB3]">
                  <WikiTextRenderer
                    text={activeEntity.content}
                    entities={entities}
                    onSelectEntity={onSelectEntity}
                  />
                </div>
              </div>

              {/* Bidirectional Backlinks & Map Connections */}
              <div className="pt-4 border-t border-[#D8CBB3] grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3.5 rounded-xl bg-[#EFE7D6]/60 border border-[#D8CBB3]">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#231C14] mb-2">
                    <Link2 className="w-3.5 h-3.5 text-[#9E2A2B]" />
                    <span>Entitas Terkait ({backlinks.linkedEntities.length})</span>
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
                          onClick={() => onSelectEntity(le.id)}
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
                    <span>Kemunculan di Bab ({backlinks.linkedChapters.length})</span>
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
