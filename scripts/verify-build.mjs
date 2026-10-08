import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const dist = new URL('../apps/web/dist/', import.meta.url);
const html = readFileSync(new URL('index.html', dist), 'utf8');
assert.match(html, /\/sharedclothes\/assets\//, 'Pages base path must be present');
for (const file of ['hero.jpg', 'dress.jpg', 'jacket.jpg', 'bag.jpg', 'brand-film.mp4']) {
  assert.ok(statSync(new URL(`media/${file}`, dist)).size > 0, `Missing media: ${file}`);
}
function inspect(directory) {
  for (const file of readdirSync(directory, { withFileTypes: true })) {
    assert.ok(!file.name.startsWith('.env') && file.name !== 'opencode.json', 'Private config in artifact');
    const path = join(directory, file.name);
    if (file.isDirectory()) inspect(path);
    else if (/\.(js|html|css|json)$/.test(file.name)) {
      const content = readFileSync(path, 'utf8');
      assert.ok(!/nv-[a-zA-Z0-9]{20,}/.test(content), 'Provider credential in artifact');
      assert.ok(!/["'`]\/media\//.test(content), 'Root-relative media URL breaks Pages');
    }
  }
}
inspect(fileURLToPath(dist));
console.log('Pages base path, media files and public artifact checks passed.');
