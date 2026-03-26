import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

function packageRoot(name) {
  return path.dirname(require.resolve(`${name}/package.json`));
}

function assertIncludes(file, needle) {
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(needle)) {
    throw new Error(`Expected to find ${needle} in ${file}`);
  }
}

function assertExcludes(file, needle) {
  const text = fs.readFileSync(file, 'utf8');
  if (text.includes(needle)) {
    throw new Error(`Expected not to find ${needle} in ${file}`);
  }
}

const cliRoot = packageRoot('@google/gemini-cli');
const coreRoot = packageRoot('@google/gemini-cli-core');

assertExcludes(
  path.join(coreRoot, 'dist/src/services/keychainService.js'),
  'Using FileKeychain fallback for secure storage.',
);
assertIncludes(
  path.join(coreRoot, 'dist/src/services/shellExecutionService.js'),
  'const isEbadf = err.code === \'EBADF\' || err.message?.includes(\'EBADF\');',
);
assertIncludes(
  path.join(cliRoot, 'dist/src/ui/components/messages/ShellToolMessage.js'),
  "e.message.includes('EBADF')",
);
assertIncludes(
  path.join(packageRoot('@lydell/node-pty'), 'unixTerminal.js'),
  "if (message.includes('EBADF') || message.includes('ESRCH')) {",
);
assertIncludes(
  path.join(coreRoot, 'dist/src/utils/retry.js'),
  'export const DEFAULT_MAX_ATTEMPTS = 1000;',
);
assertIncludes(
  path.join(coreRoot, 'dist/src/utils/retry.js'),
  'initialDelayMs: 1000,',
);
assertIncludes(
  path.join(coreRoot, 'dist/src/utils/retry.js'),
  'hit quota limit:',
);
assertExcludes(
  path.join(cliRoot, 'dist/src/utils/handleAutoUpdate.js'),
  'if (!settings.merged.general.enableAutoUpdateNotification)',
);
assertExcludes(
  path.join(cliRoot, 'dist/src/ui/utils/updateCheck.js'),
  'if (!settings.merged.general.enableAutoUpdateNotification)',
);
