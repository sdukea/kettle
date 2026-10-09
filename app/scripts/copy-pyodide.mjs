// Copies the Pyodide runtime into web/public so the app serves Python itself,
// instead of depending on a CDN that school and college networks may block.
import { cpSync, mkdirSync } from "node:fs";

const files = ["pyodide.mjs", "pyodide.asm.mjs", "pyodide.asm.wasm", "python_stdlib.zip", "pyodide-lock.json"];
mkdirSync("web/public/pyodide", { recursive: true });
for (const f of files) cpSync(`node_modules/pyodide/${f}`, `web/public/pyodide/${f}`);
console.log(`Copied ${files.length} Pyodide files to web/public/pyodide`);
