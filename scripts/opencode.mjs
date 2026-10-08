import { readFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { prepareEnvironment } from './opencode-env.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
let env;
try {
  env = prepareEnvironment(readFileSync(new URL('../.env', import.meta.url), 'utf8'));
} catch (error) {
  console.error(error.code === 'ENOENT'
    ? '.env가 없습니다. .env.example을 .env로 복사하고 키를 입력해주세요.'
    : '설정을 읽을 수 없습니다. .env의 CLOVASTUDIO_API_KEY를 확인해주세요.');
  process.exit(1);
}
const child = spawn('opencode', process.argv.slice(2), { cwd: root, env, stdio: 'inherit' });
child.on('error', () => {
  console.error('OpenCode를 실행할 수 없습니다. 저장소 루트에서 npm ci 후 npm run opencode를 실행해주세요.');
  process.exitCode = 1;
});
child.on('exit', (code, signal) => {
  process.exitCode = code ?? (signal ? 1 : 0);
});
