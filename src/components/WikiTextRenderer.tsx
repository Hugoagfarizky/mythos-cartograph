import React, { useState } from 'react';
import { ChapterOutline, LoreCategory, LoreEntity } from '../types/world';

export const CATEGORY_META: Record<
  LoreCategory,
  {
    label: string;
    singular: string;
    arcanaTitle: string;
    romanNumeral: string;
    description: string;
    accentColor: string;
  }
> = {
  character: {
    label: 'Karakter & Tokoh',
    singular: 'Karakter',
    arcanaTitle: 'Dramatis Personae',
    romanNumeral: 'I',
    description: 'Tokoh protagonis, antagonis, penguasa, dan figur penting dalam cerita.',
    accentColor: 'var(--accent-wax)',
  },
  race: {
    label: 'Ras & Bangsa',
    singular: 'Ras',
    arcanaTitle: 'Origines & Silsilah',
    romanNumeral: 'II',
    description: 'Spesies cerdas, garis keturunan kuno, ciri biologis, dan budaya bawaan.',
    accentColor: 'var(--accent-forest)',
  },
  faction: {
    label: 'Kelompok & Faksi',
    singular: 'Kelompok',
    arcanaTitle: 'Ordo & Konklaf',
    romanNumeral: 'III',
    description: 'Ordo sihir, serikat dagang, klan militer, dan organisasi rahasia.',
    accentColor: 'var(--accent-brass)',
  },
  power_system: {
    label: 'Power System',
    singular: 'Power System',
    arcanaTitle: 'Hukum Arcana',
    romanNumeral: 'IV',
    description: 'Hukum sihir/energi, sumber kekuatan, hirarki tingkatan, dan batasan mutlak.',
    accentColor: 'var(--accent-cartography)',
  },
  skill: {
    label: 'Skill & Teknik',
    singular: 'Skill',
    arcanaTitle: 'Grimoire Rapalan',
    romanNumeral: 'V',
    description: 'Jurus, rapalan mantra, kemampuan khusus, biaya aktivasi, dan batas pakai.',
    accentColor: 'var(--accent-cartography)',
  },
  nation: {
    label: 'Negara & Kerajaan',
    singular: 'Negara',
    arcanaTitle: 'Kedaulatan Mahkota',
    romanNumeral: 'VI',
    description: 'Kekaisaran, persemakmuran, sistem pemerintahan, ibu kota, dan diplomasi.',
    accentColor: 'var(--accent-wax)',
  },
  region: {
    label: 'Wilayah & Geografi',
    singular: 'Wilayah',
    arcanaTitle: 'Terra Incognita',
    romanNumeral: 'VII',
    description: 'Bioma alam, pegunungan, hutan terlarang, sumber daya, dan bahaya wilayah.',
    accentColor: 'var(--accent-forest)',
  },
  history: {
    label: 'Sejarah & Peristiwa',
    singular: 'Sejarah',
    arcanaTitle: 'Annales & Kronik',
    romanNumeral: 'VIII',
    description: 'Perang besar, bencana masa lalu, perjanjian kuno, dan titik balik era.',
    accentColor: 'var(--ink-secondary)',
  },
  encyclopedia: {
    label: 'Artefak, Flora & Fauna',
    singular: 'Entri Ensiklopedia',
    arcanaTitle: 'Relikui & Herbarium',
    romanNumeral: 'IX',
    description: 'Relik pusaka, senjata legendaris, tanaman alkimia, dan aksara kuno.',
    accentColor: 'var(--accent-brass)',
  },
  cosmic_entity: {
    label: 'Entitas Kosmik & Primordial',
    singular: 'Entitas Kosmik',
    arcanaTitle: 'Entitas Astral & Kehampaan',
    romanNumeral: 'X',
    description: 'Wujud primordial pra-penciptaan, titan astral, naga kosmik, dan manifestasi hukum semesta di atas dewa.',
    accentColor: 'var(--accent-cartography)',
  },
  deity: {
    label: 'Dewa-Dewi & Pantheon',
    singular: 'Dewa / Dewi',
    arcanaTitle: 'Pantheon Ilahi',
    romanNumeral: 'XI',
    description: 'Dewa dan dewi yang disembah makhluk fana, domain kekuasaan, simbol suci, kuil, berkat, dan kutukan.',
    accentColor: 'var(--accent-brass)',
  },
  bestiary: {
    label: 'Bestiary Monster & Mitologi',
    singular: 'Monster Bestiary',
    arcanaTitle: 'Bestiarium Monstrorum',
    romanNumeral: 'XII',
    description: 'Monster buas, naga, makhluk mitologi, tingkat bahaya, habitat alami, kelemahan anatomis, dan material buruan.',
    accentColor: 'var(--accent-wax)',
  },
  culture_religion: {
    label: 'Agama, Adat & Budaya Bangsa',
    singular: 'Agama & Budaya',
    arcanaTitle: 'Ritus & Tradisi Peradaban',
    romanNumeral: 'XIII',
    description: 'Sistem kepercayaan, festival tahunan, ritus kehidupan, pantangan adat (taboo), kasta sosial, busana, dan kuliner.',
    accentColor: 'var(--accent-forest)',
  },
};

const PREVIEW_ATTR_LABELS: Record<string, string> = {
  role: 'Peran',
  status: 'Status',
  affiliation: 'Afiliasi',
  race: 'Ras',
  originRegion: 'Asal Wilayah',
  leader: 'Pemimpin',
  headquarters: 'Markas',
  capitalCity: 'Ibu Kota',
  government: 'Pemerintahan',
  ruler: 'Penguasa',
  parentNation: 'Negara Induk',
  dangerLevel: 'Tingkat Bahaya',
  climate: 'Iklim',
  energySource: 'Sumber Energi',
  powerSystemName: 'Sistem Induk',
  tierLevel: 'Tingkatan',
  rarity: 'Kelangkaan',
  subCategory: 'Sub-Kategori',
  currentOwnerOrWielder: 'Pemilik',
  eraDate: 'Penanggalan',
  cosmicScale: 'Skala Kosmik',
  originPlane: 'Dimensi Asal',
  divineRank: 'Peringkat Ilahi',
  divineDomains: 'Domain Kekuasaan',
  creatureClass: 'Klasifikasi Monster',
  dangerRating: 'Tingkat Bahaya',
  traditionType: 'Jenis Tradisi',
  practicingPeoples: 'Bangsa Penganut',
};

const ALL_LORE_CATEGORIES: LoreCategory[] = [
  'cosmic_entity',
  'deity',
  'character',
  'race',
  'bestiary',
  'faction',
  'power_system',
  'skill',
  'nation',
  'culture_religion',
  'region',
  'history',
  'encyclopedia',
];

export const OrnateCornerFiligree: React.FC<{ className?: string }> = ({
  className = 'text-[#B5832A]/75',
}) => {
  return (
    <div
      className={`absolute inset-0 pointer-events-none select-none !m-0 ${className}`}
      aria-hidden="true"
    >
      {/* Top-Left Illuminated Manuscript Corner */}
      <svg
        className="w-5 h-5 absolute top-1.5 left-1.5"
        viewBox="0 0 36 36"
        fill="none"
      >
        <path
          d="M2 28V6C2 3.79086 3.79086 2 6 2H28"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M6 20V6H20"
          stroke="currentColor"
          strokeWidth="1.15"
          strokeOpacity="0.8"
        />
        <path
          d="M6 12C9.5 12 12 9.5 12 6"
          stroke="currentColor"
          strokeWidth="1.1"
          strokeOpacity="0.7"
        />
        <polygon points="6,3.2 8.8,6 6,8.8 3.2,6" fill="currentColor" />
        <circle cx="15" cy="6" r="1.3" fill="currentColor" />
        <circle cx="6" cy="15" r="1.3" fill="currentColor" />
      </svg>

      {/* Top-Right Illuminated Manuscript Corner */}
      <svg
        className="w-5 h-5 absolute top-1.5 right-1.5"
        viewBox="0 0 36 36"
        fill="none"
      >
        <path
          d="M34 28V6C34 3.79086 32.2091 2 30 2H8"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M30 20V6H16"
          stroke="currentColor"
          strokeWidth="1.15"
          strokeOpacity="0.8"
        />
        <path
          d="M30 12C26.5 12 24 9.5 24 6"
          stroke="currentColor"
          strokeWidth="1.1"
          strokeOpacity="0.7"
        />
        <polygon points="30,3.2 32.8,6 30,8.8 27.2,6" fill="currentColor" />
        <circle cx="21" cy="6" r="1.3" fill="currentColor" />
        <circle cx="30" cy="15" r="1.3" fill="currentColor" />
      </svg>

      {/* Bottom-Left Illuminated Manuscript Corner */}
      <svg
        className="w-5 h-5 absolute bottom-1.5 left-1.5"
        viewBox="0 0 36 36"
        fill="none"
      >
        <path
          d="M2 8V30C2 32.2091 3.79086 34 6 34H28"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M6 16V30H20"
          stroke="currentColor"
          strokeWidth="1.15"
          strokeOpacity="0.8"
        />
        <path
          d="M6 24C9.5 24 12 26.5 12 30"
          stroke="currentColor"
          strokeWidth="1.1"
          strokeOpacity="0.7"
        />
        <polygon points="6,27.2 8.8,30 6,32.8 3.2,30" fill="currentColor" />
        <circle cx="15" cy="30" r="1.3" fill="currentColor" />
        <circle cx="6" cy="21" r="1.3" fill="currentColor" />
      </svg>

      {/* Bottom-Right Illuminated Manuscript Corner */}
      <svg
        className="w-5 h-5 absolute bottom-1.5 right-1.5"
        viewBox="0 0 36 36"
        fill="none"
      >
        <path
          d="M34 8V30C34 32.2091 32.2091 34 30 34H8"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M30 16V30H16"
          stroke="currentColor"
          strokeWidth="1.15"
          strokeOpacity="0.8"
        />
        <path
          d="M30 24C26.5 24 24 26.5 24 30"
          stroke="currentColor"
          strokeWidth="1.1"
          strokeOpacity="0.7"
        />
        <polygon points="30,27.2 32.8,30 30,32.8 27.2,30" fill="currentColor" />
        <circle cx="21" cy="30" r="1.3" fill="currentColor" />
        <circle cx="30" cy="21" r="1.3" fill="currentColor" />
      </svg>
    </div>
  );
};

export const BrassBookCornerClasps: React.FC = () => {
  return (
    <div
      className="absolute inset-0 pointer-events-none select-none !m-0 text-[#D49B35]"
      aria-hidden="true"
    >
      {/* Top-Left Brass Clasp */}
      <svg
        className="w-8 h-8 absolute top-0 left-0 z-10 drop-shadow-xs"
        viewBox="0 0 40 40"
        fill="none"
      >
        <path
          d="M2 34V10C2 5.58172 5.58172 2 10 2H34L26 10H12C10.8954 10 10 10.8954 10 12V26L2 34Z"
          fill="currentColor"
          fillOpacity="0.24"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <circle cx="7" cy="7" r="2" fill="currentColor" />
        <circle cx="19" cy="6" r="1.4" fill="currentColor" />
        <circle cx="6" cy="19" r="1.4" fill="currentColor" />
      </svg>
      {/* Top-Right Brass Clasp */}
      <svg
        className="w-8 h-8 absolute top-0 right-0 z-10 drop-shadow-xs"
        viewBox="0 0 40 40"
        fill="none"
      >
        <path
          d="M38 34V10C38 5.58172 34.4183 2 30 2H6L14 10H28C29.1046 10 30 10.8954 30 12V26L38 34Z"
          fill="currentColor"
          fillOpacity="0.24"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <circle cx="33" cy="7" r="2" fill="currentColor" />
        <circle cx="21" cy="6" r="1.4" fill="currentColor" />
        <circle cx="34" cy="19" r="1.4" fill="currentColor" />
      </svg>
      {/* Bottom-Left Brass Clasp */}
      <svg
        className="w-8 h-8 absolute bottom-0 left-0 z-10 drop-shadow-xs"
        viewBox="0 0 40 40"
        fill="none"
      >
        <path
          d="M2 6V30C2 34.4183 5.58172 38 10 38H34L26 30H12C10.8954 30 10 29.1046 10 28V14L2 6Z"
          fill="currentColor"
          fillOpacity="0.24"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <circle cx="7" cy="33" r="2" fill="currentColor" />
        <circle cx="19" cy="34" r="1.4" fill="currentColor" />
        <circle cx="6" cy="21" r="1.4" fill="currentColor" />
      </svg>
      {/* Bottom-Right Brass Clasp */}
      <svg
        className="w-8 h-8 absolute bottom-0 right-0 z-10 drop-shadow-xs"
        viewBox="0 0 40 40"
        fill="none"
      >
        <path
          d="M38 6V30C38 34.4183 34.4183 38 30 38H6L14 30H28C29.1046 30 30 29.1046 30 28V14L38 6Z"
          fill="currentColor"
          fillOpacity="0.24"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <circle cx="33" cy="33" r="2" fill="currentColor" />
        <circle cx="21" cy="34" r="1.4" fill="currentColor" />
        <circle cx="34" cy="21" r="1.4" fill="currentColor" />
      </svg>
    </div>
  );
};

export const MedievalCompassDivider: React.FC<{
  label?: string;
  className?: string;
}> = ({ label, className = '' }) => {
  return (
    <div
      className={`flex items-center justify-center gap-3 py-1 select-none ${className}`}
      aria-hidden={!label}
    >
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#B5832A]/60 to-[#9E2A2B]/65" />
      <div className="flex items-center gap-2 text-[#B5832A]">
        <span className="text-[10px] text-[#9E2A2B]">◆</span>
        <svg className="w-4 h-4 text-[#B5832A]" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 1L14.2 9.8L23 12L14.2 14.2L12 23L9.8 14.2L1 12L9.8 9.8L12 1Z"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="currentColor"
            fillOpacity="0.2"
          />
          <circle cx="12" cy="12" r="2" fill="#9E2A2B" />
        </svg>
        {label && (
          <span className="font-epic text-[11px] font-bold uppercase tracking-[0.18em] text-[#9E2A2B] px-1">
            {label}
          </span>
        )}
        {label && (
          <svg
            className="w-4 h-4 text-[#B5832A]"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M12 1L14.2 9.8L23 12L14.2 14.2L12 23L9.8 14.2L1 12L9.8 9.8L12 1Z"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="currentColor"
              fillOpacity="0.2"
            />
            <circle cx="12" cy="12" r="2" fill="#9E2A2B" />
          </svg>
        )}
        <span className="text-[10px] text-[#9E2A2B]">◆</span>
      </div>
      <div className="flex-1 h-px bg-gradient-to-l from-transparent via-[#B5832A]/60 to-[#9E2A2B]/65" />
    </div>
  );
};

export const FantasySectionDivider: React.FC<{ title?: string }> = ({ title }) => {
  return (
    <div className="flex items-center justify-center gap-3 py-1.5 select-none" aria-hidden={!title}>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#B5832A]/60 to-[#9E2A2B]/60" />
      <div className="flex items-center gap-2 text-[#B5832A]">
        <span className="text-[10px]">❖</span>
        {title ? (
          <span className="font-epic text-[11px] font-bold uppercase tracking-[0.18em] text-[#9E2A2B]">
            {title}
          </span>
        ) : (
          <span className="text-xs text-[#9E2A2B]">✦</span>
        )}
        <span className="text-[10px]">❖</span>
      </div>
      <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[#B5832A]/60 to-[#9E2A2B]/60" />
    </div>
  );
};

interface WikiEntityLinkWithPreviewProps {
  label: string;
  entity: LoreEntity;
  onSelectEntity: (entityId: string) => void;
}

const WikiEntityLinkWithPreview: React.FC<WikiEntityLinkWithPreviewProps> = ({
  label,
  entity,
  onSelectEntity,
}) => {
  const [hovered, setHovered] = useState(false);
  const meta = CATEGORY_META[entity.category];

  const keyAttrs = Object.entries(entity.attributes || {})
    .filter(
      ([key, val]) =>
        PREVIEW_ATTR_LABELS[key] &&
        val !== undefined &&
        String(val).trim() !== ''
    )
    .slice(0, 3);

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        type="button"
        onClick={() => onSelectEntity(entity.id)}
        className="inline font-semibold text-[#9E2A2B] underline decoration-[#B5832A]/75 decoration-dotted underline-offset-4 hover:decoration-solid hover:bg-[#B5832A]/15 px-1 rounded transition-colors cursor-pointer"
      >
        {label}
      </button>

      {hovered && (
        <span
          role="tooltip"
          onClick={() => onSelectEntity(entity.id)}
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 sm:w-80 p-3.5 rounded-xl bg-[#FBF8F1] border-2 border-[#B5832A] shadow-2xl text-left cursor-pointer block animate-in fade-in duration-150"
        >
          {/* Top Arcana Banner */}
          <span className="flex items-center justify-between gap-2 pb-1.5 mb-2 border-b border-[#D8CBB3] text-[10px] font-epic uppercase tracking-widest text-[#B5832A]">
            <span>
              Arcana {meta.romanNumeral} · {meta.singular}
            </span>
            <span className="text-[#9E2A2B] font-semibold">Kodeks ↗</span>
          </span>

          {/* Entity Header with Optional Portrait */}
          <span className="flex items-start gap-2.5">
            {entity.imageUrl ? (
              <img
                src={entity.imageUrl}
                alt={entity.title}
                className="w-11 h-11 rounded-lg object-cover border border-[#B5832A] shrink-0"
              />
            ) : (
              <span className="w-10 h-10 rounded-lg bg-[#EFE7D6] border border-[#B5832A]/60 flex items-center justify-center font-cartography text-sm font-bold text-[#9E2A2B] shrink-0">
                {entity.title.slice(0, 2).toUpperCase()}
              </span>
            )}
            <span className="min-w-0 block">
              <span className="font-display text-sm font-bold text-[#231C14] block leading-snug">
                {entity.title}
              </span>
              {entity.subtitle && (
                <span className="text-[11px] italic text-[#695A47] block truncate">
                  {entity.subtitle}
                </span>
              )}
            </span>
          </span>

          {/* Key Attributes Strip */}
          {keyAttrs.length > 0 && (
            <span className="mt-2.5 pt-2 border-t border-[#D8CBB3]/60 grid grid-cols-1 gap-1 text-[11px]">
              {keyAttrs.map(([k, v]) => (
                <span key={k} className="flex items-center justify-between gap-2">
                  <span className="text-[#695A47] font-medium">
                    {PREVIEW_ATTR_LABELS[k]}:
                  </span>
                  <span className="font-semibold text-[#231C14] truncate max-w-[170px]">
                    {String(v)}
                  </span>
                </span>
              ))}
            </span>
          )}

          {/* Summary Snippet */}
          <span className="mt-2 pt-2 border-t border-[#D8CBB3]/60 text-xs text-[#231C14]/90 line-clamp-3 leading-relaxed block">
            {entity.summary}
          </span>
        </span>
      )}
    </span>
  );
};

interface UncreatedWikiLinkPopoverProps {
  refName: string;
  onQuickCreateEntity?: (
    title: string,
    category: LoreCategory,
    openAfterCreate?: boolean
  ) => void;
}

const UncreatedWikiLinkPopover: React.FC<UncreatedWikiLinkPopoverProps> = ({
  refName,
  onQuickCreateEntity,
}) => {
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<LoreCategory>('character');

  if (!onQuickCreateEntity) {
    return (
      <span
        className="inline font-medium text-[#B5832A] border-b border-dashed border-[#B5832A]"
        title="Entitas belum dibuat di Codex"
      >
        {refName}
      </span>
    );
  }

  return (
    <span className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-1 font-semibold text-[#B5832A] hover:text-[#9E2A2B] border-b border-dashed border-[#B5832A] hover:border-[#9E2A2B] hover:bg-[#B5832A]/15 px-1 rounded transition-colors cursor-pointer"
        title={`"${refName}" belum ada di Codex — Klik untuk membuat entitas baru`}
      >
        <span className="text-[11px] font-bold">+</span>
        <span>{refName}</span>
      </button>

      {open && (
        <span
          role="dialog"
          aria-label={`Buat entitas baru ${refName}`}
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 sm:w-80 p-3.5 rounded-xl bg-[#FBF8F1] border-2 border-[#B5832A] shadow-2xl text-left block"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="flex items-center justify-between gap-2 pb-1.5 mb-2 border-b border-[#D8CBB3] text-[10px] font-epic uppercase tracking-widest text-[#9E2A2B]">
            <span>❖ Entitas Baru dari Tautan</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-[#695A47] hover:text-[#231C14] font-mono-tabular px-1 cursor-pointer"
            >
              ✕
            </button>
          </span>

          <span className="font-display text-sm font-bold text-[#231C14] block mb-1">
            “{refName}”
          </span>
          <span className="text-[11px] text-[#695A47] block mb-2.5 leading-snug">
            Tautan ini belum memiliki halaman di World Bible. Pilih kategori untuk membuatnya secara instan:
          </span>

          <span className="block mb-3">
            <label className="block text-[10px] font-epic uppercase tracking-wider text-[#695A47] mb-1">
              Kategori World Bible
            </label>
            <select
              value={selectedCategory}
              onChange={(e) =>
                setSelectedCategory(e.target.value as LoreCategory)
              }
              className="w-full px-2.5 py-1.5 text-xs bg-[#F6F1E6] border border-[#D8CBB3] rounded-lg text-[#231C14] font-semibold"
            >
              {ALL_LORE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  Arcana {CATEGORY_META[cat].romanNumeral} ·{' '}
                  {CATEGORY_META[cat].label}
                </option>
              ))}
            </select>
          </span>

          <span className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                onQuickCreateEntity(refName, selectedCategory, false);
                setOpen(false);
              }}
              className="flex-1 px-2.5 py-1.5 text-[11px] font-semibold bg-[#9E2A2B] text-white rounded-lg hover:bg-[#7E2021] text-center whitespace-nowrap cursor-pointer"
            >
              + Buat Otomatis
            </button>
            <button
              type="button"
              onClick={() => {
                onQuickCreateEntity(refName, selectedCategory, true);
                setOpen(false);
              }}
              className="px-2.5 py-1.5 text-[11px] font-semibold bg-[#231C14] text-[#FBF8F1] rounded-lg hover:bg-[#3A2E21] text-center whitespace-nowrap cursor-pointer"
            >
              Buat & Buka ↗
            </button>
          </span>
        </span>
      )}
    </span>
  );
};

interface WikiTextRendererProps {
  text: string;
  entities: LoreEntity[];
  onSelectEntity: (entityId: string) => void;
  onQuickCreateEntity?: (
    title: string,
    category: LoreCategory,
    openAfterCreate?: boolean
  ) => void;
  dropCap?: boolean;
}

export const WikiTextRenderer: React.FC<WikiTextRendererProps> = ({
  text,
  entities,
  onSelectEntity,
  onQuickCreateEntity,
  dropCap = false,
}) => {
  if (!text) return null;

  const paragraphs = text.split('\n\n');

  const renderInlineLinks = (paragraph: string) => {
    const parts = paragraph.split(/(\[\[[^\]]+\]\])/g);
    return parts.map((part, index) => {
      if (part.startsWith('[[') && part.endsWith(']]')) {
        const refName = part.slice(2, -2).trim();
        const matched = entities.find(
          (e) =>
            e.title.toLowerCase() === refName.toLowerCase() ||
            e.title.toLowerCase().includes(refName.toLowerCase()) ||
            refName.toLowerCase().includes(e.title.toLowerCase())
        );

        if (matched) {
          return (
            <WikiEntityLinkWithPreview
              key={index}
              label={refName}
              entity={matched}
              onSelectEntity={onSelectEntity}
            />
          );
        }

        return (
          <UncreatedWikiLinkPopover
            key={index}
            refName={refName}
            onQuickCreateEntity={onQuickCreateEntity}
          />
        );
      }

      return <React.Fragment key={index}>{part}</React.Fragment>;
    });
  };

  return (
    <div
      className={`space-y-3.5 text-[15px] leading-relaxed text-[#231C14] ${
        dropCap ? 'fantasy-dropcap' : ''
      }`}
    >
      {paragraphs.map((para, idx) => {
        const trimmed = para.trim();
        if (trimmed.startsWith('### ')) {
          return (
            <h4
              key={idx}
              className="font-display text-lg font-bold text-[#231C14] pt-3 border-b border-[#B5832A]/45 pb-1 flex items-center gap-2 clear-both"
            >
              <span className="text-[#B5832A] text-xs" aria-hidden="true">
                ❖
              </span>
              <span>{trimmed.replace('### ', '')}</span>
            </h4>
          );
        }
        return (
          <p key={idx} className="whitespace-pre-line">
            {renderInlineLinks(para)}
          </p>
        );
      })}
    </div>
  );
};

export function findBacklinksForEntity(
  targetEntity: LoreEntity,
  allEntities: LoreEntity[],
  chapters: ChapterOutline[]
): { linkedEntities: LoreEntity[]; linkedChapters: ChapterOutline[] } {
  const needle = `[[${targetEntity.title.toLowerCase()}]]`;
  const titleLower = targetEntity.title.toLowerCase();

  const linkedEntities = allEntities.filter((item) => {
    if (item.id === targetEntity.id) return false;
    const contentLower = item.content.toLowerCase();
    const summaryLower = item.summary.toLowerCase();
    const attrValues = Object.values(item.attributes)
      .flat()
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return (
      contentLower.includes(needle) ||
      contentLower.includes(titleLower) ||
      summaryLower.includes(titleLower) ||
      attrValues.includes(titleLower)
    );
  });

  const linkedChapters = chapters.filter((ch) => {
    const notesLower = ch.draftNotes.toLowerCase();
    const synLower = ch.synopsis.toLowerCase();
    return (
      ch.featuredEntityIds.includes(targetEntity.id) ||
      notesLower.includes(needle) ||
      notesLower.includes(titleLower) ||
      synLower.includes(titleLower)
    );
  });

  return { linkedEntities, linkedChapters };
}
