# SplitBill

> Parse your AT&T phone bill and split charges by line — no spreadsheets, no manual math.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-1.3-000000?logo=bun&logoColor=white)](https://bun.sh/)

## Live App

**[https://split-bill-vmet8g.fly.dev](https://split-bill-vmet8g.fly.dev)** — upload your AT&T bill and get results in seconds

**[/demo](https://split-bill-vmet8g.fly.dev/demo)** — try it with sample data, no bill required

## What it does

Upload your AT&T wireless bill PDF and the app:

1. Extracts every line with the account holder's name and their monthly charge
2. Lets you organize lines into named groups (e.g. "Family", "Work")
3. Shows per-group totals so you know exactly who owes what
4. Lets you export a clean PDF summary to share

## Privacy

Your PDF is processed on the server and **immediately deleted** after parsing. No bill data is ever stored.

## Features

- **No AI / no API keys** — parsing uses regex against AT&T's consistent bill format, so it's fast and free to run
- **Groups** — create, rename, and delete groups; lines remember which group they belong to across page refreshes (stored in `localStorage`)
- **Export PDF** — browser print dialog gives a clean, print-optimized layout with interactive elements hidden
- **Demo mode** — shareable `/demo` URL with sample data for anyone who wants to try without uploading a real bill

## Supported bills

AT&T wireless bills (PDF). T-Mobile and Verizon are not supported yet.

## Tech stack

| Layer | Stack |
|-------|-------|
| Frontend | React 19, TypeScript, Vite, TailwindCSS, Zustand |
| Backend | Bun, Express, pdf-parse |
| Deploy | Fly.io (single service — backend serves the built frontend) |

## Running locally

```bash
bun version 1.3.6

# Install dependencies
bun install

# Start both frontend (localhost:5173) and backend (localhost:3001)
bun run dev
```

No environment variables required for local development.

## Disclaimer

Not affiliated with AT&T. Always verify parsed amounts against your actual bill.
