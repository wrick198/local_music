export interface Track {
  file: File;
  url: string;
  id: string;
  title: string;
  artist: string;
}

export enum LoopMode {
  None,
  All,
  One
}

export interface AudioState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
}