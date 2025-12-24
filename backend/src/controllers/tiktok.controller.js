const { getTikTokData } = require("../services/tiktok.service");

const getData = async (req, res) => {
  try {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    const data = await getTikTokData(username);

    return res.status(200).json({ data });
  } catch (e) {
    console.error("Failed to fetch TikTok data", e);
    return res.status(500).json({ error: "Failed to fetch TikTok data" });
  }
};

module.exports = {
  getData,
};
