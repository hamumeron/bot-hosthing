const passport = require("passport");
const DiscordStrategy = require("passport-discord").Strategy;
const db = require("../services/db"); // あなたのDBモジュールに応じて

passport.use(new DiscordStrategy({
  clientID: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  callbackURL: process.env.CALLBACK_URL,
  scope: ['identify']
}, async (accessToken, refreshToken, profile, done) => {
  const user = await db.findOrCreateUser(profile);
  return done(null, user);
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  db.getUserById(id).then(user => done(null, user));
});
