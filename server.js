const express = require("express");
const fs = require("fs");
const { fork } = require("child_process");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const PORT = process.env.PORT || 3000;
const server = http.createServer(app); // ← Expressアプリにサーバーを統合
const io = new Server(server);

const BOTS_DIR = "./bots";
const runningBots = {};

app.use(express.static("public"));
app.use(express.json());

// Bot作成・編集・実行に使うフォルダがなければ作成
if (!fs.existsSync(BOTS_DIR)) fs.mkdirSync(BOTS_DIR);

// APIルーティング
app.use("/bot", require("./routes/bots"));        // DBやDocker管理系
app.use("/bot-save", require("./routes/botSave")); // ファイル保存系

// WebSocket接続（ログなど）
io.on("connection", (socket) => {
  console.log("Socket connected!");

  socket.on("joinBotLogs", (botId) => {
    const logPath = path.join(BOTS_DIR, botId, "log.txt");
    if (!fs.existsSync(logPath)) return;

    const stream = fs.createReadStream(logPath, { encoding: "utf8", start: 0 });
    stream.on("data", (chunk) => {
      socket.emit("botLog", chunk.toString());
    });
  });
});

// 最終的にサーバー起動（Render互換）
server.listen(PORT, () => {
  console.log(`Server & WebSocket running on port ${PORT}`);
});
