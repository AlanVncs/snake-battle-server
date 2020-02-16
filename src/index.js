const path     = require('path');
const express  = require('express');
const http     = require('http');

const app    = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 1337;

const PUBLIC_DIR = path.join(__dirname, '../public');

app.use(express.static(PUBLIC_DIR));

server.listen(PORT);