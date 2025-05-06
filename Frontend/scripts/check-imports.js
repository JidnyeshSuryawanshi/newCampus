import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function checkImports(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      checkImports(filePath);
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes("from './components/")) {
        console.error(`Warning: ${filePath} contains lowercase 'components' import`);
        process.exit(1);
      }
    }
  });
}

// Start checking from src directory
const srcPath = path.join(__dirname, '..', 'src');
checkImports(srcPath); 