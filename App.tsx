import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Track, LoopMode, AudioState } from './types';
import { formatTime, parseFileName } from './utils';
import { 
  IconPlay, IconPause, IconPrev, IconNext, 
  IconRepeat, IconRepeatOne, IconUpload, IconPlaylist,
  IconVolume, IconMute
} from './components/Icons';
import { AmbientBackdrop } from './components/Visualizer';

const App: React.FC = () => {
  // State
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(-1);
  const [loopMode, setLoopMode] = useState<LoopMode>(LoopMode.All);
  const [showPlaylist, setShowPlaylist] = useState(false);
  
  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
  });

  // Refs
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derived state
  const currentTrack = currentTrackIndex >= 0 ? playlist[currentTrackIndex] : null;

  // Handlers
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newTracks: Track[] = Array.from(files).map((file) => {
        const { title, artist } = parseFileName(file.name);
        return {
          file,
          url: URL.createObjectURL(file),
          id: Math.random().toString(36).substr(2, 9),
          title,
          artist
        };
      });

      setPlaylist((prev) => [...prev, ...newTracks]);
      
      // If no track is playing, start the first new one
      if (currentTrackIndex === -1) {
        setCurrentTrackIndex(0);
      }
    }
  };

  const playTrack = useCallback(async () => {
    if (audioRef.current) {
      try {
        await audioRef.current.play();
        setAudioState(prev => ({ ...prev, isPlaying: true }));
      } catch (err) {
        console.error("Playback failed", err);
      }
    }
  }, []);

  const pauseTrack = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setAudioState(prev => ({ ...prev, isPlaying: false }));
    }
  }, []);

  const togglePlayPause = () => {
    if (audioState.isPlaying) pauseTrack();
    else playTrack();
  };

  const playNext = useCallback(() => {
    if (playlist.length === 0) return;
    
    let nextIndex = currentTrackIndex + 1;
    if (nextIndex >= playlist.length) {
      nextIndex = 0; // Loop back to start
    }
    setCurrentTrackIndex(nextIndex);
  }, [currentTrackIndex, playlist.length]);

  const playPrev = () => {
    if (playlist.length === 0) return;
    
    // If we are more than 3 seconds in, just restart the song
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }

    let prevIndex = currentTrackIndex - 1;
    if (prevIndex < 0) {
      prevIndex = playlist.length - 1;
    }
    setCurrentTrackIndex(prevIndex);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setAudioState(prev => ({
        ...prev,
        currentTime: audioRef.current!.currentTime,
      }));
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setAudioState(prev => ({
        ...prev,
        duration: audioRef.current!.duration,
      }));
      if (audioState.isPlaying) {
        playTrack();
      }
    }
  };

  const handleEnded = () => {
    if (loopMode === LoopMode.One) {
        if(audioRef.current) {
            audioRef.current.currentTime = 0;
            playTrack();
        }
    } else {
        playNext();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setAudioState(prev => ({ ...prev, currentTime: time }));
    }
  };
  
  const toggleLoopMode = () => {
      setLoopMode(prev => {
          if (prev === LoopMode.None) return LoopMode.All;
          if (prev === LoopMode.All) return LoopMode.One;
          return LoopMode.None;
      });
  };

  // Effects
  useEffect(() => {
    if (currentTrack && audioRef.current) {
      // Clean up previous logic if needed, but mainly just load new source
      // Note: In a production app, we should revokeObjectURL when removing tracks
      if (audioRef.current.src !== currentTrack.url) {
        audioRef.current.src = currentTrack.url;
        audioRef.current.load();
        playTrack();
      }
    }
  }, [currentTrack, playTrack]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      playlist.forEach(track => URL.revokeObjectURL(track.url));
    };
  }, []);

  // UI Components
  if (playlist.length === 0) {
    return (
      <div className="min-h-screen bg-ink flex flex-col items-center justify-center p-6 text-center font-serif relative overflow-hidden">
        <AmbientBackdrop isPlaying={false} />
        <div className="z-10 animate-pulse-slow">
            <IconUpload />
        </div>
        <h1 className="text-3xl md:text-4xl text-neutral-200 mb-6 font-light tracking-widest z-10">
          Upload Local Music
        </h1>
        <p className="text-neutral-500 mb-12 max-w-md z-10">
          Select audio files from your device to begin.
          <br/>Your music stays on your device.
        </p>
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="z-10 px-8 py-3 border border-neutral-700 hover:border-neutral-400 hover:bg-neutral-900 transition-all text-neutral-300 tracking-widest uppercase text-sm"
        >
          Select Files
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          accept="audio/*" 
          multiple 
          className="hidden" 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink text-white flex flex-col font-serif relative overflow-hidden selection:bg-white/20">
      <AmbientBackdrop isPlaying={audioState.isPlaying} />
      
      {/* Audio Element (Hidden) */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20">
        <div className="text-xs tracking-[0.2em] text-neutral-500 uppercase">
           {audioState.isPlaying ? 'Now Playing' : 'Paused'}
        </div>
        <div className="flex gap-4">
             <button 
                onClick={() => setShowPlaylist(!showPlaylist)}
                className="text-neutral-500 hover:text-white transition-colors"
            >
                <IconPlaylist />
            </button>
             <button 
                onClick={() => fileInputRef.current?.click()}
                className="text-neutral-500 hover:text-white transition-colors"
            >
                <span className="text-xs border border-neutral-700 px-2 py-1">+ Add</span>
            </button>
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept="audio/*" 
                multiple 
                className="hidden" 
            />
        </div>
      </div>

      {/* Playlist Overlay */}
      {showPlaylist && (
         <div className="absolute inset-0 bg-ink/95 backdrop-blur-xl z-30 flex flex-col p-8 animate-in fade-in duration-200">
            <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                <h2 className="text-xl tracking-widest text-white/80">Queue</h2>
                <button onClick={() => setShowPlaylist(false)} className="text-sm text-neutral-500 hover:text-white">CLOSE</button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                {playlist.map((track, idx) => (
                    <div 
                        key={track.id}
                        onClick={() => {
                            setCurrentTrackIndex(idx);
                            setShowPlaylist(false);
                        }}
                        className={`p-4 cursor-pointer transition-all duration-300 group ${idx === currentTrackIndex ? 'bg-white/5 border-l-2 border-white' : 'hover:bg-white/5 border-l-2 border-transparent'}`}
                    >
                        <div className={`text-lg mb-1 ${idx === currentTrackIndex ? 'text-white' : 'text-neutral-400 group-hover:text-neutral-200'}`}>
                            {track.title}
                        </div>
                        <div className="text-xs uppercase tracking-wider text-neutral-600">
                            {track.artist}
                        </div>
                    </div>
                ))}
            </div>
         </div>
      )}

      {/* Main Display Area */}
      <div className="flex-1 flex flex-col items-center justify-center z-10 px-6">
        {/* Decorative elements based on user image */}
        <div className="flex flex-col items-center gap-8 max-w-2xl w-full">
            
            {/* The "Lyrics" / Title Display */}
            <div className="text-center space-y-8 select-none">
                 {/* Previous context (faded) */}
                <div className="h-8 text-neutral-700 text-lg transition-all duration-700 transform">
                    {/* Placeholder for previous lyric line style */}
                     Wait for the sound
                </div>

                {/* Main Focus */}
                <div className="space-y-6 py-4">
                    <h1 className="text-4xl md:text-6xl font-normal tracking-tight text-white leading-tight animate-in slide-in-from-bottom-2 fade-in duration-700">
                        {currentTrack?.title}
                    </h1>
                    <p className="text-xl md:text-2xl text-neutral-400 font-light tracking-wide animate-in slide-in-from-bottom-3 fade-in duration-1000 delay-100">
                        {currentTrack?.artist}
                    </p>
                </div>

                {/* Next context (faded) */}
                <div className="h-8 text-neutral-700 text-lg transition-all duration-700 transform">
                    {/* Placeholder for next lyric line style */}
                     Echoes in the deep
                </div>
            </div>

        </div>
      </div>

      {/* Bottom Controls */}
      <div className="p-8 md:p-12 z-20 bg-gradient-to-t from-ink via-ink to-transparent">
        
        {/* Progress Bar */}
        <div className="w-full max-w-3xl mx-auto mb-8 flex items-center gap-4 group">
          <span className="text-xs text-neutral-600 tabular-nums w-12 text-right group-hover:text-neutral-400 transition-colors">
            {formatTime(audioState.currentTime)}
          </span>
          <div className="relative flex-1 h-8 flex items-center">
            {/* Track Background */}
            <div className="absolute w-full h-[2px] bg-neutral-800 rounded-full overflow-hidden">
                {/* Progress Fill */}
                <div 
                    className="h-full bg-neutral-400 group-hover:bg-white transition-colors duration-300"
                    style={{ width: `${(audioState.currentTime / (audioState.duration || 1)) * 100}%` }}
                />
            </div>
             {/* Slider Input */}
            <input
                type="range"
                min={0}
                max={audioState.duration || 0}
                value={audioState.currentTime}
                onChange={handleSeek}
                className="absolute w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          <span className="text-xs text-neutral-600 tabular-nums w-12 group-hover:text-neutral-400 transition-colors">
            {formatTime(audioState.duration)}
          </span>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-center gap-10 md:gap-16">
          <button 
            onClick={toggleLoopMode}
            className="p-2 rounded-full hover:bg-white/5 transition-all"
            title="Loop Mode"
          >
            {loopMode === LoopMode.One ? <IconRepeatOne active={true} /> : <IconRepeat active={loopMode === LoopMode.All} />}
          </button>

          <button 
            onClick={playPrev}
            className="p-2 rounded-full hover:bg-white/5 transition-all active:scale-95"
          >
            <IconPrev />
          </button>

          <button 
            onClick={togglePlayPause}
            className="w-16 h-16 flex items-center justify-center rounded-full bg-white text-black hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
          >
            {audioState.isPlaying ? <div className="text-black"><IconPause /></div> : <div className="ml-1 text-black"><IconPlay /></div>}
          </button>

          <button 
            onClick={playNext}
            className="p-2 rounded-full hover:bg-white/5 transition-all active:scale-95"
          >
            <IconNext />
          </button>
          
           {/* Volume Toggle (Simple) */}
           <div className="relative group/vol">
              <button className="p-2 rounded-full hover:bg-white/5 transition-all">
                {audioState.volume === 0 ? <IconMute /> : <IconVolume />}
              </button>
              {/* Hidden Volume Slider popover */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-8 h-24 bg-neutral-900 border border-neutral-800 rounded-lg flex items-end justify-center pb-2 opacity-0 group-hover/vol:opacity-100 transition-opacity pointer-events-none group-hover/vol:pointer-events-auto">
                 <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.01"
                    value={audioState.volume}
                    onChange={(e) => {
                        const vol = Number(e.target.value);
                        if(audioRef.current) audioRef.current.volume = vol;
                        setAudioState(prev => ({...prev, volume: vol}));
                    }}
                    className="w-20 h-1 bg-transparent -rotate-90 origin-bottom mb-8"
                 />
              </div>
           </div>
        </div>
        
        <div className="text-center mt-8 text-xs text-neutral-700 uppercase tracking-[0.3em]">
           Zen Audio
        </div>
      </div>
    </div>
  );
};

export default App;