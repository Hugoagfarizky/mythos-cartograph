import { TerrainType, WorldProject } from '../types/world';

const GRID_COLS = 36;
const GRID_ROWS = 22;

function createBlankTerrainGrid(): TerrainType[] {
  return new Array(GRID_COLS * GRID_ROWS).fill('sea');
}

export const STARTER_WORLD_PROJECT: WorldProject = {
  id: 'world-clean-01',
  worldName: 'Semesta Cerita Baru',
  tagline: 'Tuliskan premis atau logline utama dunia fantasi Anda di sini',
  genre: 'Fantasi',
  calendarSystem: 'Tahun ke-1 Era Baru',
  authorName: '',
  heroBannerUrl: '/src/assets/images/parchment_cartography_banner_1794157187078.jpg',
  epigraphQuote: '',
  epigraphSource: '',
  centralConflict: '',
  storyThemes: '',
  cosmologyCreationMyth: '',
  cosmologyLaws: '',
  scratchpadNotes: [],
  entities: [],
  mapData: {
    mapTitle: 'Peta Dunia Baru',
    subtitle: 'Kanvas Kartografi Semesta',
    scaleLabel: '1 Grid = 50 Liga',
    leaguesPerCell: 50,
    gridCols: GRID_COLS,
    gridRows: GRID_ROWS,
    cells: createBlankTerrainGrid(),
    stamps: [],
    regionLabels: [],
    rivers: [],
    routes: [],
  },
  relationships: [],
  nodePositions: [],
  timeline: [],
  chapters: [],
  dynastyTrees: [],
  mysteryPlots: [],
};
