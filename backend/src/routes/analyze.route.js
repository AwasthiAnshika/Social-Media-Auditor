const express = require("express");
const emailController = require("../controller/email.controller");

const router = express.Router();

router.post("/", emailController.sendEmailWithReport);

module.exports = router;

