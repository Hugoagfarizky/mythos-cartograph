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
    accentColor: '#9E2A2B',
  },
  race: {
    label: 'Ras & Bangsa',
    singular: 'Ras',
    arcanaTitle: 'Origines & Silsilah',
    romanNumeral: 'II',
    description: 'Spesies cerdas, garis keturunan kuno, ciri biologis, dan budaya bawaan.',
    accentColor: '#2D5A43',
  },
  faction: {
    label: 'Kelompok & Faksi',
    singular: 'Kelompok',
    arcanaTitle: 'Ordo & Konklaf',
    romanNumeral: 'III',
    description: 'Ordo sihir, serikat dagang, klan militer, dan organisasi rahasia.',
    accentColor: '#B5832A',
  },
  power_system: {
    label: 'Power System',
    singular: 'Power System',
    arcanaTitle: 'Hukum Arcana',
    romanNumeral: 'IV',
    description: 'Hukum sihir/energi, sumber kekuatan, hirarki tingkatan, dan batasan mutlak.',
    accentColor: '#264653',
  },
  skill: {
    label: 'Skill & Teknik',
    singular: 'Skill',
    arcanaTitle: 'Grimoire Rapalan',
    romanNumeral: 'V',
    description: 'Jurus, rapalan mantra, kemampuan khusus, biaya aktivasi, dan batas pakai.',
    accentColor: '#264653',
  },
  nation: {
    label: 'Negara & Kerajaan',
    singular: 'Negara',
    arcanaTitle: 'Kedaulatan Mahkota',
    romanNumeral: 'VI',
    description: 'Kekaisaran, persemakmuran, sistem pemerintahan, ibu kota, dan diplomasi.',
    accentColor: '#9E2A2B',
  },
  region: {
    label: 'Wilayah & Geografi',
    singular: 'Wilayah',
    arcanaTitle: 'Terra Incognita',
    romanNumeral: 'VII',
    description: 'Bioma alam, pegunungan, hutan terlarang, sumber daya, dan bahaya wilayah.',
    accentColor: '#2D5A43',
  },
  history: {
    label: 'Sejarah & Peristiwa',
    singular: 'Sejarah',
    arcanaTitle: 'Annales & Kronik',
    romanNumeral: 'VIII',
    description: 'Perang besar, bencana masa lalu, perjanjian kuno, dan titik balik era.',
    accentColor: '#695A47',
  },
  encyclopedia: {
    label: 'Artefak, Flora & Fauna',
    singular: 'Entri Ensiklopedia',
    arcanaTitle: 'Relikui & Bestiary',
    romanNumeral: 'IX',
    description: 'Relik pusaka, senjata legendaris, tanaman alkimia, dan makhluk mitologi.',
    accentColor: '#B5832A',
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
};

export const OrnateCornerFiligree: React.FC<{ className?: string }> = ({
  className = 'text-[#B5832A]/65',
}) => {
  return (
    <div className={`pointer-events-none select-none ${className}`} aria-hidden="true">
      {/* Top-Left Corner */}
      <svg
        className="w-6 h-6 absolute top-2 left-2"
        viewBox="0 0 32 32"
        fill="none"
      >
        <path
          d="M2 22V6C2 3.79086 3.79086 2 6 2H22"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M6 14V6H14"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeOpacity="0.75"
        />
        <circle cx="6" cy="6" r="2" fill="currentColor" />
      </svg>
      {/* Top-Right Corner */}
      <svg
        className="w-6 h-6 absolute top-2 right-2"
        viewBox="0 0 32 32"
        fill="none"
      >
        <path
          d="M30 22V6C30 3.79086 28.2091 2 26 2H10"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M26 14V6H18"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeOpacity="0.75"
        />
        <circle cx="26" cy="6" r="2" fill="currentColor" />
      </svg>
      {/* Bottom-Left Corner */}
      <svg
        className="w-6 h-6 absolute bottom-2 left-2"
        viewBox="0 0 32 32"
        fill="none"
      >
        <path
          d="M2 10V26C2 28.2091 3.79086 30 6 30H22"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M6 18V26H14"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeOpacity="0.75"
        />
        <circle cx="6" cy="26" r="2" fill="currentColor" />
      </svg>
      {/* Bottom-Right Corner */}
      <svg
        className="w-6 h-6 absolute bottom-2 right-2"
        viewBox="0 0 32 32"
        fill="none"
      >
        <path
          d="M30 10V26C30 28.2091 28.2091 30 26 30H10"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M26 18V26H18"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeOpacity="0.75"
        />
        <circle cx="26" cy="26" r="2" fill="currentColor" />
      </svg>
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

interface WikiTextRendererProps {
  text: string;
  entities: LoreEntity[];
  onSelectEntity: (entityId: string) => void;
  dropCap?: boolean;
}

export const WikiTextRenderer: React.FC<WikiTextRendererProps> = ({
  text,
  entities,
  onSelectEntity,
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
          <span
            key={index}
            className="inline font-medium text-[#B5832A] border-b border-dashed border-[#B5832A]"
            title="Entitas belum dibuat di Codex"
          >
            {refName}
          </span>
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
