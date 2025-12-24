const env = require("../config/env");
const { ApifyClient } = require("apify-client");

const apifyClient = new ApifyClient({
  token: env.apifyTiktokApiToken,
});

const getTikTokData = async (username) => {
  const input = {
    "startUrls": [
        `https://www.tiktok.com/@${username}`,
    ],
    "maxItems": 100,
    "dateRange": "LAST_THREE_MONTHS",
    "location": "US",
    "sortType": "DATE_POSTED"
  };

  const run = await apifyClient.actor("5K30i8aFccKNF5ICs").call(input);

  const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
  
  if (!items || items.length === 0) {
    return { profile: null, data: [] };
  }

  // Extract profile data from the first item's channel (all items have the same channel info)
  const profile = {
    id: items[0].channel?.id,
    name: items[0].channel?.name,
    username: items[0].channel?.username,
    bio: items[0].channel?.bio,
    avatar: items[0].channel?.avatar,
    url: items[0].channel?.url,
    followers: items[0].channel?.followers,
    following: items[0].channel?.following,
    videos: items[0].channel?.videos,
    verified: items[0].channel?.verified,
  };

  // Map video data from each item
  const data = items.map((item) => ({
    id: item.id,
    title: item.title,
    postPage: item.postPage,
    views: item.views,
    likes: item.likes,
    comments: item.comments,
    shares: item.shares,
    bookmarks: item.bookmarks,
    hashtags: item.hashtags || [],
    uploadedAt: item.uploadedAt,
    uploadedAtFormatted: item.uploadedAtFormatted,
    video: {
      width: item.video?.width,
      height: item.video?.height,
      ratio: item.video?.ratio,
      duration: item.video?.duration,
      url: item.video?.url,
      cover: item.video?.cover,
      thumbnail: item.video?.thumbnail,
    },
    song: item.song ? {
      id: item.song.id,
      title: item.song.title,
      artist: item.song.artist,
      album: item.song.album,
      duration: item.song.duration,
      cover: item.song.cover,
    } : null,
  }));
  
  const payload = {
    profile: profile,
    data: data,
  };
  return payload;
};

module.exports = {
  getTikTokData,
};
