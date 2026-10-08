import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareEnvironment } from './opencode-env.mjs';

test('loads quoted credentials and preserves inherited environment', () => {
  const env = prepareEnvironment('# comment\nCLOVASTUDIO_API_KEY="test-credential"\n', { PATH: '/bin' });
  assert.equal(env.CLOVASTUDIO_API_KEY, 'test-credential');
  assert.equal(env.PATH, '/bin');
});
test('rejects missing and empty credentials without exposing values', () => {
  for (const source of ['', 'OTHER=secret', 'CLOVASTUDIO_API_KEY=" "']) {
    assert.throws(() => prepareEnvironment(source, {}), /CLOVASTUDIO_API_KEY/);
  }
});
test('does not export unrelated .env values or evaluate shell substitutions', () => {
  const env = prepareEnvironment('CLOVASTUDIO_API_KEY=$(echo nope)\nPATH=/untrusted\nVITE_SECRET=private', { PATH: '/bin' });
  assert.equal(env.CLOVASTUDIO_API_KEY, '$(echo nope)');
  assert.equal(env.PATH, '/bin');
  assert.equal(env.VITE_SECRET, undefined);
});
test('project .env takes precedence over inherited provider credential', () => {
  assert.equal(prepareEnvironment('CLOVASTUDIO_API_KEY=local', { CLOVASTUDIO_API_KEY: 'old' }).CLOVASTUDIO_API_KEY, 'local');
});
