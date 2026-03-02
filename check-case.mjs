import fs from 'fs';
import path from 'path';

function walk(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const stat = fs.statSync(path.join(dir, file));
        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
                walk(path.join(dir, file), fileList);
            }
        } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
            fileList.push(path.join(dir, file));
        }
    }
    return fileList;
}

const root = path.join(process.cwd(), 'src');
const allFiles = walk(root);
const fileNames = new Set(allFiles.map(f => f.replace(/\\/g, '/')));

for (const file of allFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const importRegex = /(?:import|export).*?from\s+['"]([^'"]+)['"]/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
        let importPath = match[1];
        let resolved = null;

        if (importPath.startsWith('.')) {
            const dir = path.dirname(file);
            resolved = path.join(dir, importPath).replace(/\\/g, '/');
        } else if (importPath.startsWith('@/')) {
            resolved = path.join(root, importPath.slice(2)).replace(/\\/g, '/');
        }

        if (resolved) {
            let found = false;
            const extensions = ['', '.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx'];
            for (const ext of extensions) {
                if (fileNames.has(resolved + ext)) {
                    found = true;
                    break;
                }
            }

            if (!found) {
                let foundLower = null;
                for (const existingFile of fileNames) {
                    let existingLower = existingFile.toLowerCase();
                    let resolvedLowers = extensions.map(e => (resolved + e).toLowerCase());
                    if (resolvedLowers.includes(existingLower)) {
                        foundLower = existingFile;
                        break;
                    }
                }

                if (foundLower) {
                    console.log(`CASE SENSITIVITY ERROR in ${file}`);
                    console.log(`Imported: ${importPath}`);
                    console.log(`Actual file: ${foundLower}`);
                    console.log('---');
                }
            }
        }
    }
}
