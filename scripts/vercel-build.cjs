const { cpSync, existsSync, rmSync } = require('node:fs');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const root = process.cwd();
const build = spawnSync('npm', ['run', 'build', '--workspace=@goorder/client'], {
  cwd: root,
  stdio: 'inherit',
  shell: true,
  env: process.env,
});

if (build.status !== 0) {
  process.exit(build.status ?? 1);
}

const from = path.join(root, 'apps', 'client', '.next');
const to = path.join(root, '.next');

if (!existsSync(from)) {
  console.error('Vercel build expected apps/client/.next but it was not created.');
  process.exit(1);
}

rmSync(to, { recursive: true, force: true });
cpSync(from, to, { recursive: true });
