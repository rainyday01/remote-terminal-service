#!/usr/bin/env bash
set -e

DATA_DIR="/data"
mkdir -p "$DATA_DIR"

# generate self‑signed cert if not present
if [ ! -f "$DATA_DIR/cert.pem" ]; then
  openssl req -newkey rsa:2048 -nodes -keyout "$DATA_DIR/key.pem" -x509 -days 365 -out "$DATA_DIR/cert.pem" -subj "/CN=remote-terminal"
fi

# generate JWT token if not existing
if [ ! -f "$DATA_DIR/token.txt" ]; then
  NODE_OPTIONS= NODE_NO_WARNINGS=1 node -e "
    const jwt = require('jsonwebtoken');
    const secret = require('crypto').randomBytes(32).toString('hex');
    const token = jwt.sign({role:'client'}, secret, {expiresIn:'30d'});
    console.log('TOKEN=' + token);
    require('fs').writeFileSync(process.env.DATA_DIR+'/token.txt', token+'\n'+secret);
  "
fi

# start server
node src/wsServer.js --cert "$DATA_DIR/cert.pem" --key "$DATA_DIR/key.pem" --tokenFile "$DATA_DIR/token.txt"
