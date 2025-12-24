const express = require("express");
const { manualSync , getUserData } = require("../controllers/instagram.controller");

const router = express.Router();

router.get("/sync-now", manualSync);
router.get("/getData/:username", getUserData);

module.exports = router;
