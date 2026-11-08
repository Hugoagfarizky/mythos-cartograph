import React, { useRef, useState } from 'react';
import {
  Calendar,
  GitBranch,
  Plus,
  Trash2,
  Users,
} from 'lucide-react';
import {
  GraphNodePosition,
  LoreEntity,
  RelationType,
  RelationshipEdge,
  TimelineEvent,
} from '../types/world';
import { CATEGORY_META } from './WikiTextRenderer';

interface TimelineViewProps {
  timeline: TimelineEvent[];
  entities: LoreEntity[];
  calendarSystem: string;
  onUpdateTimeline: (next: TimelineEvent[]) => void;
  onSelectEntity: (id: string) => void;
}

export const ChronicleTimelineView: React.FC<TimelineViewProps> = ({
  timeline,
  entities,
  calendarSystem,
  onUpdateTimeline,
  onSelectEntity,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newYear, setNewYear] = useState<number>(412);
  const [newDisplayDate, setNewDisplayDate] = useState<string>('Tahun 412 AE · Musim Gugur');
  const [newTitle, setNewTitle] = useState<string>('');
  const [newCategory, setNewCategory] = useState<TimelineEvent['category']>('Peperangan');
  const [newRegion, setNewRegion] = useState<string>('');
  const [newSummary, setNewSummary] = useState<string>('');
  const [newLinkedEntityId, setNewLinkedEntityId] = useState<string>('');

  const sortedTimeline = [...timeline]
    .filter((ev) => filterCategory === 'ALL' || ev.category === filterCategory)
    .sort((a, b) => a.year - b.year);

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const created: TimelineEvent = {
      id: `time-${Date.now()}`,
      era: 'AE (Era Astral)',
      year: Number(newYear) || 1,
      displayDate: newDisplayDate.trim() || `Tahun ${newYear} AE`,
      title: newTitle.trim(),
      category: newCategory,
      summary: newSummary.trim() || 'Peristiwa penting dalam sejarah dunia.',
      linkedEntityIds: newLinkedEntityId ? [newLinkedEntityId] : [],
      regionName: newRegion.trim() || undefined,
    };
    onUpdateTimeline([...timeline, created]);
    setNewTitle('');
    setNewSummary('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#FBF8F1] border border-[#D8CBB3] rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs text-[#695A47] font-medium">
            Sistem Kalender Dunia: {calendarSystem}
          </div>
          <h2 className="font-display text-2xl font-bold text-[#231C14]">
            Linimasa Sejarah & Kronik Era
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              'ALL',
              'Peperangan',
              'Bencana Arcane',
              'Berdirinya Kerajaan',
              'Penemuan Pusaka',
              'Kelahiran Tokoh',
            ] as const
          ).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                filterCategory === cat
                  ? 'bg-[#231C14] text-[#FBF8F1]'
                  : 'bg-[#EFE7D6] text-[#695A47] hover:text-[#231C14]'
              }`}
            >
              {cat === 'ALL' ? 'Semua Peristiwa' : cat}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setShowAddForm((prev) => !prev)}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#9E2A2B] text-white hover:bg-[#7E2021] flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Catat Peristiwa Baru
          </button>
        </div>
      </div>

      {showAddForm && (
        <form
          onSubmit={handleAddEvent}
          className="bg-[#FBF8F1] border border-[#9E2A2B] rounded-xl p-5 space-y-4"
        >
          <div className="font-display text-lg font-bold text-[#231C14]">
            Tambah Kejadian ke Linimasa Dunia
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-[#695A47] mb-1">
                Angka Tahun (Urutan)
              </label>
              <input
                type="number"
                value={newYear}
                onChange={(e) => setNewYear(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs font-mono-tabular bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs text-[#695A47] mb-1">
                Label Penanggalan
              </label>
              <input
                type="text"
                value={newDisplayDate}
                onChange={(e) => setNewDisplayDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs text-[#695A47] mb-1">
                Jenis Peristiwa
              </label>
              <select
                value={newCategory}
                onChange={(e) =>
                  setNewCategory(e.target.value as TimelineEvent['category'])
                }
                className="w-full px-3 py-1.5 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg"
              >
                <option value="Peperangan">Peperangan</option>
                <option value="Bencana Arcane">Bencana Arcane</option>
                <option value="Berdirinya Kerajaan">Berdirinya Kerajaan</option>
                <option value="Penemuan Pusaka">Penemuan Pusaka</option>
                <option value="Kelahiran Tokoh">Kelahiran Tokoh</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#695A47] mb-1">
                Lokasi Wilayah
              </label>
              <input
                type="text"
                value={newRegion}
                onChange={(e) => setNewRegion(e.target.value)}
                placeholder="Contoh: Solis Prime"
                className="w-full px-3 py-1.5 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Judul Peristiwa Sejarah..."
              className="px-3 py-2 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg font-semibold"
            />
            <select
              value={newLinkedEntityId}
              onChange={(e) => setNewLinkedEntityId(e.target.value)}
              className="px-3 py-2 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg"
            >
              <option value="">-- Tautkan Entitas World Bible (Opsional) --</option>
              {entities.map((ent) => (
                <option key={ent.id} value={ent.id}>
                  [{CATEGORY_META[ent.category].singular}] {ent.title}
                </option>
              ))}
            </select>
          </div>

          <textarea
            rows={2}
            value={newSummary}
            onChange={(e) => setNewSummary(e.target.value)}
            placeholder="Uraian singkat dampak sejarah peristiwa ini..."
            className="w-full p-3 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg"
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 text-xs border border-[#D8CBB3] rounded-lg text-[#695A47] cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold bg-[#9E2A2B] text-white rounded-lg cursor-pointer"
            >
              Simpan ke Kronik
            </button>
          </div>
        </form>
      )}

      {/* Chronological Spine */}
      <div className="relative pl-6 md:pl-10 border-l border-[#B5832A] space-y-5 ml-3">
        {sortedTimeline.map((item) => {
          const linkedEntities = entities.filter((e) =>
            item.linkedEntityIds.includes(e.id)
          );
          return (
            <div
              key={item.id}
              className="relative bg-[#FBF8F1] border border-[#D8CBB3] rounded-xl p-5 hover:border-[#B5832A] transition-colors"
            >
              {/* Brass timeline node marker */}
              <div className="w-3.5 h-3.5 rounded-full bg-[#9E2A2B] border-2 border-[#FBF8F1] absolute -left-[31px] md:-left-[47px] top-6" />

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#695A47] mb-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono-tabular font-bold text-[#9E2A2B]">
                    {item.displayDate}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-medium text-[#231C14]">{item.category}</span>
                  {item.regionName && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>Lokasi: {item.regionName}</span>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onUpdateTimeline(timeline.filter((t) => t.id !== item.id))
                  }
                  className="text-[#695A47] hover:text-[#9E2A2B] cursor-pointer"
                  title="Hapus peristiwa"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <h3 className="font-display text-xl font-bold text-[#231C14]">
                {item.title}
              </h3>
              <p className="text-sm text-[#231C14]/90 mt-1.5 leading-relaxed">
                {item.summary}
              </p>

              {linkedEntities.length > 0 && (
                <div className="mt-3 pt-3 border-t border-[#D8CBB3]/70 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-[#695A47]">Entitas Terlibat:</span>
                  {linkedEntities.map((le) => (
                    <button
                      key={le.id}
                      type="button"
                      onClick={() => onSelectEntity(le.id)}
                      className="text-xs font-semibold text-[#9E2A2B] underline decoration-[#9E2A2B]/40 underline-offset-4 hover:decoration-[#9E2A2B] cursor-pointer"
                    >
                      {le.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
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
