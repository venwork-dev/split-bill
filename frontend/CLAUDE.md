# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**SplitBill** is a web app that automates splitting AT&T phone bills among multiple line users. Users upload AT&T PDF bills, the app parses them, calculates what each person owes, and generates messages to send.

**Current Status:** Phase 1 - Basic React + Vite + TypeScript + Tailwind CSS setup complete. Core functionality (upload, parse, results display) not yet implemented.

## Commands

### Development
```bash
pnpm dev          # Start dev server
pnpm build        # Type check with tsc, then build for production
pnpm preview      # Preview production build locally
```

### Package Manager
This project uses **pnpm** (version 10.28.0). Always use `pnpm` instead of npm or yarn.

## Architecture

### Tech Stack
- **Frontend:** React 19 + Vite 7 + TypeScript + Tailwind CSS 4
- **PDF Processing:** Client-side only (browser-based), planning to use `pdf-parse` or `pdfjs-dist`
- **Deployment Target:** Vercel or Netlify

### Planned Directory Structure
```
src/
├── components/
│   ├── UploadZone.tsx        # Drag-drop PDF upload UI
│   ├── BillParser.tsx        # Parsing logic component wrapper
│   └── ResultsTable.tsx      # Display parsed results in table
├── utils/
│   └── parsePDF.ts           # PDF parsing functions for AT&T bills
├── types/
│   └── bill.types.ts         # TypeScript interfaces for bill data
├── App.tsx                   # Main app component
└── main.tsx                  # Entry point
```

### Key Design Patterns
- **Client-side processing:** All PDF parsing happens in the browser (no backend in Phase 1)
- **TypeScript strict mode:** Enabled for type safety in parsing logic
- **Component isolation:** Upload, parsing, and results display are separate components

## Development Guidelines

### Error-Free Development Protocol
**CRITICAL:** Before moving to the next component or file, ensure the current component is completely error-free.

**Process:**
1. Write the component/file
2. Run `pnpm dev` or check for TypeScript errors
3. Fix ALL errors (type errors, import errors, syntax errors)
4. Verify the component compiles successfully
5. Only then move to the next component

**Why this matters:**
- Prevents cascading errors that compound as you build
- Easier to debug when you know previous components work
- Maintains clean commit history
- Avoids technical debt accumulation

**What counts as "error-free":**
- No TypeScript type errors
- No import/module resolution errors
- No syntax errors
- Component compiles and renders (even if functionality isn't complete)
- All dependencies are properly installed

**When to check:**
- After creating each new component
- After creating utility files
- After creating type definitions
- Before wiring components together in parent components

## Phase 1 Requirements

Current phase focuses on core functionality:
1. PDF upload interface (drag-drop or click to upload)
2. Parse AT&T bill PDFs to extract:
   - Line numbers and individual charges
   - Per-line costs
   - Total bill amount
3. Display parsed data in a clean table format

### What's NOT in Phase 1
- User accounts/authentication
- Saving bill history
- Automated message sending
- Multiple carrier support
- Payment tracking

## Design Philosophy

**Style:** Clean, professional, minimal - "internal tool" aesthetic
**Visual Direction:** Blacks, grays, one accent color. Clear typography, good spacing, focus on functionality
**Avoid:** Gradients, excessive animations, flashy startup-style designs

## TypeScript Configuration

- Strict mode enabled
- `noUnusedLocals` and `noUnusedParameters` enforced
- Target: ES2020 with DOM libraries
- JSX: react-jsx (React 17+ transform)

## Development Phases & Roadmap

### Phase 1: Core Functionality - Upload & Parse (Current)
**Status:** Setup complete, implementation pending

**Goals:**
- Create PDF upload interface with drag-drop
- Implement AT&T bill PDF parsing (extract line numbers, charges, totals)
- Display results in clean table format
- Validate with at least one AT&T bill format

**Implementation Steps:**
1. Install PDF parsing library (`pdf-parse` or `pdfjs-dist`)
2. Create `UploadZone.tsx` component with drag-drop functionality
3. Create `types/bill.types.ts` with TypeScript interfaces:
   - `LineItem` (number, charges, fees)
   - `BillData` (total, lines, taxes, fees)
   - `ParsedBill` (complete bill structure)
4. Implement `utils/parsePDF.ts`:
   - Extract text from PDF
   - Parse AT&T-specific format patterns
   - Calculate per-line costs
   - Handle edge cases (shared charges, taxes, fees)
5. Create `ResultsTable.tsx` to display parsed data
6. Wire components together in `App.tsx`
7. Test with sample AT&T PDF bills

**Success Criteria:**
- Upload PDF ✓
- Extract line numbers and charges ✓
- Calculate split amounts ✓
- Display in clean UI ✓

---

### Phase 2: Message Generation & Customization
**Status:** Not started

**Goals:**
- Generate copy-paste messages for each line user
- Allow customization of message templates
- Support multiple message formats (SMS, email, Venmo request text)

**Implementation Steps:**
1. Create `components/MessageGenerator.tsx`
2. Design message templates:
   - SMS format: "Hi {name}, your share for this month is ${amount}. Line {lineNumber}."
   - Venmo format: "{month} phone bill - Line {lineNumber}"
   - Email format with more details
3. Add template editor UI
4. Save user preferences to localStorage
5. Add copy-to-clipboard functionality for each message

**Technical Considerations:**
- Message templates should support variables: {name}, {amount}, {lineNumber}, {month}, {year}
- Need state management for template customization (Context API or Zustand)

---

### Phase 3: Contact & Line Management
**Status:** Not started

**Goals:**
- Save line number to contact name mappings
- Persist contact data across sessions
- Edit/update contact information

**Implementation Steps:**
1. Create `types/contact.types.ts`
2. Implement `utils/storage.ts` for localStorage operations
3. Create `components/ContactManager.tsx`:
   - Form to map line numbers to names
   - Display saved contacts
   - Edit/delete functionality
4. Integrate contact names into message generation
5. Add import/export functionality for contact data (JSON)

**Data Structure:**
```typescript
interface Contact {
  id: string
  name: string
  lineNumber: string
  email?: string
  phone?: string
  venmoHandle?: string
}
```

---

### Phase 4: Payment Tracking (Optional)
**Status:** Not started

**Goals:**
- Track who has paid for each billing period
- Mark payments as received
- View payment history

**Implementation Steps:**
1. Extend bill data model to include payment status
2. Create `components/PaymentTracker.tsx`
3. Add payment status indicators (paid/pending)
4. Implement payment history view
5. Export payment reports

**Considerations:**
- This requires data persistence beyond localStorage (consider IndexedDB or backend)
- Privacy: ensure sensitive payment data is handled appropriately

---

### Phase 5: SMS Automation via Twilio (Advanced)
**Status:** Not started, requires backend

**Goals:**
- Send SMS messages automatically to line users
- Integrate Twilio API for messaging

**Prerequisites:**
- Backend API (Node.js/Express or serverless functions)
- Twilio account and phone number
- Environment variable management

**Implementation Steps:**
1. Set up backend API:
   - Create `/api/send-message` endpoint
   - Integrate Twilio SDK
   - Handle authentication/authorization
2. Update frontend to call backend API
3. Add SMS sending UI with confirmation
4. Implement rate limiting and error handling
5. Add message delivery status tracking

**Security Considerations:**
- API key management (never expose Twilio credentials in frontend)
- Input validation and sanitization
- Rate limiting to prevent abuse
- User consent for automated messaging

---

### Phase 6: Multi-Carrier Support (Future)
**Status:** Not planned yet

**Goals:**
- Support Verizon, T-Mobile, and other carriers
- Abstract parsing logic to handle different bill formats

**Considerations:**
- Each carrier has different PDF formats
- May need different parsing strategies per carrier
- Could use AI/LLM for more flexible parsing

---

## Immediate Next Steps

**To continue from current state:**

1. **Install PDF parsing library**
   ```bash
   pnpm add pdf-parse
   # OR
   pnpm add pdfjs-dist
   ```

2. **Create type definitions** (`src/types/bill.types.ts`)

3. **Build UploadZone component** with drag-drop file handling

4. **Implement PDF parsing utility** (`src/utils/parsePDF.ts`)

5. **Create ResultsTable component** to display parsed bill data

6. **Test with real AT&T PDF bills** and iterate on parsing logic

---

## Technical Debt & Considerations

- **PDF Parsing Reliability:** AT&T may change bill formats; parsing logic may need updates
- **Error Handling:** Need robust error handling for malformed PDFs or unexpected formats
- **Performance:** Large PDF files may cause browser performance issues
- **Mobile Support:** Ensure responsive design works on mobile devices (though desktop is primary target)
- **Accessibility:** Add ARIA labels, keyboard navigation, screen reader support

---

## Testing Strategy

**Phase 1 Testing:**
- Unit tests for parsing functions (with sample bill data)
- Integration tests for upload → parse → display flow
- Manual testing with various AT&T bill formats
- Edge case testing (multi-page bills, unusual line configurations)

**Future Testing:**
- E2E tests with Playwright or Cypress
- Visual regression testing for UI components
- Load testing for PDF processing performance

---
