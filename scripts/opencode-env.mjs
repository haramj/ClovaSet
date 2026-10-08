import { parseEnv } from 'node:util';

export function prepareEnvironment(source, inherited = process.env) {
  const values = parseEnv(source);
  // Export only the provider credential; .env cannot override PATH or execute code.
  const apiKey = values.CLOVASTUDIO_API_KEY?.trim();
  if (!apiKey) throw new Error('.env에 CLOVASTUDIO_API_KEY를 입력해주세요.');
  return { ...inherited, CLOVASTUDIO_API_KEY: apiKey };
}
