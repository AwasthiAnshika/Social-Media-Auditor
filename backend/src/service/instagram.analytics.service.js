// Instagram analytics service to analyze post data and generate insights

const analyzePostsByPeriod = (posts, days) => {
  const now = new Date();
  const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  
  return posts.filter(post => {
    const publishedDate = new Date(post.timestamp);
    return publishedDate >= cutoffDate;
  });
};

// Analyze posts between two points in time: from endDaysAgo to startDaysAgo
const analyzePostsByRange = (posts, startDaysAgo, endDaysAgo) => {
  const now = new Date();
  const startDate = new Date(now.getTime() - startDaysAgo * 24 * 60 * 60 * 1000);
  const endDate = new Date(now.getTime() - endDaysAgo * 24 * 60 * 60 * 1000);

  return posts.filter(post => {
    const publishedDate = new Date(post.timestamp);
    return publishedDate >= endDate && publishedDate < startDate;
  });
};

const getViews = (post) => {
  const v1 = typeof post.videoPlayCount === "number" ? post.videoPlayCount : null;
  const v2 = typeof post.videoViewCount === "number" ? post.videoViewCount : null;
  return v1 ?? v2 ?? 0;
};

const safeInt = (n) => (typeof n === "number" && Number.isFinite(n) ? n : 0);

const analyzeHashtags = (posts) => {
  const hashtagMap = {};
  
  posts.forEach(post => {
    const tags = Array.isArray(post.hashtags) ? post.hashtags : [];
    const views = getViews(post);
    
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
      hashtagMap[normalizedTag].totalLikes += safeInt(post.likesCount);
      if (post.shortCode) {
        hashtagMap[normalizedTag].videos.push(post.shortCode);
      }
    });
  });
  
  return Object.values(hashtagMap)
    .sort((a, b) => b.totalViews - a.totalViews)
    .slice(0, 20); // Top 20 hashtags
};

const calculateTrends = (posts30, posts60, posts90, postsPrev90) => {
  const calculateAvg = (posts, metric) => {
    if (posts.length === 0) return 0;
    const sum = posts.reduce((acc, p) => {
      if (metric === 'viewCount') {
        return acc + getViews(p);
      } else if (metric === 'likeCount') {
        return acc + safeInt(p.likesCount);
      } else if (metric === 'commentCount') {
        return acc + safeInt(p.commentsCount);
      }
      return acc;
    }, 0);
    return Math.round(sum / posts.length);
  };

  const avgViews30 = calculateAvg(posts30, 'viewCount');
  const avgViews60 = calculateAvg(posts60, 'viewCount');
  const avgViews90 = calculateAvg(posts90, 'viewCount');
  const avgViewsPrev90 = calculateAvg(postsPrev90, 'viewCount');

  const avgLikes30 = calculateAvg(posts30, 'likeCount');
  const avgLikes60 = calculateAvg(posts60, 'likeCount');
  const avgLikes90 = calculateAvg(posts90, 'likeCount');
  const avgLikesPrev90 = calculateAvg(postsPrev90, 'likeCount');

  const avgComments30 = calculateAvg(posts30, 'commentCount');
  const avgComments60 = calculateAvg(posts60, 'commentCount');
  const avgComments90 = calculateAvg(posts90, 'commentCount');
  const avgCommentsPrev90 = calculateAvg(postsPrev90, 'commentCount');

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

const getTopVideosAllTime = (posts, limit = 5) => {
  return [...posts]
    .sort((a, b) => getViews(b) - getViews(a))
    .slice(0, limit)
    .map(p => {
      const cap = typeof p.caption === "string" ? p.caption : "";
      const title = cap.replace(/\s+/g, " ").trim().slice(0, 80) || "(No caption)";
      return {
        title,
        link: p.url || `https://www.instagram.com/p/${p.shortCode || ''}/`,
        duration: formatDuration(p.videoDuration),
        totalViews: getViews(p),
        likes: safeInt(p.likesCount),
        comments: safeInt(p.commentsCount),
        timestamp: p.timestamp || null,
        videoDuration: p.videoDuration // Store original for length calculation
      };
    });
};

const getTopVideosLast90Days = (posts, limit = 5) => {
  const posts90Days = analyzePostsByPeriod(posts, 90);
  return getTopVideosAllTime(posts90Days, limit);
};

const getWorstVideosAllTime = (posts, limit = 5) => {
  return [...posts]
    .sort((a, b) => getViews(a) - getViews(b))
    .slice(0, limit)
    .map(p => {
      const cap = typeof p.caption === "string" ? p.caption : "";
      const title = cap.replace(/\s+/g, " ").trim().slice(0, 80) || "(No caption)";
      return {
        title,
        link: p.url || `https://www.instagram.com/p/${p.shortCode || ''}/`,
        duration: formatDuration(p.videoDuration),
        totalViews: getViews(p),
        likes: safeInt(p.likesCount),
        comments: safeInt(p.commentsCount),
        timestamp: p.timestamp || null,
        videoDuration: p.videoDuration // Store original for length calculation
      };
    });
};

const getWorstVideosLast90Days = (posts, limit = 5) => {
  const posts90Days = analyzePostsByPeriod(posts, 90);
  return getWorstVideosAllTime(posts90Days, limit);
};

const calculateAvgDuration = (posts) => {
  if (!posts || posts.length === 0) {
    return { seconds: 0, formatted: 'N/A' };
  }
  const durations = posts
    .map(p => p.videoDuration)
    .filter(d => typeof d === "number" && Number.isFinite(d));
  
  if (durations.length === 0) {
    return { seconds: 0, formatted: 'N/A' };
  }
  
  const totalSeconds = durations.reduce((acc, d) => acc + d, 0);
  const avgSeconds = Math.round(totalSeconds / durations.length);
  return { seconds: avgSeconds, formatted: formatSeconds(avgSeconds) };
};

const calculateEngagementRate = (post) => {
  const views = getViews(post);
  if (views === 0) return 0;
  const likes = safeInt(post.likesCount);
  const comments = safeInt(post.commentsCount);
  return ((likes + comments) / views * 100).toFixed(2);
};

const generateAnalytics = (postsData) => {
  // Handle both array and object with data/posts property
  let posts = [];
  if (Array.isArray(postsData)) {
    posts = postsData;
  } else if (Array.isArray(postsData?.data)) {
    posts = postsData.data;
  } else if (Array.isArray(postsData?.posts)) {
    posts = postsData.posts;
  } else if (postsData?.videos) {
    posts = postsData.videos;
  }
  
  // Filter posts by time periods
  const posts30 = analyzePostsByPeriod(posts, 30);
  const posts60 = analyzePostsByPeriod(posts, 60);
  const posts90 = analyzePostsByPeriod(posts, 90);
  const postsPrev90 = analyzePostsByRange(posts, 90, 180);
  
  // Calculate trends
  const trends = calculateTrends(posts30, posts60, posts90, postsPrev90);
  
  // Analyze hashtags
  const hashtags = analyzeHashtags(posts);
  
  // Get top and worst performers
  const topVideosAllTime = getTopVideosAllTime(posts);
  const topVideosLast90Days = getTopVideosLast90Days(posts);
  const worstVideosAllTime = getWorstVideosAllTime(posts);
  const worstVideosLast90Days = getWorstVideosLast90Days(posts);
  
  // Calculate length vs performance
  const lengthVsPerformance = {
    top5: calculateAvgDuration(topVideosLast90Days.map(p => ({ videoDuration: p.videoDuration }))),
    bottom5: calculateAvgDuration(worstVideosLast90Days.map(p => ({ videoDuration: p.videoDuration })))
  };
  
  // Overall stats
  const totalVideos = posts.length;
  const totalViews = posts.reduce((sum, p) => sum + getViews(p), 0);
  const totalLikes = posts.reduce((sum, p) => sum + safeInt(p.likesCount), 0);
  const totalComments = posts.reduce((sum, p) => sum + safeInt(p.commentsCount), 0);
  const avgEngagementRate = posts.length > 0 
    ? (posts.reduce((sum, p) => sum + parseFloat(calculateEngagementRate(p)), 0) / posts.length).toFixed(2)
    : 0;
  
  return {
    periods: {
      '30days': {
        videoCount: posts30.length,
        videos: posts30
      },
      '60days': {
        videoCount: posts60.length,
        videos: posts60
      },
      '90days': {
        videoCount: posts90.length,
        videos: posts90
      },
      'prev90days': {
        videoCount: postsPrev90.length,
        videos: postsPrev90
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
  analyzePostsByPeriod,
  analyzeHashtags,
  calculateTrends,
  getTopVideosAllTime,
  getTopVideosLast90Days,
  getWorstVideosAllTime,
  getWorstVideosLast90Days
};

