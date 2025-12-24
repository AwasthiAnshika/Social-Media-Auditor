const { sendReportReadyEmail } = require("../services/email.service");
const { generateYoutubePdfReport , generateInstagramPdfReport, generateTikTokPdfReport } = require("../services/report.service");
const youtubeService = require("../services/youtube.service");
const instagramService = require("../services/instagram.service");
const tiktokService = require("../services/tiktok.service");
const tiktokTestData = require("../services/testData.service");

const sendEmailWithReport = async (req, res) => {
  try {
    const { platform, username, email } = req.body;
    if (!platform || !username || !email) {
      return res.status(400).json({ 
        success: false,
        message: "Platform, username, and email are required" 
      });
    }
    let channelData = null;
    switch (platform.toLowerCase()) {
      case 'youtube':
        channelData = await youtubeService.getChannelAnalytics(username);
        break;
      case 'instagram':
        channelData = await instagramService.getUserData(username);
        break;
      case 'tiktok':
        channelData = tiktokTestData.payload;
        break;
      default:
        return res.status(400).json({ 
          success: false,
          message: "Invalid platform. Supported: youtube, instagram, tiktok" 
        });
    }
    let pdfBuffer = null;
    try {

      if (platform.toLowerCase() === 'instagram') {
        // Instagram data comes as an array, so we need to structure it properly
        const instagramPayload = Array.isArray(channelData) 
          ? { data: channelData, username: username }
          : { ...channelData, username: username };
        pdfBuffer = await generateInstagramPdfReport(instagramPayload);
      } else if (platform.toLowerCase() === 'youtube') {
        pdfBuffer = await generateYoutubePdfReport({
          source: platform.toLowerCase(),
          username: username,
          ...channelData,
        });
      } else if (platform.toLowerCase() === 'tiktok') {
        pdfBuffer = await generateTikTokPdfReport({
          source: platform.toLowerCase(),
          username: username,
          ...channelData,
        });
      }
      console.log('PDF report generated successfully');
    } catch (pdfError) {
      console.error('Error generating PDF:', pdfError);
    }

    try {

      const adminEmails = ['anshikaawasthi175@gmail.com'];
      
      const emailPromises = adminEmails.map(adminEmail => 
        sendReportReadyEmail(adminEmail, username, platform, pdfBuffer, email)
      );
      
      await Promise.all(emailPromises);
      
      return res.json({
        success: true,
        message: "Email sent successfully with PDF attachment to admin emails",
      });
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      return res.status(500).json({ 
        success: false,
        message: "Failed to send email", 
        error: emailError.message 
      });
    }
  } catch (error) {
    console.error("Error in sendEmailWithReport:", error.message);
    return res.status(500).json({ 
      success: false,
      message: "Failed to send email with report", 
      error: error.message 
    });
  }
};

module.exports = {
  sendEmailWithReport,
};

