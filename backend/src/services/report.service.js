const PDFDocument = require("pdfkit");
const { generateAnalytics } = require("./analytics.service");
const { generateAnalytics: generateInstagramAnalytics } = require("./instagram.analytics.service");
const { generateAnalytics: generateTikTokAnalytics } = require("./tiktok.analytics.service");
const { generateBarChart, generateLineChart, generateHashtagChart } = require("./chart.service");

async function generateYoutubePdfReport(data) {
  const doc = new PDFDocument({ margin: 50 });
  const chunks = [];

  return await new Promise(async (resolve, reject) => {
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    try {
      // Generate analytics
      const analytics = generateAnalytics(data);
      const { channel, videos } = data;
      const { trends, hashtags, topPerformers, lowPerformers, overall, periods, topVideosAllTime, topVideosLast90Days, worstVideosAllTime, worstVideosLast90Days, lengthVsPerformance } = analytics;

      // Title + Channel Overview (clubbed with Executive Summary)
      doc.fontSize(24).font('Helvetica-Bold').text('Fleeting Films', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(18).font('Helvetica').text('Analytics Report', { align: 'center' });
      doc.moveDown(1.5);
      doc.fontSize(12).font('Helvetica');
      doc.text(`Channel: ${channel.channelTitle || 'N/A'}`, { align: 'center' });
      doc.text(`Username: @${data.username || 'N/A'}`, { align: 'center' });
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' });
      doc.moveDown(1.5);

      // Executive Summary (on same page as header)
      doc.fontSize(18).font('Helvetica-Bold').text('Executive Summary', { underline: true });
      doc.moveDown();
      doc.fontSize(11).font('Helvetica');
      doc.text(`Total Videos Analyzed: ${overall.totalVideos}`);
      doc.text(`Total Views: ${overall.totalViews.toLocaleString()}`);
      doc.text(`Total Likes: ${overall.totalLikes.toLocaleString()}`);
      doc.text(`Total Comments: ${overall.totalComments.toLocaleString()}`);
      doc.text(`Average Engagement Rate: ${overall.avgEngagementRate}%`);
      doc.moveDown();
      doc.text(`Videos in last 30 days: ${periods['30days'].videoCount}`);
      doc.text(`Videos in last 60 days: ${periods['60days'].videoCount}`);
      doc.text(`Videos in last 90 days: ${periods['90days'].videoCount}`);
      if (periods['prev90days']) {
        doc.text(`Videos in previous 90 days (90–180 days ago): ${periods['prev90days'].videoCount}`);
      }
      doc.moveDown(1.5);

      // Start detailed sections on a new page
      doc.addPage();

      // Trends Over Time
      doc.fontSize(18).font('Helvetica-Bold').text('Performance Trends (30/60/90 Days)', { underline: true });
      doc.moveDown();
      
      // Views trend chart
      const viewsData = [trends.views['30days'], trends.views['60days'], trends.views['90days']];
      const viewsLabels = ['30 Days', '60 Days', '90 Days'];
      const viewsChart = generateLineChart(viewsData, viewsLabels, 'Average Views Over Time', 500, 300);
      doc.image(viewsChart, { fit: [500, 300], align: 'center' });
      doc.moveDown();
      doc.fontSize(11).text(`Trend: ${trends.views.trend.toUpperCase()}`);
      doc.text(`30 Days Avg: ${trends.views['30days'].toLocaleString()} views`);
      doc.text(`60 Days Avg: ${trends.views['60days'].toLocaleString()} views`);
      doc.text(`90 Days Avg: ${trends.views['90days'].toLocaleString()} views`);
      if (trends.views['prev90days'] !== undefined) {
        doc.text(`Prev 90 Days Avg: ${trends.views['prev90days'].toLocaleString()} views`);
      }
      doc.addPage();

      // Likes trend chart
      const likesData = [trends.likes['30days'], trends.likes['60days'], trends.likes['90days']];
      const likesChart = generateLineChart(likesData, viewsLabels, 'Average Likes Over Time', 500, 300);
      doc.image(likesChart, { fit: [500, 300], align: 'center' });
      doc.moveDown();
      doc.fontSize(11).text(`Trend: ${trends.likes.trend.toUpperCase()}`);
      doc.text(`30 Days Avg: ${trends.likes['30days'].toLocaleString()} likes`);
      doc.text(`60 Days Avg: ${trends.likes['60days'].toLocaleString()} likes`);
      doc.text(`90 Days Avg: ${trends.likes['90days'].toLocaleString()} likes`);
      if (trends.likes['prev90days'] !== undefined) {
        doc.text(`Prev 90 Days Avg: ${trends.likes['prev90days'].toLocaleString()} likes`);
      }
      doc.addPage();

      // Top Hashtags
      if (hashtags.length > 0) {
        doc.fontSize(18).font('Helvetica-Bold').text('Top Hashtags by Views', { underline: true });
        doc.moveDown();
        const hashtagChart = generateHashtagChart(hashtags, 'Top 10 Hashtags by Total Views', 500, 300);
        doc.image(hashtagChart, { fit: [500, 300], align: 'center' });
        doc.moveDown();
        doc.fontSize(11).font('Helvetica');
        hashtags.slice(0, 10).forEach((hashtag, index) => {
          doc.text(`${index + 1}. ${hashtag.tag}: ${hashtag.totalViews.toLocaleString()} views (${hashtag.count} videos)`);
        });
        doc.addPage();
      }

      // Top Videos in Last 90 Days
      if (topVideosLast90Days && topVideosLast90Days.length > 0) {
        doc.fontSize(18).font('Helvetica-Bold').text('Top 5 Videos in Last 90 Days', { underline: true });
        doc.moveDown();
        doc.fontSize(11).font('Helvetica');
        topVideosLast90Days.forEach((video, index) => {
          doc.font('Helvetica-Bold').text(`${index + 1}. ${video.title.substring(0, 60)}${video.title.length > 60 ? '...' : ''}`);
          doc.font('Helvetica');
          doc.text(`   Link: ${video.link}`);
          doc.text(`   Duration: ${video.duration} | Total Views: ${video.totalViews.toLocaleString()}`);
          doc.moveDown(0.5);
        });
        doc.addPage();
      }

      // Top Videos All Time
      if (topVideosAllTime && topVideosAllTime.length > 0) {
        doc.fontSize(18).font('Helvetica-Bold').text('Top 5 Videos of All Time', { underline: true });
        doc.moveDown();
        doc.fontSize(11).font('Helvetica');
        topVideosAllTime.forEach((video, index) => {
          doc.font('Helvetica-Bold').text(`${index + 1}. ${video.title.substring(0, 60)}${video.title.length > 60 ? '...' : ''}`);
          doc.font('Helvetica');
          doc.text(`   Link: ${video.link}`);
          doc.text(`   Duration: ${video.duration} | Total Views: ${video.totalViews.toLocaleString()}`);
          doc.moveDown(0.5);
        });
        doc.addPage();
      }

      // Worst Videos - All Time (Bottom 5)
      if (worstVideosAllTime && worstVideosAllTime.length > 0) {
        doc.fontSize(18).font('Helvetica-Bold').text('Worst Videos – All Time (Bottom 5)', { underline: true });
        doc.moveDown();
        doc.fontSize(11).font('Helvetica');
        worstVideosAllTime.forEach((video, index) => {
          doc.font('Helvetica-Bold').text(`${index + 1}. ${video.title.substring(0, 60)}${video.title.length > 60 ? '...' : ''}`);
          doc.font('Helvetica');
          doc.text(`   Link: ${video.link}`);
          doc.text(`   Duration: ${video.duration} | Total Views: ${video.totalViews.toLocaleString()}`);
          doc.moveDown(0.5);
        });
        doc.addPage();
      }

      // Worst Videos - Last 90 Days (Bottom 5)
      if (worstVideosLast90Days && worstVideosLast90Days.length > 0) {
        doc.fontSize(18).font('Helvetica-Bold').text('Worst Videos – Last 90 Days (Bottom 5)', { underline: true });
        doc.moveDown();
        doc.fontSize(11).font('Helvetica');
        worstVideosLast90Days.forEach((video, index) => {
          doc.font('Helvetica-Bold').text(`${index + 1}. ${video.title.substring(0, 60)}${video.title.length > 60 ? '...' : ''}`);
          doc.font('Helvetica');
          doc.text(`   Link: ${video.link}`);
          doc.text(`   Duration: ${video.duration} | Total Views: ${video.totalViews.toLocaleString()}`);
          doc.moveDown(0.5);
        });
        doc.addPage();
      }

      // Length vs Performance (Last 90 Days)
      if (lengthVsPerformance) {
        doc.fontSize(18).font('Helvetica-Bold').text('Length vs Performance (Last 90 Days)', { underline: true });
        doc.moveDown();
        doc.fontSize(11).font('Helvetica');
        doc.text(`Avg length of Top 5: ${lengthVsPerformance.top5.formatted || 'N/A'}`);
        doc.text(`Avg length of Bottom 5: ${lengthVsPerformance.bottom5.formatted || 'N/A'}`);
        doc.addPage();
      }

      // Recommendations
      doc.fontSize(18).font('Helvetica-Bold').text('Key Insights & Recommendations', { underline: true });
      doc.moveDown();
      doc.fontSize(11).font('Helvetica');
      
      if (trends.views.trend === 'up') {
        doc.text('✓ Your views are trending upward! Keep creating similar content.');
      } else if (trends.views.trend === 'down') {
        doc.text('⚠ Views are declining. Consider analyzing top performers for content patterns.');
      }
      
      if (trends.likes.trend === 'up') {
        doc.text('✓ Engagement is improving! Your audience is responding well.');
      } else if (trends.likes.trend === 'down') {
        doc.text('⚠ Engagement is decreasing. Try experimenting with different content formats.');
      }
      
      doc.moveDown();
      if (hashtags.length > 0) {
        doc.text('Top performing hashtags to continue using:');
        hashtags.slice(0, 5).forEach((h, i) => {
          doc.text(`  • ${h.tag} (${h.totalViews.toLocaleString()} views)`);
        });
      }
      
      doc.moveDown();
      doc.text('Focus Areas:');
      doc.text('  • Analyze top performers for common themes and formats');
      doc.text('  • Review low performers to identify improvement opportunities');
      doc.text('  • Maintain consistent posting schedule');
      doc.text('  • Engage with comments to boost engagement rates');

      doc.end();
    } catch (error) {
      console.error('Error generating PDF:', error);
      doc.fontSize(12).text('Error generating report: ' + error.message);
      doc.end();
    }
  });
}
// Helper function to extract profile info from Instagram payload
function extractInstagramProfile(payload) {
  // Handle both cases: payload is an array or an object
  let posts = [];
  if (Array.isArray(payload)) {
    posts = payload;
  } else if (Array.isArray(payload?.data)) {
    posts = payload.data;
  } else if (Array.isArray(payload?.posts)) {
    posts = payload.posts;
  }
  
  const sample = posts[0] || null;
  const payloadObj = Array.isArray(payload) ? {} : (payload || {});
  const username = payloadObj.username || sample?.ownerUsername || "N/A";
  const ownerFullName = sample?.ownerFullName || "N/A";
  const profileUrl = payloadObj.inputUrl || payloadObj.profileUrl || (sample?.inputUrl ?? null);
  
  return { username, ownerFullName, profileUrl };
}
function addSafeText(doc, text, opts = {}) {
  doc.text(String(text ?? ""), opts);
}
async function generateInstagramPdfReport(payload) {
  const doc = new PDFDocument({ margin: 50 });
  const chunks = [];

  return await new Promise((resolve, reject) => {
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    try {
      // Generate analytics using the Instagram analytics service
      const analytics = generateInstagramAnalytics(payload);
      const profile = extractInstagramProfile(payload);

      const {
        overall,
        periods,
        trends,
        hashtags,
        topVideosAllTime,
        topVideosLast90Days,
        worstVideosAllTime,
        worstVideosLast90Days,
        lengthVsPerformance
      } = analytics;
      doc.fontSize(24).font("Helvetica-Bold").text("Fleeting Films", { align: "center" });
      doc.moveDown(0.5);
      doc.fontSize(18).font("Helvetica").text("Instagram Analytics Report", { align: "center" });
      doc.moveDown(1.5);

      doc.fontSize(12).font("Helvetica");
      doc.text(`Platform: Instagram`, { align: "center" });
      doc.text(`Username: @${profile.username || "N/A"}`, { align: "center" });
      doc.text(`Name: ${profile.ownerFullName || "N/A"}`, { align: "center" });
      if (profile.profileUrl) doc.text(`Profile: ${profile.profileUrl}`, { align: "center" });
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, { align: "center" });
      doc.moveDown(1.5);

      doc.fontSize(18).font("Helvetica-Bold").text("Executive Summary", { underline: true });
      doc.moveDown();
      doc.fontSize(11).font("Helvetica");

      doc.text(`Total Posts Analyzed: ${overall.totalVideos}`);
      doc.text(`Total Plays/Views: ${overall.totalViews.toLocaleString()}`);
      doc.text(`Total Likes: ${overall.totalLikes.toLocaleString()}`);
      doc.text(`Total Comments: ${overall.totalComments.toLocaleString()}`);
      doc.text(`Average Engagement Rate: ${overall.avgEngagementRate}%`);
      doc.moveDown();
      doc.text(`Posts in last 30 days: ${periods["30days"].videoCount}`);
      doc.text(`Posts in last 60 days: ${periods["60days"].videoCount}`);
      doc.text(`Posts in last 90 days: ${periods["90days"].videoCount}`);
      if (periods.prev90days) doc.text(`Posts in previous 90 days (90–180 days ago): ${periods.prev90days.videoCount}`);

      // ===== Detailed Sections =====
      doc.addPage();

      // Performance Trends
      doc.fontSize(18).font("Helvetica-Bold").text("Performance Trends (30/60/90 Days)", { underline: true });
      doc.moveDown();

      const labels = ["30 Days", "60 Days", "90 Days"];

      // Views chart
      if (typeof generateLineChart === "function") {
        const viewsData = [trends.views["30days"], trends.views["60days"], trends.views["90days"]];
        const viewsChart = generateLineChart(viewsData, labels, "Average Plays/Views Over Time", 500, 300);
        doc.image(viewsChart, { fit: [500, 300], align: "center" });
        doc.moveDown();
      }

      doc.fontSize(11).font("Helvetica");
      doc.text(`Views Trend: ${String(trends.views.trend).toUpperCase()}`);
      doc.text(`30 Days Avg: ${trends.views["30days"].toLocaleString()}`);
      doc.text(`60 Days Avg: ${trends.views["60days"].toLocaleString()}`);
      doc.text(`90 Days Avg: ${trends.views["90days"].toLocaleString()}`);
      if (trends.views.prev90days !== undefined) doc.text(`Prev 90 Days Avg: ${trends.views.prev90days.toLocaleString()}`);
      doc.addPage();

      // Likes chart
      if (typeof generateLineChart === "function") {
        const likesData = [trends.likes["30days"], trends.likes["60days"], trends.likes["90days"]];
        const likesChart = generateLineChart(likesData, labels, "Average Likes Over Time", 500, 300);
        doc.image(likesChart, { fit: [500, 300], align: "center" });
        doc.moveDown();
      }

      doc.fontSize(11).font("Helvetica");
      doc.text(`Likes Trend: ${String(trends.likes.trend).toUpperCase()}`);
      doc.text(`30 Days Avg: ${trends.likes["30days"].toLocaleString()}`);
      doc.text(`60 Days Avg: ${trends.likes["60days"].toLocaleString()}`);
      doc.text(`90 Days Avg: ${trends.likes["90days"].toLocaleString()}`);
      if (trends.likes.prev90days !== undefined) doc.text(`Prev 90 Days Avg: ${trends.likes.prev90days.toLocaleString()}`);
      doc.addPage();

      // Top Hashtags
      if (hashtags.length > 0) {
        doc.fontSize(18).font("Helvetica-Bold").text("Top Hashtags by Views", { underline: true });
        doc.moveDown();

        if (typeof generateHashtagChart === "function") {
          const hashtagChart = generateHashtagChart(hashtags.slice(0, 10), "Top 10 Hashtags by Total Views", 500, 300);
          doc.image(hashtagChart, { fit: [500, 300], align: "center" });
          doc.moveDown();
        }

        doc.fontSize(11).font("Helvetica");
        hashtags.slice(0, 10).forEach((h, i) => {
          doc.text(`${i + 1}. #${h.tag}: ${h.totalViews.toLocaleString()} views (${h.count} posts)`);
        });

        doc.addPage();
      }

      // Top 5 in last 90 days
      if (topVideosLast90Days?.length) {
        doc.fontSize(18).font("Helvetica-Bold").text("Top 5 Posts in Last 90 Days", { underline: true });
        doc.moveDown();

        doc.fontSize(11).font("Helvetica");
        topVideosLast90Days.forEach((p, i) => {
          doc.font("Helvetica-Bold").text(`${i + 1}. ${p.title || '(No title)'}`);
          doc.font("Helvetica");
          addSafeText(doc, `   Link: ${p.link || 'N/A'}`);
          const views = p.totalViews != null ? p.totalViews.toLocaleString() : '0';
          const likes = p.likes != null ? p.likes.toLocaleString() : '0';
          const comments = p.comments != null ? p.comments.toLocaleString() : '0';
          addSafeText(doc, `   Views: ${views} | Likes: ${likes} | Comments: ${comments}`);
          if (p.videoDuration != null && typeof p.videoDuration === 'number') {
            addSafeText(doc, `   Duration: ${Math.round(p.videoDuration)}s`);
          } else if (p.duration != null && p.duration !== 'N/A') {
            addSafeText(doc, `   Duration: ${p.duration}`);
          }
          if (p.timestamp) {
            try {
              addSafeText(doc, `   Posted: ${new Date(p.timestamp).toLocaleDateString()}`);
            } catch (e) {
              // Skip if timestamp is invalid
            }
          }
          doc.moveDown(0.5);
        });

        doc.addPage();
      }

      // Top 5 all time
      if (topVideosAllTime?.length) {
        doc.fontSize(18).font("Helvetica-Bold").text("Top 5 Posts of All Time", { underline: true });
        doc.moveDown();

        doc.fontSize(11).font("Helvetica");
        topVideosAllTime.forEach((p, i) => {
          doc.font("Helvetica-Bold").text(`${i + 1}. ${p.title || '(No title)'}`);
          doc.font("Helvetica");
          addSafeText(doc, `   Link: ${p.link || 'N/A'}`);
          const views = p.totalViews != null ? p.totalViews.toLocaleString() : '0';
          const likes = p.likes != null ? p.likes.toLocaleString() : '0';
          const comments = p.comments != null ? p.comments.toLocaleString() : '0';
          addSafeText(doc, `   Views: ${views} | Likes: ${likes} | Comments: ${comments}`);
          if (p.videoDuration != null && typeof p.videoDuration === 'number') {
            addSafeText(doc, `   Duration: ${Math.round(p.videoDuration)}s`);
          } else if (p.duration != null && p.duration !== 'N/A') {
            addSafeText(doc, `   Duration: ${p.duration}`);
          }
          if (p.timestamp) {
            try {
              addSafeText(doc, `   Posted: ${new Date(p.timestamp).toLocaleDateString()}`);
            } catch (e) {
              // Skip if timestamp is invalid
            }
          }
          doc.moveDown(0.5);
        });

        doc.addPage();
      }

      // Worst 5 all time
      if (worstVideosAllTime?.length) {
        doc.fontSize(18).font("Helvetica-Bold").text("Worst Posts – All Time (Bottom 5)", { underline: true });
        doc.moveDown();

        doc.fontSize(11).font("Helvetica");
        worstVideosAllTime.forEach((p, i) => {
          doc.font("Helvetica-Bold").text(`${i + 1}. ${p.title || '(No title)'}`);
          doc.font("Helvetica");
          addSafeText(doc, `   Link: ${p.link || 'N/A'}`);
          const views = p.totalViews != null ? p.totalViews.toLocaleString() : '0';
          const likes = p.likes != null ? p.likes.toLocaleString() : '0';
          const comments = p.comments != null ? p.comments.toLocaleString() : '0';
          addSafeText(doc, `   Views: ${views} | Likes: ${likes} | Comments: ${comments}`);
          if (p.videoDuration != null && typeof p.videoDuration === 'number') {
            addSafeText(doc, `   Duration: ${Math.round(p.videoDuration)}s`);
          } else if (p.duration != null && p.duration !== 'N/A') {
            addSafeText(doc, `   Duration: ${p.duration}`);
          }
          if (p.timestamp) {
            try {
              addSafeText(doc, `   Posted: ${new Date(p.timestamp).toLocaleDateString()}`);
            } catch (e) {
              // Skip if timestamp is invalid
            }
          }
          doc.moveDown(0.5);
        });

        doc.addPage();
      }

      // Worst 5 last 90 days
      if (worstVideosLast90Days?.length) {
        doc.fontSize(18).font("Helvetica-Bold").text("Worst Posts – Last 90 Days (Bottom 5)", { underline: true });
        doc.moveDown();

        doc.fontSize(11).font("Helvetica");
        worstVideosLast90Days.forEach((p, i) => {
          doc.font("Helvetica-Bold").text(`${i + 1}. ${p.title || '(No title)'}`);
          doc.font("Helvetica");
          addSafeText(doc, `   Link: ${p.link || 'N/A'}`);
          const views = p.totalViews != null ? p.totalViews.toLocaleString() : '0';
          const likes = p.likes != null ? p.likes.toLocaleString() : '0';
          const comments = p.comments != null ? p.comments.toLocaleString() : '0';
          addSafeText(doc, `   Views: ${views} | Likes: ${likes} | Comments: ${comments}`);
          if (p.videoDuration != null && typeof p.videoDuration === 'number') {
            addSafeText(doc, `   Duration: ${Math.round(p.videoDuration)}s`);
          } else if (p.duration != null && p.duration !== 'N/A') {
            addSafeText(doc, `   Duration: ${p.duration}`);
          }
          if (p.timestamp) {
            try {
              addSafeText(doc, `   Posted: ${new Date(p.timestamp).toLocaleDateString()}`);
            } catch (e) {
              // Skip if timestamp is invalid
            }
          }
          doc.moveDown(0.5);
        });

        doc.addPage();
      }

      // Length vs performance
      if (lengthVsPerformance) {
        doc.fontSize(18).font("Helvetica-Bold").text("Length vs Performance (Last 90 Days)", { underline: true });
        doc.moveDown();

        doc.fontSize(11).font("Helvetica");
        doc.text(`Avg length of Top 5: ${lengthVsPerformance.top5.formatted || "N/A"}`);
        doc.text(`Avg length of Bottom 5: ${lengthVsPerformance.bottom5.formatted || "N/A"}`);
        doc.addPage();
      }

      // Recommendations
      doc.fontSize(18).font("Helvetica-Bold").text("Key Insights & Recommendations", { underline: true });
      doc.moveDown();
      doc.fontSize(11).font("Helvetica");

      if (trends.views.trend === "up") {
        doc.text("✓ Your views are trending upward. Double down on the formats/themes used in your best posts.");
      } else if (trends.views.trend === "down") {
        doc.text("⚠ Views are declining. Re-check hooks, first 1–2 seconds, and reuse patterns from top performers.");
      } else {
        doc.text("• Views are stable. Experiment with 1 variable at a time (hook, length, format) to break the plateau.");
      }

      if (trends.likes.trend === "up") {
        doc.text("✓ Likes are improving. Your audience is responding well—keep consistency.");
      } else if (trends.likes.trend === "down") {
        doc.text("⚠ Likes are decreasing. Try stronger CTAs, clearer story arc, and better on-screen text structure.");
      }

      doc.moveDown();
      if (hashtags.length > 0) {
        doc.text("Top performing hashtags to keep using:");
        hashtags.slice(0, 5).forEach((h) => doc.text(`  • #${h.tag} (${h.totalViews.toLocaleString()} views)`));
      }

      doc.moveDown();
      doc.text("Focus Areas:");
      doc.text("  • Recreate your top posts’ structure (hook → payoff → CTA)");
      doc.text("  • Reply to comments early to boost distribution")
      doc.text("  • Keep posting frequency consistent (30/60/90-day cadence)")
      doc.text("  • Track what changes between top and bottom posts (hook, duration, topic)")

      doc.end();
    } catch (error) {
      doc.fontSize(12).text("Error generating Instagram report: " + (error?.message || String(error)));
      doc.end();
    }
  });
}

async function generateTikTokPdfReport(payload) {
  const doc = new PDFDocument({ margin: 50 });
  const chunks = [];

  return await new Promise((resolve, reject) => {
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    try {
      // Generate analytics using the TikTok analytics service
      const analytics = generateTikTokAnalytics(payload);
      const profile = payload?.profile || {};

      const {
        overall,
        periods,
        trends,
        hashtags,
        topVideosAllTime,
        topVideosLast90Days,
        worstVideosAllTime,
        worstVideosLast90Days,
        lengthVsPerformance
      } = analytics;

      doc.fontSize(24).font("Helvetica-Bold").text("Fleeting Films", { align: "center" });
      doc.moveDown(0.5);
      doc.fontSize(18).font("Helvetica").text("TikTok Analytics Report", { align: "center" });
      doc.moveDown(1.5);

      doc.fontSize(12).font("Helvetica");
      doc.text(`Platform: TikTok`, { align: "center" });
      doc.text(`Username: @${profile.username || "N/A"}`, { align: "center" });
      doc.text(`Name: ${profile.name || "N/A"}`, { align: "center" });
      if (profile.url) doc.text(`Profile: ${profile.url}`, { align: "center" });
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, { align: "center" });
      doc.moveDown(1.5);

      doc.fontSize(18).font("Helvetica-Bold").text("Executive Summary", { underline: true });
      doc.moveDown();
      doc.fontSize(11).font("Helvetica");

      doc.text(`Total Videos Analyzed: ${overall.totalVideos}`);
      doc.text(`Total Views: ${overall.totalViews.toLocaleString()}`);
      doc.text(`Total Likes: ${overall.totalLikes.toLocaleString()}`);
      doc.text(`Total Comments: ${overall.totalComments.toLocaleString()}`);
      doc.text(`Average Engagement Rate: ${overall.avgEngagementRate}%`);
      doc.moveDown();
      doc.text(`Videos in last 30 days: ${periods["30days"].videoCount}`);
      doc.text(`Videos in last 60 days: ${periods["60days"].videoCount}`);
      doc.text(`Videos in last 90 days: ${periods["90days"].videoCount}`);
      if (periods.prev90days) doc.text(`Videos in previous 90 days (90–180 days ago): ${periods.prev90days.videoCount}`);

      // ===== Detailed Sections =====
      doc.addPage();

      // Performance Trends
      doc.fontSize(18).font("Helvetica-Bold").text("Performance Trends (30/60/90 Days)", { underline: true });
      doc.moveDown();

      const labels = ["30 Days", "60 Days", "90 Days"];

      // Views chart
      if (typeof generateLineChart === "function") {
        const viewsData = [trends.views["30days"], trends.views["60days"], trends.views["90days"]];
        const viewsChart = generateLineChart(viewsData, labels, "Average Views Over Time", 500, 300);
        doc.image(viewsChart, { fit: [500, 300], align: "center" });
        doc.moveDown();
      }

      doc.fontSize(11).font("Helvetica");
      doc.text(`Views Trend: ${String(trends.views.trend).toUpperCase()}`);
      doc.text(`30 Days Avg: ${trends.views["30days"].toLocaleString()}`);
      doc.text(`60 Days Avg: ${trends.views["60days"].toLocaleString()}`);
      doc.text(`90 Days Avg: ${trends.views["90days"].toLocaleString()}`);
      if (trends.views.prev90days !== undefined) doc.text(`Prev 90 Days Avg: ${trends.views.prev90days.toLocaleString()}`);
      doc.addPage();

      // Likes chart
      if (typeof generateLineChart === "function") {
        const likesData = [trends.likes["30days"], trends.likes["60days"], trends.likes["90days"]];
        const likesChart = generateLineChart(likesData, labels, "Average Likes Over Time", 500, 300);
        doc.image(likesChart, { fit: [500, 300], align: "center" });
        doc.moveDown();
      }

      doc.fontSize(11).font("Helvetica");
      doc.text(`Likes Trend: ${String(trends.likes.trend).toUpperCase()}`);
      doc.text(`30 Days Avg: ${trends.likes["30days"].toLocaleString()}`);
      doc.text(`60 Days Avg: ${trends.likes["60days"].toLocaleString()}`);
      doc.text(`90 Days Avg: ${trends.likes["90days"].toLocaleString()}`);
      if (trends.likes.prev90days !== undefined) doc.text(`Prev 90 Days Avg: ${trends.likes.prev90days.toLocaleString()}`);
      doc.addPage();

      // Top Hashtags
      if (hashtags.length > 0) {
        doc.fontSize(18).font("Helvetica-Bold").text("Top Hashtags by Views", { underline: true });
        doc.moveDown();

        if (typeof generateHashtagChart === "function") {
          const hashtagChart = generateHashtagChart(hashtags.slice(0, 10), "Top 10 Hashtags by Total Views", 500, 300);
          doc.image(hashtagChart, { fit: [500, 300], align: "center" });
          doc.moveDown();
        }

        doc.fontSize(11).font("Helvetica");
        hashtags.slice(0, 10).forEach((h, i) => {
          doc.text(`${i + 1}. #${h.tag}: ${h.totalViews.toLocaleString()} views (${h.count} videos)`);
        });

        doc.addPage();
      }

      // Top 5 in last 90 days
      if (topVideosLast90Days?.length) {
        doc.fontSize(18).font("Helvetica-Bold").text("Top 5 Videos in Last 90 Days", { underline: true });
        doc.moveDown();

        doc.fontSize(11).font("Helvetica");
        topVideosLast90Days.forEach((v, i) => {
          doc.font("Helvetica-Bold").text(`${i + 1}. ${v.title || '(No title)'}`);
          doc.font("Helvetica");
          addSafeText(doc, `   Link: ${v.link || 'N/A'}`);
          const views = v.totalViews != null ? v.totalViews.toLocaleString() : '0';
          const likes = v.likes != null ? v.likes.toLocaleString() : '0';
          const comments = v.comments != null ? v.comments.toLocaleString() : '0';
          const shares = v.shares != null ? v.shares.toLocaleString() : '0';
          addSafeText(doc, `   Views: ${views} | Likes: ${likes} | Comments: ${comments} | Shares: ${shares}`);
          if (v.videoDuration != null && typeof v.videoDuration === 'number') {
            addSafeText(doc, `   Duration: ${Math.round(v.videoDuration)}s`);
          } else if (v.duration != null && v.duration !== 'N/A') {
            addSafeText(doc, `   Duration: ${v.duration}`);
          }
          if (v.timestamp) {
            try {
              addSafeText(doc, `   Posted: ${new Date(v.timestamp).toLocaleDateString()}`);
            } catch (e) {
              // Skip if timestamp is invalid
            }
          }
          doc.moveDown(0.5);
        });

        doc.addPage();
      }

      // Top 5 all time
      if (topVideosAllTime?.length) {
        doc.fontSize(18).font("Helvetica-Bold").text("Top 5 Videos of All Time", { underline: true });
        doc.moveDown();

        doc.fontSize(11).font("Helvetica");
        topVideosAllTime.forEach((v, i) => {
          doc.font("Helvetica-Bold").text(`${i + 1}. ${v.title || '(No title)'}`);
          doc.font("Helvetica");
          addSafeText(doc, `   Link: ${v.link || 'N/A'}`);
          const views = v.totalViews != null ? v.totalViews.toLocaleString() : '0';
          const likes = v.likes != null ? v.likes.toLocaleString() : '0';
          const comments = v.comments != null ? v.comments.toLocaleString() : '0';
          const shares = v.shares != null ? v.shares.toLocaleString() : '0';
          addSafeText(doc, `   Views: ${views} | Likes: ${likes} | Comments: ${comments} | Shares: ${shares}`);
          if (v.videoDuration != null && typeof v.videoDuration === 'number') {
            addSafeText(doc, `   Duration: ${Math.round(v.videoDuration)}s`);
          } else if (v.duration != null && v.duration !== 'N/A') {
            addSafeText(doc, `   Duration: ${v.duration}`);
          }
          if (v.timestamp) {
            try {
              addSafeText(doc, `   Posted: ${new Date(v.timestamp).toLocaleDateString()}`);
            } catch (e) {
              // Skip if timestamp is invalid
            }
          }
          doc.moveDown(0.5);
        });

        doc.addPage();
      }

      // Worst 5 all time
      if (worstVideosAllTime?.length) {
        doc.fontSize(18).font("Helvetica-Bold").text("Worst Videos – All Time (Bottom 5)", { underline: true });
        doc.moveDown();

        doc.fontSize(11).font("Helvetica");
        worstVideosAllTime.forEach((v, i) => {
          doc.font("Helvetica-Bold").text(`${i + 1}. ${v.title || '(No title)'}`);
          doc.font("Helvetica");
          addSafeText(doc, `   Link: ${v.link || 'N/A'}`);
          const views = v.totalViews != null ? v.totalViews.toLocaleString() : '0';
          const likes = v.likes != null ? v.likes.toLocaleString() : '0';
          const comments = v.comments != null ? v.comments.toLocaleString() : '0';
          const shares = v.shares != null ? v.shares.toLocaleString() : '0';
          addSafeText(doc, `   Views: ${views} | Likes: ${likes} | Comments: ${comments} | Shares: ${shares}`);
          if (v.videoDuration != null && typeof v.videoDuration === 'number') {
            addSafeText(doc, `   Duration: ${Math.round(v.videoDuration)}s`);
          } else if (v.duration != null && v.duration !== 'N/A') {
            addSafeText(doc, `   Duration: ${v.duration}`);
          }
          if (v.timestamp) {
            try {
              addSafeText(doc, `   Posted: ${new Date(v.timestamp).toLocaleDateString()}`);
            } catch (e) {
              // Skip if timestamp is invalid
            }
          }
          doc.moveDown(0.5);
        });

        doc.addPage();
      }

      // Worst 5 last 90 days
      if (worstVideosLast90Days?.length) {
        doc.fontSize(18).font("Helvetica-Bold").text("Worst Videos – Last 90 Days (Bottom 5)", { underline: true });
        doc.moveDown();

        doc.fontSize(11).font("Helvetica");
        worstVideosLast90Days.forEach((v, i) => {
          doc.font("Helvetica-Bold").text(`${i + 1}. ${v.title || '(No title)'}`);
          doc.font("Helvetica");
          addSafeText(doc, `   Link: ${v.link || 'N/A'}`);
          const views = v.totalViews != null ? v.totalViews.toLocaleString() : '0';
          const likes = v.likes != null ? v.likes.toLocaleString() : '0';
          const comments = v.comments != null ? v.comments.toLocaleString() : '0';
          const shares = v.shares != null ? v.shares.toLocaleString() : '0';
          addSafeText(doc, `   Views: ${views} | Likes: ${likes} | Comments: ${comments} | Shares: ${shares}`);
          if (v.videoDuration != null && typeof v.videoDuration === 'number') {
            addSafeText(doc, `   Duration: ${Math.round(v.videoDuration)}s`);
          } else if (v.duration != null && v.duration !== 'N/A') {
            addSafeText(doc, `   Duration: ${v.duration}`);
          }
          if (v.timestamp) {
            try {
              addSafeText(doc, `   Posted: ${new Date(v.timestamp).toLocaleDateString()}`);
            } catch (e) {
              // Skip if timestamp is invalid
            }
          }
          doc.moveDown(0.5);
        });

        doc.addPage();
      }

      // Length vs performance
      if (lengthVsPerformance) {
        doc.fontSize(18).font("Helvetica-Bold").text("Length vs Performance (Last 90 Days)", { underline: true });
        doc.moveDown();

        doc.fontSize(11).font("Helvetica");
        doc.text(`Avg length of Top 5: ${lengthVsPerformance.top5.formatted || "N/A"}`);
        doc.text(`Avg length of Bottom 5: ${lengthVsPerformance.bottom5.formatted || "N/A"}`);
        doc.addPage();
      }

      // Recommendations
      doc.fontSize(18).font("Helvetica-Bold").text("Key Insights & Recommendations", { underline: true });
      doc.moveDown();
      doc.fontSize(11).font("Helvetica");

      if (trends.views.trend === "up") {
        doc.text("✓ Your views are trending upward. Double down on the formats/themes used in your best videos.");
      } else if (trends.views.trend === "down") {
        doc.text("⚠ Views are declining. Re-check hooks, first 1–2 seconds, and reuse patterns from top performers.");
      } else {
        doc.text("• Views are stable. Experiment with 1 variable at a time (hook, length, format) to break the plateau.");
      }

      if (trends.likes.trend === "up") {
        doc.text("✓ Likes are improving. Your audience is responding well—keep consistency.");
      } else if (trends.likes.trend === "down") {
        doc.text("⚠ Likes are decreasing. Try stronger CTAs, clearer story arc, and better on-screen text structure.");
      }

      doc.moveDown();
      if (hashtags.length > 0) {
        doc.text("Top performing hashtags to keep using:");
        hashtags.slice(0, 5).forEach((h) => doc.text(`  • #${h.tag} (${h.totalViews.toLocaleString()} views)`));
      }

      doc.moveDown();
      doc.text("Focus Areas:");
      doc.text("  • Recreate your top videos' structure (hook → payoff → CTA)");
      doc.text("  • Reply to comments early to boost distribution");
      doc.text("  • Keep posting frequency consistent (30/60/90-day cadence)");
      doc.text("  • Track what changes between top and bottom videos (hook, duration, topic)");

      doc.end();
    } catch (error) {
      doc.fontSize(12).text("Error generating TikTok report: " + (error?.message || String(error)));
      doc.end();
    }
  });
}


module.exports = {
  generateYoutubePdfReport,
  generateInstagramPdfReport,
  generateTikTokPdfReport,
};
