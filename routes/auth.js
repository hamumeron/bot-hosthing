const express = require("express");
const passport = require("passport");
const router = express.Router();

// Discordにリダイレクト
router.get("/discord", passport.authenticate("discord"));

// Discordからのコールバック
router.get("/discord/callback",
  passport.authenticate("discord", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/dashboard.html");
  }
);

// ログアウト
router.get("/logout", (req, res) => {
  req.logout(() => res.redirect("/"));
});

module.exports = router;
