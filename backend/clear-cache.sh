#!/bin/bash

echo "================================"
echo "Clearing ts-node cache..."
echo "================================"
echo ""

if [ -d "node_modules/.cache" ]; then
    rm -rf node_modules/.cache
    echo "✅ Cache cleared successfully!"
else
    echo "⚠️  Cache folder not found. Nothing to clear."
fi

echo ""
echo "================================"
echo "Done! Now run: npm run dev"
echo "================================"
