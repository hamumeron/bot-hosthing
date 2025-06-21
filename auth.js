// auth.js
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const db = require('./db'); // Postgres接続ライブラリ

passport.use(new DiscordStrategy({
  clientID: process.env.DISCORD_ID,
  clientSecret: process.env.DISCORD_SECRET,
  callbackURL: process.env.CALLBACK_URL,
  scope: ['identify']
}, async (accessToken, refreshToken, profile, done) => {
  const { id, username, avatar } = profile;
  let user = await db.getUserByDiscordId(id);
  if (!user) user = await db.createUser({discord_id: id, username, avatar});
  return done(null, user);
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => db.getUserById(id).then(u => done(null, u)));

