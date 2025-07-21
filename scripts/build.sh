#!/bin/bash
set -e

rm -rf dist
yarn swc src/**/* src/* -d dist --strip-leading-paths --copy-files
yarn tsx scripts/fix-imports.ts
