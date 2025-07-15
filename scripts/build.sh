#!/bin/bash
set -e

yarn tsc
cp -r src/static dist/
yarn tsx scripts/fix-imports.ts
