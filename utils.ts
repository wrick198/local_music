import { Track } from './types';

// --- Time Formatting ---

export const formatTime = (seconds: number): string => {
  if (isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// --- File Name Parsing ---

export const parseFileName = (fileName: string): { title: string, artist: string } => {
  // Remove extension
  const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
  
  // Split by " - " or " – "
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

// --- Persistence (IndexedDB) ---

const DB_NAME = 'ZenAudioDB';
const STORE_NAME = 'tracks';
const DB_VERSION = 1;

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

export const saveTracksToDB = async (tracks: Track[]): Promise<void> => {
  try {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    
    tracks.forEach(track => {
      // Create a copy without the blob URL (URLs are temporary)
      const { url, ...trackData } = track;
      store.put(trackData);
    });
    
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('Error saving tracks to DB:', err);
  }
};

export const getTracksFromDB = async (): Promise<Track[]> => {
  try {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const storedTracks = request.result;
        // Re-create Blob URLs from stored File objects
        const tracks: Track[] = storedTracks.map((t: any) => ({
          ...t,
          url: URL.createObjectURL(t.file)
        }));
        resolve(tracks);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Error loading tracks from DB:', err);
    return [];
  }
};

export const clearDB = async (): Promise<void> => {
  try {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.clear();
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('Error clearing DB:', err);
  }
};