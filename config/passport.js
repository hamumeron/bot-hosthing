const passport = require("passport");
const DiscordStrategy = require("passport-discord").Strategy;
const db = require("../services/db"); // データベース操作

passport.use(new DiscordStrategy({
  clientID: process.env.DISCORD_ID,
  clientSecret: process.env.DISCORD_SECRET,
  callbackURL: process.env.CALLBACK_URL,
  scope: ['identify']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await db.findOrCreateUser(profile); // DiscordのIDでユーザー作成
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await db.getUserById(id);
  done(null, user);
});
