import fs from 'fs';
import path from 'path';

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (!fullPath.includes('node_modules') && !fullPath.includes('.next') && !fullPath.includes('.git') && !fullPath.includes('.idea')) {
        results = results.concat(getFiles(fullPath));
      }
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      results.push(fullPath);
    }
  }
  return results;
}

const files = getFiles('.');
console.log(`Found ${files.length} TypeScript / TSX files to audit.\n`);

const findings = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');

  // 1. Audit unused named imports
  const importRegex = /import\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"]/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const names = match[1].split(',').map((s) => s.trim().replace(/^type\s+/, '')).filter(Boolean);
    for (const name of names) {
      if (!name) continue;
      const aliasMatch = name.match(/^(\w+)\s+as\s+(\w+)$/);
      const identifier = aliasMatch ? aliasMatch[2] : name.split(/\s+/)[0];
      if (!identifier || identifier.startsWith('//')) continue;

      // Count occurrences
      const wordRegex = new RegExp(`\\b${identifier}\\b`, 'g');
      const matches = content.match(wordRegex) || [];
      if (matches.length <= 1) {
        findings.push({
          type: 'UNUSED_IMPORT',
          file,
          detail: `Imported '${identifier}' is unused`,
        });
      }
    }
  }

  // 2. Audit target="_blank" without rel="noopener noreferrer"
  const blankMatches = content.matchAll(/target=["']_blank["'][^>]*>/gi);
  for (const bm of blankMatches) {
    const snippet = bm[0];
    if (!snippet.includes('rel=') || (!snippet.includes('noopener') && !snippet.includes('noreferrer'))) {
      findings.push({
        type: 'SECURITY_TARGET_BLANK',
        file,
        detail: `External link with target="_blank" missing rel="noopener noreferrer": ${snippet}`,
      });
    }
  }

  // 3. Audit dangerouslySetInnerHTML
  if (content.includes('dangerouslySetInnerHTML')) {
    findings.push({
      type: 'SECURITY_DANGEROUS_HTML',
      file,
      detail: `Contains dangerouslySetInnerHTML`,
    });
  }

  // 4. Audit loose 'any' usage
  const anyMatches = content.match(/:\s*any\b|<any>/g) || [];
  if (anyMatches.length > 0 && !file.includes('LeafletMap.tsx')) {
    // LeafletMap has some third-party untyped mapInstance references
    findings.push({
      type: 'CODE_QUALITY_ANY',
      file,
      detail: `Found ${anyMatches.length} occurrences of 'any' type`,
    });
  }
}

console.log('=== AUDIT FINDINGS ===');
console.log(`Total findings: ${findings.length}\n`);
for (const f of findings) {
  console.log(`[${f.type}] in ${f.file}`);
  console.log(`   ${f.detail}`);
}
