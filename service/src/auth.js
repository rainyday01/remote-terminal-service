const fs = require('fs');
const jwt = require('jsonwebtoken');

let secret = null;
let token = null;

function loadTokenFile(tokenFile) {
  const data = fs.readFileSync(tokenFile, 'utf8').trim().split('\n');
  token = data[0];
  secret = data[1];
}

function verify(req) {
  const auth = req.headers['sec-websocket-protocol']; // we pass token via subprotocol
  if (!auth) return false;
  try {
    const payload = jwt.verify(auth, secret);
    return payload && payload.role === 'client';
  } catch (_) {
    return false;
  }
}

module.exports = {loadTokenFile, verify, getToken: () => token};
