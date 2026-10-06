// Build-time bridge: Blender and the renderer use exactly the same authored cuts.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
const loadModule = createRequire(import.meta.url);
loadModule.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, filename);
const directory = path.dirname(fileURLToPath(import.meta.url));
const { getBreakAssembly } = loadModule(path.resolve(directory, '../../src/components/entrance/entrance-break.ts'));
const { getEntranceComposition } = loadModule(path.resolve(directory, '../../src/components/entrance/entrance-manifest.ts'));
process.stdout.write(JSON.stringify([false,true].map(mobile => ({ mobile, composition: getEntranceComposition(mobile), assembly: getBreakAssembly(mobile) }))));
