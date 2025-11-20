#!/bin/sh
set -e

# Find the server.js file in standalone output (handles nested directories)
SERVER_PATH=$(find /app -name "server.js" -not -path "*/node_modules/*" | head -1)

if [ -z "$SERVER_PATH" ]; then
  echo "Error: server.js not found!"
  exit 1
fi

# Change to the directory containing server.js
SERVER_DIR=$(dirname "$SERVER_PATH")
cd "$SERVER_DIR"

echo "Starting server from: $SERVER_DIR"

# Start the Next.js server
exec node server.js

