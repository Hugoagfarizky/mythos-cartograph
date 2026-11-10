import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Crown,
  Edit3,
  Eye,
  GitBranch,
  Plus,
  ScrollText,
  Shield,
  Sparkles,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { STARTER_WORLD_PROJECT } from '../data/starterWorld';
import {
  ChapterOutline,
  DynastyMember,
  DynastyTree,
  LoreCategory,
  LoreEntity,
  MysteryPlotItem,
  ProphecyClue,
} from '../types/world';
import {
  OrnateCornerFiligree,
  WikiTextRenderer,
} from './WikiTextRenderer';

// ============================================================================
// 1. STUDIO POHON SILSILAH KELUARGA & DINASTI KERAJAAN (PILAR IV)
// ============================================================================

interface DynastyTreeStudioViewProps {
  dynastyTrees?: DynastyTree[];
  entities: LoreEntity[];
  onUpdateDynastyTrees: (next: DynastyTree[]) => void;
  onSelectEntity: (entityId: string) => void;
  onQuickCreateEntity?: (
    title: string,
    category: LoreCategory,
    openAfterCreate?: boolean
  ) => void;
}

const SUCCESSION_BADGE_STYLE: Record<
  DynastyMember['successionStatus'],
  string
> = {
  'Penguasa Takhta': 'bg-[#9E2A2B] text-white border-[#B5832A]',
  'Pendiri Wangsa': 'bg-[#231C14] text-[#FBF8F1] border-[#B5832A]',
  'Pewaris Utama': 'bg-[#B5832A]/20 text-[#9E2A2B] border-[#B5832A]',
  'Pangeran / Putri': 'bg-[#EFE7D6] text-[#231C14] border-[#D8CBB3]',
  'Cabang Kadet': 'bg-[#264653]/15 text-[#264653] border-[#264653]/40',
  'Pasangan / Konsort': 'bg-[#2D5A43]/15 text-[#2D5A43] border-[#2D5A43]/40',
};

const MEMBER_STATUS_BADGE: Record<DynastyMember['status'], string> = {
  Hidup: 'text-[#2D5A43] bg-[#2D5A43]/12 border-[#2D5A43]/30',
  Gugur: 'text-[#695A47] bg-[#EFE7D6] border-[#D8CBB3]',
  Menghilang: 'text-[#9E2A2B] bg-[#9E2A2B]/12 border-[#9E2A2B]/30',
  Diasingkan: 'text-[#8F5B14] bg-[#B5832A]/15 border-[#B5832A]/40',
};

export const DynastyTreeStudioView: React.FC<DynastyTreeStudioViewProps> = ({
  dynastyTrees,
  entities,
  onUpdateDynastyTrees,
  onSelectEntity,
  onQuickCreateEntity,
}) => {
  const trees =
    dynastyTrees && dynastyTrees.length > 0
      ? dynastyTrees
      : STARTER_WORLD_PROJECT.dynastyTrees || [];

  const [activeTreeId, setActiveTreeId] = useState<string>(
    trees[0]?.id || 'dyn-valorian'
  );
  const [selectedMemberId, setSelectedMemberId] = useState<string>(
    trees[0]?.members[0]?.id || ''
  );

  // Add/Edit House state
  const [showHouseForm, setShowHouseForm] = useState(false);
  const [editingHouse, setEditingHouse] = useState<DynastyTree | null>(null);

  // Add/Edit Member state
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [draftMember, setDraftMember] = useState<DynastyMember | null>(null);

  const activeTree =
    trees.find((t) => t.id === activeTreeId) || trees[0] || null;

  const selectedMember =
    activeTree?.members.find((m) => m.id === selectedMemberId) ||
    activeTree?.members[0] ||
    null;

  const generations = activeTree
    ? Array.from(
        new Set(activeTree.members.map((m) => m.generation))
      ).sort((a, b) => a - b)
    : [];

  const handleOpenNewHouse = () => {
    setEditingHouse({
      id: `dyn-${Date.now()}`,
      houseName: 'Wangsa Bangsawan Baru',
      motto: 'Semboyan Kehormatan & Darah Wangsa',
      coatOfArms: 'Lambang Perisai & Panji Keluarga',
      originNation: 'Kekaisaran Gondoria',
      ancestralSeat: 'Kastil Leluhur',
      overview:
        'Tuliskan sejarah singkat garis keturunan, warisan sihir darah, dan posisi politik wangsa ini.',
      members: [
        {
          id: `mem-${Date.now()}`,
          name: 'Leluhur Pendiri Wangsa',
          titleOrRole: 'Raja / Empu Pertama',
          generation: 1,
          birthDeathYears: 'Tahun 1 PG – 75 PG',
          status: 'Gugur',
          successionStatus: 'Pendiri Wangsa',
          parentIds: [],
          bloodlineTrait: 'Warisan Bakat Darah Utama',
          notes: 'Pendiri garis keturunan wangsa ini.',
        },
      ],
    });
    setShowHouseForm(true);
  };

  const handleSaveHouse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHouse) return;
    const exists = trees.some((t) => t.id === editingHouse.id);
    const nextTrees = exists
      ? trees.map((t) => (t.id === editingHouse.id ? editingHouse : t))
      : [...trees, editingHouse];
    onUpdateDynastyTrees(nextTrees);
    setActiveTreeId(editingHouse.id);
    setShowHouseForm(false);
    setEditingHouse(null);
  };

  const handleDeleteHouse = (treeId: string) => {
    if (trees.length <= 1) return;
    const remaining = trees.filter((t) => t.id !== treeId);
    onUpdateDynastyTrees(remaining);
    if (activeTreeId === treeId && remaining[0]) {
      setActiveTreeId(remaining[0].id);
      setSelectedMemberId(remaining[0].members[0]?.id || '');
    }
  };

  const handleOpenNewMember = (defaultGen = 2, defaultParentId?: string) => {
    if (!activeTree) return;
    setDraftMember({
      id: `mem-${Date.now()}`,
      name: 'Anggota Wangsa Baru',
      titleOrRole: 'Pangeran / Pewaris / Bangsawan',
      generation: defaultGen,
      birthDeathYears: 'Tahun 380 PG – Sekarang',
      status: 'Hidup',
      successionStatus: 'Pangeran / Putri',
      parentIds: defaultParentId ? [defaultParentId] : [],
      spouseName: '',
      bloodlineTrait: '',
      notes: 'Catatan peran dan sejarah tokoh dalam silsilah dinasti.',
    });
    setShowMemberForm(true);
  };

  const handleOpenEditMember = (member: DynastyMember) => {
    setDraftMember({
      ...member,
      parentIds: [...(member.parentIds || [])],
    });
    setShowMemberForm(true);
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTree || !draftMember) return;
    const exists = activeTree.members.some((m) => m.id === draftMember.id);
    const nextMembers = exists
      ? activeTree.members.map((m) =>
          m.id === draftMember.id ? draftMember : m
        )
      : [...activeTree.members, draftMember];

    const updatedTree: DynastyTree = {
      ...activeTree,
      members: nextMembers,
    };
    onUpdateDynastyTrees(
      trees.map((t) => (t.id === activeTree.id ? updatedTree : t))
    );
    setSelectedMemberId(draftMember.id);
    setShowMemberForm(false);
    setDraftMember(null);
  };

  const handleDeleteMember = (memberId: string) => {
    if (!activeTree || activeTree.members.length <= 1) return;
    const nextMembers = activeTree.members
      .filter((m) => m.id !== memberId)
      .map((m) => ({
        ...m,
        parentIds: m.parentIds.filter((pid) => pid !== memberId),
      }));
    const updatedTree: DynastyTree = {
      ...activeTree,
      members: nextMembers,
    };
    onUpdateDynastyTrees(
      trees.map((t) => (t.id === activeTree.id ? updatedTree : t))
    );
    if (selectedMemberId === memberId && nextMembers[0]) {
      setSelectedMemberId(nextMembers[0].id);
    }
  };

  const findCharacterEntity = (member: DynastyMember): LoreEntity | undefined => {
    if (member.linkedCharacterId) {
      const byId = entities.find((e) => e.id === member.linkedCharacterId);
      if (byId) return byId;
    }
    const clean = member.name.trim().toLowerCase();
    return entities.find(
      (e) =>
        e.category === 'character' &&
        (e.title.toLowerCase() === clean ||
          e.title.toLowerCase().includes(clean) ||
          clean.includes(e.title.toLowerCase()))
    );
  };

  return (
    <div className="space-y-5">
      {/* Top Banner: Dynasty Selector & Heraldry Header */}
      <div className="relative overflow-hidden bg-[#FBF8F1] border-2 border-[#B5832A]/50 rounded-2xl p-5 shadow-xs space-y-4">
        <OrnateCornerFiligree className="text-[#B5832A]/50" />

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D8CBB3] pb-3.5">
          <div>
            <div className="text-xs font-epic font-bold uppercase tracking-widest text-[#9E2A2B] flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-[#B5832A]" />
              <span>Pilar IV · Studio Silsilah Keluarga & Dinasti Kerajaan</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#231C14]">
              Arsip Genealogi, Garis Darah & Suksesi Takhta
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleOpenNewHouse}
              className="px-3.5 py-2 text-xs font-semibold bg-[#231C14] text-[#FBF8F1] rounded-lg hover:bg-[#3A2E21] flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#B5832A]" />
              <span>+ Buat Wangsa / Dinasti Baru</span>
            </button>
            {activeTree && (
              <button
                type="button"
                onClick={() => handleOpenNewMember(generations.length || 2)}
                className="px-3.5 py-2 text-xs font-semibold bg-[#9E2A2B] text-white rounded-lg hover:bg-[#7E2021] flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Tambah Anggota Silsilah</span>
              </button>
            )}
          </div>
        </div>

        {/* Dynasty Tabs Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-[#695A47]">
            Pilih Wangsa / Klan:
          </span>
          {trees.map((tree) => {
            const isSelected = activeTree?.id === tree.id;
            return (
              <button
                key={tree.id}
                type="button"
                onClick={() => {
                  setActiveTreeId(tree.id);
                  setSelectedMemberId(tree.members[0]?.id || '');
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#9E2A2B] text-white shadow-xs ring-1 ring-[#B5832A]'
                    : 'bg-[#F6F1E6] text-[#231C14] border border-[#D8CBB3] hover:bg-[#EFE7D6]'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>{tree.houseName}</span>
                <span
                  className={`font-mono-tabular text-[10px] px-1.5 py-0.2 rounded ${
                    isSelected
                      ? 'bg-black/25 text-white'
                      : 'bg-[#EFE7D6] text-[#695A47]'
                  }`}
                >
                  {tree.members.length} Tokoh
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Dynasty Heraldry Metadata */}
        {activeTree && (
          <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            <div className="lg:col-span-8 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#9E2A2B] font-semibold">
                <span>Semboyan Wangsa: “{activeTree.motto}”</span>
                {activeTree.originNation && (
                  <>
                    <span>·</span>
                    <span>Kedaulatan: {activeTree.originNation}</span>
                  </>
                )}
                {activeTree.ancestralSeat && (
                  <>
                    <span>·</span>
                    <span>Takhta Leluhur: {activeTree.ancestralSeat}</span>
                  </>
                )}
              </div>
              <div className="text-xs text-[#231C14] leading-relaxed">
                <WikiTextRenderer
                  text={activeTree.overview}
                  entities={entities}
                  onSelectEntity={onSelectEntity}
                  onQuickCreateEntity={onQuickCreateEntity}
                />
              </div>
              <div className="text-[11px] text-[#695A47] pt-0.5">
                <strong className="text-[#231C14]">Lambang Kebesaran:</strong>{' '}
                {activeTree.coatOfArms}
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditingHouse(activeTree);
                  setShowHouseForm(true);
                }}
                className="px-3 py-1.5 text-xs font-semibold bg-[#EFE7D6] hover:bg-[#D8CBB3] text-[#231C14] border border-[#D8CBB3] rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#9E2A2B]" />
                <span>Sunting Info Wangsa</span>
              </button>
              {trees.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleDeleteHouse(activeTree.id)}
                  className="px-2.5 py-1.5 text-xs font-semibold text-[#9E2A2B] border border-[#9E2A2B]/30 rounded-lg hover:bg-[#9E2A2B]/10 cursor-pointer"
                  title="Hapus wangsa ini"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Split View: Generational Tree Canvas on Left (8 cols) + Member Dossier Inspector on Right (4 cols) */}
      {activeTree && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left 8 Cols: Multi-Generation Lineage Tree */}
          <div className="lg:col-span-8 bg-[#FBF8F1] border-2 border-[#B5832A]/45 rounded-2xl p-5 space-y-6">
            <div className="flex items-center justify-between border-b border-[#D8CBB3] pb-3">
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-[#9E2A2B]" />
                <h3 className="font-display text-xl font-bold text-[#231C14]">
                  Bagan Garis Keturunan Lintas Generasi ({activeTree.houseName})
                </h3>
              </div>
              <span className="text-xs text-[#695A47]">
                Klik kartu anggota untuk melihat detail & tautan Tokoh
              </span>
            </div>

            <div className="space-y-6">
              {generations.map((genNum, gIdx) => {
                const genMembers = activeTree.members.filter(
                  (m) => m.generation === genNum
                );
                return (
                  <div key={genNum} className=" relative space-y-3">
                    {/* Generation Header */}
                    <div className="flex items-center justify-between gap-2 bg-[#EFE7D6] border border-[#D8CBB3] px-3.5 py-1.5 rounded-lg">
                      <span className="font-epic text-xs font-bold uppercase tracking-wider text-[#9E2A2B]">
                        Generasi ke-{genNum}{' '}
                        {genNum === 1
                          ? '· Leluhur Pendiri'
                          : genNum === 2
                          ? '· Generasi Penguasa Pendahulu'
                          : genNum === 3
                          ? '· Generasi Penguasa & Pewaris Saat Ini'
                          : '· Keturunan Muda'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenNewMember(genNum)}
                        className="text-[11px] font-semibold text-[#231C14] hover:text-[#9E2A2B] flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Tambah di Gen {genNum}</span>
                      </button>
                    </div>

                    {/* Member Cards Grid in this Generation */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {genMembers.map((member) => {
                        const isSelected = selectedMember?.id === member.id;
                        const parents = activeTree.members.filter((p) =>
                          member.parentIds.includes(p.id)
                        );
                        const linkedChar = findCharacterEntity(member);

                        return (
                          <div
                            key={member.id}
                            onClick={() => setSelectedMemberId(member.id)}
                            className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                              isSelected
                                ? 'bg-[#EFE7D6] border-2 border-[#9E2A2B] shadow-sm'
                                : 'bg-[#F6F1E6] border-[#D8CBB3] hover:bg-[#EFE7D6]/70'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span
                                className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                                  SUCCESSION_BADGE_STYLE[
                                    member.successionStatus
                                  ]
                                }`}
                              >
                                {member.successionStatus}
                              </span>
                              <span
                                className={`px-2 py-0.5 text-[10px] font-semibold rounded border ${
                                  MEMBER_STATUS_BADGE[member.status]
                                }`}
                              >
                                {member.status} · {member.birthDeathYears}
                              </span>
                            </div>

                            <div>
                              <div className="font-display text-lg font-bold text-[#231C14] flex items-center justify-between gap-2">
                                <span>{member.name}</span>
                                {linkedChar && (
                                  <span
                                    className="text-[10px] font-semibold text-[#9E2A2B] bg-[#FBF8F1] px-2 py-0.5 rounded border border-[#B5832A]/50 shrink-0"
                                    title="Terhubung ke halaman Karakter di Codex"
                                  >
                                    Profil Codex ↗
                                  </span>
                                )}
                              </div>
                              <div className="text-xs italic text-[#695A47]">
                                {member.titleOrRole}
                              </div>
                            </div>

                            {parents.length > 0 && (
                              <div className="text-[11px] text-[#695A47] pt-1 border-t border-[#D8CBB3]/70">
                                <strong className="text-[#231C14]">
                                  Putra/Putri dari:
                                </strong>{' '}
                                {parents.map((p) => p.name).join(' & ')}
                              </div>
                            )}

                            {member.spouseName && (
                              <div className="text-[11px] text-[#2D5A43] font-medium">
                                ❖ Pasangan / Konsort: {member.spouseName}
                              </div>
                            )}

                            {member.bloodlineTrait && (
                              <div className="text-[11px] text-[#8F5B14] bg-[#FBF8F1] px-2.5 py-1 rounded border border-[#D8CBB3]">
                                ✦ Warisan Darah: {member.bloodlineTrait}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {gIdx < generations.length - 1 && (
                      <div className="flex justify-center py-1" aria-hidden="true">
                        <div className="h-5 w-0.5 bg-[#B5832A]/60" />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Add Next Generation Quick Button */}
              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={() =>
                    handleOpenNewMember(
                      generations.length > 0
                        ? Math.max(...generations) + 1
                        : 1,
                      selectedMember?.id
                    )
                  }
                  className="px-4 py-2 text-xs font-semibold bg-[#F6F1E6] hover:bg-[#EFE7D6] text-[#231C14] border border-[#B5832A] rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#9E2A2B]" />
                  <span>
                    + Tambah Generasi Berikutnya (Keturunan{' '}
                    {selectedMember ? selectedMember.name : 'Wangsa'})
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Right 4 Cols: Selected Member Dossier & Character Codex Bridge */}
          <div className="lg:col-span-4 bg-[#FBF8F1] border-2 border-[#B5832A]/45 rounded-2xl p-5 space-y-4 sticky top-20">
            {selectedMember ? (
              <>
                <div className="flex items-start justify-between gap-2 border-b border-[#D8CBB3] pb-3">
                  <div>
                    <span className="text-[11px] font-epic uppercase tracking-wider text-[#9E2A2B] font-bold">
                      Dossier Anggota Dinasti · Gen {selectedMember.generation}
                    </span>
                    <h3 className="font-display text-2xl font-bold text-[#231C14]">
                      {selectedMember.name}
                    </h3>
                    <p className="text-xs italic text-[#695A47]">
                      {selectedMember.titleOrRole}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEditMember(selectedMember)}
                      className="p-1.5 rounded-lg bg-[#231C14] text-[#FBF8F1] hover:bg-[#3A2E21] cursor-pointer"
                      title="Sunting anggota silsilah"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    {activeTree.members.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteMember(selectedMember.id)}
                        className="p-1.5 rounded-lg border border-[#9E2A2B]/30 text-[#9E2A2B] hover:bg-[#9E2A2B]/10 cursor-pointer"
                        title="Hapus anggota"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-[#695A47]">Status Suksesi:</span>
                      <span className="font-bold text-[#9E2A2B]">
                        {selectedMember.successionStatus}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#695A47]">Status & Masa Hidup:</span>
                      <span className="font-semibold text-[#231C14]">
                        {selectedMember.status} ({selectedMember.birthDeathYears})
                      </span>
                    </div>
                    {selectedMember.spouseName && (
                      <div className="flex justify-between">
                        <span className="text-[#695A47]">Pasangan / Konsort:</span>
                        <span className="font-semibold text-[#2D5A43]">
                          {selectedMember.spouseName}
                        </span>
                      </div>
                    )}
                  </div>

                  {selectedMember.bloodlineTrait && (
                    <div className="p-3 rounded-xl bg-[#EFE7D6]/75 border border-[#B5832A]/50 space-y-1">
                      <div className="text-[11px] font-semibold text-[#8F5B14] flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Ciri Khas & Bakat Warisan Darah</span>
                      </div>
                      <p className="text-xs text-[#231C14] font-medium">
                        {selectedMember.bloodlineTrait}
                      </p>
                    </div>
                  )}

                  <div className="p-3.5 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-1.5">
                    <div className="text-[11px] font-semibold text-[#695A47]">
                      Catatan Sejarah & Konflik Suksesi
                    </div>
                    <div className="text-xs text-[#231C14] leading-relaxed">
                      <WikiTextRenderer
                        text={selectedMember.notes}
                        entities={entities}
                        onSelectEntity={onSelectEntity}
                        onQuickCreateEntity={onQuickCreateEntity}
                      />
                    </div>
                  </div>

                  {/* Direct Link to Character Codex or 1-Click Create Character */}
                  {(() => {
                    const matchedChar = findCharacterEntity(selectedMember);
                    if (matchedChar) {
                      return (
                        <button
                          type="button"
                          onClick={() => onSelectEntity(matchedChar.id)}
                          className="w-full py-2.5 px-4 rounded-xl bg-[#9E2A2B] hover:bg-[#7E2021] text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <UserCheck className="w-4 h-4" />
                          <span>
                            Buka Lembar Karakter “{matchedChar.title}” ↗
                          </span>
                        </button>
                      );
                    }
                    if (onQuickCreateEntity) {
                      return (
                        <button
                          type="button"
                          onClick={() =>
                            onQuickCreateEntity(
                              selectedMember.name,
                              'character',
                              true
                            )
                          }
                          className="w-full py-2.5 px-4 rounded-xl bg-[#231C14] hover:bg-[#3A2E21] text-[#FBF8F1] font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <UserPlus className="w-4 h-4 text-[#B5832A]" />
                          <span>
                            + Buat Halaman Karakter di Codex untuk Tokoh Ini
                          </span>
                        </button>
                      );
                    }
                    return null;
                  })()}
                </div>
              </>
            ) : (
              <div className="text-xs text-[#695A47] py-8 text-center">
                Pilih salah satu anggota silsilah di sebelah kiri.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Add/Edit Dynasty House */}
      {showHouseForm && editingHouse && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveHouse}
            className="bg-[#FBF8F1] border-2 border-[#B5832A] rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#D8CBB3] pb-3">
              <h3 className="font-display text-2xl font-bold text-[#231C14]">
                Konfigurasi Wangsa / Dinasti Kerajaan
              </h3>
              <button
                type="button"
                onClick={() => setShowHouseForm(false)}
                className="p-1 text-[#695A47] hover:text-[#231C14] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#695A47] mb-1">
                  Nama Wangsa / Klan Dinasti
                </label>
                <input
                  type="text"
                  required
                  value={editingHouse.houseName}
                  onChange={(e) =>
                    setEditingHouse({
                      ...editingHouse,
                      houseName: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg font-semibold"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#695A47] mb-1">
                    Semboyan Wangsa (Motto)
                  </label>
                  <input
                    type="text"
                    value={editingHouse.motto}
                    onChange={(e) =>
                      setEditingHouse({ ...editingHouse, motto: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#695A47] mb-1">
                    Negara / Kedaulatan Asal
                  </label>
                  <input
                    type="text"
                    value={editingHouse.originNation || ''}
                    onChange={(e) =>
                      setEditingHouse({
                        ...editingHouse,
                        originNation: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-[#695A47] mb-1">
                  Lambang Kebesaran (Coat of Arms)
                </label>
                <input
                  type="text"
                  value={editingHouse.coatOfArms}
                  onChange={(e) =>
                    setEditingHouse({
                      ...editingHouse,
                      coatOfArms: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#695A47] mb-1">
                  Ikhtisar Sejarah Wangsa (Mendukung [[Tautan Wiki]])
                </label>
                <textarea
                  rows={3}
                  value={editingHouse.overview}
                  onChange={(e) =>
                    setEditingHouse({
                      ...editingHouse,
                      overview: e.target.value,
                    })
                  }
                  className="w-full p-2.5 bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowHouseForm(false)}
                className="px-4 py-2 text-xs font-semibold border border-[#D8CBB3] rounded-lg text-[#695A47] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold bg-[#9E2A2B] text-white rounded-lg hover:bg-[#7E2021] cursor-pointer"
              >
                Simpan Wangsa
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Add/Edit Dynasty Member */}
      {showMemberForm && draftMember && activeTree && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveMember}
            className="bg-[#FBF8F1] border-2 border-[#B5832A] rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#D8CBB3] pb-3">
              <h3 className="font-display text-2xl font-bold text-[#231C14]">
                Anggota Silsilah {activeTree.houseName}
              </h3>
              <button
                type="button"
                onClick={() => setShowMemberForm(false)}
                className="p-1 text-[#695A47] hover:text-[#231C14] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#695A47] mb-1">
                    Nama Lengkap Tokoh
                  </label>
                  <input
                    type="text"
                    required
                    value={draftMember.name}
                    onChange={(e) =>
                      setDraftMember({ ...draftMember, name: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#695A47] mb-1">
                    Gelar / Peran dalam Dinasti
                  </label>
                  <input
                    type="text"
                    value={draftMember.titleOrRole}
                    onChange={(e) =>
                      setDraftMember({
                        ...draftMember,
                        titleOrRole: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#695A47] mb-1">
                    Urutan Generasi (1, 2, 3...)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={draftMember.generation}
                    onChange={(e) =>
                      setDraftMember({
                        ...draftMember,
                        generation: Number(e.target.value) || 1,
                      })
                    }
                    className="w-full px-3 py-2 bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#695A47] mb-1">
                    Status Suksesi
                  </label>
                  <select
                    value={draftMember.successionStatus}
                    onChange={(e) =>
                      setDraftMember({
                        ...draftMember,
                        successionStatus:
                          e.target.value as DynastyMember['successionStatus'],
                      })
                    }
                    className="w-full px-2.5 py-2 bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg"
                  >
                    <option value="Pendiri Wangsa">Pendiri Wangsa</option>
                    <option value="Penguasa Takhta">Penguasa Takhta</option>
                    <option value="Pewaris Utama">Pewaris Utama</option>
                    <option value="Pangeran / Putri">Pangeran / Putri</option>
                    <option value="Cabang Kadet">Cabang Kadet</option>
                    <option value="Pasangan / Konsort">Pasangan / Konsort</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#695A47] mb-1">
                    Status Kehidupan
                  </label>
                  <select
                    value={draftMember.status}
                    onChange={(e) =>
                      setDraftMember({
                        ...draftMember,
                        status: e.target.value as DynastyMember['status'],
                      })
                    }
                    className="w-full px-2.5 py-2 bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg"
                  >
                    <option value="Hidup">Hidup</option>
                    <option value="Gugur">Gugur</option>
                    <option value="Menghilang">Menghilang</option>
                    <option value="Diasingkan">Diasingkan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#695A47] mb-1">
                    Tahun Lahir – Wafat
                  </label>
                  <input
                    type="text"
                    value={draftMember.birthDeathYears}
                    onChange={(e) =>
                      setDraftMember({
                        ...draftMember,
                        birthDeathYears: e.target.value,
                      })
                    }
                    placeholder="373 PG – Sekarang"
                    className="w-full px-3 py-2 bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#695A47] mb-1">
                    Nama Pasangan / Konsort (Opsional)
                  </label>
                  <input
                    type="text"
                    value={draftMember.spouseName || ''}
                    onChange={(e) =>
                      setDraftMember({
                        ...draftMember,
                        spouseName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#695A47] mb-1">
                  Orang Tua di Wangsa Ini (Opsional)
                </label>
                <select
                  value={draftMember.parentIds[0] || ''}
                  onChange={(e) =>
                    setDraftMember({
                      ...draftMember,
                      parentIds: e.target.value ? [e.target.value] : [],
                    })
                  }
                  className="w-full px-3 py-2 bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg"
                >
                  <option value="">-- Tidak Ada / Leluhur Awal --</option>
                  {activeTree.members
                    .filter((m) => m.id !== draftMember.id)
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        [Gen {m.generation}] {m.name} ({m.titleOrRole})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#695A47] mb-1">
                  Warisan Bakat Darah / Ciri Genetik Khas
                </label>
                <input
                  type="text"
                  value={draftMember.bloodlineTrait || ''}
                  onChange={(e) =>
                    setDraftMember({
                      ...draftMember,
                      bloodlineTrait: e.target.value,
                    })
                  }
                  placeholder="Contoh: Afinitas Meridian Surya Murni..."
                  className="w-full px-3 py-2 bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#695A47] mb-1">
                  Catatan Sejarah & Peran Suksesi (Mendukung [[Tautan Wiki]])
                </label>
                <textarea
                  rows={3}
                  value={draftMember.notes}
                  onChange={(e) =>
                    setDraftMember({ ...draftMember, notes: e.target.value })
                  }
                  className="w-full p-2.5 bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowMemberForm(false)}
                className="px-4 py-2 text-xs font-semibold border border-[#D8CBB3] rounded-lg text-[#695A47] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold bg-[#9E2A2B] text-white rounded-lg hover:bg-[#7E2021] cursor-pointer"
              >
                Simpan Anggota Silsilah
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 2. TRACKER MISTERI, NUBUAT & FORESHADOWING PLOT (PILAR IV)
// ============================================================================

interface ProphecyAndMysteryTrackerViewProps {
  mysteryPlots?: MysteryPlotItem[];
  entities: LoreEntity[];
  chapters: ChapterOutline[];
  onUpdateMysteryPlots: (next: MysteryPlotItem[]) => void;
  onSelectEntity: (entityId: string) => void;
  onOpenChapter: (chapterId: string) => void;
  onQuickCreateEntity?: (
    title: string,
    category: LoreCategory,
    openAfterCreate?: boolean
  ) => void;
}

const MYSTERY_STATUS_STYLE: Record<MysteryPlotItem['status'], string> = {
  'Belum Terungkap': 'bg-[#EFE7D6] text-[#695A47] border-[#D8CBB3]',
  'Petunjuk Ditanam': 'bg-[#B5832A]/20 text-[#8F5B14] border-[#B5832A]',
  'Terungkap Sebagian': 'bg-[#264653]/15 text-[#264653] border-[#264653]/40',
  'Terungkap Penuh': 'bg-[#2D5A43]/15 text-[#2D5A43] border-[#2D5A43]/40',
};

export const ProphecyAndMysteryTrackerView: React.FC<
  ProphecyAndMysteryTrackerViewProps
> = ({
  mysteryPlots,
  entities,
  chapters,
  onUpdateMysteryPlots,
  onSelectEntity,
  onOpenChapter,
  onQuickCreateEntity,
}) => {
  const plots =
    mysteryPlots && mysteryPlots.length > 0
      ? mysteryPlots
      : STARTER_WORLD_PROJECT.mysteryPlots || [];

  const [categoryFilter, setCategoryFilter] = useState<string>('Semua');
  const [selectedPlotId, setSelectedPlotId] = useState<string>(
    plots[0]?.id || ''
  );
  const [showMysteryForm, setShowMysteryForm] = useState(false);
  const [draftPlot, setDraftPlot] = useState<MysteryPlotItem | null>(null);

  // Inline clue creator state
  const [newClueText, setNewClueText] = useState('');
  const [newClueChapterId, setNewClueChapterId] = useState('');
  const [newClueIsRedHerring, setNewClueIsRedHerring] = useState(false);

  const filteredPlots = plots.filter(
    (p) => categoryFilter === 'Semua' || p.category === categoryFilter
  );

  const activePlot =
    plots.find((p) => p.id === selectedPlotId) ||
    filteredPlots[0] ||
    plots[0] ||
    null;

  const totalClues = plots.reduce((acc, p) => acc + p.clues.length, 0);
  const totalRedHerrings = plots.reduce(
    (acc, p) => acc + p.clues.filter((c) => c.isRedHerring).length,
    0
  );

  const handleOpenNewMystery = () => {
    setDraftPlot({
      id: `mys-${Date.now()}`,
      title: 'Nubuat atau Misteri Cerita Baru',
      category: 'Nubuat Kuno',
      status: 'Petunjuk Ditanam',
      prophecyVerseOrQuestion:
        'Tuliskan bunyi bait ramalan kuno atau pertanyaan misteri utama yang membuat pembaca penasaran...',
      publicInterpretation:
        'Apa yang diyakini oleh masyarakat umum atau tokoh-tokoh di awal cerita?',
      trueCanonicalAnswer:
        'Rahasia penulis: Apa kebenaran sejati di balik nubuat atau misteri ini saat terungkap di akhir cerita?',
      originEntityName: '',
      payoffChapterId: chapters[chapters.length - 1]?.id || '',
      clues: [],
    });
    setShowMysteryForm(true);
  };

  const handleSaveMystery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftPlot) return;
    const exists = plots.some((p) => p.id === draftPlot.id);
    const next = exists
      ? plots.map((p) => (p.id === draftPlot.id ? draftPlot : p))
      : [draftPlot, ...plots];
    onUpdateMysteryPlots(next);
    setSelectedPlotId(draftPlot.id);
    setShowMysteryForm(false);
    setDraftPlot(null);
  };

  const handleDeleteMystery = (plotId: string) => {
    if (plots.length <= 1) return;
    const next = plots.filter((p) => p.id !== plotId);
    onUpdateMysteryPlots(next);
    if (selectedPlotId === plotId && next[0]) {
      setSelectedPlotId(next[0].id);
    }
  };

  const handleAddClue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePlot || !newClueText.trim()) return;
    const newClue: ProphecyClue = {
      id: `clue-${Date.now()}`,
      clueText: newClueText.trim(),
      linkedChapterId: newClueChapterId || undefined,
      isRedHerring: newClueIsRedHerring,
      revealedStatus: newClueChapterId ? 'Ditanam di Bab' : 'Tersembunyi',
    };
    const updated: MysteryPlotItem = {
      ...activePlot,
      clues: [...activePlot.clues, newClue],
    };
    onUpdateMysteryPlots(
      plots.map((p) => (p.id === activePlot.id ? updated : p))
    );
    setNewClueText('');
    setNewClueIsRedHerring(false);
  };

  const handleRemoveClue = (clueId: string) => {
    if (!activePlot) return;
    const updated: MysteryPlotItem = {
      ...activePlot,
      clues: activePlot.clues.filter((c) => c.id !== clueId),
    };
    onUpdateMysteryPlots(
      plots.map((p) => (p.id === activePlot.id ? updated : p))
    );
  };

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-[#FBF8F1] border-2 border-[#B5832A]/50 rounded-2xl p-5 shadow-xs space-y-4">
        <OrnateCornerFiligree className="text-[#B5832A]/50" />

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D8CBB3] pb-3.5">
          <div>
            <div className="text-xs font-epic font-bold uppercase tracking-widest text-[#9E2A2B] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#B5832A]" />
              <span>
                Pilar IV · Tracker Misteri, Nubuat Kuno & Foreshadowing Plot
              </span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#231C14]">
              Arsitektur Benang Merah, Petunjuk Bab & Pengungkapan Kanon
            </h2>
          </div>

          <button
            type="button"
            onClick={handleOpenNewMystery}
            className="px-4 py-2 text-xs font-semibold bg-[#9E2A2B] text-white rounded-lg hover:bg-[#7E2021] flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Tambah Nubuat / Misteri Plot</span>
          </button>
        </div>

        {/* Metrics & Category Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              'Semua',
              'Nubuat Kuno',
              'Misteri Utama',
              'Konspirasi Politik',
              'Foreshadowing Karakter',
            ].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-[#231C14] text-[#FBF8F1]'
                    : 'bg-[#F6F1E6] text-[#695A47] hover:text-[#231C14] border border-[#D8CBB3]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 text-xs text-[#695A47] font-mono-tabular">
            <span>{plots.length} Misteri/Nubuat</span>
            <span>·</span>
            <span>{totalClues} Petunjuk Ditanam</span>
            <span>·</span>
            <span className="text-[#9E2A2B] font-semibold">
              {totalRedHerrings} Pengecoh (Red Herring)
            </span>
          </div>
        </div>
      </div>

      {/* Main Split View: Mystery List (4 cols) + Active Mystery Inspector & Clue Chain (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left 4 Cols: Mystery & Prophecy Directory */}
        <div className="lg:col-span-4 bg-[#FBF8F1] border-2 border-[#B5832A]/45 rounded-2xl p-4 space-y-3">
          <div className="text-xs font-semibold text-[#695A47] px-1">
            Daftar Nubuat & Misteri ({filteredPlots.length})
          </div>

          <div className="space-y-2.5">
            {filteredPlots.map((item) => {
              const isSelected = activePlot?.id === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedPlotId(item.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                    isSelected
                      ? 'bg-[#EFE7D6] border-2 border-[#9E2A2B] shadow-xs'
                      : 'bg-[#F6F1E6] border-[#D8CBB3] hover:bg-[#EFE7D6]/70'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-epic font-bold uppercase tracking-wider text-[#9E2A2B]">
                      {item.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-semibold rounded border ${
                        MYSTERY_STATUS_STYLE[item.status]
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <div className="font-display text-lg font-bold text-[#231C14] leading-snug">
                    {item.title}
                  </div>
                  <p className="text-xs italic text-[#695A47] line-clamp-2">
                    {item.prophecyVerseOrQuestion}
                  </p>
                  <div className="text-[11px] text-[#264653] font-medium pt-1 flex items-center justify-between">
                    <span>{item.clues.length} Petunjuk Bab</span>
                    {item.payoffChapterId && (
                      <span>
                        Payoff:{' '}
                        {chapters.find((c) => c.id === item.payoffChapterId)
                          ? `Bab ${
                              chapters.find(
                                (c) => c.id === item.payoffChapterId
                              )?.chapterNumber
                            }`
                          : 'Terjadwal'}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 8 Cols: Active Mystery Dossier & Foreshadowing Clue Chain */}
        <div className="lg:col-span-8 bg-[#FBF8F1] border-2 border-[#B5832A]/45 rounded-2xl p-6 space-y-5">
          {activePlot ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#D8CBB3] pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-epic font-bold uppercase tracking-wider text-[#9E2A2B]">
                      {activePlot.category}
                    </span>
                    <span>·</span>
                    <span
                      className={`px-2.5 py-0.5 text-xs font-semibold rounded border ${
                        MYSTERY_STATUS_STYLE[activePlot.status]
                      }`}
                    >
                      {activePlot.status}
                    </span>
                  </div>
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#231C14]">
                    {activePlot.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDraftPlot({ ...activePlot, clues: [...activePlot.clues] });
                      setShowMysteryForm(true);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold bg-[#231C14] text-[#FBF8F1] rounded-lg hover:bg-[#3A2E21] flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Sunting Misteri</span>
                  </button>
                  {plots.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteMystery(activePlot.id)}
                      className="p-1.5 rounded-lg border border-[#9E2A2B]/30 text-[#9E2A2B] hover:bg-[#9E2A2B]/10 cursor-pointer"
                      title="Hapus misteri ini"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Prophecy Verse / Mystery Question Callout */}
              <div className="p-4 rounded-xl bg-[#EFE7D6] border-2 border-[#B5832A]/60 space-y-1.5">
                <div className="text-[11px] font-epic font-bold uppercase tracking-wider text-[#9E2A2B] flex items-center gap-1.5">
                  <ScrollText className="w-3.5 h-3.5 text-[#B5832A]" />
                  <span>Bait Nubuat Kuno / Pertanyaan Sentral Misteri</span>
                </div>
                <p className="font-display text-lg italic text-[#231C14] leading-relaxed">
                  {activePlot.prophecyVerseOrQuestion}
                </p>
              </div>

              {/* Public Interpretation vs True Canonical Answer */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3] space-y-1.5">
                  <div className="text-xs font-semibold text-[#695A47] flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#B5832A]" />
                    <span>Tafsiran Umum / Dugaan Awal Tokoh</span>
                  </div>
                  <div className="text-xs text-[#231C14] leading-relaxed">
                    <WikiTextRenderer
                      text={activePlot.publicInterpretation}
                      entities={entities}
                      onSelectEntity={onSelectEntity}
                      onQuickCreateEntity={onQuickCreateEntity}
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#F6F1E6] border-2 border-[#9E2A2B]/40 space-y-1.5">
                  <div className="text-xs font-semibold text-[#9E2A2B] flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Kebenaran Kanonik (Rahasia Penulis & Payoff)</span>
                  </div>
                  <div className="text-xs text-[#231C14] leading-relaxed">
                    <WikiTextRenderer
                      text={activePlot.trueCanonicalAnswer}
                      entities={entities}
                      onSelectEntity={onSelectEntity}
                      onQuickCreateEntity={onQuickCreateEntity}
                    />
                  </div>
                  {activePlot.payoffChapterId && (
                    <div className="pt-2">
                      {(() => {
                        const payoffCh = chapters.find(
                          (c) => c.id === activePlot.payoffChapterId
                        );
                        if (!payoffCh) return null;
                        return (
                          <button
                            type="button"
                            onClick={() => onOpenChapter(payoffCh.id)}
                            className="px-2.5 py-1 rounded bg-[#231C14] text-[#FBF8F1] text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <span>
                              Target Pengungkapan: Bab {payoffCh.chapterNumber}{' '}
                              ({payoffCh.title})
                            </span>
                            <ArrowUpRight className="w-3 h-3 text-[#B5832A]" />
                          </button>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>

              {/* Planted Clues & Foreshadowing Chain */}
              <div className="pt-3 border-t border-[#D8CBB3] space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-[#231C14] flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-[#9E2A2B]" />
                    <span>
                      Rantai Petunjuk (Foreshadowing Clues) & Pengecoh (
                      {activePlot.clues.length})
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {activePlot.clues.map((clue, idx) => {
                    const linkedChap = chapters.find(
                      (c) => c.id === clue.linkedChapterId
                    );
                    return (
                      <div
                        key={clue.id}
                        className={`p-3.5 rounded-xl border flex flex-wrap items-start justify-between gap-3 ${
                          clue.isRedHerring
                            ? 'bg-[#9E2A2B]/8 border-[#9E2A2B]/40'
                            : 'bg-[#F6F1E6] border-[#D8CBB3]'
                        }`}
                      >
                        <div className="space-y-1 flex-1 min-w-[220px]">
                          <div className="flex flex-wrap items-center gap-2 text-[11px]">
                            <span className="font-mono-tabular font-bold text-[#9E2A2B]">
                              Petunjuk #{idx + 1}
                            </span>
                            {clue.isRedHerring ? (
                              <span className="px-2 py-0.5 rounded bg-[#9E2A2B] text-white text-[10px] font-semibold flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                <span>Pengecoh (Red Herring)</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-[#2D5A43]/15 text-[#2D5A43] text-[10px] font-semibold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Petunjuk Kanon Asli</span>
                              </span>
                            )}
                            {linkedChap && (
                              <button
                                type="button"
                                onClick={() => onOpenChapter(linkedChap.id)}
                                className="px-2 py-0.5 rounded bg-[#EFE7D6] hover:bg-[#D8CBB3] border border-[#B5832A]/50 text-[#231C14] font-semibold flex items-center gap-1 cursor-pointer"
                              >
                                <span>
                                  Ditanam di Bab {linkedChap.chapterNumber}:{' '}
                                  {linkedChap.title}
                                </span>
                                <ArrowUpRight className="w-3 h-3 text-[#9E2A2B]" />
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-[#231C14] leading-relaxed">
                            {clue.clueText}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveClue(clue.id)}
                          className="text-[#695A47] hover:text-[#9E2A2B] p-1 cursor-pointer"
                          title="Hapus petunjuk"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Add Clue Inline Form */}
                <form
                  onSubmit={handleAddClue}
                  className="p-3.5 rounded-xl bg-[#EFE7D6]/70 border border-[#D8CBB3] space-y-2.5"
                >
                  <div className="text-[11px] font-semibold text-[#231C14]">
                    + Tanam Petunjuk Baru / Foreshadowing ke dalam Bab
                  </div>
                  <input
                    type="text"
                    value={newClueText}
                    onChange={(e) => setNewClueText(e.target.value)}
                    placeholder="Tuliskan detail petunjuk halus, simbol, atau dialog foreshadowing..."
                    className="w-full px-3 py-2 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                  />
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={newClueChapterId}
                        onChange={(e) => setNewClueChapterId(e.target.value)}
                        className="px-2.5 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                      >
                        <option value="">-- Pilih Bab Tempat Ditanam --</option>
                        {chapters.map((ch) => (
                          <option key={ch.id} value={ch.id}>
                            Bab {ch.chapterNumber}: {ch.title}
                          </option>
                        ))}
                      </select>

                      <label className="flex items-center gap-1.5 text-xs text-[#231C14] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newClueIsRedHerring}
                          onChange={(e) =>
                            setNewClueIsRedHerring(e.target.checked)
                          }
                        />
                        <span>Tandai sebagai Pengecoh (Red Herring)</span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="px-3.5 py-1.5 text-xs font-semibold bg-[#9E2A2B] text-white rounded-lg hover:bg-[#7E2021] cursor-pointer"
                    >
                      + Tambahkan Petunjuk
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* Modal: Add/Edit Mystery or Prophecy */}
      {showMysteryForm && draftPlot && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveMystery}
            className="bg-[#FBF8F1] border-2 border-[#B5832A] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#D8CBB3] pb-3">
              <h3 className="font-display text-2xl font-bold text-[#231C14]">
                Konfigurasi Nubuat, Misteri & Foreshadowing
              </h3>
              <button
                type="button"
                onClick={() => setShowMysteryForm(false)}
                className="p-1 text-[#695A47] hover:text-[#231C14] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#695A47] mb-1">
                  Judul Nubuat / Misteri Plot
                </label>
                <input
                  type="text"
                  required
                  value={draftPlot.title}
                  onChange={(e) =>
                    setDraftPlot({ ...draftPlot, title: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#695A47] mb-1">
                    Kategori
                  </label>
                  <select
                    value={draftPlot.category}
                    onChange={(e) =>
                      setDraftPlot({
                        ...draftPlot,
                        category:
                          e.target.value as MysteryPlotItem['category'],
                      })
                    }
                    className="w-full px-2.5 py-2 bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg"
                  >
                    <option value="Nubuat Kuno">Nubuat Kuno</option>
                    <option value="Misteri Utama">Misteri Utama</option>
                    <option value="Konspirasi Politik">Konspirasi Politik</option>
                    <option value="Foreshadowing Karakter">
                      Foreshadowing Karakter
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#695A47] mb-1">
                    Status Pengungkapan
                  </label>
                  <select
                    value={draftPlot.status}
                    onChange={(e) =>
                      setDraftPlot({
                        ...draftPlot,
                        status: e.target.value as MysteryPlotItem['status'],
                      })
                    }
                    className="w-full px-2.5 py-2 bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg"
                  >
                    <option value="Belum Terungkap">Belum Terungkap</option>
                    <option value="Petunjuk Ditanam">Petunjuk Ditanam</option>
                    <option value="Terungkap Sebagian">
                      Terungkap Sebagian
                    </option>
                    <option value="Terungkap Penuh">Terungkap Penuh</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#695A47] mb-1">
                    Target Bab Pengungkapan (Payoff)
                  </label>
                  <select
                    value={draftPlot.payoffChapterId || ''}
                    onChange={(e) =>
                      setDraftPlot({
                        ...draftPlot,
                        payoffChapterId: e.target.value,
                      })
                    }
                    className="w-full px-2.5 py-2 bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg"
                  >
                    <option value="">-- Belum Ditentukan --</option>
                    {chapters.map((ch) => (
                      <option key={ch.id} value={ch.id}>
                        Bab {ch.chapterNumber}: {ch.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#695A47] mb-1">
                  Bait Nubuat Kuno / Pertanyaan Sentral Misteri
                </label>
                <textarea
                  rows={2}
                  value={draftPlot.prophecyVerseOrQuestion}
                  onChange={(e) =>
                    setDraftPlot({
                      ...draftPlot,
                      prophecyVerseOrQuestion: e.target.value,
                    })
                  }
                  className="w-full p-2.5 bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#695A47] mb-1">
                  Tafsiran Umum / Dugaan Tokoh (Mendukung [[Tautan Wiki]])
                </label>
                <textarea
                  rows={2}
                  value={draftPlot.publicInterpretation}
                  onChange={(e) =>
                    setDraftPlot({
                      ...draftPlot,
                      publicInterpretation: e.target.value,
                    })
                  }
                  className="w-full p-2.5 bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#9E2A2B] mb-1">
                  Solusi & Kebenaran Kanonik Sejati (Rahasia Penulis)
                </label>
                <textarea
                  rows={3}
                  value={draftPlot.trueCanonicalAnswer}
                  onChange={(e) =>
                    setDraftPlot({
                      ...draftPlot,
                      trueCanonicalAnswer: e.target.value,
                    })
                  }
                  className="w-full p-2.5 bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowMysteryForm(false)}
                className="px-4 py-2 text-xs font-semibold border border-[#D8CBB3] rounded-lg text-[#695A47] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold bg-[#9E2A2B] text-white rounded-lg hover:bg-[#7E2021] cursor-pointer"
              >
                Simpan Nubuat & Misteri
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
