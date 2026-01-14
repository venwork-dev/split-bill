# Frontend - Agent Guide

## Overview
React 19 + TypeScript + Vite frontend for SplitBill. Allows users to upload AT&T bills, view parsed lines, and create intelligent groups.

## Tech Stack
- **Framework**: React 19.2 with TypeScript 5.9
- **Build Tool**: Vite 7.3
- **Styling**: TailwindCSS 4.1
- **State**: Zustand 5.0 (global state) + React hooks (local state)
- **UI Library**: Radix UI + shadcn/ui components
- **Icons**: Lucide React
- **Runtime**: Bun (preferred) or Node.js

## Commands (Use Bun!)
```bash
bun install       # Install dependencies
bun run dev       # Start dev server (http://localhost:5173)
bun run build     # Production build
bun run preview   # Preview production build
bun run type-check # TypeScript validation
```

## Key Files & Directories

### State Management
- `src/stores/groupStore.ts` - Zustand store for groups (persisted to localStorage)

### Components
- `src/components/UploadZone.tsx` - PDF upload interface
- `src/components/ResultsTable.tsx` - All lines view with selection & group creation
- `src/components/GroupsView.tsx` - Group management with statistics
- `src/components/ui/` - Reusable shadcn/ui components

### Utils
- `src/utils/parsePDF.ts` - API communication for PDF parsing

### Types
- `src/types/bill.types.ts` - TypeScript interfaces (LineItem, ParsedBill, Group)

## Architecture

### Data Flow
```
User uploads PDF
    ↓
parsePDF() → Backend API
    ↓
Backend returns: { lines, total_amount }
    ↓
Display in ResultsTable (All Lines tab)
    ↓
User selects lines → Create Group
    ↓
Zustand store (persists to localStorage)
    ↓
GroupsView displays groups
```

### State Management
- **Global (Zustand)**: Groups data
  - Persisted to localStorage: `splitbill-groups`
  - Actions: createGroup, updateGroup, deleteGroup, etc.
- **Local (useState)**: Component-specific state (selection, dialogs, expanded groups)

### Styling Approach
- TailwindCSS utility classes
- No custom CSS files
- Design system: grays/blacks with accent colors
- Responsive: mobile-first approach

## Component Patterns

### UI Components (shadcn/ui)
Located in `src/components/ui/`:
- `button.tsx` - Variants: default, destructive, outline, ghost
- `card.tsx` - Container with header/content
- `checkbox.tsx` - For line selection
- `dialog.tsx` - Modals for create/delete confirmations
- `input.tsx` - Text input fields
- `table.tsx` - Unused (custom table in ResultsTable)

### Import Aliases
```typescript
import { Button } from '@/components/ui/button';
import { useGroupStore } from '@/stores/groupStore';
import type { ParsedBill } from '@/types/bill.types';
```

## Zustand Store API

```typescript
// Usage in components
const groups = useGroupStore((state) => state.groups);
const createGroup = useGroupStore((state) => state.createGroup);

// Available actions
createGroup(name, lineNumbers) // Returns Group
updateGroup(id, updates)
deleteGroup(id)
addLinesToGroup(groupId, lineNumbers)
removeLinesFromGroup(groupId, lineNumbers)
getGroupedLineNumbers() // Returns Set<string>
getGroupForLine(lineNumber) // Returns Group | undefined
```

## Development Guidelines

### Adding a New Component
1. Create in `src/components/` or `src/components/ui/`
2. Use TypeScript with proper interfaces
3. Follow existing patterns (props interface, formatCurrency, etc.)
4. Test with `bun run type-check`

### Modifying Groups Logic
1. Edit `src/stores/groupStore.ts`
2. Changes auto-persist to localStorage
3. All components auto-update (Zustand reactivity)

### Updating UI Styles
1. Use TailwindCSS classes
2. Match existing color scheme (grays/blacks, blue accents)
3. Maintain responsive design patterns

### API Changes
1. Update `src/utils/parsePDF.ts` if backend response changes
2. Update `src/types/bill.types.ts` if data structure changes

## Important Notes
- **Bun preferred**: Use `bun` commands, not `npm`
- **No backend code here**: Backend is in `../backend/`
- **localStorage key**: `splitbill-groups` (don't change)
- **API endpoint**: Hardcoded to `http://localhost:3001/api/extract`
- **Type safety**: All files use TypeScript strict mode
- **No emojis**: Unless user explicitly requests them

## Common Tasks

### Add new group action
1. Add method to `groupStore.ts`
2. Use in components via `useGroupStore`

### Create new UI component
1. Follow shadcn/ui patterns in `components/ui/`
2. Export from component file
3. Import with `@/components/ui/` alias

### Update line display
1. Edit `ResultsTable.tsx` or `GroupsView.tsx`
2. Both components receive `ParsedBill` as prop

### Change color scheme
1. Update group colors in `groupStore.ts` (`GROUP_COLORS`)
2. Update TailwindCSS classes in components

## Testing
- **Type checking**: `bun run type-check`
- **Dev server**: `bun run dev` (check console for errors)
- **Build**: `bun run build` (catches production issues)

## Troubleshooting

**"Module not found"**
- Run `bun install`
- Check import aliases (`@/` should resolve to `src/`)

**Groups not persisting**
- Check localStorage in browser DevTools
- Key: `splitbill-groups`
- Clear and recreate if corrupted

**Type errors**
- Run `bun run type-check`
- Fix imports and type definitions
- Ensure all props have interfaces

## See Also
- `../README.md` - Project overview
- `../GROUPING_FEATURE.md` - Technical grouping docs
- `../USAGE_GUIDE.md` - User guide
