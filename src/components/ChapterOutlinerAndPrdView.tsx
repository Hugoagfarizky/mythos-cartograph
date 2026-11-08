import React, { useState } from 'react';
import {
  BookMarked,
  CheckCircle2,
  Edit3,
  FileText,
  Layers,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { ChapterOutline, LoreEntity, WorldProject } from '../types/world';
import { CATEGORY_META, WikiTextRenderer } from './WikiTextRenderer';

interface ChapterOutlinerViewProps {
  chapters: ChapterOutline[];
  entities: LoreEntity[];
  selectedChapterId: string;
  onSelectChapter: (id: string) => void;
  onUpdateChapters: (next: ChapterOutline[]) => void;
  onSelectEntity: (id: string) => void;
  onRunAuditOnChapter: (chapter: ChapterOutline) => void;
}

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
  const [newSceneTitle, setNewSceneTitle] = useState<string>('');
  const [newScenePov, setNewScenePov] = useState<string>('');
  const [newSceneRegion, setNewSceneRegion] = useState<string>('');
  const [newSceneSummary, setNewSceneSummary] = useState<string>('');

  const activeChapter =
    chapters.find((c) => c.id === selectedChapterId) || chapters[0] || null;

  const handleAddChapter = () => {
    const nextNum = chapters.length + 1;
    const created: ChapterOutline = {
      id: `chap-${Date.now()}`,
      chapterNumber: nextNum,
      act: 'Babak I: Bayang-Bayang di Atas Kertas Perkamen',
      title: `Bab Baru ${nextNum}`,
      status: 'Rencana',
      synopsis: 'Ringkasan konflik dan tujuan naratif pada bab ini.',
      draftNotes:
        'Tuliskan draf adegan atau catatan bab di sini. Gunakan [[Archmage Vaelen Thorne]] atau [[Astrolabe Api Surya]] untuk menautkan entitas World Bible.',
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

  const handleAddScene = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChapter || !newSceneTitle.trim()) return;
    const nextScene = {
      id: `sc-${Date.now()}`,
      title: newSceneTitle.trim(),
      povCharacter: newScenePov.trim() || 'Sudut Pandang Utama',
      settingRegion: newSceneRegion.trim() || 'Lokasi Bab',
      summary: newSceneSummary.trim() || 'Rincian jalannya adegan.',
    };
    handleUpdateActiveChapter({
      scenes: [...activeChapter.scenes, nextScene],
    });
    setNewSceneTitle('');
    setNewSceneSummary('');
  };

  const toggleFeaturedEntity = (entityId: string) => {
    if (!activeChapter) return;
    const exists = activeChapter.featuredEntityIds.includes(entityId);
    const nextIds = exists
      ? activeChapter.featuredEntityIds.filter((id) => id !== entityId)
      : [...activeChapter.featuredEntityIds, entityId];
    handleUpdateActiveChapter({ featuredEntityIds: nextIds });
  };

  const totalWords = chapters.reduce((acc, c) => acc + c.currentWordCount, 0);
  const totalTarget = chapters.reduce((acc, c) => acc + c.wordCountTarget, 0);

  return (
    <div className="space-y-5">
      {/* Header Summary Bar */}
      <div className="bg-[#FBF8F1] border border-[#D8CBB3] rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs text-[#695A47]">
            Penyusun Alur Naskah Terintegrasi World Bible · Total Progres:{' '}
            <span className="font-mono-tabular font-semibold text-[#231C14]">
              {totalWords.toLocaleString('id-ID')} / {totalTarget.toLocaleString('id-ID')} kata
            </span>
          </div>
          <h2 className="font-display text-2xl font-bold text-[#231C14]">
            Plot & Chapter Outliner
          </h2>
        </div>

        <button
          type="button"
          onClick={handleAddChapter}
          className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#9E2A2B] text-white hover:bg-[#7E2021] flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Tambah Bab Baru
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Chapter List */}
        <div className="lg:col-span-4 bg-[#FBF8F1] border border-[#D8CBB3] rounded-xl p-4 space-y-2.5">
          <div className="text-xs font-semibold text-[#695A47] px-1">
            Daftar Bab Cerita ({chapters.length})
          </div>
          {chapters.map((ch) => {
            const isSelected = activeChapter?.id === ch.id;
            return (
              <button
                key={ch.id}
                type="button"
                onClick={() => {
                  onSelectChapter(ch.id);
                  setIsEditing(false);
                }}
                className={`w-full text-left p-3.5 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#EFE7D6] border-[#9E2A2B]'
                    : 'bg-[#F6F1E6] border-[#D8CBB3] hover:bg-[#EFE7D6]/60'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] text-[#695A47] mb-1">
                  <span className="font-mono-tabular font-semibold text-[#9E2A2B]">
                    Bab {ch.chapterNumber}
                  </span>
                  <span>
                    {ch.status} ·{' '}
                    <span className="font-mono-tabular">
                      {ch.currentWordCount} kata
                    </span>
                  </span>
                </div>
                <div className="font-display text-lg font-bold text-[#231C14]">
                  {ch.title}
                </div>
                <p className="text-xs text-[#695A47] line-clamp-2 mt-1">
                  {ch.synopsis}
                </p>
              </button>
            );
          })}
        </div>

        {/* Right Chapter Detail & Manuscript Notes */}
        <div className="lg:col-span-8 bg-[#FBF8F1] border border-[#D8CBB3] rounded-xl p-6">
          {activeChapter ? (
            <div className="space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#D8CBB3] pb-4">
                <div>
                  <div className="text-xs text-[#695A47] font-medium">
                    {activeChapter.act} · Status: {activeChapter.status}
                  </div>
                  <h3 className="font-display text-3xl font-bold text-[#231C14] mt-0.5">
                    Bab {activeChapter.chapterNumber}: {activeChapter.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onRunAuditOnChapter(activeChapter)}
                    className="px-3 py-1.5 text-xs font-semibold border border-[#B5832A] bg-[#F6F1E6] text-[#231C14] hover:bg-[#EFE7D6] rounded-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#9E2A2B]" />
                    Audit Konsistensi Bab (AI)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing((prev) => !prev)}
                    className="px-3 py-1.5 text-xs font-semibold bg-[#231C14] text-[#FBF8F1] rounded-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    {isEditing ? 'Selesai Sunting' : 'Sunting Bab'}
                  </button>
                </div>
              </div>

              {isEditing ? (
                <div className="space-y-4 bg-[#F6F1E6] p-4 rounded-xl border border-[#D8CBB3]">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-xs text-[#695A47] mb-1">
                        Judul Bab
                      </label>
                      <input
                        type="text"
                        value={activeChapter.title}
                        onChange={(e) =>
                          handleUpdateActiveChapter({ title: e.target.value })
                        }
                        className="w-full px-3 py-1.5 text-sm bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#695A47] mb-1">
                        Status Penulisan
                      </label>
                      <select
                        value={activeChapter.status}
                        onChange={(e) =>
                          handleUpdateActiveChapter({
                            status: e.target.value as ChapterOutline['status'],
                          })
                        }
                        className="w-full px-3 py-1.5 text-sm bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                      >
                        <option value="Rencana">Rencana</option>
                        <option value="Sedang Ditulis">Sedang Ditulis</option>
                        <option value="Revisi">Revisi</option>
                        <option value="Selesai">Selesai</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-[#695A47] mb-1">
                      Sinopsis Bab
                    </label>
                    <input
                      type="text"
                      value={activeChapter.synopsis}
                      onChange={(e) =>
                        handleUpdateActiveChapter({ synopsis: e.target.value })
                      }
                      className="w-full px-3 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-[#695A47] mb-1">
                      Catatan Naskah & Draf Adegan (Gunakan [[Nama Entitas]] untuk tautan otomatis)
                    </label>
                    <textarea
                      rows={6}
                      value={activeChapter.draftNotes}
                      onChange={(e) =>
                        handleUpdateActiveChapter({
                          draftNotes: e.target.value,
                          currentWordCount:
                            e.target.value.trim().split(/\s+/).length * 15,
                        })
                      }
                      className="w-full p-3 text-sm bg-[#FBF8F1] border border-[#D8CBB3] rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-[#695A47] mb-1.5">
                      Tautkan Karakter, Lokasi, atau Pusaka yang Muncul di Bab Ini:
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
                                : 'bg-[#FBF8F1] text-[#231C14] border-[#D8CBB3]'
                            }`}
                          >
                            {ent.title}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-[#F6F1E6] border border-[#D8CBB3]">
                    <div className="text-xs font-semibold text-[#695A47] mb-1">
                      Sinopsis Eksekutif Bab
                    </div>
                    <p className="text-sm text-[#231C14] leading-relaxed">
                      {activeChapter.synopsis}
                    </p>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-[#695A47] mb-2">
                      Kutipan Naskah & Catatan Lore Terhubung
                    </div>
                    <div className="p-5 rounded-xl bg-[#F6F1E6]/70 border border-[#D8CBB3]">
                      <WikiTextRenderer
                        text={activeChapter.draftNotes}
                        entities={entities}
                        onSelectEntity={onSelectEntity}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Featured Entities in this Chapter */}
              <div>
                <div className="text-xs font-semibold text-[#695A47] mb-2">
                  Elemen World Bible yang Terlibat di Bab Ini
                </div>
                <div className="flex flex-wrap gap-2">
                  {activeChapter.featuredEntityIds.map((id) => {
                    const ent = entities.find((e) => e.id === id);
                    if (!ent) return null;
                    return (
                      <button
                        key={ent.id}
                        type="button"
                        onClick={() => onSelectEntity(ent.id)}
                        className="px-3 py-1.5 rounded-lg bg-[#EFE7D6] hover:bg-[#D8CBB3] border border-[#D8CBB3] text-xs font-semibold text-[#231C14] cursor-pointer"
                      >
                        [{CATEGORY_META[ent.category].singular}] {ent.title} →
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Scene Breakdown */}
              <div className="pt-4 border-t border-[#D8CBB3] space-y-3">
                <div className="text-xs font-semibold text-[#695A47]">
                  Urutan Adegan (Scene Beats) — {activeChapter.scenes.length} Adegan
                </div>
                <div className="space-y-2.5">
                  {activeChapter.scenes.map((sc, idx) => (
                    <div
                      key={sc.id}
                      className="p-3.5 rounded-lg bg-[#F6F1E6] border border-[#D8CBB3] flex items-start justify-between gap-3"
                    >
                      <div>
                        <div className="text-xs text-[#695A47]">
                          <span className="font-mono-tabular font-semibold text-[#9E2A2B]">
                            Adegan {idx + 1}
                          </span>{' '}
                          · POV: {sc.povCharacter} · Latar: {sc.settingRegion}
                        </div>
                        <div className="font-display text-base font-bold text-[#231C14] mt-0.5">
                          {sc.title}
                        </div>
                        <p className="text-xs text-[#695A47] mt-1">{sc.summary}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateActiveChapter({
                            scenes: activeChapter.scenes.filter(
                              (item) => item.id !== sc.id
                            ),
                          })
                        }
                        className="text-[#695A47] hover:text-[#9E2A2B] cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Quick Add Scene Form */}
                <form
                  onSubmit={handleAddScene}
                  className="p-3.5 rounded-lg bg-[#EFE7D6]/60 border border-[#D8CBB3] grid grid-cols-1 md:grid-cols-4 gap-2"
                >
                  <input
                    type="text"
                    required
                    value={newSceneTitle}
                    onChange={(e) => setNewSceneTitle(e.target.value)}
                    placeholder="Judul Adegan Baru..."
                    className="px-2.5 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded"
                  />
                  <input
                    type="text"
                    value={newScenePov}
                    onChange={(e) => setNewScenePov(e.target.value)}
                    placeholder="Tokoh POV..."
                    className="px-2.5 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded"
                  />
                  <input
                    type="text"
                    value={newSceneRegion}
                    onChange={(e) => setNewSceneRegion(e.target.value)}
                    placeholder="Lokasi Wilayah..."
                    className="px-2.5 py-1.5 text-xs bg-[#FBF8F1] border border-[#D8CBB3] rounded"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-xs font-semibold bg-[#231C14] text-[#FBF8F1] rounded cursor-pointer"
                  >
                    + Tambah Adegan
                  </button>
                </form>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

interface PrdBlueprintViewProps {
  project: WorldProject;
  onUpdateProjectMeta: (patch: Partial<WorldProject>) => void;
  onNavigateModule: (
    mod: 'codex' | 'map' | 'timeline' | 'graph' | 'outliner' | 'prd'
  ) => void;
}

export const PrdBlueprintView: React.FC<PrdBlueprintViewProps> = ({
  project,
  onUpdateProjectMeta,
  onNavigateModule,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-[#FBF8F1] border border-[#D8CBB3] rounded-xl p-6 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#D8CBB3] pb-4">
          <div>
            <div className="text-xs font-semibold text-[#9E2A2B]">
              Product Requirements Document (PRD) & Konfigurasi Semesta Cerita
            </div>
            <h2 className="font-display text-3xl font-bold text-[#231C14]">
              Cetak Biru Platform MythosCartograph
            </h2>
            <p className="text-sm text-[#695A47] mt-1 max-w-3xl">
              Halaman ini mendokumentasikan spesifikasi konsep (PRD) yang telah diimplementasikan secara penuh ke dalam ruang kerja Anda, sekaligus menjadi pusat pengaturan identitas proyek dunia cerita.
            </p>
          </div>
        </div>

        {/* Editable World Project Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-[#695A47] mb-1">
              Nama Dunia / Judul Proyek
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
              Genre & Sub-Genre
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
              Sistem Penanggalan / Era
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
              Nama Penulis / Arsiparis
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
      </div>

      {/* PRD Pillar Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-[#FBF8F1] border border-[#D8CBB3] rounded-xl p-5 space-y-3">
          <div className="text-xs font-semibold text-[#9E2A2B]">
            01. Pilar World Bible Codex (9 Kategori)
          </div>
          <h3 className="font-display text-xl font-bold text-[#231C14]">
            Manajemen Entitas & Wiki Cross-Link
          </h3>
          <p className="text-xs text-[#695A47] leading-relaxed">
            Menyimpan seluruh kanon cerita dengan atribut terstruktur khusus untuk Karakter, Ras, Kelompok/Faksi, Negara, Wilayah, Sejarah, Power System, Skill, serta Ensiklopedia Artefak/Flora/Fauna.
          </p>
          <ul className="text-xs text-[#231C14] space-y-1.5 pt-1">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2D5A43] shrink-0" />
              <span>Sintaks [[Nama Entitas]] untuk tautan dua arah otomatis</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2D5A43] shrink-0" />
              <span>Panel Backlinks: lacak di mana saja entitas disebut</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2D5A43] shrink-0" />
              <span>Atribut Hard Magic untuk Power System & Skill</span>
            </li>
          </ul>
          <button
            type="button"
            onClick={() => onNavigateModule('codex')}
            className="w-full mt-2 py-2 text-xs font-semibold bg-[#EFE7D6] hover:bg-[#D8CBB3] text-[#231C14] rounded-lg transition-colors cursor-pointer"
          >
            Buka Modul World Bible Codex →
          </button>
        </div>

        <div className="bg-[#FBF8F1] border border-[#D8CBB3] rounded-xl p-5 space-y-3">
          <div className="text-xs font-semibold text-[#9E2A2B]">
            02. Pilar Kartografi Interaktif
          </div>
          <h3 className="font-display text-xl font-bold text-[#231C14]">
            Medieval Map Sandbox Canvas
          </h3>
          <p className="text-xs text-[#695A47] leading-relaxed">
            Kanvas *sandbox* bergaya peta perkamen abad pertengahan untuk melukis bentuk benua, menaruh simbol kartografi klasik, dan menghubungkan titik geografis ke basis data lore.
          </p>
          <ul className="text-xs text-[#231C14] space-y-1.5 pt-1">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2D5A43] shrink-0" />
              <span>8 Kuas Bioma (Daratan, Samudra, Gunung, Rimba, Gurun, Rawa)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2D5A43] shrink-0" />
              <span>Stempel Ikon Abad Pertengahan & Label Kaligrafi Wilayah</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2D5A43] shrink-0" />
              <span>Klik Pin untuk membuka detail Negara/Wilayah + Ekspor PNG</span>
            </li>
          </ul>
          <button
            type="button"
            onClick={() => onNavigateModule('map')}
            className="w-full mt-2 py-2 text-xs font-semibold bg-[#EFE7D6] hover:bg-[#D8CBB3] text-[#231C14] rounded-lg transition-colors cursor-pointer"
          >
            Buka Medieval Map Sandbox →
          </button>
        </div>

        <div className="bg-[#FBF8F1] border border-[#D8CBB3] rounded-xl p-5 space-y-3">
          <div className="text-xs font-semibold text-[#9E2A2B]">
            03. Pilar Naratif & Asisten AI
          </div>
          <h3 className="font-display text-xl font-bold text-[#231C14]">
            Timeline, Relasi, Outliner & Audit AI
          </h3>
          <p className="text-xs text-[#695A47] leading-relaxed">
            Menjaga kesinambungan alur cerita dari masa lalu hingga bab terbaru melalui visualisasi kronologis, peta jaringan politik, dan pemeriksaan *plot hole* berbasis AI.
          </p>
          <ul className="text-xs text-[#231C14] space-y-1.5 pt-1">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2D5A43] shrink-0" />
              <span>Kanvas Relationship Graph interaktif yang dapat digeser</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2D5A43] shrink-0" />
              <span>Plot & Chapter Outliner dengan rincian adegan (Scenes)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2D5A43] shrink-0" />
              <span>AI Lore Consistency Checker untuk mencegah kontradiksi cerita</span>
            </li>
          </ul>
          <button
            type="button"
            onClick={() => onNavigateModule('outliner')}
            className="w-full mt-2 py-2 text-xs font-semibold bg-[#EFE7D6] hover:bg-[#D8CBB3] text-[#231C14] rounded-lg transition-colors cursor-pointer"
          >
            Buka Plot & Chapter Outliner →
          </button>
        </div>
      </div>
    </div>
  );
};
