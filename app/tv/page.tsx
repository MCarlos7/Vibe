'use client';

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { getGun } from '@/lib/gun';
import { motion, AnimatePresence } from 'framer-motion';
import YouTube from 'react-youtube';
import { SkipForward } from 'lucide-react';

export default function TvView() {
  const [queue, setQueue] = useState<any[]>([]);
  const [reactions, setReactions] = useState<any[]>([]);
  const [joinUrl, setJoinUrl] = useState('');

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        setJoinUrl(window.location.origin);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    try {
      const gun = getGun();
      if (!gun) return;

      gun.get('vibe-queue').map().on((data: any, id: string) => {
        setQueue((prev) => {
          if (!data) return prev.filter((item) => item.id !== id);
          
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

      gun.get('vibe-reactions').map().on((data: any, id: string) => {
        if (!data) return;
        setReactions((prev) => {
          if (prev.some((r) => r.id === id)) return prev;
          const rx = { ...data, id };
          return [...prev.slice(-15), rx];
        });
      });
    } catch (error) {
      console.error(error);
    }
  }, []);

  const currentSong = queue[0];
  const nextSongs = queue.slice(1, 4);

  const ytOpts = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1,
      controls: 0,
      modestbranding: 1,
      rel: 0,
      origin: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
    },
  };

  const handleNextSong = () => {
    if (!currentSong) return;
    const gun = getGun();
    if (gun) {
      gun.get('vibe-queue').get(currentSong.id).put(null);
    }
  };

  const handlePlayerError = (event: any) => {
    console.warn("Error en reproducción. Saltando...", event?.data);
    handleNextSong();
  };

  return (
    <div className="h-screen w-screen bg-black text-white overflow-hidden flex relative font-sans">
      <div className="flex-1 h-full flex flex-col justify-center items-center relative bg-gray-950">
        {currentSong ? (
          <>
            <div className="w-full h-full absolute inset-0">
              {currentSong.platform === 'soundcloud' ? (
                // REPRODUCTOR ALTERNATIVO PARA SOUNDCLOUD (Iframe Oficial)
                <iframe
                  width="100%"
                  height="100%"
                  scrolling="no"
                  frameBorder="no"
                  allow="autoplay"
                  src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(currentSong.url)}&color=%23d946ef&auto_play=true&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`}
                  style={{ border: 'none' }}
                ></iframe>
              ) : (
                // REPRODUCTOR DE YOUTUBE ESTABLE
                <YouTube
                  key={currentSong.id}
                  videoId={currentSong.id}
                  opts={ytOpts}
                  onEnd={handleNextSong}
                  onError={handlePlayerError}
                  className="w-full h-full"
                  iframeClassName="w-full h-full pointer-events-none"
                />
              )}
            </div>

            <button
              onClick={handleNextSong}
              className="absolute top-6 left-6 z-30 bg-gray-900/80 hover:bg-fuchsia-600 border border-fuchsia-500/50 backdrop-blur-md px-5 py-3 rounded-2xl flex items-center gap-3 text-white font-bold transition-all shadow-[0_0_20px_rgba(236,72,153,0.3)] active:scale-95 pointer-events-auto"
            >
              <SkipForward size={22} className="text-cyan-400 group-hover:text-white" />
              <span>Siguiente Canción</span>
            </button>
          </>
        ) : (
          <div className="text-center p-8 z-10">
            <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-cyan-400 mb-4">
              VIBE JUKEBOX
            </h1>
            <p className="text-gray-400 text-xl">Escanea el QR para agregar la primera canción</p>
          </div>
        )}

        {/* Reacciones flotantes */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
          <AnimatePresence>
            {reactions.slice(-6).map((r, i) => (
              <motion.div
                key={`reaction-${r.id || i}`}
                initial={{ y: '100vh', opacity: 0, x: `${(i % 5) * 18 + 10}vw` }}
                animate={{ y: '-10vh', opacity: [0, 1, 1, 0] }}
                transition={{ duration: 4, ease: 'easeOut' }}
                className="absolute flex items-center gap-2 bg-black/70 backdrop-blur-md px-4 py-2 rounded-full border border-fuchsia-500/40"
              >
                <span className="text-3xl">{r.emoji}</span>
                <span className="text-xs font-mono text-cyan-300">{r.user}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Sidebar de Cola y QR */}
      <div className="w-96 bg-gray-900 border-l border-gray-800 p-6 flex flex-col justify-between z-30">
        <div>
          <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-4">A continuación</h2>
          <div className="space-y-3">
            {nextSongs.length > 0 ? (
              nextSongs.map((song, idx) => (
                <div key={`queue-${song.id}-${idx}`} className="flex items-center gap-3 bg-gray-950/60 p-3 rounded-xl border border-gray-800 relative overflow-hidden">
                  <span className="font-mono text-fuchsia-400 font-bold">#{idx + 1}</span>
                  <img src={song.thumbnail} className="w-12 h-12 object-cover rounded-lg" alt="" />
                  <div className="flex-1 truncate">
                    <p className="text-sm font-semibold truncate">{song.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-lime-400 font-mono">{song.votes || 0} votos</p>
                      {/* Indicador visual claro de la plataforma */}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${song.platform === 'soundcloud' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                        {song.platform === 'soundcloud' ? 'SoundCloud' : 'YouTube'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500">Sin canciones en espera</p>
            )}
          </div>
        </div>

        <div className="bg-gray-950 p-4 rounded-2xl border border-gray-800 text-center flex flex-col items-center">
          {joinUrl ? (
            <div className="p-3 bg-white rounded-xl shadow-[0_0_15px_rgba(236,72,153,0.3)]">
              <QRCodeSVG value={joinUrl} size={160} />
            </div>
          ) : (
            <div className="w-40 h-40 bg-gray-800 animate-pulse rounded-xl flex items-center justify-center text-xs text-gray-500">
              Cargando QR...
            </div>
          )}
          <p className="text-xs text-gray-400 mt-3">Escanea con tu celular</p>
          <p className="text-xs font-mono text-cyan-400 truncate w-full">{joinUrl || '...'}</p>
        </div>
      </div>
    </div>
  );
}