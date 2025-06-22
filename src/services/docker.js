const Docker = require("dockerode");
const fs = require("fs");
const docker = new Docker();

async function runBot(botId, botCode) {
  const tmpDir = `/tmp/bots/${botId}`;
  fs.mkdirSync(tmpDir, { recursive: true });
  fs.writeFileSync(`${tmpDir}/bot.js`, botCode);

  // Dockerイメージのビルド
  await docker.buildImage({
    context: tmpDir,
    src: ["bot.js", "Dockerfile.bot"]
  }, { t: `bot-${botId}` });

  // コンテナ作成・起動
  const container = await docker.createContainer({
    Image: `bot-${botId}`,
    name: `bot-${botId}`,
    HostConfig: { AutoRemove: true }
  });

  await container.start();
  return container.id;
}

async function stopBot(containerId) {
  const container = docker.getContainer(containerId);
  await container.stop();
  await container.remove();
}

module.exports = { runBot, stopBot };
