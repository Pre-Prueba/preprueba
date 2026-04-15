const { spawn } = require('child_process');
const path = require('path');

const appName = process.argv[2];
const appCwd = process.argv[3];

if (!appName || !appCwd) {
  console.error('Usage: node pm2-launcher.js <appName> <cwd>');
  process.exit(1);
}

console.log(`Launching ${appName} in ${appCwd}...`);

const child = spawn('npm', ['run', 'dev'], {
  cwd: path.resolve(appCwd),
  shell: true,
  stdio: 'inherit',
  env: process.env
});

child.on('error', (err) => {
  console.error(`Failed to start child process: ${err}`);
  process.exit(1);
});

child.on('exit', (code) => {
  console.log(`Child process exited with code ${code}`);
  process.exit(code || 0);
});
