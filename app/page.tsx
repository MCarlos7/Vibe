'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MessageCircle, ListMusic, ChevronUp, ChevronDown, SkipForward, Play } from 'lucide-react';

// Tipos base
type Song = { id: string; title: string; artist: string; score: number; thumb: string; myVote: number };
type Message = { id: string; user: string; content: string; type: 'text' | 'reaction'; color: string };

export default function GuestDashboard() {
  const [activeTab, setActiveTab] = useState<'queue' | 'chat'>('queue');
  
  // Estado simulado (En producción: usaría hooks de Supabase Realtime)
  const [songs, setSongs] = useState<Song[]>([
    { id: '1', title: 'Tití Me Preguntó', artist: 'Bad Bunny', score: 24, thumb: '/api/placeholder/60/60', myVote: 1 },
    { id: '2', title: 'Levitating', artist: 'Dua Lipa', score: 18, thumb: '/api/placeholder/60/60', myVote: 0 },
    { id: '3', title: 'Danza Kuduro', artist: 'Don Omar', score: 15, thumb: '/api/placeholder/60/60', myVote: -1 },
  ]);

  const [messages, setMessages] = useState<Message[]>([
    { id: '1', user: 'Alien Bailador', content: '¡Sube el volumen! 🔊', type: 'text', color: '#a855f7' },
    { id: '2', user: 'Gato Fiestero', content: '😍', type: 'reaction', color: '#10b981' },
  ]);

  // Lógica de votación con actualización optimista
  const handleVote = (id: string, voteValue: number) => {
    setSongs(current =>
      current.map(song => {
        if (song.id === id) {
          const isRemovingVote = song.myVote === voteValue;
          const newVote = isRemovingVote ? 0 : voteValue;
          const scoreDiff = newVote - song.myVote;
          return { ...song, score: song.score + scoreDiff, myVote: newVote };
        }
        return song;
      }).sort((a, b) => b.score - a.score) // Reordena en tiempo real
    );
  };

  const sendReaction = (emoji: string) => {
    const newMsg: Message = { id: Date.now().toString(), user: 'Tú', content: emoji, type: 'reaction', color: '#ec4899' };
    setMessages([...messages, newMsg]);
    // Aquí iría el trigger para la animación flotante en el proyector de la TV
  };

  return (
    <div className="h-screen w-full bg-gray-950 text-white flex flex-col font-sans overflow-hidden">
      {/* HEADER: Reproductor Actual (Fijo) */}
      <div className="bg-gray-900 border-b border-gray-800 p-4 shrink-0 shadow-[0_4px_20px_rgba(0,0,0,0.5)] z-10">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-neon-pink font-bold text-xs tracking-widest uppercase">Sonando Ahora</h2>
          <span className="bg-gray-800 text-xs px-2 py-1 rounded-full text-gray-400">🔥 120 conectados</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-lg overflow-hidden shadow-[0_0_15px_rgba(236,72,153,0.4)]">
            <img src="/api/placeholder/64/64" alt="Current Song" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
               <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                 <Play fill="white" className="w-6 h-6 opacity-80" />
               </motion.div>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg leading-tight truncate">Where She Goes</h3>
            <p className="text-gray-400 text-sm">Bad Bunny</p>
          </div>
          <motion.button 
            whileTap={{ scale: 0.9 }}
            className="bg-gray-800 border border-gray-700 p-3 rounded-full flex flex-col items-center justify-center text-gray-300 hover:text-white"
          >
            <SkipForward className="w-5 h-5" />
            <span className="text-[10px] mt-1">12/36</span>
          </motion.button>
        </div>
      </div>

      {/* ÁREA PRINCIPAL SCROLLABLE */}
      <div className="flex-1 overflow-y-auto pb-24 px-4 pt-4 hide-scrollbar">
        <AnimatePresence mode="wait">
          {activeTab === 'queue' ? (
            <motion.div key="queue" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              
              {/* Botón de Búsqueda */}
              <button className="w-full bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-3 text-gray-400 mb-6 shadow-lg">
                <Search className="w-5 h-5 text-neon-lime" />
                <span className="text-left flex-1">Buscar en Spotify o YouTube...</span>
              </button>

              <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4">Siguientes (Democracia)</h3>
              
              <div className="flex flex-col gap-3">
                <AnimatePresence>
                  {songs.map((song, index) => (
                    <motion.div 
                      layout
                      key={song.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex items-center gap-3 p-3 rounded-xl bg-gray-900 border ${song.myVote !== 0 ? 'border-gray-700' : 'border-transparent'} shadow-md`}
                    >
                      <div className="font-mono text-gray-500 w-4 text-center">{index + 1}</div>
                      <img src={song.thumb} alt={song.title} className="w-12 h-12 rounded-md object-cover" />
                      <div className="flex-1 overflow-hidden">
                        <h4 className="font-bold text-sm truncate text-white">{song.title}</h4>
                        <p className="text-xs text-gray-400 truncate">{song.artist}</p>
                      </div>
                      
                      {/* Controles de Votación */}
                      <div className="flex items-center bg-gray-950 rounded-lg p-1">
                        <motion.button 
                          whileTap={{ scale: 0.8 }}
                          onClick={() => handleVote(song.id, 1)}
                          className={`p-2 rounded-md transition-colors ${song.myVote === 1 ? 'bg-neon-lime/20 text-[#10b981] shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'text-gray-500'}`}
                        >
                          <ChevronUp className="w-5 h-5" />
                        </motion.button>
                        <span className={`w-6 text-center font-bold text-sm ${song.myVote === 1 ? 'text-[#10b981]' : song.myVote === -1 ? 'text-red-500' : 'text-white'}`}>
                          {song.score}
                        </span>
                        <motion.button 
                          whileTap={{ scale: 0.8 }}
                          onClick={() => handleVote(song.id, -1)}
                          className={`p-2 rounded-md transition-colors ${song.myVote === -1 ? 'bg-red-500/20 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'text-gray-500'}`}
                        >
                          <ChevronDown className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex flex-col h-full">
              {/* FEED DE CHAT */}
              <div className="flex-1 flex flex-col justify-end gap-3 pb-4">
                {messages.map((msg) => (
                  <motion.div initial={{ opacity: 0, y: 10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} key={msg.id} className="flex flex-col">
                    <span className="text-[10px] ml-2 mb-1" style={{ color: msg.color }}>{msg.user}</span>
                    {msg.type === 'reaction' ? (
                      <span className="text-4xl">{msg.content}</span>
                    ) : (
                      <div className="bg-gray-800 text-sm p-3 rounded-2xl rounded-tl-sm self-start inline-block shadow-md">
                        {msg.content}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* TECLADO DE REACCIONES RÁPIDAS (Píldoras) */}
              <div className="mt-auto grid grid-cols-4 gap-2 border-t border-gray-800 pt-4">
                {['😍', '🤢', '🤨', '🔊'].map(emoji => (
                  <motion.button
                    key={emoji}
                    whileTap={{ scale: 0.85 }}
                    onClick={() => sendReaction(emoji)}
                    className="bg-gray-900 border border-gray-700 rounded-full py-3 text-2xl flex justify-center hover:bg-gray-800 hover:border-gray-500 transition-all shadow-[0_0_8px_rgba(255,255,255,0.05)]"
                  >
                    {emoji}
                  </motion.button>
                ))}
                <button className="col-span-4 bg-[#a855f7] text-white font-bold rounded-xl py-3 mt-2 shadow-[0_0_15px_rgba(168,85,247,0.5)] flex justify-center items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Escribir Mensaje
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* NAVEGACIÓN INFERIOR FLOTANTE */}
      <div className="absolute bottom-0 w-full bg-gradient-to-t from-gray-950 via-gray-950/90 to-transparent pt-10 pb-6 px-6">
        <div className="bg-gray-900 rounded-full flex p-1 shadow-[0_0_20px_rgba(0,0,0,0.8)] border border-gray-800">
          <button 
            onClick={() => setActiveTab('queue')}
            className={`flex-1 flex justify-center items-center gap-2 py-3 rounded-full font-bold text-sm transition-all ${activeTab === 'queue' ? 'bg-[#a855f7] text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'text-gray-500'}`}
          >
            <ListMusic className="w-5 h-5" />
            Cola
          </button>
          <button 
            onClick={() => setActiveTab('chat')}
            className={`flex-1 flex justify-center items-center gap-2 py-3 rounded-full font-bold text-sm transition-all ${activeTab === 'chat' ? 'bg-[#10b981] text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'text-gray-500'}`}
          >
            <MessageCircle className="w-5 h-5" />
            Chat & Vibe
          </button>
        </div>
      </div>

    </div>
  );
}