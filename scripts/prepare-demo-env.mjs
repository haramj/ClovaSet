import { randomBytes } from 'node:crypto';
import { writeFile } from 'node:fs/promises';

const content = [
  `DEMO_DB_PASSWORD=${randomBytes(24).toString('hex')}`,
  `DEMO_DB_ROOT_PASSWORD=${randomBytes(24).toString('hex')}`,
  `DEMO_ACCESS_CODE=${randomBytes(12).toString('base64url')}`,
  '',
].join('\n');

try {
  await writeFile(new URL('../.env.demo', import.meta.url), content, {
    flag: 'wx',
    mode: 0o600,
  });
  console.log('Created .env.demo with private DB passwords and an access code.');
} catch (error) {
  if (error.code !== 'EEXIST') throw error;
  console.log('Existing .env.demo kept unchanged.');
}
