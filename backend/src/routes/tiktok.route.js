const express = require("express");
const { getData } = require("../controllers/tiktok.controller");

const router = express.Router();

router.get("/getData/:username", getData);

module.exports = router;
