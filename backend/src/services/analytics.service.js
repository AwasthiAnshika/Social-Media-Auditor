

const analyzeVideosByPeriod = (videos, days) => {
  const now = new Date();
  const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  
  return videos.filter(video => {
    const publishedDate = new Date(video.publishedAt);
    return publishedDate >= cutoffDate;
  });
};

const analyzeVideosByRange = (videos, startDaysAgo, endDaysAgo) => {
  const now = new Date();
  const startDate = new Date(now.getTime() - startDaysAgo * 24 * 60 * 60 * 1000);
  const endDate = new Date(now.getTime() - endDaysAgo * 24 * 60 * 60 * 1000);

  return videos.filter(video => {
    const publishedDate = new Date(video.publishedAt);
    return publishedDate >= endDate && publishedDate < startDate;
  });
};

const extractHashtags = (text) => {
  if (!text) return [];
  const hashtagRegex = /#[\w]+/g;
  return text.match(hashtagRegex) || [];
};

const analyzeHashtags = (videos) => {
  const hashtagMap = {};
  
  videos.forEach(video => {
    const titleHashtags = extractHashtags(video.title || '');
    const descHashtags = extractHashtags(video.description || '');
    const allHashtags = [...titleHashtags, ...descHashtags];
    
    allHashtags.forEach(tag => {
      const normalizedTag = tag.toLowerCase();
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
      hashtagMap[normalizedTag].totalViews += parseInt(video.statistics.viewCount || 0);
      hashtagMap[normalizedTag].totalLikes += parseInt(video.statistics.likeCount || 0);
      hashtagMap[normalizedTag].videos.push(video.videoId);
    });
  });
  
  return Object.values(hashtagMap)
    .sort((a, b) => b.totalViews - a.totalViews)
    .slice(0, 20); // Top 20 hashtags
};

const calculateTrends = (videos30, videos60, videos90, videosPrev90) => {
  const calculateAvg = (videos, metric) => {
    if (videos.length === 0) return 0;
    const sum = videos.reduce((acc, v) => acc + parseInt(v.statistics[metric] || 0), 0);
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

const getTopPerformers = (videos, limit = 10) => {
  return [...videos]
    .sort((a, b) => parseInt(b.statistics.viewCount || 0) - parseInt(a.statistics.viewCount || 0))
    .slice(0, limit)
    .map(v => ({
      title: v.title,
      videoId: v.videoId,
      views: parseInt(v.statistics.viewCount || 0),
      likes: parseInt(v.statistics.likeCount || 0),
      comments: parseInt(v.statistics.commentCount || 0),
      publishedAt: v.publishedAt,
      engagementRate: calculateEngagementRate(v)
    }));
};

const getLowPerformers = (videos, limit = 10) => {
  return [...videos]
    .sort((a, b) => parseInt(a.statistics.viewCount || 0) - parseInt(b.statistics.viewCount || 0))
    .slice(0, limit)
    .map(v => ({
      title: v.title,
      videoId: v.videoId,
      views: parseInt(v.statistics.viewCount || 0),
      likes: parseInt(v.statistics.likeCount || 0),
      comments: parseInt(v.statistics.commentCount || 0),
      publishedAt: v.publishedAt,
      engagementRate: calculateEngagementRate(v)
    }));
};
const formatDuration = (isoDuration) => {
  if (!isoDuration) return 'N/A';
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 'N/A';

  const hours = parseInt(match[1] || 0, 10);
  const minutes = parseInt(match[2] || 0, 10);
  const seconds = parseInt(match[3] || 0, 10);

  const parts = [];
  if (hours > 0) parts.push(String(hours).padStart(2, '0'));
  parts.push(String(minutes).padStart(2, '0'));
  parts.push(String(seconds).padStart(2, '0'));

  return parts.join(':');
};
const durationToSeconds = (isoDuration) => {
  if (!isoDuration) return 0;
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1] || 0, 10);
  const minutes = parseInt(match[2] || 0, 10);
  const seconds = parseInt(match[3] || 0, 10);
  return hours * 3600 + minutes * 60 + seconds;
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
    .sort((a, b) => parseInt(b.statistics.viewCount || 0) - parseInt(a.statistics.viewCount || 0))
    .slice(0, limit)
    .map(v => ({
      title: v.title,
      link: `https://www.youtube.com/watch?v=${v.videoId}`,
      duration: formatDuration(v.duration),
      totalViews: parseInt(v.statistics.viewCount || 0)
    }));
};

const getTopVideosLast90Days = (videos, limit = 5) => {
  const videos90Days = analyzeVideosByPeriod(videos, 90);
  return getTopVideosAllTime(videos90Days, limit);
};

const getWorstVideosAllTime = (videos, limit = 5) => {
  return [...videos]
    .sort((a, b) => parseInt(a.statistics.viewCount || 0) - parseInt(b.statistics.viewCount || 0))
    .slice(0, limit)
    .map(v => ({
      title: v.title,
      link: `https://www.youtube.com/watch?v=${v.videoId}`,
      duration: formatDuration(v.duration),
      totalViews: parseInt(v.statistics.viewCount || 0)
    }));
};

const getWorstVideosLast90Days = (videos, limit = 5) => {
  const videos90Days = analyzeVideosByPeriod(videos, 90);
  return getWorstVideosAllTime(videos90Days, limit);
};

const calculateAvgDuration = (videos) => {
  if (!videos || videos.length === 0) {
    return { seconds: 0, formatted: 'N/A' };
  }
  const totalSeconds = videos.reduce((acc, v) => acc + durationToSeconds(v.duration), 0);
  const avgSeconds = Math.round(totalSeconds / videos.length);
  return { seconds: avgSeconds, formatted: formatSeconds(avgSeconds) };
};

const calculateEngagementRate = (video) => {
  const views = parseInt(video.statistics.viewCount || 0);
  if (views === 0) return 0;
  const likes = parseInt(video.statistics.likeCount || 0);
  const comments = parseInt(video.statistics.commentCount || 0);
  return ((likes + comments) / views * 100).toFixed(2);
};

const generateAnalytics = (channelData) => {
  const { videos } = channelData;
  
  // Filter videos by time periods
  const videos30 = analyzeVideosByPeriod(videos, 30);
  const videos60 = analyzeVideosByPeriod(videos, 60);
  const videos90 = analyzeVideosByPeriod(videos, 90);
  const videosPrev90 = analyzeVideosByRange(videos, 90, 180);
  
  // Calculate trends
  const trends = calculateTrends(videos30, videos60, videos90, videosPrev90);
  
  // Analyze hashtags
  const hashtags = analyzeHashtags(videos);
  
  // Get top and low performers
  const topPerformers = getTopPerformers(videos);
  const lowPerformers = getLowPerformers(videos);
  const topVideosAllTime = getTopVideosAllTime(videos);
  const topVideosLast90Days = getTopVideosLast90Days(videos);
  const worstVideosAllTime = getWorstVideosAllTime(videos);
  const worstVideosLast90Days = getWorstVideosLast90Days(videos);
  const lengthVsPerformance = {
    top5: calculateAvgDuration(topVideosLast90Days),
    bottom5: calculateAvgDuration(worstVideosLast90Days)
  };
  
  // Overall stats
  const totalVideos = videos.length;
  const totalViews = videos.reduce((sum, v) => sum + parseInt(v.statistics.viewCount || 0), 0);
  const totalLikes = videos.reduce((sum, v) => sum + parseInt(v.statistics.likeCount || 0), 0);
  const totalComments = videos.reduce((sum, v) => sum + parseInt(v.statistics.commentCount || 0), 0);
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
    topPerformers,
    lowPerformers,
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
  getTopPerformers,
  getLowPerformers,
  getTopVideosAllTime,
  getTopVideosLast90Days,
  getWorstVideosAllTime,
  getWorstVideosLast90Days
};

