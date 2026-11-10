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
  raceOriginClass?: string;
  lifespan?: string;
  traits?: string;
  homeland?: string;
  innateAbilities?: string;
  racialWeakness?: string;
  languageAndNaming?: string;
  cultureAndTraditions?: string;
  interRaceRelations?: string;
  subRaces?: string[];
  signatureSkills?: string[];
  // Faction / Group specific
  factionType?: string;
  influenceScale?: string;
  leader?: string;
  headquarters?: string;
  emblemSymbol?: string;
  rankHierarchy?: string[];
  recruitmentOath?: string;
  ideology?: string;
  secretAgenda?: string;
  resourcesAndAssets?: string;
  factionArtifacts?: string[];
  alliedFactions?: string;
  rivalFactions?: string;
  // Nation specific
  governmentType?: string;
  government?: string;
  capitalCity?: string;
  ruler?: string;
  stateReligion?: string;
  currency?: string;
  nationalEmblem?: string;
  dominantRaces?: string[];
  economicCommodities?: string;
  militaryStrength?: string;
  lawsAndCulture?: string;
  diplomaticAllies?: string;
  borderConflicts?: string;
  // Region specific
  regionType?: string;
  parentNation?: string;
  climate?: string;
  landmarks?: string;
  landmarksList?: string[];
  resources?: string;
  endemicFloraFauna?: string[];
  dangerLevel?: string;
  sensoryAtmosphere?: string;
  localEcologyAndHazards?: string;
  linkedMapStampLabel?: string;
  // History specific
  historyEventType?: string;
  era?: string;
  year?: number;
  displayDate?: string;
  eventLocation?: string;
  belligerents?: string;
  belligerentsList?: string[];
  keyHistoricalFigures?: string[];
  historicalTrigger?: string;
  casualtiesAndLosses?: string;
  outcome?: string;
  worldImpactLegacy?: string;
  officialHistoryVersion?: string;
  hiddenHistoricalTruth?: string;
  // Power System specific
  systemTypology?: string;
  energySource?: string;
  originSource?: string;
  awakeningCondition?: string;
  catalystMedium?: string;
  powerTiersList?: string[];
  elementBranches?: string[];
  hardRules?: string;
  tierHierarchy?: string;
  systemWeakness?: string;
  corruptionCost?: string;
  // Skill specific
  parentPowerSystem?: string;
  skillRank?: string;
  elementAffinity?: string;
  skillExclusivity?: string;
  exclusiveRaces?: string[];
  impactScale?: string;
  strategicImpact?: string;
  visualManifestation?: string;
  activationCost?: string;
  cooldownOrLimit?: string;
  // Encyclopedia (Artifact, Flora, Fauna, Language & Culture)
  subCategory?: 'Artefak & Pusaka' | 'Flora & Herbal' | 'Fauna & Monster' | 'Bahasa & Budaya';
  rarity?: string;
  habitatOrOrigin?: string;
  magicalProperties?: string;
  currentHolder?: string;
  creatorOrOrigin?: string;
  linkedPowerSystem?: string;
  attunementRequirement?: string;
  curseOrSideEffect?: string;
  destructionMethod?: string;
  ownershipHistory?: string[];
  creatureBehavior?: string;
  harvestableMaterials?: string[];
  alchemicalUses?: string;
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
  visibilityStatus?: string;
  tensionOrLoyalty?: string;
  directionality?: 'bidirectional' | 'directed';
  originHistory?: string;
  storyEvolution?: string;
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
  seasonOrPhase?: string;
  title: string;
  category: 'Peperangan' | 'Bencana Arcane' | 'Berdirinya Kerajaan' | 'Penemuan Pusaka' | 'Kelahiran Tokoh';
  summary: string;
  consequenceImpact?: string;
  secretTruthNote?: string;
  linkedEntityIds: string[];
  regionName?: string;
  linkedChapterId?: string;
}

export interface ChapterScene {
  id: string;
  title: string;
  povCharacter: string;
  settingRegion: string;
  timeOfDay?: string;
  summary: string;
  sceneGoalOrConflict?: string;
  sceneOutcome?: string;
}

export interface ChapterOutline {
  id: string;
  chapterNumber: number;
  act: string;
  title: string;
  status: 'Rencana' | 'Sedang Ditulis' | 'Revisi' | 'Selesai';
  storyDateOrTime?: string;
  primaryPov?: string;
  primaryLocation?: string;
  synopsis: string;
  chapterGoal?: string;
  centralConflict?: string;
  endingHookOrTwist?: string;
  foreshadowingNotes?: string;
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

export type FreeCanvasCardColor =
  | 'parchment'
  | 'crimson'
  | 'emerald'
  | 'teal'
  | 'amethyst'
  | 'amber';

export interface FreeCanvasCard {
  id: string;
  title: string;
  tagLabel?: string;
  content: string; // Supports [[Entity Name]] wiki links
  x: number;
  y: number;
  width: number;
  color: FreeCanvasCardColor;
  linkedEntityId?: string;
  linkedChapterId?: string;
}

export interface FreeCanvasLink {
  id: string;
  fromCardId: string;
  toCardId: string;
  label: string;
  color: 'crimson' | 'gold' | 'teal' | 'emerald';
  dashed?: boolean;
}

export interface FreeCanvasStroke {
  id: string;
  color: string;
  width: number;
  points: Array<{ x: number; y: number }>;
}

export interface FreeCanvasZone {
  id: string;
  title: string;
  subtitle?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: FreeCanvasCardColor;
}

export interface FreeCanvasData {
  boardTitle: string;
  cards: FreeCanvasCard[];
  links: FreeCanvasLink[];
  strokes: FreeCanvasStroke[];
  zones: FreeCanvasZone[];
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
  freeCanvas?: FreeCanvasData;
}

