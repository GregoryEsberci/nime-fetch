import fs from 'node:fs';
import path from 'node:path';
import { BASE_PATH, SOURCE_DIR } from '@/utils/constants';

const htmlTemplatePath = path.join(SOURCE_DIR, 'public/index.template.html');
const htmlOutputPath = path.join(SOURCE_DIR, 'public/index.html');

const outputHtml = fs
  .readFileSync(htmlTemplatePath, 'utf8')
  .replaceAll('{{BASE_PATH}}', BASE_PATH);

fs.writeFileSync(htmlOutputPath, outputHtml);
