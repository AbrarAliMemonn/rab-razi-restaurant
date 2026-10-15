import { spawn } from 'child_process';

console.log('\n======================================================');
console.log('🔥 Rab Razi Restaurant - Full-Stack Dev Server');
console.log('======================================================');
console.log('📦 Backend: http://localhost:5000 (Express & Node.js API)');
console.log('💻 Frontend: http://localhost:5173 (React & Tailwind CSS)');
console.log('======================================================\n');

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

const backend = spawn(npmCmd, ['--prefix', 'backend', 'run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

const frontend = spawn(npmCmd, ['--prefix', 'frontend', 'run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

function handleExit() {
  try {
    backend.kill();
    frontend.kill();
  } catch {}
  process.exit();
}

process.on('SIGINT', handleExit);
process.on('SIGTERM', handleExit);
