import fs from 'fs';

function readFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8').trim().split('\n').slice(1);
  return content;
}

export default readFile;