// TikTok analytics service to analyze video data and generate insights

const analyzeVideosByPeriod = (videos, days) => {
  const now = new Date();
  const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  
  return videos.filter(video => {
    const publishedDate = new Date(video.uploadedAt * 1000); // uploadedAt is Unix timestamp in seconds
    return publishedDate >= cutoffDate;
  });
};

const analyzeVideosByRange = (videos, startDaysAgo, endDaysAgo) => {
  const now = new Date();
  const startDate = new Date(now.getTime() - startDaysAgo * 24 * 60 * 60 * 1000);
  const endDate = new Date(now.getTime() - endDaysAgo * 24 * 60 * 60 * 1000);

  return videos.filter(video => {
    const publishedDate = new Date(video.uploadedAt * 1000);
    return publishedDate >= endDate && publishedDate < startDate;
  });
};

const safeInt = (n) => (typeof n === "number" && Number.isFinite(n) ? n : 0);

const analyzeHashtags = (videos) => {
  const hashtagMap = {};
  
  videos.forEach(video => {
    const tags = Array.isArray(video.hashtags) ? video.hashtags : [];
    const views = safeInt(video.views);
    
    tags.forEach(tag => {
      const normalizedTag = String(tag || "").trim().toLowerCase();
      if (!normalizedTag) return;
      
      if (!hashtagMap[normalizedTag]) {
        hashtagMap[normalizedTag] = {
          tag: tag,
          count: 0,
          totalViews: 0,
          totalLikes: 0,
          videos: []
        };
      }
      hashtagMap[normalizedTag].count++;
      hashtagMap[normalizedTag].totalViews += views;
      hashtagMap[normalizedTag].totalLikes += safeInt(video.likes);
      if (video.id) {
        hashtagMap[normalizedTag].videos.push(video.id);
      }
    });
  });
  
  return Object.values(hashtagMap)
    .sort((a, b) => b.totalViews - a.totalViews)
    .slice(0, 20); // Top 20 hashtags
};

const calculateTrends = (videos30, videos60, videos90, videosPrev90) => {
  const calculateAvg = (videos, metric) => {
    if (videos.length === 0) return 0;
    const sum = videos.reduce((acc, v) => {
      if (metric === 'viewCount') {
        return acc + safeInt(v.views);
      } else if (metric === 'likeCount') {
        return acc + safeInt(v.likes);
      } else if (metric === 'commentCount') {
        return acc + safeInt(v.comments);
      }
      return acc;
    }, 0);
    return Math.round(sum / videos.length);
  };

  const avgViews30 = calculateAvg(videos30, 'viewCount');
  const avgViews60 = calculateAvg(videos60, 'viewCount');
  const avgViews90 = calculateAvg(videos90, 'viewCount');
  const avgViewsPrev90 = calculateAvg(videosPrev90, 'viewCount');

  const avgLikes30 = calculateAvg(videos30, 'likeCount');
  const avgLikes60 = calculateAvg(videos60, 'likeCount');
  const avgLikes90 = calculateAvg(videos90, 'likeCount');
  const avgLikesPrev90 = calculateAvg(videosPrev90, 'likeCount');

  const avgComments30 = calculateAvg(videos30, 'commentCount');
  const avgComments60 = calculateAvg(videos60, 'commentCount');
  const avgComments90 = calculateAvg(videos90, 'commentCount');
  const avgCommentsPrev90 = calculateAvg(videosPrev90, 'commentCount');

  return {
    views: {
      '30days': avgViews30,
      '60days': avgViews60,
      '90days': avgViews90,
      'prev90days': avgViewsPrev90,
      trend: avgViews30 > avgViews60 ? 'up' : avgViews30 < avgViews60 ? 'down' : 'stable'
    },
    likes: {
      '30days': avgLikes30,
      '60days': avgLikes60,
      '90days': avgLikes90,
      'prev90days': avgLikesPrev90,
      trend: avgLikes30 > avgLikes60 ? 'up' : avgLikes30 < avgLikes60 ? 'down' : 'stable'
    },
    comments: {
      '30days': avgComments30,
      '60days': avgComments60,
      '90days': avgComments90,
      'prev90days': avgCommentsPrev90,
      trend: avgComments30 > avgComments60 ? 'up' : avgComments30 < avgComments60 ? 'down' : 'stable'
    }
  };
};

const formatDuration = (seconds) => {
  if (!seconds || typeof seconds !== 'number' || !Number.isFinite(seconds)) return 'N/A';
  const s = Math.round(seconds);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m > 0 ? `${m}m ${r}s` : `${r}s`;
};

const formatSeconds = (totalSeconds) => {
  if (!totalSeconds || Number.isNaN(totalSeconds)) return 'N/A';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const parts = [];
  if (hours > 0) parts.push(String(hours).padStart(2, '0'));
  parts.push(String(minutes).padStart(2, '0'));
  parts.push(String(seconds).padStart(2, '0'));

  return parts.join(':');
};

const getTopVideosAllTime = (videos, limit = 5) => {
  return [...videos]
    .sort((a, b) => safeInt(b.views) - safeInt(a.views))
    .slice(0, limit)
    .map(v => {
      const title = (v.title || "").trim().slice(0, 80) || "(No title)";
      return {
        title,
        link: v.postPage || `https://www.tiktok.com/video/${v.id || ''}`,
        duration: formatDuration(v.video?.duration),
        totalViews: safeInt(v.views),
        likes: safeInt(v.likes),
        comments: safeInt(v.comments),
        shares: safeInt(v.shares),
        timestamp: v.uploadedAt ? new Date(v.uploadedAt * 1000) : null,
        videoDuration: v.video?.duration // Store original for length calculation
      };
    });
};

const getTopVideosLast90Days = (videos, limit = 5) => {
  const videos90Days = analyzeVideosByPeriod(videos, 90);
  return getTopVideosAllTime(videos90Days, limit);
};

const getWorstVideosAllTime = (videos, limit = 5) => {
  return [...videos]
    .sort((a, b) => safeInt(a.views) - safeInt(b.views))
    .slice(0, limit)
    .map(v => {
      const title = (v.title || "").trim().slice(0, 80) || "(No title)";
      return {
        title,
        link: v.postPage || `https://www.tiktok.com/video/${v.id || ''}`,
        duration: formatDuration(v.video?.duration),
        totalViews: safeInt(v.views),
        likes: safeInt(v.likes),
        comments: safeInt(v.comments),
        shares: safeInt(v.shares),
        timestamp: v.uploadedAt ? new Date(v.uploadedAt * 1000) : null,
        videoDuration: v.video?.duration // Store original for length calculation
      };
    });
};

const getWorstVideosLast90Days = (videos, limit = 5) => {
  const videos90Days = analyzeVideosByPeriod(videos, 90);
  return getWorstVideosAllTime(videos90Days, limit);
};

const calculateAvgDuration = (videos) => {
  if (!videos || videos.length === 0) {
    return { seconds: 0, formatted: 'N/A' };
  }
  const durations = videos
    .map(v => v.videoDuration)
    .filter(d => typeof d === "number" && Number.isFinite(d));
  
  if (durations.length === 0) {
    return { seconds: 0, formatted: 'N/A' };
  }
  
  const totalSeconds = durations.reduce((acc, d) => acc + d, 0);
  const avgSeconds = Math.round(totalSeconds / durations.length);
  return { seconds: avgSeconds, formatted: formatSeconds(avgSeconds) };
};

const calculateEngagementRate = (video) => {
  const views = safeInt(video.views);
  if (views === 0) return 0;
  const likes = safeInt(video.likes);
  const comments = safeInt(video.comments);
  const shares = safeInt(video.shares);
  return ((likes + comments + shares) / views * 100).toFixed(2);
};

const generateAnalytics = (tiktokData) => {
  // Handle both object with data property and direct array
  let videos = [];
  if (Array.isArray(tiktokData)) {
    videos = tiktokData;
  } else if (Array.isArray(tiktokData?.data)) {
    videos = tiktokData.data;
  } else if (tiktokData?.videos) {
    videos = tiktokData.videos;
  }
  
  // Filter videos by time periods
  const videos30 = analyzeVideosByPeriod(videos, 30);
  const videos60 = analyzeVideosByPeriod(videos, 60);
  const videos90 = analyzeVideosByPeriod(videos, 90);
  const videosPrev90 = analyzeVideosByRange(videos, 90, 180);
  
  // Calculate trends
  const trends = calculateTrends(videos30, videos60, videos90, videosPrev90);
  
  // Analyze hashtags
  const hashtags = analyzeHashtags(videos);
  
  // Get top and worst performers
  const topVideosAllTime = getTopVideosAllTime(videos);
  const topVideosLast90Days = getTopVideosLast90Days(videos);
  const worstVideosAllTime = getWorstVideosAllTime(videos);
  const worstVideosLast90Days = getWorstVideosLast90Days(videos);
  
  // Calculate length vs performance
  const lengthVsPerformance = {
    top5: calculateAvgDuration(topVideosLast90Days.map(v => ({ videoDuration: v.videoDuration }))),
    bottom5: calculateAvgDuration(worstVideosLast90Days.map(v => ({ videoDuration: v.videoDuration })))
  };
  
  // Overall stats
  const totalVideos = videos.length;
  const totalViews = videos.reduce((sum, v) => sum + safeInt(v.views), 0);
  const totalLikes = videos.reduce((sum, v) => sum + safeInt(v.likes), 0);
  const totalComments = videos.reduce((sum, v) => sum + safeInt(v.comments), 0);
  const avgEngagementRate = videos.length > 0 
    ? (videos.reduce((sum, v) => sum + parseFloat(calculateEngagementRate(v)), 0) / videos.length).toFixed(2)
    : 0;
  
  return {
    periods: {
      '30days': {
        videoCount: videos30.length,
        videos: videos30
      },
      '60days': {
        videoCount: videos60.length,
        videos: videos60
      },
      '90days': {
        videoCount: videos90.length,
        videos: videos90
      },
      'prev90days': {
        videoCount: videosPrev90.length,
        videos: videosPrev90
      }
    },
    trends,
    hashtags,
    topVideosAllTime,
    topVideosLast90Days,
    worstVideosAllTime,
    worstVideosLast90Days,
    lengthVsPerformance,
    overall: {
      totalVideos,
      totalViews,
      totalLikes,
      totalComments,
      avgEngagementRate
    }
  };
};

module.exports = {
  generateAnalytics,
  analyzeVideosByPeriod,
  analyzeHashtags,
  calculateTrends,
  getTopVideosAllTime,
  getTopVideosLast90Days,
  getWorstVideosAllTime,
  getWorstVideosLast90Days
};

