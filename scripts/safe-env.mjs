import { existsSync, readFileSync } from 'node:fs';

export function loadEnvFile(file = '.env.local') {
  if (!existsSync(file)) return false;
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separator = trimmed.indexOf('=');
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^["']|["']$/g, '');
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
  return true;
}

export function parseArgs(argv = process.argv.slice(2)) {
  const result = { flags: new Set(), values: new Map() };
  for (const arg of argv) {
    if (!arg.startsWith('--')) continue;
    const [key, ...rest] = arg.slice(2).split('=');
    if (rest.length) result.values.set(key, rest.join('='));
    else result.flags.add(key);
  }
  return result;
}

export function requireEnv(names) {
  const missing = names.filter((name) => !process.env[name]);
  if (missing.length) throw new Error('Variaveis ausentes: ' + missing.join(', '));
  return Object.fromEntries(names.map((name) => [name, process.env[name]]));
}

export function assertStaging() {
  if (process.env.RS_RUNNING_ENV !== 'staging') {
    throw new Error('Operacao bloqueada. Defina RS_RUNNING_ENV=staging em .env.staging.local.');
  }
}

export function assertNotProductionUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const prodRefs = ['oeszrnprhbcqawrfoybl'];
  if (prodRefs.some((ref) => url.includes(ref))) {
    throw new Error('URL parece ser do Supabase de producao. Use um projeto staging separado.');
  }
}

export function assertConfirmation(args, expected) {
  if (!args.flags.has('apply') && !args.flags.has('publish')) return false;
  if (args.values.get('confirm') !== expected) {
    throw new Error('Confirmacao ausente. Use --confirm=' + expected);
  }
  return true;
}
