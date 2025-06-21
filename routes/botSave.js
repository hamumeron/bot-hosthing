const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

router.post("/:botId/save", (req, res) => {
  const botId = req.params.botId;
  const botCode = req.body.code;

  const botDir = path.join(__dirname, "..", "bots", botId);
  const botPath = path.join(botDir, "bot.js");

  fs.mkdirSync(botDir, { recursive: true });
  fs.writeFileSync(botPath, botCode);

  res.send("Bot.js saved successfully!");
});

module.exports = router;
