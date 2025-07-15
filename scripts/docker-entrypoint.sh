#!/bin/sh
set -e

yarn drizzle-kit migrate
node dist/index.js