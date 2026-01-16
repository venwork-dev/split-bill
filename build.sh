#!/bin/bash
set -e

echo "🔨 Building SplitBill for production..."

# Build frontend
echo "📦 Building frontend..."
cd frontend
bun install
bun run build
cd ..

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
bun install
cd ..

echo "✅ Build complete!"
