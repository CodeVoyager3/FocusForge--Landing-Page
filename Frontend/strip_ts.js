import fs from 'fs';
import path from 'path';

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  // strip types
  content = content.replace(/<HTMLVideoElement>/g, '');
  content = content.replace(/\(window as any\)/g, 'window');
  content = content.replace(/getElementById\('root'\)!/g, "getElementById('root')");
  // update import
  content = content.replace(/'\.\/App\.tsx'/g, "'./App.jsx'");
  fs.writeFileSync(filePath, content);
}

const files = [
  'src/components/Features.tsx',
  'src/components/CTA.tsx',
  'src/components/TutorAgent.tsx',
  'src/components/Hero.tsx',
  'src/components/Pipeline.tsx',
  'src/components/Impact.tsx',
  'src/components/Navbar.tsx',
  'src/components/Footer.tsx',
  'src/App.tsx',
  'src/main.tsx',
  'vite.config.ts'
];

files.forEach(file => {
  const fullPath = path.join('c:/Users/user/Downloads/focus-forge', file);
  if (fs.existsSync(fullPath)) {
    processFile(fullPath);
    const newPath = fullPath.replace(/\.tsx$/, '.jsx').replace(/\.ts$/, '.js');
    fs.renameSync(fullPath, newPath);
    console.log(`Processed and renamed: ${file} -> ${path.basename(newPath)}`);
  } else {
    console.log(`File not found: ${file}`);
  }
});
