#!/bin/sh
set -eu

mkdir -p /app/content
cp -an /app/content-seed/. /app/content/ 2>/dev/null || true
mkdir -p /app/content/data /app/content/images /app/content/files /app/content/logs

exec node /app/current/index.js
