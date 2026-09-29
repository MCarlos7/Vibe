import { motion, AnimatePresence } from 'framer-motion';

export default function FloatingReactions({ reactions }: { reactions: any[] }) {
  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {reactions.map((reaction) => {
          // Posición horizontal aleatoria entre el 10% y el 60% de la pantalla (evitando el sidebar)
          const randomX = Math.floor(Math.random() * 50) + 10;
          
          return (
            <motion.div
              key={reaction.id}
              initial={{ y: '100vh', x: `${randomX}vw`, opacity: 0, scale: 0.5 }}
              animate={{ 
                y: '-20vh', 
                opacity: [0, 1, 1, 0],
                scale: [0.5, 1.2, 1, 0.8],
                rotate: Math.random() * 30 - 15 // Ligera rotación aleatoria
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.5, ease: "easeOut" }}
              className="absolute text-6xl drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] flex flex-col items-center"
            >
              <span>{reaction.emoji}</span>
              <span className="text-xs text-white bg-black/50 px-2 py-1 rounded-full mt-1 font-mono">
                {reaction.user}
              </span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}