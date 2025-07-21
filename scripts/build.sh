#!/bin/bash
set -e

yarn swc src/**/* -d dist --strip-leading-paths --copy-files
yarn tsx scripts/fix-imports.ts
