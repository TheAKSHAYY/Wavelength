import { Router } from "express";
import { config } from "../config.js";
import { requireAuth } from "../middleware.js";
import { getYouTubeSuggestions } from "../services/youtubeResearch.js";

const router = Router();

interface VideoStats {
  title: string;
  views: number;
  publishedAt: string;
}

// Real-time YouTube Search Autocomplete Suggestions (100% Free, No quota used)
router.get("/suggest", async (req, res) => {
  const query = typeof req.query.q === "string" ? req.query.q : "";
  if (!query.trim()) {
    return res.json({ suggestions: [] });
  }

  try {
    const suggestions = await getYouTubeSuggestions(query);
    return res.json({ suggestions });
  } catch (err) {
    console.warn("YouTube suggest error:", err);
    return res.json({ suggestions: [] });
  }
});

// Fetches real (public) per-video lifetime view counts for the configured
// channel. If no YOUTUBE_API_KEY / YOUTUBE_CHANNEL_ID are set, the client
// falls back to sample data and this returns { configured: false }.
router.get("/analytics", requireAuth, async (_req, res) => {
  if (!config.youtubeApiKey || !config.youtubeChannelId) {
    return res.json({ configured: false, data: null });
  }

  try {
    const channelRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${encodeURIComponent(
        config.youtubeChannelId
      )}&key=${encodeURIComponent(config.youtubeApiKey)}`
    );
    const channel = (await channelRes.json()) as {
      items?: Array<{ contentDetails?: { relatedPlaylists?: { uploads?: string } } }>;
    };
    const playlistId = channel?.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
    if (!playlistId) {
      return res.status(404).json({ error: "Uploads playlist not found for this channel." });
    }

    const playRes = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=10&playlistId=${encodeURIComponent(
        playlistId
      )}&key=${encodeURIComponent(config.youtubeApiKey)}`
    );
    const play = (await playRes.json()) as {
      items?: Array<{ snippet?: { resourceId?: { videoId?: string } } }>;
    };
    const videoIds = (play.items || [])
      .map((i) => i.snippet?.resourceId?.videoId)
      .filter((id): id is string => Boolean(id));
    if (videoIds.length === 0) {
      return res.json({ configured: true, data: [] });
    }

    const statsRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds.join(
        ","
      )}&key=${encodeURIComponent(config.youtubeApiKey)}`
    );
    const stats = (await statsRes.json()) as {
      items?: Array<{
        snippet?: { title?: string; publishedAt?: string };
        statistics?: { viewCount?: string };
      }>;
    };

    const data: VideoStats[] = (stats.items || [])
      .map((i) => ({
        title: i.snippet?.title || "Untitled",
        views: Number(i.statistics?.viewCount || 0),
        publishedAt: i.snippet?.publishedAt || "",
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 7);

    return res.json({ configured: true, data });
  } catch (err) {
    console.error("YouTube API error:", err);
    return res.status(500).json({ error: "Failed to reach YouTube API." });
  }
});

export default router;

