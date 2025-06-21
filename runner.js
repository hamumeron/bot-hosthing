const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const name = process.argv[2];
const botPath = path.join(__dirname, "bots", name);
const botFile = path.join(botPath, "bot.js");

require("discord.js"); // Ensure installed

const child = spawn("node", [botFile], {
  cwd: botPath,
  stdio: "inherit"
});
