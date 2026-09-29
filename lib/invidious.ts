// lib/invidious.ts

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration: number;
}

// Instancias públicas y gratuitas de Invidious
const INVIDIOUS_INSTANCES = [
  'https://inv.projectsegfau.lt',
  'https://invidious.nerdvpn.de',
  'https://yt.drgnz.club'
];

export async function searchOpenMusic(query: string): Promise<MusicTrack[]> {
  if (!query.trim()) return [];

  for (const instance of INVIDIOUS_INSTANCES) {
    try {
      const res = await fetch(`${instance}/api/v1/search?q=${encodeURIComponent(query)}&type=video`, {
        signal: AbortSignal.timeout(3000)
      });
      if (!res.ok) continue;
      const data = await res.json();

      return data.slice(0, 10).map((item: any) => ({
        id: item.videoId,
        title: item.title,
        artist: item.author,
        thumbnail: item.videoThumbnails?.find((t: any) => t.quality === 'medium')?.url || item.videoThumbnails[0]?.url || '',
        duration: item.lengthSeconds
      }));
    } catch {
      // Si una instancia falla o tarda más de 3s, prueba la siguiente
      continue;
    }
  }
  return [];
}