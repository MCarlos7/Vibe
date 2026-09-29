// lib/gun.ts
import Gun from 'gun/gun';

let gunInstance: any = null;

export function getGun() {
  if (typeof window === 'undefined') return null;
  
  if (!gunInstance) {
    const host = window.location.hostname;
    // Ahora apuntamos exclusivamente al puerto 8765 para evitar conflictos
    gunInstance = Gun({
      peers: [`http://${host}:8765/gun`],
      localStorage: true
    });
  }
  return gunInstance;
}