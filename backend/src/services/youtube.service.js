const env = require("../config/env");

// node-fetch v3 is ESM-only; use dynamic import wrapper for CommonJS
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetchFn }) => fetchFn(...args));

const YOUTUBE_BASE_URL = "https://www.googleapis.com/youtube/v3";

const getChannelIdByName = async (channelName) => {
  const url = new URL(`${YOUTUBE_BASE_URL}/search`);
  url.searchParams.set("part", "snippet");
  url.searchParams.set("type", "channel");
  url.searchParams.set("q", channelName);
  url.searchParams.set("maxResults", "1");
  url.searchParams.set("key", env.youtubeApiKey);

  const res = await fetch(url.href);
  if (!res.ok) {
    throw new Error(`Failed to fetch channel by name: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const item = data.items && data.items[0];
  if (!item || !item.snippet || !item.snippet.channelId) {
    throw new Error("Channel not found for given name");
  }

  return {
    channelId: item.snippet.channelId,
    channelTitle: item.snippet.title,
    channelDescription: item.snippet.description,
    channelThumbnails: item.snippet.thumbnails,
  };
};

const getChannelUploadsPlaylistId = async (channelId) => {
  const url = new URL(`${YOUTUBE_BASE_URL}/channels`);
  url.searchParams.set("part", "contentDetails");
  url.searchParams.set("id", channelId);
  url.searchParams.set("key", env.youtubeApiKey);

  const res = await fetch(url.href);
  if (!res.ok) {
    throw new Error(`Failed to fetch channel details: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const channel = data.items && data.items[0];
  if (!channel || !channel.contentDetails || !channel.contentDetails.relatedPlaylists) {
    throw new Error("Channel uploads playlist not found");
  }

  return channel.contentDetails.relatedPlaylists.uploads;
};

const getRecentVideoIdsFromPlaylist = async (playlistId, maxVideos = 100) => {
  let videoIds = [];
  let pageToken = undefined;

  while (videoIds.length < maxVideos) {
    const url = new URL(`${YOUTUBE_BASE_URL}/playlistItems`);
    url.searchParams.set("part", "contentDetails");
    url.searchParams.set("playlistId", playlistId);
    url.searchParams.set("maxResults", "50");
    if (pageToken) {
      url.searchParams.set("pageToken", pageToken);
    }
    url.searchParams.set("key", env.youtubeApiKey);

    const res = await fetch(url.href);
    if (!res.ok) {
      throw new Error(`Failed to fetch playlist items: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    const items = data.items || [];

    for (const item of items) {
      const videoId = item.contentDetails && item.contentDetails.videoId;
      if (videoId) {
        videoIds.push(videoId);
        if (videoIds.length >= maxVideos) break;
      }
    }

    if (!data.nextPageToken || videoIds.length >= maxVideos) {
      break;
    }

    pageToken = data.nextPageToken;
  }

  return videoIds;
};

const getVideosDetails = async (videoIds) => {
  if (!videoIds.length) return [];

  const batches = [];
  for (let i = 0; i < videoIds.length; i += 50) {
    batches.push(videoIds.slice(i, i + 50));
  }

  const allResults = [];

  for (const batch of batches) {
    const url = new URL(`${YOUTUBE_BASE_URL}/videos`);
    url.searchParams.set("part", "snippet,statistics,contentDetails");
    url.searchParams.set("id", batch.join(","));
    url.searchParams.set("key", env.youtubeApiKey);

    const res = await fetch(url.href);
    if (!res.ok) {
      throw new Error(`Failed to fetch video details: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    const items = data.items || [];

    for (const item of items) {
      const snippet = item.snippet || {};
      const contentDetails = item.contentDetails || {};
      const statistics = item.statistics || {};

      allResults.push({
        videoId: item.id,
        publishedAt: snippet.publishedAt,
        title: snippet.title,
        description: snippet.description,
        duration: contentDetails.duration || null,
        statistics: {
          viewCount: statistics.viewCount || "0",
          likeCount: statistics.likeCount || "0",
          favoriteCount: statistics.favoriteCount || "0",
          commentCount: statistics.commentCount || "0",
        },
      });
    }
  }

  return allResults;
};

const getChannelAnalytics = async (channelName) => {
  if (!env.youtubeApiKey) {
    throw new Error("YouTube API key is not configured");
  }

  const channelInfo = await getChannelIdByName(channelName);
  
  // Get the uploads playlist ID
  const uploadsPlaylistId = await getChannelUploadsPlaylistId(channelInfo.channelId);
  
  // Get video IDs from the uploads playlist
  const videoIds = await getRecentVideoIdsFromPlaylist(uploadsPlaylistId, 1000);
  const videos = await getVideosDetails(videoIds);

  return {
    channel: channelInfo,
    videos,
  };
};

module.exports = {
  getChannelAnalytics,
};