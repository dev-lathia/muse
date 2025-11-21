export interface ArtPiece {
  id: string;
  title: string;
  type: 'sketch' | 'painting' | 'digital';
  imageUrl: string;
  description: string;
}

export interface Poem {
  id: string;
  title: string;
  content: string;
  mood: string;
}

export interface Song {
  title: string;
  artist: string;
  meaning: string;
  vibe: 'melancholy' | 'upbeat' | 'classic' | 'rebel';
}

export enum Section {
  HERO = 'hero',
  GALLERY = 'gallery',
  STORY = 'story',
  MUSIC = 'music',
  POETRY = 'poetry',
  STRENGTH = 'strength',
  CONFESSION = 'confession'
}