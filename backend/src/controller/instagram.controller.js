// Prisma removed - database not needed
const { syncInstagramAccount, getUserData: getInstagramUserData } = require("../services/instagram.service");
const { generatePdfReport } = require("../services/report.service");

const MOCK_USER_ID = "user123";

const manualSync = async (req, res) => {
  // Database removed - return mock account or use request data
  // For now, return 404 as there's no way to store accounts
  // You can modify this to accept account data from request body if needed
  const account = null;

  if (!account) return res.status(404).send("No IG account connected. Database storage is disabled.");

  const { profile, posts } = await syncInstagramAccount(account);

  const pdfBuffer = await generatePdfReport({
    source: "instagram",
    profile,
    posts,
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=instagram-report.pdf"
  );

  res.send(pdfBuffer);
};

const getUserData = async (req, res) => {
  try {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    const data = await getInstagramUserData(username);

    return res.status(200).json({ data });
  } catch (e) {
    console.error("Failed to fetch Instagram user data", e);
    return res.status(500).json({ error: "Failed to fetch Instagram user data" });
  }
};

module.exports = {
  manualSync,
  getUserData,
};
