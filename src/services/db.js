// src/services/db.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:'); // メモリ内DB。ファイルにしたければファイル名指定

module.exports = db;
