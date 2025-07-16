# NimeFetch

NimeFetch is a scraper and downloader for anime episodes, exposing both a CLI process and a minimal HTTP API with a web interface for browsing and managing downloads.

## Supported Sites

Currently only one site is supported, but others may be added in the future:

- [AnimeFire](https://animefire.plus)

## Getting Started

### Requirements

- Node.js 22+
- Yarn (recommended)

## Installation Methods

### Manual

```bash
git clone git@github.com:GregoryEsberci/nime-fetch.git      # ssh
git clone https://github.com/GregoryEsberci/nime-fetch.git  # or HTTPS

cd nime-fetch
```

Install dependencies and build the production bundle:

```bash
yarn install
./scripts/build.sh
```

Start the server:

```bash
node dist/index.js
```

You can [configure environment variables](#environment-variables).

To update to a new version, rebuild the static files:

```bash
yarn build
```

### With Docker

```sh
docker run -d \
  --name nime-fetch \
  --restart unless-stopped \
  -v /path/to/downloads:/downloads \
  -v /path/to/database:/database \
  gregoryesberci/nime-fetch:latest
```

### With Docker Compose

```yaml
services:
  nime-fetch:
    image: gregoryesberci/nime-fetch:latest
    container_name: nime-fetch
    restart: unless-stopped
    volumes:
      - /path/to/downloads:/downloads
      - /path/to/database:/database
```

## Commands

### Development

```bash
yarn dev        # Start the dev server
yarn lint       # Run ESLint
yarn checktypes # Type check with TypeScript
```

### Database

Uses [drizzle-kit](https://orm.drizzle.team/docs/kit-overview).

```bash
yarn db:migrate
yarn db:studio
```

## Environment Variables

| Variable        | Default (Local)  | Default (Docker)          | Description                           |
| --------------- | ---------------- | ------------------------- | ------------------------------------- |
| `PORT`          | `3000`           | `3000`                    | Port where the API runs               |
| `BASE_PATH`     | *(empty string)* | *(empty string)*          | Base path prefix (e.g. `/nime-fetch`) |
| `DOWNLOAD_DIR`  | `downloads`      | `/downloads`              | Folder to store downloaded files      |
| `DATABASE_PATH` | `nime-fetch.db`  | `/database/nime-fetch.db` | Path to SQLite database file          |

## Web Interface

When running, the server exposes a web UI at the root path (e.g. `http://localhost:3000`).
It lists all animes and their episodes, along with download statuses.

## License

MIT
