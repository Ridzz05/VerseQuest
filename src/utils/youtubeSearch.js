const YT_SEARCH_ENDPOINT = "https://www.googleapis.com/youtube/v3/search";

export function getYoutubeSearchUrl(query) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

export async function searchYouTubeVideo(query, { apiKey } = {}) {
  const key = apiKey || import.meta.env.VITE_YOUTUBE_API_KEY;
  if (!key) return null;

  const params = new URLSearchParams({
    part: "snippet",
    q: query,
    type: "video",
    videoEmbeddable: "true",
    maxResults: "1",
    key,
  });

  const response = await fetch(`${YT_SEARCH_ENDPOINT}?${params.toString()}`);
  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(`YouTube search failed (${response.status}): ${errText || response.statusText}`);
  }

  const data = await response.json();
  const item = data.items && data.items[0];
  if (!item || !item.id || !item.id.videoId) return null;

  return {
    videoId: item.id.videoId,
    title: item.snippet ? item.snippet.title : "",
    channel: item.snippet ? item.snippet.channelTitle : "",
    url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
  };
}
