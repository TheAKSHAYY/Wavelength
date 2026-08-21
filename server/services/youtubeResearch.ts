import { config } from "../config.js";

export interface YouTubeVideoInfo {
  id: string;
  title: string;
  channelTitle: string;
  channelId: string;
  publishedAt: string;
  views: number;
  likes: number;
  comments: number;
  tags: string[];
}

export interface YouTubeChannelInfo {
  id: string;
  name: string;
  subscriberCount: number;
  totalViews: number;
  videoCount: number;
  recentVideos: { title: string; views: number; publishedAt: string }[];
  avgRecentViews: number;
  uploadFrequencyDays: number;
}

/**
 * Searches YouTube for videos matching a query and fetches full statistics (views, likes, comments).
 */
export async function searchYouTubeVideos(
  query: string,
  options: { order?: "relevance" | "viewCount" | "date"; maxResults?: number } = {}
): Promise<YouTubeVideoInfo[]> {
  const apiKey = config.youtubeApiKey;
  if (!apiKey) return [];

  const { order = "relevance", maxResults = 10 } = options;

  try {
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&order=${order}&q=${encodeURIComponent(
      query
    )}&maxResults=${maxResults}&key=${encodeURIComponent(apiKey)}`;

    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) {
      console.warn("YouTube search failed:", searchRes.status, await searchRes.text());
      return [];
    }

    const searchData = (await searchRes.json()) as {
      items?: Array<{
        id?: { videoId?: string };
        snippet?: {
          title?: string;
          channelTitle?: string;
          channelId?: string;
          publishedAt?: string;
        };
      }>;
    };

    const items = searchData.items || [];
    const videoIds = items.map((i) => i.id?.videoId).filter((id): id is string => Boolean(id));

    if (videoIds.length === 0) return [];

    // Fetch video statistics
    const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds.join(
      ","
    )}&key=${encodeURIComponent(apiKey)}`;

    const statsRes = await fetch(statsUrl);
    if (!statsRes.ok) return [];

    const statsData = (await statsRes.json()) as {
      items?: Array<{
        id?: string;
        snippet?: {
          title?: string;
          channelTitle?: string;
          channelId?: string;
          publishedAt?: string;
          tags?: string[];
        };
        statistics?: {
          viewCount?: string;
          likeCount?: string;
          commentCount?: string;
        };
      }>;
    };

    return (statsData.items || []).map((v) => ({
      id: v.id || "",
      title: decodeHtmlEntities(v.snippet?.title || "Untitled"),
      channelTitle: v.snippet?.channelTitle || "Unknown Channel",
      channelId: v.snippet?.channelId || "",
      publishedAt: v.snippet?.publishedAt || "",
      views: Number(v.statistics?.viewCount || 0),
      likes: Number(v.statistics?.likeCount || 0),
      comments: Number(v.statistics?.commentCount || 0),
      tags: v.snippet?.tags || [],
    }));
  } catch (err) {
    console.error("Error searching YouTube videos:", err);
    return [];
  }
}

/**
 * Fetches real competitor channel statistics, recent video view counts, and upload frequency.
 */
export async function getYouTubeChannelIntel(channelQuery: string): Promise<YouTubeChannelInfo | null> {
  const apiKey = config.youtubeApiKey;
  if (!apiKey) return null;

  try {
    // 1. Search for channel
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(
      channelQuery
    )}&maxResults=1&key=${encodeURIComponent(apiKey)}`;

    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) return null;

    const searchData = (await searchRes.json()) as {
      items?: Array<{ id?: { channelId?: string }; snippet?: { title?: string } }>;
    };

    const channelId = searchData.items?.[0]?.id?.channelId;
    if (!channelId) return null;

    // 2. Get channel details & uploads playlist
    const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&id=${channelId}&key=${encodeURIComponent(
      apiKey
    )}`;

    const channelRes = await fetch(channelUrl);
    if (!channelRes.ok) return null;

    const channelData = (await channelRes.json()) as {
      items?: Array<{
        snippet?: { title?: string };
        statistics?: { subscriberCount?: string; viewCount?: string; videoCount?: string };
        contentDetails?: { relatedPlaylists?: { uploads?: string } };
      }>;
    };

    const channel = channelData.items?.[0];
    if (!channel) return null;

    const name = decodeHtmlEntities(channel.snippet?.title || channelQuery);
    const subscriberCount = Number(channel.statistics?.subscriberCount || 0);
    const totalViews = Number(channel.statistics?.viewCount || 0);
    const videoCount = Number(channel.statistics?.videoCount || 0);
    const uploadsPlaylistId = channel.contentDetails?.relatedPlaylists?.uploads;

    let recentVideos: { title: string; views: number; publishedAt: string }[] = [];
    let avgRecentViews = 0;
    let uploadFrequencyDays = 7;

    if (uploadsPlaylistId) {
      const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=8&key=${encodeURIComponent(
        apiKey
      )}`;
      const playlistRes = await fetch(playlistUrl);
      if (playlistRes.ok) {
        const playlistData = (await playlistRes.json()) as {
          items?: Array<{ snippet?: { title?: string; publishedAt?: string; resourceId?: { videoId?: string } } }>;
        };

        const vIds = (playlistData.items || [])
          .map((i) => i.snippet?.resourceId?.videoId)
          .filter((id): id is string => Boolean(id));

        if (vIds.length > 0) {
          const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${vIds.join(
            ","
          )}&key=${encodeURIComponent(apiKey)}`;
          const statsRes = await fetch(statsUrl);
          if (statsRes.ok) {
            const statsData = (await statsRes.json()) as {
              items?: Array<{ snippet?: { title?: string; publishedAt?: string }; statistics?: { viewCount?: string } }>;
            };
            recentVideos = (statsData.items || []).map((v) => ({
              title: decodeHtmlEntities(v.snippet?.title || ""),
              views: Number(v.statistics?.viewCount || 0),
              publishedAt: v.snippet?.publishedAt || "",
            }));

            if (recentVideos.length > 0) {
              const total = recentVideos.reduce((acc, cur) => acc + cur.views, 0);
              avgRecentViews = Math.round(total / recentVideos.length);

              if (recentVideos.length >= 2) {
                const dates = recentVideos
                  .map((v) => new Date(v.publishedAt).getTime())
                  .filter((t) => !isNaN(t))
                  .sort((a, b) => b - a);
                if (dates.length >= 2) {
                  const dayDiff = (dates[0] - dates[dates.length - 1]) / (1000 * 60 * 60 * 24);
                  uploadFrequencyDays = Math.max(1, Math.round(dayDiff / (dates.length - 1)));
                }
              }
            }
          }
        }
      }
    }

    return {
      id: channelId,
      name,
      subscriberCount,
      totalViews,
      videoCount,
      recentVideos,
      avgRecentViews,
      uploadFrequencyDays,
    };
  } catch (err) {
    console.error("Error getting channel intel:", err);
    return null;
  }
}

/**
 * Helper to decode HTML entities in YouTube titles like &amp; &#39;
 */
function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ");
}

/**
 * Format numbers into human-readable view counts e.g. 1.2M, 450K
 */
export function formatViews(views: number): string {
  if (views >= 1_000_000) {
    return (views / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M views";
  }
  if (views >= 1_000) {
    return (views / 1_000).toFixed(0) + "K views";
  }
  return views + " views";
}

/**
 * Fetches real-time YouTube search autocomplete suggestions.
 * Completely free, no API key required, zero quota usage.
 */
export async function getYouTubeSuggestions(query: string): Promise<string[]> {
  const clean = query.trim();
  if (!clean) return [];

  try {
    const url = `https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(clean)}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return [];

    const data = (await res.json()) as [string, string[]];
    if (Array.isArray(data) && Array.isArray(data[1])) {
      return data[1].slice(0, 12);
    }
    return [];
  } catch (err) {
    console.warn("YouTube suggestions fetch error:", err);
    return [];
  }
}

