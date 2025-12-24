const express = require('express');
const healthRoute = require('./health.route');
const instagramRoute = require('./instagram.route');
const youtubeRoute = require('./youtube.route');
const analyzeRoute = require('./analyze.route');
const tiktokRoute = require('./tiktok.route');

const router = express.Router();

router.use('/health', healthRoute);
router.use('/instagram', instagramRoute);
router.use('/youtube', youtubeRoute);
router.use('/analyze', analyzeRoute);
router.use('/tiktok', tiktokRoute);

module.exports = router;
