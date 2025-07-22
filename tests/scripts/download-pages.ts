import fs from 'node:fs/promises';
import path from 'node:path';
import { PAGE_URL, PAGES_PATH } from '@tests/constants';

const fetchHtml = async (url: string) => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`${response.statusText} on ${url}`);
  }

  const html = await response.text();

  if (!html) {
    throw new Error(`empty response on ${url}`);
  }

  return html;
};

const fileExists = async (path: string) =>
  fs
    .stat(path)
    .then(() => true)
    .catch(() => false);

const saveHtml = async (htmlPath: string, html: string) => {
  await fs.mkdir(path.dirname(htmlPath), { recursive: true });
  await fs.writeFile(htmlPath, html);
};

for (const [folderName, urls] of Object.entries(PAGE_URL)) {
  for (const [fileName, url] of Object.entries(urls)) {
    const filePath = path.join(PAGES_PATH, folderName, `${fileName}.html`);

    if (await fileExists(filePath)) continue;

    const html = await fetchHtml(url);
    await saveHtml(filePath, html);
  }
}

console.log('Files saved successfully.');
