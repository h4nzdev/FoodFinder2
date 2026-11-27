import fs from 'node:fs';
import path from 'node:path';
import { transformWithEsbuild } from 'vite';

const rootDir = process.cwd();
const srcDir = path.join(rootDir, 'src');

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, files);
    } else if (/\.(js|jsx|css)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

function resolveImport(fromFile, spec) {
  if (!spec.startsWith('.')) return true;
  const base = path.resolve(path.dirname(fromFile), spec);
  const candidates = [
    base,
    `${base}.js`,
    `${base}.jsx`,
    `${base}.json`,
    `${base}.css`,
    path.join(base, 'index.js'),
    path.join(base, 'index.jsx'),
  ];
  return candidates.some((candidate) => fs.existsSync(candidate));
}

async function runLint() {
  const files = walk(srcDir);
  let errors = 0;

  for (const file of files) {
    const rel = path.relative(rootDir, file);
    const content = fs.readFileSync(file, 'utf8');

    if (content.includes('service_role') || content.includes('SUPABASE_SERVICE_ROLE')) {
      console.error(`[LINT ERROR] ${rel}: Forbidden service-role key reference detected.`);
      errors++;
    }

    if (/\.(js|jsx)$/.test(file)) {
      try {
        await transformWithEsbuild(content, file, {
          loader: file.endsWith('.jsx') ? 'jsx' : 'js',
          jsx: 'automatic',
        });
      } catch (err) {
        console.error(`[LINT ERROR] ${rel}: Syntax/JSX error:\n${err.message}`);
        errors++;
      }

      const importRegex = /\bfrom\s+['"]([^'"]+)['"]|\bimport\s+['"]([^'"]+)['"]/g;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        const spec = match[1] || match[2];
        if (spec && !resolveImport(file, spec)) {
          console.error(`[LINT ERROR] ${rel}: Unresolved relative import "${spec}".`);
          errors++;
        }
      }
    }
  }

  if (errors > 0) {
    console.error(`\nLint failed with ${errors} error(s).`);
    process.exit(1);
  }
  console.log(`Lint passed: Checked ${files.length} source files with 0 errors.`);
}

runLint();
