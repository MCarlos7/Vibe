'use client';

import { useState, useEffect } from 'react';
import { getGun } from '@/lib/gun';
import { Search, ThumbsUp, ThumbsDown, Music } from 'lucide-react';

const AVATARS = ['👽 Alien', '🐱 Gato Fiestero', '🚀 Astro', '⚡ Volt', '🐼 Panda DJ'];

// Interfaces para tipado
interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration?: number;
}

export default function MobileGuestView() {
  // 1. Control de montaje para evitar el Hydration Mismatch
  const [mounted, setMounted] = useState(false);
  const [userAvatar, setUserAvatar] = useState('');
  
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MusicTrack[]>([]);
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Asignar el avatar solo en el cliente
    setUserAvatar(AVATARS[Math.floor(Math.random() * AVATARS.length)]);
    setMounted(true);

    const gun = getGun();
    if (!gun) return;

    gun.get('vibe-queue').map().on((data: any, id: string) => {
      if (!data) return;
      setQueue((prev) => {
        const index = prev.findIndex((item) => item.id === id);
        let updated = [...prev];
        if (index > -1) {
          updated[index] = { ...data, id };
        } else {
          updated.push({ ...data, id });
        }
        return updated.sort((a, b) => (b.votes || 0) - (a.votes || 0));
      });
    });
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const results = await res.json();
      setSearchResults(results);
    } catch (error) {
      console.error("Error en la búsqueda:", error);
    }
    setLoading(false);
  };

  const addSong = (track: MusicTrack) => {
    const gun = getGun();
    if (!gun) return;
    
    // Usamos el ID de YouTube como nodo principal para evitar duplicados en la BD
    gun.get('vibe-queue').get(track.id).put({
      title: track.title,
      artist: track.artist,
      thumbnail: track.thumbnail,
      votes: 1,
      addedBy: userAvatar
    });
    
    setSearchResults([]);
    setQuery('');
  };

  const vote = (id: string, delta: number) => {
    const gun = getGun();
    if (!gun) return;
    const item = gun.get('vibe-queue').get(id);
    item.get('votes').once((currentVotes: number) => {
      item.get('votes').put((currentVotes || 0) + delta);
    });
  };

  const sendEmoji = (emoji: string) => {
    const gun = getGun();
    if (!gun) return;
    gun.get('vibe-reactions').set({
      emoji,
      user: userAvatar,
      timestamp: Date.now()
    });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col font-sans pb-24">
      <header className="p-4 border-b border-gray-800 flex justify-between items-center sticky top-0 bg-gray-950/90 backdrop-blur z-20">
        <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-cyan-400">
          VIBE
        </h1>
        <span className="text-xs bg-gray-900 border border-gray-800 px-3 py-1 rounded-full text-cyan-300">
          {mounted ? userAvatar : 'Cargando...'}
        </span>
      </header>

      <div className="p-4">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            placeholder="Buscar canción..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-fuchsia-500"
          />
          <Search className="absolute left-3 top-3.5 text-gray-500" size={18} />
        </form>

        {loading && <p className="text-xs text-gray-500 mt-3 text-center">Buscando...</p>}

        {searchResults.length > 0 && (
          <div className="mt-2 bg-gray-900 border border-gray-800 rounded-xl max-h-60 overflow-y-auto divide-y divide-gray-800">
            {/* Fix de Keys duplicadas: Añadimos el índice al key como seguridad */}
            {searchResults.map((track, idx) => (
              <div key={`search-${track.id}-${idx}`} onClick={() => addSong(track)} className="p-3 flex items-center gap-3 active:bg-gray-800 cursor-pointer">
                <img src={track.thumbnail} className="w-10 h-10 rounded object-cover" alt="" />
                <div className="flex-1 truncate">
                  <p className="text-sm font-semibold truncate">{track.title}</p>
                  <p className="text-xs text-gray-400 truncate">{track.artist}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 flex-1">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Lista de Reproducción</h2>
        <div className="space-y-2">
           {/* Fix de Keys: Aseguramos unicidad en la cola */}
          {queue.map((song, idx) => (
            <div key={`queue-${song.id}-${idx}`} className="flex items-center justify-between bg-gray-900/50 border border-gray-800/80 p-3 rounded-xl">
              <div className="flex items-center gap-3 truncate pr-2">
                <Music size={18} className="text-fuchsia-500 shrink-0" />
                <div className="truncate">
                  <p className="text-sm font-semibold truncate">{song.title}</p>
                  <p className="text-xs text-gray-500 font-mono">Por {song.addedBy}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => vote(song.id, 1)} className="p-2 text-gray-400 active:text-lime-400">
                  <ThumbsUp size={18} />
                </button>
                <span className="font-mono text-sm text-cyan-400 min-w-[20px] text-center">{song.votes || 0}</span>
                <button onClick={() => vote(song.id, -1)} className="p-2 text-gray-400 active:text-red-400">
                  <ThumbsDown size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-gray-950/95 border-t border-gray-800 p-3 flex justify-around backdrop-blur">
        {['🔥', '😍', '🤢', '🔊', '💀'].map((emoji) => (
          <button
            key={`emoji-${emoji}`}
            onClick={() => sendEmoji(emoji)}
            className="text-2xl bg-gray-900 border border-gray-800 w-12 h-12 rounded-full flex items-center justify-center active:scale-90 transition-transform"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}