const express = require("express");
const youtubeController = require("../controllers/youtube.controller");

const router = express.Router();

router.get("/getData/:channelName", youtubeController.getChannelAnalytics);

module.exports = router;