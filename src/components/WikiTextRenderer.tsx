import React from 'react';
import { ChapterOutline, LoreCategory, LoreEntity } from '../types/world';

export const CATEGORY_META: Record<
  LoreCategory,
  { label: string; singular: string; description: string; accentColor: string }
> = {
  character: {
    label: 'Karakter & Tokoh',
    singular: 'Karakter',
    description: 'Tokoh protagonis, antagonis, penguasa, dan figur penting dalam cerita.',
    accentColor: '#9E2A2B',
  },
  race: {
    label: 'Ras & Bangsa',
    singular: 'Ras',
    description: 'Spesies cerdas, garis keturunan kuno, ciri biologis, dan budaya bawaan.',
    accentColor: '#2D5A43',
  },
  faction: {
    label: 'Kelompok & Faksi',
    singular: 'Kelompok',
    description: 'Ordo sihir, serikat dagang, klan militer, dan organisasi rahasia.',
    accentColor: '#B5832A',
  },
  nation: {
    label: 'Negara & Kerajaan',
    singular: 'Negara',
    description: 'Kekaisaran, persemakmuran, sistem pemerintahan, ibu kota, dan diplomasi.',
    accentColor: '#9E2A2B',
  },
  region: {
    label: 'Wilayah & Geografi',
    singular: 'Wilayah',
    description: 'Bioma alam, pegunungan, hutan terlarang, sumber daya, dan bahaya wilayah.',
    accentColor: '#2D5A43',
  },
  history: {
    label: 'Sejarah & Peristiwa',
    singular: 'Sejarah',
    description: 'Perang besar, bencana masa lalu, perjanjian kuno, dan titik balik era.',
    accentColor: '#695A47',
  },
  power_system: {
    label: 'Power System',
    singular: 'Power System',
    description: 'Hukum sihir/energi, sumber kekuatan, hirarki tingkatan, dan batasan mutlak.',
    accentColor: '#264653',
  },
  skill: {
    label: 'Skill & Teknik',
    singular: 'Skill',
    description: 'Jurus, rapalan mantra, kemampuan khusus, biaya aktivasi, dan batas pakai.',
    accentColor: '#264653',
  },
  encyclopedia: {
    label: 'Artefak, Flora & Fauna',
    singular: 'Entri Ensiklopedia',
    description: 'Relik pusaka, senjata legendaris, tanaman alkimia, dan makhluk mitologi.',
    accentColor: '#B5832A',
  },
};

interface WikiTextRendererProps {
  text: string;
  entities: LoreEntity[];
  onSelectEntity: (entityId: string) => void;
}

export const WikiTextRenderer: React.FC<WikiTextRendererProps> = ({
  text,
  entities,
  onSelectEntity,
}) => {
  if (!text) return null;

  const paragraphs = text.split('\n\n');

  const renderInlineLinks = (paragraph: string) => {
    // Match [[Entity Name]] pattern
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
            <button
              key={index}
              type="button"
              onClick={() => onSelectEntity(matched.id)}
              className="inline font-medium text-[#9E2A2B] underline decoration-[#9E2A2B]/50 underline-offset-4 hover:decoration-[#9E2A2B] hover:bg-[#9E2A2B]/10 px-1 rounded transition-colors cursor-pointer"
              title={`${CATEGORY_META[matched.category].singular}: ${matched.summary}`}
            >
              {refName}
            </button>
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
    <div className="space-y-3 text-[15px] leading-relaxed text-[#231C14]">
      {paragraphs.map((para, idx) => {
        const trimmed = para.trim();
        if (trimmed.startsWith('### ')) {
          return (
            <h4
              key={idx}
              className="font-display text-lg font-bold text-[#231C14] pt-2 border-b border-[#D8CBB3]/60 pb-1"
            >
              {trimmed.replace('### ', '')}
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
