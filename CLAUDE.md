# SplitBill - Agent Guide

## Project Overview
Web app that parses AT&T phone bills (PDF) and splits charges by line with intelligent grouping. Users can create groups, manage lines, and view statistics.

## Repository Structure
```
split-bill/
├── frontend/     # React app - see frontend/CLAUDE.md
├── backend/      # Express API - see backend/CLAUDE.md
└── test-scripts/ # Parser verification
```

## Tech Stack
- **Runtime**: Bun (preferred) or Node.js
- **Frontend**: React 19 + TypeScript + Vite + TailwindCSS + Zustand
- **Backend**: Express + LlamaParse + OpenAI GPT-4o-mini

## Bun Commands (Use These!)
```bash
bun install           # Install dependencies
bun run dev          # Run development server
bun run build        # Production build
bun test             # Run tests
bun <file>           # Execute file directly
bunx <package>       # Run package (like npx)
```

## Project Commands
```bash
# Frontend (runs on http://localhost:5173)
cd frontend && bun run dev

# Backend (runs on http://localhost:3001)
cd backend && bun run dev

# Type checking
cd frontend && bun run type-check
```

## Key Architecture Points

### State Management
- **Zustand** for global state (groups)
- Store location: `frontend/src/stores/groupStore.ts`
- Persisted to localStorage with key: `splitbill-groups`

### API Communication
- Frontend → Backend: `http://localhost:3001/api/extract`
- Backend uses LlamaParse to extract text, OpenAI to structure data

### Grouping Feature
- Lines can be organized into custom groups
- Groups have: id, name, lineNumbers[], color
- Full CRUD operations available
- See `GROUPING_FEATURE.md` for details

## Important Files
- `frontend/src/stores/groupStore.ts` - State management
- `frontend/src/components/ResultsTable.tsx` - Line selection & group creation
- `frontend/src/components/GroupsView.tsx` - Group management UI
- `backend/server.js` - API server
- `backend/llamaparse_agent.js` - PDF parsing logic

## Development Notes
- ✅ Use Bun commands (not npm/node)
- ✅ Frontend uses Vite (not Bun.serve in this project)
- ✅ Backend uses Express (Node.js style API)
- ✅ Never commit `.env` files
- ✅ Types checked with TypeScript
- ✅ Bun automatically loads .env

## Common Tasks

**Add new UI component:**
1. Create in `frontend/src/components/`
2. Use existing shadcn/ui patterns
3. Import from `@/components/ui/`

**Modify groups logic:**
1. Update `frontend/src/stores/groupStore.ts`
2. No backend changes needed (all client-side)

**Change PDF parsing:**
1. Edit `backend/llamaparse_agent.js`
2. Test with `cd test-scripts && bun test`

**Update API endpoint:**
1. Edit `backend/server.js`
2. Update `frontend/src/utils/parsePDF.ts` if response format changes

## See Also
- `README.md` - Full project documentation
- `frontend/README.md` - Frontend details
- `backend/README.md` - Backend API docs
- `GROUPING_FEATURE.md` - Technical feature docs
- `USAGE_GUIDE.md` - User guide
