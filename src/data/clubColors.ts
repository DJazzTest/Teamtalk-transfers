// Club color themes based on badge colors
export interface ClubTheme {
  primary: string;
  secondary: string;
  text: string;
  background: string;
  border: string;
}

export const clubColorThemes: Record<string, ClubTheme> = {
  'arsenal': {
    primary: '#DC2626', // Red
    secondary: '#FFFFFF', // White
    text: '#FFFFFF',
    background: 'bg-red-600',
    border: 'border-red-500'
  },
  'aston-villa': {
    primary: '#7C2D92', // Claret
    secondary: '#95D5F0', // Sky Blue
    text: '#FFFFFF',
    background: 'bg-purple-700',
    border: 'border-purple-600'
  },
  'bournemouth': {
    primary: '#DA020E', // Red
    secondary: '#000000', // Black
    text: '#FFFFFF',
    background: 'bg-red-600',
    border: 'border-red-500'
  },
  'brentford': {
    primary: '#E30613', // Red
    secondary: '#FFD700', // Yellow
    text: '#FFFFFF',
    background: 'bg-red-600',
    border: 'border-red-500'
  },
  'brighton': {
    primary: '#0057B8', // Blue
    secondary: '#FFCD00', // Yellow
    text: '#FFFFFF',
    background: 'bg-blue-600',
    border: 'border-blue-500'
  },
  'burnley': {
    primary: '#6C1D45', // Claret
    secondary: '#99D6EA', // Sky Blue
    text: '#FFFFFF',
    background: 'bg-red-900',
    border: 'border-red-800'
  },
  'chelsea': {
    primary: '#034694', // Blue
    secondary: '#FFFFFF', // White
    text: '#FFFFFF',
    background: 'bg-blue-600',
    border: 'border-blue-500'
  },
  'crystal-palace': {
    primary: '#1B458F', // Blue
    secondary: '#C4122E', // Red
    text: '#FFFFFF',
    background: 'bg-blue-700',
    border: 'border-blue-600'
  },
  'everton': {
    primary: '#003399', // Blue
    secondary: '#FFFFFF', // White
    text: '#FFFFFF',
    background: 'bg-blue-700',
    border: 'border-blue-600'
  },
  'fulham': {
    primary: '#000000', // Black
    secondary: '#FFFFFF', // White
    text: '#FFFFFF',
    background: 'bg-gray-900',
    border: 'border-gray-700'
  },
  'leeds': {
    primary: '#FFFFFF', // White
    secondary: '#1D428A', // Blue
    text: '#1D428A',
    background: 'bg-white',
    border: 'border-blue-600'
  },
  'liverpool': {
    primary: '#C8102E', // Red
    secondary: '#F6EB61', // Yellow
    text: '#FFFFFF',
    background: 'bg-red-600',
    border: 'border-red-500'
  },
  'manchester-city': {
    primary: '#6CABDD', // Sky Blue
    secondary: '#1C2C5B', // Navy
    text: '#FFFFFF',
    background: 'bg-sky-500',
    border: 'border-sky-400'
  },
  'manchester-united': {
    primary: '#DA020E', // Red
    secondary: '#FBE122', // Yellow
    text: '#FFFFFF',
    background: 'bg-red-600',
    border: 'border-red-500'
  },
  'newcastle': {
    primary: '#241F20', // Black
    secondary: '#FFFFFF', // White
    text: '#FFFFFF',
    background: 'bg-gray-900',
    border: 'border-gray-700'
  },
  'nottingham-forest': {
    primary: '#DD0000', // Red
    secondary: '#FFFFFF', // White
    text: '#FFFFFF',
    background: 'bg-red-600',
    border: 'border-red-500'
  },
  'sunderland': {
    primary: '#EB172B', // Red
    secondary: '#FFFFFF', // White
    text: '#FFFFFF',
    background: 'bg-red-600',
    border: 'border-red-500'
  },
  'tottenham': {
    primary: '#132257', // Navy Blue
    secondary: '#FFFFFF', // White
    text: '#FFFFFF',
    background: 'bg-blue-900',
    border: 'border-blue-800'
  },
  'west-ham': {
    primary: '#7A263A', // Claret
    secondary: '#1BB1E7', // Sky Blue
    text: '#FFFFFF',
    background: 'bg-red-800',
    border: 'border-red-700'
  },
  'wolves': {
    primary: '#FDB462', // Gold
    secondary: '#231F20', // Black
    text: '#231F20',
    background: 'bg-yellow-500',
    border: 'border-yellow-400'
  }
};

export const getClubTheme = (clubSlug: string): ClubTheme => {
  return clubColorThemes[clubSlug] || {
    primary: '#6B7280', // Gray
    secondary: '#FFFFFF',
    text: '#FFFFFF',
    background: 'bg-gray-600',
    border: 'border-gray-500'
  };
};
