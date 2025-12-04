import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Repeat1, Upload, Music, ListMusic, FolderInput, Trash2 } from 'lucide-react';

export const IconPlay = () => <Play strokeWidth={1.5} size={28} className="fill-current text-white/90" />;
export const IconPause = () => <Pause strokeWidth={1.5} size={28} className="fill-current text-white/90" />;
export const IconPrev = () => <SkipBack strokeWidth={1.5} size={24} className="text-white/70 hover:text-white transition-colors" />;
export const IconNext = () => <SkipForward strokeWidth={1.5} size={24} className="text-white/70 hover:text-white transition-colors" />;
export const IconVolume = () => <Volume2 strokeWidth={1.5} size={18} className="text-white/50" />;
export const IconMute = () => <VolumeX strokeWidth={1.5} size={18} className="text-white/50" />;
export const IconRepeat = ({ active }: { active: boolean }) => <Repeat strokeWidth={1.5} size={18} className={`${active ? 'text-white' : 'text-white/30'} transition-colors`} />;
export const IconRepeatOne = ({ active }: { active: boolean }) => <Repeat1 strokeWidth={1.5} size={18} className={`${active ? 'text-white' : 'text-white/30'} transition-colors`} />;
export const IconUpload = () => <Upload strokeWidth={1} size={48} className="text-white/50 mb-4" />;
export const IconMusic = () => <Music strokeWidth={1} size={20} className="text-white/50" />;
export const IconPlaylist = () => <ListMusic strokeWidth={1.5} size={20} className="text-white/50" />;
export const IconFolder = () => <FolderInput strokeWidth={1} size={48} className="text-white/50 mb-4" />;
export const IconTrash = () => <Trash2 strokeWidth={1.5} size={18} className="text-white/50 hover:text-red-400 transition-colors" />;