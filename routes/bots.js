const express = require("express");
const db = require("../services/db");
const docker = require("../services/docker");
const router = express.Router();

// Bot一覧（ログインユーザーの分のみ）
router.get("/", async (req, res) => {
  if (!req.user) return res.status(401).send("ログインしてね");
  const bots = await db.getBotsByUser(req.user.id);
  res.json(bots);
});

// Bot作成
router.post("/", async (req, res) => {
  const { name, token } = req.body;
  const bot = await db.createBot(req.user.id, name, token);
  res.json(bot);
});

// コード保存
router.put("/:id", async (req, res) => {
  const bot = await db.updateBotCode(req.params.id, req.body.code, req.user.id);
  res.send("保存しました");
});

// 起動
router.post("/:id/start", async (req, res) => {
  const result = await docker.startBotContainer(req.params.id, req.user.id);
  res.send(result);
});

// 停止
router.post("/:id/stop", async (req, res) => {
  const result = await docker.stopBotContainer(req.params.id, req.user.id);
  res.send(result);
});

module.exports = router;
const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

router.post("/:botId/save", (req, res) => {
  const botId = req.params.botId;
  const botCode = req.body.code;

  const botDir = path.join(__dirname, "..", "bots", botId);
  const botPath = path.join(botDir, "bot.js");

  fs.mkdirSync(botDir, { recursive: true }); // ← これが今回の修正ポイント！
  fs.writeFileSync(botPath, botCode);

  res.send("Bot.js saved successfully!");
});

module.exports = router;
