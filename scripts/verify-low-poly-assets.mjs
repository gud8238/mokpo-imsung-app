import { stat } from 'node:fs/promises';

const files = [
  'public/low-poly/login-forest.webp',
  'public/low-poly/student-trail.webp',
  'public/low-poly/teacher-observatory.webp',
  'public/low-poly/book-gem.webp',
  'public/low-poly/question-gem.webp',
  'public/low-poly/profile-gem.webp',
];

for (const file of files) {
  const info = await stat(file);
  if (info.size === 0) throw new Error(`${file} is empty`);
  if (info.size > 1_500_000) throw new Error(`${file} exceeds 1.5 MB`);
}

console.log(`Verified ${files.length} low-poly assets`);
