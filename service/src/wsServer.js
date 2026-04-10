#!/usr/bin/env node
const WebSocket = require('ws');
const yargs = require('yargs');
const {hideBin}=require('yargs/helpers');
const {spawnShell, listSessions, getSession, closeSession}=require('./ptyManager');
const {loadTokenFile, verify, getToken}=require('./auth');

const argv = yargs(hideBin(process.argv))
  .option('port',{type:'number',default:process.env.PORT||5273})
  .option('cert',{type:'string', demandOption:true})
  .option('key',{type:'string', demandOption:true})
  .option('tokenFile',{type:'string', demandOption:true})
  .argv;

loadTokenFile(argv.tokenFile);

const wss = new WebSocket.Server({
  port: argv.port,
  cert: argv.cert,
  key: argv.key,
  // clients must send JWT as subprotocol
});

function send(ws, type, payload){
  ws.send(JSON.stringify({type, payload}));
}

wss.on('connection', (ws, req)=>{
  // auth via subprotocol
  const token = req.headers['sec-websocket-protocol'];
  if(!verify(req)){
    ws.close(1008, 'Unauthorized');
    return;
  }
  // attach an empty session id until client selects
  ws.on('message', data=>{
    let msg;
    try{msg=JSON.parse(data.toString());}catch(e){return;}
    const {type, payload}=msg;
    switch(type){
      case 'list':
        send(ws,'list',listSessions());
        break;
      case 'spawn':
        const sess=spawnShell();
        send(ws,'spawn',sess);
        break;
      case 'switch':
        const {sessionId}=payload;
        const session=getSession(sessionId);
        if(!session){send(ws,'error',{msg:'session not found'});return;}
        // pipe data
        session.pty.removeAllListeners('data');
        session.pty.on('data', d=> send(ws,'output',{sessionId, data:d}));
        ws.currentSession=sessionId;
        break;
      case 'input':
        const {sessionId: sid, data}=payload;
        const s=getSession(sid);
        if(s){s.pty.write(data);}
        break;
      case 'close':
        const {sessionId: cid}=payload;
        closeSession(cid);
        send(ws,'closed',{sessionId:cid});
        break;
      default:
        send(ws,'error',{msg:'unknown type'});
    }
  });
  ws.on('close',()=>{ /* nothing */ });
});

console.log('Remote Terminal Service listening on port',argv.port);
