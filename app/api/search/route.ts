import { NextResponse } from 'next/server';
import ytSearch from 'yt-search';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) return NextResponse.json([]);

  try {
    // yt-search busca directamente sin necesidad de API keys
    const result = await ytSearch(query);
    
    // Tomamos los primeros 10 resultados de videos
    const videos = result.videos.slice(0, 10).map((vid) => ({
      id: vid.videoId,
      title: vid.title,
      artist: vid.author.name,
      thumbnail: vid.thumbnail,
      duration: vid.seconds
    }));

    return NextResponse.json(videos);
  } catch (error) {
    console.error("Error al buscar música:", error);
    return NextResponse.json([]);
  }
}