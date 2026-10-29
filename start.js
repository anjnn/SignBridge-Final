const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

const isWin = os.platform() === 'win32';
const pythonBin = isWin
  ? path.join(__dirname, 'backend', '.venv', 'Scripts', 'python.exe')
  : path.join(__dirname, 'backend', '.venv', 'bin', 'python');

const serverScript = path.join(__dirname, 'backend', 'app', 'server.py');

console.log('\n======================================================');
console.log('🚀 Starting Multilingual Sign Language Interpreter');
console.log('======================================================\n');

// 1. Launch Python Flask Backend
// Using shell: false ensures paths with spaces (e.g. 'research pappers') are handled natively
console.log('[1/2] 🐍 Starting Python Flask Backend on http://127.0.0.1:5000 ...');
const backend = spawn(pythonBin, [serverScript], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: false,
});

backend.on('error', (err) => {
  console.error('❌ Failed to start Python Backend:', err.message);
});

// 2. Launch Vite Frontend
console.log('[2/2] ⚡ Starting Vite Frontend on http://localhost:5173 ...\n');
const npmCmd = isWin ? 'npm.cmd' : 'npm';
const frontend = spawn(npmCmd, ['--prefix', 'frontend', 'run', 'dev'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true,
});

frontend.on('error', (err) => {
  console.error('❌ Failed to start Frontend:', err.message);
});

const cleanup = () => {
  console.log('\nShutting down servers...');
  try { backend.kill(); } catch (e) {}
  try { frontend.kill(); } catch (e) {}
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
