const os = require('os');
const pty = require('node-pty');

// Map of sessionId -> {pty, shell, pid}
const sessions = new Map();
let counter = 0;

function generateId() {
  return `sess-${Date.now()}-${++counter}`;
}

function spawnShell() {
  const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
  const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols: 120,
    rows: 30,
    cwd: process.env.HOME,
    env: process.env,
  });
  const id = generateId();
  sessions.set(id, {pty: ptyProcess, shell, pid: ptyProcess.pid});
  return {id, pid: ptyProcess.pid};
}

function listSessions() {
  const list = [];
  for (const [id, info] of sessions.entries()) {
    list.push({id, pid: info.pid, shell: info.shell});
  }
  return list;
}

function getSession(id) {
  return sessions.get(id);
}

function closeSession(id) {
  const s = sessions.get(id);
  if (s) {
    s.pty.kill();
    sessions.delete(id);
  }
}

module.exports = {spawnShell, listSessions, getSession, closeSession};
