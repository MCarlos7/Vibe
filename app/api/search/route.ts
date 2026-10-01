import { NextResponse } from 'next/server';
import play from 'play-dl';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) return NextResponse.json([]);

  try {
    try {
      const clientID = await play.getFreeClientID();
      play.setToken({
        soundcloud: {
          client_id: clientID
        }
      });
    } catch (tokenError) {
      console.warn("Advertencia token SoundCloud", tokenError);
    }

    let ytVideos: any[] = [];
    try {
      const ytResults = await play.search(query, { limit: 7, source: { youtube: 'video' } });
      ytVideos = ytResults
        .filter((vid) => {
          const artistName = (vid.channel?.name || '').toLowerCase();
          return !artistName.includes('vevo') && !artistName.includes('topic');
        })
        .map((vid) => ({
          id: vid.id,
          title: vid.title,
          artist: vid.channel?.name || 'YouTube',
          thumbnail: vid.thumbnails?.[0]?.url || '',
          duration: vid.durationInSec,
          platform: 'youtube',
          url: vid.url,
        }));
    } catch (e) {
      console.error('Error YouTube:', e);
    }

    let scTracks: any[] = [];
    try {
      const scResults = await play.search(query, { limit: 5, source: { soundcloud: 'tracks' } });
      scTracks = scResults.map((track) => ({
        id: track.id || track.url,
        title: track.name,
        artist: track.user?.name || 'SoundCloud',
        thumbnail: track.thumbnail || 'https://w7.pngwing.com/pngs/183/887/png-transparent-soundcloud-logo-soundcloud-computer-icons-logo-soundcloud-logo-text-orange-logo.png',
        duration: track.durationInSec,
        platform: 'soundcloud',
        url: track.url,
      }));
    } catch (e) {
      console.error('Error SoundCloud:', e);
    }

    return NextResponse.json([...ytVideos, ...scTracks]);
  } catch (error) {
    console.error("Error global:", error);
    return NextResponse.json([]);
  }
}