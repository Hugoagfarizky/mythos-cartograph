export type LoreCategory =
  | 'character'
  | 'race'
  | 'faction'
  | 'nation'
  | 'region'
  | 'history'
  | 'power_system'
  | 'skill'
  | 'encyclopedia';

export type TerrainType =
  | 'sea'
  | 'shallows'
  | 'plains'
  | 'forest'
  | 'mountain'
  | 'desert'
  | 'swamp'
  | 'tundra';

export type StampType =
  | 'capital'
  | 'castle'
  | 'tower'
  | 'port'
  | 'ruins'
  | 'village'
  | 'shrine'
  | 'battlefield';

export interface LoreAttributes {
  // Character specific
  role?: string;
  raceName?: string;
  factionName?: string;
  originNation?: string;
  age?: string;
  status?: string;
  powerTier?: string;
  knownSkills?: string[];
  ownedArtifacts?: string[];
  signatureQuote?: string;
  appearance?: string;
  voiceStyle?: string;
  motivationGoal?: string;
  fatalFlaw?: string;
  arcStart?: string;
  arcCrisis?: string;
  arcEndgame?: string;
  // Race specific
  lifespan?: string;
  traits?: string;
  homeland?: string;
  // Faction / Group specific
  factionType?: string;
  leader?: string;
  headquarters?: string;
  ideology?: string;
  // Nation specific
  government?: string;
  capitalCity?: string;
  ruler?: string;
  stateReligion?: string;
  currency?: string;
  // Region specific
  parentNation?: string;
  climate?: string;
  landmarks?: string;
  resources?: string;
  dangerLevel?: string;
  // History specific
  era?: string;
  year?: number;
  belligerents?: string;
  outcome?: string;
  // Power System specific
  energySource?: string;
  hardRules?: string;
  tierHierarchy?: string;
  corruptionCost?: string;
  // Skill specific
  parentPowerSystem?: string;
  skillRank?: string;
  elementAffinity?: string;
  activationCost?: string;
  cooldownOrLimit?: string;
  // Encyclopedia (Artifact, Flora, Fauna)
  subCategory?: 'Artefak & Pusaka' | 'Flora & Herbal' | 'Fauna & Monster' | 'Bahasa & Budaya';
  rarity?: string;
  habitatOrOrigin?: string;
  magicalProperties?: string;
}

export interface LoreEntity {
  id: string;
  category: LoreCategory;
  title: string;
  subtitle: string;
  summary: string;
  content: string; // Supports [[Entity Name]] wiki cross-links
  tags: string[];
  imageUrl?: string;
  attributes: LoreAttributes;
  updatedAt: string;
}

export interface MapStamp {
  id: string;
  type: StampType;
  x: number; // Percentage 0..100
  y: number; // Percentage 0..100
  label: string;
  linkedEntityId?: string;
  nationColor?: string;
}

export interface MapRegionLabel {
  id: string;
  text: string;
  x: number; // Percentage 0..100
  y: number; // Percentage 0..100
  style: 'empire' | 'sea' | 'region';
  rotation?: number;
}

export interface MapRiverPath {
  id: string;
  name: string;
  points: Array<{ x: number; y: number }>;
}

export type MapRouteStyle = 'road' | 'expedition' | 'sea_lane';

export interface MapRoutePath {
  id: string;
  name: string;
  style: MapRouteStyle;
  points: Array<{ x: number; y: number }>;
}

export interface MapSandboxData {
  mapTitle: string;
  subtitle: string;
  scaleLabel: string;
  leaguesPerCell?: number;
  gridCols: number;
  gridRows: number;
  cells: TerrainType[]; // length = gridCols * gridRows
  stamps: MapStamp[];
  regionLabels: MapRegionLabel[];
  rivers: MapRiverPath[];
  routes?: MapRoutePath[];
  customBgUrl?: string;
}

export type RelationType =
  | 'ally'
  | 'rival'
  | 'family'
  | 'mentor'
  | 'vassal'
  | 'member'
  | 'betrayed';

export interface RelationshipEdge {
  id: string;
  sourceId: string;
  targetId: string;
  type: RelationType;
  label: string;
  notes: string;
}

export interface GraphNodePosition {
  entityId: string;
  x: number;
  y: number;
}

export interface TimelineEvent {
  id: string;
  era: string;
  year: number;
  displayDate: string;
  title: string;
  category: 'Peperangan' | 'Bencana Arcane' | 'Berdirinya Kerajaan' | 'Penemuan Pusaka' | 'Kelahiran Tokoh';
  summary: string;
  linkedEntityIds: string[];
  regionName?: string;
}

export interface ChapterScene {
  id: string;
  title: string;
  povCharacter: string;
  settingRegion: string;
  summary: string;
}

export interface ChapterOutline {
  id: string;
  chapterNumber: number;
  act: string;
  title: string;
  status: 'Rencana' | 'Sedang Ditulis' | 'Revisi' | 'Selesai';
  synopsis: string;
  draftNotes: string;
  featuredEntityIds: string[];
  wordCountTarget: number;
  currentWordCount: number;
  scenes: ChapterScene[];
}

export interface ScratchpadNote {
  id: string;
  text: string;
  targetCategory: LoreCategory;
  createdAt: string;
}

export interface AuditIssue {
  severity: string;
  category: string;
  title: string;
  explanation: string;
  suggestedFix: string;
}

export interface LoreAuditResult {
  overallStatus: string;
  summary: string;
  issues: AuditIssue[];
  creativeSuggestions: string[];
}

export interface WorldProject {
  id: string;
  worldName: string;
  tagline: string;
  genre: string;
  calendarSystem: string;
  authorName: string;
  heroBannerUrl: string;
  // Enhanced Overview fields
  epigraphQuote?: string;
  epigraphSource?: string;
  centralConflict?: string;
  storyThemes?: string;
  cosmologyCreationMyth?: string;
  cosmologyLaws?: string;
  scratchpadNotes?: ScratchpadNote[];
  entities: LoreEntity[];
  mapData: MapSandboxData;
  relationships: RelationshipEdge[];
  nodePositions: GraphNodePosition[];
  timeline: TimelineEvent[];
  chapters: ChapterOutline[];
}
