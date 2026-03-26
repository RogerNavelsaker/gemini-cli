import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

function packageRoot(name) {
  return path.dirname(require.resolve(`${name}/package.json`));
}

function replaceOnce(file, from, to) {
  const text = fs.readFileSync(file, 'utf8');
  if (text.includes(to)) {
    return;
  }
  if (!text.includes(from)) {
    throw new Error(`Pattern not found in ${file}`);
  }
  fs.writeFileSync(file, text.replace(from, to));
}

function removeOnce(file, needle) {
  const text = fs.readFileSync(file, 'utf8');
  if (!text.includes(needle)) {
    return;
  }
  fs.writeFileSync(file, text.replace(needle, ''));
}

const cliRoot = packageRoot('@google/gemini-cli');
const coreRoot = packageRoot('@google/gemini-cli-core');

removeOnce(
  path.join(coreRoot, 'dist/src/services/keychainService.js'),
  "        debugLogger.log('Using FileKeychain fallback for secure storage.');\n",
);

replaceOnce(
  path.join(coreRoot, 'dist/src/services/shellExecutionService.js'),
  [
    "                const isEsrch = err.code === 'ESRCH';",
    "                const isWindowsPtyError = err.message?.includes('Cannot resize a pty that has already exited');",
    "                if (isEsrch || isWindowsPtyError) {",
    '                    // On Unix, we get an ESRCH error.',
  ].join('\n'),
  [
    "                const isEsrch = err.code === 'ESRCH';",
    "                const isEbadf = err.code === 'EBADF' || err.message?.includes('EBADF');",
    "                const isWindowsPtyError = err.message?.includes('Cannot resize a pty that has already exited');",
    "                if (isEsrch || isEbadf || isWindowsPtyError) {",
    '                    // On Unix, we get an ESRCH error or an EBADF from a closed fd.',
  ].join('\n'),
);

replaceOnce(
  path.join(coreRoot, 'dist/src/utils/retry.js'),
  'export const DEFAULT_MAX_ATTEMPTS = 10;',
  'export const DEFAULT_MAX_ATTEMPTS = 1000;',
);

replaceOnce(
  path.join(coreRoot, 'dist/src/utils/retry.js'),
  [
    '    initialDelayMs: 5000,',
    '    maxDelayMs: 30000, // 30 seconds',
  ].join('\n'),
  [
    '    initialDelayMs: 1000,',
    '    maxDelayMs: 5000, // 5 seconds max between retries',
  ].join('\n'),
);

replaceOnce(
  path.join(coreRoot, 'dist/src/utils/retry.js'),
  [
    '            if (classifiedError instanceof TerminalQuotaError ||',
    '                classifiedError instanceof ModelNotFoundError) {',
    '                if (onPersistent429) {',
    '                    try {',
    '                        const fallbackModel = await onPersistent429(authType, classifiedError);',
    '                        if (fallbackModel) {',
    '                            attempt = 0; // Reset attempts and retry with the new model.',
    '                            currentDelay = initialDelayMs;',
    '                            continue;',
    '                        }',
    '                    }',
    '                    catch (fallbackError) {',
    "                        debugLogger.warn('Fallback to Flash model failed:', fallbackError);",
    '                    }',
    '                }',
    '                // Terminal/not_found already recorded; nothing else to mark here.',
    '                throw classifiedError; // Throw if no fallback or fallback failed.',
    '            }',
  ].join('\n'),
  [
    '            if (classifiedError instanceof ModelNotFoundError) {',
    '                if (onPersistent429) {',
    '                    try {',
    '                        const fallbackModel = await onPersistent429(authType, classifiedError);',
    '                        if (fallbackModel) {',
    '                            attempt = 0; // Reset attempts and retry with the new model.',
    '                            currentDelay = initialDelayMs;',
    '                            continue;',
    '                        }',
    '                    }',
    '                    catch (fallbackError) {',
    "                        debugLogger.warn('Fallback to Flash model failed:', fallbackError);",
    '                    }',
    '                }',
    '                // Terminal/not_found already recorded; nothing else to mark here.',
    '                throw classifiedError; // Throw if no fallback or fallback failed.',
    '            }',
    '            if (classifiedError instanceof TerminalQuotaError) {',
    '                if (attempt >= maxAttempts) {',
    '                    if (onPersistent429) {',
    '                        try {',
    '                            const fallbackModel = await onPersistent429(authType, classifiedError);',
    '                            if (fallbackModel) {',
    '                                attempt = 0;',
    '                                currentDelay = initialDelayMs;',
    '                                continue;',
    '                            }',
    '                        }',
    '                        catch (fallbackError) {',
    "                            debugLogger.warn('Fallback failed:', fallbackError);",
    '                        }',
    '                    }',
    '                    throw classifiedError;',
    '                }',
    '                const jitter = currentDelay * 0.3 * (Math.random() * 2 - 1);',
    '                const delayWithJitter = Math.max(0, currentDelay + jitter);',
    '                debugLogger.warn(`Attempt ${attempt} hit quota limit: ${classifiedError.message}. Retrying in ${Math.round(delayWithJitter)}ms...`);',
    '                if (onRetry) {',
    '                    onRetry(attempt, classifiedError, delayWithJitter);',
    '                }',
    '                await delay(delayWithJitter, signal);',
    '                currentDelay = Math.min(maxDelayMs, currentDelay * 2);',
    '                continue;',
    '            }',
  ].join('\n'),
);

removeOnce(
  path.join(cliRoot, 'dist/src/utils/handleAutoUpdate.js'),
  [
    '    if (!settings.merged.general.enableAutoUpdateNotification) {',
    '        return;',
    '    }',
  ].join('\n') + '\n',
);

removeOnce(
  path.join(cliRoot, 'dist/src/ui/utils/updateCheck.js'),
  [
    '        if (!settings.merged.general.enableAutoUpdateNotification) {',
    '            return null;',
    '        }',
  ].join('\n') + '\n',
);
