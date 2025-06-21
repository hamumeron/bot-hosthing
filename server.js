const express = require("express");
const fs = require("fs");
const { fork } = require("child_process");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(express.json());

const BOTS_DIR = "./bots";
const runningBots = {}; // botName: process

if (!fs.existsSync(BOTS_DIR)) fs.mkdirSync(BOTS_DIR);

// 新しいBot作成（token保存 & 初期コード）
app.post("/api/create", (req, res) => {
  const { name, token } = req.body;
  const botPath = path.join(BOTS_DIR, name);
  if (!fs.existsSync(botPath)) fs.mkdirSync(botPath);
  fs.writeFileSync(path.join(botPath, "token.txt"), token);
  fs.writeFileSync(path.join(botPath, "bot.js"), `const { Client } = require("discord.js");
const client = new Client({ intents: ["Guilds", "GuildMessages", "MessageContent"] });

client.on("ready", () => {
  console.log("Bot is ready");
});

client.on("messageCreate", msg => {
  if (msg.content === "ping") msg.reply("pong!");
});

client.login("${token}");`);
  res.send("作成完了！");
});

// Botコード保存
app.post("/api/save", (req, res) => {
  const { name, code } = req.body;
  fs.writeFileSync(path.join(BOTS_DIR, name, "bot.js"), code);
  res.send("保存完了");
});

// Bot起動
app.get("/api/start", (req, res) => {
  const name = req.query.name;
  if (runningBots[name]) return res.send("すでに起動中");
  const botProcess = fork("runner.js", [name]);
  runningBots[name] = botProcess;
  res.send("起動しました");
});

// Bot停止
app.get("/api/stop", (req, res) => {
  const name = req.query.name;
  if (!runningBots[name]) return res.send("実行中ではありません");
  runningBots[name].kill();
  delete runningBots[name];
  res.send("停止しました");
});

app.listen(PORT, () => console.log(`Server running on ${PORT}`));
const { Server } = require("socket.io");
const http = require("http");
const server = http.createServer(app);
const io = new Server(server);

io.on("connection", (socket) => {
  socket.on("joinBotLogs", (botId) => {
    const stream = getLogStreamForBot(botId); // Docker logsから取得
    stream.on("data", (chunk) => {
      socket.emit("botLog", chunk.toString());
    });
  });
});

server.listen(3000, () => console.log("Socket server started"));
app.use("/bot", require("./routes/bots"));
