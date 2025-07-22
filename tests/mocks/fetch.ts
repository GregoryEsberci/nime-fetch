import path from 'node:path';
import { PAGE_URL, PAGES_PATH } from '../constants';
import fs from 'node:fs/promises';

type Fetch = typeof global.fetch;

type FetchInput = Parameters<Fetch>[0];
type FetchInit = Parameters<Fetch>[1];

const originalFetch = global.fetch;

const getHtmlPage = async (requestUrl: URL) => {
  let filePath;

  const pageUrlEntries = Object.entries(PAGE_URL);

  for (let i = 0; i < pageUrlEntries.length && !filePath; i++) {
    const [folderName, urls] = pageUrlEntries[i];
    const urlEntries = Object.entries(urls);

    for (let i = 0; i < urlEntries.length && !filePath; i++) {
      const [fileName, pageUrl] = urlEntries[i];

      if (pageUrl === requestUrl.toString()) {
        filePath = path.join(PAGES_PATH, folderName, `${fileName}.html`);
      }
    }
  }

  if (!filePath) return;

  try {
    const isFile = (await fs.stat(filePath)).isFile();
    if (!isFile) throw new Error('Invalid html');
  } catch {
    console.warn(
      `${filePath} not found, try running “yarn tsx tests/scripts/download-pages.ts” to update the files.`,
    );

    return;
  }

  return fs.readFile(filePath, 'utf-8');
};

const getFetchInfo = (input: FetchInput, init: FetchInit) => {
  if (input instanceof URL) {
    return {
      url: input,
      method: init?.method ?? 'GET',
    };
  }

  if (input instanceof Request) {
    return {
      url: new URL(input.url),
      method: input.method,
    };
  }

  return {
    url: new URL(input),
    method: init?.method ?? 'GET',
  };
};

global.fetch = jest.fn(
  async (input: FetchInput, init: FetchInit): Promise<Response> => {
    const { url, method } = getFetchInfo(input, init);

    if (url.hostname === 'localhost') {
      return originalFetch(input, init);
    }

    if (method === 'GET') {
      const html = await getHtmlPage(url);

      if (html) {
        return new Response(html, {
          status: 200,
          statusText: 'OK',
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Content-Length': html.length.toString(),
          },
        });
      }
    }

    throw new Error(`[fetch mock] No mock found for ${method} ${url}`);
  },
);
