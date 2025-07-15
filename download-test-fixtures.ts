import fs from 'node:fs/promises';
import { JSDOM } from 'jsdom';
import path from 'node:path';
import { fileURLToPath } from 'url';

const BASE_URL =
  'https://animefire.plus/animes/mob-psycho-100-iii-todos-os-episodios';

const OUTPUT_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  'tests/__fixtures__',
);
async function fetchHtml(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`${response.statusText} on ${url}`);
  }

  return response.text();
}

const saveHtml = async (filename, html) => {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.writeFile(path.join(OUTPUT_DIR, filename), html);
};

const listHtml = await fetchHtml(BASE_URL);
await saveHtml('episodes-list.html', listHtml);

const listDocument = new JSDOM(listHtml).window.document;

const episodeUrl =
  listDocument.querySelector<HTMLAnchorElement>('.div_video_list a')?.href;

if (!episodeUrl) throw new Error('Nenhum link de episódio encontrado.');

const episodeHtml = await fetchHtml(episodeUrl);
await saveHtml('episode-page.html', episodeHtml);

const episodeDocument = new JSDOM(episodeHtml).window.document;
const downloadPageUrl =
  episodeDocument.querySelector<HTMLAnchorElement>('#dw')?.href;

if (!downloadPageUrl) throw new Error('Link de download não encontrado.');

const downloadPageHtml = await fetchHtml(downloadPageUrl);

await saveHtml('download-page.html', downloadPageHtml);

console.log('Files saved successfully.');
