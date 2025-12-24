const youtubeService = require("../services/youtube.service");
const { generatePdfReport } = require("../services/report.service");


const getChannelAnalytics = async (req, res) => {
  try {
    const { channelName } = req.params;

    if (!channelName) {
      return res.status(400).json({ message: "channelName param is required" });
    }

    const channelData = await youtubeService.getChannelAnalytics(channelName);
    //res.send(channelData);

    const pdfBuffer = await generatePdfReport({
      source: "youtube",
      ...channelData,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=youtube-report.pdf"
    );

     res.send(pdfBuffer);
  } catch (error) {
    console.error("Error in getChannelAnalytics:", error.message);
    return res.status(500).json({ message: "Failed to fetch channel analytics", error: error.message });
  }
};

module.exports = {
  getChannelAnalytics,
};