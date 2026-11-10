// replaceLocalhost.js
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', 'frontend');
const exts = ['.tsx', '.ts'];

function walk(dir) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(dirent => {
    const fullPath = path.join(dir, dirent.name);
    if (dirent.isDirectory()) {
      walk(fullPath);
    } else if (exts.includes(path.extname(dirent.name))) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const original = content;
      content = content.replace(/http:\/\/localhost:5000/g, '${process.env.NEXT_PUBLIC_API_URL}');
      content = content.replace(/http:\/\/localhost:3000/g, '${process.env.NEXT_PUBLIC_API_URL}');
      content = content.replace(/http:\/\/127.0.0.1:3000/g, '${process.env.NEXT_PUBLIC_API_URL}');
      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Updated', fullPath);
      }
    }
  });
}

walk(root);
console.log('Replacement complete');
