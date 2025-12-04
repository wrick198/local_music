export const formatTime = (seconds: number): string => {
  if (isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const parseFileName = (fileName: string): { title: string, artist: string } => {
  // Simple heuristic to remove extension and split by common separators
  const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
  
  // Common patterns: "Artist - Title", "Artist - Title"
  const parts = nameWithoutExt.split(/ - | – /);
  
  if (parts.length > 1) {
    return {
      artist: parts[0].trim(),
      title: parts.slice(1).join(" - ").trim()
    };
  }
  
  return {
    title: nameWithoutExt,
    artist: "Unknown Artist"
  };
};