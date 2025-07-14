# NimeFetch

NimeFetch is a scraper and downloader for anime episodes, exposing both a CLI process and a minimal HTTP API with a web interface for browsing and managing downloads.

## Supported Sites

Currently only one site is supported, but others may be added in the future:

- [AnimeFire](https://animefire.plus)

## Getting Started

### Requirements

- Node.js 22+
- Yarn (recommended)

### Installation

```bash
yarn install
````

## Commands

### Development

```bash
yarn dev        # Start the dev server
yarn lint       # Run ESLint
yarn checktypes # Type check with TypeScript
```

### Build and Run

```bash
yarn build
yarn start
```

### Database

Uses [drizzle-kit](https://orm.drizzle.team/docs/kit-overview).

```bash
yarn db:generate
yarn db:migrate
yarn db:drop
yarn db:studio
```

## Environment Variables

| Variable       | Default       | Description                      |
| -------------- | ------------- | -------------------------------- |
| `API_PORT`     | `3000`        | Port where the API runs          |
| `DOWNLOAD_DIR` | `downloads/`  | Folder to store downloaded files |
| `NODE_ENV`     | `development` | Environment mode                 |

## Web Interface

When running, the server exposes a web UI at the root path (e.g. `http://localhost:3000`).
It lists all animes and their episodes, along with download statuses.

## Build Output

Compiled files are stored in the `dist/` directory.

## License

MIT
